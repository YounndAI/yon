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
 * @younndai/ai-relay — Relay Configuration
 *
 * Config-scoped types for createRelay(). A relay client is the unit of
 * configuration: provider keys, per-provider base URLs, preset overrides,
 * and a cost sink all live on the client — never in a process global.
 *
 * This is the surface that makes BYOK-per-client and multi-config-in-one-process
 * possible: each createRelay() call produces an isolated client.
 *
 * @license Apache-2.0
 */

import type { ModelPreset } from './model-presets.js';
import type { ProviderName } from './model-registry.js';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/**
 * Per-provider configuration for a relay client.
 *
 * - `apiKey` is supplied programmatically (BYOK-per-client) — it is NOT read
 *   from `process.env`. When omitted, the underlying AI SDK provider falls back
 *   to its own env var (e.g. `OPENAI_API_KEY`), preserving zero-config behavior.
 * - `baseURL` redirects the provider to an alternate endpoint (proxy, gateway,
 *   Azure-style routing). Optional.
 */
export interface ProviderConfig {
  /** The handler's own API key for this provider (programmatic BYOK). */
  apiKey?: string;
  /** Override the provider's base URL (proxy / gateway / alternate endpoint). */
  baseURL?: string;
  /** Extra HTTP headers sent on every request to this provider. */
  headers?: Record<string, string>;
}

/**
 * Provider keys/config for a relay client, keyed by provider name.
 *
 * @example
 * ```ts
 * const relay = createRelay({
 *   providers: {
 *     openai: { apiKey: clientKey, baseURL: 'https://my-proxy/v1' },
 *     anthropic: { apiKey: anotherKey },
 *   },
 * });
 * ```
 */
export type ProviderConfigMap = Partial<Record<ProviderName, ProviderConfig>>;

// ---------------------------------------------------------------------------
// Cost attribution
// ---------------------------------------------------------------------------

/**
 * A single recorded LLM call's usage + cost, attributed to one provider/model.
 * Emitted by the per-client cost middleware on every generate/stream finish.
 */
export interface CostEntry {
  /** Provider key ('openai', 'anthropic', 'google', or a registered provider). */
  provider: string;
  /** AI SDK model string (e.g. 'gpt-4.1'), when resolvable. */
  modelId?: string;
  /** Prompt (input) tokens. */
  inputTokens: number;
  /** Completion (output) tokens. */
  outputTokens: number;
  /** Estimated cost in USD, from the model registry. */
  cost: number;
}

/**
 * A cost sink receives every {@link CostEntry} as calls complete.
 * Supply your own to route per-client cost into a DB, meter, or logger.
 *
 * The default client wires a sink that also feeds the process-global
 * cost-tracker functions (back-compat). New createRelay() clients get an
 * isolated in-memory sink unless you provide one.
 */
export interface CostSink {
  /** Called once per completed LLM call with its attributed cost. */
  record(entry: CostEntry): void;
}

/** Per-provider rollup of calls + cost for a relay client. */
export interface ProviderCost {
  /** Provider key. */
  provider: string;
  /** Display name (capitalized provider key). */
  name: string;
  /** Number of calls attributed to this provider. */
  calls: number;
  /** Total USD cost for this provider. */
  cost: number;
}

/** A relay client's aggregate cost totals. */
export interface CostTotals {
  /** Total number of LLM calls. */
  calls: number;
  /** Total USD cost across all providers. */
  cost: number;
  /** Total prompt (input) tokens. */
  inputTokens: number;
  /** Total completion (output) tokens. */
  outputTokens: number;
  /** Per-provider breakdown. */
  breakdown: ProviderCost[];
}

// ---------------------------------------------------------------------------
// Relay config
// ---------------------------------------------------------------------------

/**
 * Configuration for a relay client created via {@link createRelay}.
 *
 * Every field is optional — `createRelay()` with no config behaves like the
 * zero-config free functions (provider keys read from env, OpenAI presets).
 */
export interface RelayConfig {
  /** Programmatic provider keys + base URLs (BYOK-per-client). */
  providers?: ProviderConfigMap;
  /** Preset → model-string overrides, scoped to this client only. */
  presets?: Partial<Record<ModelPreset, string>>;
  /**
   * Cost sink for this client. When omitted, the client tracks cost in an
   * isolated in-memory sink (queryable via `client.getCost()`).
   */
  costSink?: CostSink;
  /**
   * When true (default), unknown model strings throw a clear error instead of
   * silently falling back to OpenAI. Set false ONLY if you have registered an
   * explicit fallback provider and accept opaque routing.
   *
   * @default true
   */
  strictModelRouting?: boolean;
}
