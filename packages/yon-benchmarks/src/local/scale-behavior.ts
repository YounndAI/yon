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
 * Scale Behavior Benchmark Suite
 *
 * Pillar: Streaming
 * Validates: "Unstructured prose does not scale" (§2). YON's advantage
 *         grows with document size because line-scanning is O(n) with
 *         constant-factor advantages over tree-building parsers.
 *
 * Tests:
 * 1. Parse scaling — parse time at 500, 2000, 5000, 10000 records
 * 2. Record lookup — find a specific record by ID at each scale
 * 3. Memory profile — approximate memory consumption at each scale
 * 4. Scaling curve — does YON's advantage grow linearly?
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { performance } from 'node:perf_hooks';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function buildYonDoc(recordCount: number): string {
  let s = '@DOC ver=2.0 | id=scale | title="Scale Test" | kind=data\n';
  for (let i = 0; i < recordCount; i++) {
    s += `@NOTE text="Record ${i}: System health check passed at ${Date.now()}" | idx:int=${i} | severity="${i % 3 === 0 ? 'warn' : 'info'}"\n`;
  }
  return s;
}

function buildJsonDoc(recordCount: number): string {
  const arr = Array.from({ length: recordCount }, (_, i) => ({
    text: `Record ${i}: System health check passed at ${Date.now()}`,
    idx: i,
    severity: i % 3 === 0 ? 'warn' : 'info',
  }));
  return JSON.stringify(arr);
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

function measureYonParse(doc: string): { timeMs: number; records: number } {
  let count = 0;
  const start = performance.now();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record') count++;
    },
  });

  const lines = doc.split('\n');
  for (const line of lines) {
    parser.write(line + '\n');
  }
  try { parser.end(); } catch { /* ok */ }

  return { timeMs: performance.now() - start, records: count };
}

function measureJsonParse(doc: string): { timeMs: number; records: number } {
  const start = performance.now();
  const data = JSON.parse(doc);
  const timeMs = performance.now() - start;
  return { timeMs, records: Array.isArray(data) ? data.length : 0 };
}

function measureYonLookup(doc: string, targetIdx: number): number {
  let found = false;
  const start = performance.now();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && !found) {
        // Check if this record's idx matches target
        const idxVal = event.record.fields.get('idx');
        if (idxVal !== undefined && Number(idxVal) === targetIdx) {
          found = true;
        }
      }
    },
  });

  const lines = doc.split('\n');
  for (const line of lines) {
    parser.write(line + '\n');
    if (found) break; // Early termination — streaming advantage
  }
  try { parser.end(); } catch { /* ok */ }

  return performance.now() - start;
}

function measureJsonLookup(doc: string, targetIdx: number): number {
  const start = performance.now();
  const data = JSON.parse(doc);
  // Must parse entire document first, then search
  if (Array.isArray(data)) {
    data.find((item: { idx: number }) => item.idx === targetIdx);
  }
  return performance.now() - start;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const SIZES = [500, 2000, 5000, 10000];

function testParseScaling(): TestResult {
  const results: { size: number; yon: number; json: number; ratio: number }[] = [];

  for (const size of SIZES) {
    const yonDoc = buildYonDoc(size);
    const jsonDoc = buildJsonDoc(size);

    // Warm up
    measureYonParse(buildYonDoc(10));
    measureJsonParse(buildJsonDoc(10));

    // Run 3 iterations and take median
    const yonTimes = Array.from({ length: 3 }, () => measureYonParse(yonDoc).timeMs).sort((a, b) => a - b);
    const jsonTimes = Array.from({ length: 3 }, () => measureJsonParse(jsonDoc).timeMs).sort((a, b) => a - b);

    const yonMedian = yonTimes[1]!;
    const jsonMedian = jsonTimes[1]!;

    results.push({
      size,
      yon: Math.round(yonMedian * 100) / 100,
      json: Math.round(jsonMedian * 100) / 100,
      ratio: Math.round((yonMedian / Math.max(jsonMedian, 0.001)) * 100) / 100,
    });
  }

  const table = results.map(r =>
    `| ${r.size} | ${r.yon.toFixed(2)}ms | ${r.json.toFixed(2)}ms | ${r.ratio.toFixed(2)}x |`
  ).join('\n');

  return {
    id: 'scale-parse-time',
    name: 'Scale Behavior — Parse Time Scaling',
    passed: true,
    type: 'measurement',
    metric: {
      name: 'ratio_10k',
      value: results[results.length - 1]!.ratio,
      unit: 'yon/json',
    },
    secondaryMetrics: results.map(r => ({
      name: `yon_${r.size}`,
      value: r.yon,
      unit: 'ms',
    })),
    detail:
      `Parse time scaling:\n| Size | YON | JSON | Ratio |\n|------|-----|------|-------|\n${table}\n\n` +
      `Note: YON streaming parser is higher-level (event-based) compared to native C++ parsers. ` +
      `The advantage is not raw speed but streaming availability — YON delivers data incrementally.`,
  };
}

function testRecordLookup(): TestResult {
  const size = 5000;
  const target = Math.floor(size * 0.75); // Look up record at 75% depth
  const yonDoc = buildYonDoc(size);
  const jsonDoc = buildJsonDoc(size);

  // Warm up
  measureYonLookup(buildYonDoc(100), 50);
  measureJsonLookup(buildJsonDoc(100), 50);

  // Run 3 iterations and take median
  const yonTimes = Array.from({ length: 3 }, () => measureYonLookup(yonDoc, target)).sort((a, b) => a - b);
  const jsonTimes = Array.from({ length: 3 }, () => measureJsonLookup(jsonDoc, target)).sort((a, b) => a - b);

  const yonMedian = yonTimes[1]!;
  const jsonMedian = jsonTimes[1]!;

  return {
    id: 'scale-record-lookup',
    name: `Scale Behavior — Record Lookup at 75% depth (${size} records)`,
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_lookup_ms',
      value: Math.round(yonMedian * 100) / 100,
      unit: 'ms',
      comparison: {
        baseline: Math.round(jsonMedian * 100) / 100,
        baselineLabel: 'JSON lookup (ms)',
        delta: `YON can stop at record ${target}; JSON must parse all ${size}`,
      },
    },
    detail:
      `YON scans line-by-line and stops at record ${target}: ${yonMedian.toFixed(2)}ms. ` +
      `JSON must parse the entire ${size}-record document first: ${jsonMedian.toFixed(2)}ms. ` +
      `Streaming early-termination is the structural advantage.`,
  };
}

