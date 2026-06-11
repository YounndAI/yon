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
 * @younndai/domains — Core Type Definitions
 *
 * All types are spec-aligned with:
 * - yon-spec/domains/schema-format.md (4 payloads: schema, metadata, registry, combined)
 * - yon-spec/governance/versioning.md (lifecycle states)
 *
 * @module
 */

// ─────────────────────────────────────────────────────────────────────────────
// Domain Lifecycle & Classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Domain lifecycle state per versioning.md §Domain Lifecycle.
 *
 * Parsers emit warnings for deprecated/archived/revoked.
 * Runners reject execution for archived/revoked.
 *
 * @example
 * ```ts
 * if (schema.status === 'deprecated') {
 *   console.warn(`Domain ${schema.domain} is deprecated — consider alternatives`);
 * }
 * ```
 */
export type DomainStatus =
  | 'pending'
  | 'active'
  | 'deprecated'
  | 'archived'
  | 'revoked';

/**
 * Domain trust tier per schema-format.md §Verification & Trust.
 *
 * - `official`: yai.* and std.* — maintained by YounndAI
 * - `institutional`: edu.*, gov.*, org.* — identity-verified institutions
 * - `partner`: <name>.* — identity-verified entities
 * - `community`: com.* — open, anyone
 *
 * @example
 * ```ts
 * if (schema.tier === 'official') {
 *   // Highest trust — maintained by YounndAI
 * }
 * ```
 */
export type DomainTier =
  | 'official'
  | 'institutional'
  | 'partner'
  | 'community';

/**
 * Operational notice code per schema-format.md §Notice Codes.
 *
 * `null` means all clear. Codes signal operational issues at domain or namespace scope.
 *
 * @example
 * ```ts
 * if (schema.notice !== null) {
 *   console.warn(`Domain notice: ${schema.notice}`);
 * }
 * ```
 */
export type NoticeCode =
  | null
  | 'N001' | 'N002' | 'N003' | 'N004'          // Domain scope
  | 'N010' | 'N020' | 'N030' | 'N040' | 'N050'  // Namespace scope
  | 'N011' | 'N022';                              // Both scope

// ─────────────────────────────────────────────────────────────────────────────
// Schema Payload (§1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-field constraint from domain schema.
 *
 * Used by the validation engine to check type conformance, range,
 * enum membership, and pattern matching.
 *
 * @see schema-format.md §1 Record Fields
 *
 * @example
 * ```ts
 * const constraint: FieldConstraint = {
 *   type: 'int',
 *   required: true,
 *   range: [30, 250],
 * };
 * ```
 */
export interface FieldConstraint {
  /** Field data type */
  type: 'string' | 'int' | 'float' | 'bool' | 'ts';
  /** Whether the field is required for valid records */
  required: boolean;
  /** Technical description of the field's purpose and semantics */
  description?: string;
  /** Unit of measurement (e.g. 'mmHg', 'bpm', 'kg') */
  unit?: string;
  /** Example value for illustration */
  example?: string;
  /** Valid numeric range [min, max] — only for int/float */
  range?: [number, number];
  /** Allowed string values — validated as exact match */
  enum?: string[];
  /** Regex pattern — validated on string fields */
  pattern?: string;
}

/**
 * Record definition within a domain schema.
 *
 * A record represents a named data structure (tag) with typed fields.
 * Records are the atomic building blocks that parsers validate against.
 *
 * @example
 * ```ts
 * const vitals: DomainRecord = {
 *   description: 'Patient vital signs',
 *   fields: {
 *     bp: { type: 'string', required: true, pattern: '\\d+/\\d+' },
 *     hr: { type: 'int', required: false, range: [30, 250] },
 *   },
 * };
 * ```
 */
