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
 * Runner Throughput suite unit tests
 *
 * Updated to match renamed suite (throughput → runner-throughput).
 */

import { describe, it, expect } from 'vitest';
import { runRunnerThroughput } from '../src/local/runner-throughput.js';

describe('Runner Throughput Suite', () => {
  it('runs all 3 tests', async () => {
    const result = await runRunnerThroughput();
    expect(result.tests).toHaveLength(3);
    expect(result.suiteId).toBe('runner-throughput');
  });

  it('all tests have valid IDs', async () => {
    const result = await runRunnerThroughput();
    const ids = result.tests.map((t) => t.id);
    expect(ids).toContain('runner-cold-start');
    expect(ids).toContain('runner-ops-sec');
    expect(ids).toContain('runner-memory-budget');
  });

  it('cold start is under 1ms', async () => {
    const result = await runRunnerThroughput();
    const coldStart = result.tests.find((t) => t.id === 'runner-cold-start');
    expect(coldStart).toBeDefined();
    expect(coldStart!.metric.value).toBeLessThan(1);
  });
});
