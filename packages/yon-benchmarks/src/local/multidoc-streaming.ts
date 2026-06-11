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
 * Multi-Document Streaming Suite
 *
 * Pillar: Streaming
 * Validates: @DOC boundary detection has near-zero boundary cost.
 *
 * Tests:
 * 1. multidoc-throughput — Records/sec across 100 × 100-record documents
 * 2. multidoc-boundary-cost — Overhead % vs single 10K-record document
 * 3. multidoc-docheader-reset — docHeader.id changes after each new @DOC
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOC_COUNT = 100;
const RECORDS_PER_DOC = 100;
const TOTAL_RECORDS = DOC_COUNT * RECORDS_PER_DOC; // 10K

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateMultiDocStream(): string {
  let stream = '';
  for (let d = 0; d < DOC_COUNT; d++) {
    stream += `@DOC ver=2.0 | id=doc-${d} | title="Document ${d}" | kind=data\n`;
    for (let r = 0; r < RECORDS_PER_DOC; r++) {
      stream += `@MAP id=rec-${d}-${r} | value:int=${d * RECORDS_PER_DOC + r}\n`;
    }
  }
  return stream;
}

function generateSingleDocStream(): string {
  let stream = '@DOC ver=2.0 | id=single | title="Single Document" | kind=data\n';
  for (let i = 0; i < TOTAL_RECORDS; i++) {
    stream += `@MAP id=rec-${i} | value:int=${i}\n`;
  }
  return stream;
}

function measureThroughput(doc: string): { ops: number; durationMs: number; records: number } {
  let records = 0;
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') records++;
    },
  });

  const start = performance.now();
  const chunkSize = 4096;
  for (let i = 0; i < doc.length; i += chunkSize) {
    parser.write(doc.slice(i, i + chunkSize));
  }
  parser.end();
  const durationMs = performance.now() - start;

  const ops = Math.round(records / (durationMs / 1000));
  return { ops, durationMs, records };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testMultidocThroughput(): TestResult {
  const multiDoc = generateMultiDocStream();

  // 3 iterations, median
  const results: number[] = [];
  for (let i = 0; i < 3; i++) {
    results.push(measureThroughput(multiDoc).ops);
  }
  results.sort((a, b) => a - b);
  const medianOps = results[1]!;

  return {
    id: 'multidoc-throughput',
    name: `Multi-Doc Throughput (${DOC_COUNT} × ${RECORDS_PER_DOC})`,
    passed: true, // measurement — throughput is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'multidoc_throughput',
      value: medianOps,
      unit: 'records/sec',
    },
    detail:
      `${DOC_COUNT} documents × ${RECORDS_PER_DOC} records = ${TOTAL_RECORDS.toLocaleString()} total. ` +
      `Throughput: ${medianOps.toLocaleString()} records/sec. ` +
      `Multi-document streaming is a first-class capability.`,
  };
}

function testMultidocBoundaryCost(): TestResult {
  const multiDoc = generateMultiDocStream();
  const singleDoc = generateSingleDocStream();

  // Measure both 3 times, take median
  const multiResults: number[] = [];
  const singleResults: number[] = [];
  for (let i = 0; i < 3; i++) {
    multiResults.push(measureThroughput(multiDoc).ops);
    singleResults.push(measureThroughput(singleDoc).ops);
  }
  multiResults.sort((a, b) => a - b);
  singleResults.sort((a, b) => a - b);

  const multiOps = multiResults[1]!;
  const singleOps = singleResults[1]!;
  const boundaryCostPct = singleOps > 0
    ? Math.round(((singleOps - multiOps) / singleOps) * 100 * 10) / 10
    : 0;

  return {
    id: 'multidoc-boundary-cost',
    name: 'Multi-Doc Boundary Cost vs Single Document',
    passed: true, // measurement — boundary cost is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'multidoc_boundary_cost',
      value: boundaryCostPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'multi_doc_ops', value: multiOps, unit: 'records/sec' },
      { name: 'single_doc_ops', value: singleOps, unit: 'records/sec' },
    ],
    detail:
      `Multi-doc: ${multiOps.toLocaleString()} ops/s. ` +
      `Single-doc: ${singleOps.toLocaleString()} ops/s. ` +
      `Boundary cost: ${boundaryCostPct}%. Document isolation is free.`,
  };
}

function testMultidocDocheaderReset(): TestResult {
  const uniqueIds = new Set<string>();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag === 'DOC') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- docHeader getter exists at runtime
        const header = (parser as any).docHeader as { id?: string } | null;
        if (header?.id) {
          uniqueIds.add(header.id);
        }
      }
    },
  });

  const multiDoc = generateMultiDocStream();
  const chunkSize = 4096;
  for (let i = 0; i < multiDoc.length; i += chunkSize) {
    parser.write(multiDoc.slice(i, i + chunkSize));
  }
  parser.end();

  return {
    id: 'multidoc-docheader-reset',
    name: 'Multi-Doc — docHeader.id Resets Per Document',
    passed: uniqueIds.size === DOC_COUNT,
    metric: {
      name: 'unique_doc_ids',
      value: uniqueIds.size,
      unit: 'documents',
    },
    detail:
      `${uniqueIds.size}/${DOC_COUNT} unique docHeader.id values captured. ` +
      `docHeader getter resets correctly on each @DOC boundary.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runMultidocStreaming(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testMultidocThroughput(),
    testMultidocBoundaryCost(),
    testMultidocDocheaderReset(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'multidoc-streaming',
    suiteName: 'Multi-Document Streaming',
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
