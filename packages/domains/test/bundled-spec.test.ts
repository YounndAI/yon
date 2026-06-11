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
 * Bundled Spec Integration Tests — Field Context + Type System
 *
 * Validates that all bundled yai.* domains carry correct
 * field-level context (description, unit, example) and use
 * only the 5 canonical types (string, int, float, bool, ts).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { loadDomainFromJSON } from '../src/adapter.js';
import { getBundledDomain, listBundledDomains } from '../src/bundled.js';
import type { DomainSchemaJSON } from '../src/types.js';

const require = createRequire(import.meta.url);

const CANONICAL_TYPES = new Set(['string', 'int', 'float', 'bool', 'ts']);
const VALID_FIELD_KEYS = new Set([
  'type',
  'required',
  'description',
  'unit',
  'example',
  'range',
  'enum',
  'pattern',
]);

interface DomainsIndex {
  namespaces: {
    yai: {
      domains: Array<{ id: string }>;
    };
  };
}

function getDomainsDir(): string {
  return dirname(require.resolve('@younndai/domains/domains/index.json'));
}

function listRawSchemas(): DomainSchemaJSON[] {
  const yaiDir = resolve(getDomainsDir(), 'yai');

  return readdirSync(yaiDir)
    .map((entry) => resolve(yaiDir, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory())
    .map((domainDir) => {
      return JSON.parse(
        readFileSync(resolve(domainDir, '1.0.json'), 'utf-8'),
      ) as DomainSchemaJSON;
    })
    .sort((a, b) => a.domain.localeCompare(b.domain));
}

function listRawSchemaDomains(): string[] {
  return listRawSchemas().map((schema) => schema.domain).sort();
}

function listIndexedDomains(): string[] {
  const index = JSON.parse(
    readFileSync(require.resolve('@younndai/domains/domains/index.json'), 'utf-8'),
  ) as DomainsIndex;

  return index.namespaces.yai.domains.map((domain) => domain.id).sort();
}

describe('Bundled Spec: Raw Schema Coverage', () => {
  it('keeps raw schemas, domains/index.json, and bundled IDs aligned', () => {
    const rawDomains = listRawSchemaDomains();
    expect(listIndexedDomains()).toEqual(rawDomains);
    expect(listBundledDomains().sort()).toEqual(rawDomains);
  });

  it('bundles every package-owned raw schema without adapter drift', () => {
    for (const raw of listRawSchemas()) {
      expect(getBundledDomain(raw.domain)).toEqual(loadDomainFromJSON(raw));
    }
  });
});

describe('Bundled Spec: Field Context', () => {
  it('yai.health VITALS.bp has description, unit, and example', () => {
    const health = getBundledDomain('yai.health');
    expect(health).not.toBeNull();

    const bp = health!.records.VITALS?.fields?.bp;
    expect(bp).toBeDefined();
    expect(bp!.description).toBe(
      'Blood Pressure in mmHg in systolic/diastolic format',
    );
    expect(bp!.unit).toBe('mmHg');
    expect(bp!.example).toBe('120/80');
  });

  it('every field across all bundled domains has a description', () => {
    const ids = listBundledDomains();
    // Sanity: registry is populated (count is derived, not hard-coded —
    // adding a new yai.* domain must not break this test).
    expect(ids.length).toBeGreaterThan(0);

    const missing: string[] = [];

    for (const id of ids) {
      const domain = getBundledDomain(id);
      if (!domain) continue;

      for (const [tag, record] of Object.entries(domain.records)) {
        if (!record?.fields) continue;
        for (const [name, constraint] of Object.entries(record.fields)) {
          if (!constraint.description) {
            missing.push(`${id}/${tag}.${name}`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

describe('Bundled Spec: Type System', () => {
  it('all fields use only canonical types (string|int|float|bool|ts)', () => {
    const ids = listBundledDomains();
    const violations: string[] = [];

    for (const id of ids) {
      const domain = getBundledDomain(id);
      if (!domain) continue;

      for (const [tag, record] of Object.entries(domain.records)) {
        if (!record?.fields) continue;
        for (const [name, constraint] of Object.entries(record.fields)) {
          if (!CANONICAL_TYPES.has(constraint.type)) {
            violations.push(`${id}/${tag}.${name}: ${constraint.type}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('no field has unexpected properties', () => {
    const ids = listBundledDomains();
    const unexpected: string[] = [];

    for (const id of ids) {
      const domain = getBundledDomain(id);
      if (!domain) continue;

      for (const [tag, record] of Object.entries(domain.records)) {
        if (!record?.fields) continue;
        for (const [name, constraint] of Object.entries(record.fields)) {
          for (const key of Object.keys(constraint)) {
            if (!VALID_FIELD_KEYS.has(key)) {
              unexpected.push(`${id}/${tag}.${name}.${key}`);
            }
          }
        }
      }
    }

    expect(unexpected).toEqual([]);
  });
});
