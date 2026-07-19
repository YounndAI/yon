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
 * @younndai/ai-relay — Relay Client
 *
 * `createRelay(config)` is the config-scoped unit of configuration. Each call
 * produces an INDEPENDENT client: its own BYOK provider keys, its own base
 * URLs, its own preset overrides, and its own cost sink. Two clients in one
 * process never collide — there is no shared mutable singleton.
 *
 * Model routing goes through the AI SDK's `createProviderRegistry` (with a
 * per-client cost middleware applied to every language model), replacing the
 * old hand-rolled prefix matcher. Unknown model strings throw a clear error
 * by default — the silent OpenAI fallback is gone.
 *
 * The free top-level functions (`generate`, `embed`, …) delegate to a shared
 * DEFAULT client (see `default-client.ts`) — the "axios default + axios.create()"
 * pattern. Zero-config consumers keep working unchanged.
 *
 * @license Apache-2.0
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  createProviderRegistry,
  generateText,
  embed as aiEmbed,
  embedMany as aiEmbedMany,
  type LanguageModel,
  type EmbeddingModel,
} from 'ai';

import { createCostMiddleware } from './cost-middleware.js';
import { getAvailableModels, type ProviderName, type ModelEntry } from './model-registry.js';
import { PRESET_DEFAULTS, type ModelPreset } from './model-presets.js';
import type {
  RelayConfig,
  ProviderConfig,
  CostEntry,
  CostSink,
  CostTotals,
  ProviderCost,
} from './relay-config.js';
import {
  runGenerate,
  runGenerateObject,
  runGenerateWithLogprobs,
  runStream,
  type GenerateOptions,
  type GenerateResult,
  type GenerateObjectOptions,
  type GenerateObjectResult,
  type LogprobOptions,
  type LogprobResult,
  type StreamChunk,
} from './generator-core.js';

// ---------------------------------------------------------------------------
// In-memory cost sink (default per-client behavior)
// ---------------------------------------------------------------------------

/**
 * A queryable in-memory cost sink. The default client uses one that also
 * mirrors into the process-global cost-tracker (back-compat); fresh clients
 * get a private one unless the caller supplies their own sink.
 */
export class MemoryCostSink implements CostSink {
  private readonly entries: CostEntry[] = [];

  record(entry: CostEntry): void {
    this.entries.push(entry);
  }

  /** Snapshot of all recorded entries. */
  list(): readonly CostEntry[] {
    return this.entries;
  }

  /** Clear all recorded entries. */
  reset(): void {
    this.entries.length = 0;
  }

  totals(): CostTotals {
    const map = new Map<string, ProviderCost>();
    let cost = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    for (const e of this.entries) {
      cost += e.cost;
      inputTokens += e.inputTokens;
      outputTokens += e.outputTokens;
      const name = e.provider.charAt(0).toUpperCase() + e.provider.slice(1);
      const existing = map.get(e.provider) ?? { provider: e.provider, name, calls: 0, cost: 0 };
      existing.calls++;
      existing.cost += e.cost;
      map.set(e.provider, existing);
    }
    return {
      calls: this.entries.length,
      cost,
      inputTokens,
      outputTokens,
      breakdown: Array.from(map.values()),
    };
  }
}

// ---------------------------------------------------------------------------
// Provider inference
// ---------------------------------------------------------------------------

/**
 * Infer the provider name from a bare model string.
 * Returns undefined for unrecognized strings (→ strict-routing throws).
 */
export function inferProvider(model: string): ProviderName | undefined {
  const lower = model.toLowerCase();
  if (
    lower.startsWith('gpt-') ||
    lower.startsWith('o1') ||
    lower.startsWith('o3') ||
    lower.startsWith('o4') ||
    lower.startsWith('chatgpt-')
  ) {
    return 'openai';
  }
  if (lower.startsWith('claude-')) return 'anthropic';
  if (lower.startsWith('gemini-')) return 'google';
  return undefined;
}

// ---------------------------------------------------------------------------
// Relay client
// ---------------------------------------------------------------------------

/**
 * A config-scoped relay client. Produced by {@link createRelay}.
 *
 * Carries its own provider keys, preset overrides, and cost sink. All methods
 * route models through this client's registry — so BYOK keys and cost
 * attribution stay isolated to this client.
 */
export interface Relay {
  /** Resolve a bare model string to a cost-instrumented LanguageModel. */
  resolveModel(model: string): LanguageModel;
  /** Resolve an embedding model string (supports the `google:` prefix). */
  resolveEmbeddingModel(model?: string): EmbeddingModel;
  /** Resolve a preset to a model (client overrides → defaults). */
  getPresetModel(preset: ModelPreset): LanguageModel;
  /** Get the model string for a preset (client override → default). */
  getPresetModelId(preset: ModelPreset): string;
  /** Override preset model mappings on THIS client only. */
  configurePresets(config: Partial<Record<ModelPreset, string>>): void;
  /** Reset this client's preset overrides. */
  resetPresets(): void;

