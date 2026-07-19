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
  /** Optional caller-owned cancellation signal. */
  abortSignal?: AbortSignal;
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
  errorKind?: StreamErrorKind;
  toolCall?: { toolCallId: string; toolName: string; args: unknown };
  toolResult?: { toolCallId: string; toolName: string; result: unknown };
}

export type StreamErrorKind = 'caller-abort' | 'timeout' | 'provider';

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
  /** Optional caller-owned cancellation signal. */
  abortSignal?: AbortSignal;
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

const ABORT_SETTLEMENT_GRACE_MS = 250;

/** A relay-owned attempt exceeded its absolute deadline. */
export class GenerationTimeoutError extends Error {
  readonly code = 'AI_RELAY_TIMEOUT' as const;

  constructor(
    message: string,
    readonly attempt: number,
    readonly timeoutMs: number,
    readonly providerSettled: boolean,
  ) {
    super(message);
    this.name = 'GenerationTimeoutError';
  }
}

type AttemptOutcome<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: unknown };

type BoundaryCause =
  | { kind: 'caller-abort'; reason: unknown }
  | { kind: 'timeout' }
  | { kind: 'consumer-close' };

interface AttemptBoundary {
  readonly signal: AbortSignal;
  readonly cause: Promise<BoundaryCause>;
  current(): BoundaryCause | 'provider' | undefined;
  settleProvider(): boolean;
  closeConsumer(): boolean;
  cleanup(): void;
}

function createAbortError(): Error {
  if (typeof globalThis.DOMException === 'function') {
    return new globalThis.DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
}

function callerAbortReason(signal: AbortSignal): unknown {
  return signal.reason !== undefined ? signal.reason : createAbortError();
}

function throwIfCallerAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw callerAbortReason(signal);
}

function createAttemptBoundary(caller: AbortSignal | undefined, timeoutMs: number): AttemptBoundary {
  const controller = new AbortController();
  let latched: BoundaryCause | 'provider' | undefined;
  let resolveCause!: (cause: BoundaryCause) => void;
  const cause = new Promise<BoundaryCause>((resolve) => {
    resolveCause = resolve;
  });

  const latch = (next: BoundaryCause | 'provider'): boolean => {
    if (latched !== undefined) return false;
    latched = next;
    if (next !== 'provider') {
      resolveCause(next);
      controller.abort(next.kind === 'caller-abort' ? next.reason : undefined);
    }
    return true;
  };

  const onCallerAbort = () => {
    if (caller) latch({ kind: 'caller-abort', reason: callerAbortReason(caller) });
  };
  caller?.addEventListener('abort', onCallerAbort, { once: true });
  if (caller?.aborted) onCallerAbort();

  const timer = setTimeout(() => latch({ kind: 'timeout' }), timeoutMs);

  return {
    signal: controller.signal,
    cause,
    current: () => latched,
    settleProvider: () => latch('provider'),
    closeConsumer: () => latch({ kind: 'consumer-close' }),
    cleanup() {
      clearTimeout(timer);
      caller?.removeEventListener('abort', onCallerAbort);
    },
  };
}

function observe<T>(promise: Promise<T>): Promise<AttemptOutcome<T>> {
  return promise.then(
    (value) => ({ status: 'fulfilled', value }),
    (reason: unknown) => ({ status: 'rejected', reason }),
  );
}

async function settlesWithinGrace<T>(observed: Promise<AttemptOutcome<T>>): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const result = await Promise.race([
    observed.then(() => true),
    new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), ABORT_SETTLEMENT_GRACE_MS);
    }),
  ]);
  if (timer !== undefined) clearTimeout(timer);
  return result;
}

type AttemptResult<T> =
  | { kind: 'fulfilled'; value: T }
  | { kind: 'provider-error'; error: unknown }
  | { kind: 'caller-abort'; reason: unknown }
  | { kind: 'timeout'; error: GenerationTimeoutError };

/**
 * Abort one provider attempt at its deadline and prove it settled before a
 * retry is allowed. A signal-ignoring provider gets a bounded failure after a
 * short grace period; its eventual rejection is observed and no overlapping
 * retry is started.
 */
