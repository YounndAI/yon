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
 * Structural Reliability Suite — Test Harness
 *
 * Verifies all 4 structural reliability tests produce valid results.
 */

import { describe, it, expect } from 'vitest';
import { runStructuralReliability } from '../src/local/structural-reliability.js';

describe('Structural Reliability Suite', () => {
  it('should run all tests and produce results', async () => {
    const result = await runStructuralReliability();

    expect(result.suiteId).toBe('structural-reliability');
    expect(result.tests).toHaveLength(4);
    expect(result.summary.total).toBe(4);
    expect(result.summary.passed + result.summary.failed).toBe(4);
    expect(result.timestamp).toBeTruthy();
  });

  it('should have valid test IDs', async () => {
    const result = await runStructuralReliability();

    const expectedIds = [
      'partial-corruption-survival',
      'block-integrity',
      'type-preservation',
      'large-document-stability',
    ];

    for (const id of expectedIds) {
      const test = result.tests.find((t) => t.id === id);
      expect(test, `Missing test: ${id}`).toBeDefined();
      expect(test!.metric.name).toBeTruthy();
      expect(typeof test!.metric.value).toBe('number');
    }
  });

  it('should have meaningful metric values', async () => {
    const result = await runStructuralReliability();

    for (const test of result.tests) {
      expect(test.metric.value).toBeGreaterThanOrEqual(0);
      expect(test.metric.unit).toBeTruthy();
      expect(test.detail).toBeTruthy();
    }
  });
});
