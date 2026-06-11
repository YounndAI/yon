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
 * YON Lexer
 * 
 * Tokenizes YON text into a stream of tokens for the parser.
 * The lexer sees characters. The parser sees meaning.
 * 
 * Performance: Uses charCodeAt + Uint8Array lookup tables instead of
 * per-character regex, and substring() instead of char-by-char concatenation.
 */

import { YonParseError } from './types.js';

export type TokenType =
  | 'TAG'           // @DOC, @STEP, etc.
  | 'KEY'           // field key (may include :type suffix)
  | 'EQUALS'        // =
  | 'PIPE'          // |
  | 'STRING'        // quoted string
  | 'BARE'          // unquoted value
  | 'LIST_START'    // [
  | 'LIST_END'      // ]
  | 'ARROW'         // ->
  | 'HASH'          // # (for shorthand block syntax)
  | 'NEWLINE'       // \n
  | 'COMMENT'       // # comment
  | 'BLOCK_CONTENT' // raw block payload between @BEGIN and @END
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance: Pre-computed character lookup tables (replaces per-char regex)
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

/** Tag chars: [A-Z0-9_] per §12 EBNF */
const TAG_CHARS = new Uint8Array(128);
for (let i = 65; i <= 90; i++) TAG_CHARS[i] = 1;    // A-Z
for (let i = 48; i <= 57; i++) TAG_CHARS[i] = 1;    // 0-9
TAG_CHARS[95] = 1;  // _

// Common character codes
const CH_AT = 64;         // @
const CH_DQUOTE = 34;     // "
const CH_BACKSLASH = 92;  // \
const CH_NEWLINE = 10;    // \n
const CH_CR = 13;         // \r
const CH_SPACE = 32;      // space
const CH_TAB = 9;         // \t
const CH_PIPE = 124;      // |
const CH_EQUALS = 61;     // =
const CH_LBRACKET = 91;   // [
const CH_RBRACKET = 93;   // ]
const CH_DASH = 45;       // -
const CH_GT = 62;         // >
const CH_HASH = 35;       // #
const CH_LBRACE = 123;    // {
const CH_RBRACE = 125;    // }
const CH_COLON = 58;      // :
// @END detection: chars 64(@), 69(E), 78(N), 68(D)
const CH_E = 69;
const CH_N = 78;
const CH_D = 68;
const CH_n = 110;         // n (for escape)
const CH_t = 116;         // t (for escape)

/**
 * Lexer state machine.
 * State is local. Each instance processes one document.
 */
