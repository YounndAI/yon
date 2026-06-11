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
 * Streaming Fault Boundary Suite
 *
 * Pillar: Streaming
 * Validates: Line independence — a corrupt line costs exactly one record.
 *
 * Tests the NEW accumulate:false streaming path under transport-level corruption.
 * Differs from error-recovery (batch parseLine) and multi-hop-resilience (3-hop).
 *
 * Tests:
 * 1. fault-single-line — Corrupt 1 of 1000 data lines → 999 recovered + 1 error
 * 2. fault-multi-point — Corrupt 5 random data lines → 995 recovered + 5 errors
 * 3. fault-boundary-isolation — Adjacent records intact
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DATA_RECORD_COUNT = 1000;

function buildYonDocument(count: number): string[] {
  const lines: string[] = [];
  lines.push('@DOC ver=2.0 | id=fault-bench | title="Fault Boundary" | kind=data');
  for (let i = 0; i < count; i++) {
    lines.push(`@MAP id=rec-${i} | name="Record ${i}" | value:int=${i} | active:bool=true`);
  }
  return lines;
}

function corruptLines(lines: string[], indices: number[]): string[] {
  const copy = [...lines];
  for (const idx of indices) {
    // +1 to skip @DOC header line
    const lineIdx = idx + 1;
    if (lineIdx < copy.length) {
      copy[lineIdx] = `!!!CORRUPT!!!GARBAGE__${idx}__broken__data__###`;
    }
  }
  return copy;
}

interface FaultResult {
  dataRecords: number;
  errorEvents: number;
  /** Map of record index → true if recovered */
  recoveredIndices: Map<number, boolean>;
}

function streamAndRecover(lines: string[]): FaultResult {
  let dataRecords = 0;
  let errorEvents = 0;
  const recoveredIndices = new Map<number, boolean>();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'error') {
        errorEvents++;
        return;
      }
      if (event.type === 'record' && event.record.tag !== 'DOC') {
        dataRecords++;
        const idField = event.record.fields.get('id');
        if (idField) {
          const match = String(idField).match(/rec-(\d+)/);
          if (match) {
            recoveredIndices.set(Number(match[1]), true);
          }
        }
      }
    },
  });

  for (const line of lines) {
    try {
      parser.write(line + '\n');
    } catch {
      // Corruption isolated — parser emits error event
      errorEvents++;
    }
  }

  try { parser.end(); } catch { /* ok */ }
  return { dataRecords, errorEvents, recoveredIndices };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testFaultSingleLine(): TestResult {
  const lines = buildYonDocument(DATA_RECORD_COUNT);
  const corruptIdx = 500;
  const corrupted = corruptLines(lines, [corruptIdx]);
  const result = streamAndRecover(corrupted);

  const expectedRecords = DATA_RECORD_COUNT - 1;
  const recoveryPct = Math.round((result.dataRecords / DATA_RECORD_COUNT) * 100 * 10) / 10;

  return {
    id: 'fault-single-line',
    name: 'Single Line Corruption → N-1 Recovery',
    passed: result.dataRecords === expectedRecords && result.errorEvents >= 1,
    metric: {
      name: 'fault_recovery_rate',
      value: recoveryPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'data_records_recovered', value: result.dataRecords, unit: 'records' },
      { name: 'error_events_count', value: result.errorEvents, unit: 'errors' },
      { name: 'corrupt_lines', value: 1, unit: 'lines' },
    ],
    detail:
      `Corrupted 1 of ${DATA_RECORD_COUNT} data lines (index ${corruptIdx}). ` +
      `Recovered: ${result.dataRecords}/${DATA_RECORD_COUNT} data records (${recoveryPct}%). ` +
      `Error events: ${result.errorEvents}. ` +
      `Line independence: a corrupt line costs exactly one record.`,
  };
}

function testFaultMultiPoint(): TestResult {
  const corruptIndices = [50, 200, 500, 750, 950];
  const lines = buildYonDocument(DATA_RECORD_COUNT);
  const corrupted = corruptLines(lines, corruptIndices);
  const result = streamAndRecover(corrupted);

  const expectedRecords = DATA_RECORD_COUNT - corruptIndices.length;
  const recoveryPct = Math.round((result.dataRecords / DATA_RECORD_COUNT) * 100 * 10) / 10;

  return {
    id: 'fault-multi-point',
    name: `${corruptIndices.length}-Point Corruption → N-${corruptIndices.length} Recovery`,
    passed: result.dataRecords === expectedRecords,
    metric: {
      name: 'fault_recovery_rate',
      value: recoveryPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'data_records_recovered', value: result.dataRecords, unit: 'records' },
      { name: 'error_events_count', value: result.errorEvents, unit: 'errors' },
      { name: 'corrupt_lines', value: corruptIndices.length, unit: 'lines' },
    ],
    detail:
      `Corrupted ${corruptIndices.length} data lines at indices [${corruptIndices.join(', ')}]. ` +
      `Recovered: ${result.dataRecords}/${DATA_RECORD_COUNT} data records (${recoveryPct}%). ` +
      `Error events: ${result.errorEvents}. Each fault costs exactly one record.`,
  };
}

function testFaultBoundaryIsolation(): TestResult {
  const corruptIdx = 500;
  const lines = buildYonDocument(DATA_RECORD_COUNT);
  const corrupted = corruptLines(lines, [corruptIdx]);
  const result = streamAndRecover(corrupted);

  // Check that records immediately before and after the corrupt line survived
  const beforeIntact = result.recoveredIndices.has(corruptIdx - 1);
  const afterIntact = result.recoveredIndices.has(corruptIdx + 1);
  const corruptMissing = !result.recoveredIndices.has(corruptIdx);
  const adjacentIntact = beforeIntact && afterIntact && corruptMissing;

  return {
    id: 'fault-boundary-isolation',
    name: 'Fault Boundary Isolation — Adjacent Records Intact',
    passed: adjacentIntact,
    metric: {
      name: 'fault_isolation',
      value: adjacentIntact ? 1 : 0,
      unit: 'pass/fail',
    },
    secondaryMetrics: [
      { name: 'before_intact', value: beforeIntact ? 1 : 0, unit: 'bool' },
      { name: 'after_intact', value: afterIntact ? 1 : 0, unit: 'bool' },
      { name: 'corrupt_absent', value: corruptMissing ? 1 : 0, unit: 'bool' },
    ],
    detail:
      `Corruption at index ${corruptIdx}. ` +
      `Record ${corruptIdx - 1} (before): ${beforeIntact ? 'INTACT' : 'MISSING'}. ` +
      `Record ${corruptIdx} (corrupt): ${corruptMissing ? 'CORRECTLY ABSENT' : 'UNEXPECTEDLY PRESENT'}. ` +
      `Record ${corruptIdx + 1} (after): ${afterIntact ? 'INTACT' : 'MISSING'}. ` +
      `Fault boundary is exactly one line — no cascade.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runStreamingFaultBoundary(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testFaultSingleLine(),
    testFaultMultiPoint(),
    testFaultBoundaryIsolation(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'streaming-fault-boundary',
    suiteName: 'Streaming Fault Boundary',
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
