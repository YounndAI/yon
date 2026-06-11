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
 * @younndai/ai-relay — createRelay() client tests
 *
 * Offline unit tests for the config-scoped relay client:
 * - multi-config isolation (two clients don't collide)
 * - BYOK-per-client (apiKey / baseURL injection)
 * - per-client cost attribution (isolated sinks)
 * - unknown-model-throws (no silent OpenAI fallback)
 * - registry resolution (provider routing)
 * - backward-compat (default-client facade unchanged)
 *
 * No API keys needed — these test wiring/resolution, not live calls.
 */

import { describe, it, expect } from 'vitest';
import {
  createRelay,
  MemoryCostSink,
  inferProvider,
  type CostEntry,
} from '../src/index.js';
import {
  resolveModel as facadeResolveModel,
  getPresetModelId as facadeGetPresetModelId,
  configurePresets as facadeConfigurePresets,
  resetPresets as facadeResetPresets,
} from '../src/providers.js';

// ---------------------------------------------------------------------------
// Registry resolution + provider routing
// ---------------------------------------------------------------------------

describe('createRelay() — registry resolution', () => {
  it('routes gpt-* through the OpenAI provider (modelId preserved)', () => {
    const relay = createRelay();
    const model = relay.resolveModel('gpt-4.1');
    expect(model.modelId).toBe('gpt-4.1');
    expect(model.provider).toContain('openai');
  });

  it('routes claude-* through the Anthropic provider', () => {
    const relay = createRelay();
    const model = relay.resolveModel('claude-sonnet-4-6');
    expect(model.modelId).toBe('claude-sonnet-4-6');
    expect(model.provider).toContain('anthropic');
  });

  it('routes gemini-* through the Google provider', () => {
    const relay = createRelay();
    const model = relay.resolveModel('gemini-2.5-flash');
    expect(model.modelId).toBe('gemini-2.5-flash');
    expect(model.provider).toContain('google');
  });

  it('inferProvider classifies prefixes (and returns undefined for unknown)', () => {
    expect(inferProvider('gpt-4o')).toBe('openai');
    expect(inferProvider('o3-mini')).toBe('openai');
    expect(inferProvider('chatgpt-4o-latest')).toBe('openai');
    expect(inferProvider('claude-haiku-4-5')).toBe('anthropic');
    expect(inferProvider('gemini-3-flash-preview')).toBe('google');
    expect(inferProvider('llama3')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Unknown model throws (no silent OpenAI fallback)
// ---------------------------------------------------------------------------

describe('createRelay() — strict routing (no silent OpenAI fallback)', () => {
  it('throws a clear error for unknown model strings by default', () => {
    const relay = createRelay();
    expect(() => relay.resolveModel('llama3')).toThrow(/Cannot resolve model "llama3"/);
  });

  it('throws with guidance listing recognized prefixes', () => {
    const relay = createRelay();
    expect(() => relay.resolveModel('mistral-large')).toThrow(/unrecognized provider prefix/);
  });

  it('routes unknowns through OpenAI when strictModelRouting:false (opt-in)', () => {
    const relay = createRelay({ strictModelRouting: false });
    const model = relay.resolveModel('some-unknown-model');
    expect(model.modelId).toBe('some-unknown-model');
    expect(model.provider).toContain('openai');
  });
});

// ---------------------------------------------------------------------------
// BYOK-per-client (apiKey / baseURL injection)
// ---------------------------------------------------------------------------

describe('createRelay() — BYOK-per-client', () => {
  it('accepts a per-client apiKey without throwing at resolution time', () => {
    const relay = createRelay({ providers: { openai: { apiKey: 'sk-client-A' } } });
    // Resolution is synchronous and offline — the key is wired into the provider.
    const model = relay.resolveModel('gpt-4.1');
    expect(model.modelId).toBe('gpt-4.1');
  });

  it('accepts a per-client baseURL (proxy/gateway) for a provider', () => {
    const relay = createRelay({
      providers: { openai: { apiKey: 'sk-x', baseURL: 'https://proxy.example/v1' } },
    });
    const model = relay.resolveModel('gpt-5-mini');
    expect(model.modelId).toBe('gpt-5-mini');
  });

  it('two clients with different keys produce independent models', () => {
    const a = createRelay({ providers: { openai: { apiKey: 'sk-A' } } });
    const b = createRelay({ providers: { openai: { apiKey: 'sk-B' } } });
    const ma = a.resolveModel('gpt-4.1');
    const mb = b.resolveModel('gpt-4.1');
    expect(ma).not.toBe(mb); // distinct instances, distinct wiring
    expect(ma.modelId).toBe(mb.modelId);
  });
});

// ---------------------------------------------------------------------------
// Per-client cost attribution + isolation
// ---------------------------------------------------------------------------

describe('createRelay() — per-client cost attribution', () => {
  it('getCost() starts empty for a fresh client', () => {
    const relay = createRelay();
    const totals = relay.getCost();
    expect(totals.calls).toBe(0);
    expect(totals.cost).toBe(0);
    expect(totals.breakdown).toEqual([]);
  });

  it('cost sink aggregates entries into per-provider breakdown', () => {
    const sink = new MemoryCostSink();
    // Simulate what the cost middleware emits on call completion.
    sink.record({ provider: 'openai', modelId: 'gpt-4.1', inputTokens: 1000, outputTokens: 500, cost: 0.006 });
    sink.record({ provider: 'openai', modelId: 'gpt-4.1', inputTokens: 2000, outputTokens: 1000, cost: 0.012 });
    sink.record({ provider: 'anthropic', modelId: 'claude-sonnet-4-6', inputTokens: 500, outputTokens: 250, cost: 0.005 });

    const totals = sink.totals();
    expect(totals.calls).toBe(3);
    expect(totals.inputTokens).toBe(3500);
    expect(totals.outputTokens).toBe(1750);
    expect(totals.cost).toBeCloseTo(0.023, 6);

    const openai = totals.breakdown.find((b) => b.provider === 'openai');
    const anthropic = totals.breakdown.find((b) => b.provider === 'anthropic');
    expect(openai?.calls).toBe(2);
    expect(anthropic?.calls).toBe(1);
    expect(openai?.name).toBe('Openai');
  });

  it('two clients with separate sinks do not collide', () => {
    const sinkA = new MemoryCostSink();
    const sinkB = new MemoryCostSink();
    const a = createRelay({ costSink: sinkA });
    const b = createRelay({ costSink: sinkB });

    sinkA.record({ provider: 'openai', inputTokens: 100, outputTokens: 50, cost: 0.001 });

    expect(sinkA.list()).toHaveLength(1);
    expect(sinkB.list()).toHaveLength(0);
    // getCost() reflects only the supplied sink when it is a MemoryCostSink.
    expect(a.costSink).toBe(sinkA);
    expect(b.costSink).toBe(sinkB);
  });

  it('getCost() returns the client-owned MemoryCostSink rollup', () => {
    const relay = createRelay();
    const sink = relay.costSink as MemoryCostSink;
    sink.record({ provider: 'google', modelId: 'gemini-2.5-flash', inputTokens: 800, outputTokens: 400, cost: 0.0012 });
    const totals = relay.getCost();
    expect(totals.calls).toBe(1);
    expect(totals.breakdown[0]?.provider).toBe('google');
  });
});

// ---------------------------------------------------------------------------
// Multi-config isolation — presets
// ---------------------------------------------------------------------------

describe('createRelay() — multi-config isolation (presets)', () => {
  it('preset overrides are scoped to one client only', () => {
    const a = createRelay({ presets: { fast: 'claude-haiku-4-5' } });
    const b = createRelay();
    expect(a.getPresetModelId('fast')).toBe('claude-haiku-4-5');
    expect(b.getPresetModelId('fast')).toBe('gpt-5-mini'); // default, untouched
  });

  it('configurePresets on one client does not leak to another', () => {
    const a = createRelay();
    const b = createRelay();
    a.configurePresets({ reasoning: 'gemini-3.1-pro-preview' });
    expect(a.getPresetModelId('reasoning')).toBe('gemini-3.1-pro-preview');
    expect(b.getPresetModelId('reasoning')).toBe('gpt-5.4'); // default
  });

  it('client preset overrides do not affect the default-client facade', () => {
    const relay = createRelay({ presets: { balanced: 'claude-opus-4-6' } });
    expect(relay.getPresetModelId('balanced')).toBe('claude-opus-4-6');
    expect(facadeGetPresetModelId('balanced')).toBe('gpt-4.1'); // default facade unchanged
  });
});

// ---------------------------------------------------------------------------
// Embedding routing (the google: prefix must keep routing to Google)
// ---------------------------------------------------------------------------

describe('createRelay() — embedding routing', () => {
  it('default embedding model is text-embedding-3-small', () => {
    const relay = createRelay();
    const m = relay.resolveEmbeddingModel();
    expect(m.modelId).toBe('text-embedding-3-small');
  });

  it('keeps the google: prefix routing to the Google text embedding model', () => {
    const relay = createRelay();
    const m = relay.resolveEmbeddingModel('google:text-embedding-005');
    expect(m.modelId).toBe('text-embedding-005');
    expect(m.provider).toContain('google');
  });

  it('bare embedding strings route to OpenAI', () => {
    const relay = createRelay();
    const m = relay.resolveEmbeddingModel('text-embedding-3-large');
    expect(m.modelId).toBe('text-embedding-3-large');
    expect(m.provider).toContain('openai');
  });
});

// ---------------------------------------------------------------------------
// Backward-compat — the default-client facade still behaves
// ---------------------------------------------------------------------------

describe('backward-compat — default-client facade', () => {
  it('free resolveModel still routes prefixes (and keeps OpenAI fallback)', () => {
    expect(facadeResolveModel('gpt-4o').modelId).toBe('gpt-4o');
    expect(facadeResolveModel('claude-4-sonnet').modelId).toBe('claude-4-sonnet');
    expect(facadeResolveModel('gemini-2.0-flash').modelId).toBe('gemini-2.0-flash');
    // legacy silent fallback preserved on the default facade
    expect(facadeResolveModel('some-unknown-model').modelId).toBe('some-unknown-model');
  });

  it('free configurePresets mutates the default client and resets', () => {
    facadeConfigurePresets({ fast: 'gemini-2.5-flash' });
    expect(facadeGetPresetModelId('fast')).toBe('gemini-2.5-flash');
    expect(facadeGetPresetModelId('balanced')).toBe('gpt-4.1'); // unchanged
    facadeResetPresets();
    expect(facadeGetPresetModelId('fast')).toBe('gpt-5-mini'); // restored
  });

  it('CostEntry type shape is exported and well-formed', () => {
    const entry: CostEntry = {
      provider: 'openai',
      modelId: 'gpt-4.1',
      inputTokens: 10,
      outputTokens: 5,
      cost: 0.0001,
    };
    expect(entry.provider).toBe('openai');
  });
});
