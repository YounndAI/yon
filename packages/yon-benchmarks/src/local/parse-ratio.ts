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
 * Parse Ratio Suite
 *
 * Pillar: Cross-cutting
 * Validates: YON parse() performance relative to JSON.parse() at multiple scales.
 *
 * Tests:
 * 1. scale-ratio — Ratio at each document size (1→500 records)
 * 2. convergence-point — Document size where ratio drops below 2x
 * 3. production-ratio — Average ratio at ≥50 records (the marquee number)
 * 4. streaming-overhead — Streaming parser overhead vs batch parser
 *
 * Design: Comparative tests (always pass) — measures the ratio, doesn't gate it.
 */

import { parse, StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult, MetricValue } from '../core/types.js';

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateYon(recordCount: number): string {
  const lines = [
    '@DOC ver=2.0 | id=ratio-bench | title="Ratio Benchmark" | kind=doc',
    '@SEC name="Section" | rid=sec:1',
  ];
  for (let i = 0; i < recordCount; i++) {
    lines.push(
      `@NOTE text="Record number ${i} with realistic content" | rid="note:${i}" | idx:int=${i} | active:bool=true`,
    );
  }
  return lines.join('\n');
}

function generateJson(recordCount: number): string {
  const records = [];
  for (let i = 0; i < recordCount; i++) {
    records.push({
      tag: 'NOTE',
      fields: {
        text: `Record number ${i} with realistic content`,
        rid: `note:${i}`,
        idx: String(i),
        active: 'true',
      },
    });
  }
  return JSON.stringify({
    version: '2.0',
    id: 'ratio-bench',
    title: 'Ratio Benchmark',
    kind: 'doc',
    records,
  });
}

// ---------------------------------------------------------------------------
// Benchmarking utilities
// ---------------------------------------------------------------------------

const WARMUP = 100;
const ITERATIONS = 500;
const SIZES = [1, 5, 10, 20, 50, 100, 200, 500];
const STREAM_SIZES = [10, 50, 100, 200];

function bench(fn: () => void, iterations: number): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - start) / iterations;
}

function benchStreaming(source: string, iterations: number): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const parser = new StreamingYonParser({ onEvent: () => {} });
    parser.write(source);
    parser.end();
  }
  return (performance.now() - start) / iterations;
}

interface RatioResult {
  size: number;
  yonMs: number;
  jsonMs: number;
  ratio: number;
}

function measureRatios(): RatioResult[] {
  const results: RatioResult[] = [];

  for (const size of SIZES) {
    const yonDoc = generateYon(size);
    const jsonDoc = generateJson(size);

    // Warmup
    for (let i = 0; i < WARMUP; i++) {
      parse(yonDoc);
      JSON.parse(jsonDoc);
    }

    const yonMs = bench(() => parse(yonDoc), ITERATIONS);
    const jsonMs = bench(() => JSON.parse(jsonDoc), ITERATIONS);

    results.push({ size, yonMs, jsonMs, ratio: yonMs / jsonMs });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testScaleRatio(): TestResult {
  const ratios = measureRatios();
  const secondary: MetricValue[] = [];

  for (const r of ratios) {
    secondary.push(
      { name: `ratio_at_${r.size}`, value: Math.round(r.ratio * 100) / 100, unit: 'x' },
      { name: `yon_ms_at_${r.size}`, value: Math.round(r.yonMs * 10000) / 10000, unit: 'ms' },
      { name: `json_ms_at_${r.size}`, value: Math.round(r.jsonMs * 10000) / 10000, unit: 'ms' },
    );
  }

  // Middle-of-the-road ratio for primary metric
  const midRatio = ratios.find((r) => r.size === 20);

  return {
    id: 'scale-ratio',
    name: 'Parse Ratio at Scale (8 sizes)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_json_ratio_20rec',
      value: Math.round((midRatio?.ratio ?? 0) * 100) / 100,
      unit: 'x (vs JSON.parse)',
      comparison: {
        baseline: 1.0,
        baselineLabel: 'JSON.parse = 1.0x',
        delta: ratios.map((r) => `${r.size}rec: ${r.ratio.toFixed(2)}x`).join(', '),
      },
    },
    secondaryMetrics: secondary,
    detail: ratios
      .map((r) => `${r.size} records: ${r.ratio.toFixed(2)}x (YON ${r.yonMs.toFixed(4)}ms, JSON ${r.jsonMs.toFixed(4)}ms)`)
      .join('. '),
  };
}

function testConvergencePoint(): TestResult {
  const ratios = measureRatios();

  // Find the smallest document size where ratio < 2x
  const convergence = ratios.find((r) => r.ratio < 2.0);

  return {
    id: 'convergence-point',
    name: 'Ratio Convergence Point (< 2x)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'convergence_records',
      value: convergence?.size ?? -1,
      unit: 'records',
    },
    detail: convergence
      ? `Ratio drops below 2x at ${convergence.size} records (${convergence.ratio.toFixed(2)}x). ` +
        `Smaller documents have higher fixed overhead (parser init, @DOC header).`
      : 'Ratio never drops below 2x — investigate parser overhead.',
  };
}

