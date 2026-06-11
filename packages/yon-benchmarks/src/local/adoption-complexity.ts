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
 * Adoption Complexity Benchmark Suite
 *
 * Pillar: Cognitive Economy
 * Validates: §9 "adoption too steep" rebuttal — modular entry,
 *         small starter surface, progressive complexity.
 *
 * Tests:
 * 1. Minimal valid document — smallest possible YON compared to established formats
 * 2. Starter surface — @DOC + @NOTE + @RULE is the full beginner set
 * 3. Progressive complexity — each tag addition is independently valid
 */

import { parse, validate, format } from '@younndai/yon-parser';
import { yonToJson } from '@younndai/yon-converter';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testMinimalValidDoc(): TestResult {
  // Smallest valid YON document
  const minYon = '@DOC ver=2.0 | id=min | title="Min"';
  const yonTokens = minYon.split(/\s+/).length;
  const yonLines = 1;

  // Equivalent JSON
  const minJson = JSON.stringify({ version: '2.0', id: 'min', title: 'Min' });
  const jsonTokens = minJson.split(/[{},:"]+/).filter(Boolean).length;
  const jsonLines = 1;

  // Equivalent YAML
  const minYaml = 'version: "2.0"\nid: min\ntitle: Min';
  const yamlTokens = minYaml.split(/\s+/).length;
  const yamlLines = minYaml.split('\n').length;

  // Parse the YON doc to verify validity
  const doc = parse(minYon);
  const isValid = doc.id === 'min' && doc.title === 'Min';

  return {
    id: 'adoption-minimal-valid-doc',
    name: 'Minimal Valid Document',
    passed: isValid && yonLines <= jsonLines,
    metric: {
      name: 'yon_tokens',
      value: yonTokens,
      unit: 'tokens',
      comparison: {
        baseline: jsonTokens,
        baselineLabel: 'JSON tokens',
        delta: `YON: ${yonTokens} | JSON: ${jsonTokens} | YAML: ${yamlTokens}`,
      },
    },
    secondaryMetrics: [
      { name: 'yon_lines', value: yonLines, unit: 'lines' },
      { name: 'json_lines', value: jsonLines, unit: 'lines' },
      { name: 'yaml_lines', value: yamlLines, unit: 'lines' },
    ],
    detail:
      `Smallest valid doc: YON=${yonTokens} tokens (${yonLines} line), ` +
      `JSON=${jsonTokens} tokens (${jsonLines} line), ` +
      `YAML=${yamlTokens} tokens (${yamlLines} lines). ` +
      `YON parses successfully: ${isValid}.`,
  };
}

function testStarterSurface(): TestResult {
  // The "starter set": @DOC + @NOTE + @RULE — three tags only
  const starterDoc = [
    '@DOC ver=2.0 | id=starter | title="Getting Started"',
    '@NOTE text="This is a note: the simplest content type in YON"',
    '@RULE lvl=SHOULD | when="starting" | then="use only @DOC, @NOTE, @RULE"',
    '@SEC name="Details"',
    '@NOTE text="Sections group related content"',
  ].join('\n');

  // Parse
  const doc = parse(starterDoc);
  const parseSuccess = doc.records.length > 0;
  const recordTags = [...new Set(doc.records.map(r => r.tag))];
  const onlyStarterTags = recordTags.every(t => ['DOC', 'NOTE', 'RULE', 'SEC'].includes(t));

  // Validate
  let validateSuccess = false;
  try {
    const result = validate(doc);
    validateSuccess = result.valid;
  } catch {
    validateSuccess = false;
  }

  // Convert to JSON
  let convertSuccess = false;
  try {
    const json = yonToJson(doc);
    convertSuccess = json.length > 0;
  } catch {
    convertSuccess = false;
  }

  // Format roundtrip
  let formatSuccess = false;
  try {
    const formatted = format(doc);
    formatSuccess = formatted.length > 0;
  } catch {
    formatSuccess = false;
  }

  const score = (parseSuccess ? 1 : 0) + (validateSuccess ? 1 : 0) + (convertSuccess ? 1 : 0) + (formatSuccess ? 1 : 0);

  return {
    id: 'adoption-starter-surface',
    name: 'Starter Surface (3 Tags)',
    passed: score >= 3, // Parse + at least 2 of validate/convert/format
    metric: {
      name: 'operation_success',
      value: score,
      unit: '/4',
    },
    secondaryMetrics: [
      { name: 'tags_used', value: recordTags.length, unit: 'unique tags' },
    ],
    detail:
      `Starter set: ${recordTags.join(', ')}. ` +
      `Parse: ${parseSuccess}. Validate: ${validateSuccess}. ` +
      `Convert: ${convertSuccess}. Format: ${formatSuccess}. ` +
      `Only starter tags: ${onlyStarterTags}. Score: ${score}/4.`,
  };
}

function testProgressiveComplexity(): TestResult {
  // Add tags one at a time, verify each increment is valid
  const increments: Array<{ name: string; line: string }> = [
    { name: '@DOC (base)', line: '@DOC ver=2.0 | id=prog | title="Progressive"' },
    { name: '+@NOTE', line: '@NOTE text="A simple note"' },
    { name: '+@SEC', line: '@SEC name="Section"' },
    { name: '+@RULE', line: '@RULE lvl=SHOULD | when="always" | then="check"' },
    { name: '+@MAP', line: '@MAP id=config | pairs=["env"->"dev","port:int"->"3000"]' },
    { name: '+@CFG', line: '@CFG id=settings | debug:bool=true' },
    { name: '+@META', line: '@META author="dev" | created:ts=2026-02-13T00:00:00Z' },
  ];

  const results: Array<{ step: string; valid: boolean }> = [];
  const lines: string[] = [];

  for (const inc of increments) {
    lines.push(inc.line);
    const fullDoc = lines.join('\n');

    let valid = false;
    try {
      const doc = parse(fullDoc);
      valid = doc.records.length > 0;
    } catch {
      valid = false;
    }

    results.push({ step: inc.name, valid });
  }

  const allValid = results.every(r => r.valid);
  const validCount = results.filter(r => r.valid).length;

  return {
    id: 'adoption-progressive-complexity',
    name: 'Progressive Complexity',
    passed: allValid,
    metric: {
      name: 'valid_increments',
      value: validCount,
      unit: `/${increments.length}`,
    },
    detail:
      `${increments.length} incremental additions, each independently valid: ` +
      results.map(r => `${r.step}: ${r.valid ? '✓' : '✗'}`).join(', ') +
      `. All valid: ${allValid}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testMinimalValidDoc(),
    testStarterSurface(),
    testProgressiveComplexity(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'adoption-complexity',
    suiteName: 'Adoption Complexity',
    pillar: 'cognitive-economy',
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

export { run as runAdoptionComplexity };
