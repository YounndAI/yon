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
 * @younndai/ai-relay — Generation Core
 *
 * Provider-resolution-agnostic generation logic. Both the relay client and the
 * back-compat free functions call these with a `deps` object that supplies the
 * model resolver + preset resolver — so the retry/timeout/streaming behavior is
 * implemented exactly once.
 *
 * Simplicity is intentional. Complexity belongs elsewhere.
 *
 * @license Apache-2.0
 */

import { generateText, Output, streamText, type LanguageModel } from 'ai';
import type { ZodSchema } from 'zod';
import { findModelEntry } from './model-registry.js';
import type { ModelPreset } from './model-presets.js';

export type { ModelPreset } from './model-presets.js';

/**
 * Resolution dependencies — supplied by the caller (relay client or default
 * client). Keeps generation logic decoupled from how models are wired.
 */
export interface ResolveDeps {
  resolveModel(model: string): LanguageModel;
  getPresetModel(preset: ModelPreset): LanguageModel;
}

// ---------------------------------------------------------------------------
// Public option/result types (re-exported by generator.ts for back-compat)
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  system: string;
  prompt: string;
  preset?: ModelPreset;
  model?: string;
  maxTokens?: number;
  maxAttempts?: number;
  timeoutMs?: number;
  temperature?: number;
  /** Pre-built LanguageModel (BYOK). Bypasses resolveModel(). */
  byokModel?: LanguageModel;
  /** AI SDK tools for tool-calling (channel operations). */
  tools?: Parameters<typeof streamText>[0]['tools'];
  /** Max agentic steps when tools are provided (default 5). */
  maxSteps?: number;
}

export interface GenerateResult {
  text: string;
  usage: { input: number; output: number };
  finishReason: string;
}

export interface StreamChunk {
  type: 'partial' | 'complete' | 'error' | 'tool-call' | 'tool-result';
  content?: string;
  result?: GenerateResult;
  error?: string;
  toolCall?: { toolCallId: string; toolName: string; args: unknown };
  toolResult?: { toolCallId: string; toolName: string; result: unknown };
}

export interface LogprobToken {
  token: string;
  logprob: number;
  topLogprobs?: { token: string; logprob: number }[];
}

export interface LogprobResult extends GenerateResult {
  logprobs: LogprobToken[];
}

export interface LogprobOptions extends GenerateOptions {
  topLogprobs?: number;
}

export interface GenerateObjectOptions<T> {
  system: string;
  prompt: string;
  schema: ZodSchema<T>;
  mode?: 'json' | 'tool';
  schemaName?: string;
  schemaDescription?: string;
  preset?: ModelPreset;
  model?: string;
  maxTokens?: number;
  maxAttempts?: number;
  timeoutMs?: number;
  temperature?: number;
  seed?: number;
}

export interface GenerateObjectResult<T> {
  object: T;
  usage: { input: number; output: number };
}

// ---------------------------------------------------------------------------
// Retry / timeout primitives
// ---------------------------------------------------------------------------

/** Only retry transient failures (5xx, rate limits, timeouts). */
function isRetryable(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const statusCode = 'statusCode' in error ? (error as { statusCode: number }).statusCode : undefined;
    const status = 'status' in error ? (error as { status: number }).status : undefined;
    const code = statusCode ?? status;
    if (code !== undefined) {
      if (code === 401 || code === 403) return false;
      return code >= 500 || code === 429;
    }
  }
  return true;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout: ${message} (${ms}ms)`)), ms);
    }),
  ]);
}

/** Exponential backoff with jitter. 500ms → 1s → 2s → 4s cap. */
async function backoff(attempt: number): Promise<void> {
  const base = Math.min(500 * 2 ** (attempt - 1), 4000);
  const jitter = Math.random() * base * 0.25;
  await new Promise((r) => setTimeout(r, base + jitter));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts: number; timeoutMs: number; label: string },
): Promise<T> {
  let attempts = 0;
  let lastError: Error | null = null;
  while (attempts < opts.maxAttempts) {
    attempts++;
    try {
      return await withTimeout(fn(), opts.timeoutMs, `${opts.label} attempt ${attempts}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!isRetryable(error)) break;
      if (attempts < opts.maxAttempts) await backoff(attempts);
    }
  }
  throw new Error(`${opts.label} failed after ${attempts} attempts: ${lastError?.message}`);
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export async function runGenerate(deps: ResolveDeps, options: GenerateOptions): Promise<GenerateResult> {
  const model =
    options.byokModel ??
    (options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced'));

  const { text, usage, finishReason } = await withRetry(
    () =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
      }),
    {
      maxAttempts: options.maxAttempts ?? 2,
      timeoutMs: options.timeoutMs ?? 30000,
      label: 'Generation',
    },
  );

  return {
    text,
    usage: { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0 },
    finishReason,
  };
}

