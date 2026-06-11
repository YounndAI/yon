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

import { parse, validate, type YonDocument } from '@younndai/yon-parser';
import { loadVector } from '../core/vectors.js';
import { localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

function testExpansionRatio(): TestResult {
  const source = loadVector('fidelity', 'roundtrip.yon');
  const sourceSize = Buffer.byteLength(source, 'utf-8');

  let doc: YonDocument;
  try {
    doc = parse(source);
  } catch (e) {
    return {
      id: 'ir-expansion',
      name: 'AST Expansion Ratio',
      passed: false,
      metric: { name: 'expansion_ratio', value: 0, unit: 'x' },
      detail: `Parse failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  // Measure AST size (serialized)
  // We use JSON.stringify to approximate the memory footprint of the AST object structure
  const irJson = JSON.stringify(doc);
  const irSize = Buffer.byteLength(irJson, 'utf-8');
  const ratio = irSize / sourceSize;

  return {
    id: 'ir-expansion',
    name: 'AST Expansion Ratio',
    passed: true, // measurement — expansion ratio is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'expansion_ratio',
      value: Math.round(ratio * 100) / 100,
      unit: 'x',
    },
    detail: `Source: ${sourceSize}B. AST (JSON): ${irSize}B. Ratio: ${ratio.toFixed(2)}x.`,
  };
}

function testValidationSpeed(): TestResult {
  const source = loadVector('fidelity', 'roundtrip.yon');
  const doc = parse(source);

  const start = performance.now();
  const iterations = 1000;
  for (let i = 0; i < iterations; i++) {
    validate(doc);
  }
  const duration = performance.now() - start;
  const opsPerSec = Math.round((iterations / duration) * 1000);

  return {
    id: 'validation-speed',
    name: 'Validation Throughput',
    passed: true, // measurement — validation throughput is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'validations_per_second',
      value: opsPerSec,
      unit: 'ops/s',
    },
    detail: `Validated 1000 times in ${duration.toFixed(2)}ms. Throughput: ${opsPerSec.toLocaleString()} ops/s.`,
  };
}

export async function runIREfficiency(): Promise<BenchmarkResult> {
  const start = performance.now();
  
  const tests: TestResult[] = [
    testExpansionRatio(),
    testValidationSpeed(),
  ];

  const durationMs = performance.now() - start;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'ir-efficiency',
    suiteName: 'IR Efficiency',
    pillar: 'cognitive-economy',
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
