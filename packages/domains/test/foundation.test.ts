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
 * Foundation layer tests — adapter, errors, version.
 */
import { describe, it, expect } from 'vitest';
import { loadDomainFromJSON } from '../src/adapter.js';
import {
  DomainNotFoundError,
  RegistryUnavailableError,
  AccessDeniedError,
} from '../src/errors.js';
import { VERSION } from '../src/version.js';
import type { DomainSchemaJSON } from '../src/types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MINIMAL_JSON: DomainSchemaJSON = {
  domain: 'test.minimal',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0.8,
  notice: null,
  description: 'A minimal test domain',
  records: [
    {
      tag: 'ITEM',
      description: 'Test item',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'count', type: 'int', required: false, range: [0, 100] },
        { name: 'status', type: 'string', required: true, enum: ['active', 'inactive'] },
        { name: 'code', type: 'string', required: false, pattern: '^[A-Z]{3}$' },
        { name: 'ratio', type: 'float', required: false },
        { name: 'active', type: 'bool', required: false },
        { name: 'created', type: 'ts', required: false },
        { name: 'pressure', type: 'float', required: false, range: [0, 300], description: 'Systolic blood pressure', unit: 'mmHg', example: '120' },
      ],
    },
    {
      tag: 'EMPTY',
      description: 'Record with no fields',
      fields: [],
    },
  ],
};

// ── loadDomainFromJSON ────────────────────────────────────────────────────────

describe('loadDomainFromJSON', () => {
  it('produces correct DomainSchema shape', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    expect(schema.domain).toBe('test.minimal');
    expect(schema.version).toBe('1.0');
    expect(schema.status).toBe('active');
    expect(schema.tier).toBe('community');
    expect(schema.verified).toBe(false);
    expect(schema.score).toBe(0.8);
    expect(schema.notice).toBeNull();
    expect(schema.description).toBe('A minimal test domain');
  });

  it('converts records array to record map', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    expect(Object.keys(schema.records)).toEqual(['ITEM', 'EMPTY']);
    expect(schema.records.ITEM?.description).toBe('Test item');
    expect(schema.records.EMPTY?.description).toBe('Record with no fields');
  });

  it('maps field constraints correctly', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    const fields = schema.records.ITEM!.fields!;

    // Required string
    expect(fields.id).toEqual({ type: 'string', required: true });
    // Optional int with range
    expect(fields.count).toEqual({ type: 'int', required: false, range: [0, 100] });
    // Required string with enum
    expect(fields.status).toEqual({ type: 'string', required: true, enum: ['active', 'inactive'] });
    // Optional string with pattern
    expect(fields.code).toEqual({ type: 'string', required: false, pattern: '^[A-Z]{3}$' });
    // Float, bool, ts
    expect(fields.ratio?.type).toBe('float');
    expect(fields.active?.type).toBe('bool');
    expect(fields.created?.type).toBe('ts');
  });

  it('populates requiredFields and optionalFields', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    const item = schema.records.ITEM!;
    expect(item.requiredFields).toEqual(['id', 'status']);
    expect(item.optionalFields).toEqual(['count', 'code', 'ratio', 'active', 'created', 'pressure']);
  });

  it('passes description, unit, and example through to constraints', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    const fields = schema.records.ITEM!.fields!;

    // Field with all three context properties
    expect(fields.pressure?.description).toBe('Systolic blood pressure');
    expect(fields.pressure?.unit).toBe('mmHg');
    expect(fields.pressure?.example).toBe('120');

    // Field without context properties — should not have them
    expect(fields.id?.description).toBeUndefined();
    expect(fields.id?.unit).toBeUndefined();
    expect(fields.id?.example).toBeUndefined();
  });

  it('populates typedFields for non-string types', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    const typed = schema.records.ITEM!.typedFields!;
    expect(typed.count).toBe('int');
    expect(typed.ratio).toBe('float');
    expect(typed.active).toBe('bool');
    expect(typed.created).toBe('ts');
    // String fields should NOT be in typedFields
    expect(typed.id).toBeUndefined();
  });

  it('handles records with no fields', () => {
    const schema = loadDomainFromJSON(MINIMAL_JSON);
    const empty = schema.records.EMPTY!;
    expect(empty.fields).toBeUndefined();
    expect(empty.requiredFields).toBeUndefined();
    expect(empty.optionalFields).toBeUndefined();
  });

  it('applies defaults for missing optional properties', () => {
    const sparse: DomainSchemaJSON = {
      domain: 'test.sparse',
      version: '0.1',
      status: undefined as unknown as 'active',
      tier: undefined as unknown as 'community',
      verified: undefined as unknown as boolean,
      score: undefined as unknown as number,
      notice: undefined as unknown as null,
      description: 'Sparse domain',
      records: [],
    };
    const schema = loadDomainFromJSON(sparse);
    expect(schema.status).toBe('active');
    expect(schema.tier).toBe('community');
    expect(schema.verified).toBe(false);
    expect(schema.score).toBe(0);
    expect(schema.notice).toBeNull();
  });
});

// ── Error Classes ─────────────────────────────────────────────────────────────

describe('Error classes', () => {
  it('DomainNotFoundError has correct name and domainId', () => {
    const err = new DomainNotFoundError('yai.missing');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainNotFoundError);
    expect(err.name).toBe('DomainNotFoundError');
    expect(err.domainId).toBe('yai.missing');
    expect(err.message).toContain('yai.missing');
  });

  it('RegistryUnavailableError has correct name and cause', () => {
    const cause = new Error('timeout');
    const err = new RegistryUnavailableError('Registry down', cause);
    expect(err).toBeInstanceOf(RegistryUnavailableError);
    expect(err.name).toBe('RegistryUnavailableError');
    expect(err.cause).toBe(cause);
  });

  it('AccessDeniedError has correct name and default message', () => {
    const err = new AccessDeniedError();
    expect(err).toBeInstanceOf(AccessDeniedError);
    expect(err.name).toBe('AccessDeniedError');
    expect(err.message).toContain('Access denied');
  });
});

// ── VERSION ───────────────────────────────────────────────────────────────────

describe('VERSION', () => {
  it('is a semver string', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
