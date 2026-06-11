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
 * @younndai/ai-relay — Cost Tracker
 *
 * Accumulates LLM token usage and cost across all calls.
 * Pricing is sourced from the model registry.
 *
 * Usage:
 *   recordUsage('openai', inputTokens, outputTokens)
 *   // ... later ...
 *   getTotalCost()           // total USD
 *   getProviderBreakdown()   // per-provider summary
 *
 * @license Apache-2.0
 */

import { getModelsByProvider, type ProviderName } from './model-registry.js';

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

interface ProviderPricing {
  name: string;
  inputPer1M: number;
  outputPer1M: number;
}

/** Build pricing from registry — uses first standard-tier model per provider. */
function getProviderPricing(provider: string): ProviderPricing {
  const models = getModelsByProvider(provider as ProviderName);
  const standard = models.find((m) => m.tier === 'standard') ?? models[0];
  const displayName = provider.charAt(0).toUpperCase() + provider.slice(1);
  if (!standard) {
    return { name: displayName, inputPer1M: 0.15, outputPer1M: 0.60 };
  }
  return {
    name: displayName,
    inputPer1M: standard.pricing.input,
    outputPer1M: standard.pricing.output,
  };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface UsageRecord {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

const records: UsageRecord[] = [];
let totalCalls = 0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record a single LLM call's token usage.
 *
 * @param provider - Provider key ('openai', 'anthropic', 'google')
 * @param inputTokens - Prompt tokens consumed
 * @param outputTokens - Completion tokens consumed
 */
export function recordUsage(provider: string, inputTokens: number, outputTokens: number): void {
  const pricing = getProviderPricing(provider);
  const cost = (inputTokens * pricing.inputPer1M + outputTokens * pricing.outputPer1M) / 1_000_000;
  records.push({ provider, inputTokens, outputTokens, cost });
  totalCalls++;
}

/** Total number of LLM API calls made during this run. */
export function getTotalCalls(): number {
  return totalCalls;
}

/** Total estimated cost in USD for this run. */
export function getTotalCost(): number {
  return records.reduce((sum, r) => sum + r.cost, 0);
}

/** Total input tokens consumed. */
export function getTotalInputTokens(): number {
  return records.reduce((sum, r) => sum + r.inputTokens, 0);
}

/** Total output tokens consumed. */
export function getTotalOutputTokens(): number {
  return records.reduce((sum, r) => sum + r.outputTokens, 0);
}

/** Per-provider cost breakdown for CLI summaries. */
export function getProviderBreakdown(): Array<{ name: string; calls: number; cost: number }> {
  const map = new Map<string, { name: string; calls: number; cost: number }>();

  for (const r of records) {
    const p = getProviderPricing(r.provider);
    const name = p.name;
    const existing = map.get(r.provider) ?? { name, calls: 0, cost: 0 };
    existing.calls++;
    existing.cost += r.cost;
    map.set(r.provider, existing);
  }

  return Array.from(map.values());
}

/** Reset all tracked state. Useful for tests. */
export function resetCostTracker(): void {
  records.length = 0;
  totalCalls = 0;
}
