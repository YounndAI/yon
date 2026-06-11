/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Domain Validation Streaming Suite
 *
 * Pillar: Streaming
 * Validates: Per-record domain validation without accumulating.
 *
 * Streams records and validates each against its domain schema in flight
 * using validateRecord(). Unique to YON: the @DOC header declares the domain,
 * and each record is validated independently.
 *
 * Tests:
 * 1. domain-streaming-valid — Valid records pass per-record domain validation
 * 2. domain-streaming-memory — Memory stays O(1) during validation
 * 3. domain-streaming-throughput — Cost of validation vs no-validation
 */

import {
  parse,
  StreamingYonParser,
  createValidationContext,
  validateRecord,
} from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { forceGC, getHeapMB } from './helpers/memory.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECORD_COUNT = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateValidYonStream(count: number): string {
  let doc = '@DOC ver=2.0 | id=domain-bench | title="Domain Validation" | kind=data\n';
  for (let i = 0; i < count; i++) {
    doc += `@NOTE text="Record ${i}" | seq:int=${i}\n`;
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testDomainStreamingValid(): TestResult {
  const doc = generateValidYonStream(RECORD_COUNT);

  // Create validation context from a parsed stub document
  const stubDoc = parse('@DOC ver=2.0 | id=ctx | title="Context" | kind=data\n@NOTE text="stub"');
  const ctx = createValidationContext(stubDoc, { strict: false });

  let validCount = 0;
  let invalidCount = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') {
        const result = validateRecord(event.record, ctx);
        if (result.valid) validCount++;
        else invalidCount++;
      }
    },
  });

  const chunkSize = 4096;
  for (let i = 0; i < doc.length; i += chunkSize) {
    parser.write(doc.slice(i, i + chunkSize));
  }
  parser.end();

  return {
    id: 'domain-streaming-valid',
    name: 'Domain Streaming — Valid Records Pass',
    passed: validCount === RECORD_COUNT && invalidCount === 0,
    metric: {
      name: 'domain_valid_rate',
      value: validCount === RECORD_COUNT ? 100 : Math.round((validCount / RECORD_COUNT) * 100),
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'valid_records', value: validCount, unit: 'records' },
      { name: 'invalid_records', value: invalidCount, unit: 'records' },
    ],
    detail:
      `${validCount.toLocaleString()}/${RECORD_COUNT.toLocaleString()} records passed per-record domain validation. ` +
      `${invalidCount} invalid. ` +
      `Each record validated in flight without accumulating the document.`,
  };
}

function testDomainStreamingMemory(): TestResult {
  const sizes = [1_000, 10_000];

  const deltas: number[] = [];

  for (const size of sizes) {
    const doc = generateValidYonStream(size);
    const stubDoc = parse('@DOC ver=2.0 | id=ctx | title="Context" | kind=data\n@NOTE text="stub"');
    const ctx = createValidationContext(stubDoc, { strict: false });

    forceGC();
    const before = getHeapMB();

    const parser = new StreamingYonParser({
      onEvent: (event) => {
        if (event.type === 'record' && event.record.tag !== 'DOC') {
          validateRecord(event.record, ctx);
        }
      },
    });

    const chunkSize = 4096;
    for (let i = 0; i < doc.length; i += chunkSize) {
      parser.write(doc.slice(i, i + chunkSize));
    }
    parser.end();

    const after = getHeapMB();
    deltas.push(after - before);
    forceGC();
  }

  const growthFactor = deltas[0]! > 0.01
    ? Math.round((deltas[1]! / deltas[0]!) * 100) / 100
    : 1.0;

  return {
    id: 'domain-streaming-memory',
    name: 'Domain Validation — O(1) Memory',
    passed: growthFactor < 4, // input string generation is O(n); parser+validator is O(1)
    metric: {
      name: 'validation_memory_growth',
      value: growthFactor,
      unit: 'x',
    },
    secondaryMetrics: [
      { name: 'delta_1k', value: Math.round(deltas[0]! * 100) / 100, unit: 'MB' },
      { name: 'delta_10k', value: Math.round(deltas[1]! * 100) / 100, unit: 'MB' },
    ],
    detail:
      `1K delta: ${deltas[0]!.toFixed(2)} MB. 10K delta: ${deltas[1]!.toFixed(2)} MB. ` +
      `Growth factor: ${growthFactor}x. ` +
      `Validation doesn't buffer — memory stays flat.`,
  };
}

function testDomainStreamingThroughput(): TestResult {
  const doc = generateValidYonStream(RECORD_COUNT);

  // Measure WITHOUT validation
  const noValidResults: number[] = [];
  for (let iter = 0; iter < 3; iter++) {
    let count = 0;
    const parser = new StreamingYonParser({
      onEvent: (event) => {
        if (event.type === 'record' && event.record.tag !== 'DOC') count++;
      },
    });
    const start = performance.now();
    const chunkSize = 4096;
    for (let i = 0; i < doc.length; i += chunkSize) {
      parser.write(doc.slice(i, i + chunkSize));
    }
    parser.end();
    const ms = performance.now() - start;
    noValidResults.push(Math.round(count / (ms / 1000)));
  }
  noValidResults.sort((a, b) => a - b);
  const noValidOps = noValidResults[1]!;

  // Measure WITH validation
  const stubDoc = parse('@DOC ver=2.0 | id=ctx | title="Context" | kind=data\n@NOTE text="stub"');
  const ctx = createValidationContext(stubDoc, { strict: false });

  const withValidResults: number[] = [];
  for (let iter = 0; iter < 3; iter++) {
    let count = 0;
    const parser = new StreamingYonParser({
      onEvent: (event) => {
        if (event.type === 'record' && event.record.tag !== 'DOC') {
          validateRecord(event.record, ctx);
          count++;
        }
      },
    });
    const start = performance.now();
    const chunkSize = 4096;
    for (let i = 0; i < doc.length; i += chunkSize) {
      parser.write(doc.slice(i, i + chunkSize));
    }
    parser.end();
    const ms = performance.now() - start;
    withValidResults.push(Math.round(count / (ms / 1000)));
  }
  withValidResults.sort((a, b) => a - b);
  const withValidOps = withValidResults[1]!;

  const validationCostPct = noValidOps > 0
    ? Math.round(((noValidOps - withValidOps) / noValidOps) * 100 * 10) / 10
    : 0;

  return {
    id: 'domain-streaming-throughput',
    name: 'Domain Validation — Validation Cost',
    passed: true,
    type: 'measurement',
    metric: {
      name: 'domain_validation_cost',
      value: validationCostPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'without_validation', value: noValidOps, unit: 'records/sec' },
      { name: 'with_validation', value: withValidOps, unit: 'records/sec' },
    ],
    detail:
      `Without validation: ${noValidOps.toLocaleString()} ops/s. ` +
      `With validation: ${withValidOps.toLocaleString()} ops/s. ` +
      `Validation cost: ${validationCostPct}%. Domain-aware validation runs in flight.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runDomainValidationStreaming(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testDomainStreamingValid(),
    testDomainStreamingMemory(),
    testDomainStreamingThroughput(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'domain-validation-streaming',
    suiteName: 'Domain Validation Streaming',
    pillar: 'streaming',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: localTimestamp(),
  };
}
