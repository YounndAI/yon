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
 * Runner Tenets Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: TenetEngine API — extraction, merge precedence, callback paths.
 *
 * Tests:
 * 1. Extract @TENET records from YON text
 * 2. Runner/document merge precedence (immutable safety floor)
 * 3. onTenetCheck — allow callback path
 * 4. onTenetCheck — reject callback path
 * 5. No callback passthrough
 */

import { TenetEngine, extractTenets } from '@younndai/yon-runner';
import { parse } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testExtractTenets(): TestResult {
  const elapsed = startTimer();

  const doc = parse(`
@DOC ver=2.0 | kind=config | id=tenets-bench | title="Tenet Extraction" | profile=core
@TENET rid=tn:no-pii | level=L0 | content="Never emit PII" | precedence:int=100
@TENET rid=tn:cite | level=L2 | content="Cite sources" | precedence:int=50 | decay=0.1
  `);

  const tenets = extractTenets(doc.records, 'document');

  const durationMs = elapsed();
  const count = tenets.length;
  const hasNoPii = tenets.some((t) => t.rid === 'tn:no-pii' && t.level === 'L0' && t.precedence === 100);
  const hasCite = tenets.some((t) => t.rid === 'tn:cite' && t.level === 'L2' && t.precedence === 50);
  const passed = count === 2 && hasNoPii && hasCite;

  return {
    id: 'tenet-extraction',
    name: 'Extract @TENET Records',
    passed,
    metric: { name: 'extraction_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'count', value: count, unit: 'tenets' },
      { name: 'has_no_pii', value: hasNoPii ? 1 : 0, unit: 'bool' },
      { name: 'has_cite', value: hasCite ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '2 @TENET records extracted. L0 precedence=100, L2 precedence=50. Levels and precedence verified.'
      : `Count: ${count}, NoPII: ${hasNoPii}, Cite: ${hasCite}`,
  };
}

function testMergePrecedence(): TestResult {
  const elapsed = startTimer();

  const engine = new TenetEngine();

  // Runner tenet: L0, immutable safety floor
  engine.loadRunnerTenets([
    { rid: 'tn:safety', level: 'L0', content: 'Runner safety rule', precedence: 100, decay: 0, source: 'runner' },
  ]);

  // Document tries to override the same RID — should be rejected (additive only)
  engine.mergeDocumentTenets([
    { rid: 'tn:safety', level: 'L3', content: 'Weakened rule', precedence: 10, decay: 0, source: 'document' },
    { rid: 'tn:doc-only', level: 'L2', content: 'Doc-specific rule', precedence: 50, decay: 0, source: 'document' },
  ]);

  const all = engine.getAll();

  const durationMs = elapsed();
  const totalCount = all.length;
  const safetyTenet = all.find((t) => t.rid === 'tn:safety');
  const safetyIsRunner = safetyTenet?.source === 'runner';
  const safetyIsL0 = safetyTenet?.level === 'L0';
  const docOnlyPresent = all.some((t) => t.rid === 'tn:doc-only');
  const passed = totalCount === 2 && safetyIsRunner && safetyIsL0 && docOnlyPresent;

  return {
    id: 'tenet-merge-precedence',
    name: 'Merge Precedence (Safety Floor)',
    passed,
    metric: { name: 'precedence_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'total_tenets', value: totalCount, unit: 'tenets' },
      { name: 'safety_is_runner', value: safetyIsRunner ? 1 : 0, unit: 'bool' },
      { name: 'safety_is_L0', value: safetyIsL0 ? 1 : 0, unit: 'bool' },
      { name: 'doc_only_present', value: docOnlyPresent ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Runner tn:safety (L0) overrides document tn:safety (L3). Doc-only tn:doc-only added. Immutable safety floor verified.'
      : `Total: ${totalCount}, SafetyRunner: ${safetyIsRunner}, SafetyL0: ${safetyIsL0}`,
  };
}

async function testCheckAllow(): Promise<TestResult> {
  const elapsed = startTimer();

  const engine = new TenetEngine(
    async (_op, _args, _tenets) => true, // Allow everything
  );

  engine.loadRunnerTenets([
    { rid: 'tn:test', level: 'L2', content: 'Test tenet', precedence: 50, decay: 0, source: 'runner' },
  ]);

  const result = await engine.check('step:1', 'std:fs.read', { path: '/data' });

  const durationMs = elapsed();
  const passed = result === null;

  return {
    id: 'tenet-check-allow',
    name: 'onTenetCheck — Allow',
    passed,
    metric: { name: 'allow_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'result_null', value: result === null ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Callback returns true → check() returns null. Allow path verified.'
      : `Result: ${JSON.stringify(result)}`,
  };
}

async function testCheckReject(): Promise<TestResult> {
  const elapsed = startTimer();

  const engine = new TenetEngine(
    async (_op, _args, _tenets) => false, // Reject everything
  );

  engine.loadRunnerTenets([
    { rid: 'tn:strict', level: 'L0', content: 'Deny all', precedence: 100, decay: 0, source: 'runner' },
  ]);

  const result = await engine.check('step:1', 'std:dangerous.op', {});

  const durationMs = elapsed();
  const isError = result !== null;
  const hasMessage = result?.message.includes('rejected by tenet check') ?? false;
  const passed = isError && hasMessage;

  return {
    id: 'tenet-check-reject',
    name: 'onTenetCheck — Reject',
    passed,
    metric: { name: 'reject_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'is_error', value: isError ? 1 : 0, unit: 'bool' },
      { name: 'has_message', value: hasMessage ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Callback returns false → RunnerError with "rejected by tenet check". Reject path verified.'
      : `IsError: ${isError}, Message: ${result?.message}`,
  };
}

async function testNoCallbackPassthrough(): Promise<TestResult> {
  const elapsed = startTimer();

  const engine = new TenetEngine(); // No callback

  engine.loadRunnerTenets([
    { rid: 'tn:passive', level: 'L1', content: 'Stored but not enforced', precedence: 75, decay: 0, source: 'runner' },
  ]);

  const hasTenets = engine.hasTenets();
  const result = await engine.check('step:1', 'std:anything', {});

  const durationMs = elapsed();
  const passed = hasTenets && result === null;

  return {
    id: 'tenet-no-callback-passthrough',
    name: 'No Callback Passthrough',
    passed,
    metric: { name: 'passthrough_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'has_tenets', value: hasTenets ? 1 : 0, unit: 'bool' },
      { name: 'result_null', value: result === null ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Tenets loaded but no callback → check() returns null. Passthrough verified.'
      : `HasTenets: ${hasTenets}, Result: ${result}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testExtractTenets(),
    testMergePrecedence(),
    await testCheckAllow(),
    await testCheckReject(),
    await testNoCallbackPassthrough(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-tenets',
    suiteName: 'Runner Tenets',
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

export { run as runRunnerTenets };