export class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];
  /** D7: Flag to scan raw block content after @BEGIN line ends */
  private pendingBlockScan = false;
  /** D7: Track bytes-mode during @BEGIN field scanning */
  private pendingBytesMode = false;

  constructor(private readonly source: string) {}

  /**
   * Tokenize the source.
   * Hot loop — uses cached locals for source/length.
   */
  tokenize(): Token[] {
    const src = this.source;
    const len = src.length;
    while (this.pos < len) {
      this.scanToken(src, len);
    }
    this.tokens.push({ type: 'EOF', value: '', line: this.line, column: this.column });
    return this.tokens;
  }

  private scanToken(src: string, len: number): void {
    // Inline skipWhitespace — tight charCodeAt loop, no advance() calls
    while (this.pos < len) {
      const ws = src.charCodeAt(this.pos);
      if (ws !== CH_SPACE && ws !== CH_TAB) break;
      this.pos++; this.column++;
    }
    if (this.pos >= len) return;

    const code = src.charCodeAt(this.pos);
    const startLine = this.line;
    const startColumn = this.column;

    // Comment (only at start of line per §3.1.7)
    if (code === CH_HASH && startColumn === 1) {
      // scanUntil('\n') — use indexOf + substring
      const start = this.pos;
      const nlIdx = src.indexOf('\n', this.pos);
      const end = nlIdx === -1 ? len : nlIdx;
      this.column += end - start;
      this.pos = end;
      this.tokens.push({ type: 'COMMENT', value: src.substring(start, end), line: startLine, column: startColumn });
      return;
    }
    
    // Hash (for shorthand block syntax like @BEGIN ts#example)
    if (code === CH_HASH) {
      this.tokens.push({ type: 'HASH', value: '#', line: startLine, column: startColumn });
      this.pos++; this.column++;
      return;
    }

    // Newline
    if (code === CH_NEWLINE) {
      this.tokens.push({ type: 'NEWLINE', value: '\n', line: startLine, column: startColumn });
      this.pos++;
      this.line++;
      this.column = 1;
      
      // D7: If we just finished the @BEGIN line, scan raw block content now
      // UNLESS it's a bytes-mode block (bytes-mode uses inline @END)
      if (this.pendingBlockScan) {
        this.pendingBlockScan = false;
        if (!this.pendingBytesMode) {
          this.scanBlockContent(src, len);
        }
        this.pendingBytesMode = false;
      }
      return;
    }

    // Carriage return (skip, handle CRLF)
    if (code === CH_CR) {
      this.pos++; this.column++;
      return;
    }

    // Tag — inline scanWhile with TAG_CHARS lookup
    if (code === CH_AT) {
      this.pos++; this.column++; // skip @
      const tagStart = this.pos;
      while (this.pos < len && TAG_CHARS[src.charCodeAt(this.pos)]) {
        this.pos++; this.column++;
      }
      const tagBody = src.substring(tagStart, this.pos);
      // Validate tag has at least one uppercase char after @ (per §12 EBNF)
      if (tagBody.length === 0) {
        throw new YonParseError('E001', 'Empty tag - expected tag name after @', startLine, startColumn);
      }
      const tag = '@' + tagBody;
      this.tokens.push({ type: 'TAG', value: tag, line: startLine, column: startColumn });
      
      // D7: If this is @BEGIN, scan the rest of the line normally (for fields),
      // then consume the raw block content until we find a line starting with @END.
      if (tag === '@BEGIN') {
        this.pendingBlockScan = true;
        this.pendingBytesMode = false;
      }
      return;
    }

    // Pipe separator
    if (code === CH_PIPE) {
      this.tokens.push({ type: 'PIPE', value: '|', line: startLine, column: startColumn });
      this.pos++; this.column++;
      return;
    }

    // Equals
    if (code === CH_EQUALS) {
      this.tokens.push({ type: 'EQUALS', value: '=', line: startLine, column: startColumn });
      this.pos++; this.column++;
      return;
    }

    // List brackets
    if (code === CH_LBRACKET) {
      this.tokens.push({ type: 'LIST_START', value: '[', line: startLine, column: startColumn });
      this.pos++; this.column++;
      return;
    }
    if (code === CH_RBRACKET) {
      this.tokens.push({ type: 'LIST_END', value: ']', line: startLine, column: startColumn });
      this.pos++; this.column++;
      return;
    }

    // Arrow (for map pairs)
    if (code === CH_DASH && this.pos + 1 < len && src.charCodeAt(this.pos + 1) === CH_GT) {
      this.tokens.push({ type: 'ARROW', value: '->', line: startLine, column: startColumn });
      this.pos += 2; this.column += 2;
      return;
    }

    // Quoted string — fast-path/slow-path
    if (code === CH_DQUOTE) {
      const str = this.scanString(src, len);
      this.tokens.push({ type: 'STRING', value: str, line: startLine, column: startColumn });
      return;
    }

    // Brace-delimited value (inline JSON: args={"key":"value"})
    if (code === CH_LBRACE) {
      const braceValue = this.scanBraceValue(src, len);
      this.tokens.push({ type: 'BARE', value: braceValue, line: startLine, column: startColumn });
      return;
    }

    // Bare value or key — inline scanWhile with BARE_CHARS lookup
    const bareStart = this.pos;
    while (this.pos < len) {
      const bc = src.charCodeAt(this.pos);
      if (bc >= 128 || !BARE_CHARS[bc]) break;
      this.pos++; this.column++;
    }
    if (this.pos > bareStart) {
      const bare = src.substring(bareStart, this.pos);
      // Check if this is followed by = (key) or not (bare value)
      const nextCode = this.pos < len ? src.charCodeAt(this.pos) : 0;
      if (nextCode === CH_EQUALS || nextCode === CH_COLON) {
        this.tokens.push({ type: 'KEY', value: bare, line: startLine, column: startColumn });
        // Track bytes-mode for @BEGIN field scanning
        if (this.pendingBlockScan && bare.startsWith('bytes')) {
          this.pendingBytesMode = true;
        }
      } else {
        this.tokens.push({ type: 'BARE', value: bare, line: startLine, column: startColumn });
      }
      return;
    }

    // Unknown character - skip
    this.pos++; this.column++;
  }

  /**
   * Scan a quoted string literal.
   * Fast-path: substring() for clean segments. Slow-path: char-by-char at escapes.
   */
  private scanString(src: string, len: number): string {
    const startLine = this.line;
    const startColumn = this.column;
    this.pos++; this.column++; // skip opening quote
    
    // Fast path: no escapes — scan to closing quote
    let result = '';
    
    while (this.pos < len) {
      // Fast scan: find next special char (", \, \n)
      const segStart = this.pos;
      while (this.pos < len) {
        const c = src.charCodeAt(this.pos);
        if (c === CH_DQUOTE || c === CH_BACKSLASH || c === CH_NEWLINE) break;
        this.pos++; this.column++;
      }
      // Append clean segment via substring
      if (this.pos > segStart) {
        result += src.substring(segStart, this.pos);
      }
      
      if (this.pos >= len) break;
      
      const c = src.charCodeAt(this.pos);
      if (c === CH_DQUOTE) {
        this.pos++; this.column++;
        return result;
      }
      if (c === CH_NEWLINE) {
        throw new YonParseError('E001', 'Unterminated string - newline in string literal', startLine, startColumn);
      }
      // Escape sequence
      if (c === CH_BACKSLASH) {
        this.pos++; this.column++;
        if (this.pos < len) {
          const ec = src.charCodeAt(this.pos);
          switch (ec) {
            case CH_n: result += '\n'; break;
            case CH_t: result += '\t'; break;
            case CH_BACKSLASH: result += '\\'; break;
            case CH_DQUOTE: result += '"'; break;
            default: result += src[this.pos] ?? ''; break;
          }
          this.pos++; this.column++;
        }
      }
    }
    
    // EOF without closing quote
    throw new YonParseError('E001', 'Unterminated string - expected closing quote', startLine, startColumn);
  }

  /**
   * Scan a brace-delimited value (e.g., inline JSON).
   * Tracks nested brace depth and preserves embedded quoted strings.
   * Returns the full content including outer { }.
   */
  private scanBraceValue(src: string, len: number): string {
    const start = this.pos;
    this.pos++; this.column++; // skip opening {
    let depth = 1;
    
    while (this.pos < len && depth > 0) {
      const c = src.charCodeAt(this.pos);
      
      if (c === CH_LBRACE) {
        depth++;
        this.pos++; this.column++;
      } else if (c === CH_RBRACE) {
        depth--;
        this.pos++; this.column++;
      } else if (c === CH_DQUOTE) {
        // Scan embedded string (preserving quotes)
        this.pos++; this.column++;
        while (this.pos < len) {
          const sc = src.charCodeAt(this.pos);
          if (sc === CH_DQUOTE) {
            this.pos++; this.column++;
            break;
          }
          if (sc === CH_BACKSLASH) {
            this.pos++; this.column++;
            if (this.pos < len) { this.pos++; this.column++; }
            continue;
          }
          if (sc === CH_NEWLINE) break; // Unterminated string in JSON value
          this.pos++; this.column++;
        }
      } else if (c === CH_NEWLINE) {
        // Don't cross line boundaries — stop and return what we have
        break;
      } else {
        this.pos++; this.column++;
      }
    }

    return src.substring(start, this.pos);
  }

  /**
   * D7: Scan raw block content between @BEGIN and @END lines.
   * Uses indexOf('\n') for line-based scanning + substring() per line.
   * Emits a single BLOCK_CONTENT token with the raw payload.
   */
  private scanBlockContent(src: string, len: number): void {
    const contentStartLine = this.line;
    const contentStartColumn = this.column;

    // Handle empty blocks: check if @END is immediately at current position
    {
      let peekPos = this.pos;
      if (peekPos < len && src.charCodeAt(peekPos) === CH_CR) peekPos++;
      if (this.isAtEnd(src, len, peekPos)) {
        return; // Empty block — no BLOCK_CONTENT emitted, let normal tokenization handle @END
      }
    }

    const lines: string[] = [];

    while (this.pos < len) {
      // Find end of current line
      const nlIdx = src.indexOf('\n', this.pos);
      const lineEnd = nlIdx === -1 ? len : nlIdx;
      
      // Extract line content (strip trailing \r for CRLF)
      let lineContent: string;
      if (lineEnd > this.pos && src.charCodeAt(lineEnd - 1) === CH_CR) {
        lineContent = src.substring(this.pos, lineEnd - 1);
      } else {
        lineContent = src.substring(this.pos, lineEnd);
      }
      
      this.column += lineEnd - this.pos;
      this.pos = lineEnd;

      if (nlIdx === -1) {
        // EOF without @END
        throw new YonParseError('E001', 'Unterminated block - expected @END', contentStartLine, contentStartColumn);
      }

      // Consume newline
      lines.push(lineContent);
      this.pos++; // skip \n
      this.line++;
      this.column = 1;

      // Peek ahead: does the next line start with @END?
      if (this.pos < len) {
        let peekPos = this.pos;
        if (src.charCodeAt(peekPos) === CH_CR) peekPos++;
        if (this.isAtEnd(src, len, peekPos)) {
          // Found @END — emit block content (exclude last empty line from join)
          const content = lines.join('\n');
          if (content.length > 0) {
            this.tokens.push({
              type: 'BLOCK_CONTENT',
              value: content,
              line: contentStartLine,
              column: contentStartColumn,
            });
          }
          return; // Let normal tokenization handle @END
        }
      }
    }
    
    // EOF without @END
    throw new YonParseError('E001', 'Unterminated block - expected @END', contentStartLine, contentStartColumn);
  }

  /**
   * Check if position is at @END followed by whitespace or EOF.
   */
  private isAtEnd(src: string, len: number, pos: number): boolean {
    if (pos + 3 >= len) return false;
    if (src.charCodeAt(pos) !== CH_AT ||
        src.charCodeAt(pos + 1) !== CH_E ||
        src.charCodeAt(pos + 2) !== CH_N ||
        src.charCodeAt(pos + 3) !== CH_D) {
      return false;
    }
    // Verify followed by whitespace or EOF (not @ENDPOINT etc.)
    if (pos + 4 >= len) return true;
    const after = src.charCodeAt(pos + 4);
    return after === CH_SPACE || after === CH_TAB || after === CH_NEWLINE || after === CH_CR;
  }

}

export function tokenize(source: string): Token[] {
  return new Lexer(source).tokenize();
}
