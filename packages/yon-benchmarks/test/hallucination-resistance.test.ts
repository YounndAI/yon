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
 * Hallucination Resistance Suite — Test Harness
 *
 * Verifies all 4 hallucination resistance tests produce valid results.
 */

import { describe, it, expect } from 'vitest';
import { runHallucinationResistance } from '../src/local/hallucination-resistance.js';

describe('Hallucination Resistance Suite', () => {
  it('should run all tests and produce results', async () => {
    const result = await runHallucinationResistance();

    expect(result.suiteId).toBe('hallucination-resistance');
    expect(result.tests).toHaveLength(4);
    expect(result.summary.total).toBe(4);
    expect(result.summary.passed + result.summary.failed).toBe(4);
    expect(result.timestamp).toBeTruthy();
  });

  it('should have valid test IDs', async () => {
    const result = await runHallucinationResistance();

    const expectedIds = [
      'syntax-invention-detection',
      'json-bleed-detection',
      'missing-doc-validation',
      'diagnostic-quality',
    ];

    for (const id of expectedIds) {
      const test = result.tests.find((t) => t.id === id);
      expect(test, `Missing test: ${id}`).toBeDefined();
      expect(test!.metric.name).toBeTruthy();
      expect(typeof test!.metric.value).toBe('number');
    }
  });

  it('should reject all malformed inputs', async () => {
    const result = await runHallucinationResistance();
    const rejectionTests = result.tests.filter((t) =>
      ['syntax-invention-detection', 'json-bleed-detection', 'missing-doc-validation'].includes(t.id),
    );

    // All malformed inputs should be rejected
    for (const test of rejectionTests) {
      expect(test.metric.value, `${test.name} should reject`).toBe(1);
    }
  });
});
