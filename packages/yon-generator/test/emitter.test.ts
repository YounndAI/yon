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
 * @younndai/yon-generator — Emitter Tests
 *
 * Covers: quoting, attribute formatting, edge cases.
 */

import { describe, it, expect } from 'vitest';
import { quoteIfNeeded, formatAttrs, formatRefList, formatMapPairs } from '../src/emitter.js';

describe('quoteIfNeeded', () => {
  it('passes simple values through', () => {
    expect(quoteIfNeeded('hello')).toBe('hello');
    expect(quoteIfNeeded('camelCase')).toBe('camelCase');
    expect(quoteIfNeeded('foo-bar')).toBe('foo-bar');
  });

  it('quotes values with spaces', () => {
    expect(quoteIfNeeded('hello world')).toBe('"hello world"');
  });

  it('quotes values with pipes', () => {
    expect(quoteIfNeeded('a|b')).toBe('"a|b"');
  });

  it('quotes values with tabs', () => {
    expect(quoteIfNeeded('a\tb')).toBe('"a\tb"');
  });

  it('escapes embedded quotes', () => {
    expect(quoteIfNeeded('say "hello"')).toBe('"say \\"hello\\""');
  });

  it('escapes backslashes', () => {
    expect(quoteIfNeeded('path\\to\\file')).toBe('"path\\\\to\\\\file"');
  });
});

describe('formatAttrs', () => {
  it('formats key-value pairs', () => {
    const result = formatAttrs({ key: 'timeout', value: '30s' });
    expect(result).toBe('key=timeout | value=30s');
  });

  it('skips undefined and null values', () => {
    const result = formatAttrs({ key: 'a', skip: undefined, also: null });
    expect(result).toBe('key=a');
  });

  it('quotes values with spaces', () => {
    const result = formatAttrs({ name: 'hello world' });
    expect(result).toBe('name="hello world"');
  });

  it('converts numbers to strings', () => {
    const result = formatAttrs({ count: 42 });
    expect(result).toBe('count=42');
  });

  it('converts booleans to strings', () => {
    const result = formatAttrs({ required: true });
    expect(result).toBe('required=true');
  });
});

describe('formatRefList', () => {
  it('formats single reference', () => {
    expect(formatRefList(['block:raw'])).toBe('[block:raw]');
  });

  it('formats multiple references', () => {
    expect(formatRefList(['block:raw', 'block:parsed'])).toBe('[block:raw, block:parsed]');
  });

  it('quotes references with spaces', () => {
    expect(formatRefList(['block:my data'])).toBe('["block:my data"]');
  });
});

describe('formatMapPairs', () => {
  it('formats a single pair', () => {
    expect(formatMapPairs({ key: 'value' })).toBe('[key->value]');
  });

  it('formats multiple pairs', () => {
    const result = formatMapPairs({ red: '#ff0000', blue: '#0000ff' });
    expect(result).toContain('red->#ff0000');
    expect(result).toContain('blue->#0000ff');
    expect(result).toMatch(/^\[.*\]$/);
  });

  it('quotes values with spaces', () => {
    const result = formatMapPairs({ name: 'hello world' });
    expect(result).toBe('[name->"hello world"]');
  });
});

