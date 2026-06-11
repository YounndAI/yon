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
 * YON v2.0 Parser
 * 
 * Parses YON source into AST using fused single-pass scanning.
 * Records are parsed via parseRecordDirect() — no tokenize step.
 */

import { parseRecordDirect } from './fast-parse.js';
import {
  type YonDocument,
  type YonRecord,
  type YonBlock,
  type YonNode,
  type YonValue,
  type YonListItem,
  YonParseError,
  DEFAULT_MIME_TYPES,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared: extractStringList + parseDocHeader
// ─────────────────────────────────────────────────────────────────────────────

function extractStringList(value: YonValue | undefined): string[] | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return undefined;
  if ('kind' in value) {
    return value.items.map((item: YonListItem) => String(typeof item === 'string' ? item : ('key' in item ? item.key : '')));
  }
  return undefined;
}

/**
 * Extract @DOC header metadata from parsed records.
 * Used by both batch parser and streaming parser.
 */
export function parseDocHeader(
  records: YonRecord[],
  blocks: Map<string, YonBlock>,
  nodes: YonNode[],
): YonDocument {
  const docRecord = records[0];
  if (!docRecord || docRecord.tag !== 'DOC') {
    throw new YonParseError('E001', 'First record must be @DOC', 1, 1);
  }

  // Validate required @DOC fields
  if (!docRecord.fields.has('ver')) {
    throw new YonParseError('E001', '@DOC missing required field: ver', docRecord.line, 1);
  }
  if (!docRecord.fields.has('id')) {
    throw new YonParseError('E001', '@DOC missing required field: id', docRecord.line, 1);
  }

  // Parse domain@version
  let domain: string | undefined;
  let domainVersion: string | undefined;
  const rawDomain = docRecord.fields.get('domain') as string | undefined;
  if (rawDomain) {
    if (rawDomain.includes('@')) {
      const atIdx = rawDomain.lastIndexOf('@');
      domain = rawDomain.slice(0, atIdx);
      domainVersion = rawDomain.slice(atIdx + 1);
    } else {
      domain = rawDomain;
    }
  }

  return {
    version: String(docRecord.fields.get('ver')),
    kind: String(docRecord.fields.get('kind') ?? 'doc'),
    id: String(docRecord.fields.get('id') ?? ''),
    title: String(docRecord.fields.get('title') ?? ''),
    mode: docRecord.fields.get('mode') as 'struct' | 'chat' | 'text' | 'hybrid' | undefined,
    scenario: docRecord.fields.get('scenario') as string | undefined,
    domain,
    domainVersion,
    profile: docRecord.fields.get('profile') as string | undefined,
    fmt: docRecord.fields.get('fmt') as 'canon' | 'min' | 'ultra' | undefined,
    features: extractStringList(docRecord.fields.get('features')),
    with: extractStringList(docRecord.fields.get('with')),
    without: extractStringList(docRecord.fields.get('without')),
    records,
    blocks,
    nodes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Continuation-line pre-processor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A processed source line ready for the main parser loop. `rawLine` may
 * include continuation lines joined onto an @TAG record via the canonical
 * field separator (" | "). `lineNumber` is the 1-indexed line number of the
 * @TAG line at the start of the (possibly multi-line) record — used for
 * error reporting.
 */
interface ProcessedLine {
  rawLine: string;
  lineNumber: number;
}

/**
 * Join continuation lines into their preceding @TAG record.
 *
 * Per YON v2.0 spec (records.md §Continuation Lines, normative):
 *   - A record MAY span multiple physical lines.
 *   - Continuation lines MUST begin with whitespace and use `|` as the first
 *     non-whitespace character.
 *   - Parsers MUST concatenate continuation lines with the preceding @TAG line.
 *   - Leading whitespace on continuation lines is consumed during concatenation.
 *
 * Per blocks.md §Continuation Lines and Blocks (normative):
 *   - Inside a block (between @BEGIN and matching @END), all content is raw
 *     payload. Continuation rules DO NOT apply.
 *
 * Implementation notes:
 *   - We track `inBlock` state based on @BEGIN / @END at line start. After
 *     consuming an @BEGIN record (plus its own continuations, if any), we
 *     switch into block-payload mode and pass subsequent lines through
 *     unchanged until @END.
 *   - Continuations are joined onto the preceding record using a single
 *     space separator. The continuation's leading `|` is preserved (it
 *     becomes the field separator in the resulting joined line).
 *   - A stray continuation line with no preceding @TAG record is passed
 *     through unchanged; the main parser will raise E001 for it.
 */
function joinContinuations(rawLines: string[]): ProcessedLine[] {
  const result: ProcessedLine[] = [];
  let inBlock = false;
  let i = 0;

  while (i < rawLines.length) {
    const rawLine = rawLines[i] ?? '';
    const stripped = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    const trimmed = stripped.trim();
    const lineNumber = i + 1;

    // Inside block payload — pass through verbatim. Watch for @END to exit.
    if (inBlock) {
      result.push({ rawLine, lineNumber });
      if (trimmed.startsWith('@END')) {
        inBlock = false;
      }
      i++;
      continue;
    }

    // Outside block: push this line as a new entry.
    result.push({ rawLine, lineNumber });

    // If it's an @TAG record, consume any subsequent continuation lines.
    if (trimmed.startsWith('@')) {
      i++;
      while (i < rawLines.length) {
        const nextRaw = rawLines[i] ?? '';
        const nextStripped = nextRaw.endsWith('\r') ? nextRaw.slice(0, -1) : nextRaw;
        const nextTrimmed = nextStripped.trim();
        const startsWithWs = nextStripped.length > 0 && (nextStripped[0] === ' ' || nextStripped[0] === '\t');
        const nextIsContinuation = startsWithWs && nextTrimmed.startsWith('|');

        if (!nextIsContinuation) break;

        const last = result[result.length - 1]!;
        last.rawLine = last.rawLine + ' ' + nextTrimmed;
        i++;
      }

      // If the original line started @BEGIN, switch to block-payload mode now
      // (after any @BEGIN continuations have been consumed).
      if (trimmed.startsWith('@BEGIN')) {
        inBlock = true;
      }
      continue;
    }

    // Not an @TAG line (empty, comment, or stray). No continuation handling.
    i++;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser Class
// ─────────────────────────────────────────────────────────────────────────────

export class Parser {
  constructor(private readonly source: string) {}

  /**
   * Parse the source into a YonDocument.
   * Parsing is deterministic. Same input, same output.
   *
   * Uses line-splitting + parseRecordDirect() for records (fused path).
   * Blocks use line-accumulation (converges with streaming architecture).
   */
  parse(): YonDocument {
    const records: YonRecord[] = [];
    const blocks = new Map<string, YonBlock>();
    const nodes: YonNode[] = [];

    // Split source into lines and join continuation lines per spec records.md.
    // Continuation-handling is disabled inside @BEGIN/@END block payloads per
    // blocks.md. See joinContinuations() above.
    const rawLines = this.source.split('\n');
    const lines = joinContinuations(rawLines);

    // Block accumulation state
    let inBlock = false;
    let blockStartLine = 0;
    let blockContent: string[] = [];
    let blockTag: string | undefined;
    let blockId = '';
    let blockMime = 'text/plain';
    let blockBoundary: string | undefined;
    let blockBytes: number | undefined;
    let blockEncoding: string | undefined;
    let blockMode: 'canon' | 'min' | 'ultra' | undefined;
    let blockLang: string | undefined;
    let blockSha256: string | undefined;

    let foundDoc = false;

    for (const processed of lines) {
      const rawLine = processed.rawLine;
      const lineNumber = processed.lineNumber;
      const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
      const trimmed = line.trim();

      // ── Inside block: accumulate or detect @END ──
      if (inBlock) {
        // Bytes-mode: @END can appear on the same line as content
        const endIdx = line.indexOf('@END');
        if (endIdx >= 0 && (endIdx === 0 || blockBytes !== undefined)) {
          if (endIdx > 0) {
            blockContent.push(line.slice(0, endIdx));
          }

          const endSuffix = line.slice(endIdx + 4).trim();
          let endTag: string | undefined;
          let endId: string | undefined;

          if (endSuffix) {
            if (endSuffix.includes('#')) {
              const [et, ei] = endSuffix.split('#');
              endTag = et?.trim();
              endId = ei?.trim();
            } else {
              const spaceIdx = endSuffix.indexOf(' ');
              endTag = spaceIdx > 0 ? endSuffix.slice(0, spaceIdx) : endSuffix;
              
              if (spaceIdx > 0) {
                const endFields = endSuffix.slice(spaceIdx).trim();
                const bndMatch = endFields.match(/boundary\s*=\s*"?([^"\s|]+)"?/);
                if (bndMatch && blockBoundary && bndMatch[1] !== blockBoundary) {
                  throw new YonParseError(
                    'E001',
                    `@END boundary mismatch: expected "${blockBoundary}", got "${bndMatch[1]}"`,
                    lineNumber,
                    1,
                  );
                }
              }
            }

            if (blockTag && endTag) {
              const normalizedEnd = endTag.toUpperCase();
              if (normalizedEnd !== blockTag) {
                throw new YonParseError(
                  'E001',
                  `@END TAG mismatch: expected "${blockTag}", got "${endTag}"`,
                  lineNumber,
                  1,
                );
              }
            }

            if (endId !== undefined && blockId && endId !== blockId) {
              throw new YonParseError(
                'E001',
                `@END ID mismatch: expected "${blockId}", got "${endId}"`,
                lineNumber,
                1,
              );
            }
          }

          const content = blockContent.join('\n').trim();
          const block: YonBlock = {
            tag: blockTag,
            id: blockId,
            mime: blockMime,
            boundary: blockBoundary,
            bytes: blockBytes,
            encoding: blockEncoding,
            mode: blockMode,
            lang: blockLang,
            sha256: blockSha256,
            content,
            startLine: blockStartLine,
            endLine: lineNumber,
          };

          if (blocks.has(block.id)) {
            throw new YonParseError('E001', `Duplicate block id "${block.id}"`, block.startLine, 1);
          }

          blocks.set(block.id, block);
          nodes.push({ type: 'block', block });
          inBlock = false;
          blockContent = [];
          continue;
        }

        blockContent.push(line);
        continue;
      }

      // ── Empty line ──
      if (trimmed === '') continue;

      // ── Comment ──
      if (trimmed.startsWith('#')) {
        const text = trimmed.slice(1).trimStart();
        nodes.push({ type: 'comment', text, line: lineNumber });
        continue;
      }

      // ── Must start with @ ──
      if (!trimmed.startsWith('@')) {
        throw new YonParseError('E001', `Expected @ tag, got: "${trimmed.slice(0, 30)}"`, lineNumber, 1);
      }

      // ── @DOC check ──
      if (!foundDoc) {
        if (!trimmed.startsWith('@DOC')) {
          throw new YonParseError('E001', 'First non-comment record must be @DOC', lineNumber, 1);
        }
        foundDoc = true;
      }

      // ── @BEGIN: start block ──
      if (trimmed.startsWith('@BEGIN')) {
        inBlock = true;
        blockStartLine = lineNumber;
        blockContent = [];

        try {
          const br = parseRecordDirect(trimmed, lineNumber);

          blockTag = undefined;
          blockId = String(br.fields.get('id') ?? '');
          blockMime = String(br.fields.get('mime') ?? 'text/plain');
          blockBoundary = br.fields.get('boundary') as string | undefined;
          const bytesStr = br.fields.get('bytes');
          blockBytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : undefined;
          blockEncoding = br.fields.get('encoding') as string | undefined;
          blockMode = br.fields.get('mode') as 'canon' | 'min' | 'ultra' | undefined;
          blockLang = br.fields.get('lang') as string | undefined;
          blockSha256 = br.fields.get('sha256') as string | undefined;

          if (br.tag === 'BEGIN') {
            const firstKey = [...br.fields.keys()][0];
            if (firstKey && firstKey.includes('#')) {
              const [shortTag, shortId] = firstKey.split('#');
              blockTag = shortTag?.toUpperCase();
              blockId = shortId ?? blockId;
              const lowerTag = shortTag?.toLowerCase() ?? '';
              blockMime = DEFAULT_MIME_TYPES[lowerTag] ?? 'text/plain';
              blockBoundary = blockBoundary ?? `bnd_${blockId}`;
            } else if (firstKey) {
              const isUppercaseTag = /^[A-Z][A-Z0-9_]*$/.test(firstKey);
              if (isUppercaseTag && br.fields.get(firstKey) === 'true') {
                blockTag = firstKey;
                // Derive a unique block ID when none was explicitly provided.
                // Use boundary (unique per block) or fall back to type_lineNumber.
                if (!blockId) {
                  blockId = blockBoundary ?? `${firstKey.toLowerCase()}_${lineNumber}`;
                }
              }
            }
          }
        } catch {
          blockId = `block_${lineNumber}`;
          blockTag = undefined;
        }
        continue;
      }

      // ── Regular record ──
      const record = parseRecordDirect(trimmed, lineNumber);
      records.push(record);
      nodes.push({ type: 'record', record });
    }

    if (inBlock) {
      throw new YonParseError(
        'E006',
        `Unterminated block "${blockId || 'unnamed'}" - expected @END`,
        blockStartLine,
        1,
      );
    }

    return parseDocHeader(records, blocks, nodes);
  }
}

export function parse(source: string): YonDocument {
  return new Parser(source).parse();
}
