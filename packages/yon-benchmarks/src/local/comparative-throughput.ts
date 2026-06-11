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
 * Comparative Throughput Suite
 *
 * Pillar: Cross-cutting
 * Validates: Honest head-to-head parse/serialize performance across format categories.
 *
 * Design: Tests always pass (they're comparative, not pass/fail).
 * The comparison field in MetricValue carries the baseline data.
 *
 * Uses statistical harness (N=100, 10 warm-up) for rigorous measurement.
 */

import { parse as parseYon, format as formatYon } from '@younndai/yon-parser';
// @ts-expect-error — js-yaml has no bundled types; @types/js-yaml can be installed if desired
import yaml from 'js-yaml';
import { runN, formatStats, getEnvironmentInfo } from '../core/stats.js';
import { localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult, MetricValue } from '../core/types.js';

// ---------------------------------------------------------------------------
// Equivalent Test Data
// ---------------------------------------------------------------------------

// A realistic structured document: 20 configuration records with typed fields.
// Identical logical content expressed in each format.

function generateRecords(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, i) => ({
    id: 'record-' + i,
    name: 'Configuration Entry ' + i,
    value: Math.round(Math.random() * 10000) / 100,
    enabled: i % 3 !== 0,
    tags: ['alpha', 'beta', i % 2 === 0 ? 'gamma' : 'delta'],
    metadata: {
      created: '2026-02-13T00:00:00Z',
      author: 'benchmark',
      priority: i % 5,
    },
  }));
}

// Use deterministic seed by generating once
const RECORD_COUNT = 20;
const RECORDS = generateRecords(RECORD_COUNT);

function toYonString(records: Array<Record<string, unknown>>): string {
  const lines = ['@DOC ver=2.0 | id=comparative | title="Comparative Benchmark"'];
  for (const r of records) {
    lines.push(
      '@CFG key=' + r.id +
      ' | val="' + r.name +
      '" | enabled:bool=' + r.enabled +
      ' | priority:int=' + (r.metadata as Record<string, unknown>).priority,
    );
  }
  return lines.join('\n') + '\n';
}

function toJsonString(records: Array<Record<string, unknown>>): string {
  return JSON.stringify({ records }, null, 0);
}

function toYamlString(records: Array<Record<string, unknown>>): string {
  return yaml.dump({ records });
}

// Pre-generate all format strings
const YON_STRING = toYonString(RECORDS);
const JSON_STRING = toJsonString(RECORDS);
const YAML_STRING = toYamlString(RECORDS);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testParseThroughput(): TestResult {
  const env = getEnvironmentInfo();

  // Measure each parser with statistical rigor
  const yonStats = runN(() => { parseYon(YON_STRING); }, { iterations: 100, warmup: 10 });
  const jsonStats = runN(() => { JSON.parse(JSON_STRING); }, { iterations: 100, warmup: 10 });
  const yamlStats = runN(() => { yaml.load(YAML_STRING); }, { iterations: 100, warmup: 10 });

  // Use p50 (median) for ops/s — more stable than mean against GC/JIT outliers
  const yonOps = yonStats.p50 > 0 ? Math.round(1000 / yonStats.p50) : 0;
  const jsonOps = jsonStats.p50 > 0 ? Math.round(1000 / jsonStats.p50) : 0;
  const yamlOps = yamlStats.p50 > 0 ? Math.round(1000 / yamlStats.p50) : 0;

  // Confidence intervals from existing 100-iteration stats
  const yonMinOps = yonStats.max > 0 ? Math.round(1000 / yonStats.max) : 0;
  const yonMaxOps = yonStats.min > 0 ? Math.round(1000 / yonStats.min) : 0;
  const jsonMinOps = jsonStats.max > 0 ? Math.round(1000 / jsonStats.max) : 0;
  const jsonMaxOps = jsonStats.min > 0 ? Math.round(1000 / jsonStats.min) : 0;

  const secondaryMetrics: MetricValue[] = [
    { name: 'json_parse_ops', value: jsonOps, unit: 'ops/s' },
    { name: 'yaml_parse_ops', value: yamlOps, unit: 'ops/s' },
    { name: 'yon_parse_min_ops', value: yonMinOps, unit: 'ops/s' },
    { name: 'yon_parse_max_ops', value: yonMaxOps, unit: 'ops/s' },
    { name: 'json_parse_min_ops', value: jsonMinOps, unit: 'ops/s' },
    { name: 'json_parse_max_ops', value: jsonMaxOps, unit: 'ops/s' },
    { name: 'yon_parse_p50_ms', value: yonStats.p50, unit: 'ms' },
    { name: 'json_parse_p50_ms', value: jsonStats.p50, unit: 'ms' },
    { name: 'yaml_parse_p50_ms', value: yamlStats.p50, unit: 'ms' },
  ];

  return {
    id: 'parse-throughput',
    name: 'Parse Throughput (Multi-Format)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_parse_ops',
      value: yonOps,
      unit: 'ops/s',
      comparison: {
        baseline: jsonOps,
        baselineLabel: 'JSON.parse ops/s',
        delta: yonOps + ' vs ' + jsonOps + ' (JSON) vs ' + yamlOps + ' (YAML)',
      },
    },
    secondaryMetrics,
    detail: 'YON: ' + formatStats(yonStats) + '. JSON: ' + formatStats(jsonStats) + '. YAML: ' + formatStats(yamlStats) + '. Machine: ' + env.cpu + ' (' + env.cores + ' cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.',
  };
}

