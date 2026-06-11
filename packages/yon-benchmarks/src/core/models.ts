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
 * Multi-Model Helper
 *
 * Single point of truth for which models the benchmark suite uses.
 * Delegates to @younndai/ai-relay model registry for model metadata
 * and resolution — no direct @ai-sdk/* imports.
 *
 * Standard models (one per provider):
 * - OpenAI (GPT-4o-mini)
 * - Anthropic (Claude Haiku 4.5)
 * - Google (Gemini 2.5 Flash)
 *
 * Budget models (cheapest per provider):
 * - OpenAI (GPT-5-nano)
 * - Anthropic (Claude Haiku 4.5) — cheapest available
 * - Google (Gemini 2.5 Flash-Lite)
 */

import { generateText } from 'ai';
import type { LanguageModel } from 'ai';
import {
  MODEL_REGISTRY,
  resolveModel,
  recordUsage,
  getModelsByTier as getRegistryModelsByTier,
  type ModelEntry,
  type ProviderName,
} from '@younndai/ai-relay';
import {
  getActiveProviders,
  hasProviderKey,
  PROVIDER_DISPLAY,
  PROVIDER_ENV_KEYS,
} from './env.js';

// ---------------------------------------------------------------------------
// Tier targeting — CLI control for which tiers to benchmark
// ---------------------------------------------------------------------------

type TierMode = 'all' | 'target' | 'budget' | 'standard' | 'premium';
let _tierMode: TierMode = 'target';

/** Set which tiers to include. 'target' = budget+standard (default). */
export function setTierMode(mode: TierMode): void { _tierMode = mode; }
export function getTierMode(): TierMode { return _tierMode; }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  providerKey: ProviderName;
  model: LanguageModel;
}

// ---------------------------------------------------------------------------
// Model Selection — which registry models to use for benchmarks
// ---------------------------------------------------------------------------

/** Standard-tier model IDs used for benchmarks (one per provider). */
const STANDARD_MODEL_IDS = ['gpt4o-mini', 'claude-haiku', 'gemini-flash'] as const;

/** Budget-tier model IDs used for value-amplifier testing. */
const BUDGET_MODEL_IDS = ['gpt5-nano', 'claude-haiku', 'gemini-flash-lite'] as const;

