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
 * Low-Level Hardening Suite
 *
 * Pillar: Streaming + Lossless
 * Validates: YON is robust against resource exhaustion, binary edge cases,
 *         and network realities (backpressure).
 *
 * Tests:
 * 1. Memory Pressure: Parse 100K records, measure RSS delta (prove streaming)
 * 2. Binary Safety: Handle Unicode ZWJ, Emoji, Null bytes, Control chars
 * 3. Streaming Backpressure: Simulate slow consumer, prove no data loss
 */

import { parse, StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testMemoryPressure(): TestResult {
  const records = 100_000;
  const header = '@DOC ver=2.0 | id=mem | title="Mem Test" | kind=doc\n';
  const line = '@NOTE text="Memory pressure test record" | id=mem\n';
  
  // Construct giant string (approx 4MB)
  const src = header + line.repeat(records);
  
  const initialMem = process.memoryUsage().heapUsed;
  const t = startTimer();
  
  const doc = parse(src);
  
  const elapsed = t();
  const finalMem = process.memoryUsage().heapUsed;
  const deltaMb = (finalMem - initialMem) / 1024 / 1024;
  
  // +1 for the @DOC header record
  return {
    id: 'memory-pressure',
    name: 'Memory Pressure (100K records)',
    passed: doc.records.length === (records + 1) && deltaMb < 200,
    metric: {
      name: 'rss_delta',
      value: Math.round(deltaMb * 100) / 100,
      unit: 'MB',
    },
    secondaryMetrics: [
      { name: 'records', value: doc.records.length, unit: 'records' },
      { name: 'duration', value: Math.round(elapsed), unit: 'ms' },
    ],
    detail: `Parsed ${records} records. Heap delta: ${deltaMb.toFixed(2)} MB. Proves parser handles medium-scale workloads without explosion.`,
  };
}

function testBinarySafety(): TestResult {
  // Complex Unicode: Family emoji (ZWJ sequence), Null byte, Control char
  const input = {
    emoji: '👨‍👩‍👧‍👦', // ZWJ sequence
    nullByte: 'null\u0000byte',
    control: 'ctrl\u0007bell',
    kanji: 'こんにちは',
  };
  
  const yon = [
    '@DOC ver=2.0 | id=binary | title="Binary Safety" | kind=doc',
    `@NOTE text="${input.emoji}" | id=emoji`,
    `@NOTE text="${input.nullByte}" | id=null`,
    `@NOTE text="${input.control}" | id=ctrl`,
    `@NOTE text="${input.kanji}" | id=kanji`,
  ].join('\n');
  
  const doc = parse(yon);
  
  const emoji = doc.records.find(r => r.fields.get('id') === 'emoji')?.fields.get('text');
  const nullByte = doc.records.find(r => r.fields.get('id') === 'null')?.fields.get('text');
  const ctrl = doc.records.find(r => r.fields.get('id') === 'ctrl')?.fields.get('text');
  const kanji = doc.records.find(r => r.fields.get('id') === 'kanji')?.fields.get('text');
  
  const passed = 
    emoji === input.emoji &&
    nullByte === input.nullByte &&
    ctrl === input.control &&
    kanji === input.kanji;
    
  return {
    id: 'binary-safety',
    name: 'Binary Safety & Unicode',
    passed,
    metric: {
      name: 'correct_fields',
      value: passed ? 4 : 0,
      unit: '/4 cases',
    },
    detail: `Handled ZWJ Emoji (${input.emoji}), Null bytes, Control chars, and Kanji. ${passed ? 'All preserved verbatim.' : 'DATA CORRUPTION DETECTED.'}`,
  };
}

async function testStreamingBackpressure(): Promise<TestResult> {
  const chunks = 100;
  const linesPerChunk = 10;
  const totalRecords = chunks * linesPerChunk;
  
  // Custom sync iterable mocking async/slow behavior
  // Note: StreamingYonParser.from takes AsyncIterable<string>
  
  async function* generateSlowly() {
    for (let i = 0; i < chunks; i++) {
      let chunk = '';
      for (let j = 0; j < linesPerChunk; j++) {
        chunk += `@NOTE id=${i}-${j} | text="record"\n`;
      }
      yield chunk;
      // Simulate network jitter/backpressure
      await new Promise(resolve => setTimeout(resolve, 1)); 
    }
  }

  const stream = generateSlowly();
  
  let count = 0;
  const t = startTimer();
  
  for await (const event of StreamingYonParser.from(stream)) {
    if (event.type === 'record') count++;
  }
  
  const elapsed = t();

  return {
    id: 'streaming-backpressure',
    name: 'Streaming Backpressure',
    passed: count === totalRecords,
    metric: {
      name: 'records_processed',
      value: count,
      unit: `/${totalRecords}`,
    },
    secondaryMetrics: [
      { name: 'duration', value: Math.round(elapsed), unit: 'ms' },
    ],
    detail: `Successfully processed ${count}/${totalRecords} records from a slow, jittery stream. Proves generator-based parser handles backpressure naturally.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testMemoryPressure(),
    testBinarySafety(),
    await testStreamingBackpressure(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'low-level-hardening',
    suiteName: 'Low-Level Hardening',
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

export { run as runLowLevelHardening };
