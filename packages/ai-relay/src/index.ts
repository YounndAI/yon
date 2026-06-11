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
 * Provider-agnostic AI relay — LLM gateway with model registry.
 * Low-level by design—this layer sends prompts and receives responses.
 * Domain-specific logic belongs in consumer packages.
 *
 * @license Apache-2.0
 */

// Relay client — the primary API for config-scoped, BYOK-per-client usage
export { createRelay, MemoryCostSink, inferProvider } from './relay.js';
export type { Relay, AskAllOptions } from './relay.js';
export type {
  RelayConfig,
  ProviderConfig,
  ProviderConfigMap,
  CostSink,
  CostEntry,
  CostTotals,
  ProviderCost,
} from './relay-config.js';
export { createCostMiddleware } from './cost-middleware.js';

// Core functions (free functions = the zero-config default-client path)
export { generate, generateObject, generateWithLogprobs, stream } from './generator.js';
export { createBYOKModel, type BYOKProvider } from './byok.js';
export { countTokens, estimateCost } from './tokenizer.js';
export { embed, embedMany } from './embeddings.js';
export {
  resolveModel,
  resolveEmbeddingModel,
  configurePresets,
  getPresetModel,
  getPresetModelId,
  resetPresets,
} from './providers.js';

// Model registry
export {
  MODEL_REGISTRY,
  getModelById,
  findModelEntry,
  getModelsByTier,
  getModelsByProvider,
  getModelsByCapability,
  getAvailableModels,
  isReasoningModel,
  getAllModels,
  getPricing,
  calculateCost,
  getModelCapabilities,
  registerModel,
} from './model-registry.js';

// Multi-model
export { askAllModels } from './multi-model.js';

// Environment & provider detection
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
} from './env.js';

// Cost tracking
export {
  recordUsage,
  getTotalCalls,
  getTotalCost,
  getTotalInputTokens,
  getTotalOutputTokens,
  getProviderBreakdown,
  resetCostTracker,
} from './cost-tracker.js';

// Timer utilities
export {
  startTimer,
  measure,
  localTimestamp,
  formatDuration,
} from './timer.js';

// Types — Generation
export type {
  GenerateOptions,
  GenerateResult,
  GenerateObjectOptions,
  GenerateObjectResult,
  StreamChunk,
  ModelPreset,
  LogprobToken,
  LogprobResult,
  LogprobOptions,
} from './generator.js';

// Types — Embeddings
export type {
  EmbedOptions,
  EmbedResult,
  EmbedManyOptions,
  EmbedManyResult,
} from './embeddings.js';

// Types — Tokenizer
export type { CostEstimate } from './tokenizer.js';

// Types — Registry
export type { ModelEntry, ModelCapabilities, ProviderName } from './model-registry.js';

// Types — Multi-model
export type { MultiModelResponse, AskAllModelsOptions } from './multi-model.js';