async function runAbortableAttempt<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  message: string,
  callerSignal: AbortSignal | undefined,
  attemptNumber: number,
): Promise<AttemptResult<T>> {
  const boundary = createAttemptBoundary(callerSignal, ms);
  const operation = Promise.resolve().then(async () => {
    if (boundary.current() !== undefined) return new Promise<T>(() => undefined);
    return fn(boundary.signal);
  });
  const observed = observe(operation);

  try {
    const first = await Promise.race([
      observed.then((outcome) => ({
        source: 'provider' as const,
        outcome,
        won: boundary.settleProvider(),
      })),
      boundary.cause.then((cause) => ({ source: 'boundary' as const, cause })),
    ]);

    if (first.source === 'provider' && first.won) {
      return first.outcome.status === 'fulfilled'
        ? { kind: 'fulfilled', value: first.outcome.value }
        : { kind: 'provider-error', error: first.outcome.reason };
    }

    const cause = first.source === 'boundary' ? first.cause : boundary.current();
    if (!cause || cause === 'provider' || cause.kind === 'consumer-close') {
      throw new Error('Invalid promise-attempt boundary state');
    }
    const providerSettled = await settlesWithinGrace(observed);
    if (cause.kind === 'caller-abort') return { kind: 'caller-abort', reason: cause.reason };
    return {
      kind: 'timeout',
      error: new GenerationTimeoutError(
        `Timeout: ${message} (${ms}ms)${providerSettled ? '' : `; provider did not settle within ${ABORT_SETTLEMENT_GRACE_MS}ms after abort`}`,
        attemptNumber,
        ms,
        providerSettled,
      ),
    };
  } finally {
    boundary.cleanup();
  }
}

/** Exponential backoff with jitter. 500ms → 1s → 2s → 4s cap. */
async function backoff(attempt: number, callerSignal: AbortSignal | undefined): Promise<void> {
  throwIfCallerAborted(callerSignal);
  const base = Math.min(500 * 2 ** (attempt - 1), 4000);
  const jitter = Math.random() * base * 0.25;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, base + jitter);
      }),
      new Promise<never>((_, reject) => {
        if (!callerSignal) return;
        onAbort = () => reject(callerAbortReason(callerSignal));
        callerSignal.addEventListener('abort', onAbort, { once: true });
        if (callerSignal.aborted) onAbort();
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (onAbort) callerSignal?.removeEventListener('abort', onAbort);
  }
}

async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: { maxAttempts: number; timeoutMs: number; label: string; abortSignal?: AbortSignal },
): Promise<T> {
  throwIfCallerAborted(opts.abortSignal);
  let attempts = 0;
  let lastError: unknown;
  while (attempts < opts.maxAttempts) {
    attempts++;
    const result = await runAbortableAttempt(
      fn,
      opts.timeoutMs,
      `${opts.label} attempt ${attempts}`,
      opts.abortSignal,
      attempts,
    );
    if (result.kind === 'fulfilled') return result.value;
    if (result.kind === 'caller-abort') throw result.reason;
    if (result.kind === 'timeout') {
      lastError = result.error;
      if (!result.error.providerSettled) throw result.error;
    } else {
      lastError = result.error;
      if (!isRetryable(result.error)) break;
    }
    if (attempts < opts.maxAttempts) await backoff(attempts, opts.abortSignal);
  }
  if (lastError instanceof GenerationTimeoutError) throw lastError;
  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`${opts.label} failed after ${attempts} attempts: ${message}`);
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export async function runGenerate(deps: ResolveDeps, options: GenerateOptions): Promise<GenerateResult> {
  throwIfCallerAborted(options.abortSignal);
  const model =
    options.byokModel ??
    (options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced'));

  const { text, usage, finishReason } = await withRetry(
    (abortSignal) =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        abortSignal,
        maxRetries: 0,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
      }),
    {
      maxAttempts: options.maxAttempts ?? 2,
      timeoutMs: options.timeoutMs ?? 30000,
      label: 'Generation',
      abortSignal: options.abortSignal,
    },
  );

  return {
    text,
    usage: { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0 },
    finishReason,
  };
}

