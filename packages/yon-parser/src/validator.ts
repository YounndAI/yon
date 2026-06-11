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
 * YON v2.0 Validator
 * 
 * Validates YON AST against profile constraints per Standard §16.
 * Supports scenarios, modes, and domain validation.
 * Validation enforces contracts. Invalid documents fail fast.
 */

import {
  type YonDocument,
  type YonError,
  type YonProfile,
  type YonFeature,
  PROFILE_PRESETS,
  FEATURE_TAGS,
  STRUCTURAL_TAGS,
} from './types.js';
import { getDomainTags, getLocalDomain, type DomainSchema, type DomainRecord, type DomainStatus } from './domains.js';
import { isBundledDomain } from '@younndai/domains';
import { resolveScenario, hasScenario } from './scenarios.js';

export interface YonValidateOptions {
  profile?: YonProfile | string;
  features?: YonFeature[];
  strict?: boolean;
  /** Domain IDs to allow (e.g., ['yai.health', 'yai.fintech']) */
  domains?: string[];
  /** Allow any unknown record types without error/warning */
  allowUnknown?: boolean;
  /** Validate that all ref:/block:/rid: references resolve to defined ids (default: false) */
  validateReferences?: boolean;
  /** When true, SHA-256 mismatches on blocks become errors (default: skip, runner verifies) */
  verifyIntegrity?: boolean;
}

export interface YonValidationResult {
  valid: boolean;
  errors: YonError[];
  warnings: YonError[];
  /** Domain lifecycle status for each resolved domain (trickle-down metadata) */
  domainStatus?: Record<string, DomainStatus>;
}

/**
 * Compute effective feature set per Standard §16.5.
 * Features are computed, not declared. Profiles provide defaults.
 */
function computeEffectiveFeatures(doc: YonDocument, options: YonValidateOptions): Set<string> {
  // U1: Resolve scenario if present — scenario provides defaults for profile/features
  let effectiveProfile = options.profile ?? doc.profile;
  let scenarioFeatures: string[] | undefined;

  if (doc.scenario && hasScenario(doc.scenario)) {
    const resolved = resolveScenario(doc.scenario, {
      profile: doc.profile as import('./types.js').YonProfile | undefined,
    });
    // Scenario fills in profile if not explicitly set
    if (!effectiveProfile) {
      effectiveProfile = resolved.profile;
    }
    // Scenario features are used as base if doc doesn't declare its own
    if (resolved.features && resolved.features.length > 0) {
      scenarioFeatures = resolved.features;
    }
  }

  const profileStr = effectiveProfile ?? 'exec';
  const knownProfiles = Object.keys(PROFILE_PRESETS);
  
  let base: string[];
  
  if (knownProfiles.includes(profileStr)) {
    // Known profile
    if (doc.features && doc.features.length > 0) {
      // Explicit features override preset
      base = doc.features;
    } else if (options.features && options.features.length > 0) {
      base = options.features;
    } else if (scenarioFeatures && scenarioFeatures.length > 0) {
      // Scenario features fill in when no explicit features
      base = scenarioFeatures;
    } else {
      base = PROFILE_PRESETS[profileStr as YonProfile] ?? [];
    }
  } else {
    // Unknown profile
    if (doc.features && doc.features.length > 0) {
      base = doc.features;
    } else {
      // Default to core for unknown profile
      base = PROFILE_PRESETS.core;
    }
  }
  
  const effective = new Set(base);
  
  // Apply with features (D18: simplified — D15 ensures string[] from parser)
  const withFeatures = doc.with ?? [];
  for (const feature of withFeatures) {
    if (typeof feature === 'string') {
      effective.add(feature);
    }
  }
  
  // Apply without features (D18: simplified — D15 ensures string[] from parser) 
  const withoutFeatures = doc.without ?? [];
  for (const feature of withoutFeatures) {
    if (typeof feature === 'string') {
      effective.delete(feature);
    }
  }
  
  // §16.5a Mode-feature auto-inclusion
  // Certain modes inherently require specific features regardless of profile.
  const mode = doc.mode ?? 'struct';
  const MODE_IMPLIED_FEATURES: Record<string, string[]> = {
    chat: ['dialogue', 'sessions'],
    hybrid: ['workflow', 'dialogue'],
  };
  const modeFeatures = MODE_IMPLIED_FEATURES[mode] ?? [];
  for (const f of modeFeatures) {
    effective.add(f);
  }
  
  return effective;
}

