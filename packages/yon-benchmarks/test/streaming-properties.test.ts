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
 * Streaming Properties Suite — Test Harness
 *
 * Verifies all 4 streaming property tests produce valid results.
 */

import { describe, it, expect } from 'vitest';
import { runStreamingProperties } from '../src/local/streaming-properties.js';

describe('Streaming Properties Suite', () => {
  it('should run all tests and produce results', async () => {
    const result = await runStreamingProperties();

    expect(result.suiteId).toBe('streaming-properties');
    expect(result.tests).toHaveLength(4);
    expect(result.summary.total).toBe(4);
    expect(result.summary.passed + result.summary.failed).toBe(4);
    expect(result.timestamp).toBeTruthy();
  });

  it('should have valid test IDs', async () => {
    const result = await runStreamingProperties();

    const expectedIds = [
      'time-to-first-record',
      'incremental-parse-cost',
      'error-recovery-boundary',
      'streaming-parser-events',
    ];

    for (const id of expectedIds) {
      const test = result.tests.find((t) => t.id === id);
      expect(test, `Missing test: ${id}`).toBeDefined();
      expect(test!.metric.name).toBeTruthy();
      expect(typeof test!.metric.value).toBe('number');
    }
  });

  it('should demonstrate O(1) parse cost', async () => {
    const result = await runStreamingProperties();
    const cost = result.tests.find((t) => t.id === 'incremental-parse-cost');
    expect(cost).toBeDefined();
    // Growth ratio should be under 3x for O(1)
    const ratio = cost!.secondaryMetrics?.find((m) => m.name === 'growth_ratio');
    if (ratio) {
      expect(ratio.value).toBeLessThan(3);
    }
  });
});
