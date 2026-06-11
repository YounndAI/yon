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
 * Runner Permission Model Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: §9 "execution inside data" objection — fail-closed, governable execution.
 *
 * Tests the PermissionEngine directly:
 * 1. Fail-closed default — empty allowlist denies everything
 * 2. Explicit ALLOW — allowlist entries permit matching ops
 * 3. Explicit DENY — DENY overrides wildcard ALLOW
 * 4. Glob matching — wildcard patterns resolve correctly
 * 5. Version stripping — @v1 suffixes don't block matching
 */

import {
  PermissionEngine,
  InMemoryBlockRegistry,
  type AllowlistEntry,
  type ExecutionContext,
} from '@younndai/yon-runner';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    sandboxRoot: '/tmp/bench',
    env: {},
    blocks: new InMemoryBlockRegistry(),
    args,
    inputs: new Map(),
    signal: new AbortController().signal,
  };
}

async function isPermitted(engine: PermissionEngine, op: string): Promise<boolean> {
  try {
    await engine.check(op, makeCtx());
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testFailClosedDefault(): Promise<TestResult> {
  const engine = new PermissionEngine([]); // Empty allowlist

  const ops = [
    'std:fs.read', 'std:fs.write', 'std:http.get',
    'std:data.transform', 'std:sys.exec', 'custom:danger',
  ];

  let deniedCount = 0;
  for (const op of ops) {
    const permitted = await isPermitted(engine, op);
    if (!permitted) deniedCount++;
  }

  const denialRate = Math.round((deniedCount / ops.length) * 100);

  return {
    id: 'perm-fail-closed-default',
    name: 'Fail-Closed Default (Empty Allowlist)',
    passed: denialRate === 100,
    metric: {
      name: 'denial_rate',
      value: denialRate,
      unit: '%',
    },
    detail:
      `Tested ${ops.length} operations with empty allowlist. ` +
      `${deniedCount}/${ops.length} denied. ` +
      `Fail-closed: ${denialRate === 100 ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testExplicitAllow(): Promise<TestResult> {
  const entries: AllowlistEntry[] = [
    { op: 'std:fs.*', action: 'ALLOW' },
    { op: 'std:data.*', action: 'ALLOW' },
  ];
  const engine = new PermissionEngine(entries);

  const shouldAllow = ['std:fs.read', 'std:fs.write', 'std:data.transform'];
  const shouldDeny = ['std:http.get', 'std:sys.exec', 'custom:danger'];

  let correctAllow = 0;
  let correctDeny = 0;

  for (const op of shouldAllow) {
    if (await isPermitted(engine, op)) correctAllow++;
  }
  for (const op of shouldDeny) {
    if (!(await isPermitted(engine, op))) correctDeny++;
  }

  const total = shouldAllow.length + shouldDeny.length;
  const correct = correctAllow + correctDeny;
  const accuracy = Math.round((correct / total) * 100);

  return {
    id: 'perm-explicit-allow',
    name: 'Explicit Allow (Selective Permit)',
    passed: accuracy === 100,
    metric: {
      name: 'permission_accuracy',
      value: accuracy,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'correct_allows', value: correctAllow, unit: `/${shouldAllow.length}` },
      { name: 'correct_denials', value: correctDeny, unit: `/${shouldDeny.length}` },
    ],
    detail:
      `Allowlist: std:fs.*, std:data.*. ` +
      `Correct allows: ${correctAllow}/${shouldAllow.length}. ` +
      `Correct denials: ${correctDeny}/${shouldDeny.length}. ` +
      `Accuracy: ${accuracy}%.`,
  };
}

async function testExplicitDenyOverride(): Promise<TestResult> {
  const entries: AllowlistEntry[] = [
    { op: 'std:fs.*', action: 'ALLOW' },       // Allow all fs ops
    { op: 'std:fs.write', action: 'DENY' },    // But explicitly deny write
  ];
  const engine = new PermissionEngine(entries);

  const readAllowed = await isPermitted(engine, 'std:fs.read');
  const writeDenied = !(await isPermitted(engine, 'std:fs.write'));

  const passed = readAllowed && writeDenied;

  return {
    id: 'perm-explicit-deny',
    name: 'Explicit DENY Overrides ALLOW',
    passed,
    metric: {
      name: 'deny_override_correct',
      value: passed ? 1 : 0,
      unit: 'bool',
    },
    detail:
      `Allowlist: std:fs.* (ALLOW) + std:fs.write (DENY). ` +
      `std:fs.read allowed: ${readAllowed}. ` +
      `std:fs.write denied: ${writeDenied}. ` +
      `DENY overrides wildcard ALLOW: ${passed ? 'VERIFIED' : 'FAILED'}.`,
  };
}

async function testGlobMatching(): Promise<TestResult> {
  const tests: Array<{ pattern: string; op: string; expected: boolean }> = [
    // Exact match
    { pattern: 'std:fs.read', op: 'std:fs.read', expected: true },
    // Category glob
    { pattern: 'std:fs.*', op: 'std:fs.write', expected: true },
    { pattern: 'std:fs.*', op: 'std:http.get', expected: false },
    // Namespace glob
    { pattern: 'std:*', op: 'std:fs.read', expected: true },
    { pattern: 'std:*', op: 'custom:thing', expected: false },
    // Universal glob
    { pattern: '*', op: 'anything.at.all', expected: true },
  ];

  let correct = 0;
  const failures: string[] = [];

  for (const t of tests) {
    const engine = new PermissionEngine([{ op: t.pattern, action: 'ALLOW' }]);
    const result = await isPermitted(engine, t.op);
    if (result === t.expected) {
      correct++;
    } else {
      failures.push(`${t.pattern} vs ${t.op}: expected ${t.expected}, got ${result}`);
    }
  }

  const accuracy = Math.round((correct / tests.length) * 100);

  return {
    id: 'perm-glob-matching',
    name: 'Glob Pattern Matching',
    passed: accuracy === 100,
    metric: {
      name: 'glob_accuracy',
      value: accuracy,
      unit: '%',
    },
    detail: accuracy === 100
      ? `All ${tests.length} glob patterns resolved correctly.`
      : `${correct}/${tests.length} correct. Failures: ${failures.join('; ')}`,
  };
}

async function testVersionStripping(): Promise<TestResult> {
  const entries: AllowlistEntry[] = [
    { op: 'std:fs.read', action: 'ALLOW' },
  ];
  const engine = new PermissionEngine(entries);

  // Versioned op should match versionless entry
  const v1Match = await isPermitted(engine, 'std:fs.read@v1');
  const v2Match = await isPermitted(engine, 'std:fs.read@v2');
  const baseMatch = await isPermitted(engine, 'std:fs.read');
  const noMatch = !(await isPermitted(engine, 'std:fs.write@v1'));

  const allCorrect = v1Match && v2Match && baseMatch && noMatch;

  return {
    id: 'perm-version-stripping',
    name: 'Version Suffix Stripping',
    passed: allCorrect,
    metric: {
      name: 'version_strip_correct',
      value: allCorrect ? 4 : 0,
      unit: '/4',
    },
    detail:
      `Entry: std:fs.read (ALLOW). ` +
      `std:fs.read@v1: ${v1Match}. std:fs.read@v2: ${v2Match}. ` +
      `std:fs.read (bare): ${baseMatch}. std:fs.write@v1 (no match): ${noMatch}. ` +
      `Version stripping: ${allCorrect ? 'VERIFIED' : 'FAILED'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    await testFailClosedDefault(),
    await testExplicitAllow(),
    await testExplicitDenyOverride(),
    await testGlobMatching(),
    await testVersionStripping(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'runner-permissions',
    suiteName: 'Runner Permission Model',
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

export { run as runRunnerPermissions };
