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
 * Domain Schema Alignment Tests
 *
 * Cross-checks parser domain registries against their
 * corresponding JSON schemas in @younndai/domains/domains/yai/{domain}/1.0.json.
 *
 * For each domain, verifies:
 * - Tag names match
 * - Required fields match
 * - Optional fields match
 * - Domain string and version match
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { listBundledDomains, getBundledDomain, type DomainSchema } from '../src/index.js';

const require = createRequire(import.meta.url);

/** Resolve the domains package data directory via @younndai/domains. */
function getDomainsDir(): string {
  return dirname(require.resolve('@younndai/domains/domains/index.json'));
}

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  pattern?: string;
  range?: [number, number];
  enum?: string[];
}

interface SchemaRecord {
  tag: string;
  description: string;
  /** v2 format: typed fields array */
  fields?: SchemaField[];
  /** Legacy format: plain string arrays */
  required?: string[];
  optional?: string[];
}

/** Raw domain JSON schema shape (records are an array, not a map) */
interface RawDomainSchema {
  domain: string;
  version: string;
  status: string;
  tier: string;
  description: string;
  records: SchemaRecord[];
}

interface DomainsIndex {
  namespaces: {
    yai: {
      domains: Array<{ id: string }>;
    };
  };
}

/** Extract required/optional field names from a schema record, handling both formats */
function extractFields(rec: SchemaRecord): { required: string[]; optional: string[] } {
  if (rec.fields && rec.fields.length > 0) {
    return {
      required: rec.fields.filter(f => f.required).map(f => f.name),
      optional: rec.fields.filter(f => !f.required).map(f => f.name),
    };
  }
  return {
    required: rec.required ?? [],
    optional: rec.optional ?? [],
  };
}

function loadSchema(domainShort: string): RawDomainSchema | null {
  const schemaPath = resolve(getDomainsDir(), 'yai', domainShort, '1.0.json');
  if (!existsSync(schemaPath)) return null;
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

function listRawSchemaDomains(): string[] {
  const yaiDir = resolve(getDomainsDir(), 'yai');

  return readdirSync(yaiDir)
    .map((entry) => resolve(yaiDir, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory())
    .map((domainDir) => {
      const schema = JSON.parse(
        readFileSync(resolve(domainDir, '1.0.json'), 'utf-8'),
      ) as RawDomainSchema;
      return schema.domain;
    })
    .sort();
}

function listIndexedDomains(): string[] {
  const index = JSON.parse(
    readFileSync(require.resolve('@younndai/domains/domains/index.json'), 'utf-8'),
  ) as DomainsIndex;

  return index.namespaces.yai.domains.map((domain) => domain.id).sort();
}

/** Extract short domain name from yai.{name} */
function shortName(domain: string): string {
  return domain.replace('yai.', '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Cross-check parser registries vs JSON schemas
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain Schema Alignment', () => {
  const domainEntries = listBundledDomains().map(id => [id, getBundledDomain(id)!] as const);

  it('keeps parser-visible bundles aligned with package-owned raw schemas', () => {
    const rawDomains = listRawSchemaDomains();
    expect(listIndexedDomains()).toEqual(rawDomains);
    expect(domainEntries.map(([id]) => id).sort()).toEqual(rawDomains);
  });

  it('every bundled official domain has a JSON schema', () => {
    const missing: string[] = [];
    for (const [, registry] of domainEntries) {
      const schema = loadSchema(shortName(registry.domain));
      if (!schema) missing.push(registry.domain);
    }
    expect(missing).toEqual([]);
  });

  describe.each(domainEntries)('Domain: %s', (_key, registry: DomainSchema) => {
    const short = shortName(registry.domain);
    const schema = loadSchema(short);

    if (!schema) {
      it.skip(`${registry.domain}: missing schema file`, () => {});
      return;
    }

    it('domain string matches', () => {
      expect(registry.domain).toBe(schema.domain);
    });

    it('version matches', () => {
      expect(registry.version).toBe(schema.version);
    });

    it('tag names match', () => {
      const parserTags = Object.keys(registry.records).sort();
      const schemaTags = schema.records.map(r => r.tag).sort();
      expect(parserTags).toEqual(schemaTags);
    });

    it('required fields match for each record', () => {
      for (const schemaRecord of schema.records) {
        const parserRecord = registry.records[schemaRecord.tag];
        expect(parserRecord).toBeDefined();

        const parserRequired = (parserRecord.requiredFields ?? []).sort();
        const { required: schemaRequired } = extractFields(schemaRecord);
        expect(parserRequired).toEqual(schemaRequired.sort());
      }
    });

    it('optional fields match for each record', () => {
      for (const schemaRecord of schema.records) {
        const parserRecord = registry.records[schemaRecord.tag];
        expect(parserRecord).toBeDefined();

        const parserOptional = (parserRecord.optionalFields ?? []).sort();
        const { optional: schemaOptional } = extractFields(schemaRecord);
        expect(parserOptional).toEqual(schemaOptional.sort());
      }
    });
  });
});
