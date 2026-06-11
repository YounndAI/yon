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
 * Migration Fidelity Suite
 *
 * Pillar: Cross-Cutting
 * Validates: YON v2.0 parser handles v1.5 legacy documents correctly.
 *
 * Tests:
 * 1. Version 1.5 Compatibility: Parse a v1.5 document with legacy features
 */

import { parse } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testLegacyCompatibility(): TestResult {
  // v1.5 document
  const src = [
    '@DOC ver=1.5 | id=legacy | title="Legacy Doc"',
    '@NOTE text="This is valid v1.5"',
    '@SEC name="Section 1"',
    '@NOTE text="Content"'
  ].join('\n');
  
  // The parser should handle ver=1.5 without throwing, ideally warning or upgrading
  // Actually, current parser implementation is version-agnostic or checks >=1.0
  
  let passed = false;
  let records = 0;
  
  try {
    const doc = parse(src);
    records = doc.records.length;
    // Check if version was preserved or normalized
    const ver = doc.version;
    passed = ver === '1.5';
  } catch (e) {
    passed = false;
  }
  
  return {
    id: 'legacy-compatibility',
    name: 'Version 1.5 Compatibility',
    passed,
    metric: {
      name: 'records_parsed',
      value: records,
      unit: 'records',
    },
    detail: `Parsed v1.5 document successfully. Version metadata preserved: ${passed}.`,
  };
}


// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testLegacyCompatibility(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'migration-fidelity',
    suiteName: 'Migration Fidelity',
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

export { run as runMigrationFidelity };