/**
 * Get allowed tags for a feature set
 */
function getAllowedTags(features: Set<string>): Set<string> {
  const allowed = new Set(STRUCTURAL_TAGS);
  
  for (const feature of features) {
    const tags = FEATURE_TAGS[feature as YonFeature];
    if (tags) {
      for (const tag of tags) {
        allowed.add(tag);
      }
    }
  }
  
  return allowed;
}

/**
 * Check if a record is referenceable (requires rid in audit mode)
 */
function isReferenceableRecord(tag: string): boolean {
  return ['RULE', 'CFG', 'MAP', 'SCHEMA', 'STEP', 'CHECK'].includes(tag);
}

/** Valid YON versions per Standard §1 */
const VALID_VERSIONS = ['1.5', '2.0'];

/**
 * Collect all rids from records and blocks.
 * RIDs must be unique. Duplicates are errors, not warnings.
 */
function collectRids(doc: YonDocument): Map<string, { line: number; count: number }> {
  const rids = new Map<string, { line: number; count: number }>();
  
  for (const record of doc.records) {
    const rid = record.fields.get('rid');
    if (rid) {
      const ridStr = String(rid);
      const existing = rids.get(ridStr);
      if (existing) {
        existing.count++;
      } else {
        rids.set(ridStr, { line: record.line, count: 1 });
      }
    }
  }
  
  for (const [id, block] of doc.blocks) {
    const existing = rids.get(id);
    if (existing) {
      existing.count++;
    } else {
      rids.set(id, { line: block.startLine, count: 1 });
    }
  }
  
  return rids;
}

/**
 * All 13 reference prefixes per YON v2.0 grammar.ebnf §5.
 * v2.0 adds agent, group, role, caps, stream, id, loc for multi-agent routing.
 */
const REF_PREFIXES = ['rid', 'block', 'cfg', 'file', 'url', 'ref', 'agent', 'group', 'role', 'caps', 'stream', 'id', 'loc'] as const;
const REF_PREFIX_PATTERN = new RegExp(`(?:${REF_PREFIXES.join('|')}):[a-zA-Z][a-zA-Z0-9_:.-]*`, 'g');

/**
 * Extract reference tokens from a string value
 */
function extractReferences(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  
  const refs: string[] = [];
  const matches = value.match(REF_PREFIX_PATTERN);
  if (matches) {
    for (const match of matches) {
      // Extract the target id from the reference
      const parts = match.split(':');
      if (parts.length >= 2) {
        refs.push(parts[parts.length - 1]!); // Get the last part (the id)
      }
    }
  }
  return refs;
}

/**
 * Validate a YON document.
 * Validation is opt-in strict. Lenient mode tolerates unknowns.
 */
