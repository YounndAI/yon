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
 * YON Fast Parse — Fused Single-Pass Record Parser
 *
 * Scans source characters directly → YonRecord.
 * No intermediate Token[] allocation.
 *
 * Handles: tags, bare values, quoted strings (with escapes),
 * type hints, flag keys, lists (reference, map-pair, field-item),
 * duplicate detection, error reporting.
 *
 * Falls back to tokenize() + parseSingleRecord() for inline JSON {}.
 */

import {
  type YonRecord,
  type YonField,
  type YonValue,
  type YonValueType,
  type YonList,
  type YonListItem,
  type YonMapPair,
  YonParseError,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Lookup Tables (copied from lexer.ts for isolation)
// ─────────────────────────────────────────────────────────────────────────────

/** Bare value chars: [A-Za-z0-9_./:@+#-] per §3.1.3 */
const BARE_CHARS = new Uint8Array(128);
for (let i = 48; i <= 57; i++) BARE_CHARS[i] = 1;   // 0-9
for (let i = 65; i <= 90; i++) BARE_CHARS[i] = 1;   // A-Z
for (let i = 97; i <= 122; i++) BARE_CHARS[i] = 1;  // a-z
BARE_CHARS[95] = 1;  // _
BARE_CHARS[46] = 1;  // .
BARE_CHARS[47] = 1;  // /
BARE_CHARS[58] = 1;  // :
BARE_CHARS[64] = 1;  // @
BARE_CHARS[43] = 1;  // +
BARE_CHARS[35] = 1;  // #
BARE_CHARS[45] = 1;  // -

// Character codes
const CH_AT = 64;
const CH_DQUOTE = 34;
const CH_BACKSLASH = 92;
const CH_NEWLINE = 10;
const CH_SPACE = 32;
const CH_TAB = 9;
const CH_PIPE = 124;
const CH_EQUALS = 61;
const CH_LBRACKET = 91;
const CH_RBRACKET = 93;
const CH_DASH = 45;
const CH_GT = 62;
const CH_LBRACE = 123;
const CH_COMMA = 44;
const CH_n = 110;
const CH_t = 116;

/** Valid type hint suffixes (§3.1.2) */
const TYPE_HINTS = new Set<string>([
  'int', 'float', 'bool', 'ts', 'bytes', 'str', 'ref', 'stream', 'vector',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: tokenize path for inline JSON (rare)
// ─────────────────────────────────────────────────────────────────────────────

import { tokenize } from './lexer.js';

/**
 * Fallback: tokenize + walk tokens for lines containing inline JSON {}.
 * This is the old two-step path — only used for the rare inline JSON case.
 */
function parseRecordViaTokenize(line: string, lineNumber: number): YonRecord {
  const tokens = tokenize(line);
  // Minimal inline token-walking (mirrors parseSingleRecord from streaming.ts)
  let pos = 0;
  const current = () => tokens[pos]!;
  const isAtEnd = () => pos >= tokens.length || tokens[pos]!.type === 'EOF';
  const advance = () => tokens[pos++]!;
  const check = (type: string) => !isAtEnd() && current().type === type;

  if (!check('TAG')) {
    throw new YonParseError('E001', 'Expected @TAG', lineNumber, 1);
  }
  const tagToken = advance();
  const tag = tagToken.value.slice(1);
  const fields = new Map<string, YonValue>();
  const typedFields = new Map<string, YonField>();

  while (!isAtEnd() && !check('NEWLINE') && !check('TAG')) {
    if (check('PIPE')) { advance(); continue; }
    if (check('KEY') || check('BARE')) {
      const keyToken = advance();
      let key = keyToken.value;
      let typeHint: YonValueType | undefined;
      const colonIdx = key.indexOf(':');
      if (colonIdx > 0 && colonIdx < key.length - 1) {
        const pt = key.slice(colonIdx + 1);
        if (TYPE_HINTS.has(pt)) { typeHint = pt as YonValueType; key = key.slice(0, colonIdx); }
      }
      let value: YonValue;
      if (check('EQUALS')) {
        advance();
        if (!isAtEnd()) {
          if (check('LIST_START')) {
            value = parseListFromTokensFallback();
          } else {
            value = advance().value;
          }
        } else { value = 'true'; }
      } else { value = 'true'; }
      if (fields.has(key)) {
        throw new YonParseError('E001', `Duplicate field: ${key}`, lineNumber, keyToken.column);
      }
      fields.set(key, value);
      typedFields.set(key, { key, value, typeHint });
    } else { advance(); }
  }
  return { tag, fields, typedFields, line: lineNumber, column: 1 };

  function parseListFromTokensFallback(): YonList {
    advance(); // skip [
    const items: YonListItem[] = [];
    let kind: 'field-items' | 'reference-tokens' | 'map-pairs' = 'reference-tokens';
    while (!check('LIST_END') && !isAtEnd()) {
      if (check('BARE') && current().value === ',') { advance(); continue; }
      if (check('STRING')) {
        const ks = advance().value;
        if (check('ARROW')) {
          advance();
          const vs = check('STRING') ? advance().value : '';
          items.push({ key: ks, value: vs } as YonMapPair);
          kind = 'map-pairs';
          continue;
        }
        items.push(ks);
        continue;
      }
      if (check('KEY') || check('BARE')) {
        const np = pos + 1;
        if (np < tokens.length && tokens[np]?.type === 'EQUALS') {
          const fk = advance();
          advance(); // skip =
          const fv = !isAtEnd() ? advance().value : '';
          let fKey = fk.value;
          let fType: YonValueType | undefined;
          const ci = fKey.indexOf(':');
          if (ci > 0 && ci < fKey.length - 1) {
            const pt = fKey.slice(ci + 1);
            if (TYPE_HINTS.has(pt)) { fType = pt as YonValueType; fKey = fKey.slice(0, ci); }
          }
          items.push({ key: fKey, value: fv, typeHint: fType } as YonField);
          kind = 'field-items';
          continue;
        }
        items.push(advance().value);
        continue;
      }
      advance();
    }
    if (check('LIST_END')) advance();
    return { kind, items };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: parseRecordDirect
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a single YON record line directly from source.
 * No Token[] intermediate — scans characters and builds YonRecord inline.
 *
 * @param line   The line to parse (should start with @)
 * @param lineNumber  1-indexed line number for error reporting
 * @returns YonRecord with fields, typedFields, tag, line, column
 */
export function parseRecordDirect(line: string, lineNumber: number): YonRecord {
  const len = line.length;
  let pos = 0;

  // ── Skip leading whitespace ──
  while (pos < len) {
    const c = line.charCodeAt(pos);
    if (c !== CH_SPACE && c !== CH_TAB) break;
    pos++;
  }

  // ── Expect @TAG ──
  if (pos >= len || line.charCodeAt(pos) !== CH_AT) {
    throw new YonParseError('E001', 'Expected @TAG', lineNumber, pos + 1);
  }
  pos++; // skip @

  // Scan tag name
  const tagStart = pos;
  while (pos < len) {
    const c = line.charCodeAt(pos);
    // TAG chars: A-Z, 0-9, _
    if ((c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 95) {
      pos++;
    } else {
      break;
    }
  }

  if (pos === tagStart) {
    throw new YonParseError('E001', 'Empty tag - expected tag name after @', lineNumber, 1);
  }

  const tag = line.substring(tagStart, pos);
  const fields = new Map<string, YonValue>();
  const typedFields = new Map<string, YonField>();

  // ── Parse fields ──
  while (pos < len) {
    // Skip whitespace and pipes
    while (pos < len) {
      const c = line.charCodeAt(pos);
      if (c !== CH_SPACE && c !== CH_TAB && c !== CH_PIPE) break;
      pos++;
    }
    if (pos >= len) break;

    const c = line.charCodeAt(pos);

    // Check for inline JSON — fall back to tokenize path
    if (c === CH_LBRACE) {
      return parseRecordViaTokenize(line, lineNumber);
    }

    // Scan key
    const keyStart = pos;
    while (pos < len) {
      const kc = line.charCodeAt(pos);
      if (kc < 128 && BARE_CHARS[kc]) {
        pos++;
      } else {
        break;
      }
    }

    if (pos === keyStart) {
      // Not a bare key — skip this character
      pos++;
      continue;
    }

    let key = line.substring(keyStart, pos);
    let typeHint: YonValueType | undefined;

    // ── Type hint extraction (key:type) ──
    const colonIdx = key.indexOf(':');
    if (colonIdx > 0 && colonIdx < key.length - 1) {
      const possibleType = key.slice(colonIdx + 1);
      if (TYPE_HINTS.has(possibleType)) {
        typeHint = possibleType as YonValueType;
        key = key.slice(0, colonIdx);
      }
    }

    // ── Value ──
    let value: YonValue;

    // Skip whitespace before =
    while (pos < len && (line.charCodeAt(pos) === CH_SPACE || line.charCodeAt(pos) === CH_TAB)) pos++;

    if (pos < len && line.charCodeAt(pos) === CH_EQUALS) {
      pos++; // skip =

      // Skip whitespace after =
      while (pos < len && (line.charCodeAt(pos) === CH_SPACE || line.charCodeAt(pos) === CH_TAB)) pos++;

      if (pos >= len) {
        value = 'true';
      } else {
        const vc = line.charCodeAt(pos);

        if (vc === CH_DQUOTE) {
          // Quoted string with escape handling
          value = scanString(line, len, pos, lineNumber);
          pos = _lastStringEnd; // Updated by scanString
        } else if (vc === CH_LBRACKET) {
          // List value
          value = scanList(line, len, pos, lineNumber);
          pos = _lastListEnd;
        } else if (vc === CH_LBRACE) {
          // Inline JSON — fallback
          return parseRecordViaTokenize(line, lineNumber);
        } else {
          // Bare value
          const valStart = pos;
          while (pos < len) {
            const bc = line.charCodeAt(pos);
            if (bc < 128 && BARE_CHARS[bc]) {
              pos++;
            } else {
              break;
            }
          }
          value = line.substring(valStart, pos);
        }
      }
    } else {
      // Flag key (no =) → value is 'true'
      value = 'true';
    }

    // ── Duplicate check ──
    if (fields.has(key)) {
      throw new YonParseError(
        'E001',
        `Duplicate field: ${key}`,
        lineNumber,
        keyStart + 1,
      );
    }

    fields.set(key, value);
    typedFields.set(key, { key, value, typeHint });
  }

  return { tag, fields, typedFields, line: lineNumber, column: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// String Scanner (ported from Lexer.scanString)
// ─────────────────────────────────────────────────────────────────────────────

/** Position after the last scanned string (set by scanString) */
let _lastStringEnd = 0;

/**
 * Scan a quoted string starting at pos (which points to the opening ").
 * Handles escape sequences: \", \\, \n, \t.
 * Sets _lastStringEnd to the position after the closing ".
 */
function scanString(src: string, len: number, pos: number, lineNumber: number): string {
  const startCol = pos + 1;
  pos++; // skip opening quote

  let result = '';

  while (pos < len) {
    // Fast scan: find next special char (", \, newline)
    const segStart = pos;
    while (pos < len) {
      const c = src.charCodeAt(pos);
      if (c === CH_DQUOTE || c === CH_BACKSLASH || c === CH_NEWLINE) break;
      pos++;
    }
    // Append clean segment
    if (pos > segStart) {
      result += src.substring(segStart, pos);
    }

    if (pos >= len) break;

    const c = src.charCodeAt(pos);
    if (c === CH_DQUOTE) {
      pos++; // skip closing quote
      _lastStringEnd = pos;
      return result;
    }
    if (c === CH_NEWLINE) {
      throw new YonParseError('E001', 'Unterminated string - newline in string literal', lineNumber, startCol);
    }
    // Escape sequence
    if (c === CH_BACKSLASH) {
      pos++;
      if (pos < len) {
        const ec = src.charCodeAt(pos);
        switch (ec) {
          case CH_n: result += '\n'; break;
          case CH_t: result += '\t'; break;
          case CH_BACKSLASH: result += '\\'; break;
          case CH_DQUOTE: result += '"'; break;
          default: result += src[pos] ?? ''; break;
        }
        pos++;
      }
    }
  }

  throw new YonParseError('E001', 'Unterminated string - expected closing quote', lineNumber, startCol);
}

// ─────────────────────────────────────────────────────────────────────────────
// List Scanner
// ─────────────────────────────────────────────────────────────────────────────

/** Position after the last scanned list (set by scanList) */
let _lastListEnd = 0;

/**
 * Scan a list [...] starting at pos (which points to [).
 * Handles reference tokens, map pairs, and field items.
 */
function scanList(src: string, len: number, pos: number, lineNumber: number): YonList {
  pos++; // skip [
  const items: YonListItem[] = [];
  let kind: 'reference-tokens' | 'map-pairs' | 'field-items' = 'reference-tokens';

  while (pos < len) {
    // Skip whitespace and commas
    while (pos < len) {
      const c = src.charCodeAt(pos);
      if (c === CH_SPACE || c === CH_TAB || c === CH_COMMA) {
        pos++;
      } else {
        break;
      }
    }

    if (pos >= len) break;

    const c = src.charCodeAt(pos);

    // End of list
    if (c === CH_RBRACKET) {
      pos++; // skip ]
      _lastListEnd = pos;
      return { kind, items };
    }

    // Quoted string — could be map pair key or reference
    if (c === CH_DQUOTE) {
      const str = scanString(src, len, pos, lineNumber);
      pos = _lastStringEnd;

      // Check for arrow -> (map pair)
      // Skip whitespace
      while (pos < len && (src.charCodeAt(pos) === CH_SPACE || src.charCodeAt(pos) === CH_TAB)) pos++;

      if (pos + 1 < len && src.charCodeAt(pos) === CH_DASH && src.charCodeAt(pos + 1) === CH_GT) {
        pos += 2; // skip ->
        // Skip whitespace
        while (pos < len && (src.charCodeAt(pos) === CH_SPACE || src.charCodeAt(pos) === CH_TAB)) pos++;

        // Read value
        let mapValue = '';
        if (pos < len && src.charCodeAt(pos) === CH_DQUOTE) {
          mapValue = scanString(src, len, pos, lineNumber);
          pos = _lastStringEnd;
        }

        items.push({ key: str, value: mapValue } as YonMapPair);
        kind = 'map-pairs';
      } else {
        items.push(str);
      }
      continue;
    }

    // Bare token or field item
    const bareStart = pos;
    while (pos < len) {
      const bc = src.charCodeAt(pos);
      if (bc < 128 && BARE_CHARS[bc]) {
        pos++;
      } else {
        break;
      }
    }

    if (pos > bareStart) {
      const bare = src.substring(bareStart, pos);

      // Skip whitespace
      while (pos < len && (src.charCodeAt(pos) === CH_SPACE || src.charCodeAt(pos) === CH_TAB)) pos++;

      // Check if this is a field item (bare=value)
      if (pos < len && src.charCodeAt(pos) === CH_EQUALS) {
        pos++; // skip =

        // Skip whitespace
        while (pos < len && (src.charCodeAt(pos) === CH_SPACE || src.charCodeAt(pos) === CH_TAB)) pos++;

        // Read value
        let fieldValue: string;
        if (pos < len && src.charCodeAt(pos) === CH_DQUOTE) {
          fieldValue = scanString(src, len, pos, lineNumber);
          pos = _lastStringEnd;
        } else {
          const fvStart = pos;
          while (pos < len) {
            const fc = src.charCodeAt(pos);
            if (fc < 128 && BARE_CHARS[fc]) pos++;
            else break;
          }
          fieldValue = src.substring(fvStart, pos);
        }

        // Extract type hint from key
        let fieldKey = bare;
        let fieldTypeHint: YonValueType | undefined;
        const ci = bare.indexOf(':');
        if (ci > 0 && ci < bare.length - 1) {
          const pt = bare.slice(ci + 1);
          if (TYPE_HINTS.has(pt)) {
            fieldTypeHint = pt as YonValueType;
            fieldKey = bare.slice(0, ci);
          }
        }

        items.push({ key: fieldKey, value: fieldValue, typeHint: fieldTypeHint } as YonField);
        kind = 'field-items';
      } else {
        // Reference token
        items.push(bare);
      }
    } else {
      // Unknown character in list — skip
      pos++;
    }
  }

  // Unterminated list — return what we have
  _lastListEnd = pos;
  return { kind, items };
}
