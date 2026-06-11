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
 * @younndai/ai-relay
 *
 * Token counting and cost estimation.
 * Estimation is approximation. Exact counts come from the API.
 *
 * @license Apache-2.0
 */

import { getPricing } from './model-registry.js';
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

/**
 * Cost estimation result.
 */
export interface CostEstimate {
  inputTokens: number;
  estimatedOutputTokens: number;
  estimatedSavingsPercent: number;
  estimatedCostUsd: number;
}

// Average compression ratio by format mode.
// Compression varies by content. These ratios are averages from benchmarks.
const COMPRESSION_RATIOS: Record<string, number> = {
  CANON: 0.75, // 25% reduction
  MIN: 0.60, // 40% reduction
  ULTRA: 0.50, // 50% reduction
  canon: 0.75,
  min: 0.60,
  ultra: 0.50,
};

// Lazy-initialized encoder (reused across calls, no memory leak in pure JS)
let _encoder: Tiktoken | null = null;
function getEncoder(): Tiktoken {
  if (!_encoder) {
    _encoder = new Tiktoken(o200k_base);
  }
  return _encoder;
}

/**
 * Count tokens in a string.
 *
 * @param text - Text to tokenize
 * @param precise - If true, uses BPE tokenization (js-tiktoken, o200k_base).
 *   Precise is mandatory for benchmarks and cost display.
 *   If false (default), uses fast heuristic (~4 chars/token).
 */
export function countTokens(text: string, precise = false): number {
  if (precise) {
    return getEncoder().encode(text).length;
  }
  // Fast heuristic: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost before generation.
 * Pricing is looked up from the model registry.
 *
 * @param input - Input text to estimate cost for
 * @param options - Format mode and optional model ID for pricing lookup
 */
export function estimateCost(
  input: string,
  options: { format: string; modelId?: string },
): CostEstimate {
  const inputTokens = countTokens(input);
  const pricing = getPricing(options.modelId ?? 'gpt4o-mini');

  // Estimate prompt overhead (~500 tokens for system prompt)
  const promptOverhead = 500;
  const totalInputTokens = inputTokens + promptOverhead;

  // Estimate output based on compression ratio
  const compressionRatio = COMPRESSION_RATIOS[options.format] ?? 0.60;
  const estimatedOutputTokens = Math.ceil(inputTokens * compressionRatio);

  // Calculate cost using registry pricing (per 1M tokens → per 1K)
  const inputCostPer1K = pricing.input / 1000;
  const outputCostPer1K = pricing.output / 1000;
  const inputCost = (totalInputTokens / 1000) * inputCostPer1K;
  const outputCost = (estimatedOutputTokens / 1000) * outputCostPer1K;

  return {
    inputTokens,
    estimatedOutputTokens,
    estimatedSavingsPercent: (1 - compressionRatio) * 100,
    estimatedCostUsd: inputCost + outputCost,
  };
}
