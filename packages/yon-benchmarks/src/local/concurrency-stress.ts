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
 * Concurrency Stress Suite
 *
 * Pillar: Streaming
 * Validates: YON parser and converter are thread-safe (in Node context, async-safe)
 *         and handle high-concurrency workloads without cross-talk or race conditions.
 *
 * Tests:
 * 1. Concurrent Parsing: Run 50 parallel parse operations
 * 2. Incremental Update: Parse -> Modify 1 Record -> Format (measure latency)
 */

import { parse, format } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testConcurrentParsing(): Promise<TestResult> {
  const concurrency = 50;
  const recordsPerDoc = 100;
  const expectedLength = recordsPerDoc + 1; // +1 for @DOC record

  const docs = Array.from({ length: concurrency }, (_, i) => {
    let s = `@DOC ver=2.0 | id=doc-${i} | title="Concurrent Doc ${i}" | kind=doc\n`;
    for (let j = 0; j < recordsPerDoc; j++) {
      s += `@NOTE text="Record ${j} in thread ${i}"\n`;
    }
    return s;
  });

  const t = startTimer();
  
  // Launch all 50 parses simultaneously
  const results = await Promise.all(docs.map(async (src) => {
    // Small delay to ensure event loop mixing
    await new Promise(r => setTimeout(r, Math.random() * 5));
    return parse(src);
  }));
  
  const elapsed = t();
  
  // Verify no cross-talk: doc-N should have id=doc-N
  let failures = 0;
  let idFailures = 0;
  let lenFailures = 0;

  for (let i = 0; i < concurrency; i++) {
    const res = results[i];
    if (!res) {
      failures++;
      continue;
    }
    const id = res.id;
    if (id !== `doc-${i}`) {
      failures++;
      idFailures++;
    }
    if (res.records.length !== expectedLength) {
      failures++;
      lenFailures++;
    }
  }

  return {
    id: 'concurrent-parsing',
    name: 'Concurrent Parsing (50 streams)',
    passed: failures === 0,
    metric: {
      name: 'avg_latency',
      value: Math.round(elapsed / concurrency * 100) / 100,
      unit: 'ms/doc',
    },
    secondaryMetrics: [
      { name: 'total_time', value: Math.round(elapsed), unit: 'ms' },
      { name: 'concurrency', value: concurrency, unit: 'streams' },
    ],
    detail: `Parsed ${concurrency} docs in parallel. Failures: ${failures} (ID=${idFailures}, Len=${lenFailures}). Expected len=${expectedLength}.`,
  };
}

function testIncrementalUpdate(): TestResult {
  // Scenario: Large doc, modify 1 record, re-emit.
  // Compare to JSON parsing/stringifying cost.
  
  const size = 1000;
  let src = '@DOC ver=2.0 | id=inc | title="Incremental" | kind=doc\n';
  for (let i = 0; i < size; i++) {
    src += `@NOTE id=rec-${i} | text="Original content"\n`;
  }
  
  // YON Path: Parse -> Modify Object -> Format
  // Since YON parser produces a mutable AST (Document object with Records), 
  // we measure the cost of this roundtrip.
  
  const t = startTimer();
  
  const doc = parse(src);
  // Modify second record (first is @DOC)
  const target = doc.records[1];
  if (target) {
    target.fields.set('text', 'Updated content');
    // Important: Formatter prioritizes typedFields if present (Standard §17)
    // We must update typedFields to see the change in output.
    if (target.typedFields && target.typedFields.has('text')) {
      const tf = target.typedFields.get('text');
      if (tf) target.typedFields.set('text', { ...tf, value: 'Updated content' });
    }
  }
  
  // In a true line-oriented system we'd just splice the string, but let's test the library support.
  // The benchmarks are for the *format capabilities*, and YON format allows line splicing.
  // But here we test the parser/formatter library setup cost.
  
  const output = format(doc);
  const elapsed = t();
  
  // Check for the update string. YON formatter quotes strings with spaces.
  const passed = output.includes('"Updated content"');

  return {
    id: 'incremental-update',
    name: 'Read-Modify-Write Cycle',
    passed,
    metric: {
      name: 'process_time',
      value: Math.round(elapsed * 100) / 100,
      unit: 'ms',
    },
    detail: `Parsed ${size} records, modified 1 in memory, formatting entire doc. Cost: ${elapsed.toFixed(2)}ms.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    await testConcurrentParsing(),
    testIncrementalUpdate(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'concurrency-stress',
    suiteName: 'Concurrency & Updates',
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

export { run as runConcurrencyStress };
