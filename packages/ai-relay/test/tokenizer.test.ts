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
 * @younndai/ai-relay - Tokenizer Tests
 *
 * Tests for token counting and cost estimation.
 * These tests do NOT require an API key.
 */

import { describe, it, expect } from 'vitest';
import { countTokens, estimateCost } from '../src/index.js';

describe('countTokens()', () => {
  it('should count tokens in simple text', () => {
    const tokens = countTokens('Hello, world!');
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(10);
  });

  it('should return 0 for empty string', () => {
    const tokens = countTokens('');
    expect(tokens).toBe(0);
  });

  it('should count tokens in longer text', () => {
    const text = 'This is a longer piece of text that should have more tokens than a simple greeting.';
    const tokens = countTokens(text);
    expect(tokens).toBeGreaterThan(10);
  });

  it('should handle special characters', () => {
    const text = '@DOC ver=2.0 | id="test" | kind=spec';
    const tokens = countTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });

  it('should handle unicode', () => {
    const text = '你好世界 🌍';
    const tokens = countTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});

describe('estimateCost()', () => {
  it('should estimate cost for given input', () => {
    const testInput = 'Some input text for token estimation testing purposes.';
    const estimate = estimateCost(testInput, { format: 'min' });

    expect(estimate.inputTokens).toBeGreaterThan(0);
    expect(estimate.estimatedOutputTokens).toBeGreaterThan(0);
    expect(estimate.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('should return zero cost for empty input', () => {
    const estimate = estimateCost('', { format: 'min' });

    // With empty input, tokens are 0, but prompt overhead is added
    expect(estimate.inputTokens).toBe(0);
    expect(estimate.estimatedCostUsd).toBeGreaterThan(0); // Prompt overhead cost
  });

  it('should scale cost with input length', () => {
    const small = estimateCost('Short text.', { format: 'min' });
    const large = estimateCost('This is a much longer piece of text that should result in more tokens and therefore a higher cost estimate when processed through the tokenizer.', { format: 'min' });

    expect(large.estimatedCostUsd).toBeGreaterThan(small.estimatedCostUsd);
  });

  it('should vary savings by format', () => {
    const input = 'Test input for comparing formats.';
    
    const canon = estimateCost(input, { format: 'canon' });
    const min = estimateCost(input, { format: 'min' });
    const ultra = estimateCost(input, { format: 'ultra' });

    // Ultra should have highest savings (50%), canon lowest (25%)
    expect(ultra.estimatedSavingsPercent).toBeGreaterThan(min.estimatedSavingsPercent);
    expect(min.estimatedSavingsPercent).toBeGreaterThan(canon.estimatedSavingsPercent);
  });
});
