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
 * YON v2.0 AST Types
 * 
 * This module defines the Abstract Syntax Tree types for YON documents.
 * Types are the source of truth. The code follows the types.
 * 
 * @module types
 * @see {@link https://yon.younndai.com YON Standard v2.0}
 * 
 * @example
 * ```typescript
 * import type { YonDocument, YonRecord } from '@younndai/yon-parser';
 * 
 * const doc: YonDocument = parse(source);
 * for (const record of doc.records) {
 *   console.log(record.tag, record.fields);
 * }
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core Value Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * YON value type suffix.
 * Used for typed key declarations (e.g., `count:int=42`).
 * 
 * @see YON Standard §3.2.3
 */
export type YonValueType = 
  | 'str'
  | 'int' 
  | 'float' 
  | 'bool' 
  | 'ts' 
  | 'bytes'
  | 'ref'
  | 'stream'
  | 'vector';

/**
 * A value with explicit type annotation.
 * Contains the parsed value, original type hint, and raw string.
 */
export interface YonTypedValue {
  /** The type suffix from the key (e.g., 'int' from 'count:int') */
  type: YonValueType;
  /** The raw string value — NOT coerced (§3.1.2: parsers MUST NOT coerce) */
  value: string;
  /** The original raw string (preserved for roundtrip) */
  raw: string;
}

/**
 * A key-value field within a record.
 * 
 * @example
 * ```typescript
 * // From: @RULE rid="rule:r1" | count:int=42
 * const field: YonField = { key: 'count', typeHint: 'int', value: 42 };
 * ```
 */
export interface YonField {
  /** Field key (without type suffix) */
  key: string;
  /** Optional type suffix (e.g., 'int', 'bool') */
  typeHint?: YonValueType;
  /** Field value */
  value: YonValue;
}

/**
 * Any valid YON value.
 * 
 * - `string` — Bare or quoted text (all scalar values are strings per §3.1.2)
 * - `YonList` — Bracketed list [...] 
 * - `YonMapPair[]` — Map pairs "key"->"value"
 */
export type YonValue = 
  | string 
  | YonList 
  | YonMapPair[];

/**
 * A bracketed list of items.
 * Lists can contain field items, reference tokens, or map pairs.
 * 
 * @see YON Standard §4.2
 */
export interface YonList {
  /** The kind of items in the list */
  kind: 'field-items' | 'reference-tokens' | 'map-pairs';
  /** The list items */
  items: YonListItem[];
}

/**
 * An item within a YonList.
 */
export type YonListItem = 
  | YonField       // for args/set
  | string         // for in/out (reference tokens)
  | YonMapPair;    // for pairs

/**
 * A key-value pair in a map list.
 * 
 * @example
 * ```typescript
 * // From: ["error"->"Error occurred", "retry"->"Retry again"]
 * const pair: YonMapPair = { key: 'error', value: 'Error occurred' };
 * ```
 */
export interface YonMapPair {
  /** Map key (unquoted) */
  key: string;
  /** Map value (unquoted) */
  value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Record Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A YON record (a line starting with @TAG).
 * Records are the atomic unit. Every line with @TAG is a record.
 * 
 * @example
 * ```typescript
 * // From: @RULE rid="rule:r1" | lvl="MUST" | when="user logs in"
 * const record: YonRecord = {
 *   tag: 'RULE',
 *   fields: new Map([['rid', 'rule:r1'], ['lvl', 'MUST']]),
 *   line: 5,
 *   column: 1,
 * };
 * ```
 */
export interface YonRecord {
  /** Record tag (without the @ prefix) */
  tag: string;
  /** Record fields as key-value pairs (simple access — typeHint not included) */
  fields: Map<string, YonValue>;
  /** Record fields with full type info (§3.1.2 typeHint preserved for roundtrip) */
  typedFields: Map<string, YonField>;
  /** Source line number (1-indexed) */
  line: number;
  /** Source column number (1-indexed) */
  column: number;
}

/**
 * A content block delimited by @BEGIN...@END.
 * Blocks embed foreign content. MIME types declare format.
 * 
 * @see YON Standard §6
 */
export interface YonBlock {
  /** Block TAG name (e.g., 'JSON', 'LOGS', 'MAP') from @BEGIN TAG */
  tag?: string;
  /** Block identifier */
  id: string;
  /** MIME type of the content */
  mime: string;
  /** Boundary string for boundary-mode blocks */
  boundary?: string;
  /** Exact byte count for bytes-mode blocks */
  bytes?: number;
  /** Content encoding (e.g., 'gzip+base64') */
  encoding?: string;
  /** Format mode for the block content */
  mode?: 'canon' | 'min' | 'ultra';
  /** Language hint for code blocks */
  lang?: string;
  /** SHA-256 hash for content integrity verification (§6.5) */
  sha256?: string;
  /** The block content (raw, decoded) */
  content: string;
  /** Starting line number (1-indexed) */
  startLine: number;
  /** Ending line number (1-indexed) */
  endLine: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * YON processing mode.
 * Controls how content is processed and structured.
 */
export type YonMode = 'struct' | 'chat' | 'text' | 'hybrid';

/**
 * YON format mode.
 * All lowercase.
 */
export type YonFormat = 'canon' | 'min' | 'ultra';

/**
 * Standard YON document kinds.
 * Extensible via `(string & {})` for community kinds.
 * 
 * @see YON Standard §3
 */
export type YonKind =
  | 'workflow'
  | 'rule'
  | 'spec'
  | 'note'
  | 'config'
  | 'policy'
  | 'prompt'
  | 'schema'
  | 'audit'
  | 'doc'
  // Community kinds (loose autocomplete)
  | (string & {});

/**
 * A complete YON document.
 * Contains the @DOC metadata and all records/blocks.
 * 
 * @example
 * ```typescript
 * const doc = parse(source);
 * console.log(doc.title);
 * console.log(`${doc.records.length} records`);
 * ```
 */
export interface YonDocument {
  /** YON version (e.g., "2.0") */
  version: string;
  /** Document kind (e.g., "workflow", "spec", "note") */
  kind: YonKind;
  /** Document identifier */
  id: string;
  /** Document title */
  title: string;
  /** Validation profile (core|decl|exec|audit|cognitive|agent|full) */
  profile?: string;
  /** Processing mode (struct|chat|text|hybrid) */
  mode?: YonMode;
  /** Scenario preset (optional) */
  scenario?: string;
  /** Format mode (canon|min|ultra) */
  fmt?: YonFormat;
  /** Domain name (e.g., 'yai.health', 'yai.fintech') — without version suffix */
  domain?: string;
  /** Domain version (e.g., '1.0') — parsed from domain=yai.health@1.0 (§16.1.1) */
  domainVersion?: string;
  /** Explicitly enabled features */
  features?: string[];
  /** Additional features to enable */
  with?: string[];
  /** Features to disable */
  without?: string[];
  /** All records in the document */
  records: YonRecord[];
  /** Blocks indexed by ID */
  blocks: Map<string, YonBlock>;
  /**
   * All document nodes in source order (records, comments, blocks).
   * Preserves document structure for roundtrip fidelity per §3.1.7 and §17.3.
   */
  nodes: YonNode[];
}

/**
 * Lightweight @DOC metadata — no records, nodes, or blocks retained.
 * Used by StreamingYonParser in non-accumulation mode to provide
 * document context without holding the full AST in memory.
 *
 * @example
 * ```typescript
 * const parser = new StreamingYonParser({ onEvent: handler });
 * parser.write(source);
 * parser.end();
 * console.log(parser.docHeader?.domain); // 'yai.health'
 * ```
 */
export interface YonDocHeader {
  /** YON version (e.g., "2.0") */
  version: string;
  /** Document kind */
  kind: YonKind;
  /** Document identifier */
  id: string;
  /** Document title */
  title: string;
  /** Validation profile */
  profile?: string;
  /** Processing mode */
  mode?: YonMode;
  /** Domain name (e.g., 'yai.health') */
  domain?: string;
  /** Domain version (e.g., '1.0') */
  domainVersion?: string;
  /** Explicitly enabled features */
  features?: string[];
  /** Additional features to enable */
  with?: string[];
  /** Features to disable */
  without?: string[];
  /** Format mode */
  fmt?: YonFormat;
}

/**
 * A node in the document tree. Discriminated union for ordered traversal.
 * Interleaves records, comments, and blocks in source order.
 * 
 * @see YON Standard §3.1.7, §17.3
 */
export type YonNode =
  | { type: 'record'; record: YonRecord }
  | { type: 'comment'; text: string; line: number }
  | { type: 'block'; block: YonBlock };

// ─────────────────────────────────────────────────────────────────────────────
// Profile & Feature Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard YON profiles.
 * 
 * @see YON Standard §16.1
 */
export type YonProfile = 'core' | 'decl' | 'exec' | 'audit' | 'cognitive' | 'agent' | 'full';

/**
 * YON feature flags.
 * 
 * @see YON Standard §16.2
 */
export type YonFeature = 
  // Layer 1-2 (Core Standard)
  | 'payload' 
  | 'logic' 
  | 'workflow' 
  | 'delta' 
  | 'provenance' 
  | 'refs'
  | 'dialogue'
  | 'sessions'
  // Layer 3 (Cognition)
  | 'cognition'
  | 'perception'
  | 'goals'
  | 'memory'
  | 'affect'
  // Layer 4 (Agent)
  | 'temporal'
  | 'collaboration'
  | 'composition'
  | 'governance'
  | 'reactive'
  | 'signaling'; // Agent signaling tags requiring agent profile

/**
 * Default feature sets for each profile.
 * Profiles bundle features. Choose by use case, not intuition.
 * 
 * @see Modes Spec §3
 */
export const PROFILE_PRESETS: Record<YonProfile, YonFeature[]> = {
  // Layer 1-2
  core: ['payload', 'logic', 'dialogue', 'sessions'],
  decl: ['payload', 'logic', 'refs', 'dialogue', 'sessions'],
  exec: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions'],
  audit: ['payload', 'logic', 'workflow', 'refs', 'delta', 'provenance', 'dialogue', 'sessions'],
  // Layer 3
  cognitive: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'affect'],
  // Layer 4
  agent: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'temporal', 'affect', 'collaboration', 'composition', 'governance', 'reactive', 'signaling'],
  // All features
  full: ['payload', 'logic', 'workflow', 'refs', 'delta', 'provenance', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'temporal', 'affect', 'collaboration', 'composition', 'governance', 'reactive', 'signaling'],
};

/**
 * Tags allowed by each feature.
 * 
 * @see Modes Spec §3.3
 */
export const FEATURE_TAGS: Record<YonFeature, string[]> = {
  // Layer 1-2 (Core Standard)
  payload: ['BEGIN', 'END'],
  logic: ['INTENT', 'SCOPE', 'RULE', 'SCHEMA', 'CFG', 'MAP', 'CHECK'],
  workflow: ['STEP', 'CATCH', 'RETRY', 'ERROR', 'INPUT', 'OUTPUT', 'YIELD'],
  delta: ['PATCH', 'VOID'],
  provenance: ['STAMP'],
  refs: ['REF'],
  dialogue: ['TURN', 'ACK'],
  sessions: ['SESSION', 'CHECKPOINT', 'RECOVER'],
  // Layer 3 (Cognition)
  cognition: ['THOUGHT', 'HYPOTHESIS', 'OBSERVATION', 'REFLECTION', 'DECISION', 'PRUNE', 'INTROSPECT', 'ESSENCE'],
  perception: ['PERCEPT', 'FOCUS'],
  goals: ['GOAL'],
  memory: ['MEMORY', 'LEARN', 'PULSE', 'IMPRINT', 'SHARD', 'MARK'],
  // Layer 4 (Agent)
  temporal: ['TIMELINE', 'EVENT'],
  affect: ['AFFECT'],
  collaboration: ['WORKSPACE', 'EDIT'],
  composition: ['CALL'],
  governance: ['TENET', 'ESCALATE', 'HALT', 'DEREGISTER'],
  reactive: ['ON', 'EMIT', 'LOOP'],
  'signaling': ['CAPS', 'SUBSCRIBE', 'ROUTE', 'SIGNAL', 'THROTTLE', 'AGENT', 'MERGE', 'STREAM'],
};

/**
 * Tags allowed in all profiles (structural infrastructure).
 */
export const STRUCTURAL_TAGS = ['DOC', 'SEC', 'META', 'DEF', 'NOTE', 'STAMP', 'REDACTION', 'CONSENT', 'IDENTITY', 'LOCATION'];

/**
 * Default MIME types for block TAGs.
 * Used for shorthand syntax expansion.
 * 
 * @see YON Standard §6.1
 */
export const DEFAULT_MIME_TYPES: Record<string, string> = {
  // Web
  tsx: 'text/x-tsx',
  ts: 'text/typescript',
  jsx: 'text/jsx',
  js: 'text/javascript',
  css: 'text/css',
  scss: 'text/x-scss',
  html: 'text/html',
  // Data
  json: 'application/json',
  jsonc: 'application/json',
  json5: 'application/json5',
  xml: 'application/xml',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  jsonl: 'application/x-ndjson',
  ndjson: 'application/x-ndjson',
  // Markup
  md: 'text/markdown',
  mdx: 'text/mdx',
  svg: 'image/svg+xml',
  rst: 'text/x-rst',
  tex: 'text/x-latex',
  adoc: 'text/asciidoc',
  // Config
  yaml: 'text/yaml',
  yml: 'text/yaml',
  toml: 'text/toml',
  env: 'text/plain',
  ini: 'text/plain',
  conf: 'text/plain',
  // Shell
  bash: 'text/x-bash',
  sh: 'text/x-sh',
  zsh: 'text/x-zsh',
  ps1: 'text/x-powershell',
  // Language
  py: 'text/x-python',
  sql: 'text/x-sql',
  graphql: 'application/graphql',
  rust: 'text/x-rust',
  rs: 'text/x-rust',
  go: 'text/x-go',
  java: 'text/x-java',
  kt: 'text/x-kotlin',
  swift: 'text/x-swift',
  c: 'text/x-c',
  cpp: 'text/x-c++',
  h: 'text/x-c',
  hpp: 'text/x-c++',
  cs: 'text/x-csharp',
  rb: 'text/x-ruby',
  php: 'text/x-php',
  lua: 'text/x-lua',
  r: 'text/x-r',
  // Schema/IaC
  prisma: 'text/x-prisma',
  proto: 'text/x-protobuf',
  tf: 'text/x-terraform',
  dockerfile: 'text/x-dockerfile',
  // YON and other text
  yon: 'text/x-yon',
  log: 'text/plain',
  txt: 'text/plain',
  diff: 'text/x-diff',
  patch: 'text/x-diff',
  // Image
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  // Binary
  pdf: 'application/pdf',
  wasm: 'application/wasm',
  bin: 'application/octet-stream',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// ─────────────────────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * YON error codes.
 * Standard errors (E0xx) for parsers/validators.
 * Runner errors (E1xx) for execution.
 * 
 * @see YON Standard — Error Code Registry
 */
export type YonErrorCode = 
  // Standard errors (E0xx) — parsers & validators
  | 'E001' // Validation failed
  | 'E002' // Timeout exceeded
  | 'E003' // Permission denied
  | 'E004' // Resource not found
  | 'E005' // Rate limit exceeded
  | 'E006' // Unterminated block
  // Runner errors (E1xx) — execution
  | 'E101' // Dependency cycle
  | 'E102' // Op not implemented
  | 'E103' // Sandbox violation
  | 'E104' // Version archived
  | 'E105' // Version revoked
  | 'E106' // Assertion failed
  | 'E107' // Runtime error
  | 'E108' // @HALT received
  | 'E109' // @TENET violated
  | 'E110' // @ESCALATE timeout
  | 'E111' // @IMPRINT rejected
  | 'E112'; // Trust threshold

/**
 * A YON error with code, message, and optional location.
 */
export interface YonError {
  /** Error code (E001-E006 Standard, E101-E112 Runner) */
  code: YonErrorCode;
  /** Human-readable error message */
  message: string;
  /** Source line number (1-indexed) */
  line?: number;
  /** Source column number (1-indexed) */
  column?: number;
}

/**
 * Error thrown during YON parsing.
 * Errors are structured. Code, message, and location.
 * 
 * @example
 * ```typescript
 * try {
 *   parse(source);
 * } catch (error) {
 *   if (error instanceof YonParseError) {
 *     console.log(`Parse error at line ${error.line}: ${error.message}`);
 *   }
 * }
 * ```
 */
export class YonParseError extends Error {
  constructor(
    /** Error code */
    public readonly code: YonErrorCode,
    message: string,
    /** Source line number */
    public readonly line?: number,
    /** Source column number */
    public readonly column?: number,
  ) {
    super(`${code}: ${message}${line ? ` (line ${line})` : ''}`);
    this.name = 'YonParseError';
  }
}

/**
 * Error thrown when YON validation fails.
 * Contains all validation errors found.
 */
export class YonValidationError extends Error {
  constructor(
    /** All validation errors */
    public readonly errors: YonError[],
  ) {
    super(`Validation failed with ${errors.length} error(s)`);
    this.name = 'YonValidationError';
  }
}
