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
 * @younndai/ai-relay
 *
 * Offline unit tests for provider resolution.
 * No API keys needed — these test pure routing logic only.
 */

import { describe, it, expect } from 'vitest';
import { resolveModel, resolveEmbeddingModel, getPresetModel, getPresetModelId, configurePresets, resetPresets } from '../src/providers.js';

// ---------------------------------------------------------------------------
// resolveModel()
// ---------------------------------------------------------------------------

describe('resolveModel()', () => {
  it('routes gpt-* to OpenAI', () => {
    const model = resolveModel('gpt-4o');
    expect(model.modelId).toBe('gpt-4o');
  });

  it('routes claude-* to Anthropic', () => {
    const model = resolveModel('claude-4-sonnet-20260514');
    expect(model.modelId).toBe('claude-4-sonnet-20260514');
  });

  it('routes gemini-* to Google', () => {
    const model = resolveModel('gemini-2.0-flash');
    expect(model.modelId).toBe('gemini-2.0-flash');
  });

  it('routes o1* to OpenAI', () => {
    const model = resolveModel('o1-preview');
    expect(model.modelId).toBe('o1-preview');
  });

  it('routes o3* to OpenAI', () => {
    const model = resolveModel('o3-mini');
    expect(model.modelId).toBe('o3-mini');
  });

  it('routes o4* to OpenAI', () => {
    const model = resolveModel('o4-mini');
    expect(model.modelId).toBe('o4-mini');
  });

  it('routes chatgpt-* to OpenAI', () => {
    const model = resolveModel('chatgpt-4o-latest');
    expect(model.modelId).toBe('chatgpt-4o-latest');
  });

  it('falls back to OpenAI for unknown models', () => {
    const model = resolveModel('some-unknown-model');
    expect(model.modelId).toBe('some-unknown-model');
  });

  it('is case-insensitive for routing prefixes', () => {
    const gpt = resolveModel('GPT-4o');
    expect(gpt.modelId).toBe('GPT-4o');

    const claude = resolveModel('Claude-4-sonnet');
    expect(claude.modelId).toBe('Claude-4-sonnet');

    const gemini = resolveModel('Gemini-2.0-flash');
    expect(gemini.modelId).toBe('Gemini-2.0-flash');
  });
});

// ---------------------------------------------------------------------------
// resolveEmbeddingModel()
// ---------------------------------------------------------------------------

describe('resolveEmbeddingModel()', () => {
  it('returns default model when no argument', () => {
    const model = resolveEmbeddingModel();
    expect(model.modelId).toBe('text-embedding-3-small');
  });

  it('routes text-embedding-* to OpenAI', () => {
    const model = resolveEmbeddingModel('text-embedding-3-large');
    expect(model.modelId).toBe('text-embedding-3-large');
  });

  it('falls back to OpenAI for unknown models', () => {
    const model = resolveEmbeddingModel('some-embedding');
    expect(model.modelId).toBe('some-embedding');
  });
});

// ---------------------------------------------------------------------------
// Preset API
// ---------------------------------------------------------------------------

describe('Preset API', () => {
  it('has fast, balanced, reasoning, and cheap presets', () => {
    expect(getPresetModelId('fast')).toBe('gpt-5-mini');
    expect(getPresetModelId('balanced')).toBe('gpt-4.1');
    expect(getPresetModelId('reasoning')).toBe('gpt-5.4');
    expect(getPresetModelId('cheap')).toBe('gpt-5-nano');
  });

  it('resolves fast to gpt-5-mini', () => {
    expect(getPresetModel('fast').modelId).toBe('gpt-5-mini');
  });

  it('resolves balanced to gpt-4.1', () => {
    expect(getPresetModel('balanced').modelId).toBe('gpt-4.1');
  });

  it('resolves reasoning to gpt-5.4', () => {
    expect(getPresetModel('reasoning').modelId).toBe('gpt-5.4');
  });

  it('resolves cheap to gpt-5-nano', () => {
    expect(getPresetModel('cheap').modelId).toBe('gpt-5-nano');
  });

  it('allows overriding presets', () => {
    configurePresets({ fast: 'gemini-2.5-flash' });
    expect(getPresetModelId('fast')).toBe('gemini-2.5-flash');
    expect(getPresetModelId('balanced')).toBe('gpt-4.1'); // unchanged
    resetPresets();
    expect(getPresetModelId('fast')).toBe('gpt-5-mini'); // restored
  });
});