  /** Generate text. */
  generate(options: GenerateOptions): Promise<GenerateResult>;
  /** Generate structured JSON validated by a Zod schema. */
  generateObject<T>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResult<T>>;
  /** Generate text with per-token log probabilities (OpenAI-only). */
  generateWithLogprobs(options: LogprobOptions): Promise<LogprobResult>;
  /** Stream text (and tool-call events when tools are supplied). */
  stream(options: GenerateOptions): AsyncGenerator<StreamChunk>;

  /** Embed a single value. */
  embed(options: { value: string; model?: string }): Promise<{ embedding: number[]; usage: { tokens: number } }>;
  /** Embed many values in one call. */
  embedMany(options: { values: string[]; model?: string }): Promise<{ embeddings: number[][]; usage: { tokens: number } }>;

  /** Run a prompt across all models of a tier (cost-instrumented). */
  askAllModels(prompt: string, options?: AskAllOptions): Promise<MultiModelResponse[]>;

  /** Aggregate cost totals for this client. */
  getCost(): CostTotals;
  /** The cost sink backing this client (for advanced wiring). */
  readonly costSink: CostSink;
}

export interface AskAllOptions {
  tier?: 'standard' | 'budget';
  maxTokens?: number;
  system?: string;
  availableProviders?: ProviderName[];
  temperature?: number;
}

export interface MultiModelResponse {
  modelId: string;
  provider: ProviderName;
  name: string;
  response: string;
}

// ---------------------------------------------------------------------------
// Registry construction
// ---------------------------------------------------------------------------

/** Build provider options, passing only defined keys so env fallback survives. */
function providerOpts(cfg: ProviderConfig | undefined): {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
} {
  const opts: { apiKey?: string; baseURL?: string; headers?: Record<string, string> } = {};
  if (cfg?.apiKey !== undefined) opts.apiKey = cfg.apiKey;
  if (cfg?.baseURL !== undefined) opts.baseURL = cfg.baseURL;
  if (cfg?.headers !== undefined) opts.headers = cfg.headers;
  return opts;
}

/**
 * Create a config-scoped relay client.
 *
 * @example BYOK-per-client
 * ```ts
 * const relay = createRelay({
 *   providers: { openai: { apiKey: clientKey } },
 * });
 * const { text } = await relay.generate({ system, prompt, preset: 'fast' });
 * console.log(relay.getCost().cost); // USD spent on this client's behalf
 * ```
 */
export function createRelay(config: RelayConfig = {}): Relay {
  const strict = config.strictModelRouting ?? true;
  const sink = config.costSink ?? new MemoryCostSink();
  const middleware = createCostMiddleware(sink);
  const presetOverrides: Partial<Record<ModelPreset, string>> = { ...(config.presets ?? {}) };

  // Build provider instances with this client's BYOK keys + base URLs.
  // These concrete provider instances also back embedding resolution below.
  const openaiProvider = createOpenAI(providerOpts(config.providers?.openai));
  const anthropicProvider = createAnthropic(providerOpts(config.providers?.anthropic));
  const googleProvider = createGoogleGenerativeAI(providerOpts(config.providers?.google));

  // ── Local-LLM seam ──────────────────────────────────────────────────────
  // To add local models later (Ollama / LM Studio / vLLM), this is a one-line
  // registration — NO core change:
  //   import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
  //   local: createOpenAICompatible({ name: 'local', baseURL: config.providers?.local?.baseURL }),
  // and add 'local' to ProviderName + a `local-*` arm in inferProvider().
  const registry = createProviderRegistry(
    {
      openai: openaiProvider,
      anthropic: anthropicProvider,
      google: googleProvider,
    },
    { languageModelMiddleware: middleware },
  );

  function resolveModel(model: string): LanguageModel {
    const provider = inferProvider(model);
    if (!provider) {
      if (strict) {
        throw new Error(
          `Cannot resolve model "${model}": unrecognized provider prefix. ` +
            `Expected gpt-*/o1*/o3*/o4*/chatgpt-* (OpenAI), claude-* (Anthropic), or gemini-* (Google). ` +
            `Pass a recognized model string, or set strictModelRouting:false only with an explicit fallback.`,
        );
      }
      // Non-strict opt-in: route unknowns through OpenAI (legacy behavior).
      return registry.languageModel(`openai:${model}`);
    }
    return registry.languageModel(`${provider}:${model}`);
  }

  function resolveEmbeddingModel(model?: string): EmbeddingModel {
    if (!model) return openaiProvider.textEmbeddingModel('text-embedding-3-small');
    if (model.startsWith('google:')) {
      return googleProvider.textEmbeddingModel(model.slice('google:'.length));
    }
    return openaiProvider.textEmbeddingModel(model);
  }

  function getPresetModelId(preset: ModelPreset): string {
    return presetOverrides[preset] ?? PRESET_DEFAULTS[preset];
  }
  function getPresetModel(preset: ModelPreset): LanguageModel {
    return resolveModel(getPresetModelId(preset));
  }

  const deps = { resolveModel, getPresetModel };

  return {
    resolveModel,
    resolveEmbeddingModel,
    getPresetModel,
    getPresetModelId,
    configurePresets(cfg) {
      Object.assign(presetOverrides, cfg);
    },
    resetPresets() {
      for (const k of Object.keys(presetOverrides)) delete presetOverrides[k as ModelPreset];
    },

    generate: (options) => runGenerate(deps, options),
    generateObject: (options) => runGenerateObject(deps, options),
    generateWithLogprobs: (options) => runGenerateWithLogprobs(deps, options),
    stream: (options) => runStream(deps, options),

    async embed(options) {
      const result = await aiEmbed({ model: resolveEmbeddingModel(options.model), value: options.value });
      return { embedding: result.embedding, usage: { tokens: result.usage.tokens } };
    },
    async embedMany(options) {
      const result = await aiEmbedMany({ model: resolveEmbeddingModel(options.model), values: options.values });
      return { embeddings: result.embeddings, usage: { tokens: result.usage.tokens } };
    },

    async askAllModels(prompt, options = {}) {
      return askAllModelsViaClient(resolveModel, prompt, options);
    },

    getCost() {
      if (sink instanceof MemoryCostSink) return sink.totals();
      // Caller-supplied sink: they own aggregation. Return empty rollup.
      return { calls: 0, cost: 0, inputTokens: 0, outputTokens: 0, breakdown: [] };
    },
    costSink: sink,
  };
}

