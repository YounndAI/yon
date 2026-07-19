/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import type { LanguageModel } from 'ai';
import { z } from 'zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { generateTextMock } = vi.hoisted(() => ({ generateTextMock: vi.fn() }));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, generateText: generateTextMock };
});

import {
  GenerationTimeoutError,
  createRelay,
  generate,
  generateWithLogprobs,
  generateObject,
} from '../src/index.js';

const model = {} as LanguageModel;
const completion = {
  text: 'ok',
  output: { ok: true },
  usage: { inputTokens: 3, outputTokens: 2 },
  finishReason: 'stop',
};

function abortableProvider() {
  return generateTextMock.mockImplementation(
    ({ abortSignal }: { abortSignal: AbortSignal }) =>
      new Promise((_, reject) => {
        const rejectFromSignal = () => reject(abortSignal.reason);
        abortSignal.addEventListener('abort', rejectFromSignal, { once: true });
      }),
  );
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  generateTextMock.mockReset();
});

describe('caller cancellation for promise APIs', () => {
  it.each([
    ['Error', new Error('handler cancelled')],
    ['non-Error', { source: 'consumer', sequence: 7 }],
  ])('preserves an active %s abort reason by identity', async (_label, reason) => {
    vi.useFakeTimers();
    abortableProvider();
    const controller = new AbortController();
    const pending = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: controller.signal,
      maxAttempts: 2,
      timeoutMs: 10_000,
    });

    await flush();
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    await flush();

    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects a pre-aborted call before model resolution or provider dispatch', async () => {
    const reason = new Error('already gone');
    const controller = new AbortController();
    controller.abort(reason);
    const relay = createRelay();

    await expect(
      relay.generate({
        system: 's',
        prompt: 'p',
        model: 'unresolvable-model',
        abortSignal: controller.signal,
      }),
    ).rejects.toBe(reason);
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(relay.getCost()).toMatchObject({ calls: 0, cost: 0 });
  });

  it('latches caller-first and provider-first interleavings deterministically', async () => {
    let resolveProvider!: (value: typeof completion) => void;
    generateTextMock.mockImplementation(
      () => new Promise<typeof completion>((resolve) => { resolveProvider = resolve; }),
    );
    const firstReason = new Error('caller won');
    const firstController = new AbortController();
    const callerFirst = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: firstController.signal,
    });
    await flush();
    firstController.abort(firstReason);
    resolveProvider(completion);
    await expect(callerFirst).rejects.toBe(firstReason);

    generateTextMock.mockReset();
    let resolveSecond!: (value: typeof completion) => void;
    generateTextMock.mockImplementation(
      () => new Promise<typeof completion>((resolve) => { resolveSecond = resolve; }),
    );
    const secondController = new AbortController();
    const providerFirst = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: secondController.signal,
    });
    await flush();
    resolveSecond(completion);
    await expect(providerFirst).resolves.toMatchObject({ text: 'ok' });
    secondController.abort(new Error('too late'));
    expect(generateTextMock).toHaveBeenCalledTimes(1);
  });

  it('uses DOMException AbortError and the bounded Error fallback when reason is absent', async () => {
    const reasonless = {
      aborted: true,
      reason: undefined,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as AbortSignal;

    await expect(
      generate({ system: 's', prompt: 'p', byokModel: model, abortSignal: reasonless }),
    ).rejects.toMatchObject({ name: 'AbortError' });

    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'DOMException');
    try {
      Object.defineProperty(globalThis, 'DOMException', { configurable: true, value: undefined });
      await expect(
        generate({ system: 's', prompt: 'p', byokModel: model, abortSignal: reasonless }),
      ).rejects.toMatchObject({ name: 'AbortError', message: 'Aborted' });
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'DOMException', descriptor);
    }
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('interrupts retry backoff and starts no later attempt', async () => {
    vi.useFakeTimers();
    generateTextMock.mockRejectedValue(Object.assign(new Error('retry'), { statusCode: 503 }));
    const reason = { kind: 'cancel-during-backoff' };
    const controller = new AbortController();
    const pending = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: controller.signal,
      maxAttempts: 3,
    });

    await flush();
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    await flush();

    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reports exact terminal timeout fields when an abort-ignoring provider remains unsettled', async () => {
    vi.useFakeTimers();
    generateTextMock.mockImplementation(() => new Promise(() => undefined));
    const pending = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      maxAttempts: 2,
      timeoutMs: 10,
    });
    const assertion = expect(pending).rejects.toMatchObject({
      name: 'GenerationTimeoutError',
      code: 'AI_RELAY_TIMEOUT',
      attempt: 1,
      timeoutMs: 10,
      providerSettled: false,
    });

    await vi.advanceTimersByTimeAsync(260);
    await assertion;
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not overlap attempts and retries only after the timed-out provider settles', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    let active = 0;
    let maximumActive = 0;
    generateTextMock
      .mockImplementationOnce(
        ({ abortSignal }: { abortSignal: AbortSignal }) =>
          new Promise((_, reject) => {
            active += 1;
            maximumActive = Math.max(maximumActive, active);
            abortSignal.addEventListener(
              'abort',
              () => {
                setTimeout(() => {
                  active -= 1;
                  reject(abortSignal.reason);
                }, 100);
              },
              { once: true },
            );
          }),
      )
      .mockImplementationOnce(async () => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        active -= 1;
        return completion;
      });

    const pending = generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      maxAttempts: 2,
      timeoutMs: 10,
    });
    await vi.advanceTimersByTimeAsync(109);
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(501);

    await expect(pending).resolves.toMatchObject({ text: 'ok' });
    expect(generateTextMock).toHaveBeenCalledTimes(2);
    expect(maximumActive).toBe(1);
    expect(active).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('covers both public generateObject facades with the same pre-abort contract', async () => {
    const reason = Symbol('closed');
    const controller = new AbortController();
    controller.abort(reason);
    const options = {
      system: 's',
      prompt: 'p',
      schema: z.object({ ok: z.boolean() }),
      abortSignal: controller.signal,
    };

    await expect(generateObject(options)).rejects.toBe(reason);
    await expect(createRelay().generateObject(options)).rejects.toBe(reason);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it.each([
    [
      'generateWithLogprobs',
      (signal: AbortSignal) =>
        generateWithLogprobs({
          system: 's',
          prompt: 'p',
          byokModel: model,
          abortSignal: signal,
        }),
    ],
    [
      'generateObject',
      (signal: AbortSignal) =>
        generateObject({
          system: 's',
          prompt: 'p',
          schema: z.object({ ok: z.boolean() }),
          byokModel: model,
          abortSignal: signal,
        }),
    ],
  ])('forwards active caller cancellation through %s', async (_name, invoke) => {
    vi.useFakeTimers();
    abortableProvider();
    const reason = { source: 'active-entrypoint-cancel' };
    const controller = new AbortController();
    const pending = invoke(controller.signal);

    await flush();
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    await flush();

    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('observes a late provider rejection without leaking unhandledRejection', async () => {
    vi.useFakeTimers();
    const unhandled: unknown[] = [];
    const sentinel = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', sentinel);
    try {
      generateTextMock.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('late provider rejection')), 1_000);
          }),
      );
      const pending = generate({
        system: 's',
        prompt: 'p',
        byokModel: model,
        maxAttempts: 1,
        timeoutMs: 10,
      });
      const assertion = expect(pending).rejects.toBeInstanceOf(GenerationTimeoutError);
      await vi.advanceTimersByTimeAsync(260);
      await assertion;
      await vi.advanceTimersByTimeAsync(1_000);
      await flush();
      expect(unhandled).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      process.removeListener('unhandledRejection', sentinel);
      vi.useRealTimers();
    }
  });
});