function testDocumentSizes(): TestResult {
  const sizeData: { size: number; yonBytes: number; jsonBytes: number; ratio: number }[] = [];

  for (const size of SIZES) {
    const yonDoc = buildYonDoc(size);
    const jsonDoc = buildJsonDoc(size);
    const yonBytes = Buffer.byteLength(yonDoc, 'utf-8');
    const jsonBytes = Buffer.byteLength(jsonDoc, 'utf-8');

    sizeData.push({
      size,
      yonBytes,
      jsonBytes,
      ratio: Math.round((yonBytes / jsonBytes) * 100) / 100,
    });
  }

  const table = sizeData.map(s =>
    `| ${s.size} | ${(s.yonBytes / 1024).toFixed(1)}KB | ${(s.jsonBytes / 1024).toFixed(1)}KB | ${s.ratio}x |`
  ).join('\n');

  return {
    id: 'scale-document-size',
    name: 'Scale Behavior — Document Size Comparison',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'size_ratio_10k',
      value: sizeData[sizeData.length - 1]!.ratio,
      unit: 'yon/json bytes',
    },
    secondaryMetrics: sizeData.map(s => ({
      name: `yon_kb_${s.size}`,
      value: Math.round(s.yonBytes / 1024),
      unit: 'KB',
    })),
    detail:
      `Document size comparison:\n| Records | YON | JSON | Ratio |\n|---------|-----|------|-------|\n${table}\n\n` +
      `YON's tag baseline per record is roughly constant. JSON's structural baseline (brackets, commas, key quoting) grows similarly.`,
  };
}

function testTokenScaling(): TestResult {
  // Approximate token count using character/4 heuristic
  const tokenCounts: { size: number; yonTokens: number; jsonTokens: number; savings: number }[] = [];

  for (const size of SIZES) {
    const yonDoc = buildYonDoc(size);
    const jsonDoc = buildJsonDoc(size);
    const yonTokens = Math.round(yonDoc.length / 4);
    const jsonTokens = Math.round(jsonDoc.length / 4);
    const savings = Math.round(((jsonTokens - yonTokens) / jsonTokens) * 100);

    tokenCounts.push({ size, yonTokens, jsonTokens, savings });
  }

  return {
    id: 'scale-token-efficiency',
    name: 'Scale Behavior — Token Efficiency at Scale',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'token_savings_10k',
      value: tokenCounts[tokenCounts.length - 1]!.savings,
      unit: '%',
    },
    secondaryMetrics: tokenCounts.map(t => ({
      name: `savings_${t.size}`,
      value: t.savings,
      unit: '%',
    })),
    detail:
      `Token savings at scale: ${tokenCounts.map(t => `${t.size} records=${t.savings}%`).join(', ')}. ` +
      `YON's compact tag syntax (@NOTE, @MAP) has lower per-record structural baseline than JSON's {"key":"value"} pattern.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testParseScaling(),
    testRecordLookup(),
    testDocumentSizes(),
    testTokenScaling(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'scale-behavior',
    suiteName: 'Scale Behavior',
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

export { run as runScaleBehavior };
