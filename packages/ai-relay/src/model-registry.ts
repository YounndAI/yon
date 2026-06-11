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
 * @younndai/ai-relay — Model Registry
 *
 * Single source of truth for all LLM model metadata.
 * Every model used across the YounndAI ecosystem is defined here once.
 *
 * To add a new model:
 *   1. Add an entry to MODEL_REGISTRY
 *   2. All consumers pick it up automatically
 *
 * To add a model at runtime (consumer-side):
 *   registerModel({ id: 'my-model', ... })
 *
 * @license Apache-2.0
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProviderName = 'openai' | 'anthropic' | 'google';

export interface ModelCapabilities {
  /** Reasoning/thinking model (affects temperature, seed, prompting) */
  reasoning: boolean;
  /** Supports native structured output (JSON mode / tool use) */
  structuredOutput: boolean;
  /** Supports streaming */
  streaming: boolean;
  /** Supports image input */
  vision: boolean;
  /** Supports deterministic sampling (seed parameter) */
  seed: boolean;
  /** Supports per-token log probabilities (OpenAI only) */
  logprobs: boolean;
}

export interface ModelEntry {
  /** Unique ID for lookups (e.g. 'gpt4o-mini') */
  id: string;
  /** Human-readable display name (e.g. 'GPT-4o-mini') */
  name: string;
  /** AI SDK provider key */
  provider: ProviderName;
  /** Model string passed to AI SDK (e.g. 'gpt-4o-mini') */
  modelId: string;
  /** Cost tier for benchmark grouping */
  tier: 'budget' | 'standard' | 'premium';
  /** Pricing per 1M tokens (USD) */
  pricing: { input: number; output: number };
  /** Max context window in tokens */
  contextWindow: number;
  /** Max output tokens */
  maxOutput: number;
  /** Model capabilities */
  capabilities: ModelCapabilities;
}

// ---------------------------------------------------------------------------
// Registry (mutable — registerModel appends)
// ---------------------------------------------------------------------------

/**
 * All supported models for the YounndAI ecosystem.
 *
 * Pricing last verified: 2026-05-09 (official provider sources).
 *
 * ⚠️ Gemini 2.5 Flash/Pro are THINKING models — maxOutputTokens includes
 *    thinking tokens. Set higher maxOutputTokens (8192+) for normal output.
 */
