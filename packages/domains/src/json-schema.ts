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
 * JSON Schema Export — convert YounndAI domain records to JSON Schema (draft-07).
 *
 * Enables interop with JSON Schema ecosystem: validation libraries,
 * code generators, API documentation, form generators, etc.
 *
 * @module
 */

import type { DomainSchema, DomainRecord, FieldConstraint } from './types.js';
import { resolveDomain } from './resolve.js';
import { VERSION } from './version.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Standard JSON Schema (draft-07) object */
export interface JSONSchema7 {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JSONSchema7>;
  required?: string[];
  enum?: Array<string | number | boolean>;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  additionalProperties?: boolean;
  /** Custom extension: generator metadata */
  'x-generator'?: string;
  /** Custom extension: source domain */
  'x-domain'?: string;
  /** Custom extension: source tag */
  'x-tag'?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Mapping
// ─────────────────────────────────────────────────────────────────────────────

/** Map YounndAI field types to JSON Schema types */
function mapType(type: string | undefined): JSONSchema7 {
  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'int':
      return { type: 'integer' };
    case 'float':
      return { type: 'number' };
    case 'bool':
      return { type: 'boolean' };
    case 'ts':
      return {
        type: 'string',
        description: 'ISO 8601 timestamp',
        format: 'date-time',
      };
    default:
      return { type: 'string' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a single domain record to JSON Schema.
 *
 * @param record - Record definition
 * @param tag - Tag name (used for title)
 * @param domainId - Domain ID (used for $id and metadata)
 * @returns JSON Schema (draft-07)
 *
 * @example
 * ```ts
 * const vitals = domain.records.VITALS;
 * const schema = recordToJSONSchema(vitals, 'VITALS', 'yai.health');
 * // → { $schema: '...draft-07', title: 'yai.health/VITALS', properties: {...} }
 * ```
 */
export function recordToJSONSchema(
  record: DomainRecord,
  tag: string,
  domainId: string,
): JSONSchema7 {
  const schema: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `https://domains.younndai.com/schemas/${domainId}/${tag}`,
    title: `${domainId}/${tag}`,
    description: record.description,
    type: 'object',
    'x-generator': `@younndai/domains@${VERSION}`,
    'x-domain': domainId,
    'x-tag': tag,
  };

  if (record.fields) {
    const properties: Record<string, JSONSchema7> = {};
    const required: string[] = [];

    for (const [fieldName, constraint] of Object.entries(record.fields)) {
      const prop = fieldToJSONSchema(constraint);
      properties[fieldName] = prop;

      if (constraint.required) {
        required.push(fieldName);
      }
    }

    schema.properties = properties;
    if (required.length > 0) schema.required = required;
    schema.additionalProperties = true; // YON is extensible
  }

  return schema;
}

/**
 * Convert a single field constraint to JSON Schema.
 *
 * @param constraint - Field constraint
 * @returns JSON Schema property
 */
export function fieldToJSONSchema(constraint: FieldConstraint): JSONSchema7 {
  const prop = mapType(constraint.type);

  if (constraint.description) {
    prop.description = prop.description
      ? `${constraint.description} (${prop.description})`
      : constraint.description;
  }

  if (constraint.range) {
    const [min, max] = constraint.range;
    prop.minimum = min;
    prop.maximum = max;
  }

  if (constraint.enum) {
    prop.enum = constraint.enum;
  }

  if (constraint.pattern) {
    prop.pattern = constraint.pattern;
  }

  return prop;
}

/**
 * Convert an entire domain to JSON Schema — one schema per record.
 *
 * @param domain - Pre-resolved DomainSchema
 * @returns Map of tag name → JSON Schema
 *
 * @example
 * ```ts
 * const schemas = domainToJSONSchemas(domain);
 * for (const [tag, schema] of Object.entries(schemas)) {
 *   fs.writeFileSync(`${tag}.schema.json`, JSON.stringify(schema, null, 2));
 * }
 * ```
 */
export function domainToJSONSchemas(
  domain: DomainSchema,
): Record<string, JSONSchema7> {
  const schemas: Record<string, JSONSchema7> = {};

  for (const [tag, record] of Object.entries(domain.records)) {
    schemas[tag] = recordToJSONSchema(record, tag, domain.domain);
  }

  return schemas;
}

/**
 * Resolve a domain and export all its records as JSON Schemas.
 *
 * Async variant — resolves the domain via T1→T3→T2 first.
 *
 * @param domainId - Domain path (e.g., `yai.health`)
 * @returns Map of tag name → JSON Schema, or null if domain not found
 *
 * @example
 * ```ts
 * const schemas = await exportJSONSchemas('yai.health');
 * if (schemas) {
 *   console.log(Object.keys(schemas)); // ['VITALS', 'DX', 'RX', ...]
 *   console.log(schemas.VITALS.properties); // { bp: {...}, hr: {...}, ... }
 * }
 * ```
 */
export async function exportJSONSchemas(
  domainId: string,
): Promise<Record<string, JSONSchema7> | null> {
  const domain = await resolveDomain(domainId);
  if (!domain) return null;
  return domainToJSONSchemas(domain);
}
