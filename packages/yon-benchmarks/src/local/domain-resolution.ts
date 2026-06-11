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
 * Domain Resolution Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: Domain extension system — T1 bundled, T3 local registration, resolution cascade.
 *
 * Tests:
 * 1. T1 Bundled Domain Lookup
 * 2. T3 Local Registration + Cleanup
 * 3. Unified Resolution (T1→T3 cascade)
 * 4. Domain-tagged parsing
 */

import {
  listBundledDomains,
  getBundledDomain,
  isBundledDomain,
  registerDomain,
  unregisterDomain,
  getLocalDomain,
  resolveDomain,
} from '@younndai/domains';
import { parse, validate } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testBundledDomainLookup(): TestResult {
  const elapsed = startTimer();

  const domains = listBundledDomains();
  const hasFinance = isBundledDomain('yai.aerospace');
  const financeDomain = getBundledDomain('yai.aerospace');

  const durationMs = elapsed();
  const domainCount = domains.length;
  const financeValid = financeDomain !== null && financeDomain.domain === 'yai.aerospace';
  const passed = domainCount > 0 && hasFinance && financeValid;

  return {
    id: 'domain-bundled-lookup',
    name: 'T1 Bundled Domain Lookup',
    passed,
    metric: { name: 'lookup_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'domain_count', value: domainCount, unit: 'domains' },
      { name: 'has_finance', value: hasFinance ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? `${domainCount} bundled domains. yai.aerospace found and valid. T1 lookup verified.`
      : `Count: ${domainCount}, Finance: ${hasFinance}, Valid: ${financeValid}`,
  };
}

function testLocalRegistration(): TestResult {
  const elapsed = startTimer();

  const testDomainId = 'yai.bench-test-' + Date.now();

  // Register a custom domain
  registerDomain({
    domain: testDomainId,
    version: '1.0.0',
    status: 'active',
    description: 'Benchmark test domain',
    records: {
      BENCH_METRIC: {
        description: 'Test metric record',
        fields: {
          value: { type: 'int', required: true },
        },
      },
    },
  } as any);

  const registered = getLocalDomain(testDomainId);
  const registeredOk = registered !== null && registered.domain === testDomainId;

  // Cleanup
  unregisterDomain(testDomainId);
  const afterUnregister = getLocalDomain(testDomainId);
  const cleanedUp = afterUnregister === null;

  const durationMs = elapsed();
  const passed = registeredOk && cleanedUp;

  return {
    id: 'domain-local-registration',
    name: 'T3 Local Registration + Cleanup',
    passed,
    metric: { name: 'registration_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'registered', value: registeredOk ? 1 : 0, unit: 'bool' },
      { name: 'cleaned_up', value: cleanedUp ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'register() → getLocal() confirms. unregister() → getLocal() returns null. Lifecycle verified.'
      : `Registered: ${registeredOk}, CleanedUp: ${cleanedUp}`,
  };
}

async function testUnifiedResolution(): Promise<TestResult> {
  const elapsed = startTimer();

  // T1: Bundled domain should resolve
  const financeResolved = await resolveDomain('yai.aerospace');
  const t1Ok = financeResolved !== null;

  // T3: Register then resolve via unified API
  const customId = 'yai.bench-resolve-' + Date.now();
  registerDomain({
    domain: customId,
    version: '1.0.0',
    status: 'active',
    description: 'Resolution test',
    records: {},
  } as any);

  const customResolved = await resolveDomain(customId);
  const t3Ok = customResolved !== null;

  // Cleanup
  unregisterDomain(customId);

  const durationMs = elapsed();
  const passed = t1Ok && t3Ok;

  return {
    id: 'domain-unified-resolution',
    name: 'Unified Resolution Cascade',
    passed,
    metric: { name: 'resolution_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 't1_resolved', value: t1Ok ? 1 : 0, unit: 'bool' },
      { name: 't3_resolved', value: t3Ok ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'T1 (yai.aerospace) and T3 (custom) both resolve via unified resolveDomain(). Cascade verified.'
      : `T1: ${t1Ok}, T3: ${t3Ok}`,
  };
}

function testDomainTaggedParsing(): TestResult {
  const elapsed = startTimer();

  let parseOk = false;
  let validateOk = false;
  let detail = '';

  try {
    const doc = parse(`
@DOC ver=2.0 | kind=spec | id=domain-tagged | title="Domain Tagged" | profile=core | domain=yai.finance
@TXN rid=txn:1 | type=wire | amount:int=50000 | currency=EUR | status=pending
@POSITION rid=pos:1 | symbol=AAPL | quantity:int=100 | price=178.50 | side=long
    `);
    parseOk = true;

    const result = validate(doc, { strict: false });
    validateOk = result.valid;
    if (!result.valid) {
      detail = `Validation errors: ${result.errors.map((e) => e.message).join('; ')}`;
    }
  } catch (err) {
    detail = `Parse error: ${err instanceof Error ? err.message : String(err)}`;
  }

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'domain-tagged-parsing',
    name: 'Domain-Tagged Parsing',
    passed,
    metric: { name: 'parsing_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'domain=yai.finance doc with @TXN and @POSITION parses and validates. Domain records accepted.'
      : detail,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testBundledDomainLookup(),
    testLocalRegistration(),
    await testUnifiedResolution(),
    testDomainTaggedParsing(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'domain-resolution',
    suiteName: 'Domain Resolution',
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

export { run as runDomainResolution };
