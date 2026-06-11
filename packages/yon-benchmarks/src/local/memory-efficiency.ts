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
 * Memory Efficiency Suite
 *
 * Pillar: Streaming
 * 4-way comparison:
 *   1. YON full-doc — batch parse(), full AST retained
 *   2. YON streaming — StreamingYonParser (default accumulate:false), O(1) memory
 *   3. JSON full-doc — JSON.parse(), result retained
 *   4. JSON streaming — line-by-line JSONL, per-record parse
 *
 * Tests:
 * 1. Streaming Memory — heap usage across 10K, 50K, 100K records
 * 2. Peak Memory — 100K comparison at peak
 */

import { parse, StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import {
  forceGC,
  getHeapMB,
  generateYonStream,
  type MemoryMeasurement,
} from './helpers/memory.js';

// ---------------------------------------------------------------------------
// Helpers (JSON-specific, kept local — due diligence suite)
// ---------------------------------------------------------------------------

function generateJsonArray(recordCount: number): string {
  const arr: Record<string, unknown>[] = [];
  for (let i = 0; i < recordCount; i++) {
    arr.push({ id: 'rec-' + i, name: 'Record ' + i, value: i, active: true });
  }
  return JSON.stringify(arr);
}

function measureYonStreaming(recordCount: number): MemoryMeasurement {
  const doc = generateYonStream(recordCount);

  forceGC();
  const before = getHeapMB();
  let peak = before;

  let recordsSeen = 0;
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record') recordsSeen++;
      // Sample peak every 1000 records
      if (recordsSeen % 1000 === 0) {
        const current = getHeapMB();
        if (current > peak) peak = current;
      }
    },
  });

  // Feed in chunks to simulate streaming
  const chunkSize = 4096;
  for (let i = 0; i < doc.length; i += chunkSize) {
    parser.write(doc.slice(i, i + chunkSize));
  }
  parser.end();

  const after = getHeapMB();
  if (after > peak) peak = after;

  return { before, after, peak, delta: peak - before };
}

function measureJsonParse(recordCount: number): MemoryMeasurement {
  const json = generateJsonArray(recordCount);

  forceGC();
  const before = getHeapMB();

  // JSON.parse — retain result to prevent V8 dead-code elimination
  const data = JSON.parse(json) as unknown[];
  // Anti-DCE: touch the result so V8 cannot optimize away the allocation
  if (data.length === -1) throw new Error('unreachable');

  const after = getHeapMB();

  return { before, after, peak: after, delta: after - before };
}

function measureYonFullDoc(recordCount: number): MemoryMeasurement {
  const doc = generateYonStream(recordCount);

  forceGC();
  const before = getHeapMB();

  const result = parse(doc);
  // Anti-DCE
  if (result.records.length === -1) throw new Error('unreachable');

  const after = getHeapMB();

  return { before, after, peak: after, delta: after - before };
}

