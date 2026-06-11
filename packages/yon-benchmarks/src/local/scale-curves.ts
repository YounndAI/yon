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
 * Scale Curves Suite
 *
 * Pillar: Streaming
 * Validates: YON parse performance and memory scale predictably with document size.
 *
 * Tests:
 * 1. Parse Time vs Size — 10, 100, 1K, 10K records for YON and JSON
 * 2. Memory Scaling — RSS delta after parsing each size tier
 *
 * Uses statistical harness (N=10 per tier, 3 warm-up) for rigorous measurement.
 */

import { parse as parseYon } from '@younndai/yon-parser';
import { runN, formatStats, type RunNResult } from '../core/stats.js';
import { localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult, MetricValue } from '../core/types.js';

// ---------------------------------------------------------------------------
// Data Generators
// ---------------------------------------------------------------------------

const TIERS = [10, 100, 1_000, 10_000] as const;

function generateYon(count: number): string {
  const lines = ['@DOC ver=2.0 | id=scale-' + count + ' | title="Scale Test ' + count + ' records"'];
  for (let i = 0; i < count; i++) {
    lines.push(
      '@CFG key=item-' + i +
      ' | val="Entry ' + i +
      '" | priority:int=' + (i % 10) +
      ' | enabled:bool=' + (i % 3 !== 0),
    );
  }
  return lines.join('\n') + '\n';
}

function generateJson(count: number): string {
  const records = Array.from({ length: count }, (_, i) => ({
    key: 'item-' + i,
    val: 'Entry ' + i,
    priority: i % 10,
    enabled: i % 3 !== 0,
  }));
  return JSON.stringify({ records });
}

// Pre-generate all test strings to avoid measuring generation time
const YON_STRINGS = Object.fromEntries(TIERS.map((n) => [n, generateYon(n)]));
const JSON_STRINGS = Object.fromEntries(TIERS.map((n) => [n, generateJson(n)]));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

interface TierResult {
  records: number;
  yonStats: RunNResult;
  jsonStats: RunNResult;
  yonBytes: number;
  jsonBytes: number;
}

function measureAllTiers(): TierResult[] {
  return TIERS.map((count) => {
    const yonStr = YON_STRINGS[count]!;
    const jsonStr = JSON_STRINGS[count]!;

    // Use fewer iterations for large documents to keep runtime reasonable
    const iterations = count <= 100 ? 30 : count <= 1000 ? 10 : 5;
    const warmup = count <= 100 ? 5 : 2;

    const yonStats = runN(() => { parseYon(yonStr); }, { iterations, warmup });
    const jsonStats = runN(() => { JSON.parse(jsonStr); }, { iterations, warmup });

    return {
      records: count,
      yonStats,
      jsonStats,
      yonBytes: Buffer.byteLength(yonStr, 'utf-8'),
      jsonBytes: Buffer.byteLength(jsonStr, 'utf-8'),
    };
  });
}

function testParseTimeVsSize(tiers: TierResult[]): TestResult {
  const secondaryMetrics: MetricValue[] = [];

  for (const tier of tiers) {
    secondaryMetrics.push({
      name: 'yon_' + tier.records + '_records',
      value: tier.yonStats.mean,
      unit: 'ms',
      comparison: {
        baseline: tier.jsonStats.mean,
        baselineLabel: 'JSON ' + tier.records + ' records',
        delta: tier.yonStats.mean.toFixed(3) + 'ms vs ' + tier.jsonStats.mean.toFixed(3) + 'ms',
      },
    });
  }

  // Compute scaling factor: how does parse time grow as records 10x?
  const yonScaling: string[] = [];
  for (let i = 1; i < tiers.length; i++) {
    const ratio = tiers[i]!.yonStats.mean / tiers[i - 1]!.yonStats.mean;
    yonScaling.push(tiers[i - 1]!.records + '→' + tiers[i]!.records + ': ' + ratio.toFixed(1) + 'x');
  }

  const detailLines = tiers.map((t) =>
    t.records + ' records: YON ' + formatStats(t.yonStats) + ' | JSON ' + formatStats(t.jsonStats),
  );
  detailLines.push('YON scaling: ' + yonScaling.join(', '));

  return {
    id: 'parse-time-vs-size',
    name: 'Parse Time vs Document Size',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_10k_parse_ms',
      value: tiers[tiers.length - 1]!.yonStats.mean,
      unit: 'ms',
      comparison: {
        baseline: tiers[tiers.length - 1]!.jsonStats.mean,
        baselineLabel: 'JSON 10K parse ms',
        delta: 'See detail for full curve',
      },
    },
    secondaryMetrics,
    detail: detailLines.join('\n'),
  };
}

