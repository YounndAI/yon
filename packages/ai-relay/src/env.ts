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
 * @younndai/ai-relay — Provider Environment Detection
 *
 * Detects which LLM provider API keys are available in the environment.
 * Used by any app that needs to know which providers are configured.
 *
 * @license Apache-2.0
 */

import type { ProviderName } from './model-registry.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maps provider name → environment variable key. */
export const PROVIDER_ENV_KEYS: Record<ProviderName, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};

/** Maps provider name → display name. */
export const PROVIDER_DISPLAY: Record<ProviderName, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
};

// ---------------------------------------------------------------------------
// Key detection
// ---------------------------------------------------------------------------

/** Check whether a specific provider key is available in env. */
export function hasProviderKey(provider: ProviderName): boolean {
  return Boolean(process.env[PROVIDER_ENV_KEYS[provider]]);
}

/** Check whether an OpenAI API key is available. */
export function hasOpenAIKey(): boolean {
  return hasProviderKey('openai');
}

/** Check whether an Anthropic API key is available. */
export function hasAnthropicKey(): boolean {
  return hasProviderKey('anthropic');
}

/** Check whether a Google AI API key is available. */
export function hasGoogleKey(): boolean {
  return hasProviderKey('google');
}

/** Check whether any LLM API key is available. */
export function hasLLMAccess(): boolean {
  return hasOpenAIKey() || hasAnthropicKey() || hasGoogleKey();
}

// ---------------------------------------------------------------------------
// Provider discovery
// ---------------------------------------------------------------------------

/** Get list of providers that have valid API keys. */
export function getAvailableProviders(): ProviderName[] {
  const all: ProviderName[] = ['openai', 'anthropic', 'google'];
  return all.filter((p) => hasProviderKey(p));
}

/** Get a summary of available providers (display names). */
export function getProviderSummary(): string[] {
  return getAvailableProviders().map((p) => PROVIDER_DISPLAY[p]);
}