// ---------------------------------------------------------------------------
// askAllModels via a client's resolver (cost middleware applies automatically)
// ---------------------------------------------------------------------------

const ASK_MAX_RETRIES = 3;
const ASK_BASE_DELAY_MS = 2000;

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fenceStart = /^```\w*\s*\n/;
  const fenceEnd = /\n```\s*$/;
  if (fenceStart.test(trimmed) && fenceEnd.test(trimmed)) {
    return trimmed.replace(fenceStart, '').replace(fenceEnd, '').trim();
  }
  return trimmed;
}

async function callOneModel(
  resolveModel: (m: string) => LanguageModel,
  entry: ModelEntry,
  prompt: string,
  maxTokens: number,
  system?: string,
  temperature?: number,
): Promise<MultiModelResponse> {
  const model = resolveModel(entry.modelId);
  const effectiveTemp = temperature ?? (entry.provider === 'google' ? 1.0 : 0);

  for (let attempt = 0; attempt <= ASK_MAX_RETRIES; attempt++) {
    try {
      const { text } = await generateText({
        model,
        ...(system ? { system } : {}),
        prompt,
        maxRetries: 0,
        maxOutputTokens: maxTokens,
        temperature: effectiveTemp,
      });
      return {
        modelId: entry.id,
        provider: entry.provider,
        name: entry.name,
        response: stripMarkdownFences(text),
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const retryable =
        msg.includes('429') ||
        msg.includes('Resource exhausted') ||
        msg.includes('rate') ||
        msg.includes('quota') ||
        msg.includes('500') ||
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('529');
      if (retryable && attempt < ASK_MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, ASK_BASE_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Unreachable');
}

async function askAllModelsViaClient(
  resolveModel: (m: string) => LanguageModel,
  prompt: string,
  options: AskAllOptions,
): Promise<MultiModelResponse[]> {
  const { tier = 'standard', maxTokens = 2000, system, availableProviders, temperature } = options;
  const models = getAvailableModels(tier, availableProviders);
  if (models.length === 0) {
    throw new Error(
      '[askAllModels] No models available.\n\n' +
        'Ensure API keys are set in .env.local:\n' +
        '  OPENAI_API_KEY=sk-...\n' +
        '  ANTHROPIC_API_KEY=sk-ant-...\n' +
        '  GOOGLE_GENERATIVE_AI_API_KEY=AIza...\n',
    );
  }

  const results = await Promise.allSettled(
    models.map((entry) => callOneModel(resolveModel, entry, prompt, maxTokens, system, temperature)),
  );

  const successful: MultiModelResponse[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      const model = models[i]!;
      console.warn(
        `[askAllModels] ${model.name} failed: ${result.reason instanceof Error ? result.reason.message.slice(0, 120) : 'Unknown error'}`,
      );
    }
  }

  if (successful.length === 0) {
    throw new Error(`[askAllModels] All ${models.length} models failed. Check API keys and provider status.`);
  }
  return successful;
}
