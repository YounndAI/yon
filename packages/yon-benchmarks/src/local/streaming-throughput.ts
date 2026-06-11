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
 * Streaming Throughput Suite
 *
 * Pillar: Streaming
 * Validates: YON sustains high records/sec under sustained load.
 *
 * Tests:
 * 1. sustained-throughput-100k — Records/sec over 100K records
 * 2. throughput-stability — Variance between first 10K and last 10K batches
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { generateYonStream } from './helpers/memory.js';

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

const TOTAL_RECORDS = 100_000;
const BATCH_SIZE = 10_000;

interface ThroughputResult {
  totalOps: number;
  totalMs: number;
  firstBatchOps: number;
  lastBatchOps: number;
}

function measureStreamingThroughput(): ThroughputResult {
  const doc = generateYonStream(TOTAL_RECORDS);

  let recordCount = 0;
  let batchStart = performance.now();
  let firstBatchOps = 0;
  let lastBatchOps = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type !== 'record' || event.record.tag === 'DOC') return;
      recordCount++;

      // Capture first batch throughput
      if (recordCount === BATCH_SIZE) {
        const batchMs = performance.now() - batchStart;
        firstBatchOps = Math.round(BATCH_SIZE / (batchMs / 1000));
      }

      // Reset timer at start of last batch
      if (recordCount === TOTAL_RECORDS - BATCH_SIZE) {
        batchStart = performance.now();
      }
    },
  });

  const overallStart = performance.now();

  // Feed in chunks to simulate streaming
  const chunkSize = 4096;
  for (let i = 0; i < doc.length; i += chunkSize) {
    parser.write(doc.slice(i, i + chunkSize));
  }
  parser.end();

  const totalMs = performance.now() - overallStart;

  // Capture last batch throughput
  const lastBatchMs = performance.now() - batchStart;
  lastBatchOps = Math.round(BATCH_SIZE / (lastBatchMs / 1000));

  const totalOps = Math.round(recordCount / (totalMs / 1000));

  return { totalOps, totalMs, firstBatchOps, lastBatchOps };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testSustainedThroughput(): TestResult {
  // Run 3 iterations, take median
  const results: ThroughputResult[] = [];
  for (let i = 0; i < 3; i++) {
    results.push(measureStreamingThroughput());
  }
  results.sort((a, b) => a.totalOps - b.totalOps);
  const median = results[1]!;

  return {
    id: 'sustained-throughput-100k',
    name: 'Sustained Throughput (100K Records)',
    passed: true, // measurement — throughput is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'sustained_throughput_ops',
      value: median.totalOps,
      unit: 'records/sec',
    },
    secondaryMetrics: [
      { name: 'total_duration', value: Math.round(median.totalMs * 100) / 100, unit: 'ms' },
      { name: 'first_batch_ops', value: median.firstBatchOps, unit: 'records/sec' },
      { name: 'last_batch_ops', value: median.lastBatchOps, unit: 'records/sec' },
    ],
    detail:
      `${TOTAL_RECORDS.toLocaleString()} records streamed at ${median.totalOps.toLocaleString()} records/sec. ` +
      `Duration: ${median.totalMs.toFixed(1)}ms. ` +
      `First ${BATCH_SIZE / 1000}K batch: ${median.firstBatchOps.toLocaleString()} ops/s. ` +
      `Last ${BATCH_SIZE / 1000}K batch: ${median.lastBatchOps.toLocaleString()} ops/s.`,
  };
}

function testThroughputStability(): TestResult {
  const results: ThroughputResult[] = [];
  for (let i = 0; i < 3; i++) {
    results.push(measureStreamingThroughput());
  }
  results.sort((a, b) => a.totalOps - b.totalOps);
  const median = results[1]!;

  const ratio = median.firstBatchOps > 0
    ? Math.round((median.lastBatchOps / median.firstBatchOps) * 100) / 100
    : 0;

  return {
    id: 'throughput-stability',
    name: 'Throughput Stability (First vs Last 10K)',
    passed: true, // measurement — stability ratio is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'throughput_stability_ratio',
      value: ratio,
      unit: 'ratio',
    },
    secondaryMetrics: [
      { name: 'first_10k_ops', value: median.firstBatchOps, unit: 'records/sec' },
      { name: 'last_10k_ops', value: median.lastBatchOps, unit: 'records/sec' },
    ],
    detail:
      `Last-batch/first-batch ratio: ${ratio}. ` +
      `First 10K: ${median.firstBatchOps.toLocaleString()} ops/s. ` +
      `Last 10K: ${median.lastBatchOps.toLocaleString()} ops/s. ` +
      `Ratio > 0.8 proves O(1) throughput — no degradation at scale.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runStreamingThroughput(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testSustainedThroughput(),
    testThroughputStability(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'streaming-throughput',
    suiteName: 'Streaming Throughput',
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
