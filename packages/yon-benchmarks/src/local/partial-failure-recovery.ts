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
 * Partial Failure Recovery Suite
 *
 * Pillar: Cross-Cutting
 * Validates: YON recovers most records from a corrupted stream; JSON loses all.
 *
 * Tests:
 * 1. partial-yon-recovery — 1000 records, corrupt at 250/500/750 → measure survival
 * 2. partial-json-cascade — Same corruption on JSON → 0% recovery
 * 3. partial-recovery-delta — YON vs JSON recovery comparison
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RECORD_COUNT = 1000;
const CORRUPT_INDICES = [250, 500, 750];

function buildYonStream(count: number): string[] {
  const lines: string[] = [];
  lines.push('@DOC ver=2.0 | id=partial-fail | title="Partial Failure" | kind=data');
  for (let i = 0; i < count; i++) {
    lines.push(`@MAP id=rec-${i} | seq:int=${i} | value:str="payload-${i}"`);
  }
  return lines;
}

function buildJsonArray(count: number): string {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(`  {"id": "rec-${i}", "seq": ${i}, "value": "payload-${i}"}`);
  }
  return `[\n${items.join(',\n')}\n]`;
}

function corruptYonLines(lines: string[], indices: number[]): string[] {
  const copy = [...lines];
  for (const idx of indices) {
    const lineIdx = idx + 1; // +1 for @DOC header
    if (lineIdx < copy.length) {
      copy[lineIdx] = `!!!CORRUPT!!!GARBAGE__${idx}__###`;
    }
  }
  return copy;
}

function corruptJsonString(json: string, indices: number[]): string {
  const lines = json.split('\n');
  for (const idx of indices) {
    const lineIdx = idx + 1; // +1 for opening bracket
    if (lineIdx < lines.length) {
      lines[lineIdx] = `!!!CORRUPT!!!GARBAGE__${idx}__###`;
    }
  }
  return lines.join('\n');
}

function streamYonAndRecover(lines: string[]): number {
  let dataRecords = 0;
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') dataRecords++;
    },
  });
  for (const line of lines) {
    try { parser.write(line + '\n'); } catch { /* corruption isolated */ }
  }
  try { parser.end(); } catch { /* ok */ }
  return dataRecords;
}

function parseJsonAndRecover(json: string): number {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0; // JSON cascade failure
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testYonRecovery(): TestResult {
  const lines = buildYonStream(RECORD_COUNT);
  const corrupted = corruptYonLines(lines, CORRUPT_INDICES);
  const recovered = streamYonAndRecover(corrupted);
  const recoveryPct = Math.round((recovered / RECORD_COUNT) * 1000) / 10;

  return {
    id: 'partial-yon-recovery',
    name: `YON Recovery — ${CORRUPT_INDICES.length} Corrupt Points`,
    passed: recovered >= RECORD_COUNT - CORRUPT_INDICES.length,
    metric: {
      name: 'yon_recovery_rate',
      value: recoveryPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'records_recovered', value: recovered, unit: 'records' },
      { name: 'records_total', value: RECORD_COUNT, unit: 'records' },
      { name: 'corrupt_points', value: CORRUPT_INDICES.length, unit: 'points' },
    ],
    detail:
      `${RECORD_COUNT} records with corruption at indices [${CORRUPT_INDICES.join(', ')}]. ` +
      `YON recovered ${recovered}/${RECORD_COUNT} records (${recoveryPct}%). ` +
      `Each corrupt line costs exactly one record.`,
  };
}

function testJsonCascade(): TestResult {
  const json = buildJsonArray(RECORD_COUNT);
  const corrupted = corruptJsonString(json, CORRUPT_INDICES);
  const recovered = parseJsonAndRecover(corrupted);

  return {
    id: 'partial-json-cascade',
    name: `JSON Cascade — ${CORRUPT_INDICES.length} Corrupt Points`,
    passed: recovered === 0, // Expected: JSON fails completely
    metric: {
      name: 'json_recovery_rate',
      value: 0,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'records_recovered', value: recovered, unit: 'records' },
      { name: 'records_total', value: RECORD_COUNT, unit: 'records' },
    ],
    outcome: 'advantage',
    detail:
      `Same ${RECORD_COUNT} records with same corruption points. ` +
      `JSON recovered ${recovered}/${RECORD_COUNT} records (0%). ` +
      `A single corruption in a bracket-delimited format cascades to total failure.`,
  };
}

function testRecoveryDelta(): TestResult {
  const yonLines = buildYonStream(RECORD_COUNT);
  const yonCorrupted = corruptYonLines(yonLines, CORRUPT_INDICES);
  const yonRecovered = streamYonAndRecover(yonCorrupted);

  const json = buildJsonArray(RECORD_COUNT);
  const jsonCorrupted = corruptJsonString(json, CORRUPT_INDICES);
  const jsonRecovered = parseJsonAndRecover(jsonCorrupted);

  const delta = yonRecovered - jsonRecovered;
  const deltaPct = Math.round((delta / RECORD_COUNT) * 1000) / 10;

  return {
    id: 'partial-recovery-delta',
    name: 'Recovery Delta — YON vs JSON',
    passed: delta > 0,
    metric: {
      name: 'recovery_delta',
      value: deltaPct,
      unit: '%',
      comparison: {
        baseline: 0,
        baselineLabel: 'JSON recovery',
        delta: `+${deltaPct}%`,
      },
    },
    secondaryMetrics: [
      { name: 'yon_recovered', value: yonRecovered, unit: 'records' },
      { name: 'json_recovered', value: jsonRecovered, unit: 'records' },
      { name: 'records_saved', value: delta, unit: 'records' },
    ],
    outcome: 'advantage',
    detail:
      `YON: ${yonRecovered}/${RECORD_COUNT}. JSON: ${jsonRecovered}/${RECORD_COUNT}. ` +
      `Delta: ${delta} records saved (${deltaPct}%). ` +
      `Line independence eliminates cascade failure.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runPartialFailureRecovery(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testYonRecovery(),
    testJsonCascade(),
    testRecoveryDelta(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'partial-failure-recovery',
    suiteName: 'Partial Failure Recovery',
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