export async function runGenerateWithLogprobs(deps: ResolveDeps, options: LogprobOptions): Promise<LogprobResult> {
  const model = options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced');
  const logprobsValue = options.topLogprobs ?? true;

  const result = await withRetry(
    () =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        providerOptions: { openai: { logprobs: logprobsValue } },
      }),
    {
      maxAttempts: options.maxAttempts ?? 2,
      timeoutMs: options.timeoutMs ?? 30000,
      label: 'Logprob generation',
    },
  );

  const metadata = result.providerMetadata as
    | { openai?: { logprobs?: Array<Array<{ token: string; logprob: number; top_logprobs?: Array<{ token: string; logprob: number }> }>> } }
    | undefined;

  const rawLogprobs = metadata?.openai?.logprobs?.[0] ?? [];
  const logprobs: LogprobToken[] = rawLogprobs.map((lp) => ({
    token: lp.token,
    logprob: lp.logprob,
    ...(lp.top_logprobs && { topLogprobs: lp.top_logprobs }),
  }));

  return {
    text: result.text,
    usage: { input: result.usage.inputTokens ?? 0, output: result.usage.outputTokens ?? 0 },
    finishReason: result.finishReason,
    logprobs,
  };
}

export async function runGenerateObject<T>(
  deps: ResolveDeps,
  options: GenerateObjectOptions<T>,
): Promise<GenerateObjectResult<T>> {
  const modelId = options.model ?? undefined;
  const model = modelId ? deps.resolveModel(modelId) : deps.getPresetModel(options.preset ?? 'balanced');
  const entry = modelId ? findModelEntry(modelId) : undefined;

  const result = await withRetry(
    () =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        output: Output.object({
          schema: options.schema,
          ...(options.schemaName && { schemaName: options.schemaName }),
          ...(options.schemaDescription && { schemaDescription: options.schemaDescription }),
        }),
        ...(options.mode && { mode: options.mode }),
        maxOutputTokens: options.maxTokens ?? 4000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(options.seed !== undefined && entry?.capabilities.seed !== false && { seed: options.seed }),
      }),
    {
      maxAttempts: options.maxAttempts ?? 2,
      timeoutMs: options.timeoutMs ?? 45000,
      label: 'Structured generation',
    },
  );

  return {
    object: result.output as T,
    usage: { input: result.usage.inputTokens ?? 0, output: result.usage.outputTokens ?? 0 },
  };
}

export async function* runStream(deps: ResolveDeps, options: GenerateOptions): AsyncGenerator<StreamChunk> {
  const model =
    options.byokModel ??
    (options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced'));
  const maxAttempts = options.maxAttempts ?? 2;
  const timeoutMs = options.timeoutMs ?? 60000;
  const hasTools = options.tools && Object.keys(options.tools).length > 0;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = streamText({
        model,
        system: options.system,
        prompt: options.prompt,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(hasTools && { tools: options.tools, maxSteps: options.maxSteps ?? 5 }),
        abortSignal: controller.signal,
      });

      let fullText = '';
      let chunksReceived = false;

      try {
        if (hasTools) {
          for await (const part of response.fullStream) {
            chunksReceived = true;
            switch (part.type) {
              case 'text-delta':
                fullText += part.text;
                yield { type: 'partial', content: part.text };
                break;
              case 'tool-call':
                yield {
                  type: 'tool-call',
                  toolCall: { toolCallId: part.toolCallId, toolName: part.toolName, args: part.input },
                };
                break;
              case 'tool-result':
                yield {
                  type: 'tool-result',
                  toolResult: { toolCallId: part.toolCallId, toolName: part.toolName, result: part.output },
                };
                break;
            }
          }
        } else {
          for await (const chunk of response.textStream) {
            chunksReceived = true;
            fullText += chunk;
            yield { type: 'partial', content: chunk };
          }
        }

        const usage = await response.usage;
        const finReason = await response.finishReason;
        clearTimeout(timer);

        yield {
          type: 'complete',
          result: {
            text: fullText,
            usage: { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0 },
            finishReason: finReason,
          },
        };
        return;
      } catch (streamError) {
        clearTimeout(timer);
        if (chunksReceived) {
          yield {
            type: 'error',
            error: streamError instanceof Error ? streamError.message : String(streamError),
          };
          return;
        }
        throw streamError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!isRetryable(error)) break;
      if (attempt < maxAttempts) await backoff(attempt);
    }
  }

  yield {
    type: 'error',
    error: `Stream failed after ${maxAttempts} attempts: ${lastError?.message}`,
  };
}