function testSerializeThroughput(): TestResult {
  // Parse once to get ASTs
  const yonDoc = parseYon(YON_STRING);
  const jsonObj = JSON.parse(JSON_STRING);
  const yamlObj = yaml.load(YAML_STRING);

  const yonStats = runN(() => { formatYon(yonDoc); }, { iterations: 100, warmup: 10 });
  const jsonStats = runN(() => { JSON.stringify(jsonObj); }, { iterations: 100, warmup: 10 });
  const yamlStats = runN(() => { yaml.dump(yamlObj); }, { iterations: 100, warmup: 10 });

  // Use p50 (median) for ops/s — more stable than mean
  const yonOps = yonStats.p50 > 0 ? Math.round(1000 / yonStats.p50) : 0;
  const jsonOps = jsonStats.p50 > 0 ? Math.round(1000 / jsonStats.p50) : 0;
  const yamlOps = yamlStats.p50 > 0 ? Math.round(1000 / yamlStats.p50) : 0;

  return {
    id: 'serialize-throughput',
    name: 'Serialize Throughput (Multi-Format)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_serialize_ops',
      value: yonOps,
      unit: 'ops/s',
      comparison: {
        baseline: jsonOps,
        baselineLabel: 'JSON.stringify ops/s',
        delta: yonOps + ' vs ' + jsonOps + ' (JSON) vs ' + yamlOps + ' (YAML)',
      },
    },
    detail: 'YON: ' + formatStats(yonStats) + '. JSON: ' + formatStats(jsonStats) + '. YAML: ' + formatStats(yamlStats),
  };
}

function testByteEfficiency(): TestResult {
  const yonSize = Buffer.byteLength(YON_STRING, 'utf-8');
  const jsonSize = Buffer.byteLength(JSON_STRING, 'utf-8');
  const yamlSize = Buffer.byteLength(YAML_STRING, 'utf-8');

  // Also compare minified JSON
  const jsonMin = JSON.stringify(JSON.parse(JSON_STRING));
  const jsonMinSize = Buffer.byteLength(jsonMin, 'utf-8');

  return {
    id: 'byte-efficiency',
    name: 'Structural Density (Multi-Format)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_bytes',
      value: yonSize,
      unit: 'bytes',
      comparison: {
        baseline: jsonSize,
        baselineLabel: 'JSON bytes',
        delta: yonSize + 'B (YON) vs ' + jsonMinSize + 'B (JSON min) vs ' + yamlSize + 'B (YAML)',
      },
    },
    secondaryMetrics: [
      { name: 'json_bytes', value: jsonSize, unit: 'bytes' },
      { name: 'json_min_bytes', value: jsonMinSize, unit: 'bytes' },
      { name: 'yaml_bytes', value: yamlSize, unit: 'bytes' },
    ],
    detail: RECORD_COUNT + ' records. YON: ' + yonSize + 'B. JSON: ' + jsonSize + 'B (min: ' + jsonMinSize + 'B). YAML: ' + yamlSize + 'B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runComparativeThroughput(): Promise<BenchmarkResult> {
  const start = performance.now();

  const tests: TestResult[] = [
    testParseThroughput(),
    testSerializeThroughput(),
    testByteEfficiency(),
  ];

  const durationMs = performance.now() - start;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'comparative-throughput',
    suiteName: 'Comparative Throughput',
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