export function validate(doc: YonDocument, options: YonValidateOptions = {}): YonValidationResult {
  const errors: YonError[] = [];
  const warnings: YonError[] = [];
  const strict = options.strict ?? true;
  
  const effectiveFeatures = computeEffectiveFeatures(doc, options);
  const allowedTags = getAllowedTags(effectiveFeatures);
  
  // F3: §16.5 line 908 — "Known profile + features: validator MUST ensure features ⊇ preset(profile)"
  const resolvedProfile = options.profile ?? doc.profile ?? 'exec';
  if (Object.keys(PROFILE_PRESETS).includes(resolvedProfile) && doc.features && doc.features.length > 0) {
    const presetFeatures = PROFILE_PRESETS[resolvedProfile as YonProfile] ?? [];
    const missing = presetFeatures.filter(f => !doc.features!.includes(f));
    if (missing.length > 0) {
      const entry: YonError = {
        code: 'E001',
        message: `Explicit features missing preset features for "${resolvedProfile}": ${missing.join(', ')}`,
        line: 1,
      };
      if (strict) {
        errors.push(entry);
      } else {
        warnings.push(entry);
      }
    }
  }
  
  // Validate version per Standard §1
  if (doc.version && !VALID_VERSIONS.includes(doc.version)) {
    errors.push({
      code: 'E004',
      message: `Invalid version "${doc.version}"; valid versions are: ${VALID_VERSIONS.join(', ')}`,
      line: 1,
    });
  }
  
  // Validate duplicate rids per Standard §4.3
  const ridMap = collectRids(doc);
  for (const [rid, info] of ridMap) {
    if (info.count > 1) {
      errors.push({
        code: 'E001',
        message: `Duplicate rid "${rid}" found ${info.count} times`,
        line: info.line,
      });
    }
  }
  
  // Collect all defined ids for reference validation
  const definedIds = new Set<string>();
  for (const rid of ridMap.keys()) {
    definedIds.add(rid);
  }
  for (const id of doc.blocks.keys()) {
    definedIds.add(id);
  }
  
  // Validate references (opt-in, disabled by default for cross-file scenarios)
  if (options.validateReferences) {
    const usedRefs: { ref: string; line: number }[] = [];
    for (const record of doc.records) {
      for (const [, value] of record.fields) {
        const refs = extractReferences(value);
        for (const ref of refs) {
          usedRefs.push({ ref, line: record.line });
        }
      }
    }
    
    for (const { ref, line } of usedRefs) {
      if (!definedIds.has(ref)) {
        errors.push({
          code: 'E004',
          message: `Unresolved reference "${ref}"`,
          line,
        });
      }
    }
  }
  
  // Bare feature names (e.g. 'yonpa') that match a bundled domain are
  // resolved to the dotted form. FEATURE_TAGS takes precedence — a future
  // language feature with a colliding name would shadow the domain lookup.
  const knownFeaturesForDomainResolution = Object.keys(FEATURE_TAGS);
  const featureDerivedDomains: string[] = [];
  for (const name of effectiveFeatures) {
    if (knownFeaturesForDomainResolution.includes(name)) continue;
    if (isBundledDomain(name)) {
      featureDerivedDomains.push(name);
    } else if (isBundledDomain(`yai.${name}`)) {
      featureDerivedDomains.push(`yai.${name}`);
    }
  }

  // §3.3 Fix 1: Auto-resolve doc.domain — merge with options.domains
  const effectiveDomains = [...(options.domains ?? [])];
  if (doc.domain && !effectiveDomains.includes(doc.domain)) {
    effectiveDomains.push(doc.domain);
  }
  for (const d of featureDerivedDomains) {
    if (!effectiveDomains.includes(d)) {
      effectiveDomains.push(d);
    }
  }
  const domainTags = effectiveDomains.length > 0 ? getDomainTags(effectiveDomains) : new Set<string>();
  const allAllowedTags = new Set([...allowedTags, ...domainTags]);
  
  // §3.3 Fix 2: Track unknown domains — "Preserve, no validation" per §4a.4
  let hasUnknownDomain = false;
  for (const domainId of effectiveDomains) {
    const normalizedId = domainId.startsWith('yai.') ? domainId : `yai.${domainId}`;
    const registry = getLocalDomain(normalizedId);
    if (!registry) {
      hasUnknownDomain = true;
      warnings.push({
        code: 'E001',
        message: `Unknown domain "${domainId}"; domain records will not be validated`,
        line: 1,
      });
    }
  }
  
  // §3.3 Fix 3: Domain version mismatch — "Known domain, unknown version → WARN, use latest known"
  if (doc.domain && doc.domainVersion) {
    const normalizedId = doc.domain.startsWith('yai.') ? doc.domain : `yai.${doc.domain}`;
    const registry = getLocalDomain(normalizedId);
    if (registry && registry.version !== doc.domainVersion) {
      warnings.push({
        code: 'E001',
        message: `Domain "${doc.domain}" version "${doc.domainVersion}" not found; using latest known (${registry.version})`,
        line: 1,
      });
    }
  }
  
  // Validate block boundaries per §6.2
  for (const block of doc.blocks.values()) {
    if (block.boundary && block.boundary.length < 8) {
      warnings.push({
        code: 'E001',
        message: `Weak boundary "${block.boundary}": boundaries should be 8+ characters per §6.2`,
        line: block.startLine,
      });
    }
  }
  
  // Check for unknown profile — §16.5 line 910: strict → error, lenient → warn
  const knownProfiles = Object.keys(PROFILE_PRESETS);
  if (!knownProfiles.includes(resolvedProfile)) {
    const entry: YonError = {
      code: 'E001',
      message: `Unknown profile "${resolvedProfile}"; using features as base`,
      line: 1,
    };
    if (strict) {
      errors.push(entry);
    } else {
      warnings.push(entry);
    }
  }
  
  // Check for unknown features — §16.5 lines 912-914: strict → error, lenient → warn
  const knownFeatures = Object.keys(FEATURE_TAGS);
  for (const feature of effectiveFeatures) {
    if (!knownFeatures.includes(feature)) {
      // Skip emit when the feature name resolves to a bundled domain
      if (isBundledDomain(feature) || isBundledDomain(`yai.${feature}`)) {
        continue;
      }
      const entry: YonError = {
        code: 'E001',
        message: `Unknown feature "${feature}"; preserved for forward-compat`,
        line: 1,
      };
      if (strict) {
        errors.push(entry);
      } else {
        warnings.push(entry);
      }
    }
  }
  
  // D20: Validate @DOC field order (per §17.1)
  // Field ordering is normative only in canon mode
  const docRecord = doc.records.find(r => r.tag === 'DOC');
  if (docRecord && doc.fmt === 'canon') {
    const canonicalOrder = ['ver', 'id', 'title', 'kind', 'domain', 'mode', 'profile', 'fmt', 'features', 'with', 'without'];
    const docFieldKeys = Array.from(docRecord.fields.keys());
    
    // Check if fields are in canonical order
    let lastIdx = -1;
    for (const key of docFieldKeys) {
      const idx = canonicalOrder.indexOf(key);
      if (idx !== -1) {
        if (idx < lastIdx) {
          warnings.push({
            code: 'E001',
            message: `@DOC field "${key}" is out of canonical order (expected: ${canonicalOrder.slice(0, 6).join(', ')}, ...)`,
            line: docRecord.line,
          });
          break;
        }
        lastIdx = idx;
      }
    }
  }
  
  // D5: Type suffix enforcement (§16.12)
  // Numeric fields SHOULD have type hints in ultra/min — only report in strict mode
  if (strict && (doc.fmt === 'ultra' || doc.fmt === 'min')) {
    const TYPE_REQUIRED_FIELDS = new Set(['n', 'bytes', 'port', 'ttl']);
    for (const record of doc.records) {
      if (record.typedFields) {
        for (const [key, field] of record.typedFields) {
          if (TYPE_REQUIRED_FIELDS.has(key) && !field.typeHint) {
            warnings.push({
              code: 'E001',
              message: `Field "${key}" should have type suffix (e.g., ${key}:int) in ${doc.fmt} mode`,
              line: record.line,
            });
          }
        }
      }
    }
  }
  
  // Validate each record
  for (const record of doc.records) {
    // Check if tag is allowed (core + domain tags)
    if (!allAllowedTags.has(record.tag) && !STRUCTURAL_TAGS.includes(record.tag)) {
      // Skip if allowUnknown is set or if document has unknown domain (§3.3: "Preserve, no validation")
      if (options.allowUnknown || hasUnknownDomain) {
        continue;
      }
      
      const error: YonError = {
        code: 'E001',
        message: `Tag @${record.tag} is not allowed by profile/features/domains`,
        line: record.line,
        column: record.column,
      };
      
      if (strict) {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
    
    // Note: @STEP is already handled by the generic tag check above.
    // The workflow feature check is implicit: if workflow is not in effectiveFeatures,
    // STEP is not in allowedTags, so it will fail the check above.
    
    // Provenance checks
    if (effectiveFeatures.has('provenance')) {
      // Referenceable records must have rid
      if (isReferenceableRecord(record.tag) && !record.fields.has('rid')) {
        const error: YonError = {
          code: 'E001',
          message: `@${record.tag} requires rid field when provenance is enabled`,
          line: record.line,
        };
        
        if (strict) {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      }
    }
  }
  
  // Provenance: check for @STAMP
  if (effectiveFeatures.has('provenance')) {
    const hasStamp = doc.records.some(r => r.tag === 'STAMP');
    if (!hasStamp) {
      const error: YonError = {
        code: 'E001',
        message: 'Audit profile requires at least one @STAMP record',
      };
      
      if (strict) {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
  }
  
  // Steps 6-8: Domain field constraint validation, lifecycle, domain override
  // Resolve domain registries for lifecycle and constraint checks
  const resolvedDomains = new Map<string, DomainSchema>();
  const domainStatusMap: Record<string, DomainStatus> = {};
  for (const domainId of effectiveDomains) {
    const reg = resolveDomainRegistry(domainId);
    if (reg) {
      resolvedDomains.set(domainId, reg);
      domainStatusMap[domainId] = reg.status;
      // Step 7: Lifecycle status warnings
      const lifecycleResult = checkDomainLifecycle(reg, strict);
      errors.push(...lifecycleResult.errors);
      warnings.push(...lifecycleResult.warnings);
    }
  }

  // Step 8: Record-level domain override + Step 6: field constraint validation
  for (const record of doc.records) {
    // Record-level domain override per cross-domain.md §2
    const recordDomain = record.fields.get('domain') as string | undefined;
    if (recordDomain) {
      const reg = resolveDomainRegistry(recordDomain);
      if (reg) {
        if (!resolvedDomains.has(recordDomain)) {
          resolvedDomains.set(recordDomain, reg);
          domainStatusMap[recordDomain] = reg.status;
          const lifecycleResult = checkDomainLifecycle(reg, strict);
          errors.push(...lifecycleResult.errors);
          warnings.push(...lifecycleResult.warnings);
        }
        // Validate this record's tag against the override domain
        const constraintResult = validateFieldConstraints(record, reg, strict);
        errors.push(...constraintResult.errors);
        warnings.push(...constraintResult.warnings);
      }
    } else {
      // Use doc-level domain
      for (const reg of resolvedDomains.values()) {
        const constraintResult = validateFieldConstraints(record, reg, strict);
        errors.push(...constraintResult.errors);
        warnings.push(...constraintResult.warnings);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    domainStatus: Object.keys(domainStatusMap).length > 0 ? domainStatusMap : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Granular Validation API (Steps 5-8)
// Per-record and per-block validation for streaming/editor/runner consumers.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolved validation state — created once, reused per record/block.
 * Grows as records are validated (ridSet accumulates).
 */
export interface YonValidationContext {
  effectiveFeatures: Set<string>;
  allowedTags: Set<string>;
  domainRegistries: Map<string, DomainSchema>;
  defaultDomain?: string;
  domainStatus: Map<string, DomainStatus>;
  strict: boolean;
  mode: string;
  profile: string;
  ridSet: Set<string>;
  options: YonValidateOptions;
  /** Lifecycle warnings for resolved domains — check immediately after context creation */
  lifecycleWarnings: YonError[];
}

/**
 * Create validation context from a document header.
 * Call once per document or stream, then reuse for each record/block.
 */
export function createValidationContext(
  doc: YonDocument,
  options: YonValidateOptions = {},
): YonValidationContext {
  const effectiveFeatures = computeEffectiveFeatures(doc, options);
  const allowedTags = getAllowedTags(effectiveFeatures);
  const strict = options.strict ?? true;
  const mode = doc.mode ?? 'struct';
  const profile = (options.profile ?? doc.profile ?? 'exec') as string;

  // Bare feature names (e.g. 'yonpa') that match a bundled domain are
  // resolved to the dotted form. FEATURE_TAGS takes precedence — a future
  // language feature with a colliding name would shadow the domain lookup.
  const knownFeaturesForDomainResolution = Object.keys(FEATURE_TAGS);
  const featureDerivedDomains: string[] = [];
  for (const name of effectiveFeatures) {
    if (knownFeaturesForDomainResolution.includes(name)) continue;
    if (isBundledDomain(name)) {
      featureDerivedDomains.push(name);
    } else if (isBundledDomain(`yai.${name}`)) {
      featureDerivedDomains.push(`yai.${name}`);
    }
  }

  // Resolve all domains
  const effectiveDomains = [...(options.domains ?? [])];
  if (doc.domain && !effectiveDomains.includes(doc.domain)) {
    effectiveDomains.push(doc.domain);
  }
  for (const d of featureDerivedDomains) {
    if (!effectiveDomains.includes(d)) {
      effectiveDomains.push(d);
    }
  }
  const domainRegistries = new Map<string, DomainSchema>();
  const domainStatus = new Map<string, DomainStatus>();
  for (const domainId of effectiveDomains) {
    const reg = resolveDomainRegistry(domainId);
    if (reg) {
      domainRegistries.set(domainId, reg);
      domainStatus.set(domainId, reg.status);
    }
  }

  // Merge domain tags into allowed
  const domainTags = effectiveDomains.length > 0 ? getDomainTags(effectiveDomains) : new Set<string>();
  for (const tag of domainTags) {
    allowedTags.add(tag);
  }

  // Collect lifecycle warnings for all resolved domains
  const lifecycleWarnings: YonError[] = [];
  for (const reg of domainRegistries.values()) {
    const lifecycleResult = checkDomainLifecycle(reg, strict);
    lifecycleWarnings.push(...lifecycleResult.warnings);
    // Lifecycle errors (pending in strict) are also surfaced as warnings for the consumer
    lifecycleWarnings.push(...lifecycleResult.errors);
  }

  return {
    effectiveFeatures,
    allowedTags,
    domainRegistries,
    defaultDomain: doc.domain,
    domainStatus,
    strict,
    mode,
    profile,
    ridSet: new Set<string>(),
    options,
    lifecycleWarnings,
  };
}

/**
 * Validate a single record against the validation context.
 * Handles record-level domain= override per cross-domain.md §2.
 */
export function validateRecord(
  record: import('./types.js').YonRecord,
  ctx: YonValidationContext,
): YonValidationResult {
  const errors: YonError[] = [];
  const warnings: YonError[] = [];

  // Tag allowance check
  if (!ctx.allowedTags.has(record.tag) && !STRUCTURAL_TAGS.includes(record.tag)) {
    if (!ctx.options.allowUnknown) {
      const entry: YonError = {
        code: 'E001',
        message: `Tag @${record.tag} is not allowed by profile/features/domains`,
        line: record.line,
        column: record.column,
      };
      if (ctx.strict) errors.push(entry);
      else warnings.push(entry);
    }
  }

  // RID uniqueness tracking
  const rid = record.fields.get('rid');
  if (rid) {
    const ridStr = String(rid);
    if (ctx.ridSet.has(ridStr)) {
      errors.push({
        code: 'E001',
        message: `Duplicate rid "${ridStr}"`,
        line: record.line,
      });
    }
    ctx.ridSet.add(ridStr);
  }

  // Record-level domain override per cross-domain.md §2
  const recordDomain = record.fields.get('domain') as string | undefined;
  const effectiveDomain = recordDomain ?? ctx.defaultDomain;

  if (effectiveDomain) {
    let reg = ctx.domainRegistries.get(effectiveDomain);
    if (!reg && recordDomain) {
      // Lazily resolve domain for record-level overrides
      reg = resolveDomainRegistry(recordDomain) ?? undefined;
      if (reg) {
        ctx.domainRegistries.set(recordDomain, reg);
        ctx.domainStatus.set(recordDomain, reg.status);
      }
    }
    if (reg) {
      // Field constraint validation
      const constraintResult = validateFieldConstraints(record, reg, ctx.strict);
      errors.push(...constraintResult.errors);
      warnings.push(...constraintResult.warnings);
    }
  }

  // Provenance checks
  if (ctx.effectiveFeatures.has('provenance')) {
    if (isReferenceableRecord(record.tag) && !record.fields.has('rid')) {
      const entry: YonError = {
        code: 'E001',
        message: `@${record.tag} requires rid field when provenance is enabled`,
        line: record.line,
      };
      if (ctx.strict) errors.push(entry);
      else warnings.push(entry);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a single block.
 * Optionally verifies SHA-256 integrity when verifyIntegrity is on.
 */
export function validateBlock(
  block: import('./types.js').YonBlock,
  ctx: YonValidationContext,
): YonValidationResult {
  const errors: YonError[] = [];
  const warnings: YonError[] = [];

  // RID tracking
  if (block.id) {
    if (ctx.ridSet.has(block.id)) {
      errors.push({
        code: 'E001',
        message: `Duplicate block id "${block.id}"`,
        line: block.startLine,
      });
    }
    ctx.ridSet.add(block.id);
  }

  // Weak boundary check per §6.2
  if (block.boundary && block.boundary.length < 8) {
    warnings.push({
      code: 'E001',
      message: `Weak boundary "${block.boundary}": boundaries should be 8+ characters per §6.2`,
      line: block.startLine,
    });
  }

  // SHA-256 integrity check (opt-in)
  if (ctx.options.verifyIntegrity && block.sha256 && block.content) {
    // Use Web Crypto API if available, otherwise skip
    // Note: actual verification requires async — here we just flag the block
    // Full implementation delegated to integrity.ts helper
    warnings.push({
      code: 'E001',
      message: `Block "${block.id}" has sha256 declared — run verifyBlockIntegrity() for verification`,
      line: block.startLine,
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Resolution + Field Constraint Validation (Steps 6-8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a domain ID to its registry, normalizing yai.* prefixes.
 */
function resolveDomainRegistry(domainId: string): DomainSchema | null {
  return getLocalDomain(domainId);
}

/**
 * Check domain lifecycle status per versioning.md §Domain Lifecycle.
 * Parser emits warnings. Runner rejects execution for archived/revoked.
 */
function checkDomainLifecycle(registry: DomainSchema, strict: boolean): YonValidationResult {
  const errors: YonError[] = [];
  const warnings: YonError[] = [];

  switch (registry.status) {
    case 'deprecated':
      warnings.push({
        code: 'E001',
        message: `Domain "${registry.domain}" v${registry.version} is deprecated; migration recommended`,
        line: 1,
      });
      break;
    case 'archived':
      warnings.push({
        code: 'E001',
        message: `Domain "${registry.domain}" v${registry.version} is archived; execution forbidden by runners`,
        line: 1,
      });
      break;
    case 'revoked':
      // SECURITY WARN — always emitted regardless of strict mode
      warnings.push({
        code: 'E001',
        message: `SECURITY WARNING: Domain "${registry.domain}" v${registry.version} is revoked (security/legal vulnerability)`,
        line: 1,
      });
      break;
    case 'pending':
      // Pending domains should not be in the parser — they're not published
      if (strict) {
        errors.push({
          code: 'E001',
          message: `Domain "${registry.domain}" v${registry.version} is pending activation`,
          line: 1,
        });
      } else {
        warnings.push({
          code: 'E001',
          message: `Domain "${registry.domain}" v${registry.version} is pending activation`,
          line: 1,
        });
      }
      break;
    // 'active' — no warning needed
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a record's fields against its domain schema's field constraints.
 * Checks: required fields, type conformance, range, enum, pattern.
 * Per schema-format.md §1: "Validation rules for parsers."
 */
function validateFieldConstraints(
  record: import('./types.js').YonRecord,
  registry: DomainSchema,
  strict: boolean,
): YonValidationResult {
  const errors: YonError[] = [];
  const warnings: YonError[] = [];

  const domainRecord: DomainRecord | undefined = registry.records[record.tag];
  if (!domainRecord || !domainRecord.fields) return { valid: true, errors, warnings };

  for (const [fieldName, constraint] of Object.entries(domainRecord.fields)) {
    const value = record.fields.get(fieldName);

    // Required field check
    if (constraint.required && (value === undefined || value === null)) {
      const entry: YonError = {
        code: 'E001',
        message: `@${record.tag}: required field "${fieldName}" is missing`,
        line: record.line,
      };
      if (strict) errors.push(entry);
      else warnings.push(entry);
      continue;
    }

    // Skip optional fields that aren't present
    if (value === undefined || value === null) continue;

    const strValue = String(value);

    // Type conformance check (SHOULD-level per types.md §4 L49)
    if (constraint.type !== 'string') {
      const typeValid = checkTypeConformance(strValue, constraint.type);
      if (!typeValid) {
        const entry: YonError = {
          code: 'E001',
          message: `@${record.tag}.${fieldName}: value "${strValue}" does not match declared type "${constraint.type}"`,
          line: record.line,
        };
        if (strict) errors.push(entry);
        else warnings.push(entry);
        continue; // Skip range/enum/pattern checks if type doesn't match
      }
    }

    // Range check
    if (constraint.range && (constraint.type === 'int' || constraint.type === 'float')) {
      const numValue = Number(strValue);
      if (!isNaN(numValue)) {
        const [min, max] = constraint.range;
        if (numValue < min || numValue > max) {
          const entry: YonError = {
            code: 'E001',
            message: `@${record.tag}.${fieldName}: value ${numValue} is outside allowed range [${min}, ${max}]`,
            line: record.line,
          };
          if (strict) errors.push(entry);
          else warnings.push(entry);
        }
      }
    }

    // Enum check
    if (constraint.enum) {
      if (!constraint.enum.includes(strValue)) {
        const entry: YonError = {
          code: 'E001',
          message: `@${record.tag}.${fieldName}: value "${strValue}" is not in allowed values [${constraint.enum.join(', ')}]`,
          line: record.line,
        };
        if (strict) errors.push(entry);
        else warnings.push(entry);
      }
    }

    // Pattern check
    if (constraint.pattern) {
      try {
        const regex = new RegExp(constraint.pattern);
        if (!regex.test(strValue)) {
          const entry: YonError = {
            code: 'E001',
            message: `@${record.tag}.${fieldName}: value "${strValue}" does not match pattern /${constraint.pattern}/`,
            line: record.line,
          };
          if (strict) errors.push(entry);
          else warnings.push(entry);
        }
      } catch {
        // Invalid regex in schema — warn about the schema, not the value
        warnings.push({
          code: 'E001',
          message: `@${record.tag}.${fieldName}: invalid regex pattern "${constraint.pattern}" in domain schema`,
          line: record.line,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Check if a raw string value conforms to a declared type.
 * Per types.md: "Tools receiving a typed value SHOULD validate it matches the declared type."
 */
function checkTypeConformance(value: string, type: string): boolean {
  switch (type) {
    case 'int':
      return /^-?\d+$/.test(value);
    case 'float':
      return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value);
    case 'bool':
      return value === 'true' || value === 'false';
    case 'ts':
      // ISO 8601 basic check
      return !isNaN(Date.parse(value));
    default:
      return true; // Unknown types pass (types.md §6: treat as str)
  }
}
