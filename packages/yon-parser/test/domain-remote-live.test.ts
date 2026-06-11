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
 * T2 Remote Domain Resolution — Live Smoke Tests
 *
 * These tests make REAL network requests to the domains registry.
 * Skipped by default — enable via:
 *   YON_LIVE_TESTS=1 npx vitest run test/domain-remote-live.test.ts
 *
 * To test against local dev server:
 *   YON_LIVE_TESTS=1 YON_REGISTRY_URL=http://localhost:3160 npx vitest run test/domain-remote-live.test.ts
 *
 * Purpose: Verify the parser can fetch and validate against the live registry.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getDomain,
  fetchDomainList,
  setRegistryUrl,
  clearDomainCache,
  resetCacheStats,
  getDomainCacheStats,
  listDomains,
  parse,
  validate,
  registerDomain,
  unregisterDomain,
  getBundledDomain,
} from '../src/index.js';

const LIVE = process.env.YON_LIVE_TESTS === '1';
const REGISTRY_URL = process.env.YON_REGISTRY_URL || 'https://domains.younndai.com';

describe.skipIf(!LIVE)('T2 Live Smoke Tests', () => {
  beforeAll(() => {
    setRegistryUrl(REGISTRY_URL);
    clearDomainCache();
    resetCacheStats();
  });

  afterAll(() => {
    clearDomainCache();
    resetCacheStats();
  });

  // ─── Single Domain Fetch ────────────────────────────────────────

  it('fetches yai.health schema from live registry', async () => {
    const result = await getDomain('yai.health');

    expect(result).not.toBeNull();
    expect(result!.domain).toBe('yai.health');
    expect(result!.version).toBeDefined();
    expect(result!.records).toBeDefined();
    expect(Object.keys(result!.records).length).toBeGreaterThan(0);
  }, 15000);

  it('live schema matches bundled schema shape', async () => {
    const bundled = getBundledDomain('yai.health')!;
    const live = await getDomain('yai.health');

    expect(bundled).toBeDefined();
    expect(live).not.toBeNull();
    expect(live!.domain).toBe(bundled.domain);

    const bundledTags = Object.keys(bundled.records);
    const liveTags = Object.keys(live!.records);
    for (const tag of bundledTags) {
      expect(liveTags).toContain(tag);
    }
  }, 15000);

  // ─── Domain List ────────────────────────────────────────────────

  it('fetches domain list from live registry', async () => {
    const result = await fetchDomainList({ tier: 'official' });

    expect(result.domains.length).toBeGreaterThan(0);
    const paths = result.domains.map((d) => d.domain);
    expect(paths).toContain('yai.health');
  }, 15000);

  it('live domain count matches bundled count', async () => {
    const bundledOfficialCount = listDomains('official').length;
    const liveList = await fetchDomainList({ tier: 'official' });

    expect(liveList.domains.length).toBeGreaterThanOrEqual(bundledOfficialCount);
  }, 15000);

  // ─── Cache Behavior ─────────────────────────────────────────────

  it('second fetch uses cache (cache hit)', async () => {
    clearDomainCache();
    resetCacheStats();

    await getDomain('yai.health');
    await getDomain('yai.health');

    const stats = getDomainCacheStats();
    expect(stats.hits).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('pinned version fetch works', async () => {
    const result = await getDomain('yai.health', { version: '1.0' });

    expect(result).not.toBeNull();
    expect(result!.domain).toBe('yai.health');
    expect(result!.version).toBe('1.0');
  }, 15000);

  // ─── All 31 Official Domains ────────────────────────────────────

  describe('Every official domain — individual fetch + validate', () => {
    const officialDomains = listDomains('official');

    for (const domainId of officialDomains) {
      it(`fetches and validates ${domainId}`, async () => {
        clearDomainCache();

        const live = await getDomain(domainId);

        // ── Must be fetchable ──
        expect(live).not.toBeNull();
        expect(live!.domain).toBe(domainId);
        expect(live!.version).toBeDefined();
        expect(typeof live!.description).toBe('string');
        expect(live!.description.length).toBeGreaterThan(0);

        // ── Must have records ──
        expect(live!.records).toBeDefined();
        expect(Object.keys(live!.records).length).toBeGreaterThan(0);

        // ── Records must match bundled T1 ──
        const bundled = getBundledDomain(domainId)!;

        const bundledTags = new Set(Object.keys(bundled.records));
        const liveTags = new Set(Object.keys(live!.records));

        // Every bundled tag should exist in live
        for (const tag of bundledTags) {
          expect(liveTags.has(tag)).toBe(true);
        }

        // Verify field-level alignment for each record
        for (const [tag, bundledRecord] of Object.entries(bundled.records)) {
          const liveRecord = live!.records[tag];
          expect(liveRecord).toBeDefined();

          // Required fields must match
          if (bundledRecord.requiredFields) {
            expect(liveRecord.requiredFields).toBeDefined();
            for (const field of bundledRecord.requiredFields) {
              expect(liveRecord.requiredFields).toContain(field);
            }
          }
        }
      }, 15000);
    }
  });

  // ─── Constraint Enforcement: Proof of Validation ────────────────

  describe('Remote schema constraint enforcement', () => {
    it('fetched yai.health VITALS: fields carry FieldConstraint (range, pattern, type)', async () => {
      const health = await getDomain('yai.health');
      expect(health).not.toBeNull();

      const vitals = health!.records['VITALS'];
      expect(vitals).toBeDefined();
      expect(vitals.fields).toBeDefined();
      expect(Object.keys(vitals.fields!).length).toBeGreaterThan(0);

      // Verify constraints are populated (not empty stubs)
      const fieldEntries = Object.entries(vitals.fields!);

      // At least some fields should have range constraints (numeric vitals)
      const fieldsWithRange = fieldEntries.filter(([, c]) => c.range !== undefined);
      expect(fieldsWithRange.length).toBeGreaterThan(0);

      // At least one field should be int or float type
      const numericFields = fieldEntries.filter(([, c]) => c.type === 'int' || c.type === 'float');
      expect(numericFields.length).toBeGreaterThan(0);

      // bp should have a pattern constraint
      const bp = vitals.fields!['bp'];
      expect(bp).toBeDefined();
      expect(bp.type).toBe('string');
      expect(bp.required).toBe(true);
      expect(bp.pattern).toBeDefined();

      // spo2 should be float with [0, 100] range (per spec: oxygen saturation %)
      const spo2 = vitals.fields!['spo2'];
      expect(spo2).toBeDefined();
      expect(spo2.type).toBe('float');
      expect(spo2.range).toEqual([0, 100]);
    }, 15000);

    it('valid VITALS passes validation with fetched schema', async () => {
      // Fetch yai.health remotely and register it (simulating T2 → T3 auto-register)
      const health = await getDomain('yai.health');
      expect(health).not.toBeNull();
      registerDomain(health!);

      const doc = parse(
        '@DOC ver=2.0 | kind=data | id=test-valid | title="Valid Vitals" | profile=decl | domain=yai.health | fmt=min\n' +
        '@VITALS rid=vs:1 | bp="120/80" | hr:int=72 | temp:float=98.6 | spo2:int=95'
      );

      const result = validate(doc, { strict: true });
      // Should pass — all values within constraints
      expect(result.valid).toBe(true);
    }, 15000);

    it('range violation detected with fetched schema', async () => {
      const health = await getDomain('yai.health');
      expect(health).not.toBeNull();
      registerDomain(health!);

      const doc = parse(
        '@DOC ver=2.0 | kind=data | id=test-range | title="Range Violation" | profile=decl | domain=yai.health | fmt=min\n' +
        '@VITALS rid=vs:1 | bp="120/80" | hr:int=72 | spo2:float=999'
      );

      const result = validate(doc, { strict: true });
      // spo2=999 exceeds range [0, 100]
      const rangeError = result.errors.find(e => e.message.includes('spo2') && e.message.includes('range'));
      expect(rangeError).toBeDefined();
    }, 15000);

    it('pattern violation detected with fetched schema', async () => {
      const health = await getDomain('yai.health');
      expect(health).not.toBeNull();
      registerDomain(health!);

      const doc = parse(
        '@DOC ver=2.0 | kind=data | id=test-pattern | title="Pattern Violation" | profile=decl | domain=yai.health | fmt=min\n' +
        '@VITALS rid=vs:1 | bp="not-a-bp"'
      );

      const result = validate(doc, { strict: true });
      // bp="not-a-bp" doesn't match pattern \d+/\d+
      const patternError = result.errors.find(e => e.message.includes('bp') && e.message.includes('pattern'));
      expect(patternError).toBeDefined();
    }, 15000);

    it('type violation detected with fetched schema', async () => {
      const health = await getDomain('yai.health');
      expect(health).not.toBeNull();
      registerDomain(health!);

      const doc = parse(
        '@DOC ver=2.0 | kind=data | id=test-type | title="Type Violation" | profile=decl | domain=yai.health | fmt=min\n' +
        '@VITALS rid=vs:1 | bp="120/80" | hr:int=abc'
      );

      const result = validate(doc, { strict: true });
      // hr:int=abc — 'abc' is not a valid int
      const typeError = result.errors.find(e => e.message.includes('hr') && e.message.includes('type'));
      expect(typeError).toBeDefined();
    }, 15000);

    it('every fetched domain carries FieldConstraint maps (not just field names)', async () => {
      const officialDomains = listDomains('official');

      for (const domainId of officialDomains) {
        const live = await getDomain(domainId);
        expect(live).not.toBeNull();

        let totalConstraints = 0;
        for (const [tag, record] of Object.entries(live!.records)) {
          if (record.fields) {
            for (const [field, constraint] of Object.entries(record.fields)) {
              // Every constraint must have type and required
              expect(constraint.type).toBeDefined();
              expect(typeof constraint.required).toBe('boolean');
              totalConstraints++;
            }
          }
        }

        // Every official domain should have at least some constraints
        expect(totalConstraints).toBeGreaterThan(0);
      }
    }, 60000);
  });
});
