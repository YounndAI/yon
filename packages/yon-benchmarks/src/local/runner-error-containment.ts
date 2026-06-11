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
 * Runner Error Containment Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: §6 — @CATCH/@RETRY prevent cascading failures.
 *
 * Tests:
 * 1. @CATCH triggers fallback step on error
 * 2. @CATCH selective matching (on="timeout|permission")
 * 3. @RETRY respects backoff strategy (exponential)
 * 4. @RETRY stops at configured max attempts
 *
 * YON syntax aligned with runner integration test patterns (E2E-17..E2E-19).
 */

import { createRunner, type RunResult } from '@younndai/yon-runner';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BENCH_PERMS = [
  { op: 'bench:*', action: 'ALLOW' as const },
  { op: 'std:handler.*', action: 'ALLOW' as const },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testCatchFallbackExecution(): Promise<TestResult> {
  const runner = createRunner({ permissions: BENCH_PERMS });
  runner.registerPlugin({
    namespace: 'bench',
    ops: {
      fail: async () => { throw new Error('Intentional failure for @CATCH test'); },
    },
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=catch-bench | title="Catch Bench" | profile=exec
@STEP n:int=1 | rid=s1 | op=bench:fail@v1
@STEP n:int=2 | rid=fallback | op=std:handler.notify@v1 | args=[msg="recovered"]
@CATCH target=s1 | do=fallback
`);

  const catchStamp = result.stamps.some((s) => s.event === 'catch:triggered');
  const fallbackRan = result.steps.some((s) => s.rid === 'fallback' && s.success);
  const passed = result.success && catchStamp && fallbackRan;

  return {
    id: 'catch-fallback-execution',
    name: '@CATCH Fallback Execution',
    passed,
    metric: { name: 'fallback_triggered', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `bench:fail throws → @CATCH target=s1 → do=fallback. ` +
      `Catch triggered: ${catchStamp}. Fallback ran: ${fallbackRan}. ` +
      `Error containment: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testCatchSelectiveMatching(): Promise<TestResult> {
  const runner = createRunner({ permissions: BENCH_PERMS });
  runner.registerPlugin({
    namespace: 'bench',
    ops: {
      fail: async () => { throw new Error('Runtime error, not timeout'); },
    },
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=catch-filter | title="Catch Filter" | profile=exec
@STEP n:int=1 | rid=s1 | op=bench:fail@v1
@STEP n:int=2 | rid=fallback | op=std:handler.notify@v1 | args=[msg="should not run"]
@CATCH target=s1 | on=timeout | do=fallback
`);

  // E012 runtime error doesn't match "timeout" → catch skips → unhandled error
  const catchTriggered = result.stamps.some((s) => s.event === 'catch:triggered');
  const passed = !result.success && !catchTriggered;

  return {
    id: 'catch-selective-matching',
    name: '@CATCH Selective Matching (on= filter)',
    passed,
    metric: { name: 'selective_filter_correct', value: passed ? 1 : 0, unit: 'bool' },
    detail:
      `@CATCH on=timeout should NOT catch runtime errors. ` +
      `Catch triggered: ${catchTriggered} (expected: false). ` +
      `Workflow failed: ${!result.success} (expected: true). ` +
      `Selective matching: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testRetryBackoffStrategy(): Promise<TestResult> {
  let attemptCount = 0;
  const attemptTimestamps: number[] = [];

  const runner = createRunner({ permissions: BENCH_PERMS });
  runner.registerPlugin({
    namespace: 'bench',
    ops: {
      flaky: async () => {
        attemptCount++;
        attemptTimestamps.push(performance.now());
        throw new Error(`Retry test failure #${attemptCount}`);
      },
    },
  });

  await runner.run(`
@DOC ver=2.0 | kind=workflow | id=retry-bench | title="Retry Bench" | profile=exec
@STEP n:int=1 | rid=s1 | op=bench:flaky@v1
@RETRY target=s1 | max:int=3 | delay_ms:int=20 | backoff=exponential
`);

  // max=3 means 4 total attempts (1 original + 3 retries)
  const expectedAttempts = 4;
  const attemptsCorrect = attemptCount === expectedAttempts;

  // Check that delays are increasing (exponential)
  let delaysIncreasing = true;
  if (attemptTimestamps.length >= 4) {
    const gap1 = attemptTimestamps[2]! - attemptTimestamps[1]!;
    const gap2 = attemptTimestamps[3]! - attemptTimestamps[2]!;
    delaysIncreasing = gap2 > gap1 * 1.3;
  }

  const passed = attemptsCorrect && delaysIncreasing;

  return {
    id: 'retry-backoff-strategy',
    name: '@RETRY Exponential Backoff',
    passed,
    metric: { name: 'retry_attempts', value: attemptCount, unit: `/${expectedAttempts}` },
    secondaryMetrics: [
      { name: 'delays_increasing', value: delaysIncreasing ? 1 : 0, unit: 'bool' },
    ],
    detail:
      `@RETRY max=3 backoff=exponential delay_ms=20. ` +
      `Attempts: ${attemptCount}/${expectedAttempts}. ` +
      `Delays increasing: ${delaysIncreasing}. ` +
      `Backoff: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testRetryMaxAttempts(): Promise<TestResult> {
  let attemptCount = 0;

  const runner = createRunner({ permissions: BENCH_PERMS });
  runner.registerPlugin({
    namespace: 'bench',
    ops: {
      flaky: async () => {
        attemptCount++;
        throw new Error(`Max retry test #${attemptCount}`);
      },
    },
  });

  const result: RunResult = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=retry-max | title="Retry Max" | profile=exec
@STEP n:int=1 | rid=s1 | op=bench:flaky@v1
@RETRY target=s1 | max:int=2 | delay_ms:int=0 | backoff=none
`);

  // max=2 → 3 total attempts (1 original + 2 retries)
  const expectedAttempts = 3;
  const attemptsCorrect = attemptCount === expectedAttempts;
  const passed = attemptsCorrect && !result.success;

  return {
    id: 'retry-max-attempts',
    name: '@RETRY Max Attempts Enforcement',
    passed,
    metric: { name: 'max_attempts_respected', value: attemptsCorrect ? 1 : 0, unit: 'bool' },
    detail:
      `@RETRY max=2 → expected 3 total attempts. Actual: ${attemptCount}. ` +
      `Workflow failed: ${!result.success}. ` +
      `Max enforcement: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    await testCatchFallbackExecution(),
    await testCatchSelectiveMatching(),
    await testRetryBackoffStrategy(),
    await testRetryMaxAttempts(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-error-containment',
    suiteName: 'Runner Error Containment',
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

export { run as runErrorContainment };
