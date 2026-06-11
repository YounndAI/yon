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
 * @younndai/ai-relay - Generate Function Tests
 *
 * Tests for the generate() function across model presets.
 * These tests require OPENAI_API_KEY to be set.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generate } from '../src/index.js';

// Skip all tests if no API key
const hasApiKey = !!process.env.OPENAI_API_KEY;

describe.skipIf(!hasApiKey)('generate()', () => {
  const TEST_SYSTEM = 'You are a helpful assistant. Respond briefly.';
  const TEST_PROMPT = 'Say hello in one sentence.';

  describe('Model Presets', () => {
    it('should generate with fast preset (gpt-5-mini)', async () => {
      const result = await generate({
        system: TEST_SYSTEM,
        prompt: TEST_PROMPT,
        preset: 'fast',
        // gpt-5-mini is a reasoning model — maxTokens budget is shared with
        // reasoning tokens, so allow ample room for visible output.
        maxTokens: 2000,
      });

      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.usage.input).toBeGreaterThan(0);
      expect(result.usage.output).toBeGreaterThan(0);
    }, 15000);

    it('should generate with balanced preset (gpt-4.1)', async () => {
      const result = await generate({
        system: TEST_SYSTEM,
        prompt: TEST_PROMPT,
        preset: 'balanced',
        maxTokens: 100,
      });

      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.usage.input).toBeGreaterThan(0);
      expect(result.usage.output).toBeGreaterThan(0);
    }, 15000);

    it('should generate with reasoning preset (gpt-5.4)', async () => {
      const result = await generate({
        system: TEST_SYSTEM,
        prompt: TEST_PROMPT,
        preset: 'reasoning',
        maxTokens: 100,
      });

      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.usage.input).toBeGreaterThan(0);
      expect(result.usage.output).toBeGreaterThan(0);
    }, 20000);
  });

  describe('Default Behavior', () => {
    it('should use balanced preset by default', async () => {
      const result = await generate({
        system: TEST_SYSTEM,
        prompt: TEST_PROMPT,
        maxTokens: 100,
      });

      expect(result.text).toBeTruthy();
      expect(result.usage).toBeDefined();
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should throw after max retries on invalid model', async () => {
      await expect(
        generate({
          system: TEST_SYSTEM,
          prompt: TEST_PROMPT,
          model: 'invalid-model-name',
          maxAttempts: 1,
          timeoutMs: 5000,
        })
      ).rejects.toThrow();
    }, 10000);
  });

  describe('Timeout Handling', () => {
    it('should respect timeout parameter', async () => {
      // Very short timeout should fail
      await expect(
        generate({
          system: TEST_SYSTEM,
          prompt: TEST_PROMPT,
          preset: 'fast',
          timeoutMs: 1, // 1ms is too short
          maxAttempts: 1,
        })
      ).rejects.toThrow(/Timeout/);
    }, 5000);
  });
});
