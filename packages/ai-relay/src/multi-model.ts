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
 * @younndai/ai-relay — Multi-Model (back-compat facade)
 *
 * Run a prompt across multiple LLM providers simultaneously. Delegates to the
 * DEFAULT relay client, so cost is attributed once via the client's cost
 * middleware (no manual recordUsage double-counting).
 *
 * Uses Promise.allSettled — one provider failing doesn't block others.
 * Includes retry with exponential backoff per provider.
 *
 * @license Apache-2.0
 */

import { defaultClient } from './default-client.js';
import type { ProviderName } from './model-registry.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MultiModelResponse {
  /** Registry model ID (e.g. 'gpt4o-mini') */
  modelId: string;
  /** Provider key (e.g. 'openai') */
  provider: ProviderName;
  /** Display name (e.g. 'GPT-4o-mini') */
  name: string;
  /** LLM response text */
  response: string;
}

export interface AskAllModelsOptions {
  /** Cost tier to select models from (default: 'standard') */
  tier?: 'standard' | 'budget';
  /** Max response tokens (default: 2000) */
  maxTokens?: number;
  /** System prompt */
  system?: string;
  /** Only call these providers (filter by env key availability) */
  availableProviders?: ProviderName[];
  /** Sampling temperature (omit for provider-aware defaults: Google→1.0, others→0) */
  temperature?: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a prompt across all models of a given tier (default client).
 *
 * Returns per-model responses. Failed providers are silently excluded
 * (logged to console.warn). At least one provider must succeed.
 *
 * @example
 * ```typescript
 * import { askAllModels } from '@younndai/ai-relay';
 *
 * const responses = await askAllModels('What is the capital of France?', {
 *   tier: 'standard',
 *   availableProviders: ['openai', 'anthropic', 'google'],
 * });
 *
 * for (const { name, response } of responses) {
 *   console.log(`${name}: ${response.slice(0, 100)}...`);
 * }
 * ```
 */
export async function askAllModels(
  prompt: string,
  options: AskAllModelsOptions = {},
): Promise<MultiModelResponse[]> {
  return defaultClient.askAllModels(prompt, options);
}