export interface DomainRecord {
  /** Human-readable description of this record type */
  description: string;
  /** Required field names (derived from fields for quick lookup) */
  requiredFields?: string[];
  /** Optional field names (derived from fields for quick lookup) */
  optionalFields?: string[];
  /** Quick type lookup map (derived from fields) */
  typedFields?: Record<string, 'int' | 'float' | 'bool' | 'ts' | 'string'>;
  /** Full per-field constraints — canonical source for validation */
  fields?: Record<string, FieldConstraint>;
}

/**
 * Full domain schema definition — the primary type in this package.
 *
 * Represents a complete, resolved domain with all validation rules.
 * This is the in-memory representation used by parsers, validators,
 * and introspection utilities.
 *
 * @see schema-format.md §1 Schema Payload
 *
 * @example
 * ```ts
 * const schema = await getDomain('yai.health');
 * console.log(schema?.domain);    // 'yai.health'
 * console.log(schema?.records);   // { VITALS: {...}, DX: {...}, ... }
 * ```
 */
export interface DomainSchema {
  /** Fully qualified domain path (e.g., `yai.health`) */
  domain: string;
  /** Semantic version (e.g., `1.0`) */
  version: string;
  /** Lifecycle state per versioning.md §Domain Lifecycle */
  status: DomainStatus;
  /** Trust tier per schema-format.md §Verification & Trust */
  tier: DomainTier;
  /** Identity + quality trust gate */
  verified: boolean;
  /** Conformance confidence: 0.0–1.0 */
  score: number;
  /** Highest-severity notice code, or null if all clear. */
  notice: NoticeCode;
  /** Human-readable domain description */
  description: string;
  /** Record definitions keyed by tag name */
  records: Record<string, DomainRecord>;
  /** Default mode for documents using this domain */
  defaultMode?: string;
  /** Default profile for documents using this domain */
  defaultProfile?: string;
  /** Default format for documents using this domain */
  defaultFormat?: string;
  /** Content hash for integrity per schema-format.md §1 */
  schemaHash?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw JSON Format (pre-adapter)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw field definition as it appears in @younndai/domains JSON files.
 */
export interface DomainSchemaJSONField {
  name: string;
  type: 'string' | 'int' | 'float' | 'bool' | 'ts';
  required: boolean;
  description?: string;
  unit?: string;
  example?: string;
  range?: [number, number];
  enum?: string[];
  pattern?: string;
}

/**
 * Raw record definition as it appears in @younndai/domains JSON files.
 *
 * In JSON, records are an array with `tag` + `fields[]`.
 * The adapter converts this to `Record<string, DomainRecord>`.
 */
export interface DomainSchemaJSONRecord {
  tag: string;
  description: string;
  fields: DomainSchemaJSONField[];
}

/**
 * Raw domain schema JSON format from @younndai/domains files.
 *
 * This is the wire format — what the JSON files contain.
 * Use `loadDomainFromJSON()` to convert to `DomainSchema`.
 *
 * @example
 * ```ts
 * import raw from '@younndai/domains/domains/yai/health/1.0.json';
 * const schema = loadDomainFromJSON(raw as DomainSchemaJSON);
 * ```
 */
export interface DomainSchemaJSON {
  $schema?: string;
  domain: string;
  version: string;
  status: DomainStatus;
  tier: DomainTier;
  verified: boolean;
  score: number;
  notice: NoticeCode;
  description: string;
  /** Records as array (JSON wire format) — adapter converts to Record<string, DomainRecord> */
  records: DomainSchemaJSONRecord[];
  defaultMode?: string;
  defaultProfile?: string;
  defaultFormat?: string;
  schemaHash?: string;
  /** Metadata payload — passed through as-is */
  meta?: DomainMetadata;
  /** Registry payload — passed through as-is */
  registry?: DomainRegistryPayload;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata Payload (§2)
// ─────────────────────────────────────────────────────────────────────────────

/** External resource link in metadata */
export interface DomainMetadataLink {
  label: string;
  url: string;
  type: 'standard' | 'reference' | 'tool' | 'guide' | 'community';
}

/** Related domain reference in metadata */
export interface DomainMetadataRelated {
  domain: string;
  relationship: string;
  reason: string;
}

/** Tag context enrichment in metadata */
export interface DomainTagContext {
  purpose: string;
  when_to_use: string;
  related_standards?: string[];
}

/** Use case example in metadata */
export interface DomainUseCase {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  example?: string;
  tags_used?: string[];
  tags?: string[];
}

/** Conformance test coverage in metadata */
export interface DomainConformance {
  vectors?: number;
  coverage?: {
    records: string;
    fields: string;
    errors: number;
  };
  roundtrip?: string;
}

/** Verification details in metadata */
export interface DomainVerification {
  verified: boolean;
  lastVerified?: string;
  nextReview?: string;
}

/**
 * Metadata payload per schema-format.md §2.
 *
 * Provides human and AI agent context beyond validation:
 * taglines, use cases, tag context, related domains, conformance metrics.
 *
 * @example
 * ```ts
 * const domain = await getDomain('yai.health', { include: 'metadata' });
 * console.log(domain?.meta?.tagline);
 * ```
 */
export interface DomainMetadata {
  /** One-line summary for display (max 120 chars) */
  tagline?: string;
  /** Featured tags for showcasing */
  highlights?: string[];
  /** Usage examples with steps and example YON */
  use_cases?: DomainUseCase[];
  /** Per-tag rich context (purpose, fields, examples) */
  tag_context?: Record<string, DomainTagContext>;
  /** External resource links (standards, references) */
  links?: DomainMetadataLink[];
  /** Related domains with relationship descriptions */
  related?: DomainMetadataRelated[];
  /** Domains with shared tag names */
  crossDomains?: string[];
  /** Test coverage metrics */
  conformance?: DomainConformance;
  /** Schema publishing tier: official, free, pro, or enterprise */
  capacityTier: 'official' | 'free' | 'pro' | 'enterprise';
  /** Verification details with dates */
  verification?: DomainVerification;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry Payload (§3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Owner information for a namespace or domain.
 *
 * @example
 * ```ts
 * const owner: DomainOwner = {
 *   name: 'YounndAI Domains Registry',
 *   organization: 'YounndAI',
 * };
 * ```
 */
export interface DomainOwner {
  /** Owner name or organization */
  name: string;
  /** Legal entity name */
  organization?: string;
  /** Owner website */
  url?: string;
  /** ISO 8601 timestamp of ownership start */
  since?: string;
}

/** Namespace entry in registry payload */
export interface RegistryNamespaceEntry {
  path: string;
  type: string;
  state: string;
  notice: NoticeCode;
  owner: DomainOwner;
}

/** Domain entry in registry payload */
export interface RegistryDomainEntry {
  path: string;
  state: string;
  notice: NoticeCode;
  owner: DomainOwner;
}

/**
 * Registry payload per schema-format.md §3.
 *
 * Contains ownership and operational lifecycle data.
 */
export interface DomainRegistryPayload {
  namespace: RegistryNamespaceEntry;
  domain: RegistryDomainEntry;
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Payload (§4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Combined payload — schema + metadata + registry.
 *
 * Returned when calling `?include=all`.
 *
 * @example
 * ```ts
 * const full = await getDomain('yai.health', { include: 'all' });
 * console.log(full?.meta?.tagline);
 * console.log(full?.registry?.namespace.owner.name);
 * ```
 */
export interface DomainCombined extends DomainSchema {
  /** Metadata payload */
  meta?: DomainMetadata;
  /** Registry payload */
  registry?: DomainRegistryPayload;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Version entry from the versions endpoint.
 *
 * @example
 * ```ts
 * const versions = await getDomainVersions('yai.health');
 * versions.forEach(v => console.log(`${v.version}: ${v.status}`));
 * ```
 */
export interface DomainVersion {
  /** Semantic version */
  version: string;
  /** Lifecycle status at this version */
  status: DomainStatus;
  /** Conformance score at this version */
  score: number;
  /** Change note describing this version */
  changeNote?: string;
  /** Publication timestamp */
  createdAt: string;
}

/**
 * Aggregate registry statistics.
 *
 * @example
 * ```ts
 * const stats = await getRegistryStats();
 * console.log(`${stats.totalDomains} domains, ${stats.totalRecords} records`);
 * ```
 */
export interface RegistryStats {
  totalDomains: number;
  totalRecords: number;
  totalFields: number;
  byTier: Record<string, number>;
}

/**
 * Operational notice from the notices endpoint.
 *
 * @example
 * ```ts
 * const notices = await getNotices({ scope: 'domain' });
 * ```
 */
export interface Notice {
  code: NoticeCode;
  scope: 'domain' | 'namespace';
  target: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * News feed entry from the announcements endpoint.
 *
 * @example
 * ```ts
 * const news = await getAnnouncements({ type: 'release' });
 * ```
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  audience?: string;
  publishedAt: string;
}

/**
 * Namespace from the namespaces endpoint.
 *
 * @example
 * ```ts
 * const ns = await getNamespace('yai');
 * console.log(`${ns.path}: ${ns.domainCount} domains`);
 * ```
 */
export interface Namespace {
  path: string;
  type: string;
  state: string;
  description?: string;
  owner?: DomainOwner;
  domainCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup & Validation Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result from reverse tag lookup — all domains defining a given tag.
 *
 * Multiple domains may define the same tag (e.g., POSITION exists in
 * both yai.hr and yai.fintech). Consumers disambiguate via context.
 *
 * @example
 * ```ts
 * const result = findDomainsByTag('POSITION');
 * if (result.matches.length > 1) {
 *   // Multiple domains define POSITION — disambiguate via @DOC domain=
 * }
 * ```
 */
export interface TagLookupResult {
  /** The tag that was looked up */
  tag: string;
  /** All matching domains with their record definitions */
  matches: Array<{
    domainId: string;
    record: DomainRecord;
  }>;
}

/**
 * Validation result from record validation.
 *
 * @example
 * ```ts
 * const result = await validateRecord('yai.fintech', 'TXN', data);
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error(`${e.field}: ${e.message}`));
 * }
 * ```
 */
export interface ValidationResult {
  /** Whether the record passed all validation checks */
  valid: boolean;
  /** Validation errors (constraint failures) */
  errors: ValidationError[];
  /** Validation warnings (non-fatal) */
  warnings: ValidationError[];
}

/**
 * Individual validation error or warning.
 *
 * @example
 * ```ts
 * const error: ValidationError = {
 *   field: 'amount',
 *   message: "Field 'amount' failed 'range' constraint: expected [0, 999999999], received -5",
 *   constraint: 'range',
 *   expected: '[0, 999999999]',
 *   received: '-5',
 * };
 * ```
 */
export interface ValidationError {
  /** Field name, or '_domain'/'_tag' for structural errors */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Which constraint was violated */
  constraint: 'required' | 'type' | 'range' | 'enum' | 'pattern';
  /** Expected value or description */
  expected?: string;
  /** Actual value received */
  received?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Client configuration options.
 *
 * @example
 * ```ts
 * configureClient({
 *   registryUrl: 'https://domains.younndai.com',
 *   timeout: 5000,
 *   onWarn: (msg) => logger.warn(msg),
 * });
 * ```
 */
export interface ClientConfig {
  /** Base URL for the registry API */
  registryUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Warning callback for degradation notices */
  onWarn?: (message: string) => void;
}

/**
 * Registry health check result.
 *
 * @example
 * ```ts
 * const health = await checkRegistryHealth();
 * if (!health.ok) {
 *   console.error('Registry unreachable');
 * }
 * ```
 */
export interface RegistryHealthResult {
  /** Whether the registry is reachable and responding */
  ok: boolean;
  /** Round-trip latency in milliseconds */
  latencyMs: number;
  /** Timestamp of the health check */
  timestamp: string;
}
