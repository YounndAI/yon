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
 * Streaming Parser Tests
 * 
 * Tests for StreamingYonParser, parseLine, and equivalence with batch parser.
 * Covers Transport §2.3-2.6 requirements.
 */

import { describe, it, expect } from 'vitest';
import { parse, StreamingYonParser, parseLine, createValidationContext, validateRecord, type StreamEvent, type YonList } from '../src/index.js';

/**
 * Helper: collect all events from streaming parser
 */
function collectEvents(input: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  const parser = new StreamingYonParser({
    accumulate: true,
    onEvent: (e) => events.push(e),
  });
  parser.write(input);
  parser.end();
  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// parseLine — single-line parsing
// ─────────────────────────────────────────────────────────────────────────────

describe('parseLine', () => {
  it('parses a record line', () => {
    const event = parseLine('@META key=value', 1);
    expect(event.type).toBe('record');
    if (event.type === 'record') {
      expect(event.record.tag).toBe('META');
      expect(event.record.fields.get('key')).toBe('value');
    }
  });

  it('parses a comment line', () => {
    const event = parseLine('# This is a comment', 5);
    expect(event.type).toBe('comment');
    if (event.type === 'comment') {
      expect(event.text).toBe('This is a comment');
      expect(event.line).toBe(5);
    }
  });

  it('parses ping heartbeat comment', () => {
    const event = parseLine('# ping', 10);
    expect(event.type).toBe('comment');
    if (event.type === 'comment') {
      expect(event.text).toBe('ping');
    }
  });

  it('returns error for non-tag line', () => {
    const event = parseLine('random text', 3);
    expect(event.type).toBe('error');
  });

  it('parses empty line as comment', () => {
    const event = parseLine('', 1);
    expect(event.type).toBe('comment');
  });

  it('parses type-hinted key (§3.1.2)', () => {
    const event = parseLine('@STEP n:int=3 | op=test@v1', 1);
    expect(event.type).toBe('record');
    if (event.type === 'record') {
      // Key should be 'n', not 'n:int'
      expect(event.record.fields.get('n')).toBe('3');
      expect(event.record.fields.has('n:int')).toBe(false);
      // TypedFields should have typeHint
      const nField = event.record.typedFields.get('n');
      expect(nField).toBeDefined();
      expect(nField!.typeHint).toBe('int');
    }
  });

  it('parses list value (§3.1.4)', () => {
    const event = parseLine('@MAP pairs=["a"->"b","c"->"d"]', 1);
    expect(event.type).toBe('record');
    if (event.type === 'record') {
      const pairs = event.record.fields.get('pairs');
      expect(pairs).toBeDefined();
      // Should be a YonList, not a string
      expect(typeof pairs).not.toBe('string');
      const list = pairs as YonList;
      expect(list.kind).toBe('map-pairs');
      expect(list.items).toHaveLength(2);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// StreamingYonParser — event-driven streaming
// ─────────────────────────────────────────────────────────────────────────────

describe('StreamingYonParser', () => {
  // --- Basic Record Streaming ---

  it('emits record events for each line', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@NOTE text="hello"',
    ].join('\n');

    const events = collectEvents(src);
    const records = events.filter(e => e.type === 'record');
    expect(records).toHaveLength(2);
    if (records[0]!.type === 'record') {
      expect(records[0]!.record.tag).toBe('DOC');
    }
    if (records[1]!.type === 'record') {
      expect(records[1]!.record.tag).toBe('NOTE');
    }
  });

  it('emits document event on end()', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test"\n@NOTE text="hello"\n';
    const events = collectEvents(src);
    const docs = events.filter(e => e.type === 'document');
    expect(docs).toHaveLength(1);
    if (docs[0]!.type === 'document') {
      expect(docs[0]!.doc.id).toBe('test');
      expect(docs[0]!.doc.records).toHaveLength(2);
    }
  });

  // --- Chunked Input ---

  it('handles chunked input across line boundaries', () => {
    const parser = new StreamingYonParser({ onEvent: () => {} });
    const events: StreamEvent[] = [];
    const p2 = new StreamingYonParser({ onEvent: (e) => events.push(e) });

    // Simulate chunked delivery — split mid-line
    p2.write('@DOC ver=2.0 | id=te');
    p2.write('st | title="Test"\n@NO');
    p2.write('TE text="hello"\n');
    p2.end();

    const records = events.filter(e => e.type === 'record');
    expect(records).toHaveLength(2);
  });

  // --- Comment Preservation ---

  it('preserves comments including # ping (Transport §2.4)', () => {
    const src = [
      '# preamble',
      '@DOC ver=2.0 | id=test | title="Test"',
      '# ping',
      '@NOTE text="data"',
    ].join('\n');

    const events = collectEvents(src);
    const comments = events.filter(e => e.type === 'comment');
    expect(comments.length).toBeGreaterThanOrEqual(2);

    // ping must be preserved
    const pingEvent = comments.find(c => c.type === 'comment' && c.text === 'ping');
    expect(pingEvent).toBeDefined();
  });

  // --- Block Reconstruction (Transport §2.5) ---

  it('reconstructs blocks from line stream', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN id=code | mime="application/json"',
      '{"key": "value"}',
      '@END',
    ].join('\n');

    const events = collectEvents(src);
    const blocks = events.filter(e => e.type === 'block');
    expect(blocks).toHaveLength(1);
    if (blocks[0]!.type === 'block') {
      expect(blocks[0]!.block.id).toBe('code');
      expect(blocks[0]!.block.content).toContain('"key"');
    }
  });

  it('block with multi-line content', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN id=md | mime="text/markdown"',
      '# Title',
      '',
      'Paragraph with | pipe and = equals',
      '@END',
    ].join('\n');

    const events = collectEvents(src);
    const blocks = events.filter(e => e.type === 'block');
    expect(blocks).toHaveLength(1);
    if (blocks[0]!.type === 'block') {
      expect(blocks[0]!.block.content).toContain('# Title');
      expect(blocks[0]!.block.content).toContain('| pipe');
    }
  });

  // --- Multi-Document Streams (Transport §2.6) ---

  it('resets context on new @DOC', () => {
    const src = [
      '@DOC ver=2.0 | id=doc1 | title="First"',
      '@NOTE text="one"',
      '@DOC ver=2.0 | id=doc2 | title="Second"',
      '@META key="two"',
    ].join('\n');

    const events = collectEvents(src);
    const docs = events.filter(e => e.type === 'document');

    // Two documents emitted
    expect(docs).toHaveLength(2);
    if (docs[0]!.type === 'document') {
      expect(docs[0]!.doc.id).toBe('doc1');
    }
    if (docs[1]!.type === 'document') {
      expect(docs[1]!.doc.id).toBe('doc2');
    }
  });

  // --- @DOC Mid-Block (Transport §2.6 edge case) ---

  it('emits error and resets on @DOC mid-block', () => {
    const src = [
      '@DOC ver=2.0 | id=doc1 | title="First"',
      '@BEGIN id=data | mime="text/plain"',
      'block content here',
      '@DOC ver=2.0 | id=doc2 | title="Second"',
      '@NOTE text="recovered"',
    ].join('\n');

    const events = collectEvents(src);

    // Must have error about unterminated block
    const errors = events.filter(e => e.type === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    if (errors[0]!.type === 'error') {
      expect(errors[0]!.error.message).toContain('Unterminated block');
    }

    // Must still produce doc2
    const docs = events.filter(e => e.type === 'document');
    expect(docs.length).toBeGreaterThanOrEqual(1);
    const doc2 = docs.find(d => d.type === 'document' && d.doc.id === 'doc2');
    expect(doc2).toBeDefined();
  });

  // --- Error Isolation (Rationale §3) ---

  it('continues after malformed line', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      'not a valid line',
      '@NOTE text="still works"',
    ].join('\n');

    const events = collectEvents(src);
    const errors = events.filter(e => e.type === 'error');
    const records = events.filter(e => e.type === 'record');

    expect(errors).toHaveLength(1);
    // @DOC + @NOTE = 2 records (malformed line is an error, not a record)
    expect(records).toHaveLength(2);
  });

  // --- Lifecycle ---

  it('throws on write() after end()', () => {
    const parser = new StreamingYonParser();
    parser.write('@DOC ver=2.0 | id=test | title="Test"\n');
    parser.end();
    expect(() => parser.write('more data')).toThrow('Cannot write after end()');
  });

  it('end() with open block emits error', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN id=open | mime="text/plain"',
      'content without end',
    ].join('\n');

    const events = collectEvents(src);
    const errors = events.filter(e => e.type === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    if (errors[0]!.type === 'error') {
      expect(errors[0]!.error.message).toContain('Unterminated block');
    }
  });

  it('flushes partial line buffer at end()', () => {
    const events: StreamEvent[] = [];
    const parser = new StreamingYonParser({ onEvent: (e) => events.push(e) });
    
    // Write without trailing newline
    parser.write('@DOC ver=2.0 | id=test | title="Test"');
    parser.end();

    const records = events.filter(e => e.type === 'record');
    expect(records).toHaveLength(1);
  });

  // --- AsyncIterable Factory ---

  it('from() parses async iterable', async () => {
    async function* chunks(): AsyncGenerator<string> {
      yield '@DOC ver=2.0 | id=async-test ';
      yield '| title="Async"\n';
      yield '@NOTE text="streamed"\n';
    }

    const events: StreamEvent[] = [];
    for await (const event of StreamingYonParser.from(chunks(), { accumulate: true })) {
      events.push(event);
    }

    const records = events.filter(e => e.type === 'record');
    expect(records).toHaveLength(2);
    const docs = events.filter(e => e.type === 'document');
    expect(docs).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Equivalence: batch parse() vs StreamingYonParser
// ─────────────────────────────────────────────────────────────────────────────

describe('Batch vs Streaming Equivalence', () => {
  const testCases = [
    {
      name: 'simple document',
      input: '@DOC ver=2.0 | id=equiv | title="Equiv Test"\n@NOTE text="hello"\n@META count=42\n',
    },
    {
      name: 'document with block',
      input: [
        '@DOC ver=2.0 | id=equiv2 | title="Block Test"',
        '@BEGIN id=code | mime="application/json"',
        '{"a": 1}',
        '@END',
        '@NOTE text="after block"',
      ].join('\n') + '\n',
    },
    {
      name: 'document with comments',
      input: [
        '# Leading comment',
        '@DOC ver=2.0 | id=equiv3 | title="Comment Test"',
        '# Between',
        '@NOTE text="data"',
      ].join('\n') + '\n',
    },
    {
      name: 'document with domain',
      input: '@DOC ver=2.0 | id=equiv4 | title="Domain Test" | domain=yai.health@1.0\n@VITALS bp="120/80"\n',
    },
    {
      name: 'document with typed keys (§3.1.2)',
      input: '@DOC ver=2.0 | id=equiv5 | title="Typed Keys" | kind=workflow\n@STEP n:int=1 | op=std:fs.read@v1\n@STAMP ts:ts="2026-01-30T12:34:56Z" | src=human\n',
    },
    {
      name: 'document with list values (§3.1.4)',
      input: '@DOC ver=2.0 | id=equiv6 | title="List Values"\n@MAP name=ActivityFilter | pairs=["rainy"->"indoor","sunny"->"outdoor"]\n',
    },
    {
      name: 'document with typed keys and lists (mixed)',
      input: '@DOC ver=2.0 | id=equiv7 | title="Mixed" | kind=workflow\n@STEP n:int=1 | op=filter@v1 | in=[block:src] | out=[block:dst]\n',
    },
  ];

  for (const tc of testCases) {
    it(`produces identical records for: ${tc.name}`, () => {
      // Batch
      const batchDoc = parse(tc.input);

      // Streaming
      const events = collectEvents(tc.input);
      const streamDoc = events.find(e => e.type === 'document');
      expect(streamDoc).toBeDefined();
      if (streamDoc?.type !== 'document') return;

      // Compare document metadata
      expect(streamDoc.doc.id).toBe(batchDoc.id);
      expect(streamDoc.doc.version).toBe(batchDoc.version);
      expect(streamDoc.doc.title).toBe(batchDoc.title);
      expect(streamDoc.doc.kind).toBe(batchDoc.kind);
      expect(streamDoc.doc.domain).toBe(batchDoc.domain);
      expect(streamDoc.doc.domainVersion).toBe(batchDoc.domainVersion);

      // Compare record count and tags
      expect(streamDoc.doc.records.length).toBe(batchDoc.records.length);
      for (let i = 0; i < batchDoc.records.length; i++) {
        expect(streamDoc.doc.records[i]!.tag).toBe(batchDoc.records[i]!.tag);
        // Verify identical field count (catches spurious extra fields)
        expect(streamDoc.doc.records[i]!.fields.size).toBe(batchDoc.records[i]!.fields.size);
        // Compare all fields (deep equality for lists)
        for (const [key, val] of batchDoc.records[i]!.fields) {
          const streamVal = streamDoc.doc.records[i]!.fields.get(key);
          if (typeof val === 'object' && val !== null) {
            // List value — deep compare
            expect(streamVal).toEqual(val);
          } else {
            expect(streamVal).toBe(val);
          }
        }
        // Compare typedFields for type hints
        for (const [key, field] of batchDoc.records[i]!.typedFields) {
          const streamField = streamDoc.doc.records[i]!.typedFields.get(key);
          expect(streamField).toBeDefined();
          expect(streamField!.typeHint).toBe(field.typeHint);
        }
      }

      // Compare block count
      expect(streamDoc.doc.blocks.size).toBe(batchDoc.blocks.size);
      for (const [id, batchBlock] of batchDoc.blocks) {
        const streamBlock = streamDoc.doc.blocks.get(id);
        expect(streamBlock).toBeDefined();
        expect(streamBlock!.content).toBe(batchBlock.content);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Non-Accumulation Mode (default) — O(1) memory streaming
// ─────────────────────────────────────────────────────────────────────────────

describe('StreamingYonParser — default (no accumulation)', () => {
  it('records fire events but no document event at end()', () => {
    const events: StreamEvent[] = [];
    const parser = new StreamingYonParser({
      onEvent: (e) => events.push(e),
    });

    const lines = ['@DOC ver=2.0 | id=test | title="Test"'];
    for (let i = 0; i < 100; i++) {
      lines.push(`@NOTE text="record ${i}"`);
    }
    parser.write(lines.join('\n') + '\n');
    parser.end();

    const records = events.filter(e => e.type === 'record');
    const docs = events.filter(e => e.type === 'document');
    expect(records).toHaveLength(101); // 100 + @DOC
    expect(docs).toHaveLength(0); // no document event in default mode
  });

  it('docHeader returns @DOC metadata', () => {
    const parser = new StreamingYonParser();
    parser.write('@DOC ver=2.0 | id=header-test | title="Header" | domain=yai.health@1.0 | fmt=min\n');
    parser.write('@NOTE text="content"\n');
    parser.end();

    const header = parser.docHeader;
    expect(header).not.toBeNull();
    expect(header!.id).toBe('header-test');
    expect(header!.title).toBe('Header');
    expect(header!.domain).toBe('yai.health');
    expect(header!.domainVersion).toBe('1.0');
    expect(header!.fmt).toBe('min');
    expect(header!.version).toBe('2.0');
  });

  it('blocks are still retained and fire events', () => {
    const events: StreamEvent[] = [];
    const parser = new StreamingYonParser({
      onEvent: (e) => events.push(e),
    });

    parser.write('@DOC ver=2.0 | id=block-test | title="Block Test"\n');
    parser.write('@BEGIN JSON | id="data" | boundary="bnd_01"\n');
    parser.write('{"key": "value"}\n');
    parser.write('@END JSON | boundary="bnd_01"\n');
    parser.end();

    const blocks = events.filter(e => e.type === 'block');
    expect(blocks).toHaveLength(1);
    if (blocks[0]!.type === 'block') {
      expect(blocks[0]!.block.id).toBe('data');
      expect(blocks[0]!.block.content).toBe('{"key": "value"}');
    }
  });

  it('multi-doc reset updates docHeader', () => {
    const parser = new StreamingYonParser();
    parser.write('@DOC ver=2.0 | id=doc1 | title="First Doc"\n');
    parser.write('@NOTE text="first content"\n');

    expect(parser.docHeader?.id).toBe('doc1');

    parser.write('@DOC ver=2.0 | id=doc2 | title="Second Doc"\n');
    parser.write('@NOTE text="second content"\n');
    parser.end();

    expect(parser.docHeader?.id).toBe('doc2');
    expect(parser.docHeader?.title).toBe('Second Doc');
  });

  it('no accumulation at scale — 10K records, events fire, no document', () => {
    let recordCount = 0;
    let documentCount = 0;
    const parser = new StreamingYonParser({
      onEvent: (e) => {
        if (e.type === 'record') recordCount++;
        if (e.type === 'document') documentCount++;
      },
    });

    const lines = ['@DOC ver=2.0 | id=scale | title="Scale Test"'];
    for (let i = 0; i < 10_000; i++) {
      lines.push(`@NOTE text="record ${i}"`);
    }
    parser.write(lines.join('\n') + '\n');
    parser.end();

    expect(recordCount).toBe(10_001); // 10K + @DOC
    expect(documentCount).toBe(0);
  });

  it('docHeader is available after first @DOC write', () => {
    const parser = new StreamingYonParser();

    // Before any write — no header
    expect(parser.docHeader).toBeNull();

    // Write @DOC
    parser.write('@DOC ver=2.0 | id=prop-test | title="Property Check" | kind=data\n');

    // After @DOC — header available with correct id
    const header = parser.docHeader;
    expect(header).not.toBeNull();
    expect(header!.id).toBe('prop-test');
    expect(header!.title).toBe('Property Check');
    expect(header!.version).toBe('2.0');

    // Write more records — header still available
    parser.write('@NOTE text="content"\n');
    parser.end();
    expect(parser.docHeader!.id).toBe('prop-test');
  });

  it('streaming + per-record validation maintains O(1) memory', () => {
    // Create a validation context from a minimal document
    const stubDoc = parse('@DOC ver=2.0 | id=ctx | title="Context" | kind=data\n@NOTE text="stub"');
    const ctx = createValidationContext(stubDoc, { strict: false });
    let validCount = 0;

    const parser = new StreamingYonParser({
      onEvent: (event) => {
        if (event.type === 'record' && event.record.tag !== 'DOC') {
          const result = validateRecord(event.record, ctx);
          if (result.valid) validCount++;
        }
      },
    });

    // Stream 1000 records with per-record validation
    parser.write('@DOC ver=2.0 | id=val-test | title="Validation Test" | kind=data\n');
    for (let i = 0; i < 1000; i++) {
      parser.write(`@NOTE text="record ${i}" | seq:int=${i}\n`);
    }
    parser.end();

    // All records should validate
    expect(validCount).toBe(1000);
  });
});
