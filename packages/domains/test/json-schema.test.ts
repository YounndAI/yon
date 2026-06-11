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
 * JSON Schema export tests — type mapping, constraints, extensions.
 */
import { describe, it, expect } from 'vitest';
import {
  fieldToJSONSchema,
  recordToJSONSchema,
  domainToJSONSchemas,
} from '../src/json-schema.js';
import { VERSION } from '../src/version.js';
import type { DomainRecord, DomainSchema, FieldConstraint } from '../src/types.js';

// ── fieldToJSONSchema ─────────────────────────────────────────────────────────

describe('fieldToJSONSchema', () => {
  it('maps string → string', () => {
    const c: FieldConstraint = { type: 'string', required: false };
    expect(fieldToJSONSchema(c).type).toBe('string');
  });

  it('maps int → integer', () => {
    const c: FieldConstraint = { type: 'int', required: false };
    expect(fieldToJSONSchema(c).type).toBe('integer');
  });

  it('maps float → number', () => {
    const c: FieldConstraint = { type: 'float', required: false };
    expect(fieldToJSONSchema(c).type).toBe('number');
  });

  it('maps bool → boolean', () => {
    const c: FieldConstraint = { type: 'bool', required: false };
    expect(fieldToJSONSchema(c).type).toBe('boolean');
  });

  it('maps ts → string with date-time format', () => {
    const c: FieldConstraint = { type: 'ts', required: false };
    const result = fieldToJSONSchema(c);
    expect(result.type).toBe('string');
    expect(result.format).toBe('date-time');
  });

  it('includes range as minimum/maximum', () => {
    const c: FieldConstraint = { type: 'int', required: false, range: [0, 100] };
    const result = fieldToJSONSchema(c);
    expect(result.minimum).toBe(0);
    expect(result.maximum).toBe(100);
  });

  it('includes enum array', () => {
    const c: FieldConstraint = { type: 'string', required: false, enum: ['a', 'b', 'c'] };
    expect(fieldToJSONSchema(c).enum).toEqual(['a', 'b', 'c']);
  });

  it('includes pattern', () => {
    const c: FieldConstraint = { type: 'string', required: false, pattern: '^[A-Z]+$' };
    expect(fieldToJSONSchema(c).pattern).toBe('^[A-Z]+$');
  });

  it('outputs description from constraint', () => {
    const c: FieldConstraint = { type: 'string', required: false, description: 'Patient name' };
    expect(fieldToJSONSchema(c).description).toBe('Patient name');
  });

  it('merges description with existing type description for ts fields', () => {
    const c: FieldConstraint = { type: 'ts', required: false, description: 'Onset Date' };
    const result = fieldToJSONSchema(c);
    // ts maps to ISO 8601 timestamp description; collision-aware merge appends it
    expect(result.description).toBe('Onset Date (ISO 8601 timestamp)');
  });

  it('preserves ts type description when no constraint description', () => {
    const c: FieldConstraint = { type: 'ts', required: false };
    expect(fieldToJSONSchema(c).description).toBe('ISO 8601 timestamp');
  });
});

// ── recordToJSONSchema ────────────────────────────────────────────────────────

describe('recordToJSONSchema', () => {
  const record: DomainRecord = {
    description: 'Test record',
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: false },
    },
  };

  it('includes draft-07 $schema', () => {
    const schema = recordToJSONSchema(record, 'ITEM', 'test.domain');
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
  });

  it('includes $id with domain and tag', () => {
    const schema = recordToJSONSchema(record, 'ITEM', 'test.domain');
    expect(schema.$id).toBe('https://domains.younndai.com/schemas/test.domain/ITEM');
  });

  it('populates required array from field constraints', () => {
    const schema = recordToJSONSchema(record, 'ITEM', 'test.domain');
    expect(schema.required).toEqual(['id']);
  });

  it('sets additionalProperties to true', () => {
    const schema = recordToJSONSchema(record, 'ITEM', 'test.domain');
    expect(schema.additionalProperties).toBe(true);
  });

  it('includes x-generator, x-domain, x-tag extensions', () => {
    const schema = recordToJSONSchema(record, 'ITEM', 'test.domain');
    expect(schema['x-generator']).toBe(`@younndai/domains@${VERSION}`);
    expect(schema['x-domain']).toBe('test.domain');
    expect(schema['x-tag']).toBe('ITEM');
  });

  it('omits required array when no fields are required', () => {
    const allOptional: DomainRecord = {
      description: 'All optional',
      fields: {
        name: { type: 'string', required: false },
      },
    };
    const schema = recordToJSONSchema(allOptional, 'OPT', 'test.domain');
    expect(schema.required).toBeUndefined();
  });
});

// ── domainToJSONSchemas ───────────────────────────────────────────────────────

describe('domainToJSONSchemas', () => {
  it('produces one schema per record', () => {
    const domain: DomainSchema = {
      domain: 'test.multi',
      version: '1.0',
      status: 'active',
      tier: 'community',
      verified: false,
      score: 0,
      notice: null,
      description: 'Multi-record domain',
      records: {
        A: { description: 'Record A', fields: { x: { type: 'string', required: false } } },
        B: { description: 'Record B', fields: { y: { type: 'int', required: true } } },
      },
    };
    const schemas = domainToJSONSchemas(domain);
    expect(Object.keys(schemas)).toEqual(['A', 'B']);
    expect(schemas.A!.title).toBe('test.multi/A');
    expect(schemas.B!.title).toBe('test.multi/B');
  });
});
