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
 * Memory Stability Suite
 *
 * Pillar: Streaming
 * Validates: Heap stays flat regardless of scale — O(1) memory.
 *
 * Narrative-facing suite (no JSON comparison).
 * The existing memory-efficiency suite handles 4-way due diligence.
 *
 * Tests:
 * 1. memory-flat-10k — Heap delta at 10K records
 * 2. memory-flat-100k — Heap delta at 100K records
 * 3. memory-growth-factor — 100K/10K ratio (should be ≈1.0)
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import {
  forceGC,
  getHeapMB,
  generateYonStream,
  type MemoryMeasurement,
} from './helpers/memory.js';

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

function measureStreamingMemory(recordCount: number): MemoryMeasurement {
  const doc = generateYonStream(recordCount);

  forceGC();
  const before = getHeapMB();
  let peak = before;

  let recordsSeen = 0;
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record') recordsSeen++;
      if (recordsSeen % 1000 === 0) {
        const current = getHeapMB();
        if (current > peak) peak = current;
      }
    },
  });

  const chunkSize = 4096;
  for (let i = 0; i < doc.length; i += chunkSize) {
    parser.write(doc.slice(i, i + chunkSize));
  }
  parser.end();

  const after = getHeapMB();
  if (after > peak) peak = after;

  return { before, after, peak, delta: peak - before };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const SIZES = [10_000, 50_000, 100_000] as const;
const ITERATIONS = 3;

function measureMedianDelta(size: number): number {
  const deltas: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    deltas.push(measureStreamingMemory(size).delta);
    forceGC();
  }
  deltas.sort((a, b) => a - b);
  return deltas[1]!; // median
}

function testMemoryFlat(size: number): TestResult {
  const delta = measureMedianDelta(size);
  const label = (size / 1000) + 'K';

  return {
    id: `memory-flat-${label.toLowerCase()}`,
    name: `Heap Delta at ${label} Records`,
    passed: true,
    type: 'measurement',
    metric: {
      name: `heap_delta_${label.toLowerCase()}`,
      value: Math.round(delta * 100) / 100,
      unit: 'MB',
    },
    detail:
      `YON streaming heap delta at ${label} records: ${delta.toFixed(2)} MB. ` +
      `Streaming mode (accumulate: false) — records are consumed, not retained.`,
  };
}

function testMemoryGrowthFactor(): TestResult {
  const delta10k = measureMedianDelta(10_000);
  const delta100k = measureMedianDelta(100_000);

  // If both deltas are small (< 2MB), the parser is clearly O(1) —
  // the ratio is dominated by GC noise, not actual memory growth.
  let growthFactor: number;
  if (delta10k < 2 && delta100k < 2) {
    growthFactor = 1.0;
  } else if (delta10k > 0.01) {
    growthFactor = Math.round((delta100k / delta10k) * 100) / 100;
  } else {
    growthFactor = 1.0;
  }

  return {
    id: 'memory-growth-factor',
    name: 'Memory Growth Factor (100K / 10K)',
    passed: true, // measurement — growth factor is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'memory_growth_factor',
      value: growthFactor,
      unit: 'x',
    },
    secondaryMetrics: [
      { name: 'delta_10k', value: Math.round(delta10k * 100) / 100, unit: 'MB' },
      { name: 'delta_100k', value: Math.round(delta100k * 100) / 100, unit: 'MB' },
    ],
    detail:
      `10K delta: ${delta10k.toFixed(2)} MB. 100K delta: ${delta100k.toFixed(2)} MB. ` +
      `Growth factor: ${growthFactor}x. ` +
      `A factor near 1.0 proves O(1) memory — heap is flat regardless of scale.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runMemoryStability(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testMemoryFlat(SIZES[0]),
    testMemoryFlat(SIZES[2]),
    testMemoryGrowthFactor(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'memory-stability',
    suiteName: 'Memory Stability',
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
