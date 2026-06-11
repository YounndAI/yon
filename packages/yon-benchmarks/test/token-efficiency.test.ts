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
 * Token Efficiency suite unit tests
 *
 * Updated to match actual suite: 2 tests (byte-economy, format-compression).
 */

import { describe, it, expect } from 'vitest';
import { runTokenEfficiency } from '../src/local/token-efficiency.js';

describe('Token Efficiency Suite', () => {
  it('runs all 2 tests', async () => {
    const result = await runTokenEfficiency();
    expect(result.tests).toHaveLength(2);
    expect(result.suiteId).toBe('token-efficiency');
  });

  it('all tests have valid IDs', async () => {
    const result = await runTokenEfficiency();
    const ids = result.tests.map((t) => t.id);
    expect(ids).toContain('byte-economy');
    expect(ids).toContain('format-compression');
  });

  it('byte economy produces valid comparison', async () => {
    const result = await runTokenEfficiency();
    const byteEconomy = result.tests.find((t) => t.id === 'byte-economy');
    expect(byteEconomy).toBeDefined();
    expect(byteEconomy!.metric.unit).toContain('structural baseline');
  });
});
