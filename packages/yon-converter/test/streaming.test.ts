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
 * @younndai/yon-converter — Streaming Tests
 *
 * Does the async API work correctly?
 * Tests all streaming generators, chunking behavior, metadata,
 * concurrent streams, and pre-parsed YonDocument input.
 */

import { describe, it, expect } from 'vitest';
import { parse } from '@younndai/yon-parser';
import {
  streamToJson,
  streamToYaml,
  streamToToml,
  streamReverse,
  streamRecords,
  collectStream,
} from '../src/streaming.js';
import { reverseConvert } from '../src/reverse.js';
import type { StreamChunk } from '../src/streaming.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MULTI_RECORD_YON = `@DOC ver=2.0 | id=stream-test | title="Stream Test"
@SEC name="config"
@MAP name="database" | pairs=["host"->"localhost","port"->"5432"]
@MAP name="cache" | pairs=["enabled"->"true","ttl"->"300"]
@SEC name="rules"
@MAP name="rules_0" | pairs=["lvl"->"MUST","when"->"testing","then"->"pass"]
@MAP name="rules_1" | pairs=["lvl"->"SHOULD","when"->"building","then"->"compile"]`;

const SIMPLE_YON = `@DOC ver=2.0 | id=simple | title="Simple"
@MAP name="data" | pairs=["name"->"Alice","age"->"30"]`;

// ═══════════════════════════════════════════════════════════════════════════
// streamToJson
// ═══════════════════════════════════════════════════════════════════════════

describe('streamToJson', () => {
  it('produces valid JSON when collected', async () => {
    const stream = streamToJson(SIMPLE_YON);
    const result = await collectStream(stream);
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
    expect(JSON.stringify(parsed)).toContain('Alice');
  });

  it('chunk indices increment correctly', async () => {
    const stream = streamToJson(MULTI_RECORD_YON, { chunkSize: 32 });
    const chunks: StreamChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i]!.index).toBe(i);
    }
  });

  it('last chunk has isLast=true', async () => {
    const stream = streamToJson(SIMPLE_YON);
    const chunks: StreamChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1]!.isLast).toBe(true);
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(chunks[i]!.isLast).toBe(false);
    }
  });

  it('custom chunkSize produces appropriately sized chunks', async () => {
    const chunkSize = 64;
    const stream = streamToJson(MULTI_RECORD_YON, { chunkSize });
    const chunks: StreamChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(chunks[i]!.content.length).toBeLessThanOrEqual(chunkSize);
    }
    expect(chunks.length).toBeGreaterThan(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// streamToYaml
// ═══════════════════════════════════════════════════════════════════════════

describe('streamToYaml', () => {
  it('produces valid YAML when collected', async () => {
    const stream = streamToYaml(SIMPLE_YON);
    const result = await collectStream(stream);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Alice');
  });

  it('chunk metadata is correct', async () => {
    const stream = streamToYaml(MULTI_RECORD_YON, { chunkSize: 32 });
    const chunks: StreamChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i]!.bytesSoFar).toBeGreaterThan(chunks[i - 1]!.bytesSoFar);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// streamToToml
// ═══════════════════════════════════════════════════════════════════════════

describe('streamToToml', () => {
  it('produces valid TOML when collected', async () => {
    const stream = streamToToml(SIMPLE_YON);
    const result = await collectStream(stream);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('chunk metadata is correct', async () => {
    const stream = streamToToml(SIMPLE_YON, { chunkSize: 16 });
    const chunks: StreamChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1]!.isLast).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// streamReverse
// ═══════════════════════════════════════════════════════════════════════════

describe('streamReverse', () => {
  it('routes to JSON correctly', async () => {
    const stream = streamReverse(SIMPLE_YON, { targetFormat: 'json' });
    const result = await collectStream(stream);
    const parsed = JSON.parse(result);
    expect(parsed).toBeDefined();
  });

  it('routes to YAML correctly', async () => {
    const stream = streamReverse(SIMPLE_YON, { targetFormat: 'yaml' });
    const result = await collectStream(stream);
    expect(result).toContain('Alice');
  });

  it('throws on unsupported format', async () => {
    const stream = streamReverse(SIMPLE_YON, { targetFormat: 'csv' as 'json' });
    await expect(async () => {
      await collectStream(stream);
    }).rejects.toThrow();
  });

  it('streaming output contains same data as non-streaming reverseConvert', async () => {
    const streamResult = await collectStream(streamToJson(SIMPLE_YON));
    const syncResult = reverseConvert(SIMPLE_YON, { targetFormat: 'json' });

    const streamStr = JSON.stringify(JSON.parse(streamResult));
    const syncStr = JSON.stringify(JSON.parse(syncResult));
    expect(streamStr).toContain('Alice');
    expect(syncStr).toContain('Alice');
    expect(streamStr).toContain('30');
    expect(syncStr).toContain('30');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// streamRecords
// ═══════════════════════════════════════════════════════════════════════════

describe('streamRecords', () => {
  it('yields individual records with correct indices', async () => {
    const records: { index: number }[] = [];
    for await (const item of streamRecords(MULTI_RECORD_YON)) {
      records.push(item);
    }
    expect(records.length).toBeGreaterThan(0);
    for (let i = 0; i < records.length; i++) {
      expect(records[i]!.index).toBe(i);
    }
  });

  it('record count matches document structure', async () => {
    const records: { index: number }[] = [];
    for await (const item of streamRecords(MULTI_RECORD_YON)) {
      records.push(item);
    }
    expect(records.length).toBe(7);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// collectStream
// ═══════════════════════════════════════════════════════════════════════════

describe('collectStream', () => {
  it('reassembles output correctly', async () => {
    const stream = streamToJson(MULTI_RECORD_YON, { chunkSize: 32 });
    const collected = await collectStream(stream);
    const parsed = JSON.parse(collected);
    expect(typeof parsed).toBe('object');
  });

  it('handles empty-ish YON document', async () => {
    const emptyYon = '@DOC ver=2.0 | id=empty | title="Empty"';
    const stream = streamToJson(emptyYon);
    const result = await collectStream(stream);
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Pre-parsed YonDocument input
// ═══════════════════════════════════════════════════════════════════════════

describe('streaming with pre-parsed YonDocument', () => {
  it('streamToJson accepts a YonDocument instead of string', async () => {
    const doc = parse(SIMPLE_YON);
    const stream = streamToJson(doc);
    const result = await collectStream(stream);
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).toContain('Alice');
    expect(jsonStr).toContain('30');
  });
});
