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
 * Format Fidelity Suite — Test Harness
 *
 * Verifies all 4 format fidelity tests produce valid results.
 */

import { describe, it, expect } from 'vitest';
import { runFormatFidelity } from '../src/local/format-fidelity.js';

describe('Format Fidelity Suite', () => {
  it('should run all tests and produce results', async () => {
    const result = await runFormatFidelity();

    expect(result.suiteId).toBe('format-fidelity');
    expect(result.tests).toHaveLength(4);
    expect(result.summary.total).toBe(4);
    expect(result.summary.passed + result.summary.failed).toBe(4);
    expect(result.timestamp).toBeTruthy();
  });

  it('should have valid test IDs', async () => {
    const result = await runFormatFidelity();

    const expectedIds = [
      'roundtrip-json',
      'roundtrip-yaml',
      'escape-fidelity',
      'optimization-ladder',
    ];

    for (const id of expectedIds) {
      const test = result.tests.find((t) => t.id === id);
      expect(test, `Missing test: ${id}`).toBeDefined();
      expect(test!.metric.name).toBeTruthy();
      expect(typeof test!.metric.value).toBe('number');
    }
  });

  it('should report roundtrip preservation rates', async () => {
    const result = await runFormatFidelity();
    const jsonRoundtrip = result.tests.find((t) => t.id === 'roundtrip-json');
    const yamlRoundtrip = result.tests.find((t) => t.id === 'roundtrip-yaml');

    expect(jsonRoundtrip).toBeDefined();
    expect(yamlRoundtrip).toBeDefined();
    // Preservation rates should be percentages
    expect(jsonRoundtrip!.metric.unit).toBe('%');
    expect(yamlRoundtrip!.metric.unit).toBe('%');
  });
});