export async function runGenerateWithLogprobs(deps: ResolveDeps, options: LogprobOptions): Promise<LogprobResult> {
  throwIfCallerAborted(options.abortSignal);
  const model = options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced');
  const logprobsValue = options.topLogprobs ?? true;

  const result = await withRetry(
    (abortSignal) =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        abortSignal,
        maxRetries: 0,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        providerOptions: { openai: { logprobs: logprobsValue } },
      }),
    {
      maxAttempts: options.maxAttempts ?? 2,
      timeoutMs: options.timeoutMs ?? 30000,
      label: 'Logprob generation',
      abortSignal: options.abortSignal,
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
  throwIfCallerAborted(options.abortSignal);
  const modelId = options.model ?? undefined;
  const model = modelId ? deps.resolveModel(modelId) : deps.getPresetModel(options.preset ?? 'balanced');
  const entry = modelId ? findModelEntry(modelId) : undefined;

  const result = await withRetry(
    (abortSignal) =>
      generateText({
        model,
        system: options.system,
        prompt: options.prompt,
        abortSignal,
        maxRetries: 0,
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
      abortSignal: options.abortSignal,
    },
  );

  return {
    object: result.output as T,
    usage: { input: result.usage.inputTokens ?? 0, output: result.usage.outputTokens ?? 0 },
  };
}

export async function* runStream(deps: ResolveDeps, options: GenerateOptions): AsyncGenerator<StreamChunk> {
  if (options.abortSignal?.aborted) {
    yield {
      type: 'error',
      error: String(callerAbortReason(options.abortSignal)),
      errorKind: 'caller-abort',
    };
    return;
  }
  const model =
    options.byokModel ??
    (options.model ? deps.resolveModel(options.model) : deps.getPresetModel(options.preset ?? 'balanced'));
  const maxAttempts = options.maxAttempts ?? 2;
  const timeoutMs = options.timeoutMs ?? 60000;
  const hasTools = options.tools && Object.keys(options.tools).length > 0;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    lastError = undefined;
    const boundary = createAttemptBoundary(options.abortSignal, timeoutMs);
    let iterator: AsyncIterator<unknown> | undefined;
    let finished = false;
    let outputStarted = false;

    const closeIterator = async (): Promise<boolean> => {
      const currentIterator = iterator;
      iterator = undefined;
      const returnIterator = currentIterator?.return;
      if (!returnIterator) return true;
      const returned = observe(
        Promise.resolve().then(() => returnIterator.call(currentIterator)),
      );
      return settlesWithinGrace(returned);
    };

    const closeAttempt = async (): Promise<boolean> => {
      boundary.closeConsumer();
      try {
        return await closeIterator();
      } finally {
        boundary.cleanup();
        finished = true;
      }
    };

    const waitForRetry = async (): Promise<unknown | undefined> => {
      try {
        await backoff(attempt, options.abortSignal);
        return undefined;
      } catch (error) {
        return error;
      }
    };

    try {
      if (boundary.current() !== undefined) {
        const cause = boundary.current();
        if (cause && cause !== 'provider' && cause.kind === 'caller-abort') {
          yield { type: 'error', error: String(cause.reason), errorKind: 'caller-abort' };
          return;
        }
      }

      const response = streamText({
        model,
        system: options.system,
        prompt: options.prompt,
        maxRetries: 0,
        maxOutputTokens: options.maxTokens ?? 2000,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(hasTools && { tools: options.tools, maxSteps: options.maxSteps ?? 5 }),
        abortSignal: boundary.signal,
      });

      let fullText = '';
      iterator = (hasTools ? response.fullStream : response.textStream)[Symbol.asyncIterator]();

      while (true) {
        const pendingNext = Promise.resolve(iterator.next());
        const observedNext = observe(pendingNext);
        const advanced = await Promise.race([
          observedNext.then((outcome) => ({ source: 'provider' as const, outcome })),
          boundary.cause.then((cause) => ({ source: 'boundary' as const, cause })),
        ]);

        if (advanced.source === 'boundary') {
          const providerSettled = await settlesWithinGrace(observedNext);
          if (advanced.cause.kind === 'caller-abort') {
            yield { type: 'error', error: String(advanced.cause.reason), errorKind: 'caller-abort' };
            return;
          }
          const timeoutError = new GenerationTimeoutError(
            `Timeout: Stream attempt ${attempt} (${timeoutMs}ms)${providerSettled ? '' : `; provider did not settle within ${ABORT_SETTLEMENT_GRACE_MS}ms after abort`}`,
            attempt,
            timeoutMs,
            providerSettled,
          );
          lastError = timeoutError;
          if (outputStarted || !providerSettled || attempt >= maxAttempts) {
            yield { type: 'error', error: timeoutError.message, errorKind: 'timeout' };
            return;
          }
          break;
        }

        if (advanced.outcome.status === 'rejected') throw advanced.outcome.reason;
        const item = advanced.outcome.value;
        if (item.done) break;

        if (hasTools) {
          const part = item.value as { type: string };
          outputStarted = true;
          switch (part.type) {
            case 'text-delta': {
              const textPart = part as { type: 'text-delta'; text: string };
              fullText += textPart.text;
              yield { type: 'partial', content: textPart.text };
              break;
            }
            case 'tool-call': {
              const toolCall = part as {
                type: 'tool-call';
                toolCallId: string;
                toolName: string;
                input: unknown;
              };
              yield {
                type: 'tool-call',
                toolCall: {
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  args: toolCall.input,
                },
              };
              break;
            }
            case 'tool-result': {
              const toolResult = part as {
                type: 'tool-result';
                toolCallId: string;
                toolName: string;
                output: unknown;
              };
              yield {
                type: 'tool-result',
                toolResult: {
                  toolCallId: toolResult.toolCallId,
                  toolName: toolResult.toolName,
                  result: toolResult.output,
                },
              };
              break;
            }
          }
        } else {
          const chunk = item.value as string;
          outputStarted = true;
          fullText += chunk;
          yield { type: 'partial', content: chunk };
        }
      }

      if (lastError instanceof GenerationTimeoutError) {
        const iteratorClosed = await closeAttempt();
        if (!iteratorClosed) {
          const timeoutError = new GenerationTimeoutError(
            `Timeout: Stream attempt ${attempt} (${timeoutMs}ms); iterator did not close within ${ABORT_SETTLEMENT_GRACE_MS}ms after abort`,
            attempt,
            timeoutMs,
            false,
          );
          yield { type: 'error', error: timeoutError.message, errorKind: 'timeout' };
          return;
        }
        const backoffError = await waitForRetry();
        if (backoffError !== undefined) {
          yield { type: 'error', error: String(backoffError), errorKind: 'caller-abort' };
          return;
        }
        continue;
      }

      const metadata = observe(Promise.all([response.usage, response.finishReason]));
      const terminal = await Promise.race([
        metadata.then((outcome) => ({
          source: 'provider' as const,
          outcome,
          won: boundary.settleProvider(),
        })),
        boundary.cause.then((cause) => ({ source: 'boundary' as const, cause })),
      ]);
      if (terminal.source === 'boundary') {
        const providerSettled = await settlesWithinGrace(metadata);
        if (terminal.cause.kind === 'caller-abort') {
          yield { type: 'error', error: String(terminal.cause.reason), errorKind: 'caller-abort' };
          return;
        }
        const timeoutError = new GenerationTimeoutError(
          `Timeout: Stream attempt ${attempt} (${timeoutMs}ms)${providerSettled ? '' : `; provider metadata did not settle within ${ABORT_SETTLEMENT_GRACE_MS}ms after abort`}`,
          attempt,
          timeoutMs,
          providerSettled,
        );
        if (outputStarted || !providerSettled || attempt >= maxAttempts) {
          yield { type: 'error', error: timeoutError.message, errorKind: 'timeout' };
          return;
        }
        lastError = timeoutError;
        const iteratorClosed = await closeAttempt();
        if (!iteratorClosed) {
          const closeTimeoutError = new GenerationTimeoutError(
            `Timeout: Stream attempt ${attempt} (${timeoutMs}ms); iterator did not close within ${ABORT_SETTLEMENT_GRACE_MS}ms after abort`,
            attempt,
            timeoutMs,
            false,
          );
          yield { type: 'error', error: closeTimeoutError.message, errorKind: 'timeout' };
          return;
        }
        const backoffError = await waitForRetry();
        if (backoffError !== undefined) {
          yield { type: 'error', error: String(backoffError), errorKind: 'caller-abort' };
          return;
        }
        continue;
      }
      if (!terminal.won) {
        const cause = boundary.current();
        if (cause && cause !== 'provider' && cause.kind === 'caller-abort') {
          yield { type: 'error', error: String(cause.reason), errorKind: 'caller-abort' };
          return;
        }
        const timeoutError = new GenerationTimeoutError(
          `Timeout: Stream attempt ${attempt} (${timeoutMs}ms)`,
          attempt,
          timeoutMs,
          true,
        );
        yield { type: 'error', error: timeoutError.message, errorKind: 'timeout' };
        return;
      }
      if (terminal.outcome.status === 'rejected') throw terminal.outcome.reason;

      finished = true;
      const [usage, finReason] = terminal.outcome.value;
      yield {
        type: 'complete',
        result: {
          text: fullText,
          usage: { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0 },
          finishReason: finReason,
        },
      };
      return;
    } catch (error) {
      lastError = error;
      if (outputStarted || !isRetryable(error) || attempt >= maxAttempts) {
        yield {
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          errorKind: 'provider',
        };
        return;
      }
      const iteratorClosed = await closeAttempt();
      if (!iteratorClosed) {
        yield {
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          errorKind: 'provider',
        };
        return;
      }
      const backoffError = await waitForRetry();
      if (backoffError !== undefined) {
        yield { type: 'error', error: String(backoffError), errorKind: 'caller-abort' };
        return;
      }
    } finally {
      try {
        if (!finished) {
          boundary.closeConsumer();
          await closeIterator();
        }
      } finally {
        boundary.cleanup();
      }
    }
  }

  yield {
    type: 'error',
    error: `Stream failed after ${maxAttempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    errorKind: lastError instanceof GenerationTimeoutError ? 'timeout' : 'provider',
  };
}
