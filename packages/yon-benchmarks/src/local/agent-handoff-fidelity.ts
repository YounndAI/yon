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
 * Agent Handoff Fidelity Suite
 *
 * Pillar: Streaming
 * Validates: Structured records survive A→B→C agent streaming handoff.
 *
 * Tests:
 * 1. handoff-completeness — All records survive 3-hop relay
 * 2. handoff-field-preservation — Every field intact after relay
 * 3. handoff-ordering — Record ordering preserved through 3 hops
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RECORD_COUNT = 200;

function buildAgentPayload(agentId: string, count: number): string {
  const lines: string[] = [];
  lines.push(`@DOC ver=2.0 | id=handoff-${agentId} | title="Agent ${agentId} Payload" | kind=data`);
  for (let i = 0; i < count; i++) {
    lines.push(
      `@MAP id=rec-${i} | agent:str="${agentId}" | seq:int=${i} | payload:str="data-${agentId}-${i}" | active:bool=true`,
    );
  }
  return lines.join('\n');
}

/** Simulate streaming through an agent: parse → re-emit → return as string */
function agentHop(input: string): { output: string; records: number; errors: number } {
  const records: Array<{ tag: string; fields: Map<string, unknown> }> = [];
  let errors = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'error') { errors++; return; }
      if (event.type === 'record') records.push(event.record);
    },
  });

  for (const line of input.split('\n')) {
    try { parser.write(line + '\n'); } catch { errors++; }
  }
  try { parser.end(); } catch { /* ok */ }

  // Re-emit as YON (simulating agent forwarding)
  const outputLines: string[] = [];
  for (const rec of records) {
    const fields = Array.from(rec.fields.entries())
      .map(([k, v]) => `${k}=${typeof v === 'string' ? `"${v}"` : v}`)
      .join(' | ');
    outputLines.push(`@${rec.tag} ${fields}`);
  }
  return { output: outputLines.join('\n'), records: records.length - 1, errors }; // -1 for DOC
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testHandoffCompleteness(): TestResult {
  const payload = buildAgentPayload('A', RECORD_COUNT);

  // 3-hop relay: A → B → C
  const hop1 = agentHop(payload);
  const hop2 = agentHop(hop1.output);
  const hop3 = agentHop(hop2.output);

  const completeness = Math.round((hop3.records / RECORD_COUNT) * 100 * 10) / 10;

  return {
    id: 'handoff-completeness',
    name: '3-Hop Handoff — Record Completeness',
    passed: hop3.records === RECORD_COUNT,
    metric: {
      name: 'handoff_completeness',
      value: completeness,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'hop1_records', value: hop1.records, unit: 'records' },
      { name: 'hop2_records', value: hop2.records, unit: 'records' },
      { name: 'hop3_records', value: hop3.records, unit: 'records' },
      { name: 'total_errors', value: hop1.errors + hop2.errors + hop3.errors, unit: 'errors' },
    ],
    detail:
      `Relayed ${RECORD_COUNT} records through 3 streaming hops. ` +
      `Hop 1: ${hop1.records}, Hop 2: ${hop2.records}, Hop 3: ${hop3.records}. ` +
      `Completeness: ${completeness}%.`,
  };
}

function testFieldPreservation(): TestResult {
  const payload = buildAgentPayload('A', 50);
  const hop1 = agentHop(payload);
  const hop2 = agentHop(hop1.output);
  const hop3 = agentHop(hop2.output);

  // Parse final output and check fields
  const finalRecords: Array<{ fields: Map<string, unknown> }> = [];
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') {
        finalRecords.push(event.record);
      }
    },
  });
  for (const line of hop3.output.split('\n')) {
    try { parser.write(line + '\n'); } catch { /* skip */ }
  }
  try { parser.end(); } catch { /* ok */ }

  // Check that all expected fields exist
  let fieldsIntact = 0;
  const expectedFields = ['id', 'agent', 'seq', 'payload', 'active'];
  for (const rec of finalRecords) {
    const hasAll = expectedFields.every((f) => rec.fields.has(f));
    if (hasAll) fieldsIntact++;
  }

  const preservationPct = finalRecords.length > 0
    ? Math.round((fieldsIntact / finalRecords.length) * 100)
    : 0;

  return {
    id: 'handoff-field-preservation',
    name: '3-Hop Handoff — Field Preservation',
    passed: preservationPct >= 95,
    metric: {
      name: 'field_preservation',
      value: preservationPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'records_checked', value: finalRecords.length, unit: 'records' },
      { name: 'fields_intact', value: fieldsIntact, unit: 'records' },
    ],
    detail:
      `Checked ${expectedFields.length} fields across ${finalRecords.length} records after 3 hops. ` +
      `${fieldsIntact}/${finalRecords.length} records had all fields intact (${preservationPct}%).`,
  };
}

function testOrderingIntegrity(): TestResult {
  const payload = buildAgentPayload('A', RECORD_COUNT);
  const hop1 = agentHop(payload);
  const hop2 = agentHop(hop1.output);
  const hop3 = agentHop(hop2.output);

  // Parse final output and check ordering
  const seqValues: number[] = [];
  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') {
        const seq = event.record.fields.get('seq');
        if (seq != null) seqValues.push(Number(seq));
      }
    },
  });
  for (const line of hop3.output.split('\n')) {
    try { parser.write(line + '\n'); } catch { /* skip */ }
  }
  try { parser.end(); } catch { /* ok */ }

  let inOrder = 0;
  for (let i = 1; i < seqValues.length; i++) {
    if (seqValues[i]! > seqValues[i - 1]!) inOrder++;
  }
  const orderingPct = seqValues.length > 1
    ? Math.round((inOrder / (seqValues.length - 1)) * 100)
    : 100;

  return {
    id: 'handoff-ordering',
    name: '3-Hop Handoff — Ordering Integrity',
    passed: orderingPct === 100,
    metric: {
      name: 'ordering_integrity',
      value: orderingPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'sequence_pairs_checked', value: seqValues.length > 0 ? seqValues.length - 1 : 0, unit: 'pairs' },
      { name: 'in_order', value: inOrder, unit: 'pairs' },
    ],
    detail:
      `Checked ${seqValues.length} records for ordering after 3-hop relay. ` +
      `${inOrder}/${seqValues.length > 0 ? seqValues.length - 1 : 0} sequential pairs in order (${orderingPct}%).`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runAgentHandoffFidelity(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testHandoffCompleteness(),
    testFieldPreservation(),
    testOrderingIntegrity(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'agent-handoff-fidelity',
    suiteName: 'Agent Handoff Fidelity',
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
