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
 * Domain Integrity Tests
 *
 * Deep validation of all official domain schemas — verifying that the
 * generated DomainRegistry values (types, constraints, field names)
 * are structurally valid and self-consistent.
 *
 * Cross-checks generated registries against JSON source schemas to
 * confirm types, ranges, enums, and patterns survived codegen.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { listBundledDomains, getBundledDomain, isOfficialDomain } from '../src/index.js';

const require = createRequire(import.meta.url);
const DOMAINS_DIR = resolve(dirname(require.resolve('@younndai/domains/domains/index.json')), 'yai');

/** Valid field types per schema-format.md */
const VALID_TYPES = new Set(['string', 'int', 'float', 'bool', 'ts']);

/** Load raw JSON schema for a domain */
function loadRawSchema(domainShort: string): any | null {
  const schemaPath = resolve(DOMAINS_DIR, domainShort, '1.0.json');
  if (!existsSync(schemaPath)) return null;
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Structural Integrity — bundled official domains
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain Registry Integrity', () => {
  const entries = listBundledDomains().map(id => [id, getBundledDomain(id)!] as const);

  it('exposes a non-empty derived bundled official registry', () => {
    // Count is derived from the bundled registry itself — adding a new
    // yai.* domain must not break this test.
    expect(entries.length).toBe(listBundledDomains().length);
    expect(entries.length).toBeGreaterThan(0);
  });

  describe.each(entries)('Registry: %s', (key, registry) => {
    it('domain ID follows yai.{name} format', () => {
      expect(registry.domain).toMatch(/^yai\.\w+$/);
    });

    it('key matches domain', () => {
      expect(key).toBe(registry.domain);
    });

    it('has a version string', () => {
      expect(registry.version).toBeTruthy();
      expect(typeof registry.version).toBe('string');
    });

    it('has a non-empty description', () => {
      expect(registry.description).toBeTruthy();
      expect(registry.description.length).toBeGreaterThan(10);
    });

    it('has at least one record', () => {
      expect(Object.keys(registry.records).length).toBeGreaterThan(0);
    });

    it('is flagged as official', () => {
      expect(isOfficialDomain(registry.domain)).toBe(true);
    });

    it('all record tags are UPPER_CASE', () => {
      for (const tag of Object.keys(registry.records)) {
        expect(tag).toMatch(/^[A-Z][A-Z0-9_]*$/);
      }
    });

    it('all records have descriptions', () => {
      for (const [tag, record] of Object.entries(registry.records)) {
        expect(record.description, `${tag} missing description`).toBeTruthy();
      }
    });

    it('typedFields use only valid types', () => {
      for (const [tag, record] of Object.entries(registry.records)) {
        if (record.typedFields) {
          for (const [field, type] of Object.entries(record.typedFields)) {
            expect(VALID_TYPES.has(type), `${tag}.${field} has invalid type '${type}'`).toBe(true);
          }
        }
      }
    });

    it('required and optional fields do not overlap', () => {
      for (const [tag, record] of Object.entries(registry.records)) {
        const required = new Set(record.requiredFields ?? []);
        const optional = new Set(record.optionalFields ?? []);
        const overlap = [...required].filter((f) => optional.has(f));
        expect(overlap, `${tag}: fields in both required and optional`).toEqual([]);
      }
    });

    it('typed fields reference declared fields', () => {
      for (const [tag, record] of Object.entries(registry.records)) {
        if (record.typedFields) {
          const allFields = new Set([
            ...(record.requiredFields ?? []),
            ...(record.optionalFields ?? []),
          ]);
          for (const field of Object.keys(record.typedFields)) {
            expect(allFields.has(field), `${tag}.${field} typed but not declared`).toBe(true);
          }
        }
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSON Source Cross-Check — types, ranges, enums, patterns
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain JSON Source Cross-Check', () => {
  const entries = listBundledDomains().map(id => [id, getBundledDomain(id)!] as const);

  describe.each(entries)('JSON: %s', (key, registry) => {
    const short = registry.domain.replace('yai.', '');
    const schema = loadRawSchema(short);

    if (!schema) {
      it.skip(`${key}: no JSON schema found`, () => {});
      return;
    }

    it('all JSON field types are valid per schema-format.md', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          expect(
            VALID_TYPES.has(field.type),
            `${rec.tag}.${field.name} has invalid type '${field.type}'`
          ).toBe(true);
        }
      }
    });

    it('range constraints are valid [min, max] with min ≤ max', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.range) {
            expect(Array.isArray(field.range), `${rec.tag}.${field.name} range is not array`).toBe(
              true
            );
            expect(field.range.length, `${rec.tag}.${field.name} range length`).toBe(2);
            const [min, max] = field.range;
            expect(min, `${rec.tag}.${field.name} min`).toBeLessThanOrEqual(max);
          }
        }
      }
    });

    it('range constraints only on numeric types', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.range) {
            expect(
              ['int', 'float'].includes(field.type),
              `${rec.tag}.${field.name}: range on non-numeric type '${field.type}'`
            ).toBe(true);
          }
        }
      }
    });

    // Enums must be non-empty. A single-value enum is a valid, intentional idiom
    // for "exactly one allowed value, reserved for future extension" — e.g. yai.lyt
    // MESH_EDGE.kind = ["parent"], documented as "parent in v1; future kinds reserved".
    // A one-element enum IS the schema's correct representation of a single
    // constrained value, so this invariant guards against an EMPTY enum (which would
    // permit no values at all), not against deliberate single-value enums.
    it('enum constraints have at least 1 value (non-empty)', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.enum) {
            expect(
              field.enum.length,
              `${rec.tag}.${field.name} enum is empty`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it('enum constraints only on string types', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.enum) {
            expect(
              field.type,
              `${rec.tag}.${field.name}: enum on non-string type '${field.type}'`
            ).toBe('string');
          }
        }
      }
    });

    it('pattern constraints are valid regexes', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.pattern) {
            expect(() => new RegExp(field.pattern), `${rec.tag}.${field.name}: invalid regex`).not.toThrow();
          }
        }
      }
    });

    it('pattern constraints only on string types', () => {
      for (const rec of schema.records) {
        if (!rec.fields) continue;
        for (const field of rec.fields) {
          if (field.pattern) {
            expect(
              field.type,
              `${rec.tag}.${field.name}: pattern on non-string type '${field.type}'`
            ).toBe('string');
          }
        }
      }
    });

    it('typed fields in parser match JSON field types', () => {
      for (const rec of schema.records) {
        const parserRecord = registry.records[rec.tag];
        if (!parserRecord || !rec.fields) continue;

        for (const field of rec.fields) {
          if (field.type !== 'string') {
            // Parser should have this in typedFields
            expect(
              parserRecord.typedFields?.[field.name],
              `${rec.tag}.${field.name}: expected type '${field.type}' in parser`
            ).toBe(field.type);
          }
        }
      }
    });
  });
});
