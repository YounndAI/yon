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
 * @younndai/ai-relay - Embeddings Tests
 *
 * Structural and functional tests for embed() and embedMany().
 * Online tests require OPENAI_API_KEY.
 */

import { describe, it, expect } from 'vitest';
import { embed, embedMany, resolveEmbeddingModel } from '../src/index.js';
import type { EmbedOptions, EmbedManyOptions } from '../src/index.js';

// ---------------------------------------------------------------------------
// Structural tests (offline — no API key needed)
// ---------------------------------------------------------------------------

describe('embeddings (structural)', () => {
  it('embed and embedMany are exported functions', () => {
    expect(typeof embed).toBe('function');
    expect(typeof embedMany).toBe('function');
  });

  it('resolveEmbeddingModel returns a model instance', () => {
    const model = resolveEmbeddingModel();
    expect(model).toBeDefined();
    expect(typeof model).toBe('object');
  });

  it('resolveEmbeddingModel accepts a custom model string', () => {
    const model = resolveEmbeddingModel('text-embedding-3-large');
    expect(model).toBeDefined();
  });

  it('EmbedOptions interface accepts value (type-level)', () => {
    // Type assertion — ensures the interface shape is correct
    const opts: EmbedOptions = { value: 'hello' };
    expect(opts.value).toBe('hello');
  });

  it('EmbedManyOptions interface accepts values (type-level)', () => {
    const opts: EmbedManyOptions = { values: ['a', 'b'] };
    expect(opts.values).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Online tests (require OPENAI_API_KEY)
// ---------------------------------------------------------------------------

const hasApiKey = !!process.env.OPENAI_API_KEY;

describe.skipIf(!hasApiKey)('embeddings (online)', () => {
  it('embed() returns a vector of numbers', async () => {
    const result = await embed({ value: 'The quick brown fox' });
    expect(result.embedding).toBeDefined();
    expect(Array.isArray(result.embedding)).toBe(true);
    expect(result.embedding.length).toBeGreaterThan(0);
    expect(typeof result.embedding[0]).toBe('number');
  });

  it('embedMany() returns vectors for each input', async () => {
    const result = await embedMany({ values: ['hello', 'world'] });
    expect(result.embeddings).toBeDefined();
    expect(result.embeddings).toHaveLength(2);
    expect(result.embeddings[0].length).toBeGreaterThan(0);
  });

  it('embed() accepts custom model', async () => {
    const result = await embed({
      value: 'test',
      model: 'text-embedding-3-small',
    });
    expect(result.embedding.length).toBeGreaterThan(0);
  });
});
