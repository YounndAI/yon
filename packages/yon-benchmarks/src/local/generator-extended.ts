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
 * Generator Extended Records Suite
 *
 * Pillar: Emitter Faithfulness
 * Validates: @younndai/yon-generator builder API produces valid YON for
 * extended records — sessions, change control, dialogue, privacy,
 * cross-domain, and domain-specific records.
 *
 * Tests:
 * 1. Session Management: @SESSION, @CHECKPOINT, @RECOVER
 * 2. Change Control: @PATCH, @VOID
 * 3. Dialogue: @TURN, @ACK
 * 4. Privacy: @REDACTION, @CONSENT
 * 5. Cross-Domain: @IDENTITY, @LOCATION
 * 6. Domain Records: @domainRecord (custom tags)
 */

import { yon } from '@younndai/yon-generator';
import { parse, validate } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAndValidate(buildFn: () => string): { parseOk: boolean; validateOk: boolean; detail: string } {
  let parseOk = false;
  let validateOk = false;
  let detail = '';

  try {
    const text = buildFn();
    const parsed = parse(text);
    parseOk = true;

    const result = validate(parsed, { strict: false });
    validateOk = result.valid;
    if (!result.valid) {
      detail = `Validation errors: ${result.errors.map((e) => e.message).join('; ')}`;
    }
  } catch (err) {
    detail = `Parse error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return { parseOk, validateOk, detail };
}

function makeResult(id: string, name: string, elapsed: () => number, result: ReturnType<typeof buildAndValidate>, successDetail: string): TestResult {
  const durationMs = elapsed();
  const passed = result.parseOk && result.validateOk;
  return {
    id,
    name,
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: result.parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: result.validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed ? successDetail : result.detail,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testSessionManagement(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-session')
      .title('Extended Session Management')
      .profile('core')
      .session({ rid: 'ses:1', durability: 'ephemeral', ttl_hours: 24 })
      .checkpoint({ rid: 'cp:1', label: 'after-init', session: 'ses:1', includes: ['blk:config', 'blk:state'] })
      .checkpoint({ rid: 'cp:2', label: 'after-analysis', session: 'ses:1' })
      .recover({ rid: 'rec:1', from: 'after-init', reason: 'Analysis failed, rolling back' })
      .toString(),
  );
  return makeResult('ext-session-management', 'Session Management', elapsed, result,
    '@SESSION → @CHECKPOINT(includes[]) × 2 → @RECOVER. Session lifecycle validated.');
}

function testChangeControl(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-change')
      .title('Extended Change Control')
      .profile('core')
      .rule({ lvl: 'MUST', when: 'modifying records', then: 'use @PATCH with timestamp' })
      .patch({ ts: '2026-03-01T03:00:00Z', target: 'rule:1', set: { lvl: 'SHOULD', then: 'updated action' } })
      .void_({ ts: '2026-03-01T03:30:00Z', target: 'rule:1', because: 'Superseded by new policy' })
      .toString(),
  );
  return makeResult('ext-change-control', 'Change Control', elapsed, result,
    '@RULE → @PATCH(set{}) → @VOID. Immutable audit trail validated.');
}

function testDialogue(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-dialogue')
      .title('Extended Dialogue')
      .profile('core')
      .turn({ rid: 'msg:1', text: 'What is the current system status?', from: 'user', to: 'assistant', role: 'user' })
      .turn({ rid: 'msg:2', text: 'All systems operational. Uptime: 99.97%.', from: 'assistant', to: 'user', role: 'assistant' })
      .ack({ ref: 'msg:2', status: 'received', by: 'user' })
      .toString(),
  );
  return makeResult('ext-dialogue', 'Dialogue', elapsed, result,
    '@TURN × 2 (user → assistant → user) → @ACK. Multi-turn conversation validated.');
}

function testPrivacy(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-privacy')
      .title('Extended Privacy')
      .profile('core')
      .consent({ party: 'user:alice', scope: 'data-processing', granted: 'true', method: 'explicit-opt-in', revocable: 'true', expires: '2027-03-01T00:00:00Z' })
      .redaction({ target: 'msg:1', reason: 'GDPR Art 17 right to erasure', field: 'text', method: 'replace', start: '0', end: '42' })
      .consent({ party: 'user:alice', scope: 'data-processing', revoked: 'true', revoke_reason: 'User requested data deletion' })
      .toString(),
  );
  return makeResult('ext-privacy', 'Privacy & GDPR', elapsed, result,
    '@CONSENT(grant) → @REDACTION → @CONSENT(revoke). Privacy lifecycle validated.');
}

function testCrossDomain(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-crossdomain')
      .title('Extended Cross-Domain')
      .profile('core')
      .identity({ rid: 'id:alice', type: 'human', name: 'Alice Chen', email: 'alice@example.com', org: 'Acme Corp', role: 'analyst', verified: 'true', method: 'oauth2' })
      .location({ rid: 'loc:hq', type: 'office', name: 'Headquarters', jurisdiction: 'EU', country: 'NL' })
      .toString(),
  );
  return makeResult('ext-cross-domain', 'Cross-Domain', elapsed, result,
    '@IDENTITY → @LOCATION. Cross-domain actor and spatial references validated.');
}

function testDomainRecords(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('spec')
      .id('bench-ext-domain')
      .title('Extended Domain Records')
      .profile('core')
      .domainRecord('TXN', { rid: 'txn:1', type: 'wire', amount: 50000, currency: 'EUR', status: 'pending' })
      .domainRecord('POSITION', { rid: 'pos:1', symbol: 'AAPL', quantity: 100, price: 178.5, side: 'long' })
      .toString(),
  );
  return makeResult('ext-domain-records', 'Domain Records', elapsed, result,
    '@TXN(amount:int, currency) → @POSITION(price:float). Custom domain records with typed fields validated.');
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testSessionManagement(),
    testChangeControl(),
    testDialogue(),
    testPrivacy(),
    testCrossDomain(),
    testDomainRecords(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'generator-extended',
    suiteName: 'Generator Extended Records',
    pillar: 'emitter-faithfulness',
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

export { run as runGeneratorExtended };
