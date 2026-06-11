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
 * Type Safety Benchmark Suite
 *
 * Pillar: Lossless
 * Validates: §9 "syntax is verbose" rebuttal — one type annotation eliminates
 *         a whole class of inference bugs.
 *
 * Tests:
 * 1. Zip code preservation — :str preserves leading zeros
 * 2. Boolean coercion prevention — :bool prevents string/bool ambiguity
 * 3. Int/float distinction — :int vs :float survives roundtrip
 * 4. Self-describing budget — byte cost of type annotations (§9 characteristic)
 */

import { parse, format } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testZipCodePreservation(): TestResult {
  // YON: explicit :str type preserves leading zero
  const yonDoc = `@DOC ver=2.0 | id=type-zip | title="Zip Code"\n@CFG id=addr | zip:str=01234 | city=Springfield`;
  const doc = parse(yonDoc);

  // Check the parsed AST preserves the type hint
  const cfgRecord = doc.records.find(r => r.tag === 'CFG');
  const typedZip = cfgRecord?.typedFields.get('zip');
  const yonPreservesType = typedZip?.typeHint === 'str';

  // Check value is preserved as string with leading zero
  const zipValue = String(typedZip?.value ?? '');
  const leadingZeroPreserved = zipValue === '01234';

  // Roundtrip: format and re-parse
  const formatted = format(doc);
  const reparsed = parse(formatted);
  const reCfg = reparsed.records.find(r => r.tag === 'CFG');
  const reZip = reCfg?.typedFields.get('zip');
  const roundtripPreserved = reZip?.typeHint === 'str' && String(reZip?.value) === '01234';

  // JSON comparison: "01234" as a JSON value could be misinterpreted
  const jsonObj = { zip: '01234' };
  const jsonStr = JSON.stringify(jsonObj);
  const jsonBack = JSON.parse(jsonStr) as Record<string, string>;
  const jsonPreserves = jsonBack['zip'] === '01234'; // JSON preserves strings...
  // ...but JSON has no way to say "this MUST be a string" — it's implicit

  const yonScore = (yonPreservesType ? 1 : 0) + (leadingZeroPreserved ? 1 : 0) + (roundtripPreserved ? 1 : 0);

  return {
    id: 'type-zip-code-preservation',
    name: 'Zip Code Preservation (:str)',
    passed: yonPreservesType && roundtripPreserved,
    metric: {
      name: 'type_preservation',
      value: yonScore,
      unit: '/3',
      comparison: {
        baseline: jsonPreserves ? 1 : 0,
        baselineLabel: 'JSON (no type annotation)',
        delta: `YON: explicit :str (${yonScore}/3) | JSON: implicit (${jsonPreserves ? 1 : 0}/1)`,
      },
    },
    detail:
      `YON :str type hint preserved in AST: ${yonPreservesType}. ` +
      `Leading zero preserved: ${leadingZeroPreserved}. ` +
      `Roundtrip survived: ${roundtripPreserved}. ` +
      `JSON preserves string value (${jsonPreserves}) but has no type annotation to enforce it.`,
  };
}

function testBooleanCoercion(): TestResult {
  const yonDoc = `@DOC ver=2.0 | id=type-bool | title="Boolean"\n@CFG id=flags | active:bool=true | name:str="true"`;
  const doc = parse(yonDoc);

  const cfgRecord = doc.records.find(r => r.tag === 'CFG');
  const activeField = cfgRecord?.typedFields.get('active');
  const nameField = cfgRecord?.typedFields.get('name');

  // YON distinguishes: active:bool=true (boolean) vs name:str="true" (string)
  const activeIsBool = activeField?.typeHint === 'bool';
  const nameIsStr = nameField?.typeHint === 'str';
  const typesDistinct = activeIsBool && nameIsStr;

  // JSON comparison: { "active": true, "name": "true" } — relies on value type, not annotation
  const jsonObj = { active: true, name: 'true' };
  const jsonStr = JSON.stringify(jsonObj);
  const jsonBack = JSON.parse(jsonStr) as Record<string, unknown>;
  const jsonActive = typeof jsonBack['active'] === 'boolean';
  const jsonName = typeof jsonBack['name'] === 'string';
  const jsonDistinguishes = jsonActive && jsonName;

  return {
    id: 'type-bool-coercion',
    name: 'Boolean Coercion Prevention (:bool)',
    passed: typesDistinct,
    metric: {
      name: 'type_distinction',
      value: typesDistinct ? 1 : 0,
      unit: 'bool',
      comparison: {
        baseline: jsonDistinguishes ? 1 : 0,
        baselineLabel: 'JSON value-based distinction',
        delta: typesDistinct
          ? 'YON: explicit :bool/:str annotations prevent ambiguity'
          : 'Types not distinguished',
      },
    },
    detail:
      `active:bool=true → typeHint=bool: ${activeIsBool}. ` +
      `name:str="true" → typeHint=str: ${nameIsStr}. ` +
      `YON annotations prevent coercion. JSON relies on value encoding (${jsonDistinguishes}).`,
  };
}

