/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import type { LanguageModel } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { streamTextMock } = vi.hoisted(() => ({ streamTextMock: vi.fn() }));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, streamText: streamTextMock };
});

import { stream } from '../src/index.js';

const model = {} as LanguageModel;
const usage = Promise.resolve({ inputTokens: 2, outputTokens: 1 });
const finishReason = Promise.resolve('stop');

function responseFrom(
  iterator: AsyncIterator<unknown>,
  metadata: {
    usage?: Promise<{ inputTokens?: number; outputTokens?: number }>;
    finishReason?: Promise<string>;
  } = {},
) {
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  return {
    textStream: iterable,
    fullStream: iterable,
    usage: metadata.usage ?? usage,
    finishReason: metadata.finishReason ?? finishReason,
  };
}

function sequenceIterator(values: unknown[]): AsyncIterator<unknown> {
  let index = 0;
  return {
    next: vi.fn(async () =>
      index < values.length
        ? { done: false as const, value: values[index++] }
        : { done: true as const, value: undefined }),
    return: vi.fn(async () => ({ done: true as const, value: undefined })),
  };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  streamTextMock.mockReset();
});

describe('stream cancellation boundaries', () => {
  it('yields caller-abort before dispatch for a pre-aborted signal', async () => {
    const controller = new AbortController();
    controller.abort(new Error('pre-abort'));

    const chunks = [];
    for await (const chunk of stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: controller.signal,
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      expect.objectContaining({ type: 'error', errorKind: 'caller-abort' }),
    ]);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it('forwards active caller abort before the first text chunk', async () => {
    const iterator = {
      next: vi.fn(() => new Promise<IteratorResult<unknown>>(() => undefined)),
      return: vi.fn(async () => ({ done: true as const, value: undefined })),
    };
    streamTextMock.mockReturnValue(responseFrom(iterator));
    const reason = { source: 'handler' };
    const controller = new AbortController();
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: controller.signal,
      timeoutMs: 10_000,
    });
    const first = generated.next();
    await flush();
    controller.abort(reason);

    await expect(first).resolves.toMatchObject({
      done: false,
      value: { type: 'error', errorKind: 'caller-abort', error: '[object Object]' },
    });
    await expect(generated.next()).resolves.toMatchObject({ done: true });
    expect(streamTextMock.mock.calls[0]![0].abortSignal.aborted).toBe(true);
    expect(iterator.return).toHaveBeenCalledTimes(1);
  });

  it('bounds a next() that ignores timeout and starts no overlapping retry', async () => {
    vi.useFakeTimers();
    const iterator = {
      next: vi.fn(() => new Promise<IteratorResult<unknown>>(() => undefined)),
      return: vi.fn(async () => ({ done: true as const, value: undefined })),
    };
    streamTextMock.mockReturnValue(responseFrom(iterator));
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      timeoutMs: 10,
      maxAttempts: 2,
    });
    const first = generated.next();

    await vi.advanceTimersByTimeAsync(260);
    await expect(first).resolves.toMatchObject({
      value: { type: 'error', errorKind: 'timeout' },
    });
    await expect(generated.next()).resolves.toMatchObject({ done: true });
    expect(streamTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts no retry when next() settles after timeout but iterator return does not', async () => {
    vi.useFakeTimers();
    streamTextMock.mockImplementation(({ abortSignal }: { abortSignal: AbortSignal }) => {
      const iterator = {
        next: vi.fn(
          () =>
            new Promise<IteratorResult<unknown>>((_, reject) => {
              abortSignal.addEventListener('abort', () => reject(abortSignal.reason), { once: true });
            }),
        ),
        return: vi.fn(() => new Promise<IteratorResult<unknown>>(() => undefined)),
      };
      return responseFrom(iterator);
    });
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      timeoutMs: 10,
      maxAttempts: 2,
    });
    const first = generated.next();

    await vi.advanceTimersByTimeAsync(260);
    await expect(first).resolves.toMatchObject({
      value: { type: 'error', errorKind: 'timeout' },
    });
    await expect(generated.next()).resolves.toMatchObject({ done: true });
    expect(streamTextMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not retry caller abort after output has started', async () => {
    const controller = new AbortController();
    let nextCalls = 0;
    const iterator = {
      next: vi.fn(() => {
        nextCalls += 1;
        return nextCalls === 1
          ? Promise.resolve({ done: false as const, value: 'hello' })
          : new Promise<IteratorResult<unknown>>(() => undefined);
      }),
      return: vi.fn(async () => ({ done: true as const, value: undefined })),
    };
    streamTextMock.mockReturnValue(responseFrom(iterator));
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      abortSignal: controller.signal,
    });

    await expect(generated.next()).resolves.toMatchObject({ value: { type: 'partial', content: 'hello' } });
    const second = generated.next();
    await flush();
    controller.abort('stop');
    await expect(second).resolves.toMatchObject({ value: { type: 'error', errorKind: 'caller-abort' } });
    await expect(generated.next()).resolves.toMatchObject({ done: true });
    expect(streamTextMock).toHaveBeenCalledTimes(1);
  });

  it('treats consumer break as cancellation and bounds a never-settling return()', async () => {
    vi.useFakeTimers();
    let providerSignal: AbortSignal | undefined;
    const iterator = {
      next: vi.fn(async () => ({ done: false as const, value: 'first' })),
      return: vi.fn(() => new Promise<IteratorResult<unknown>>(() => undefined)),
    };
    streamTextMock.mockImplementation((options) => {
      providerSignal = options.abortSignal;
      return responseFrom(iterator);
    });
    const generated = stream({ system: 's', prompt: 'p', byokModel: model });
    const loop = (async () => {
      for await (const chunk of generated) {
        expect(chunk.type).toBe('partial');
        break;
      }
    })();

    await flush();
    await vi.advanceTimersByTimeAsync(250);
    await loop;
    expect(providerSignal?.aborted).toBe(true);
    expect(iterator.return).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('observes a late-rejecting return() without unhandledRejection', async () => {
    vi.useFakeTimers();
    const unhandled: unknown[] = [];
    const sentinel = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', sentinel);
    try {
      const iterator = {
        next: vi.fn(async () => ({ done: false as const, value: 'first' })),
        return: vi.fn(
          () =>
            new Promise<IteratorResult<unknown>>((_, reject) => {
              setTimeout(() => reject(new Error('late return rejection')), 1_000);
            }),
        ),
      };
      streamTextMock.mockReturnValue(responseFrom(iterator));
      const generated = stream({ system: 's', prompt: 'p', byokModel: model });
      const loop = (async () => {
        for await (const _chunk of generated) break;
      })();
      await flush();
      await vi.advanceTimersByTimeAsync(250);
      await loop;
      await vi.advanceTimersByTimeAsync(1_000);
      await flush();
      expect(unhandled).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      process.removeListener('unhandledRejection', sentinel);
      vi.useRealTimers();
    }
  });

  it('treats a synchronous iterator return throw as best-effort cleanup', async () => {
    const iterator = {
      next: vi.fn(async () => ({ done: false as const, value: 'first' })),
      return: vi.fn(() => {
        throw new Error('synchronous return failure');
      }),
    };
    streamTextMock.mockReturnValue(responseFrom(iterator));
    const generated = stream({ system: 's', prompt: 'p', byokModel: model });
    const loop = (async () => {
      for await (const _chunk of generated) break;
    })();

    await expect(loop).resolves.toBeUndefined();
    expect(iterator.return).toHaveBeenCalledTimes(1);
  });

  it.each(['usage', 'finishReason'] as const)(
    'bounds independently never-settling %s metadata against the original attempt deadline',
    async (pendingField) => {
      vi.useFakeTimers();
      const iterator = sequenceIterator(['x']);
      const never = new Promise<never>(() => undefined);
      streamTextMock.mockReturnValue(
        responseFrom(iterator, {
          usage: pendingField === 'usage' ? never : usage,
          finishReason: pendingField === 'finishReason' ? never : finishReason,
        }),
      );
      const generated = stream({
        system: 's',
        prompt: 'p',
        byokModel: model,
        timeoutMs: 10,
        maxAttempts: 1,
      });

      await expect(generated.next()).resolves.toMatchObject({ value: { type: 'partial', content: 'x' } });
      const terminal = generated.next();
      await vi.advanceTimersByTimeAsync(260);
      await expect(terminal).resolves.toMatchObject({ value: { type: 'error', errorKind: 'timeout' } });
      await expect(generated.next()).resolves.toMatchObject({ done: true });
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('does not reset the absolute deadline between the last chunk and terminal metadata', async () => {
    vi.useFakeTimers();
    let call = 0;
    const iterator = {
      next: vi.fn(
        () =>
          new Promise<IteratorResult<unknown>>((resolve) => {
            call += 1;
            setTimeout(
              () => resolve(call === 1 ? { done: false, value: 'late' } : { done: true, value: undefined }),
              call === 1 ? 8 : 0,
            );
          }),
      ),
      return: vi.fn(async () => ({ done: true as const, value: undefined })),
    };
    streamTextMock.mockReturnValue(
      responseFrom(iterator, { usage: new Promise(() => undefined), finishReason }),
    );
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      timeoutMs: 10,
      maxAttempts: 1,
    });
    const first = generated.next();
    await vi.advanceTimersByTimeAsync(8);
    await expect(first).resolves.toMatchObject({ value: { type: 'partial', content: 'late' } });
    const terminal = generated.next();
    await vi.advanceTimersByTimeAsync(2);
    await vi.advanceTimersByTimeAsync(250);
    await expect(terminal).resolves.toMatchObject({ value: { type: 'error', errorKind: 'timeout' } });
  });

  it('covers fullStream cancellation after a tool event', async () => {
    const controller = new AbortController();
    let call = 0;
    const iterator = {
      next: vi.fn(() => {
        call += 1;
        return call === 1
          ? Promise.resolve({
              done: false as const,
              value: { type: 'tool-call', toolCallId: 'tc-1', toolName: 'lookup', input: { id: 1 } },
            })
          : new Promise<IteratorResult<unknown>>(() => undefined);
      }),
      return: vi.fn(async () => ({ done: true as const, value: undefined })),
    };
    streamTextMock.mockReturnValue(responseFrom(iterator));
    const generated = stream({
      system: 's',
      prompt: 'p',
      byokModel: model,
      tools: { lookup: {} as never },
      abortSignal: controller.signal,
    });
    await expect(generated.next()).resolves.toMatchObject({ value: { type: 'tool-call' } });
    const second = generated.next();
    await flush();
    controller.abort(new Error('closed'));
    await expect(second).resolves.toMatchObject({ value: { type: 'error', errorKind: 'caller-abort' } });
    await expect(generated.next()).resolves.toMatchObject({ done: true });
  });
});
