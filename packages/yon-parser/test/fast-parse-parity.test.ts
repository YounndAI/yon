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
 * Fast-Parse Parity Tests
 *
 * Ensures parseRecordDirect() produces identical output to
 * tokenize() + parseSingleRecord() for all record shapes.
 */

import { describe, it, expect } from 'vitest';
import { parseRecordDirect } from '../src/fast-parse.js';
import { parseLine } from '../src/index.js';
import type { YonRecord, YonField, YonList, YonMapPair } from '../src/types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: compare two YonRecords field-by-field
// ─────────────────────────────────────────────────────────────────────────────

function assertRecordParity(fast: YonRecord, ref: YonRecord, label: string) {
  expect(fast.tag, `${label}: tag`).toBe(ref.tag);
  expect(fast.fields.size, `${label}: fields.size`).toBe(ref.fields.size);
  expect(fast.typedFields.size, `${label}: typedFields.size`).toBe(ref.typedFields.size);

  for (const [key, refVal] of ref.fields) {
    const fastVal = fast.fields.get(key);
    expect(fastVal, `${label}: missing field "${key}"`).toBeDefined();

    // Compare YonValue — handle lists, strings, and map pairs
    if (typeof refVal === 'string') {
      expect(fastVal, `${label}: field "${key}" value`).toBe(refVal);
    } else if (typeof refVal === 'object' && 'kind' in refVal) {
      // YonList comparison
      const fastList = fastVal as YonList;
      const refList = refVal as YonList;
      expect(fastList.kind, `${label}: field "${key}" list kind`).toBe(refList.kind);
      expect(fastList.items.length, `${label}: field "${key}" list items count`).toBe(refList.items.length);
    }
  }

  for (const [key, refField] of ref.typedFields) {
    const fastField = fast.typedFields.get(key);
    expect(fastField, `${label}: missing typedField "${key}"`).toBeDefined();
    expect(fastField!.typeHint, `${label}: typedField "${key}" typeHint`).toBe(refField.typeHint);
  }
}

/**
 * Parse a line via the legacy path (tokenize → parseSingleRecord).
 * Uses the parseLine export which goes through that path.
 */
