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
 * YON Streaming Parser
 * 
 * Line-buffered incremental parser for streaming YON transports.
 * Aligns with Transport §2.3-2.6, Rationale §3-4.
 * 
 * Uses parseRecordDirect() from fast-parse for fused single-pass record scanning.
 */

import { parseRecordDirect } from './fast-parse.js';
import { parseDocHeader } from './parser.js';
import {
  type YonDocument,
  type YonDocHeader,
  type YonRecord,
  type YonBlock,
  type YonNode,
  YonParseError,
  DEFAULT_MIME_TYPES,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StreamEvent =
  | { type: 'document'; doc: YonDocument }
  | { type: 'record'; record: YonRecord; line: number }
  | { type: 'block'; block: YonBlock }
  | { type: 'comment'; text: string; line: number }
  | { type: 'error'; error: YonParseError };

export type StreamEventHandler = (event: StreamEvent) => void;

export interface StreamingParserOptions {
  /** Callback for each event */
  onEvent?: StreamEventHandler;
  /** Max block content bytes (default: 10MB) */
  maxBlockBytes?: number;
  /**
   * When true, records/nodes are retained in memory for document finalization.
   * When false (default), records are discarded after onEvent fires — O(1) memory.
   * The `document` event is only emitted at end() when accumulate is true.
   * @default false
   */
  accumulate?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// parseLine — standalone single-line parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a single complete YON line and return a StreamEvent.
 * Useful for consumers that already handle line splitting.
 * Does NOT handle block accumulation — use StreamingYonParser for that.
 */
export function parseLine(line: string, lineNumber = 1): StreamEvent {
  const trimmed = line.trim();

  // Empty line → skip (no event)
  if (trimmed === '') {
    return { type: 'comment', text: '', line: lineNumber };
  }

  // Comment line
  if (trimmed.startsWith('#')) {
    return { type: 'comment', text: trimmed.slice(1).trimStart(), line: lineNumber };
  }

  // Must be a record (starts with @)
  if (!trimmed.startsWith('@')) {
    return {
      type: 'error',
      error: new YonParseError('E001', `Expected @ tag, got: "${trimmed.slice(0, 30)}"`, lineNumber, 1),
    };
  }

  try {
    // Use the fused parser for a single line
    const record = parseRecordDirect(trimmed, lineNumber);
    return { type: 'record', record, line: lineNumber };
  } catch (e: unknown) {
    if (e instanceof YonParseError) {
      return { type: 'error', error: e };
    }
    return {
      type: 'error',
      error: new YonParseError('E001', String(e), lineNumber, 1),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// StreamingYonParser — line-buffered incremental parser
// ─────────────────────────────────────────────────────────────────────────────

export class StreamingYonParser {
  private buffer = '';
  private lineNumber = 0;
  private ended = false;
  private onEvent: StreamEventHandler;
  private maxBlockBytes: number;
  private accumulate: boolean;

  // Document accumulation state (only populated when accumulate=true)
  private records: YonRecord[] = [];
  private blocks = new Map<string, YonBlock>();
  private nodes: YonNode[] = [];
  private docStarted = false;

  // @DOC header retention (always stored, regardless of accumulate)
  private docRecord: YonRecord | null = null;

  // Block accumulation state (Transport §2.5: reconstruct from line stream)
  private inBlock = false;
  private blockTag = '';
  private blockId = '';
  private blockMime = '';
  private blockBoundary = '';
  private blockBytesMode = false;
  private blockContent: string[] = [];
  private blockStartLine = 0;
  private blockBytes = 0;

  constructor(options: StreamingParserOptions = {}) {
    this.onEvent = options.onEvent ?? (() => {});
    this.maxBlockBytes = options.maxBlockBytes ?? 10 * 1024 * 1024; // 10MB
    this.accumulate = options.accumulate ?? false;
  }

  /**
   * Lightweight @DOC metadata from the current document.
   * Available in both accumulate and non-accumulate modes.
   * Returns null if no @DOC record has been parsed yet.
   */
  get docHeader(): YonDocHeader | null {
    if (!this.docRecord) return null;
    const fields = this.docRecord.fields;

    // Parse domain@version from domain field
    const rawDomain = fields.get('domain') as string | undefined;
    let domain: string | undefined;
    let domainVersion: string | undefined;
    if (rawDomain && typeof rawDomain === 'string') {
      const atIdx = rawDomain.indexOf('@');
      if (atIdx > 0) {
        domain = rawDomain.slice(0, atIdx);
        domainVersion = rawDomain.slice(atIdx + 1);
      } else {
        domain = rawDomain;
      }
    }

    return {
      version: (fields.get('ver') as string) ?? '2.0',
      kind: (fields.get('kind') as string) ?? 'doc',
      id: (fields.get('id') as string) ?? '',
      title: (fields.get('title') as string) ?? '',
      profile: fields.get('profile') as string | undefined,
      mode: fields.get('mode') as any,
      domain,
      domainVersion,
      features: undefined,
      with: undefined,
      without: undefined,
      fmt: fields.get('fmt') as any,
    };
  }

  /**
   * Write a chunk of text to the parser.
   * May contain partial lines, multiple lines, or both.
   */
  write(chunk: string): void {
    if (this.ended) {
      throw new Error('Cannot write after end()');
    }

    this.buffer += chunk;

    // Process complete lines
    let newlineIdx: number;
    while ((newlineIdx = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIdx).replace(/\r$/, '');
      this.buffer = this.buffer.slice(newlineIdx + 1);
      this.lineNumber++;
      this.processLine(line);
    }
  }

  /**
   * Signal end of stream. Flushes any remaining buffer.
   */
  end(): void {
    if (this.ended) return;
    this.ended = true;

    // Flush partial line buffer
    if (this.buffer.length > 0) {
      this.lineNumber++;
      this.processLine(this.buffer.replace(/\r$/, ''));
      this.buffer = '';
    }

    // §2.6: Finalize open block as error
    if (this.inBlock) {
      this.emitError('Unterminated block — stream ended without @END', this.blockStartLine);
      this.inBlock = false;
    }

    // Emit final document if we have records (only when accumulating)
    if (this.docStarted && this.accumulate) {
      this.emitDocument();
    }
  }

  /**
   * Process a single complete line.
   */
  private processLine(line: string): void {
    const trimmed = line.trim();

    // Inside block — accumulate content or check for @END
    if (this.inBlock) {
      this.processBlockLine(trimmed, line);
      return;
    }

    // Empty line — skip silently
    if (trimmed === '') return;

    // Comment line (Transport §2.4: preserve # ping for relay)
    if (trimmed.startsWith('#')) {
      const text = trimmed.slice(1).trimStart();
      if (this.accumulate) {
        this.nodes.push({ type: 'comment', text, line: this.lineNumber });
      }
      this.onEvent({ type: 'comment', text, line: this.lineNumber });
      return;
    }

    // Must be a record
    if (!trimmed.startsWith('@')) {
      this.emitError(`Expected @ tag, got: "${trimmed.slice(0, 30)}"`, this.lineNumber);
      return;
    }

    // Check for @DOC — multi-doc reset (Transport §2.6)
    if (trimmed.startsWith('@DOC ') || trimmed === '@DOC') {
      if (this.docStarted) {
        // Finalize previous document
        if (this.accumulate) {
          this.emitDocument();
        }
        this.resetDocumentState();
      }
      this.docStarted = true;
    }

    // Check for @BEGIN — start block accumulation
    if (trimmed.startsWith('@BEGIN')) {
      this.startBlock(trimmed);
      return;
    }

    // Parse as normal record
    try {
      const record = parseRecordDirect(trimmed, this.lineNumber);

      // Retain @DOC record for docHeader access (always)
      if (record.tag === 'DOC') {
        this.docRecord = record;
      }

      if (this.accumulate) {
        this.records.push(record);
        this.nodes.push({ type: 'record', record });
      }
      this.onEvent({ type: 'record', record, line: this.lineNumber });
    } catch (e: unknown) {
      // Error isolation (Rationale §3): malformed record costs one line
      if (e instanceof YonParseError) {
        this.onEvent({ type: 'error', error: e });
      } else {
        this.emitError(String(e), this.lineNumber);
      }
    }
  }

  /**
   * Start block accumulation.
   */
  private startBlock(line: string): void {
    this.inBlock = true;
    this.blockStartLine = this.lineNumber;
    this.blockContent = [];
    this.blockBytes = 0;
    this.blockBytesMode = false;

    // Parse @BEGIN line to extract id, mime, boundary, bytes, tag
    try {
      const record = parseRecordDirect(line, this.lineNumber);
      
      // Extract block fields
      this.blockId = String(record.fields.get('id') ?? '');
      this.blockMime = String(record.fields.get('mime') ?? '');
      this.blockBoundary = String(record.fields.get('boundary') ?? '');
      
      // bytes-mode: @END can appear mid-line
      const bytesStr = record.fields.get('bytes');
      if (bytesStr !== undefined) {
        this.blockBytesMode = true;
      }
      
      // Check for shorthand: @BEGIN TAG#ID
      if (record.tag === 'BEGIN') {
        // Tag might be first positional after BEGIN
        const firstKey = [...record.fields.keys()][0];
        if (firstKey && firstKey.includes('#')) {
          const [shortTag, shortId] = firstKey.split('#');
          this.blockTag = shortTag ?? '';
          this.blockId = shortId ?? this.blockId;
        } else {
          this.blockTag = '';
        }
      }
    } catch {
      this.blockId = `block_${this.lineNumber}`;
      this.blockTag = '';
    }
  }

  /**
   * Process a line inside a block.
   */
  private processBlockLine(trimmed: string, rawLine: string): void {
    // Check for @END — handle bytes-mode where @END can appear mid-line
    const endIdx = rawLine.indexOf('@END');
    if (endIdx >= 0 && (trimmed.startsWith('@END') || this.blockBytesMode)) {
      // If @END is mid-line (bytes-mode), capture content before it
      if (endIdx > 0) {
        this.blockContent.push(rawLine.slice(0, endIdx));
      }
      this.finishBlock();
      return;
    }

    // Check for @DOC mid-block (Transport §2.6)
    if (trimmed.startsWith('@DOC ') || trimmed === '@DOC') {
      this.emitError('Unterminated block — new @DOC before @END', this.blockStartLine);
      this.inBlock = false;
      
      // Reset and process the @DOC line
      if (this.docStarted) {
        if (this.accumulate) {
          this.emitDocument();
        }
        this.resetDocumentState();
      }
      this.docStarted = true;
      
      // Parse the @DOC record
      try {
        const record = parseRecordDirect(trimmed, this.lineNumber);
        this.docRecord = record;
        if (this.accumulate) {
          this.records.push(record);
          this.nodes.push({ type: 'record', record });
        }
        this.onEvent({ type: 'record', record, line: this.lineNumber });
      } catch (e: unknown) {
        if (e instanceof YonParseError) {
          this.onEvent({ type: 'error', error: e });
        } else {
          this.emitError(String(e), this.lineNumber);
        }
      }
      return;
    }

    // Accumulate block content
    this.blockBytes += rawLine.length + 1;
    if (this.blockBytes > this.maxBlockBytes) {
      this.emitError(`Block exceeds maxBlockBytes (${this.maxBlockBytes})`, this.blockStartLine);
      this.inBlock = false;
      return;
    }

    this.blockContent.push(rawLine);
  }

  /**
   * Finalize a complete block and emit it.
   */
  private finishBlock(): void {
    this.inBlock = false;

    const content = this.blockContent.join('\n');
    const block: YonBlock = {
      id: this.blockId,
      tag: this.blockTag || undefined,
      content,
      mime: this.blockMime || DEFAULT_MIME_TYPES[this.blockTag] || 'text/plain',
      boundary: this.blockBoundary || undefined,
      startLine: this.blockStartLine,
      endLine: this.lineNumber,
    };

    this.blocks.set(block.id, block);
    if (this.accumulate) {
      this.nodes.push({ type: 'block', block });
    }
    this.onEvent({ type: 'block', block });
  }

  /**
   * Emit a complete document event.
   */
  private emitDocument(): void {
    if (this.records.length === 0) return;

    try {
      const doc = parseDocHeader(this.records, this.blocks, this.nodes);
      this.onEvent({ type: 'document', doc });
    } catch (e: unknown) {
      if (e instanceof YonParseError) {
        this.onEvent({ type: 'error', error: e });
      } else {
        this.emitError(String(e), 1);
      }
    }
  }

  /**
   * Reset document-level state for multi-doc streams (Transport §2.6).
   */
  private resetDocumentState(): void {
    this.records = [];
    this.blocks = new Map();
    this.nodes = [];
    this.docStarted = false;
    this.docRecord = null;
  }

  /**
   * Emit an error event.
   */
  private emitError(message: string, line: number): void {
    this.onEvent({
      type: 'error',
      error: new YonParseError('E001', message, line, 1),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Static factory for AsyncIterable sources
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parse an async iterable of string chunks, yielding StreamEvents.
   * 
   * @example
   * for await (const event of StreamingYonParser.from(response.body)) {
   *   if (event.type === 'record') console.log(event.record.tag);
   * }
   */
  static async *from(
    source: AsyncIterable<string>,
    options?: Omit<StreamingParserOptions, 'onEvent'>,
  ): AsyncGenerator<StreamEvent> {
    const events: StreamEvent[] = [];
    const parser = new StreamingYonParser({
      ...options,
      onEvent: (e) => events.push(e),
    });

    for await (const chunk of source) {
      parser.write(chunk);
      while (events.length > 0) {
        yield events.shift()!;
      }
    }

    parser.end();
    while (events.length > 0) {
      yield events.shift()!;
    }
  }
}
