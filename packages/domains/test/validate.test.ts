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
 * Validation engine tests — all 5 constraint checks.
 */
import { describe, it, expect } from 'vitest';
import { validateFields, validateRecordSync } from '../src/validate.js';
import type { DomainSchema, FieldConstraint } from '../src/types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CONSTRAINTS: Record<string, FieldConstraint> = {
  name: { type: 'string', required: true },
  age: { type: 'int', required: false, range: [0, 150] },
  score: { type: 'float', required: false, range: [0.0, 100.0] },
  active: { type: 'bool', required: false },
  created: { type: 'ts', required: false },
  status: { type: 'string', required: true, enum: ['open', 'closed'] },
  code: { type: 'string', required: false, pattern: '^[A-Z]{3}$' },
};

const DOMAIN: DomainSchema = {
  domain: 'test.validation',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0,
  notice: null,
  description: 'Test domain for validation',
  records: {
    REC: {
      description: 'Test record',
      fields: CONSTRAINTS,
    },
    EMPTY: {
      description: 'Record with no field constraints',
    },
  },
};

// ── Required ──────────────────────────────────────────────────────────────────

describe('required constraint', () => {
  it('errors when required field is missing', () => {
    const result = validateFields({}, CONSTRAINTS);
    expect(result.valid).toBe(false);
    const nameErr = result.errors.find((e) => e.field === 'name');
    expect(nameErr).toBeDefined();
    expect(nameErr!.constraint).toBe('required');
  });

  it('passes when required field is present', () => {
    const result = validateFields({ name: 'Alice', status: 'open' }, CONSTRAINTS);
    expect(result.valid).toBe(true);
  });

  it('no error when optional field is absent', () => {
    const result = validateFields({ name: 'Alice', status: 'open' }, CONSTRAINTS);
    expect(result.errors).toHaveLength(0);
  });
});

// ── Type ──────────────────────────────────────────────────────────────────────

describe('type constraint', () => {
  it('errors on type mismatch — string expected, number given', () => {
    const result = validateFields({ name: 123, status: 'open' }, CONSTRAINTS);
    const err = result.errors.find((e) => e.field === 'name');
    expect(err).toBeDefined();
    expect(err!.constraint).toBe('type');
  });

  it('int rejects floats', () => {
    const result = validateFields({ name: 'x', status: 'open', age: 25.5 }, CONSTRAINTS);
    const err = result.errors.find((e) => e.field === 'age');
    expect(err).toBeDefined();
    expect(err!.constraint).toBe('type');
  });

  it('float accepts both int and float', () => {
    const r1 = validateFields({ name: 'x', status: 'open', score: 50 }, CONSTRAINTS);
    expect(r1.errors.find((e) => e.field === 'score')).toBeUndefined();

    const r2 = validateFields({ name: 'x', status: 'open', score: 50.5 }, CONSTRAINTS);
    expect(r2.errors.find((e) => e.field === 'score')).toBeUndefined();
  });

  it('bool type check', () => {
    const pass = validateFields({ name: 'x', status: 'open', active: true }, CONSTRAINTS);
    expect(pass.errors.find((e) => e.field === 'active')).toBeUndefined();

    const fail = validateFields({ name: 'x', status: 'open', active: 'yes' }, CONSTRAINTS);
    expect(fail.errors.find((e) => e.field === 'active')?.constraint).toBe('type');
  });

  it('ts accepts string and number', () => {
    const r1 = validateFields({ name: 'x', status: 'open', created: '2026-01-01T00:00:00Z' }, CONSTRAINTS);
    expect(r1.errors.find((e) => e.field === 'created')).toBeUndefined();

    const r2 = validateFields({ name: 'x', status: 'open', created: 1735689600000 }, CONSTRAINTS);
    expect(r2.errors.find((e) => e.field === 'created')).toBeUndefined();
  });
});

// ── Range ─────────────────────────────────────────────────────────────────────

describe('range constraint', () => {
  it('errors when value is below range', () => {
    const result = validateFields({ name: 'x', status: 'open', age: -1 }, CONSTRAINTS);
    const err = result.errors.find((e) => e.field === 'age');
    expect(err?.constraint).toBe('range');
  });

  it('errors when value is above range', () => {
    const result = validateFields({ name: 'x', status: 'open', age: 200 }, CONSTRAINTS);
    expect(result.errors.find((e) => e.field === 'age')?.constraint).toBe('range');
  });

  it('passes when value is within range', () => {
    const result = validateFields({ name: 'x', status: 'open', age: 25 }, CONSTRAINTS);
    expect(result.errors.find((e) => e.field === 'age')).toBeUndefined();
  });

  it('passes at boundary values', () => {
    const lo = validateFields({ name: 'x', status: 'open', age: 0 }, CONSTRAINTS);
    expect(lo.errors.find((e) => e.field === 'age')).toBeUndefined();

    const hi = validateFields({ name: 'x', status: 'open', age: 150 }, CONSTRAINTS);
    expect(hi.errors.find((e) => e.field === 'age')).toBeUndefined();
  });
});

// ── Enum ──────────────────────────────────────────────────────────────────────

describe('enum constraint', () => {
  it('errors when value is not in enum', () => {
    const result = validateFields({ name: 'x', status: 'invalid' }, CONSTRAINTS);
    const err = result.errors.find((e) => e.field === 'status');
    expect(err?.constraint).toBe('enum');
  });

  it('passes when value is in enum', () => {
    const result = validateFields({ name: 'x', status: 'open' }, CONSTRAINTS);
    expect(result.errors.find((e) => e.field === 'status')).toBeUndefined();
  });
});

// ── Pattern ───────────────────────────────────────────────────────────────────

describe('pattern constraint', () => {
  it('errors when value does not match pattern', () => {
    const result = validateFields({ name: 'x', status: 'open', code: 'abc' }, CONSTRAINTS);
    const err = result.errors.find((e) => e.field === 'code');
    expect(err?.constraint).toBe('pattern');
  });

  it('passes when value matches pattern', () => {
    const result = validateFields({ name: 'x', status: 'open', code: 'ABC' }, CONSTRAINTS);
    expect(result.errors.find((e) => e.field === 'code')).toBeUndefined();
  });

  it('warns instead of crashing on invalid regex in schema', () => {
    const badConstraints: Record<string, FieldConstraint> = {
      code: { type: 'string', required: false, pattern: '[invalid(' },
    };
    const result = validateFields({ code: 'test' }, badConstraints);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings[0]!.constraint).toBe('pattern');
  });
});

// ── validateRecordSync ────────────────────────────────────────────────────────

describe('validateRecordSync', () => {
  it('errors on unknown tag with _tag field', () => {
    const result = validateRecordSync('UNKNOWN', {}, DOMAIN);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.field).toBe('_tag');
  });

  it('auto-passes for records without field constraints', () => {
    const result = validateRecordSync('EMPTY', {}, DOMAIN);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
