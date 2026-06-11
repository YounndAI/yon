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
 * @younndai/yon-parser
 * 
 * YON reference parser and validator.
 * Parsing is foundational. Everything else depends on correct structure.
 */

// Core parse function
export { parse, Parser } from './parser.js';

// Validation
export {
  validate,
  createValidationContext,
  validateRecord,
  validateBlock,
  type YonValidateOptions,
  type YonValidationResult,
  type YonValidationContext,
} from './validator.js';

// Formatting — document-level and granular per-record/per-block
export { format, formatRecord, formatBlock, sortFields, type FormatOptions } from './formatter.js';

// Integrity — SHA-256 verification helpers (runner utility)
export { verifyBlockIntegrity, verifyDocumentIntegrity } from './integrity.js';

// Lexer (for advanced use)
export { tokenize, Lexer, type Token, type TokenType } from './lexer.js';

// Scenarios
export {
  type YonScenario,
  type ScenarioOverrides,
  SCENARIO_REGISTRY,
  BASE_DEFAULTS,
  resolveScenario,
  hasScenario,
  getScenarioIds,
} from './scenarios.js';

// Types
export {
  // Document & AST
  type YonDocument,
  type YonDocHeader,
  type YonRecord,
  type YonBlock,
  type YonField,
  type YonValue,
  type YonList,
  type YonListItem,
  type YonMapPair,
  type YonTypedValue,
  type YonValueType,
  type YonNode,
  
  // Profiles & Features
  type YonProfile,
  type YonFeature,
  type YonKind,
  PROFILE_PRESETS,
  FEATURE_TAGS,
  STRUCTURAL_TAGS,
  DEFAULT_MIME_TYPES,
  
  // Mode & Format
  type YonMode,
  type YonFormat,
  
  // Errors
  type YonError,
  type YonErrorCode,
  YonParseError,
  YonValidationError,
} from './types.js';

// Domain types — shared vocabulary, NOT deprecated
export {
  type DomainSchema,
  type DomainRecord,
  type DomainSchemaJSON,
  type DomainStatus,
  type DomainTier,
  type FieldConstraint,
} from './domains.js';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export {
  getBundledDomain,
  listBundledDomains,
  isBundledDomain,
  getDomainTags,
  loadDomainFromJSON,
  isOfficialDomain,
  listDomains,
  getLocalDomain,
  registerDomain,
  unregisterDomain,
  resolveDomain,
} from './domains.js';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export {
  getDomain,
  fetchDomainList,
  setRegistryUrl,
  getRegistryUrl,
  configureClient,
  setCacheAdapter,
  clearDomainCache,
  getDomainCacheStats,
  resetCacheStats,
  type CacheAdapter,
  type CacheEntry,
  type CacheStats,
  type ClientConfig,
} from './remote.js';

// Streaming Parser (Transport §2.3-2.6)
export {
  StreamingYonParser,
  parseLine,
  type StreamEvent,
  type StreamEventHandler,
  type StreamingParserOptions,
} from './streaming.js';

// Shared Internals
export { parseDocHeader } from './parser.js';

