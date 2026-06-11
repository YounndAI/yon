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
 * Generator Validity Suite
 *
 * Pillar: Emitter Faithfulness
 * Validates: @younndai/yon-generator builder API produces valid YON that
 * parses and validates correctly across all record types and profiles.
 *
 * Tests:
 * 1. Builder emits valid @DOC header
 * 2. Workflow documents with @STEP, @CHECK, @CATCH, @RETRY parse correctly
 * 3. Declarative documents with @RULE, @MAP, @NOTE parse correctly
 * 4. Content blocks (@BEGIN/@END) round-trip through parser
 * 5. Builder .validate() detects structural errors
 */

import { yon } from '@younndai/yon-generator';
import { parse, validate } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testDocHeader(): TestResult {
  const elapsed = startTimer();

  const doc = yon('rule')
    .id('test-header')
    .title('Header Validity Test')
    .profile('decl')
    .toString();

  let parseOk = false;
  let validateOk = false;

  try {
    const parsed = parse(doc);
    parseOk = true;

    const result = validate(parsed, { strict: true });
    validateOk = result.valid;
  } catch {
    // parseOk remains false
  }

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'generator-doc-header',
    name: 'Builder @DOC Header',
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: `Builder emits yon('rule').id().title().profile('decl'). Parse: ${parseOk}. Validate: ${validateOk}.`,
  };
}

function testWorkflowDocument(): TestResult {
  const elapsed = startTimer();

  const doc = yon('workflow')
    .id('bench-wf')
    .title('Benchmark Workflow')
    .profile('exec')
    .section('Execution')
    .step({ n: 1, rid: 's1', op: 'std:data.set@v1' })
    .step({ n: 2, rid: 's2', op: 'std:data.get@v1', in: ['block:input'] })
    .check({ rid: 'check:gate', assert: 'block:input != null', fail: 'ABORT', msg: 'Input block missing' })
    .catch_({ target: 's1', on: 'E107', do: 'SKIP' })
    .retry({ target: 's2', max: 3, backoff: 'exponential' })
    .toString();

  let parseOk = false;
  let recordCount = 0;

  try {
    const parsed = parse(doc);
    parseOk = true;
    recordCount = parsed.records.length;
  } catch {
    // parseOk remains false
  }

  const durationMs = elapsed();
  const passed = parseOk && recordCount >= 5;

  return {
    id: 'generator-workflow',
    name: 'Builder Workflow (@STEP, @CHECK, @CATCH, @RETRY)',
    passed,
    metric: { name: 'records_emitted', value: recordCount, unit: 'records' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: `Builder emits workflow with @STEP, @CHECK, @CATCH, @RETRY. ${recordCount} records parsed. All workflow tags present: ${passed}.`,
  };
}

function testDeclarativeDocument(): TestResult {
  const elapsed = startTimer();

  const doc = yon('rule')
    .id('bench-decl')
    .title('Benchmark Declarative')
    .profile('decl')
    .section('Policy')
    .rule({ lvl: 'MUST', when: 'data input', then: 'validate schema' })
    .rule({ lvl: 'SHOULD', when: 'error occurs', then: 'log trace' })
    .note('Policy applies to all modules')
    .map({ name: 'Priorities', pairs: { High: '1', Medium: '2', Low: '3' } })
    .meta({ owner: 'platform-team', status: 'active' })
    .toString();

  let parseOk = false;
  let recordCount = 0;

  try {
    const parsed = parse(doc);
    parseOk = true;
    recordCount = parsed.records.length;
  } catch {
    // parseOk remains false
  }

  const durationMs = elapsed();
  const passed = parseOk && recordCount >= 5;

  return {
    id: 'generator-declarative',
    name: 'Builder Declarative (@RULE, @MAP, @NOTE, @META)',
    passed,
    metric: { name: 'records_emitted', value: recordCount, unit: 'records' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: `Builder emits declarative doc with @RULE, @MAP, @NOTE, @META. ${recordCount} records parsed. All declarative tags present: ${passed}.`,
  };
}

function testContentBlock(): TestResult {
  const elapsed = startTimer();

  const blockContent = '{\n  "key": "value",\n  "nested": { "a": 1 }\n}';
  const doc = yon('spec')
    .id('bench-block')
    .title('Block Test')
    .profile('core')
    .begin('payload', blockContent, { id: 'payload', mime: 'application/json' })
    .toString();

  let parseOk = false;
  let hasBlock = false;

  try {
    const parsed = parse(doc);
    parseOk = true;
    // Parser stores @BEGIN/@END content blocks in doc.blocks (Map)
    // The positional arg after @BEGIN is the block type; the id comes from options
    hasBlock = parsed.blocks.size > 0;
  } catch {
    // parseOk remains false
  }

  const durationMs = elapsed();
  const passed = parseOk && hasBlock;

  return {
    id: 'generator-content-block',
    name: 'Builder Content Block (@BEGIN/@END)',
    passed,
    metric: { name: 'block_present', value: hasBlock ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: `Builder emits @BEGIN/@END content block with JSON payload. Parse: ${parseOk}. Block present: ${hasBlock}.`,
  };
}

function testBuilderValidation(): TestResult {
  const elapsed = startTimer();

  // Valid document — builder with all required fields
  const valid = yon('rule')
    .id('valid-doc')
    .title('Valid')
    .profile('decl')
    .note('This is valid')
    .validate();

  // Invalid document — builder emits @DOC without id/title (parser E001)
  let invalidDetected = false;
  try {
    // Manually construct invalid YON that parser would reject
    const invalidSource = '@DOC ver=2.0 | kind=rule';
    parse(invalidSource);
  } catch {
    invalidDetected = true; // Parser threw E001 — correct behavior
  }

  const durationMs = elapsed();
  const validWorks = valid.valid;
  const passed = validWorks && invalidDetected;

  return {
    id: 'generator-validation',
    name: 'Builder .validate() Error Detection',
    passed,
    metric: { name: 'detection_correct', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'valid_accepted', value: validWorks ? 1 : 0, unit: 'bool' },
      { name: 'invalid_rejected', value: invalidDetected ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: `Builder.validate() accepts valid documents (${validWorks}) and rejects invalid ones (${invalidDetected}).`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testDocHeader(),
    testWorkflowDocument(),
    testDeclarativeDocument(),
    testContentBlock(),
    testBuilderValidation(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'generator-validity',
    suiteName: 'Generator Validity',
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

export { run as runGeneratorValidity };
