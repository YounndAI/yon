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
 * Runner Assertions & Safety Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: §6.1 (@CHECK), §6.2 (HALT/AbortSignal), §9.4 (@INPUT).
 *
 * Tests:
 * 1. @CHECK fail=ABORT halts workflow (E011)
 * 2. @CHECK fail=SKIP skips targeted step
 * 3. @CHECK fail=WARN continues execution
 * 4. HALT via AbortSignal produces E013
 * 5. Missing required @INPUT rejects workflow
 *
 * YON syntax aligned with runner integration test patterns (E2E-14..E2E-20).
 */

import { createRunner, type RunResult } from '@younndai/yon-runner';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testCheckAbort(): Promise<TestResult> {
  const runner = createRunner({
    permissions: [{ op: 'std:handler.*', action: 'ALLOW' }],
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-abort | title="Check Abort" | profile=exec
@CHECK rid=check:guard | assert="block:nonexistent != null" | fail=ABORT | msg="Block not found"
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="should never run"]
`);

  const aborted = !result.success;
  const hasE106 = result.errors.some((e) => e.code === 'E106');
  const stepNotRun = !result.steps.some((s) => s.success && s.durationMs > 0);
  const passed = aborted && hasE106 && stepNotRun;

  return {
    id: 'check-abort-halts',
    name: '@CHECK fail=ABORT Halts Workflow',
    passed,
    metric: { name: 'abort_enforced', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `@CHECK assert="block:nonexistent != null" fail=ABORT. ` +
      `Aborted: ${aborted}. E106: ${hasE106}. Step blocked: ${stepNotRun}. ` +
      `ABORT enforcement: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testCheckSkip(): Promise<TestResult> {
  const runner = createRunner({
    permissions: [{ op: 'std:handler.*', action: 'ALLOW' }],
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-skip | title="Check Skip" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="always runs"]
@CHECK rid=check:gate | assert="block:trigger != null" | fail=SKIP | target=s2
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[msg="should be skipped"]
@STEP n:int=3 | rid=s3 | op=std:handler.notify@v1 | args=[msg="continues"]
`);

  const skipStamps = result.stamps.filter(
    (s) => s.event === 'step:skipped' && s.rid === 's2',
  );
  const s1Ran = result.stamps.some((s) => s.event === 'step:start' && s.rid === 's1');
  const s3Ran = result.stamps.some((s) => s.event === 'step:start' && s.rid === 's3');
  const passed = result.success && skipStamps.length > 0 && s1Ran && s3Ran;

  return {
    id: 'check-skip-continues',
    name: '@CHECK fail=SKIP Skips Step',
    passed,
    metric: { name: 'skip_correct', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `@CHECK fail=SKIP target=s2. ` +
      `s1 ran: ${s1Ran}. s2 skipped: ${skipStamps.length > 0}. s3 ran: ${s3Ran}. ` +
      `SKIP enforcement: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testCheckWarn(): Promise<TestResult> {
  const runner = createRunner({
    permissions: [{ op: 'std:handler.*', action: 'ALLOW' }],
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-warn | title="Check Warn" | profile=exec
@CHECK rid=check:advisory | assert="false" | fail=WARN | msg="Advisory warning"
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="runs despite warning"]
`);

  const warnStamp = result.stamps.some((s) => s.event === 'check:failed');
  const stepRan = result.stamps.some((s) => s.event === 'step:start' && s.rid === 's1');
  const passed = result.success && warnStamp && stepRan;

  return {
    id: 'check-warn-continues',
    name: '@CHECK fail=WARN Continues',
    passed,
    metric: { name: 'warn_advisory_correct', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `@CHECK assert="false" fail=WARN. ` +
      `Warning emitted: ${warnStamp}. Step ran: ${stepRan}. ` +
      `WARN behavior: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testHaltAbortSignal(): Promise<TestResult> {
  const controller = new AbortController();

  const runner = createRunner({
    permissions: [{ op: 'bench:*', action: 'ALLOW' }],
    signal: controller.signal,
  });

  runner.registerPlugin({
    namespace: 'bench',
    ops: {
      abort_trigger: async () => {
        controller.abort();
        return 'done';
      },
      never_runs: async () => 'should not reach',
    },
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=halt-bench | title="Halt Bench" | profile=exec
@STEP n:int=1 | rid=s1 | op=bench:abort_trigger@v1
@STEP n:int=2 | rid=s2 | op=bench:never_runs@v1
`);

  const s1Started = result.stamps.some((s) => s.event === 'step:start' && s.rid === 's1');
  const s2NotStarted = !result.stamps.some((s) => s.event === 'step:start' && s.rid === 's2');
  const haltStamp = result.stamps.some((s) => s.event === 'workflow:cancelled');
  const hasE108 = result.errors.some((e) => e.code === 'E108');
  const passed = s1Started && s2NotStarted && haltStamp && hasE108;

  return {
    id: 'halt-abort-signal',
    name: 'HALT via AbortSignal (E108)',
    passed,
    metric: { name: 'halt_enforced', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `AbortSignal.abort() mid-execution. ` +
      `s1 started: ${s1Started}. s2 blocked: ${s2NotStarted}. ` +
      `E108: ${hasE108}. cancelled stamp: ${haltStamp}. ` +
      `HALT enforcement: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testInputContractValidation(): Promise<TestResult> {
  const runner = createRunner({
    permissions: [{ op: 'std:handler.*', action: 'ALLOW' }],
  });

  // Run WITHOUT providing the required input
  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=input-bench | title="Input Bench" | profile=exec
@INPUT rid=in:data | name=source_data
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1
`);

  const failed = !result.success;
  const hasInputError = result.errors.some(
    (e) => e.message.includes('Missing required') && e.message.includes('source_data'),
  );
  const passed = failed && hasInputError;

  return {
    id: 'input-contract-validation',
    name: '@INPUT Contract Enforcement',
    passed,
    metric: { name: 'contract_enforced', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `@INPUT name=source_data (required by default). No value provided. ` +
      `Workflow rejected: ${failed}. Input error: ${hasInputError}. ` +
      `Contract enforcement: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    await testCheckAbort(),
    await testCheckSkip(),
    await testCheckWarn(),
    await testHaltAbortSignal(),
    await testInputContractValidation(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-assertions',
    suiteName: 'Runner Assertions & Safety',
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

export { run as runAssertions };