/** Look up a registry entry by its short ID (e.g. 'gpt4o-mini'). */
function findEntry(id: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

/** Convert a ModelEntry to the benchmark ModelConfig shape. */
function toModelConfig(entry: ModelEntry, suffix = ''): ModelConfig {
  return {
    id: entry.id + suffix,
    name: entry.name + (suffix ? ` ${suffix}` : ''),
    provider: PROVIDER_DISPLAY[entry.provider],
    providerKey: entry.provider,
    model: resolveModel(entry.modelId),
  };
}

// ---------------------------------------------------------------------------
// Model Factories
// ---------------------------------------------------------------------------

/** All standard benchmark models. Only creates models whose API keys are present. */
function createAllModels(): ModelConfig[] {
  const models: ModelConfig[] = [];
  for (const id of STANDARD_MODEL_IDS) {
    const entry = findEntry(id);
    if (!entry) continue;
    if (!hasProviderKey(entry.provider)) continue;
    models.push(toModelConfig(entry));
  }
  return models;
}

/**
 * Budget-tier models — cheapest available per provider.
 * Used to test YON's value amplifier hypothesis: structured format helps
 * weaker models more than stronger ones.
 */
export function createBudgetModels(): ModelConfig[] {
  const models: ModelConfig[] = [];
  for (const id of BUDGET_MODEL_IDS) {
    const entry = findEntry(id);
    if (!entry) continue;
    if (!hasProviderKey(entry.provider)) continue;
    models.push(toModelConfig(entry, '(budget)'));
  }
  return models;
}

/**
 * Get models by tier from registry — one per provider (first match).
 * Uses the registry's tier field for auto-discovery of new models.
 */
export function createModelsByTier(tier: 'budget' | 'standard' | 'premium'): ModelConfig[] {
  const entries = getRegistryModelsByTier(tier);
  const seen = new Set<ProviderName>();
  const models: ModelConfig[] = [];

  for (const entry of entries) {
    if (seen.has(entry.provider)) continue;
    if (!hasProviderKey(entry.provider)) continue;
    seen.add(entry.provider);
    models.push(toModelConfig(entry, `(${tier})`));
  }

  return models;
}

/**
 * Target-tier models — budget + standard only (where YON adds value).
 * Premium models don't benefit from structure, so they're excluded from
 * primary evaluation. Use createFullTierModels() for full-matrix runs.
 */
export function createTargetTierModels(): ModelConfig[] {
  return [
    ...createModelsByTier('budget'),
    ...createModelsByTier('standard'),
  ];
}

/**
 * Full tier matrix — one model per provider per tier.
 * Respects the tier mode set by CLI:
 * - 'all': budget + standard + premium (original behavior)
 * - 'target': budget + standard only (recommended for YON benchmarks)
 * - 'budget'|'standard'|'premium': single tier
 */
export function createFullTierModels(): ModelConfig[] {
  switch (_tierMode) {
    case 'target': return createTargetTierModels();
    case 'budget': return createModelsByTier('budget');
    case 'standard': return createModelsByTier('standard');
    case 'premium': return createModelsByTier('premium');
    case 'all':
    default:
      return [
        ...createModelsByTier('budget'),
        ...createModelsByTier('standard'),
        ...createModelsByTier('premium'),
      ];
  }
}

// ---------------------------------------------------------------------------
// Active Models (respects --provider CLI filter)
// ---------------------------------------------------------------------------

/**
 * Get models filtered by active providers.
 * Only returns models whose keys exist AND match the CLI filter.
 * Logs skip messages for filtered-out providers.
 */
export function getActiveModels(silent = false): ModelConfig[] {
  const active = getActiveProviders();
  const models = createAllModels();
  const result = models.filter((m) => active.includes(m.providerKey));

  // Log skipped providers
  if (!silent) {
    const allProviders: ProviderName[] = ['openai', 'anthropic', 'google'];
    for (const p of allProviders) {
      if (!active.includes(p)) {
        const reason = !hasProviderKey(p)
          ? `no ${PROVIDER_ENV_KEYS[p]} in .env.local`
          : 'filtered by --provider flag';
        console.log(`  ⊘ Skipping ${PROVIDER_DISPLAY[p]} — ${reason}`);
      }
    }
  }

  return result;
}

/**
 * Legacy export: all models with keys available (ignoring CLI filter).
 * Prefer getActiveModels() for new code.
 */
export const MODELS = createAllModels();

// ---------------------------------------------------------------------------
// askModel — call a specific model with retry
// ---------------------------------------------------------------------------

/** Per-provider inter-request delay to avoid burst throttling (ms). */
const PROVIDER_DELAYS: Record<string, number> = {
  Google: 500, // Gemini burst-throttle guard — kept light since exponential backoff handles 429s
};

export async function askModel(
  model: ModelConfig,
  prompt: string,
  maxTokens: number = 1500,
  systemPrompt?: string,
): Promise<string> {
  // Provider-specific burst throttle
  const burstDelay = PROVIDER_DELAYS[model.provider];
  if (burstDelay) await new Promise((r) => setTimeout(r, burstDelay));

  const maxRetries = 3;
  const baseDelayMs = 2000; // 2s, 4s, 8s

  // Gemini 3 requires temperature=1.0 — setting below 1.0 causes looping/degraded performance.
  // See: https://ai.google.dev/gemini-api/docs/gemini-3#temperature
  const effectiveTemp = model.providerKey === 'google' ? 1.0 : 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text, usage } = await generateText({
        model: model.model,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        prompt,
        maxOutputTokens: maxTokens,
        temperature: effectiveTemp,
      });
      if (usage) recordUsage(model.providerKey, usage.inputTokens ?? 0, usage.outputTokens ?? 0);
      return text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRateLimit = msg.includes('429') || msg.includes('Resource exhausted') || msg.includes('rate');
      const isRetryable = isRateLimit || (msg.includes('5') && msg.includes('00')); // 500, 502, 503

      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[askModel] ${model.name} rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      console.warn(`[askModel] ${model.name} failed: ${msg.slice(0, 200)}`);
      throw error;
    }
  }

  throw new Error('Unreachable');
}

// ---------------------------------------------------------------------------
// Per-Model Result Types
// ---------------------------------------------------------------------------

export interface PerModelResult {
  modelId: string;
  modelName: string;
  provider: string;
  score: number;
  maxScore: number;
  detail: string;
}

/**
 * Run a test function across active models (respects --provider filter).
 * Returns per-model results.
 */
export async function runAcrossModels(
  testFn: (model: ModelConfig) => Promise<PerModelResult>,
): Promise<PerModelResult[]> {
  const models = getActiveModels();
  if (models.length === 0) {
    console.warn('[runAcrossModels] No models available — skipping.');
    return [];
  }
  const results = await Promise.all(models.map((m) => testFn(m)));
  return results;
}
