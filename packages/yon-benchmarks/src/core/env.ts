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
 * Environment detection — thin wrapper over @younndai/ai-relay env utilities.
 *
 * Adds benchmark-specific CLI provider filtering on top of the core detection.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env.local from the package root BEFORE any provider checks
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env.local') });

// Re-export all env detection from ai-relay
export {
  PROVIDER_ENV_KEYS,
  PROVIDER_DISPLAY,
  hasProviderKey,
  hasOpenAIKey,
  hasAnthropicKey,
  hasGoogleKey,
  hasLLMAccess,
  getAvailableProviders,
  getProviderSummary,
} from '@younndai/ai-relay';

export type { ProviderName } from '@younndai/ai-relay';

import { hasProviderKey, getAvailableProviders, type ProviderName } from '@younndai/ai-relay';

// ---------------------------------------------------------------------------
// Benchmark-specific: CLI provider filter
// ---------------------------------------------------------------------------

let _activeProviders: ProviderName[] | undefined;

/** Set the active provider filter. Called by orchestrator. */
export function setActiveProviders(providers: ProviderName[]): void {
  _activeProviders = providers;
}

/** Get active providers (filtered by CLI), falling back to all available. */
export function getActiveProviders(): ProviderName[] {
  if (_activeProviders) {
    return _activeProviders.filter((p) => hasProviderKey(p));
  }
  return getAvailableProviders();
}

/** Reset active providers (for testing). */
export function resetActiveProviders(): void {
  _activeProviders = undefined;
}