function parseLineRef(line: string): YonRecord {
  const event = parseLine(line, 1);
  if (event.type !== 'record') {
    throw new Error(`Expected record event, got ${event.type}`);
  }
  return event.record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Vectors
// ─────────────────────────────────────────────────────────────────────────────

const TEST_VECTORS: [string, string][] = [
  // Simple records
  ['simple-tag-only', '@DOC'],
  ['simple-one-field', '@META key=value'],
  ['simple-multi-field', '@DOC ver=2.0 | id=test | title="Test"'],

  // Bare values
  ['bare-numeric', '@META count=42'],
  ['bare-path', '@STEP op=std:ai.prompt@v1'],
  ['bare-dotted', '@DOC domain=yai.health@1.0'],

  // Quoted strings
  ['quoted-simple', '@NOTE text="hello world"'],
  ['quoted-empty', '@NOTE text=""'],
  ['quoted-with-pipe', '@NOTE text="a | b"'],
  ['quoted-with-equals', '@NOTE text="a = b"'],

  // Escape sequences
  ['escape-backslash', '@NOTE text="path\\\\to\\\\file"'],
  ['escape-quote', '@NOTE text="she said \\"hello\\""'],
  ['escape-newline', '@NOTE text="line1\\nline2"'],
  ['escape-tab', '@NOTE text="col1\\tcol2"'],
  ['escape-mixed', '@NOTE text="a\\"b\\\\c\\nd"'],

  // Type hints
  ['type-int', '@STEP n:int=3'],
  ['type-float', '@META score:float=0.95'],
  ['type-bool', '@RULE enabled:bool=true'],
  ['type-ts', '@STAMP at:ts=2026-01-01T00:00:00Z'],
  ['type-str', '@NOTE key:str=hello'],

  // Flag keys (no =)
  ['flag-single', '@RULE strict'],
  ['flag-multi', '@DOC ver=2.0 | debug | verbose'],

  // Lists — reference tokens
  ['list-ref-simple', '@DOC features=[payload,logic,workflow]'],
  ['list-ref-spaced', '@STEP in=[data, config]'],
  ['list-empty', '@STEP out=[]'],

  // Lists — map pairs
  ['list-map-pairs', '@MAP pairs=["key1"->"val1","key2"->"val2"]'],

  // Lists — field items
  ['list-field-items', '@STEP args=[task="do thing",timeout:int=30]'],

  // Multiple pipes and spacing
  ['pipe-heavy', '@DOC ver=2.0 | id=test | title="Test" | kind=doc | fmt=min'],

  // Complex combined
  ['complex-step', '@STEP rid="step:s1" | n:int=1 | op=std:ai.prompt@v1 | timeout_ms:int=30000 | args=[task="Run analysis"]'],
  ['complex-doc', '@DOC ver=2.0 | id=test | title="Test Doc" | features=[payload,logic] | domain=yai.health@1.0'],
];

// ─────────────────────────────────────────────────────────────────────────────
// Parity Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('parseRecordDirect parity', () => {
  it.each(TEST_VECTORS)('%s: matches tokenize path', (label, line) => {
    const fast = parseRecordDirect(line, 1);
    const ref = parseLineRef(line);
    assertRecordParity(fast, ref, label);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Direct Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('parseRecordDirect units', () => {
  it('tag-only record', () => {
    const r = parseRecordDirect('@NOTE', 1);
    expect(r.tag).toBe('NOTE');
    expect(r.fields.size).toBe(0);
  });

  it('flag key → value "true"', () => {
    const r = parseRecordDirect('@RULE strict', 1);
    expect(r.fields.get('strict')).toBe('true');
  });

  it('type hint extracted correctly', () => {
    const r = parseRecordDirect('@STEP n:int=42', 1);
    expect(r.fields.get('n')).toBe('42');
    const f = r.typedFields.get('n')!;
    expect(f.typeHint).toBe('int');
    expect(f.key).toBe('n');
  });

  it('escape - quote in string', () => {
    const r = parseRecordDirect('@NOTE text="she said \\"hi\\""', 1);
    expect(r.fields.get('text')).toBe('she said "hi"');
  });

  it('escape - backslash in string', () => {
    const r = parseRecordDirect('@NOTE text="a\\\\b"', 1);
    expect(r.fields.get('text')).toBe('a\\b');
  });

  it('escape - newline in string', () => {
    const r = parseRecordDirect('@NOTE text="line1\\nline2"', 1);
    expect(r.fields.get('text')).toBe('line1\nline2');
  });

  it('empty list', () => {
    const r = parseRecordDirect('@STEP out=[]', 1);
    const list = r.fields.get('out') as YonList;
    expect(list.kind).toBe('reference-tokens');
    expect(list.items).toHaveLength(0);
  });

  it('reference token list', () => {
    const r = parseRecordDirect('@DOC features=[payload,logic]', 1);
    const list = r.fields.get('features') as YonList;
    expect(list.kind).toBe('reference-tokens');
    expect(list.items).toEqual(['payload', 'logic']);
  });

  it('map pair list', () => {
    const r = parseRecordDirect('@MAP pairs=["a"->"b","c"->"d"]', 1);
    const list = r.fields.get('pairs') as YonList;
    expect(list.kind).toBe('map-pairs');
    expect(list.items).toHaveLength(2);
    expect((list.items[0] as YonMapPair).key).toBe('a');
    expect((list.items[0] as YonMapPair).value).toBe('b');
  });

  it('field item list', () => {
    const r = parseRecordDirect('@STEP args=[task="hello",n:int=3]', 1);
    const list = r.fields.get('args') as YonList;
    expect(list.kind).toBe('field-items');
    expect(list.items).toHaveLength(2);
    const first = list.items[0] as YonField;
    expect(first.key).toBe('task');
    expect(first.value).toBe('hello');
  });

  it('duplicate field throws', () => {
    expect(() => parseRecordDirect('@NOTE key=a | key=b', 1)).toThrow(/Duplicate/);
  });

  it('inline JSON falls back to tokenize path', () => {
    const r = parseRecordDirect('@META args={"key":"value"}', 1);
    expect(r.tag).toBe('META');
    // Should still parse via fallback
    expect(r.fields.has('args')).toBe(true);
  });
});
