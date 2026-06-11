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
 * Schema Introspection — explore domain structure programmatically.
 *
 * All introspection functions have sync variants (take a pre-resolved `DomainSchema`)
 * and async variants (resolve the domain first via T1→T3→T2).
 *
 * @module
 */

import type { DomainSchema, DomainRecord, FieldConstraint } from './types.js';
import { resolveDomain } from './resolve.js';

// ─────────────────────────────────────────────────────────────────────────────
// Async Variants (resolve domain first)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all record tags defined in a domain.
 *
 * @param domainId - Domain path (e.g., `yai.health`)
 * @returns Array of tag names, or empty array if domain not found
 *
 * @example
 * ```ts
 * const tags = await getRecordTags('yai.health');
 * // ['VITALS', 'DX', 'RX', 'LAB', ...]
 * ```
 */
export async function getRecordTags(domainId: string): Promise<string[]> {
  const domain = await resolveDomain(domainId);
  if (!domain) return [];
  return getRecordTagsSync(domain);
}

/**
 * Get the full record definition for a specific tag.
 *
 * @param domainId - Domain path
 * @param tag - Record tag name (e.g., `VITALS`)
 * @returns Record definition or null
 *
 * @example
 * ```ts
 * const record = await getRecordSchema('yai.health', 'VITALS');
 * console.log(record?.description); // 'Patient vital signs'
 * ```
 */
export async function getRecordSchema(
  domainId: string,
  tag: string,
): Promise<DomainRecord | null> {
  const domain = await resolveDomain(domainId);
  if (!domain) return null;
  return getRecordSchemaSync(domain, tag);
}

/**
 * Get required field names for a record.
 *
 * @param domainId - Domain path
 * @param tag - Record tag name
 * @returns Array of required field names
 *
 * @example
 * ```ts
 * const required = await getRequiredFields('yai.health', 'VITALS');
 * // ['bp']
 * ```
 */
export async function getRequiredFields(
  domainId: string,
  tag: string,
): Promise<string[]> {
  const domain = await resolveDomain(domainId);
  if (!domain) return [];
  return getRequiredFieldsSync(domain, tag);
}

/**
 * Get optional field names for a record.
 *
 * @param domainId - Domain path
 * @param tag - Record tag name
 * @returns Array of optional field names
 *
 * @example
 * ```ts
 * const optional = await getOptionalFields('yai.health', 'VITALS');
 * // ['hr', 'temp_c', 'spo2', 'rr', 'weight', 'height']
 * ```
 */
export async function getOptionalFields(
  domainId: string,
  tag: string,
): Promise<string[]> {
  const domain = await resolveDomain(domainId);
  if (!domain) return [];
  return getOptionalFieldsSync(domain, tag);
}

/**
 * Get constraints for one or all fields in a record.
 *
 * @param domainId - Domain path
 * @param tag - Record tag name
 * @param field - Optional specific field name
 * @returns Field constraints (single or all)
 *
 * @example
 * ```ts
 * // All field constraints
 * const all = await getFieldConstraints('yai.health', 'VITALS');
 *
 * // Single field constraint
 * const hr = await getFieldConstraints('yai.health', 'VITALS', 'hr');
 * // { type: 'int', required: false, range: [30, 250] }
 * ```
 */
export async function getFieldConstraints(
  domainId: string,
  tag: string,
  field?: string,
): Promise<Record<string, FieldConstraint> | FieldConstraint | null> {
  const domain = await resolveDomain(domainId);
  if (!domain) return null;
  return getFieldConstraintsSync(domain, tag, field);
}

/**
 * Get a structured summary of a record — description, fields, constraints.
 *
 * Consumers render this as they wish — the package is framework-agnostic.
 *
 * @param domainId - Domain path
 * @param tag - Record tag name
 * @returns Structured summary or null
 *
 * @example
 * ```ts
 * const summary = await describeRecord('yai.health', 'VITALS');
 * console.log(summary.fieldCount);       // 7
 * console.log(summary.requiredFields);   // ['bp']
 * ```
 */
export async function describeRecord(
  domainId: string,
  tag: string,
): Promise<RecordDescription | null> {
  const domain = await resolveDomain(domainId);
  if (!domain) return null;
  return describeRecordSync(domain, tag);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Variants (pre-resolved domain)
// ─────────────────────────────────────────────────────────────────────────────

/** @see {@link getRecordTags} */
export function getRecordTagsSync(domain: DomainSchema): string[] {
  return Object.keys(domain.records);
}

/** @see {@link getRecordSchema} */
export function getRecordSchemaSync(
  domain: DomainSchema,
  tag: string,
): DomainRecord | null {
  return domain.records[tag] ?? null;
}

/** @see {@link getRequiredFields} */
export function getRequiredFieldsSync(domain: DomainSchema, tag: string): string[] {
  const record = domain.records[tag];
  if (!record) return [];
  return record.requiredFields ?? [];
}

/** @see {@link getOptionalFields} */
export function getOptionalFieldsSync(domain: DomainSchema, tag: string): string[] {
  const record = domain.records[tag];
  if (!record) return [];
  return record.optionalFields ?? [];
}

/** @see {@link getFieldConstraints} */
export function getFieldConstraintsSync(
  domain: DomainSchema,
  tag: string,
  field?: string,
): Record<string, FieldConstraint> | FieldConstraint | null {
  const record = domain.records[tag];
  if (!record?.fields) return null;
  if (field) return record.fields[field] ?? null;
  return record.fields;
}

/** Structured record description */
export interface RecordDescription {
  tag: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  fieldCount: number;
  constraints: Record<string, FieldConstraint>;
}

/** @see {@link describeRecord} */
export function describeRecordSync(
  domain: DomainSchema,
  tag: string,
): RecordDescription | null {
  const record = domain.records[tag];
  if (!record) return null;

  return {
    tag,
    description: record.description,
    requiredFields: record.requiredFields ?? [],
    optionalFields: record.optionalFields ?? [],
    fieldCount: Object.keys(record.fields ?? {}).length,
    constraints: record.fields ?? {},
  };
}
