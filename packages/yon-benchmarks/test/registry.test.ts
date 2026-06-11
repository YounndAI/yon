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
 * Registry & Environment — Test Harness
 *
 * Verifies suite registration and environment detection.
 */

import { describe, it, expect } from 'vitest';

// Import all local suites to trigger registration
import '../src/local/structural-reliability.js';
import '../src/local/streaming-properties.js';
import '../src/local/format-fidelity.js';
import '../src/local/hallucination-resistance.js';
import '../src/local/runner-throughput.js';
import '../src/local/converter-resilience.js';
import '../src/local/token-efficiency.js';

import { getAllSuites } from '../src/core/registry.js';
import { hasLLMAccess, hasOpenAIKey, hasAnthropicKey, hasGoogleKey } from '../src/core/env.js';

describe('Suite Registry', () => {
  it('should register imported local suites (7 of 52 total)', () => {
    const suites = getAllSuites();
    const localSuites = suites.filter((s) => s.category === 'local');

    expect(localSuites.length).toBeGreaterThanOrEqual(7);

    const expectedIds = [
      'structural-reliability',
      'streaming-properties',
      'format-fidelity',
      'hallucination-resistance',
      'runner-throughput',
      'converter-resilience',
      'token-efficiency',
    ];

    for (const id of expectedIds) {
      const suite = suites.find((s) => s.id === id);
      expect(suite, `Missing suite: ${id}`).toBeDefined();
      expect(suite!.name).toBeTruthy();
      expect(suite!.pillar).toBeTruthy();
      expect(typeof suite!.run).toBe('function');
    }
  });

  it('should have unique suite IDs', () => {
    const suites = getAllSuites();
    const ids = suites.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should assign valid pillars', () => {
    const suites = getAllSuites();
    const validPillars = ['streaming', 'lossless', 'cognitive-economy', 'emitter-faithfulness', 'cross-cutting', 'sapir-whorf'];

    for (const suite of suites) {
      expect(validPillars, `Invalid pillar: ${suite.pillar}`).toContain(suite.pillar);
    }
  });
});

describe('Environment Detection', () => {
  it('should export detection functions', () => {
    expect(typeof hasLLMAccess).toBe('function');
    expect(typeof hasOpenAIKey).toBe('function');
    expect(typeof hasAnthropicKey).toBe('function');
    expect(typeof hasGoogleKey).toBe('function');
  });

  it('should return booleans', () => {
    expect(typeof hasLLMAccess()).toBe('boolean');
    expect(typeof hasOpenAIKey()).toBe('boolean');
    expect(typeof hasAnthropicKey()).toBe('boolean');
    expect(typeof hasGoogleKey()).toBe('boolean');
  });

  it('should be consistent — hasLLMAccess matches individual checks', () => {
    const hasAny = hasOpenAIKey() || hasAnthropicKey() || hasGoogleKey();
    expect(hasLLMAccess()).toBe(hasAny);
  });
});