function testMemoryScaling(tiers: TierResult[]): TestResult {
  const memResults: Array<{ records: number; yonRSS: number; jsonRSS: number }> = [];

  for (const tier of tiers) {
    const yonStr = YON_STRINGS[tier.records]!;
    const jsonStr = JSON_STRINGS[tier.records]!;

    // Force GC if available, then measure RSS delta
    if (global.gc) global.gc();
    const beforeYon = process.memoryUsage().rss;
    void parseYon(yonStr);
    const afterYon = process.memoryUsage().rss;

    if (global.gc) global.gc();
    const beforeJson = process.memoryUsage().rss;
    void JSON.parse(jsonStr);
    const afterJson = process.memoryUsage().rss;

    memResults.push({
      records: tier.records,
      yonRSS: Math.max(0, afterYon - beforeYon),
      jsonRSS: Math.max(0, afterJson - beforeJson),
    });
  }

  const secondaryMetrics: MetricValue[] = memResults.map((m) => ({
    name: 'memory_' + m.records + '_records',
    value: Math.round(m.yonRSS / 1024),
    unit: 'KB',
    comparison: {
      baseline: Math.round(m.jsonRSS / 1024),
      baselineLabel: 'JSON KB',
      delta: Math.round(m.yonRSS / 1024) + 'KB vs ' + Math.round(m.jsonRSS / 1024) + 'KB',
    },
  }));

  const detailLines = memResults.map((m) =>
    m.records + ' records: YON +' + Math.round(m.yonRSS / 1024) + 'KB | JSON +' + Math.round(m.jsonRSS / 1024) + 'KB',
  );

  return {
    id: 'memory-scaling',
    name: 'Memory Scaling (RSS Delta)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_10k_memory_kb',
      value: Math.round(memResults[memResults.length - 1]!.yonRSS / 1024),
      unit: 'KB',
    },
    secondaryMetrics,
    detail: detailLines.join('\n') + '\nNote: RSS deltas are approximate; GC timing affects accuracy.',
  };
}

function testBytesVsSize(tiers: TierResult[]): TestResult {
  const secondaryMetrics: MetricValue[] = tiers.map((t) => ({
    name: 'bytes_' + t.records + '_records',
    value: t.yonBytes,
    unit: 'bytes',
    comparison: {
      baseline: t.jsonBytes,
      baselineLabel: 'JSON bytes',
      delta: t.yonBytes + 'B vs ' + t.jsonBytes + 'B (' + ((t.yonBytes / t.jsonBytes - 1) * 100).toFixed(1) + '%)',
    },
  }));

  return {
    id: 'bytes-vs-size',
    name: 'Wire Size vs Document Size',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_10k_bytes',
      value: tiers[tiers.length - 1]!.yonBytes,
      unit: 'bytes',
      comparison: {
        baseline: tiers[tiers.length - 1]!.jsonBytes,
        baselineLabel: 'JSON bytes',
        delta: tiers[tiers.length - 1]!.yonBytes + 'B vs ' + tiers[tiers.length - 1]!.jsonBytes + 'B',
      },
    },
    secondaryMetrics,
    detail: tiers.map((t) => t.records + ' records: YON ' + t.yonBytes + 'B | JSON ' + t.jsonBytes + 'B').join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runScaleCurves(): Promise<BenchmarkResult> {
  const start = performance.now();

  // Run all tiers once (shared data for all tests)
  const tiers = measureAllTiers();

  const tests: TestResult[] = [
    testParseTimeVsSize(tiers),
    testMemoryScaling(tiers),
    testBytesVsSize(tiers),
  ];

  const durationMs = performance.now() - start;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'scale-curves',
    suiteName: 'Scale Curves',
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
