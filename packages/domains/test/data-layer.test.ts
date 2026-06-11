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
 * Data layer integration tests — bundled, registry, resolution, lookup, normalize.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getBundledDomain, listBundledDomains, isBundledDomain } from '../src/bundled.js';
import {
  registerDomain,
  unregisterDomain,
  isOfficialDomain,
  getLocalDomain,
  listDomains,
  getDomainTags,
} from '../src/registry.js';
import { resolveDomain } from '../src/resolve.js';
import { findDomainsByTag, buildTagIndex } from '../src/lookup.js';
import { normalizeDomainId, lookupWithFallback } from '../src/normalize.js';
import type { DomainSchema } from '../src/types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CUSTOM_DOMAIN: DomainSchema = {
  domain: 'acme.shipping',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0,
  notice: null,
  description: 'Test shipping domain',
  records: {
    SHIPMENT: {
      description: 'Shipment record',
      requiredFields: ['id'],
      fields: {
        id: { type: 'string', required: true },
      },
    },
  },
};

// ── normalizeDomainId ─────────────────────────────────────────────────────────

describe('normalizeDomainId', () => {
  it('prepends yai. to shorthand IDs', () => {
    expect(normalizeDomainId('health')).toBe('yai.health');
  });

  it('preserves already-prefixed IDs', () => {
    expect(normalizeDomainId('yai.health')).toBe('yai.health');
  });

  it('prepends yai. to non-yai prefixed IDs', () => {
    expect(normalizeDomainId('acme.custom')).toBe('yai.acme.custom');
  });
});

// ── lookupWithFallback ────────────────────────────────────────────────────────

describe('lookupWithFallback', () => {
  const registry = {
    'yai.health': { value: 'health' },
    'acme.custom': { value: 'custom' },
  };

  it('finds via normalized lookup', () => {
    expect(lookupWithFallback(registry, 'health')).toEqual({ value: 'health' });
  });

  it('finds via direct key when already normalized', () => {
    expect(lookupWithFallback(registry, 'yai.health')).toEqual({ value: 'health' });
  });

  it('falls back to original ID', () => {
    expect(lookupWithFallback(registry, 'acme.custom')).toEqual({ value: 'custom' });
  });

  it('returns null when no match', () => {
    expect(lookupWithFallback(registry, 'nonexistent')).toBeNull();
  });
});

// ── Bundled Domains ───────────────────────────────────────────────────────────

describe('bundled domains', () => {
  it('getBundledDomain returns schema for yai.health', () => {
    const domain = getBundledDomain('yai.health');
    expect(domain).not.toBeNull();
    expect(domain!.domain).toBe('yai.health');
  });

  it('getBundledDomain normalizes shorthand', () => {
    const domain = getBundledDomain('health');
    expect(domain).not.toBeNull();
    expect(domain!.domain).toBe('yai.health');
  });

  it('getBundledDomain returns null for unknown', () => {
    expect(getBundledDomain('acme.nonexistent')).toBeNull();
  });

  it('isBundledDomain returns true for official domains', () => {
    expect(isBundledDomain('yai.health')).toBe(true);
    expect(isBundledDomain('health')).toBe(true);
  });

  it('isBundledDomain returns false for custom domains', () => {
    expect(isBundledDomain('acme.custom')).toBe(false);
  });

  it('listBundledDomains returns every bundled domain', () => {
    const domains = listBundledDomains();
    // Sanity: registry is populated. Count is derived elsewhere — no
    // hard-coded literal here so adding a yai.* domain does not break.
    expect(domains.length).toBeGreaterThan(0);
    expect(domains).toContain('yai.health');
  });
});

// ── Local Registry ────────────────────────────────────────────────────────────

describe('local registry', () => {
  beforeEach(() => {
    // Clean up custom domain if previously registered
    unregisterDomain('acme.shipping');
  });

  it('registerDomain returns true for new domain', () => {
    expect(registerDomain(CUSTOM_DOMAIN)).toBe(true);
    // Cleanup
    unregisterDomain('acme.shipping');
  });

  it('registerDomain returns false for override', () => {
    registerDomain(CUSTOM_DOMAIN);
    expect(registerDomain(CUSTOM_DOMAIN)).toBe(false);
    // Cleanup
    unregisterDomain('acme.shipping');
  });

  it('unregisterDomain removes custom domains', () => {
    registerDomain(CUSTOM_DOMAIN);
    expect(unregisterDomain('acme.shipping')).toBe(true);
    expect(getLocalDomain('acme.shipping')).toBeNull();
  });

  it('unregisterDomain cannot remove bundled domains', () => {
    expect(unregisterDomain('yai.health')).toBe(false);
  });

  it('isOfficialDomain distinguishes official from custom', () => {
    expect(isOfficialDomain('yai.health')).toBe(true);
    expect(isOfficialDomain('health')).toBe(true);
    expect(isOfficialDomain('acme.custom')).toBe(false);
  });

  it('getLocalDomain finds bundled domains', () => {
    const domain = getLocalDomain('yai.health');
    expect(domain).not.toBeNull();
    expect(domain!.domain).toBe('yai.health');
  });

  it('listDomains filters correctly', () => {
    registerDomain(CUSTOM_DOMAIN);
    const official = listDomains('official');
    const local = listDomains('local');
    const all = listDomains();

    // Derive expected official count from the bundled registry so adding
    // a new yai.* domain does not break this test.
    expect(official.length).toBe(listBundledDomains().length);
    expect(local).toContain('acme.shipping');
    expect(all.length).toBeGreaterThan(official.length);

    unregisterDomain('acme.shipping');
  });

  it('getDomainTags combines tags across domains', () => {
    const tags = getDomainTags(['yai.health']);
    expect(tags.size).toBeGreaterThan(0);
    expect(tags).toBeInstanceOf(Set);
  });
});

// ── Resolution ────────────────────────────────────────────────────────────────

describe('resolveDomain', () => {
  it('resolves bundled domain offline', async () => {
    const domain = await resolveDomain('yai.health', { offline: true });
    expect(domain).not.toBeNull();
    expect(domain!.domain).toBe('yai.health');
  });

  it('returns null for unknown domain offline', async () => {
    const domain = await resolveDomain('nonexistent.domain', { offline: true });
    expect(domain).toBeNull();
  });
});

// ── Reverse Lookup ────────────────────────────────────────────────────────────

describe('findDomainsByTag', () => {
  it('finds domains defining a known tag', () => {
    buildTagIndex(); // Rebuild fresh
    const health = getBundledDomain('yai.health');
    if (!health) return; // Skip if no bundled domains

    const firstTag = Object.keys(health.records)[0]!;
    const result = findDomainsByTag(firstTag);
    expect(result.tag).toBe(firstTag);
    expect(result.matches.length).toBeGreaterThanOrEqual(1);
    expect(result.matches[0]!.domainId).toBe('yai.health');
  });

  it('returns empty matches for unknown tag', () => {
    buildTagIndex();
    const result = findDomainsByTag('NONEXISTENT_TAG_12345');
    expect(result.matches).toHaveLength(0);
  });
});
