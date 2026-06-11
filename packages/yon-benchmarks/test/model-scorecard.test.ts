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
 * Model Scorecard unit tests — guards the fuzzy matching fix:
 * 1. Gemini 2.5 Flash → standard tier (exact match)
 * 2. Gemini 2.5 Flash-Lite → budget tier (no collision)
 * 3. Nonexistent model → undefined
 */

import { describe, it, expect } from 'vitest';
import { findRegistryEntry } from '../src/reports/model-scorecard.js';

describe('findRegistryEntry()', () => {
  it('finds Gemini 2.5 Flash as standard tier', () => {
    const entry = findRegistryEntry('Gemini 2.5 Flash');
    expect(entry).toBeDefined();
    expect(entry!.tier).toBe('standard');
  });

  it('finds Gemini 2.5 Flash-Lite as budget tier (no collision with Flash)', () => {
    const entry = findRegistryEntry('Gemini 2.5 Flash-Lite');
    expect(entry).toBeDefined();
    expect(entry!.tier).toBe('budget');
    // Critical: must NOT return the standard Flash entry
    expect(entry!.name).toContain('Lite');
  });

  it('returns undefined for nonexistent model', () => {
    const entry = findRegistryEntry('Nonexistent Model XYZ-9000');
    expect(entry).toBeUndefined();
  });

  it('finds GPT-4o-mini', () => {
    const entry = findRegistryEntry('GPT-4o-mini');
    expect(entry).toBeDefined();
    expect(entry!.provider).toBe('openai');
  });

  it('finds Claude Haiku 4.5', () => {
    const entry = findRegistryEntry('Claude Haiku 4.5');
    expect(entry).toBeDefined();
    expect(entry!.provider).toBe('anthropic');
  });
});
