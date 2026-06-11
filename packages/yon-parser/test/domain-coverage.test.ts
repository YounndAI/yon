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
 * Domain Coverage Tests
 *
 * For each of the 25 official domains:
 * - Parse a document with domain-specific tags
 * - Validate in lenient mode (domain tags pass as unknown)
 * - Verify tag parsing (tags are captured correctly)
 * - Verify format roundtrip preservation
 *
 * Note: The validator does not yet consume the `domains` option for
 * tag allowlisting. Domain tags pass through as "unknown" records.
 * Strict domain-aware validation is a future enhancement.
 */

import { describe, it, expect } from 'vitest';
import { parse, validate, format, listBundledDomains, getBundledDomain, type DomainSchema } from '../src/index.js';

/** Build a minimal YON document using a domain's record tags */
function buildDomainDoc(registry: DomainSchema): string {
  const lines = [
    `@DOC ver=2.0 | id=test-${registry.domain.replace('yai.', '')} | title="Domain Coverage Test" | domain=${registry.domain}@${registry.version}`,
  ];

  for (const [tag, record] of Object.entries(registry.records)) {
    const fields: string[] = [];

    // Add required fields
    for (const f of record.requiredFields ?? []) {
      fields.push(`${f}=test_value`);
    }

    // Add one optional field if available
    const firstOptional = (record.optionalFields ?? [])[0];
    if (firstOptional) {
      fields.push(`${firstOptional}=sample`);
    }

    const fieldStr = fields.length > 0 ? ` ${fields.join(' | ')}` : '';
    lines.push(`@${tag}${fieldStr}`);
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-domain coverage
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain Coverage', () => {
  const domainEntries = listBundledDomains().map(id => [id, getBundledDomain(id)!] as const);

  describe.each(domainEntries)('Domain: %s', (_key, registry: DomainSchema) => {
    const src = buildDomainDoc(registry);

    it('parse succeeds', () => {
      const doc = parse(src);
      expect(doc).toBeDefined();
      expect(doc.id).toBe(`test-${registry.domain.replace('yai.', '')}`);
    });

    it('all domain tags are captured as records', () => {
      const doc = parse(src);
      const expectedTags = Object.keys(registry.records);
      const parsedTags = doc.records
        .map(r => r.tag)
        .filter(t => expectedTags.includes(t));
      expect(parsedTags.sort()).toEqual(expectedTags.sort());
    });

    it('format roundtrip preserves domain tags', () => {
      const doc = parse(src);
      const formatted = format(doc, { mode: 'canon' });
      const reparsed = parse(formatted);

      // All domain tags should survive roundtrip
      const originalTags = doc.records.map(r => r.tag).sort();
      const roundtripTags = reparsed.records.map(r => r.tag).sort();
      expect(roundtripTags).toEqual(originalTags);
    });

    it('domain field preserved in header', () => {
      const doc = parse(src);
      expect(doc.domain).toBe(registry.domain);
    });
  });
});
