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
 * Security Suite
 *
 * Pillar: Lossless
 * Validates: structural injection containment — an @TAG inside a string
 *         payload stays inert, never escaping into a parsed tag.
 *
 * Tests:
 * 1. Prompt Injection Resilience — verify @TAG in strings stays contained
 */

import { parse } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testPromptInjectionResilience(): TestResult {
  // Scenario: User content attempts to inject a new @RULE tag by breaking a string.
  // YON strings are quoted. Let's see if we can break out.
  
  // Test case: string containing a newline and @Tag
  
  const safeYon = `@DOC ver=2.0 | id=safe | title="Injection Test" | kind=doc\n@NOTE text="Line 1\\n@RULE id=failed | text=\\"injection\\""`;
  
  const doc = parse(safeYon);
  const note = doc.records[1]; // Index 1 because 0 is @DOC
  const text = note ? (note.fields.get('text') as string) : '';
  
  // Should serve as a single record (NOTE) plus the DOC header
  const recordCount = doc.records.length;
  const contentPreserved = text.includes('@RULE');
  
  return {
    id: 'prompt-injection',
    name: 'Injection Resilience',
    passed: recordCount === 2 && contentPreserved,
    metric: {
      name: 'records_parsed',
      value: recordCount,
      unit: 'records',
    },
    detail: `Parsed input with embedded newline and @TAG. Result: ${recordCount} record(s). Injection contained within string boundaries.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testPromptInjectionResilience(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'security-and-economy',
    suiteName: 'Security',
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

export { run as runSecurityAndEconomy };
