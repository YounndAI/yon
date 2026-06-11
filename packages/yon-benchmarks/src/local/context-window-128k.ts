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
 * Context Window Efficiency 128K Suite
 *
 * Pillar: Cognitive Economy
 * Category: local (simulated — uses token counting, no LLM calls)
 * Validates: YON vs JSON density at 128K context window scale.
 *
 * Tests:
 * 1. context-128k-records — How many records fit in 128K tokens?
 * 2. context-128k-density — Tokens per record at scale
 * 3. context-128k-overhead — YON structural overhead vs JSON at large scale
 */

import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers — simple token estimation (4 chars ≈ 1 token for English text)
// ---------------------------------------------------------------------------

const TARGET_TOKENS = 128_000;
const CHARS_PER_TOKEN = 4; // Conservative estimate for cl100k_base

function buildYonRecord(i: number): string {
  return `@MAP id=item-${i} | name:str="Product ${i}" | category:str="electronics" | price:int=${(i * 7 + 13) % 9999} | description:str="High-quality item #${i} for daily use" | in_stock:bool=${i % 3 !== 0}`;
}

function buildJsonRecord(i: number): object {
  return {
    id: `item-${i}`,
    name: `Product ${i}`,
    category: 'electronics',
    price: (i * 7 + 13) % 9999,
    description: `High-quality item #${i} for daily use`,
    in_stock: i % 3 !== 0,
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testRecordCapacity(): TestResult {
  // Build records until we fill 128K tokens
  let yonText = '@DOC ver=2.0 | id=context-128k | title="128K Test" | kind=data\n';
  let yonRecords = 0;
  while (estimateTokens(yonText) < TARGET_TOKENS) {
    yonText += buildYonRecord(yonRecords) + '\n';
    yonRecords++;
  }
  yonRecords--; // Last one exceeded

  const jsonItems: object[] = [];
  let jsonRecords = 0;
  let jsonText = '';
  while (estimateTokens(jsonText) < TARGET_TOKENS) {
    jsonItems.push(buildJsonRecord(jsonRecords));
    jsonText = JSON.stringify(jsonItems, null, 2);
    jsonRecords++;
  }
  jsonRecords--; // Last one exceeded

  const delta = Math.round(((jsonRecords - yonRecords) / jsonRecords) * 100);

  return {
    id: 'context-128k-records',
    name: '128K Context Window — Record Capacity',
    passed: true, // Informational
    metric: {
      name: 'yon_records_128k',
      value: yonRecords,
      unit: 'records',
      comparison: {
        baseline: jsonRecords,
        baselineLabel: 'JSON records at 128K',
        delta: `${yonRecords - jsonRecords} records`,
      },
    },
    secondaryMetrics: [
      { name: 'json_records_128k', value: jsonRecords, unit: 'records' },
      { name: 'capacity_delta', value: delta, unit: '%' },
    ],
    outcome: yonRecords >= jsonRecords ? 'advantage' : yonRecords >= jsonRecords * 0.9 ? 'tied' : 'disadvantage',
    detail:
      `At 128K tokens: YON fits ${yonRecords} records, JSON fits ${jsonRecords} records. ` +
      `Delta: ${delta}%. YON's per-line tags are structural cost; JSON's nesting compresses at scale.`,
  };
}

function testDensityPerRecord(): TestResult {
  const yonRecord = buildYonRecord(42);
  const jsonRecord = JSON.stringify(buildJsonRecord(42));

  const yonTokens = estimateTokens(yonRecord);
  const jsonTokens = estimateTokens(jsonRecord);
  const ratio = Math.round((yonTokens / jsonTokens) * 100);

  return {
    id: 'context-128k-density',
    name: '128K Context Window — Tokens per Record',
    passed: true, // Informational
    metric: {
      name: 'yon_tokens_per_record',
      value: yonTokens,
      unit: 'tokens',
      comparison: {
        baseline: jsonTokens,
        baselineLabel: 'JSON tokens per record',
        delta: `${ratio - 100}%`,
      },
    },
    secondaryMetrics: [
      { name: 'json_tokens_per_record', value: jsonTokens, unit: 'tokens' },
      { name: 'overhead_ratio', value: ratio, unit: '%' },
    ],
    outcome: ratio <= 110 ? 'tied' : 'disadvantage',
    detail:
      `Per-record density: YON ${yonTokens} tokens, JSON ${jsonTokens} tokens (${ratio}% of JSON). ` +
      `YON tag overhead (@MAP, type suffixes) adds structural cost per record.`,
  };
}

function testStructuralOverhead(): TestResult {
  // At 1000 records, compare total overhead
  const yonLines = ['@DOC ver=2.0 | id=overhead-test | title="Overhead" | kind=data'];
  for (let i = 0; i < 1000; i++) yonLines.push(buildYonRecord(i));
  const yonText = yonLines.join('\n');

  const jsonItems = [];
  for (let i = 0; i < 1000; i++) jsonItems.push(buildJsonRecord(i));
  const jsonText = JSON.stringify(jsonItems, null, 2);

  const yonTokens = estimateTokens(yonText);
  const jsonTokens = estimateTokens(jsonText);
  const overheadPct = Math.round(((yonTokens - jsonTokens) / jsonTokens) * 100);

  return {
    id: 'context-128k-overhead',
    name: '128K Context Window — Structural Overhead at Scale',
    passed: true, // Informational — overhead is an operational characteristic
    metric: {
      name: 'structural_overhead_pct',
      value: overheadPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'yon_total_tokens', value: yonTokens, unit: 'tokens' },
      { name: 'json_total_tokens', value: jsonTokens, unit: 'tokens' },
      { name: 'records_measured', value: 1000, unit: 'records' },
    ],
    outcome: overheadPct <= 15 ? 'tied' : 'disadvantage',
    detail:
      `At 1000 records: YON ${yonTokens} tokens, JSON ${jsonTokens} tokens (+${overheadPct}% overhead). ` +
      `This is the structural baseline that buys recoverability, explicit typing, and streaming.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runContextWindow128K(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testRecordCapacity(),
    testDensityPerRecord(),
    testStructuralOverhead(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'context-window-128k',
    suiteName: 'Context Window Efficiency 128K',
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
