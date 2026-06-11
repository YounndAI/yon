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
 * @younndai/ai-relay — Model Presets
 *
 * Workload-based preset names and their hardcoded defaults.
 * Leaf module — no provider imports — so both the relay client and the
 * back-compat provider facade can depend on it without a cycle.
 *
 * @license Apache-2.0
 */

/** Workload-based preset names. */
export type ModelPreset = 'fast' | 'balanced' | 'reasoning' | 'cheap';

/**
 * Hardcoded preset defaults — all OpenAI, for zero-config consumers.
 * A relay client (or `configurePresets()` on the default client) overrides these.
 */
export const PRESET_DEFAULTS: Record<ModelPreset, string> = {
  fast: 'gpt-5-mini',
  balanced: 'gpt-4.1',
  reasoning: 'gpt-5.4',
  cheap: 'gpt-5-nano',
};
