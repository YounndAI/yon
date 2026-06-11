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
 * Performance & Stress Tests
 *
 * Ensures parser performance stays within acceptable bounds.
 * All tests assert sub-second for reasonable inputs.
 */

import { describe, it, expect } from 'vitest';
import { parse, validate, format, listBundledDomains, getBundledDomain } from '../src/index.js';

/** Generate N records of a given tag */
function generateRecords(tag: string, count: number, fields: string[] = []): string {
  const fieldStr = fields.length > 0 ? ` ${fields.join(' | ')}` : '';
  return Array.from({ length: count }, (_, i) =>
    `@${tag} rid=${tag.toLowerCase()}:${i}${fieldStr}`
  ).join('\n');
}

/** Build a large document */
function buildLargeDoc(recordCount: number): string {
  const lines = [
    '@DOC ver=2.0 | id=perf-test | title="Performance Test" | kind=doc',
    '@SEC name="Perf Section"',
    generateRecords('NOTE', recordCount, ['text="Performance test record"']),
  ];
  return lines.join('\n');
}

/** Build a document with many fields per record */
function buildWideDoc(fieldCount: number): string {
  const fields = Array.from({ length: fieldCount }, (_, i) =>
    `field_${i}=value_${i}`
  ).join(' | ');
  const lines = [
    '@DOC ver=2.0 | id=wide-test | title="Wide Records Test" | kind=doc',
    `@META ${fields}`,
  ];
  return lines.join('\n');
}

/** Build a document with deeply nested blocks */
function buildDeepDoc(depth: number): string {
  const lines = ['@DOC ver=2.0 | id=deep-test | title="Deep Test" | kind=doc'];
  for (let i = 0; i < depth; i++) {
    lines.push(`@BEGIN id=block_${i} | mime="text/plain" | boundary="bnd_${String(i).padStart(8, '0')}"`);
    lines.push(`Content at depth ${i}`);
    lines.push(`@END boundary="bnd_${String(i).padStart(8, '0')}"`);
  }
  return lines.join('\n');
}

/** Build a domain-heavy document */
function buildDomainHeavyDoc(): string {
  const lines = ['@DOC ver=2.0 | id=domain-heavy | title="Domain Heavy" | kind=doc | domain=yai.fintech@1.0'];
  const allDomains = listBundledDomains().map(id => getBundledDomain(id)!);

  for (const domain of allDomains) {
    const firstTag = Object.keys(domain.records)[0];
    if (firstTag) {
      lines.push(`@${firstTag} src="${domain.domain}"`);
    }
  }
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Performance', () => {
  it('throughput: 10K lines parses in < 1s', () => {
    const src = buildLargeDoc(10_000);
    const start = performance.now();
    parse(src);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('large doc: 1000 records parse + validate + format in < 1s', () => {
    const src = buildLargeDoc(1000);
    const start = performance.now();
    const doc = parse(src);
    validate(doc);
    format(doc, { mode: 'canon' });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('deep nesting: 100 blocks parse in < 1s', () => {
    const src = buildDeepDoc(100);
    const start = performance.now();
    parse(src);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('wide records: 50+ fields per record in < 100ms', () => {
    const src = buildWideDoc(50);
    const start = performance.now();
    parse(src);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('long values: 100K char value in < 500ms', () => {
    const longValue = 'x'.repeat(100_000);
    const src = `@DOC ver=2.0 | id=long | title="${longValue}"`;
    const start = performance.now();
    parse(src);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('domain-heavy: 25 domains worth of tags in < 100ms', () => {
    const src = buildDomainHeavyDoc();
    const start = performance.now();
    const doc = parse(src);
    validate(doc, { domains: listBundledDomains() });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('format idempotency: 100× format cycle stable and < 1s', () => {
    const src = [
      '@DOC ver=2.0 | id=idem | title="Idempotency Test" | kind=doc',
      '@SEC name="Section One"',
      '@RULE lvl=MUST | when="condition" | then="action"',
      '@MAP id=data | pairs=["a"->"b","c"->"d"]',
    ].join('\n');

    const doc = parse(src);
    let current = format(doc, { mode: 'canon' });

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const reparsed = parse(current);
      const reformatted = format(reparsed, { mode: 'canon' });
      expect(reformatted).toBe(current);
      current = reformatted;
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('format comparison: canon vs min vs ultra all < 200ms for 500 records', () => {
    const src = buildLargeDoc(500);
    const doc = parse(src);

    const formats = ['canon', 'min', 'ultra'] as const;
    for (const fmt of formats) {
      const start = performance.now();
      format(doc, { mode: fmt });
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200);
    }
  });
});