function measureJsonStreaming(recordCount: number): MemoryMeasurement {
  // Simulate streaming JSON: line-delimited JSON (JSONL), per-record parse
  const lines: string[] = [];
  for (let i = 0; i < recordCount; i++) {
    lines.push(JSON.stringify({ id: 'rec-' + i, name: 'Record ' + i, value: i, active: true }));
  }
  const jsonl = lines.join('\n');

  forceGC();
  const before = getHeapMB();

  let count = 0;
  for (const line of jsonl.split('\n')) {
    const obj = JSON.parse(line) as Record<string, unknown>;
    if (obj.id) count++;
  }
  // Anti-DCE
  if (count === -1) throw new Error('unreachable');

  const after = getHeapMB();

  return { before, after, peak: after, delta: after - before };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testStreamingMemory(): TestResult {
  const sizes = [10_000, 50_000, 100_000];
  const ITERATIONS = 3;
  const results: {
    size: number;
    yonStream: MemoryMeasurement;
    yonFullDoc: MemoryMeasurement;
    jsonFullDoc: MemoryMeasurement;
    jsonStream: MemoryMeasurement;
  }[] = [];

  for (const size of sizes) {
    const yonStreamDeltas: number[] = [];
    const yonFullDocDeltas: number[] = [];
    const jsonFullDocDeltas: number[] = [];
    const jsonStreamDeltas: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      yonStreamDeltas.push(measureYonStreaming(size).delta);
      forceGC();
      yonFullDocDeltas.push(measureYonFullDoc(size).delta);
      forceGC();
      jsonFullDocDeltas.push(measureJsonParse(size).delta);
      forceGC();
      jsonStreamDeltas.push(measureJsonStreaming(size).delta);
      forceGC();
    }

    // Median of 3 values = sorted[1]
    yonStreamDeltas.sort((a, b) => a - b);
    yonFullDocDeltas.sort((a, b) => a - b);
    jsonFullDocDeltas.sort((a, b) => a - b);
    jsonStreamDeltas.sort((a, b) => a - b);

    results.push({
      size,
      yonStream: { before: 0, after: 0, peak: 0, delta: yonStreamDeltas[1]! },
      yonFullDoc: { before: 0, after: 0, peak: 0, delta: yonFullDocDeltas[1]! },
      jsonFullDoc: { before: 0, after: 0, peak: 0, delta: jsonFullDocDeltas[1]! },
      jsonStream: { before: 0, after: 0, peak: 0, delta: jsonStreamDeltas[1]! },
    });
  }

  // Growth factor: how much delta grows from 10K to 100K
  const yonSmall = results[0]!.yonStream.delta;
  const yonLarge = results[2]!.yonStream.delta;
  const yonGrowth = yonSmall > 0.01 ? yonLarge / yonSmall : 1;

  const jsonSmall = results[0]!.jsonFullDoc.delta;
  const jsonLarge = results[2]!.jsonFullDoc.delta;
  const jsonGrowth = jsonSmall > 0.01 ? jsonLarge / jsonSmall : 10;

  return {
    id: 'streaming-memory',
    name: 'Streaming Memory Profile (10K→100K)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_stream_growth_factor',
      value: Math.round(yonGrowth * 100) / 100,
      unit: 'x',
      comparison: {
        baseline: Math.round(jsonGrowth * 100) / 100,
        baselineLabel: 'JSON full-doc growth factor',
        delta: 'YON stream: ' + yonGrowth.toFixed(1) + 'x, JSON full-doc: ' + jsonGrowth.toFixed(1) + 'x (10x data)',
      },
    },
    secondaryMetrics: results.flatMap((r) => [
      { name: 'yon_stream_delta_' + (r.size / 1000) + 'k', value: r.yonStream.delta, unit: 'MB' },
      { name: 'yon_fulldoc_delta_' + (r.size / 1000) + 'k', value: r.yonFullDoc.delta, unit: 'MB' },
      { name: 'json_fulldoc_delta_' + (r.size / 1000) + 'k', value: r.jsonFullDoc.delta, unit: 'MB' },
      { name: 'json_stream_delta_' + (r.size / 1000) + 'k', value: r.jsonStream.delta, unit: 'MB' },
    ]),
    detail: results.map((r) =>
      (r.size / 1000) + 'K: YON-stream Δ' + r.yonStream.delta.toFixed(1) + 'MB, YON-full Δ' + r.yonFullDoc.delta.toFixed(1) + 'MB, JSON-full Δ' + r.jsonFullDoc.delta.toFixed(1) + 'MB, JSON-stream Δ' + r.jsonStream.delta.toFixed(1) + 'MB'
    ).join('. ') + '. YON stream growth: ' + yonGrowth.toFixed(1) + 'x. JSON full-doc growth: ' + jsonGrowth.toFixed(1) + 'x.',
  };
}

function testPeakMemory(): TestResult {
  const size = 100_000;

  const yonStream = measureYonStreaming(size);
  forceGC();
  const yonFull = measureYonFullDoc(size);
  forceGC();
  const jsonFull = measureJsonParse(size);
  forceGC();
  const jsonStream = measureJsonStreaming(size);

  return {
    id: 'peak-memory',
    name: 'Peak Memory at 100K Records (4-way)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_stream_peak_delta',
      value: yonStream.delta,
      unit: 'MB',
      comparison: {
        baseline: jsonFull.delta,
        baselineLabel: 'JSON full-doc peak delta',
        delta: yonStream.delta < jsonFull.delta
          ? (((1 - yonStream.delta / jsonFull.delta) * 100).toFixed(0) + '% less memory')
          : 'comparable',
      },
    },
    secondaryMetrics: [
      { name: 'yon_stream_peak', value: yonStream.peak, unit: 'MB' },
      { name: 'yon_fulldoc_peak', value: yonFull.peak, unit: 'MB' },
      { name: 'json_fulldoc_peak', value: jsonFull.peak, unit: 'MB' },
      { name: 'json_stream_peak', value: jsonStream.peak, unit: 'MB' },
    ],
    detail: '100K records. YON stream: Δ' + yonStream.delta.toFixed(1) + 'MB. ' +
      'YON full-doc: Δ' + yonFull.delta.toFixed(1) + 'MB. ' +
      'JSON full-doc: Δ' + jsonFull.delta.toFixed(1) + 'MB. ' +
      'JSON stream: Δ' + jsonStream.delta.toFixed(1) + 'MB.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runMemoryEfficiency(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testStreamingMemory(),
    testPeakMemory(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'memory-efficiency',
    suiteName: 'Memory Efficiency',
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
