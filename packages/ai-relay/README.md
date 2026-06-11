<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/ai-relay/assets/younndai-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/ai-relay/assets/younndai-icon-onlight.png" />
    <img alt="YounndAI" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/ai-relay/assets/younndai-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/ai-relay</strong><br />
  Provider-agnostic LLM gateway — model registry, multi-provider, precise token counting<br />
  <em>Part of the YON™ toolchain — data, intent, and instructions in a single stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/ai-relay)](https://www.npmjs.com/package/@younndai/ai-relay)
[![license](https://img.shields.io/npm/l/@younndai/ai-relay)](./LICENSE)

## What is this?

`@younndai/ai-relay` is a provider-agnostic LLM gateway. Low-level by design — this layer sends prompts and receives responses across OpenAI, Anthropic, and Google, with a single model registry, workload-based presets, structured output, streaming, embeddings, and precise token counting and cost estimation.

Two ways to use it:

- **`createRelay(config)`** — the primary API. A config-scoped client carrying its own API keys (bring-your-own-key, per client), base URLs, preset overrides, and cost sink. Create as many independent clients as you like in one process — they never collide.
- **Free functions** (`generate`, `embed`, …) — the zero-config path. They delegate to a shared default client that reads keys from the environment. Import and go.

This is the "axios default + `axios.create()`" pattern: the free functions are the convenient default; `createRelay()` is the isolated, multi-tenant unit of configuration.

## Install

```bash
npm install @younndai/ai-relay ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

`ai` and the `@ai-sdk/*` provider packages are **peer dependencies** — you install and pin the versions your app needs. This keeps the SDK version under your control.

## Quick Start

```ts
import { generate } from "@younndai/ai-relay";

const result = await generate({
  system: "You are a helpful assistant.",
  prompt: "What is the capital of France?",
  preset: "fast", // 'fast' | 'balanced' | 'reasoning' | 'cheap'
});

console.log(result.text);
```

The free functions read provider API keys from the environment (see [Environment Setup](#environment-setup)). For config-scoped clients, see [`createRelay(config)`](#primary-api--createrelayconfig).

## Key Features

- **Single model registry** across OpenAI, Anthropic, and Google — pricing, capabilities, tiers, runtime registration.
- **`createRelay(config)`** — config-scoped clients with bring-your-own-key per client, per-provider base URLs, scoped preset overrides, and per-client cost attribution.
- **Workload-based presets** (`fast` / `balanced` / `reasoning` / `cheap`) — dynamic, override at startup or per client.
- **Full generation surface** — structured output, streaming, embeddings, and cross-provider `askAllModels`.
- **Precise token counting and cost estimation** — per-call cost tracking with pluggable cost sinks.

## Environment Setup

Create a `.env.local` file with the API keys for the providers you want to use. You can use one, two, or all three:

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

## Primary API — `createRelay(config)`

`createRelay()` returns a config-scoped client. Use it when you need **bring-your-own-key per client**, **multiple configurations in one process**, or **per-client cost attribution** — e.g. a website that does work on behalf of many clients, each with their own API key.

```typescript
import { createRelay } from "@younndai/ai-relay";

// One isolated client per tenant/request — keys never leak between clients.
const relay = createRelay({
  providers: {
    openai: { apiKey: tenantOpenAIKey },            // BYOK-per-client
    anthropic: { apiKey: tenantAnthropicKey, baseURL: "https://my-gateway/anthropic" },
  },
  presets: { fast: "claude-haiku-4-5" },            // overrides scoped to THIS client
});

const result = await relay.generate({
  system: "You are a helpful assistant.",
  prompt: "What is the capital of France?",
  preset: "fast",
});

console.log(result.text);
console.log(relay.getCost()); // { calls, cost, inputTokens, outputTokens, breakdown[] } — for this client only
```

A relay client exposes the full surface: `generate`, `generateObject`, `generateWithLogprobs`, `stream`, `embed`, `embedMany`, `askAllModels`, plus `resolveModel`, `getPresetModel`, `configurePresets`, and `getCost`.

### Configuration

```typescript
interface RelayConfig {
  providers?: {
    openai?:    { apiKey?: string; baseURL?: string; headers?: Record<string, string> };
    anthropic?: { apiKey?: string; baseURL?: string; headers?: Record<string, string> };
    google?:    { apiKey?: string; baseURL?: string; headers?: Record<string, string> };
  };
  presets?: { fast?: string; balanced?: string; reasoning?: string; cheap?: string };
  costSink?: CostSink;           // route per-client cost into your own DB/meter
  strictModelRouting?: boolean;  // default true — unknown models throw (see below)
}
```

- **BYOK-per-client** — `providers.<name>.apiKey` is supplied programmatically, not read from the environment. Omit it to fall back to the provider's own env var.
- **Base URL** — `providers.<name>.baseURL` redirects a provider to a proxy, gateway, or alternate endpoint.
- **Per-client cost** — every completed call is attributed to the client via a cost middleware. Read `relay.getCost()`, or supply a `costSink` to stream entries into your own store.
- **Strict routing** — by default, an unrecognized model string **throws a clear error** instead of silently routing to OpenAI. Pass recognized prefixes (`gpt-*`/`o1*`/`o3*`/`o4*`/`chatgpt-*`, `claude-*`, `gemini-*`).

### Per-Client Cost Attribution

```typescript
import { createRelay, type CostEntry } from "@younndai/ai-relay";

// Option A: read the client's built-in rollup.
const relay = createRelay({ providers: { openai: { apiKey } } });
await relay.generate({ system, prompt, preset: "fast" });
const { calls, cost, breakdown } = relay.getCost();

// Option B: stream every call into your own sink (DB, meter, logger).
const relayB = createRelay({
  costSink: {
    record(entry: CostEntry) {
      // { provider, modelId, inputTokens, outputTokens, cost }
      meter.add(tenantId, entry);
    },
  },
});
```

## How To Use (zero-config free functions)

The free functions delegate to a shared default client that reads keys from the environment. Identical to `createRelay()` with no config.

### Single Model Generation

```typescript
import { generate } from "@younndai/ai-relay";

const result = await generate({
  system: "You are a helpful assistant.",
  prompt: "What is the capital of France?",
  preset: "fast", // 'fast' | 'balanced' | 'reasoning' | 'cheap'
  maxTokens: 2000,
  temperature: 0.7,
});

console.log(result.text);
console.log(result.usage); // { input: number, output: number }
```

### Structured JSON Output

```typescript
import { generateObject } from "@younndai/ai-relay";
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
});

const result = await generateObject({
  system: "Extract metadata from the text.",
  prompt: "The Eiffel Tower is a wrought-iron lattice tower in Paris...",
  schema,
  preset: "balanced",
});

console.log(result.object); // { title: '...', tags: ['...'] }
// Internally uses AI SDK v6 generateText + Output.object().
```

> `generateObject` uses native Structured Outputs by default. Pass `mode: 'json'` or `mode: 'tool'` to override.

### Streaming

```typescript
import { stream } from "@younndai/ai-relay";

for await (const chunk of stream({
  system: "You are a helpful assistant.",
  prompt: "Write a haiku about code.",
  preset: "fast",
})) {
  if (chunk.type === "partial") {
    process.stdout.write(chunk.content!);
  } else if (chunk.type === "complete") {
    console.log("\nUsage:", chunk.result!.usage);
  } else if (chunk.type === "error") {
    console.error("Error:", chunk.error);
  }
}
```

### Cross-Provider Testing (All Models)

Run the same prompt across all providers simultaneously. Ideal for benchmarks, quality comparisons, and eliminating single-model bias:

```typescript
import { askAllModels } from "@younndai/ai-relay";

const responses = await askAllModels("What is the capital of France?", {
  tier: "standard", // 'standard' | 'budget'
  availableProviders: ["openai", "anthropic", "google"], // Only call providers with keys
  maxTokens: 500,
});

for (const { name, response } of responses) {
  console.log(`${name}: ${response}`);
}
// GPT-4o-mini: The capital of France is...
// Claude Haiku 4.5: Paris is the capital...
// Gemini 2.5 Flash: France's capital is...
```

`askAllModels` uses `Promise.allSettled` — if one provider is down, the others still return results.

### Model Registry Lookups

```typescript
import {
  MODEL_REGISTRY,
  getModelById,
  findModelEntry,
  getModelsByTier,
  getModelsByProvider,
  getModelsByCapability,
  getAvailableModels,
  getAllModels,
  isReasoningModel,
  calculateCost,
  registerModel,
} from "@younndai/ai-relay";

// All standard-tier models
const standard = getModelsByTier("standard");
// → GPT-4o-mini, GPT-5-mini, GPT-4.1, GPT-4o, Claude Haiku 4.5, Gemini 2.5 Flash, Gemini 3 Flash

// Look up by registry ID or AI SDK model string
const model = getModelById("gemini-flash");
const model2 = findModelEntry("gpt-4o"); // by modelId
console.log(model?.name); // 'Gemini 2.5 Flash'
console.log(model?.pricing); // { input: 0.30, output: 2.50 }

// Filter by capability
const reasoning = getModelsByCapability({ reasoning: true });
// → GPT-5.2, o4-mini, Claude Opus 4.6, Gemini 2.5 Pro

// Check if a model is a reasoning model
console.log(isReasoningModel("gpt-5.2")); // true
console.log(isReasoningModel("gpt-4o")); // false

// Calculate cost for a known model
const cost = calculateCost("gpt-4o", 1000, 500);
console.log(cost); // USD

// Filter by available API keys
const available = getAvailableModels("standard", ["openai", "google"]);
// → Only models from providers whose keys are set

// Runtime registration (append-only)
registerModel({
  id: "my-custom",
  name: "My Custom Model",
  provider: "openai",
  modelId: "ft:gpt-4o:my-org::abc",
  tier: "standard",
  pricing: { input: 3.0, output: 12.0 },
  contextWindow: 128_000,
  maxOutput: 16_384,
  capabilities: {
    reasoning: false,
    structuredOutput: true,
    streaming: true,
    vision: true,
    seed: false,
  },
});
```

### Cost Estimation

```typescript
import { estimateCost } from "@younndai/ai-relay";

const estimate = estimateCost("Your input text...", {
  format: "min", // 'canon' | 'min' | 'ultra'
  modelId: "gpt4o-mini", // Uses registry pricing (optional, defaults to gpt4o-mini)
});

console.log(estimate.estimatedCostUsd);
console.log(estimate.estimatedSavingsPercent); // % saved by compression
```

### Embeddings

```typescript
import { embed, embedMany } from "@younndai/ai-relay";

const { embedding } = await embed({ value: "Hello world" });
const { embeddings } = await embedMany({ values: ["Hello", "World"] });
```

### Provider Resolution

```typescript
import { resolveModel } from "@younndai/ai-relay";

// Automatically routes to the correct AI SDK provider
const model = resolveModel("gpt-4o-mini"); // → OpenAI
const model2 = resolveModel("claude-4-sonnet"); // → Anthropic
const model3 = resolveModel("gemini-2.5-flash"); // → Google
```

| Prefix                                    | Provider                                         |
| ----------------------------------------- | ------------------------------------------------ |
| `gpt-*`, `o1*`, `o3*`, `o4*`, `chatgpt-*` | OpenAI                                           |
| `claude-*`                                | Anthropic                                        |
| `gemini-*`                                | Google                                           |
| Other                                     | Throws (or OpenAI if `strictModelRouting:false`) |

> The free `resolveModel` keeps the legacy OpenAI fallback for backward compatibility. `createRelay()` clients default to **strict routing** — an unrecognized model throws a clear error instead of routing to the wrong endpoint.

## Local models (Ollama / LM Studio / vLLM)

Local LLM support is built on an OpenAI-compatible seam. Anything that speaks the OpenAI HTTP API — Ollama, LM Studio, vLLM, llama.cpp's server — plugs in through `@ai-sdk/openai-compatible` and the AI SDK provider registry, the same registry `createRelay()` uses internally.

```bash
npm install @ai-sdk/openai-compatible   # optional peer dependency
```

```typescript
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createProviderRegistry, generateText } from "ai";

// One-liner registration — no change to ai-relay's core routing.
const registry = createProviderRegistry({
  local: createOpenAICompatible({
    name: "local",
    baseURL: "http://localhost:11434/v1", // Ollama default
  }),
});

const { text } = await generateText({
  model: registry.languageModel("local:llama3.1"),
  prompt: "Hello from a local model.",
});
```

The seam is intentionally a *registration*, not a code change: ai-relay's client is a thin layer over the same `createProviderRegistry`, so adding a local provider is the same one-liner you'd write directly against the AI SDK. Native first-class `local:` routing inside `createRelay()` is on the roadmap.

## Model Registry

All models are defined in a single registry (`model-registry.ts`). To add a new model, add one entry — all consumers pick it up automatically. Consumers can also add models at runtime via `registerModel()` (append-only).

Pricing last verified: **2026-05-09** (official sources).

### Budget Tier

| ID                    | Name                  | Provider | Input $/1M | Output $/1M | Context | Reasoning | Vision | Seed |
| --------------------- | --------------------- | -------- | ---------- | ----------- | ------- | --------- | ------ | ---- |
| `gpt5-nano`           | GPT-5-nano            | OpenAI   | $0.05      | $0.40       | 128K    | ✗         | ✓      | ✓    |
| `gemini-flash-lite`   | Gemini 2.5 Flash-Lite | Google   | $0.10      | $0.40       | 1M      | ✗         | ✗      | ✗    |
| `gemini31-flash-lite` | Gemini 3.1 Flash-Lite | Google   | $0.25      | $1.50       | 1M      | ✓         | ✓      | ✗    |

### Standard Tier

| ID              | Name             | Provider  | Input $/1M | Output $/1M | Context | Reasoning | Vision | Seed |
| --------------- | ---------------- | --------- | ---------- | ----------- | ------- | --------- | ------ | ---- |
| `gpt4o-mini`    | GPT-4o-mini      | OpenAI    | $0.15      | $0.60       | 128K    | ✗         | ✓      | ✗    |
| `gpt5-mini`     | GPT-5-mini       | OpenAI    | $0.25      | $2.00       | 128K    | ✗         | ✓      | ✗    |
| `gpt4o`         | GPT-4o           | OpenAI    | $2.50      | $10.00      | 128K    | ✗         | ✓      | ✗    |
| `claude-haiku`  | Claude Haiku 4.5 | Anthropic | $1.00      | $5.00       | 200K    | ✗         | ✓      | ✗    |
| `gemini-flash`  | Gemini 2.5 Flash | Google    | $0.30      | $2.50       | 1M      | ✗         | ✓      | ✗    |
| `gemini3-flash` | Gemini 3 Flash   | Google    | $0.50      | $3.00       | 1M      | ✓         | ✓      | ✗    |

### Premium Tier

| ID              | Name              | Provider  | Input $/1M | Output $/1M | Context | Reasoning | Vision | Seed |
| --------------- | ----------------- | --------- | ---------- | ----------- | ------- | --------- | ------ | ---- |
| `gpt52`         | GPT-5.2           | OpenAI    | $1.75      | $14.00      | 400K    | ✓         | ✓      | ✗    |
| `o4-mini`       | o4-mini           | OpenAI    | $1.10      | $4.40       | 200K    | ✓         | ✗      | ✗    |
| `claude-sonnet` | Claude Sonnet 4.6 | Anthropic | $3.00      | $15.00      | 200K    | ✗         | ✓      | ✗    |
| `claude-opus`   | Claude Opus 4.6   | Anthropic | $5.00      | $25.00      | 200K    | ✓         | ✓      | ✗    |
| `gemini-pro`    | Gemini 2.5 Pro    | Google    | $1.25      | $10.00      | 1M      | ✓         | ✓      | ✗    |
| `gemini31-pro`  | Gemini 3.1 Pro    | Google    | $2.00      | $12.00      | 1M      | ✓         | ✓      | ✗    |

### Model Presets (Workload-Based)

For quick single-model usage without specifying a model string. Presets are dynamic — override with `configurePresets()` at startup.

| Preset      | Default Model | Cost (in/out per 1M tokens) |
| ----------- | ------------- | --------------------------- |
| `fast`      | gpt-5-mini    | $0.25 / $2.00               |
| `balanced`  | gpt-4.1       | $2.00 / $8.00               |
| `reasoning` | gpt-5.4       | $2.50 / $15.00              |
| `cheap`     | gpt-5-nano    | $0.05 / $0.40               |

> Preset defaults may reference any model in the registry, including ones not listed in the tier tables above. The cost column is the authoritative figure for each preset.

```typescript
import {
  configurePresets,
  getPresetModelId,
  resetPresets,
} from "@younndai/ai-relay";

// Override at startup (partial — only override what you need)
configurePresets({ fast: "gemini-2.5-flash", reasoning: "claude-opus-4-6" });

// Query current mapping
console.log(getPresetModelId("fast")); // 'gemini-2.5-flash'

// Reset to defaults (for testing)
resetPresets();
```

## Temperature

`askAllModels` and `askModel` apply **provider-aware temperature defaults**:

| Provider  | Default Temperature | Rationale |
| --------- | ------------------- | --------- |
| OpenAI    | `0`                 | Deterministic output for benchmarks |
| Anthropic | `0`                 | Deterministic output for benchmarks |
| Google    | `1.0`               | [Gemini 3 requires temperature=1.0](https://ai.google.dev/gemini-api/docs/gemini-3#temperature) — values below 1.0 cause looping/degraded performance |

You can override by passing an explicit `temperature` value — the override always wins.

## Retry & Backoff

- `maxAttempts` controls total attempts (default: 2 for `generate`, 3 for `askAllModels`)
- Only transient errors are retried (5xx, 429 rate limits, timeouts)
- Auth errors (401), bad requests (400), forbidden (403) fail immediately
- Retries use exponential backoff: 2s → 4s → 8s (`askAllModels`), 500ms → 1s → 2s → 4s (`generate`)

## Exported Types

```typescript
import type {
  // Generation
  GenerateOptions,
  GenerateResult,
  GenerateObjectOptions,
  GenerateObjectResult,
  StreamChunk,
  ModelPreset,
  // Embeddings
  EmbedOptions,
  EmbedResult,
  EmbedManyOptions,
  EmbedManyResult,
  // Cost
  CostEstimate,
  // Relay client
  Relay,
  RelayConfig,
  ProviderConfig,
  ProviderConfigMap,
  CostSink,
  CostEntry,
  CostTotals,
  ProviderCost,
  AskAllOptions,
  // Registry
  ModelEntry,
  ModelCapabilities,
  ProviderName,
  // Multi-model
  MultiModelResponse,
  AskAllModelsOptions,
} from "@younndai/ai-relay";
```

## Architecture

```text
@younndai/ai-relay (Apache 2.0)
├── relay.ts           — createRelay(): config-scoped client over createProviderRegistry
├── relay-config.ts    — RelayConfig, CostSink, CostEntry, CostTotals types
├── cost-middleware.ts — per-client cost attribution (wrapLanguageModel middleware)
├── generator-core.ts  — generation logic (retry/timeout/streaming), resolver-agnostic
├── default-client.ts  — the shared default client backing the free functions
├── model-presets.ts   — preset names + defaults (leaf module)
├── model-registry.ts  — MODEL_REGISTRY, lookups, pricing, capabilities, registerModel()
├── multi-model.ts     — askAllModels()
├── providers.ts       — resolveModel(), configurePresets() (default-client facade)
├── generator.ts       — generate(), generateObject(), stream() (default-client facade)
├── tokenizer.ts       — countTokens(), estimateCost()
├── embeddings.ts      — embed(), embedMany()
├── env.ts             — hasProviderKey(), getAvailableProviders()
├── cost-tracker.ts    — process-global recordUsage(), getTotalCost() (back-compat)
└── timer.ts           — startTimer(), measure(), localTimestamp()
```

Model routing goes through the AI SDK's `createProviderRegistry`, with a per-client cost middleware applied via `wrapLanguageModel`. `createRelay()` makes independent clients; the free functions delegate to a shared default client.

Presets are dynamic — override per-client via `createRelay({ presets })`, or on the default client via `configurePresets()` at startup. No env vars, no config files.

Prompt building, output parsing, and domain-specific validation live in the application code that consumes this gateway.

## Documentation

| Document                         | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| [Benchmarks](BENCHMARKS.md)      | Historical model benchmark report (provenance for preset selection)  |
| [Testing](TESTING.md)            | Test architecture, offline/online split, how to run                  |
| [Changelog](CHANGELOG.md)        | Version history and release notes                                    |

## The YON Project

YON™ is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Testing

```bash
# Run all tests
npx vitest run
```

Deterministic suites run offline. Provider-live suites (`generate`, `stream`, `embeddings`) auto-skip via `describe.skipIf` when no provider API keys are present. See [TESTING.md](./TESTING.md) for the test architecture.

---

## About YounndAI

**YounndAI™ — You and AI, unified.** (pronounced *"yoon-dye"*)

A philosophy of intelligence: building with intention, so humans and machines
think together without losing what makes either whole.

## License & Attribution

Apache-2.0. © 2026 MARLINK TRADING SRL (YounndAI). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

"YON" and "YounndAI" are trademarks of MARLINK TRADING SRL — see [`TRADEMARK.md`](./TRADEMARK.md).

Created by [Alexandru Mareș](https://allemaar.com).

Website: [yon.younndai.com](https://yon.younndai.com)

<p align="center"><em>Structure before scale. Harmony above all.</em></p>

---

|               |                                                         |
| ------------- | ------------------------------------------------------- |
| **Spec**      | [YON v2.0](https://yon.younndai.com)                    |
| **Author**    | [Alexandru Mareș](https://allemaar.com)                 |
| **Company**   | [MARLINK TRADING SRL](https://younndai.com) · YounndAI™ |
| **License**   | [Apache 2.0](./LICENSE) — © 2026 MARLINK TRADING SRL    |
| **Trademark** | [YounndAI™ Trademark Guidelines](./TRADEMARK.md)        |
