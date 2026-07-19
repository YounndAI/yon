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

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LanguageModel } from 'ai';

const { generateTextMock, streamTextMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  streamTextMock: vi.fn(),
}));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return {
    ...actual,
    generateText: generateTextMock,
    streamText: streamTextMock,
  };
});

import {
  GenerationTimeoutError,
  runGenerate,
  runStream,
  type ResolveDeps,
} from '../src/generator-core.js';
import { createRelay } from '../src/relay.js';

const model = {} as LanguageModel;
const deps: ResolveDeps = {
  resolveModel: () => model,
  getPresetModel: () => model,
};

const completion = {
  text: 'ok',
  usage: { inputTokens: 3, outputTokens: 2 },
  finishReason: 'stop',
};

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('single retry owner', () => {
  it('disables AI SDK retries while preserving ai-relay\'s two-attempt default', async () => {
    generateTextMock.mockRejectedValueOnce(Object.assign(new Error('upstream'), { statusCode: 503 }));
    generateTextMock.mockResolvedValueOnce(completion);

    const result = await runGenerate(deps, { system: 's', prompt: 'p' });

    expect(result.text).toBe('ok');
    expect(generateTextMock).toHaveBeenCalledTimes(2);
    for (const [options] of generateTextMock.mock.calls) {
      expect(options).toMatchObject({ maxRetries: 0 });
      expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    }
  });

  it('waits for an abort-honoring attempt to settle before retrying', async () => {
    vi.useFakeTimers();
    let firstSettled = false;
    generateTextMock.mockImplementationOnce(
      ({ abortSignal }: { abortSignal: AbortSignal }) =>
        new Promise((_, reject) => {
          abortSignal.addEventListener('abort', () => {
            firstSettled = true;
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    generateTextMock.mockImplementationOnce(async () => {
      expect(firstSettled).toBe(true);
      return completion;
    });

    const pending = runGenerate(deps, { system: 's', prompt: 'p', timeoutMs: 10 });
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(pending).resolves.toMatchObject({ text: 'ok' });
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it('fails boundedly without retry when a provider ignores abort, and observes its late rejection', async () => {
    vi.useFakeTimers();
    generateTextMock.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('late provider rejection')), 1_000)),
    );

    const pending = runGenerate(deps, { system: 's', prompt: 'p', timeoutMs: 10 });
    const assertion = expect(pending).rejects.toMatchObject({
      name: 'GenerationTimeoutError',
      code: 'AI_RELAY_TIMEOUT',
      attempt: 1,
      timeoutMs: 10,
      providerSettled: false,
    });
    await vi.advanceTimersByTimeAsync(260);
    await assertion;
    await expect(pending).rejects.toBeInstanceOf(GenerationTimeoutError);
    expect(generateTextMock).toHaveBeenCalledTimes(1);

    // The attempt may reject after the public call has returned; its rejection
    // is consumed by the internal observer rather than becoming unhandled.
    await vi.advanceTimersByTimeAsync(1_000);
  });

  it('disables AI SDK retries for streaming calls', async () => {
    streamTextMock.mockReturnValue({
      textStream: (async function* () {
        yield 'ok';
      })(),
      fullStream: (async function* () {})(),
      usage: Promise.resolve({ inputTokens: 3, outputTokens: 2 }),
      finishReason: Promise.resolve('stop'),
    });

    const chunks = [];
    for await (const chunk of runStream(deps, { system: 's', prompt: 'p', maxAttempts: 1 })) {
      chunks.push(chunk);
    }

    expect(chunks.at(-1)).toMatchObject({ type: 'complete' });
    expect(streamTextMock).toHaveBeenCalledTimes(1);
    expect(streamTextMock.mock.calls[0]?.[0]).toMatchObject({ maxRetries: 0 });
  });

  it('disables AI SDK retries inside askAllModels\' outer retry loop', async () => {
    generateTextMock.mockResolvedValue(completion);
    const relay = createRelay({ providers: { openai: { apiKey: 'offline-test-key' } } });

    const responses = await relay.askAllModels('p', { tier: 'budget', availableProviders: ['openai'] });

    expect(responses.length).toBeGreaterThan(0);
    expect(generateTextMock).toHaveBeenCalled();
    for (const [options] of generateTextMock.mock.calls) {
      expect(options).toMatchObject({ maxRetries: 0 });
    }
  });
});
