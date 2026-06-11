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
 * Domain Registration API Tests
 *
 * Tests the T3 (Local) domain registration API:
 * - registerDomain() — adds custom schemas alongside official ones
 * - unregisterDomain() — removes local schemas (official protected)
 * - isOfficialDomain() — distinguishes bundled from local
 * - listDomains() — filtered listing (official / local / all)
 */

import { describe, it, expect, afterEach } from 'vitest';
import {
  getLocalDomain,
  getBundledDomain,
  registerDomain,
  unregisterDomain,
  isOfficialDomain,
  listDomains,
  listBundledDomains,
  loadDomainFromJSON,
  type DomainSchema,
} from '../src/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixture — a custom domain
// ─────────────────────────────────────────────────────────────────────────────

const ACME_SHIPPING: DomainSchema = {
  domain: 'acme.shipping',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0.5,
  notice: null,
  description: 'Internal shipping records for ACME Corp',
  records: {
    SHIPMENT: {
      description: 'Shipment tracking record',
      requiredFields: ['id', 'origin', 'destination'],
      optionalFields: ['carrier', 'eta', 'weight'],
      typedFields: { eta: 'ts', weight: 'float' },
    },
    CONTAINER: {
      description: 'Container manifest',
      requiredFields: ['container_id'],
      optionalFields: ['seal', 'contents'],
    },
  },
};

const ACME_WAREHOUSE: DomainSchema = {
  domain: 'acme.warehouse',
  version: '1.0',
  status: 'active',
  tier: 'community',
  verified: false,
  score: 0.5,
  notice: null,
  description: 'Warehouse management for ACME Corp',
  records: {
    BIN: {
      description: 'Storage bin',
      requiredFields: ['bin_id'],
      optionalFields: ['zone', 'capacity'],
      typedFields: { capacity: 'int' },
    },
  },
};

// Cleanup after each test to avoid cross-contamination
afterEach(() => {
  unregisterDomain('acme.shipping');
  unregisterDomain('acme.warehouse');
});

// ─────────────────────────────────────────────────────────────────────────────
// registerDomain()
// ─────────────────────────────────────────────────────────────────────────────

describe('registerDomain()', () => {
  it('registers a new domain and returns true', () => {
    expect(registerDomain(ACME_SHIPPING)).toBe(true);
    expect(getLocalDomain('acme.shipping')).not.toBeNull();
    expect(getLocalDomain('acme.shipping')!.domain).toBe('acme.shipping');
  });

  it('returns false when replacing an existing domain', () => {
    registerDomain(ACME_SHIPPING);
    const updated = { ...ACME_SHIPPING, description: 'Updated' };
    expect(registerDomain(updated)).toBe(false);
    expect(getLocalDomain('acme.shipping')!.description).toBe('Updated');
  });

  it('registered domain records are accessible', () => {
    registerDomain(ACME_SHIPPING);
    const reg = getLocalDomain('acme.shipping')!;
    expect(Object.keys(reg.records)).toEqual(['SHIPMENT', 'CONTAINER']);
    expect(reg.records.SHIPMENT.requiredFields).toContain('origin');
    expect(reg.records.SHIPMENT.typedFields?.eta).toBe('ts');
  });

  it('can register multiple domains', () => {
    registerDomain(ACME_SHIPPING);
    registerDomain(ACME_WAREHOUSE);
    expect(getLocalDomain('acme.shipping')).not.toBeNull();
    expect(getLocalDomain('acme.warehouse')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// unregisterDomain()
// ─────────────────────────────────────────────────────────────────────────────

describe('unregisterDomain()', () => {
  it('removes a locally registered domain', () => {
    registerDomain(ACME_SHIPPING);
    expect(unregisterDomain('acme.shipping')).toBe(true);
    expect(getLocalDomain('acme.shipping')).toBeNull();
  });

  it('returns false for non-existent domain', () => {
    expect(unregisterDomain('acme.nonexistent')).toBe(false);
  });

  it('protects official yai.* domains from removal', () => {
    expect(unregisterDomain('yai.fintech')).toBe(false);
    expect(getLocalDomain('yai.fintech')).not.toBeNull();
  });

  it('protects all bundled official domains from removal', () => {
    for (const domainId of listBundledDomains()) {
      if (isOfficialDomain(domainId)) {
        expect(unregisterDomain(domainId)).toBe(false);
        expect(getLocalDomain(domainId)).not.toBeNull();
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isOfficialDomain()
// ─────────────────────────────────────────────────────────────────────────────

describe('isOfficialDomain()', () => {
  it('identifies official yai.* domains', () => {
    expect(isOfficialDomain('yai.fintech')).toBe(true);
    expect(isOfficialDomain('yai.health')).toBe(true);
    expect(isOfficialDomain('yai.maritime')).toBe(true);
  });

  it('rejects non-official domains', () => {
    expect(isOfficialDomain('acme.shipping')).toBe(false);
    expect(isOfficialDomain('custom.foo')).toBe(false);
  });

  it('rejects locally registered domains', () => {
    registerDomain(ACME_SHIPPING);
    expect(isOfficialDomain('acme.shipping')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listDomains()
// ─────────────────────────────────────────────────────────────────────────────

describe('listDomains()', () => {
  // Derive expected official count from the bundled registry so adding
  // a yai.* domain does not require updating these tests.
  const officialCount = () => listBundledDomains().length;

  it('lists all domains by default', () => {
    const all = listDomains();
    expect(all.length).toBe(officialCount());
    expect(all).toContain('yai.fintech');
  });

  it('lists official domains', () => {
    const official = listDomains('official');
    expect(official.length).toBe(officialCount());
    expect(official.every((d) => d.startsWith('yai.'))).toBe(true);
  });

  it('lists local domains (empty when none registered)', () => {
    expect(listDomains('local')).toEqual([]);
  });

  it('includes local domains after registration', () => {
    registerDomain(ACME_SHIPPING);
    registerDomain(ACME_WAREHOUSE);

    const all = listDomains();
    // Two locals registered above. Expected total = officials + 2.
    expect(all.length).toBe(officialCount() + 2);

    const local = listDomains('local');
    expect(local).toEqual(['acme.shipping', 'acme.warehouse']);

    const official = listDomains('official');
    expect(official.length).toBe(officialCount());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loadDomainFromJSON() → registerDomain() pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('loadDomainFromJSON + registerDomain pipeline', () => {
  it('loads and registers a JSON schema', () => {
    const json = {
      domain: 'test.pipeline',
      version: '1.0',
      status: 'active' as const,
      tier: 'community' as const,
      verified: false,
      score: 0.5,
      notice: null,
      description: 'Test pipeline domain',
      records: [
        {
          tag: 'WIDGET',
          description: 'A widget record',
          fields: [
            { name: 'id', type: 'string' as const, required: true },
            { name: 'price', type: 'float' as const, required: false },
            { name: 'active', type: 'bool' as const, required: false },
          ],
        },
      ],
    };

    const registry = loadDomainFromJSON(json);
    registerDomain(registry);

    expect(getLocalDomain('test.pipeline')).not.toBeNull();
    expect(getLocalDomain('test.pipeline')!.records.WIDGET.requiredFields).toEqual(['id']);
    expect(getLocalDomain('test.pipeline')!.records.WIDGET.optionalFields).toEqual([
      'price',
      'active',
    ]);
    expect(getLocalDomain('test.pipeline')!.records.WIDGET.typedFields).toEqual({
      price: 'float',
      active: 'bool',
    });

    // Cleanup
    unregisterDomain('test.pipeline');
  });
});
