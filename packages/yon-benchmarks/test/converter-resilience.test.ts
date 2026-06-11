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
 * Converter Resilience suite unit tests
 */

import { describe, it, expect } from 'vitest';
import { runConverterResilience } from '../src/local/converter-resilience.js';

describe('Converter Resilience Suite', () => {
  it('runs all 4 tests', async () => {
    const result = await runConverterResilience();
    expect(result.tests).toHaveLength(4);
    expect(result.suiteId).toBe('converter-resilience');
  });

  it('all tests have valid IDs', async () => {
    const result = await runConverterResilience();
    const ids = result.tests.map((t) => t.id);
    expect(ids).toContain('multi-format-roundtrip');
    expect(ids).toContain('adversarial-strings');
    expect(ids).toContain('real-world-fixtures');
    expect(ids).toContain('streaming-equivalence');
  });

  it('multi-format roundtrip covers 6 formats', async () => {
    const result = await runConverterResilience();
    const roundtrip = result.tests.find((t) => t.id === 'multi-format-roundtrip');
    expect(roundtrip).toBeDefined();
    expect(roundtrip!.detail).toContain('JSON');
    expect(roundtrip!.detail).toContain('YAML');
    expect(roundtrip!.detail).toContain('TOML');
    expect(roundtrip!.detail).toContain('CSV');
    expect(roundtrip!.detail).toContain('XML');
    expect(roundtrip!.detail).toContain('INI');
  });
});
