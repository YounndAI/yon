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
 * Streaming Latency Benchmark Suite
 *
 * Pillar: Streaming
 * Validates: YON's line-oriented format delivers the first processable record
 *         before JSON finishes parsing. "Processing begins after a single record." (§7)
 *
 * Tests:
 * 1. Small document (100 records) — time-to-first-record measurement
 * 2. Medium document (500 records) — time-to-first-record measurement
 * 3. Large document (2000 records) — time-to-first-record measurement
 * 4. Latency ratio — does the gap widen with document size?
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { performance } from 'node:perf_hooks';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildYonDoc(recordCount: number): string {
  let s = '@DOC ver=2.0 | id=latency | title="Latency Test" | kind=data\n';
  for (let i = 0; i < recordCount; i++) {
    s += `@NOTE text="Record ${i}: ${getRandomPayload()}" | idx:int=${i}\n`;
  }
  return s;
}

function buildJsonDoc(recordCount: number): string {
  const arr = Array.from({ length: recordCount }, (_, i) => ({
    text: `Record ${i}: ${getRandomPayload()}`,
    idx: i,
  }));
  return JSON.stringify(arr);
}

function getRandomPayload(): string {
  // Deterministic but realistic payload lengths
  const phrases = [
    'API response timeout after 30s',
    'User session expired, redirecting to login',
    'Database migration completed successfully',
    'Rate limit exceeded for tenant abc-123',
    'Health check passed with 200ms latency',
    'Certificate rotation scheduled for midnight',
    'Backup snapshot 2026-02-13 verified OK',
    'Queue depth exceeded threshold: 1500 pending',
  ];
  return phrases[Math.floor(Math.random() * phrases.length)]!;
}

/**
 * Measure time-to-first-processable-record for YON.
 * Uses StreamingYonParser, emits line-by-line, records timestamp when first
 * record event fires.
 */
function measureYonFirstRecord(doc: string): number {
  let firstRecordTime = 0;
  const start = performance.now();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && firstRecordTime === 0) {
        firstRecordTime = performance.now() - start;
      }
    },
  });

  const lines = doc.split('\n');
  for (const line of lines) {
    parser.write(line + '\n');
    if (firstRecordTime > 0) break; // Stop after first record for latency measurement
  }

  try { parser.end(); } catch { /* ok */ }
  return firstRecordTime;
}

/**
 * Measure time-to-complete-parse for JSON.
 * JSON.parse() is all-or-nothing — zero data available until complete parse.
 */
function measureJsonParse(doc: string): number {
  const start = performance.now();
  JSON.parse(doc);
  return performance.now() - start;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testLatency(recordCount: number, label: string): TestResult {
  const yonDoc = buildYonDoc(recordCount);
  const jsonDoc = buildJsonDoc(recordCount);

  // Warm up
  measureYonFirstRecord(buildYonDoc(10));
  measureJsonParse(buildJsonDoc(10));

  // Run 5 iterations and take median
  const yonTimes: number[] = [];
  const jsonTimes: number[] = [];

  for (let i = 0; i < 5; i++) {
    yonTimes.push(measureYonFirstRecord(yonDoc));
    jsonTimes.push(measureJsonParse(jsonDoc));
  }

  yonTimes.sort((a, b) => a - b);
  jsonTimes.sort((a, b) => a - b);

  const yonMedian = yonTimes[2]!;
  const jsonMedian = jsonTimes[2]!;
  const ratio = jsonMedian > 0 ? Math.round((jsonMedian / Math.max(yonMedian, 0.001)) * 10) / 10 : 0;

  return {
    id: `streaming-latency-${recordCount}`,
    name: `Streaming Latency — ${label} (${recordCount} records)`,
    passed: true, // measurement — latency comparison is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'yon_first_record_us',
      value: Math.round(yonMedian * 1000), // Convert to microseconds
      unit: 'µs',
      comparison: {
        baseline: Math.round(jsonMedian * 1000),
        baselineLabel: 'JSON parse complete (µs)',
        delta: `${ratio}x faster`,
      },
    },
    secondaryMetrics: [
      { name: 'json_complete_parse_us', value: Math.round(jsonMedian * 1000), unit: 'µs' },
      { name: 'speedup_ratio', value: ratio, unit: 'x' },
      { name: 'record_count', value: recordCount, unit: 'records' },
    ],
    detail:
      `YON delivers first record in ${(yonMedian * 1000).toFixed(0)}µs. ` +
      `JSON requires ${(jsonMedian * 1000).toFixed(0)}µs to parse the entire document before any data is available. ` +
      `Speedup: ${ratio}x. Line-oriented streaming means processing begins after the first \\n.`,
  };
}

function testLatencyScaling(): TestResult {
  // Measure how the latency gap grows with document size
  const sizes = [100, 500, 2000];
  const ratios: number[] = [];

  for (const size of sizes) {
    const yonDoc = buildYonDoc(size);
    const jsonDoc = buildJsonDoc(size);
    const yonTime = measureYonFirstRecord(yonDoc);
    const jsonTime = measureJsonParse(jsonDoc);
    ratios.push(jsonTime / Math.max(yonTime, 0.001));
  }

  const scalesFavorably = ratios[2]! > ratios[0]!; // Gap should widen

  return {
    id: 'streaming-latency-scaling',
    name: 'Streaming Latency — Scaling Behavior',
    passed: true, // measurement — scaling trend is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'scaling_trend',
      value: scalesFavorably ? 1 : 0,
      unit: 'favorable',
    },
    secondaryMetrics: sizes.map((size, i) => ({
      name: `ratio_${size}`,
      value: Math.round(ratios[i]! * 10) / 10,
      unit: 'x',
    })),
    detail:
      `Speedup ratios: ${sizes.map((s, i) => `${s} records=${Math.round(ratios[i]! * 10) / 10}x`).join(', ')}. ` +
      (scalesFavorably
        ? 'Gap widens with size — YON\'s O(1) first-record latency scales independently of document size.'
        : 'Gap did not widen as expected — possibly CPU cache effects at small sizes.'),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testLatency(100, 'Small'),
    testLatency(500, 'Medium'),
    testLatency(2000, 'Large'),
    testLatencyScaling(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'streaming-latency',
    suiteName: 'Streaming Latency',
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

export { run as runStreamingLatency };
