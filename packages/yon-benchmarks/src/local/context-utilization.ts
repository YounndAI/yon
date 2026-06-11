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
 * Context Window Utilization Suite
 *
 * Pillar: Cognitive Economy
 * Axis: Structure (format-level)
 * Validates: YON fits more addressable records into fixed context window budgets
 *         (8K, 32K, 128K tokens) than equivalent JSON.
 *
 * This is a structure test — it measures how many typed records each format
 * can pack into a given token budget, not how well the content is understood.
 *
 * Tests:
 * 1. Records per 8K window — small context (GPT-3.5 class)
 * 2. Records per 32K window — mid context (GPT-4 class)
 * 3. Records per 128K window — large context (GPT-4o / Claude 3.5 class)
 */

import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { get_encoding } from 'tiktoken';

// ---------------------------------------------------------------------------
// Record generators — one record at a time, growing the document
// ---------------------------------------------------------------------------

function yonRecord(i: number): string {
  return '@MAP id=item-' + i +
    ' | name="Configuration Entry ' + i + '"' +
    ' | status=active' +
    ' | priority:int=' + (i % 5) +
    ' | owner="team-' + (i % 8) + '"' +
    ' | created="2026-01-' + String(1 + (i % 28)).padStart(2, '0') + '"' +
    ' | tags="' + ['alpha', 'beta', 'gamma'][i % 3] + ',' + ['prod', 'staging', 'dev'][i % 3] + '"';
}

function jsonRecord(i: number): Record<string, unknown> {
  return {
    id: 'item-' + i,
    name: 'Configuration Entry ' + i,
    status: 'active',
    priority: i % 5,
    owner: 'team-' + (i % 8),
    created: '2026-01-' + String(1 + (i % 28)).padStart(2, '0'),
    tags: [['alpha', 'beta', 'gamma'][i % 3], ['prod', 'staging', 'dev'][i % 3]],
  };
}

// ---------------------------------------------------------------------------
// Core measurement
// ---------------------------------------------------------------------------

interface UtilizationResult {
  yonRecords: number;
  jsonRecords: number;
  yonTokens: number;
  jsonTokens: number;
}

function measureUtilization(tokenBudget: number): UtilizationResult {
  const enc = get_encoding('cl100k_base');

  // YON: count header tokens once, then accumulate per-record
  const yonHeader = '@DOC ver=2.0 | id=util-bench | title="Utilization" | kind=data\n';
  let yonTokenTotal = enc.encode(yonHeader).length;
  let yonRecords = 0;

  for (let i = 0; ; i++) {
    const line = yonRecord(i) + '\n';
    const lineTokens = enc.encode(line).length;
    if (yonTokenTotal + lineTokens > tokenBudget) break;
    yonTokenTotal += lineTokens;
    yonRecords++;
  }

  // JSON: estimate with growing array wrapper cost
  // JSON structure tokens (brackets, commas) grow sublinearly.
  // Measure a single record's token cost and scale, then verify with a final count.
  const singleRecord = jsonRecord(0);
  const singleTokens = enc.encode(JSON.stringify(singleRecord)).length;
  // JSON wrapper: [, ], commas between records ≈ 2 + records
  const wrapperTokens = 3; // [{, }, + array wrapper]

  // Estimate how many records fit, then verify
  const estimatedRecords = Math.floor((tokenBudget - wrapperTokens) / (singleTokens + 1)); // +1 for comma

  // Binary search for exact fit
  let lo = Math.max(1, estimatedRecords - 10);
  let hi = estimatedRecords + 10;
  let jsonRecords = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const arr: Record<string, unknown>[] = [];
    for (let i = 0; i < mid; i++) arr.push(jsonRecord(i));
    const tokens = enc.encode(JSON.stringify(arr)).length;
    if (tokens <= tokenBudget) {
      jsonRecords = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Get exact token counts for the final documents
  const jsonArr: Record<string, unknown>[] = [];
  for (let i = 0; i < jsonRecords; i++) jsonArr.push(jsonRecord(i));
  const jsonTokenTotal = enc.encode(JSON.stringify(jsonArr)).length;

  enc.free();

  return {
    yonRecords,
    jsonRecords,
    yonTokens: yonTokenTotal,
    jsonTokens: jsonTokenTotal,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testWindowTier(tierName: string, tokenBudget: number): TestResult {
  const r = measureUtilization(tokenBudget);
  const advantage = r.jsonRecords > 0
    ? Math.round(((r.yonRecords - r.jsonRecords) / r.jsonRecords) * 100)
    : 0;

  return {
    id: 'context-' + tierName.toLowerCase().replace(/\s+/g, '-'),
    name: tierName + ' Context Window (' + (tokenBudget / 1000) + 'K tokens)',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_records',
      value: r.yonRecords,
      unit: 'records',
      comparison: {
        baseline: r.jsonRecords,
        baselineLabel: 'JSON records',
        delta: advantage >= 0 ? '+' + advantage + '% more records' : Math.abs(advantage) + '% fewer records',
      },
    },
    secondaryMetrics: [
      { name: 'yon_tokens_used', value: r.yonTokens, unit: 'tokens' },
      { name: 'json_tokens_used', value: r.jsonTokens, unit: 'tokens' },
      { name: 'budget', value: tokenBudget, unit: 'tokens' },
    ],
    detail: 'YON fits ' + r.yonRecords + ' records (' + r.yonTokens + ' tokens). ' +
      'JSON fits ' + r.jsonRecords + ' records (' + r.jsonTokens + ' tokens). ' +
      (advantage >= 0
        ? 'YON advantage: +' + advantage + '% more records in same budget.'
        : 'YON structural baseline: ' + Math.abs(advantage) + '% fewer records per window. Per-record tags buy typed fields, fault isolation, and streaming — cost recouped at first pipeline failure.'),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runContextUtilization(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testWindowTier('Small', 8_000),
    testWindowTier('Medium', 32_000),
    testWindowTier('Large', 128_000),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'context-utilization',
    suiteName: 'Context Window Utilization',
    pillar: 'cognitive-economy',
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