const registry: ModelEntry[] = [
  // ── OpenAI ──────────────────────────────────────────────────────────────
  {
    id: 'gpt5-nano',
    name: 'GPT-5-nano',
    provider: 'openai',
    modelId: 'gpt-5-nano',
    tier: 'budget',
    pricing: { input: 0.05, output: 0.40 },
    contextWindow: 128_000,
    maxOutput: 16_384,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: true, logprobs: true },
  },
  {
    id: 'gpt4o-mini',
    name: 'GPT-4o-mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    tier: 'standard',
    pricing: { input: 0.15, output: 0.60 },
    contextWindow: 128_000,
    maxOutput: 16_384,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt5-mini',
    name: 'GPT-5-mini',
    provider: 'openai',
    modelId: 'gpt-5-mini',
    tier: 'standard',
    pricing: { input: 0.25, output: 2.00 },
    contextWindow: 128_000,
    maxOutput: 16_384,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt41-mini',
    name: 'GPT-4.1-mini',
    provider: 'openai',
    modelId: 'gpt-4.1-mini',
    tier: 'budget',
    pricing: { input: 0.40, output: 1.60 },
    contextWindow: 1_047_576,
    maxOutput: 16_384,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt41-nano',
    name: 'GPT-4.1-nano',
    provider: 'openai',
    modelId: 'gpt-4.1-nano',
    tier: 'budget',
    pricing: { input: 0.10, output: 0.40 },
    contextWindow: 1_047_576,
    maxOutput: 16_384,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    tier: 'standard',
    pricing: { input: 2.50, output: 10.00 },
    contextWindow: 128_000,
    maxOutput: 16_384,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt41',
    name: 'GPT-4.1',
    provider: 'openai',
    modelId: 'gpt-4.1',
    tier: 'standard',
    pricing: { input: 2.00, output: 8.00 },
    contextWindow: 1_047_576,
    maxOutput: 32_768,
    capabilities: { reasoning: false, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt5',
    name: 'GPT-5',
    provider: 'openai',
    modelId: 'gpt-5',
    tier: 'premium',
    pricing: { input: 1.25, output: 10.00 },
    contextWindow: 400_000,
    maxOutput: 100_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt52',
    name: 'GPT-5.2',
    provider: 'openai',
    modelId: 'gpt-5.2',
    tier: 'premium',
    pricing: { input: 1.75, output: 14.00 },
    contextWindow: 400_000,
    maxOutput: 100_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt54',
    name: 'GPT-5.4',
    provider: 'openai',
    modelId: 'gpt-5.4',
    tier: 'premium',
    pricing: { input: 2.50, output: 15.00 },
    contextWindow: 1_047_576,
    maxOutput: 100_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt54-pro',
    name: 'GPT-5.4 Pro',
    provider: 'openai',
    modelId: 'gpt-5.4-pro',
    tier: 'premium',
    pricing: { input: 30.00, output: 180.00 },
    contextWindow: 1_047_576,
    maxOutput: 100_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt55',
    name: 'GPT-5.5',
    provider: 'openai',
    modelId: 'gpt-5.5',
    tier: 'premium',
    pricing: { input: 5.00, output: 30.00 },
    contextWindow: 1_050_000,
    maxOutput: 128_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'gpt55-pro',
    name: 'GPT-5.5 Pro',
    provider: 'openai',
    modelId: 'gpt-5.5-pro',
    tier: 'premium',
    pricing: { input: 30.00, output: 180.00 },
    contextWindow: 1_050_000,
    maxOutput: 128_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: true },
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'openai',
    modelId: 'o4-mini',
    tier: 'premium',
    pricing: { input: 1.10, output: 4.40 },
    contextWindow: 200_000,
    maxOutput: 100_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: false, seed: false, logprobs: true },
  },

  // ── Anthropic ───────────────────────────────────────────────────────────
  {
    id: 'claude-haiku',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    modelId: 'claude-haiku-4-5',
    tier: 'standard',
    pricing: { input: 1.00, output: 5.00 },
    contextWindow: 200_000,
    maxOutput: 64_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    tier: 'premium',
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 1_000_000,
    maxOutput: 64_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    modelId: 'claude-opus-4-6',
    tier: 'premium',
    pricing: { input: 5.00, output: 25.00 },
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    modelId: 'claude-opus-4-7',
    tier: 'premium',
    pricing: { input: 5.00, output: 25.00 },
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },

  // ── Google ──────────────────────────────────────────────────────────────
  {
    id: 'gemini-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'google',
    modelId: 'gemini-2.5-flash-lite',
    tier: 'budget',
    pricing: { input: 0.10, output: 0.40 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    modelId: 'gemini-2.5-flash',
    tier: 'standard',
    pricing: { input: 0.30, output: 2.50 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    modelId: 'gemini-2.5-pro',
    tier: 'premium',
    pricing: { input: 1.25, output: 10.00 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'gemini3-flash',
    name: 'Gemini 3 Flash',
    provider: 'google',
    modelId: 'gemini-3-flash-preview',
    tier: 'standard',
    pricing: { input: 0.50, output: 3.00 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'gemini31-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'google',
    modelId: 'gemini-3.1-flash-lite-preview',
    tier: 'budget',
    pricing: { input: 0.25, output: 1.50 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
  {
    id: 'gemini31-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    modelId: 'gemini-3.1-pro-preview',
    tier: 'premium',
    pricing: { input: 2.00, output: 12.00 },
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    capabilities: { reasoning: true, structuredOutput: true, streaming: true, vision: true, seed: false, logprobs: false },
  },
];

/** Frozen public view of the registry. */
export const MODEL_REGISTRY: readonly ModelEntry[] = registry;

// ---------------------------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------------------------

/** Get a model by its unique registry ID (e.g. 'gpt4o-mini'). */
export function getModelById(id: string): ModelEntry | undefined {
  return registry.find((m) => m.id === id);
}

/** Find a model by its AI SDK model string (e.g. 'gpt-4o-mini'). */
export function findModelEntry(modelId: string): ModelEntry | undefined {
  return registry.find((m) => m.modelId === modelId);
}

/** Get all models of a given tier. */
export function getModelsByTier(tier: 'budget' | 'standard' | 'premium'): ModelEntry[] {
  return registry.filter((m) => m.tier === tier);
}

/** Get all models for a given provider. */
export function getModelsByProvider(provider: ProviderName): ModelEntry[] {
  return registry.filter((m) => m.provider === provider);
}

/**
 * Get models matching capability requirements.
 * All specified capabilities must be true.
 */
export function getModelsByCapability(caps: Partial<ModelCapabilities>): ModelEntry[] {
  return registry.filter((m) => {
    for (const [key, value] of Object.entries(caps)) {
      if (value === true && !m.capabilities[key as keyof ModelCapabilities]) return false;
    }
    return true;
  });
}

/** Check if a model ID (AI SDK string) is a reasoning model. */
export function isReasoningModel(modelId: string): boolean {
  const entry = findModelEntry(modelId);
  return entry?.capabilities.reasoning ?? false;
}

/**
 * Get models filtered by tier and available providers.
 */
export function getAvailableModels(
  tier: 'budget' | 'standard' | 'premium' = 'standard',
  availableProviders?: ProviderName[],
): ModelEntry[] {
  let models = getModelsByTier(tier);
  if (availableProviders) {
    models = models.filter((m) => availableProviders.includes(m.provider));
  }
  return models;
}

/** Get all registered models (including runtime-registered ones). */
export function getAllModels(): readonly ModelEntry[] {
  return registry;
}

// ---------------------------------------------------------------------------
// Cost Helpers
// ---------------------------------------------------------------------------

/**
 * Look up pricing for a model by ID or modelId.
 * Returns the pricing per 1M tokens, or a default (GPT-4o-mini) if not found.
 */
export function getPricing(modelId: string): { input: number; output: number } {
  const model = registry.find((m) => m.id === modelId || m.modelId === modelId);
  return model?.pricing ?? { input: 0.15, output: 0.60 };
}

/**
 * Calculate cost in USD for a given model and token counts.
 * Returns 0 if model not found.
 */
export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const pricing = getPricing(modelId);
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

/**
 * Get model capabilities by AI SDK model string.
 * Returns undefined if model not in registry.
 */
export function getModelCapabilities(modelId: string): ModelCapabilities | undefined {
  return findModelEntry(modelId)?.capabilities;
}

// ---------------------------------------------------------------------------
// Runtime Registration
// ---------------------------------------------------------------------------

/**
 * Register a custom model at runtime (append-only).
 * Useful for consumers who need models ai-relay doesn't ship with.
 *
 * @throws if a model with the same id already exists
 */
export function registerModel(entry: ModelEntry): void {
  if (registry.some((m) => m.id === entry.id)) {
    throw new Error(`Model '${entry.id}' already registered`);
  }
  registry.push(entry);
}
