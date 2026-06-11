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
 * Hallucination Resistance Suite
 *
 * Pillar: Cross-cutting
 * Validates: YON's rigid grammar rejects invalid generations that prose would accept.
 *
 * Tests:
 * 1. Syntax Invention Detection — parser rejects invented tags
 * 2. JSON Bleed Detection — parser rejects non-YON formats
 * 3. Missing DOC Validation — parser enforces required header
 * 4. Diagnostic Quality — parser emits line-accurate error messages
 */

import { parse, validate } from '@younndai/yon-parser';
import { loadVector } from '../core/vectors.js';
import { localTimestamp, startTimer } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testSyntaxInventionDetection(): TestResult {
  const yon = loadVector('hallucination', 'invented-tags.yon');

  let rejected = false;
  let errorMessage = '';
  try {
    const doc = parse(yon);
    // Even if it parses, validate should catch issues
    const result = validate(doc);
    rejected = !result.valid;
    if (!result.valid && result.errors.length > 0) {
      errorMessage = result.errors.map((e) => e.message).join('; ');
    }
  } catch (e) {
    rejected = true;
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  return {
    id: 'syntax-invention-detection',
    name: 'Syntax Invention Detection',
    passed: rejected,
    metric: {
      name: 'rejected',
      value: rejected ? 1 : 0,
      unit: 'bool',
    },
    detail: rejected
      ? `Parser correctly rejected invented tags. Error: ${errorMessage.slice(0, 200)}`
      : 'Parser INCORRECTLY accepted document with invented tags.',
  };
}

function testJsonBleedDetection(): TestResult {
  const yon = loadVector('hallucination', 'json-bleed.yon');

  let rejected = false;
  let errorMessage = '';
  try {
    const doc = parse(yon);
    const result = validate(doc);
    rejected = !result.valid;
    if (!result.valid && result.errors.length > 0) {
      errorMessage = result.errors.map((e) => e.message).join('; ');
    }
  } catch (e) {
    rejected = true;
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  return {
    id: 'json-bleed-detection',
    name: 'JSON Bleed Detection',
    passed: rejected,
    metric: {
      name: 'rejected',
      value: rejected ? 1 : 0,
      unit: 'bool',
    },
    detail: rejected
      ? `Parser correctly rejected JSON masquerading as YON. Error: ${errorMessage.slice(0, 200)}`
      : 'Parser INCORRECTLY accepted JSON content as YON.',
  };
}

function testMissingDocValidation(): TestResult {
  const yon = loadVector('hallucination', 'missing-doc.yon');

  let rejected = false;
  let errorMessage = '';
  let hasE001 = false;
  try {
    const doc = parse(yon);
    const result = validate(doc);
    rejected = !result.valid;
    if (!result.valid) {
      errorMessage = result.errors.map((e) => e.message).join('; ');
      hasE001 = result.errors.some((e) => e.code === 'E001' || e.message.includes('DOC'));
    }
  } catch (e) {
    rejected = true;
    errorMessage = e instanceof Error ? e.message : String(e);
    hasE001 = errorMessage.includes('DOC') || errorMessage.includes('E001');
  }

  return {
    id: 'missing-doc-validation',
    name: 'Missing @DOC Validation',
    passed: rejected,
    metric: {
      name: 'rejected',
      value: rejected ? 1 : 0,
      unit: 'bool',
    },
    secondaryMetrics: [
      { name: 'correct_error_code', value: hasE001 ? 1 : 0, unit: 'bool' },
    ],
    detail: rejected
      ? `Parser correctly rejected document without @DOC.${hasE001 ? ' E001 error code emitted.' : ''}`
      : 'Parser INCORRECTLY accepted document without @DOC header.',
  };
}

function testDiagnosticQuality(): TestResult {
  // Parse all hallucination vectors and check error quality
  const vectors = ['invented-tags.yon', 'json-bleed.yon', 'missing-doc.yon'];
  let totalErrors = 0;
  let errorsWithLine = 0;
  let errorsWithCode = 0;

  for (const filename of vectors) {
    const yon = loadVector('hallucination', filename);
    try {
      const doc = parse(yon);
      const result = validate(doc);
      for (const error of result.errors) {
        totalErrors++;
        if (error.line !== undefined && error.line > 0) errorsWithLine++;
        if (error.code) errorsWithCode++;
      }
    } catch (e) {
      totalErrors++;
      // Parse errors usually include line info in message
      if (e instanceof Error && /line \d+/i.test(e.message)) {
        errorsWithLine++;
      }
      if (e instanceof Error && /E\d{3}/.test(e.message)) {
        errorsWithCode++;
      }
    }
  }

  const lineAccuracy = totalErrors > 0 ? (errorsWithLine / totalErrors) * 100 : 0;
  const codeAccuracy = totalErrors > 0 ? (errorsWithCode / totalErrors) * 100 : 0;

  return {
    id: 'diagnostic-quality',
    name: 'Diagnostic Quality',
    passed: totalErrors > 0,
    metric: {
      name: 'errors_detected',
      value: totalErrors,
      unit: 'errors',
    },
    secondaryMetrics: [
      { name: 'line_accuracy', value: Math.round(lineAccuracy), unit: '%' },
      { name: 'code_accuracy', value: Math.round(codeAccuracy), unit: '%' },
    ],
    detail: `${totalErrors} errors detected across 3 invalid vectors. ${errorsWithLine} include line numbers (${lineAccuracy.toFixed(0)}%). ${errorsWithCode} include error codes (${codeAccuracy.toFixed(0)}%).`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testSyntaxInventionDetection(),
    testJsonBleedDetection(),
    testMissingDocValidation(),
    testDiagnosticQuality(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'hallucination-resistance',
    suiteName: 'Hallucination Resistance',
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

export { run as runHallucinationResistance };