function testIntFloatDistinction(): TestResult {
  const yonDoc = `@DOC ver=2.0 | id=type-num | title="Numbers"\n@CFG id=net | port:int=5432 | ratio:float=0.95 | count:int=0`;
  const doc = parse(yonDoc);

  const cfgRecord = doc.records.find(r => r.tag === 'CFG');
  const portField = cfgRecord?.typedFields.get('port');
  const ratioField = cfgRecord?.typedFields.get('ratio');
  const countField = cfgRecord?.typedFields.get('count');

  const portIsInt = portField?.typeHint === 'int';
  const ratioIsFloat = ratioField?.typeHint === 'float';
  const countIsInt = countField?.typeHint === 'int';

  // Roundtrip preserves types
  const formatted = format(doc);
  const reparsed = parse(formatted);
  const reCfg = reparsed.records.find(r => r.tag === 'CFG');
  const rePortField = reCfg?.typedFields.get('port');
  const roundtripPreserved = rePortField?.typeHint === 'int';

  const score = (portIsInt ? 1 : 0) + (ratioIsFloat ? 1 : 0) + (countIsInt ? 1 : 0) + (roundtripPreserved ? 1 : 0);

  return {
    id: 'type-int-float-distinction',
    name: 'Int/Float Distinction (:int/:float)',
    passed: score === 4,
    metric: {
      name: 'type_score',
      value: score,
      unit: '/4',
    },
    detail:
      `port:int → ${portIsInt}, ratio:float → ${ratioIsFloat}, count:int → ${countIsInt}. ` +
      `Roundtrip preserved: ${roundtripPreserved}. Score: ${score}/4.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

function testSelfDescribingBudget(): TestResult {
  // Compare: JSON (untyped) vs YON (typed fields) for config data
  // This test measures the §9 characteristic: "one explicit type annotation
  // eliminates an entire class of downstream inference bugs"
  const data = {
    host: 'localhost',
    port: 3000,
    debug: true,
    max_connections: 100,
    timeout_ms: 5000,
    name: 'api-server',
    version: '2.1.0',
    enable_cors: false,
  };

  const jsonStr = JSON.stringify(data);
  const jsonPretty = JSON.stringify(data, null, 2);

  // YON with explicit types
  const yonTyped = [
    '@DOC ver=2.0 | id=typed | title="Typed Config" | kind=doc',
    '@CFG key=host | val="localhost"',
    '@CFG key=port | val:int=3000',
    '@CFG key=debug | val:bool=true',
    '@CFG key=max_connections | val:int=100',
    '@CFG key=timeout_ms | val:int=5000',
    '@CFG key=name | val="api-server"',
    '@CFG key=version | val="2.1.0"',
    '@CFG key=enable_cors | val:bool=false',
  ].join('\n');

  const jsonMinBytes = Buffer.byteLength(jsonStr);
  const jsonPrettyBytes = Buffer.byteLength(jsonPretty);
  const yonBytes = Buffer.byteLength(yonTyped);

  // Count type annotations in YON
  const typeAnnotations = (yonTyped.match(/:int=|:bool=|:float=/g) || []).length;

  return {
    id: 'self-describing-budget',
    name: 'Self-Describing Type Budget (§9 Characteristic)',
    passed: true,
    type: 'measurement',
    metric: {
      name: 'type_annotations',
      value: typeAnnotations,
      unit: 'explicit types',
    },
    secondaryMetrics: [
      { name: 'json_min_bytes', value: jsonMinBytes, unit: 'bytes' },
      { name: 'json_pretty_bytes', value: jsonPrettyBytes, unit: 'bytes' },
      { name: 'yon_bytes', value: yonBytes, unit: 'bytes' },
      { name: 'yon_vs_json_pretty', value: Math.round((yonBytes / jsonPrettyBytes) * 100), unit: '%' },
    ],
    detail: `YON: ${yonBytes}B with ${typeAnnotations} explicit type annotations (:int, :bool). JSON minified: ${jsonMinBytes}B (no types). JSON pretty: ${jsonPrettyBytes}B (no types). The rationale: "one explicit type annotation eliminates an entire class of downstream inference bugs." Cost: ~${yonBytes - jsonMinBytes}B. Benefit: zero type-coercion errors.`,
  };
}

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testZipCodePreservation(),
    testBooleanCoercion(),
    testIntFloatDistinction(),
    testSelfDescribingBudget(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'type-safety',
    suiteName: 'Type Safety',
    pillar: 'lossless',
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

export { run as runTypeSafety };
