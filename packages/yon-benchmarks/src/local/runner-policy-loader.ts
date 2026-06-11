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
 * Runner Policy Loader Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: loadPolicyRules() — extracts @RULE op=... action=... into AllowlistEntry[].
 *
 * Tests:
 * 1. Extract ALLOW policy rules
 * 2. Fail-closed default (unknown action → DENY)
 * 3. Non-policy rules ignored (no op field)
 */

import { loadPolicyRules } from '@younndai/yon-runner';
import { parse } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testExtractPolicyRules(): TestResult {
  const elapsed = startTimer();

  const doc = parse(`
@DOC ver=2.0 | kind=config | id=policy-bench | title="Policy Rules" | profile=core
@RULE op=std:fs.read | action=ALLOW
@RULE op=std:fs.write | action=DENY
@RULE op=std:net.fetch | action=PROMPT
  `);

  const rules = loadPolicyRules(doc.records);

  const durationMs = elapsed();
  const count = rules.length;
  const hasAllow = rules.some((r) => r.op === 'std:fs.read' && r.action === 'ALLOW');
  const hasDeny = rules.some((r) => r.op === 'std:fs.write' && r.action === 'DENY');
  const hasPrompt = rules.some((r) => r.op === 'std:net.fetch' && r.action === 'PROMPT');
  const passed = count === 3 && hasAllow && hasDeny && hasPrompt;

  return {
    id: 'policy-extract-rules',
    name: 'Extract Policy Rules',
    passed,
    metric: { name: 'extraction_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'count', value: count, unit: 'rules' },
      { name: 'has_allow', value: hasAllow ? 1 : 0, unit: 'bool' },
      { name: 'has_deny', value: hasDeny ? 1 : 0, unit: 'bool' },
      { name: 'has_prompt', value: hasPrompt ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '3 rules extracted: ALLOW, DENY, PROMPT. All 3 actions verified.'
      : `Count: ${count}, Allow: ${hasAllow}, Deny: ${hasDeny}, Prompt: ${hasPrompt}`,
  };
}

function testFailClosedDefault(): TestResult {
  const elapsed = startTimer();

  const doc = parse(`
@DOC ver=2.0 | kind=config | id=policy-failclosed | title="Fail Closed" | profile=core
@RULE op=std:dangerous.op | action=UNKNOWN_ACTION
@RULE op=std:another.op | action=allow_typo
  `);

  const rules = loadPolicyRules(doc.records);

  const durationMs = elapsed();
  const allDeny = rules.every((r) => r.action === 'DENY');
  const count = rules.length;
  const passed = count === 2 && allDeny;

  return {
    id: 'policy-fail-closed',
    name: 'Fail-Closed Default',
    passed,
    metric: { name: 'fail_closed_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'count', value: count, unit: 'rules' },
      { name: 'all_deny', value: allDeny ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Unknown actions "UNKNOWN_ACTION" and "allow_typo" both resolved to DENY. Fail-closed verified.'
      : `Count: ${count}, AllDeny: ${allDeny}`,
  };
}

function testNonPolicyRulesIgnored(): TestResult {
  const elapsed = startTimer();

  const doc = parse(`
@DOC ver=2.0 | kind=config | id=policy-filter | title="Non-Policy Filter" | profile=core
@RULE lvl=MUST | when="modifying code" | then="check for .ai.md first"
@RULE lvl=SHOULD | when="entering folder" | then="check for index.ai.md"
@RULE op=std:fs.read | action=ALLOW
  `);

  const rules = loadPolicyRules(doc.records);

  const durationMs = elapsed();
  const count = rules.length;
  const onlyFsRead = count === 1 && rules[0]?.op === 'std:fs.read';
  const passed = onlyFsRead;

  return {
    id: 'policy-non-policy-ignored',
    name: 'Non-Policy Rules Ignored',
    passed,
    metric: { name: 'filter_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'count', value: count, unit: 'rules' },
      { name: 'only_policy', value: onlyFsRead ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '2 non-policy @RULE (lvl/when/then) ignored. Only @RULE with op= extracted. Filter verified.'
      : `Count: ${count}, OnlyFsRead: ${onlyFsRead}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testExtractPolicyRules(),
    testFailClosedDefault(),
    testNonPolicyRulesIgnored(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-policy-loader',
    suiteName: 'Runner Policy Loader',
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

export { run as runRunnerPolicyLoader };