function testProductionRatio(): TestResult {
  const ratios = measureRatios();
  const production = ratios.filter((r) => r.size >= 50);
  const avgRatio =
    production.reduce((sum, r) => sum + r.ratio, 0) / production.length;

  return {
    id: 'production-ratio',
    name: 'Production Ratio (≥50 records avg)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'avg_production_ratio',
      value: Math.round(avgRatio * 100) / 100,
      unit: 'x (vs JSON.parse)',
      comparison: {
        baseline: 1.0,
        baselineLabel: 'JSON.parse = 1.0x',
        delta: `Average across ${production.length} sizes (${production.map((r) => r.size).join(', ')} records)`,
      },
    },
    detail:
      `At production scale (≥50 records), YON parse averages ${avgRatio.toFixed(2)}x vs JSON.parse. ` +
      `Previous baseline (pre-fused parser): ~9x. ` +
      `Improvement: ${(9 / avgRatio).toFixed(1)}x faster.`,
  };
}

function testStreamingOverhead(): TestResult {
  const secondary: MetricValue[] = [];
  const ratios: { size: number; batchMs: number; streamMs: number; ratio: number }[] = [];

  for (const size of STREAM_SIZES) {
    const yonDoc = generateYon(size);

    // Warmup
    for (let i = 0; i < WARMUP; i++) {
      parse(yonDoc);
      const p = new StreamingYonParser({ onEvent: () => {} });
      p.write(yonDoc);
      p.end();
    }

    const batchMs = bench(() => parse(yonDoc), ITERATIONS);
    const streamMs = benchStreaming(yonDoc, ITERATIONS);
    const ratio = streamMs / batchMs;

    ratios.push({ size, batchMs, streamMs, ratio });
    secondary.push(
      { name: `batch_ms_${size}`, value: Math.round(batchMs * 10000) / 10000, unit: 'ms' },
      { name: `stream_ms_${size}`, value: Math.round(streamMs * 10000) / 10000, unit: 'ms' },
      { name: `overhead_${size}`, value: Math.round(ratio * 100) / 100, unit: 'x' },
    );
  }

  const avgOverhead =
    ratios.reduce((sum, r) => sum + r.ratio, 0) / ratios.length;

  return {
    id: 'streaming-overhead',
    name: 'Streaming Overhead vs Batch',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'avg_streaming_overhead',
      value: Math.round(avgOverhead * 100) / 100,
      unit: 'x (stream/batch)',
      comparison: {
        baseline: 1.0,
        baselineLabel: 'Batch = 1.0x',
        delta: ratios.map((r) => `${r.size}rec: ${r.ratio.toFixed(2)}x`).join(', '),
      },
    },
    secondaryMetrics: secondary,
    detail:
      `Streaming parser averages ${avgOverhead.toFixed(2)}x overhead over batch. ` +
      `Both use parseRecordDirect() — overhead is line-buffering and event dispatch. ` +
      ratios
        .map(
          (r) =>
            `${r.size} records: batch ${r.batchMs.toFixed(4)}ms, stream ${r.streamMs.toFixed(4)}ms (${r.ratio.toFixed(2)}x)`,
        )
        .join('. '),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runParseRatio(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testScaleRatio(),
    testConvergencePoint(),
    testProductionRatio(),
    testStreamingOverhead(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'parse-ratio',
    suiteName: 'Parse Ratio (YON vs JSON.parse)',
    pillar: 'cross-cutting',
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
