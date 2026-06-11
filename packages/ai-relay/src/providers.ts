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
 * @younndai/ai-relay — Provider Resolution (back-compat facade)
 *
 * Thin delegating facade over the DEFAULT relay client. Preserved verbatim in
 * signature so existing consumers keep working unchanged. The actual routing
 * lives in `relay.ts` (createProviderRegistry + cost middleware).
 *
 * - `resolveModel` / `getPresetModel` / preset helpers delegate to the default
 *   client. Preset overrides via `configurePresets()` mutate the DEFAULT client
 *   only — exactly the historical single-app behavior.
 * - `resolveEmbeddingModel` keeps the `google:` prefix routing (e.g.
 *   `'google:text-embedding-005'`) for consumers that depend on it.
 *
 * New code should prefer `createRelay()` for isolated, BYOK-per-client config.
 *
 * @license Apache-2.0
 */

import type { LanguageModel, EmbeddingModel } from 'ai';
import { defaultClient } from './default-client.js';
import { PRESET_DEFAULTS, type ModelPreset } from './model-presets.js';

export type { ModelPreset } from './model-presets.js';

// ---------------------------------------------------------------------------
// Presets (mutate the default client)
// ---------------------------------------------------------------------------

/**
 * Override preset model mappings on the default client.
 * Call once at app startup. Partial — only override what you need.
 *
 * For isolated, per-request config in multi-tenant processes, prefer
 * `createRelay({ presets })` instead of mutating this process-wide default.
 *
 * @example
 * ```ts
 * configurePresets({ fast: 'gemini-2.5-flash', reasoning: 'claude-opus-4-6' });
 * ```
 */
export function configurePresets(config: Partial<Record<ModelPreset, string>>): void {
  defaultClient.configurePresets(config);
}

/** Get the model string for a preset (override > default). */
export function getPresetModelId(preset: ModelPreset): string {
  return defaultClient.getPresetModelId(preset);
}

/** Resolve a preset to an AI SDK LanguageModel (via the default client). */
export function getPresetModel(preset: ModelPreset): LanguageModel {
  return defaultClient.getPresetModel(preset);
}

/** Reset the default client's preset overrides (for testing). */
export function resetPresets(): void {
  defaultClient.resetPresets();
}

/** Re-exported preset defaults for callers that need the baseline map. */
export { PRESET_DEFAULTS };

// ---------------------------------------------------------------------------
// Default embedding model
// ---------------------------------------------------------------------------

/**
 * Default embedding model (OpenAI text-embedding-3-small, 1536 dims).
 * Resolved via the default client.
 */
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModel = defaultClient.resolveEmbeddingModel();

// ---------------------------------------------------------------------------
// Resolution (delegates to default client)
// ---------------------------------------------------------------------------

/**
 * Resolve a model string to an AI SDK LanguageModel via the default client.
 *
 * Routing:
 * - `gpt-*`, `o1*`, `o3*`, `o4*`, `chatgpt-*` → OpenAI
 * - `claude-*` → Anthropic
 * - `gemini-*` → Google
 * - Other → OpenAI (the default client is non-strict for back-compat).
 *
 * NOTE: `createRelay()` clients default to STRICT routing — unknown strings
 * throw instead of silently routing to OpenAI.
 */
export function resolveModel(model: string): LanguageModel {
  return defaultClient.resolveModel(model);
}

/**
 * Resolve a model for embeddings via the default client.
 *
 * Routing:
 * - `text-embedding-*` (or any bare string) → OpenAI
 * - `google:*` → Google textEmbeddingModel
 * - No arg → default OpenAI text-embedding-3-small
 */
export function resolveEmbeddingModel(model?: string): EmbeddingModel {
  return defaultClient.resolveEmbeddingModel(model);
}
