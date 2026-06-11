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
 * Introspection tests — sync functions + fieldCount regression.
 */
import { describe, it, expect } from 'vitest';
import {
  getRecordTagsSync,
  getRecordSchemaSync,
  getRequiredFieldsSync,
  getOptionalFieldsSync,
  getFieldConstraintsSync,
  describeRecordSync,
} from '../src/introspect.js';
import type { DomainSchema } from '../src/types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DOMAIN: DomainSchema = {
  domain: 'test.introspect',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0,
  notice: null,
  description: 'Test domain for introspection',
  records: {
    ITEM: {
      description: 'An item record',
      requiredFields: ['id'],
      optionalFields: ['name', 'count'],
      fields: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        count: { type: 'int', required: false, range: [0, 100] },
      },
    },
    EMPTY: {
      description: 'Record with no fields',
    },
  },
};

// Domain constructed without requiredFields/optionalFields (hand-crafted)
const HAND_CRAFTED: DomainSchema = {
  domain: 'test.handcrafted',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0,
  notice: null,
  description: 'Hand-crafted domain — no requiredFields/optionalFields arrays',
  records: {
    REC: {
      description: 'A record with fields but no requiredFields/optionalFields',
      fields: {
        a: { type: 'string', required: true },
        b: { type: 'int', required: false },
        c: { type: 'bool', required: false },
      },
    },
  },
};

// ── getRecordTagsSync ─────────────────────────────────────────────────────────

describe('getRecordTagsSync', () => {
  it('returns all record tag names', () => {
    expect(getRecordTagsSync(DOMAIN)).toEqual(['ITEM', 'EMPTY']);
  });
});

// ── getRecordSchemaSync ───────────────────────────────────────────────────────

describe('getRecordSchemaSync', () => {
  it('returns record for existing tag', () => {
    const record = getRecordSchemaSync(DOMAIN, 'ITEM');
    expect(record).not.toBeNull();
    expect(record!.description).toBe('An item record');
  });

  it('returns null for missing tag', () => {
    expect(getRecordSchemaSync(DOMAIN, 'MISSING')).toBeNull();
  });
});

// ── getRequiredFieldsSync ─────────────────────────────────────────────────────

describe('getRequiredFieldsSync', () => {
  it('returns requiredFields array', () => {
    expect(getRequiredFieldsSync(DOMAIN, 'ITEM')).toEqual(['id']);
  });

  it('returns empty array for missing tag', () => {
    expect(getRequiredFieldsSync(DOMAIN, 'MISSING')).toEqual([]);
  });
});

// ── getOptionalFieldsSync ─────────────────────────────────────────────────────

describe('getOptionalFieldsSync', () => {
  it('returns optionalFields array', () => {
    expect(getOptionalFieldsSync(DOMAIN, 'ITEM')).toEqual(['name', 'count']);
  });

  it('returns empty array for record without optional fields', () => {
    expect(getOptionalFieldsSync(DOMAIN, 'EMPTY')).toEqual([]);
  });
});

// ── getFieldConstraintsSync ───────────────────────────────────────────────────

describe('getFieldConstraintsSync', () => {
  it('returns all field constraints when no field specified', () => {
    const result = getFieldConstraintsSync(DOMAIN, 'ITEM');
    expect(result).not.toBeNull();
    expect(Object.keys(result as Record<string, unknown>)).toEqual(['id', 'name', 'count']);
  });

  it('returns single field constraint', () => {
    const result = getFieldConstraintsSync(DOMAIN, 'ITEM', 'count');
    expect(result).toEqual({ type: 'int', required: false, range: [0, 100] });
  });

  it('returns null for missing field', () => {
    expect(getFieldConstraintsSync(DOMAIN, 'ITEM', 'nope')).toBeNull();
  });

  it('returns null for record without fields', () => {
    expect(getFieldConstraintsSync(DOMAIN, 'EMPTY')).toBeNull();
  });
});

// ── describeRecordSync ────────────────────────────────────────────────────────

describe('describeRecordSync', () => {
  it('returns structured description', () => {
    const desc = describeRecordSync(DOMAIN, 'ITEM');
    expect(desc).not.toBeNull();
    expect(desc!.tag).toBe('ITEM');
    expect(desc!.description).toBe('An item record');
    expect(desc!.requiredFields).toEqual(['id']);
    expect(desc!.optionalFields).toEqual(['name', 'count']);
    expect(desc!.constraints).toEqual(DOMAIN.records.ITEM!.fields);
  });

  it('returns null for missing tag', () => {
    expect(describeRecordSync(DOMAIN, 'MISSING')).toBeNull();
  });

  // ── BUG FIX REGRESSION TEST ──────────────────────────────────────────────
  it('fieldCount matches Object.keys(fields).length', () => {
    const desc = describeRecordSync(DOMAIN, 'ITEM');
    expect(desc!.fieldCount).toBe(3);
  });

  it('fieldCount is correct for hand-crafted domains without requiredFields/optionalFields', () => {
    const desc = describeRecordSync(HAND_CRAFTED, 'REC');
    expect(desc).not.toBeNull();
    // This was the bug — before the fix, fieldCount would be 0
    expect(desc!.fieldCount).toBe(3);
  });

  it('fieldCount is 0 for records without fields', () => {
    const desc = describeRecordSync(DOMAIN, 'EMPTY');
    expect(desc!.fieldCount).toBe(0);
  });
});
