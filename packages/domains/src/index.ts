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
 * @younndai/domains — Primary Entry Point
 *
 * Framework-agnostic package for fetching, bundling, validating,
 * introspecting, and classifying YounndAI Domain schemas.
 *
 * @packageDocumentation
 */

// ── Version ──────────────────────────────────────────────────────────────────
export { VERSION } from './version.js';

// ── Normalize ────────────────────────────────────────────────────────────────
export { normalizeDomainId, lookupWithFallback } from './normalize.js';

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  // Schema
  DomainSchema,
  DomainRecord,
  FieldConstraint,
  DomainStatus,
  DomainTier,
  NoticeCode,
  // Raw JSON
  DomainSchemaJSON,
  DomainSchemaJSONField,
  DomainSchemaJSONRecord,
  // Metadata
  DomainMetadata,
  DomainMetadataLink,
  DomainMetadataRelated,
  DomainTagContext,
  DomainUseCase,
  DomainConformance,
  DomainVerification,
  // Registry
  DomainRegistryPayload,
  DomainOwner,
  RegistryNamespaceEntry,
  RegistryDomainEntry,
  // Combined
  DomainCombined,
  // API Responses
  DomainVersion,
  RegistryStats,
  Notice,
  Announcement,
  Namespace,
  // Lookup
  TagLookupResult,
  // Validation
  ValidationResult,
  ValidationError,
  // Config
  ClientConfig,
  RegistryHealthResult,
} from './types.js';

// ── Errors ───────────────────────────────────────────────────────────────────
export {
  DomainNotFoundError,
  RegistryUnavailableError,
  AccessDeniedError,
} from './errors.js';

// ── Cache ────────────────────────────────────────────────────────────────────
export type {
  CacheAdapter,
  CacheEntry,
  CacheStats,
} from './cache.js';

// ── Adapter ──────────────────────────────────────────────────────────────────
export { loadDomainFromJSON } from './adapter.js';

// ── Bundled ──────────────────────────────────────────────────────────────────
export {
  getBundledDomain,
  listBundledDomains,
  isBundledDomain,
} from './bundled.js';

// ── Client ───────────────────────────────────────────────────────────────────
export {
  // Domain methods
  getDomain,
  getDomains,
  fetchDomainList,
  searchDomains,
  getDomainVersions,
  getRegistryStats,
  // Namespace methods
  listNamespaces,
  getNamespace,
  // Operations methods
  getNotices,
  getAnnouncements,
  // Health
  checkRegistryHealth,
  // Configuration
  configureClient,
  setRegistryUrl,
  getRegistryUrl,
  setCacheAdapter,
  clearDomainCache,
  getDomainCacheStats,
  resetCacheStats,
} from './client.js';

// ── Local Registry ───────────────────────────────────────────────────────────
export {
  registerDomain,
  unregisterDomain,
  isOfficialDomain,
  listDomains,
  getDomainTags,
  getLocalDomain,
} from './registry.js';

// ── Resolution ───────────────────────────────────────────────────────────────
export { resolveDomain } from './resolve.js';

// ── Introspection ────────────────────────────────────────────────────────────
export {
  // Async
  getRecordTags,
  getRecordSchema,
  getRequiredFields,
  getOptionalFields,
  getFieldConstraints,
  describeRecord,
  // Sync
  getRecordTagsSync,
  getRecordSchemaSync,
  getRequiredFieldsSync,
  getOptionalFieldsSync,
  getFieldConstraintsSync,
  describeRecordSync,
} from './introspect.js';
export type { RecordDescription } from './introspect.js';

// ── Lookup ───────────────────────────────────────────────────────────────────
export {
  findDomainsByTag,
  buildTagIndex,
} from './lookup.js';

// ── Validation ───────────────────────────────────────────────────────────────
export {
  validateRecord,
  validateRecordSync,
  validateRecords,
  validateFields,
} from './validate.js';

// ── Offline ──────────────────────────────────────────────────────────────────
export {
  downloadRegistryBundle,
  serializeBundle,
  deserializeBundle,
  loadBundleFromJSON,
  applyBundle,
  getBundleManifest,
} from './offline.js';
export type {
  RegistryBundle,
  BundleManifest,
} from './offline.js';

// ── Taxonomy ─────────────────────────────────────────────────────────────────
export {
  SET_TYPES,
  CONFORMANCE_LEVELS,
  CONFORMANCE_ORDER,
  VERIFICATION,
  DOMAIN_STATES,
  TRUST_LEVELS,
  resolveSetType,
  resolveConformanceLevel,
  isInstitutional,
  resolveTrustLevel,
  getFreshnessLabel,
} from './taxonomy.js';
export type {
  SetTypeKey,
  SetTypeConfig,
  ConformanceLevelKey,
  ConformanceLevelConfig,
  VerificationConfig,
  DomainStateKey,
  DomainStateConfig,
  TrustLevel,
  TrustLevelConfig,
  FreshnessConfig,
} from './taxonomy.js';

// ── JSON Schema ──────────────────────────────────────────────────────────────
export {
  recordToJSONSchema,
  fieldToJSONSchema,
  domainToJSONSchemas,
  exportJSONSchemas,
} from './json-schema.js';
export type { JSONSchema7 } from './json-schema.js';
