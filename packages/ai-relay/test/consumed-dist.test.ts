/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import { readFileSync } from 'node:fs';
import type { LanguageModel } from 'ai';
import { z } from 'zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { generateTextMock } = vi.hoisted(() => ({ generateTextMock: vi.fn() }));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, generateText: generateTextMock };
});

// Deliberately consume only the package's declared self-reference. No dist
// internal path or source-tree import is a supported consumer contract.
import * as consumed from '@younndai/ai-relay';

const model = {} as LanguageModel;
const completion = {
  text: 'ok',
  output: { ok: true },
  usage: { inputTokens: 3, outputTokens: 2 },
  finishReason: 'stop',
};

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  generateTextMock.mockReset();
});

describe('consumed ai-relay package entrypoint', () => {
  it('emits the cancellation declarations and runtime timeout value export', () => {
    const indexDeclaration = readFileSync(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
    const coreDeclaration = readFileSync(new URL('../dist/generator-core.d.ts', import.meta.url), 'utf8');

    expect(indexDeclaration).toMatch(/GenerationTimeoutError/);
    expect(coreDeclaration).toMatch(/abortSignal\?: AbortSignal/);
    expect(coreDeclaration).toContain(
      "export type StreamErrorKind = 'caller-abort' | 'timeout' | 'provider';",
    );
    expect(consumed.GenerationTimeoutError).toBeTypeOf('function');
  });

  it('keeps retry ownership and abort wiring on both public facades', async () => {
    const relay = consumed.createRelay();
    const facades = [consumed.generate, relay.generate];

    for (const runGenerate of facades) {
      generateTextMock
        .mockRejectedValueOnce(Object.assign(new Error('upstream'), { statusCode: 503 }))
        .mockResolvedValueOnce(completion);

      await expect(
        runGenerate({ system: 's', prompt: 'p', byokModel: model, maxAttempts: 2 }),
      ).resolves.toMatchObject({ text: 'ok' });
      expect(generateTextMock).toHaveBeenCalledTimes(2);
      for (const [options] of generateTextMock.mock.calls) {
        expect(options).toMatchObject({ maxRetries: 0 });
        expect(options.abortSignal).toBeInstanceOf(AbortSignal);
      }
      generateTextMock.mockReset();
    }
  });

  it('preserves pre-abort identity through both generateObject facades', async () => {
    const reason = { source: 'consumed-client' };
    const controller = new AbortController();
    controller.abort(reason);
    const options = {
      system: 's',
      prompt: 'p',
      schema: z.object({ ok: z.boolean() }),
      abortSignal: controller.signal,
    };

    await expect(consumed.generateObject(options)).rejects.toBe(reason);
    await expect(consumed.createRelay().generateObject(options)).rejects.toBe(reason);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('throws the same-entrypoint timeout class and never overlaps either public facade', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const facades = [consumed.generate, consumed.createRelay().generate];

    for (const runGenerate of facades) {
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
        .mockResolvedValueOnce(completion);

      const pending = runGenerate({
        system: 's',
        prompt: 'p',
        byokModel: model,
        maxAttempts: 2,
        timeoutMs: 10,
      });
      await vi.advanceTimersByTimeAsync(610);
      await expect(pending).resolves.toMatchObject({ text: 'ok' });
      expect(maximumActive).toBe(1);
      expect(active).toBe(0);
      generateTextMock.mockReset();
    }

    generateTextMock.mockImplementation(() => new Promise(() => undefined));
    const timedOut = consumed.generate({
      system: 's',
      prompt: 'p',
      byokModel: model,
      maxAttempts: 1,
      timeoutMs: 10,
    });
    const assertion = expect(timedOut).rejects.toBeInstanceOf(consumed.GenerationTimeoutError);
    await vi.advanceTimersByTimeAsync(260);
    await assertion;
    await flush();
    expect(vi.getTimerCount()).toBe(0);
  });
});
