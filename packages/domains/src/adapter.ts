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
 * JSON Schema Adapter — bridges @younndai/domains JSON wire format to DomainSchema.
 *
 * The raw domain JSON files use `records[]` (array format).
 * This adapter converts to `Record<string, DomainRecord>` (map format).
 *
 * @module
 */

import type {
  DomainSchema,
  DomainSchemaJSON,
  DomainRecord,
  FieldConstraint,
  DomainStatus,
  DomainTier,
  NoticeCode,
} from './types.js';

/**
 * Load a DomainSchema from a raw domain JSON schema file.
 *
 * Bridges the JSON array-based format to the package's record-map format.
 * Per schema-format.md: "Bundled" tier.
 *
 * @param json - Parsed JSON from a domain schema file (e.g., `domains/yai/fintech/1.0.json`)
 * @returns DomainSchema ready for `registerDomain()` or direct use
 *
 * @example
 * ```ts
 * import raw from '@younndai/domains/domains/yai/health/1.0.json';
 * const schema = loadDomainFromJSON(raw as DomainSchemaJSON);
 * console.log(schema.domain);  // 'yai.health'
 * console.log(schema.records); // { VITALS: {...}, DX: {...}, ... }
 * ```
 */
export function loadDomainFromJSON(json: DomainSchemaJSON): DomainSchema {
  const records: Record<string, DomainRecord> = {};

  for (const rec of json.records) {
    const record: DomainRecord = {
      description: rec.description,
    };

    if (rec.fields && rec.fields.length > 0) {
      const required: string[] = [];
      const optional: string[] = [];
      const typed: Record<string, 'int' | 'float' | 'bool' | 'ts' | 'string'> = {};
      const constraints: Record<string, FieldConstraint> = {};

      for (const field of rec.fields) {
        if (field.required) {
          required.push(field.name);
        } else {
          optional.push(field.name);
        }
        if (field.type && field.type !== 'string') {
          typed[field.name] = field.type as 'int' | 'float' | 'bool' | 'ts';
        }

        // Build FieldConstraint for validation
        const constraint: FieldConstraint = {
          type: (field.type || 'string') as FieldConstraint['type'],
          required: field.required ?? false,
        };
        if (field.range) constraint.range = field.range;
        if (field.enum) constraint.enum = field.enum;
        if (field.pattern) constraint.pattern = field.pattern;
        if (field.description) constraint.description = field.description;
        if (field.unit) constraint.unit = field.unit;
        if (field.example) constraint.example = field.example;
        constraints[field.name] = constraint;
      }

      if (required.length > 0) record.requiredFields = required;
      if (optional.length > 0) record.optionalFields = optional;
      if (Object.keys(typed).length > 0) record.typedFields = typed;
      if (Object.keys(constraints).length > 0) record.fields = constraints;
    }

    records[rec.tag] = record;
  }

  return {
    domain: json.domain,
    version: json.version,
    status: (json.status as DomainStatus) || 'active',
    tier: (json.tier as DomainTier) || 'community',
    verified: json.verified ?? false,
    score: json.score ?? 0,
    notice: (json.notice as NoticeCode) ?? null,
    description: json.description,
    records,
    ...(json.defaultMode ? { defaultMode: json.defaultMode } : {}),
    ...(json.defaultProfile ? { defaultProfile: json.defaultProfile } : {}),
    ...(json.defaultFormat ? { defaultFormat: json.defaultFormat } : {}),
    ...(json.schemaHash ? { schemaHash: json.schemaHash } : {}),
  };
}
