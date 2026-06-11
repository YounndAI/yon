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
 * Record Validation Engine — validate JS objects against domain schemas.
 *
 * Supports 5 constraint checks: required, type, range, enum, pattern.
 * Provides sync and async variants, batch mode, and domain-not-found error behavior.
 *
 * @module
 */

import type {
  DomainSchema,
  FieldConstraint,
  ValidationResult,
  ValidationError,
} from './types.js';
import { resolveDomain } from './resolve.js';

// ─────────────────────────────────────────────────────────────────────────────
// Async Validation (resolves domain first)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a JS object against a domain record.
 *
 * Resolves the domain first (T1→T3→T2), then validates. If the domain
 * cannot be resolved, returns `{ valid: false, errors: [{ field: '_domain', ... }] }`
 * (never throws).
 *
 * @param domainId - Domain path (e.g., `yai.fintech`)
 * @param tag - Record tag (e.g., `TXN`)
 * @param data - Data to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const result = await validateRecord('yai.fintech', 'TXN', {
 *   id: 'txn-001',
 *   amount: 1500.50,
 *   currency: 'USD',
 * });
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error(`${e.field}: ${e.message}`));
 * }
 * ```
 */
export async function validateRecord(
  domainId: string,
  tag: string,
  data: Record<string, unknown>,
): Promise<ValidationResult> {
  const domain = await resolveDomain(domainId);

  if (!domain) {
    return {
      valid: false,
      errors: [{
        field: '_domain',
        message: `Domain not found: ${domainId}`,
        constraint: 'required',
      }],
      warnings: [],
    };
  }

  return validateRecordSync(tag, data, domain);
}

/**
 * Validate a JS object against a pre-resolved domain schema.
 *
 * Synchronous — no network. Use when you already have the DomainSchema.
 *
 * @param tag - Record tag (e.g., `TXN`)
 * @param data - Data to validate
 * @param domain - Pre-resolved DomainSchema
 * @returns Validation result
 *
 * @example
 * ```ts
 * const domain = getBundledDomain('yai.fintech');
 * const result = validateRecordSync('TXN', { id: 'txn-001' }, domain!);
 * ```
 */
export function validateRecordSync(
  tag: string,
  data: Record<string, unknown>,
  domain: DomainSchema,
): ValidationResult {
  const record = domain.records[tag];

  if (!record) {
    return {
      valid: false,
      errors: [{
        field: '_tag',
        message: `Tag '${tag}' not found in domain '${domain.domain}'`,
        constraint: 'required',
      }],
      warnings: [],
    };
  }

  if (!record.fields) {
    // Domain has no field constraints — pass by default
    return { valid: true, errors: [], warnings: [] };
  }

  return validateFields(data, record.fields);
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Batch validate multiple records.
 *
 * Optimized: resolves each unique domain once, then validates
 * all records against it. Useful for CI/CD pipelines processing
 * hundreds or thousands of records.
 *
 * @param entries - Array of `{ domainId, tag, data }` to validate
 * @returns Array of validation results (same order as input)
 *
 * @example
 * ```ts
 * const results = await validateRecords([
 *   { domainId: 'yai.fintech', tag: 'TXN', data: { id: 'txn-001' } },
 *   { domainId: 'yai.fintech', tag: 'TXN', data: { id: 'txn-002' } },
 *   { domainId: 'yai.health', tag: 'VITALS', data: { bp: '120/80' } },
 * ]);
 * ```
 */
export async function validateRecords(
  entries: Array<{ domainId: string; tag: string; data: Record<string, unknown> }>,
): Promise<ValidationResult[]> {
  // Resolve each unique domain once
  const uniqueDomains = [...new Set(entries.map((e) => e.domainId))];
  const resolved = new Map<string, DomainSchema | null>();

  await Promise.all(
    uniqueDomains.map(async (id) => {
      resolved.set(id, await resolveDomain(id));
    }),
  );

  // Validate all entries
  return entries.map((entry) => {
    const domain = resolved.get(entry.domainId);

    if (!domain) {
      return {
        valid: false,
        errors: [{
          field: '_domain',
          message: `Domain not found: ${entry.domainId}`,
          constraint: 'required' as const,
        }],
        warnings: [],
      };
    }

    return validateRecordSync(entry.tag, entry.data, domain);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Field-Level Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Low-level field–constraint validation.
 *
 * Checks 5 constraints: required, type, range, enum, pattern.
 *
 * @param data - Key-value data to validate
 * @param constraints - Per-field FieldConstraint map
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = validateFields(
 *   { amount: -5, currency: 'INVALID' },
 *   {
 *     amount: { type: 'float', required: true, range: [0, 999999999] },
 *     currency: { type: 'string', required: true, enum: ['USD', 'EUR', 'GBP'] },
 *   },
 * );
 * ```
 */
export function validateFields(
  data: Record<string, unknown>,
  constraints: Record<string, FieldConstraint>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const [fieldName, constraint] of Object.entries(constraints)) {
    const value = data[fieldName];

    // ── Required check ──
    if (constraint.required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `Required field '${fieldName}' is missing`,
        constraint: 'required',
      });
      continue;
    }

    // Skip remaining checks if value is absent (optional field)
    if (value === undefined || value === null) continue;

    // ── Type check ──
    if (!_checkType(value, constraint.type)) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' expected type '${constraint.type}', received '${typeof value}'`,
        constraint: 'type',
        expected: constraint.type,
        received: typeof value,
      });
      continue;
    }

    // ── Range check (int/float) ──
    if (constraint.range && typeof value === 'number') {
      const [min, max] = constraint.range;
      if (value < min || value > max) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' value ${value} outside range [${min}, ${max}]`,
          constraint: 'range',
          expected: `[${min}, ${max}]`,
          received: String(value),
        });
      }
    }

    // ── Enum check ──
    if (constraint.enum && typeof value === 'string') {
      if (!constraint.enum.includes(value)) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' value '${value}' not in enum [${constraint.enum.join(', ')}]`,
          constraint: 'enum',
          expected: constraint.enum.join(', '),
          received: value,
        });
      }
    }

    // ── Pattern check ──
    if (constraint.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(constraint.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' value '${value}' does not match pattern '${constraint.pattern}'`,
            constraint: 'pattern',
            expected: constraint.pattern,
            received: value,
          });
        }
      } catch {
        // Invalid regex in schema — warn about the schema, not the value
        warnings.push({
          field: fieldName,
          message: `Field '${fieldName}': invalid regex pattern '${constraint.pattern}' in domain schema`,
          constraint: 'pattern',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Check if a value matches the expected YounndAI type */
function _checkType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'int':
      return typeof value === 'number' && Number.isInteger(value);
    case 'float':
      return typeof value === 'number';
    case 'bool':
      return typeof value === 'boolean';
    case 'ts':
      // Timestamp: string in ISO 8601 format or number (epoch ms)
      return typeof value === 'string' || typeof value === 'number';
    default:
      return true; // Unknown types pass
  }
}
