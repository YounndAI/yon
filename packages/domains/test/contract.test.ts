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

// packages/yai-domains/test/contract.test.ts

/**
 * Contract Shape Tests
 *
 * Validates that the SDK public types match the shapes
 * the API routes are expected to return.
 *
 * These are compile-time + runtime shape tests — they ensure
 * the TypeScript types accurately describe the API contract.
 */

import { describe, it, expect } from 'vitest';
import type {
  RegistryStats,
  Notice,
  Announcement,
  Namespace,
  DomainMetadataLink,
  DomainSchema,
  DomainSchemaJSON,
} from '../src/index.js';
import { loadDomainFromJSON } from '../src/adapter.js';
import { listBundledDomains } from '../src/bundled.js';

// Derived from the bundled domain registry so adding a yai.* domain
// does not require updating contract fixtures.
const OFFICIAL_DOMAIN_COUNT = listBundledDomains().length;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Assert that a value satisfies a type at compile time */
function assertType<T>(_value: T): void {
  // No-op: compile-time only
}

/** Return the keys of an object, sorted for deterministic comparison */
function sortedKeys(obj: object): string[] {
  return Object.keys(obj).sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// RegistryStats
// ─────────────────────────────────────────────────────────────────────────────

describe('RegistryStats contract', () => {
  const validStats: RegistryStats = {
    totalDomains: 31,
    totalRecords: 450,
    totalFields: 2100,
    byTier: { official: 31, community: 0 },
  };

  it('has exactly 4 required fields', () => {
    assertType<RegistryStats>(validStats);
    expect(sortedKeys(validStats)).toEqual([
      'byTier',
      'totalDomains',
      'totalFields',
      'totalRecords',
    ]);
  });

  it('byTier is a Record<string, number>', () => {
    expect(typeof validStats.byTier).toBe('object');
    expect(typeof validStats.byTier['official']).toBe('number');
  });

  it('does NOT include tierCounts or verifiedCount', () => {
    const raw = validStats as unknown as Record<string, unknown>;
    expect(raw).not.toHaveProperty('tierCounts');
    expect(raw).not.toHaveProperty('verifiedCount');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Notice
// ─────────────────────────────────────────────────────────────────────────────

describe('Notice contract', () => {
  const validNotice: Notice = {
    code: 'N001',
    scope: 'domain',
    target: 'yai.health',
    message: 'Test notice',
    severity: 'info',
  };

  it('has exactly 5 required fields', () => {
    assertType<Notice>(validNotice);
    expect(sortedKeys(validNotice)).toEqual([
      'code',
      'message',
      'scope',
      'severity',
      'target',
    ]);
  });

  it('uses "target" not "targetPath"', () => {
    expect(validNotice).toHaveProperty('target');
    expect(validNotice).not.toHaveProperty('targetPath');
  });

  it('does NOT include id or timestamps', () => {
    const raw = validNotice as unknown as Record<string, unknown>;
    expect(raw).not.toHaveProperty('id');
    expect(raw).not.toHaveProperty('expiresAt');
    expect(raw).not.toHaveProperty('createdAt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Announcement
// ─────────────────────────────────────────────────────────────────────────────

describe('Announcement contract', () => {
  const validAnnouncement: Announcement = {
    id: '123',
    title: 'New domain released',
    content: 'yai.health is now available',
    type: 'release',
    publishedAt: '2026-03-01T00:00:00Z',
  };

  it('has 5 required fields + 1 optional', () => {
    assertType<Announcement>(validAnnouncement);
    const keys = sortedKeys(validAnnouncement);
    expect(keys).toEqual(['content', 'id', 'publishedAt', 'title', 'type']);
  });

  it('audience is optional', () => {
    const withAudience: Announcement = { ...validAnnouncement, audience: 'all' };
    assertType<Announcement>(withAudience);
    expect(withAudience.audience).toBe('all');
  });

  it('does NOT include isBanner, targetPath, or timestamps', () => {
    const raw = validAnnouncement as unknown as Record<string, unknown>;
    expect(raw).not.toHaveProperty('isBanner');
    expect(raw).not.toHaveProperty('targetPath');
    expect(raw).not.toHaveProperty('expiresAt');
    expect(raw).not.toHaveProperty('createdAt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Namespace
// ─────────────────────────────────────────────────────────────────────────────

describe('Namespace contract', () => {
  const validNamespace: Namespace = {
    path: 'yai',
    type: 'official',
    state: 'active',
  };

  it('has 3 required fields', () => {
    assertType<Namespace>(validNamespace);
    expect(validNamespace.path).toBe('yai');
    expect(validNamespace.type).toBe('official');
    expect(validNamespace.state).toBe('active');
  });

  it('owner is optional', () => {
    const withOwner: Namespace = {
      ...validNamespace,
      owner: { name: 'YounndAI' },
    };
    assertType<Namespace>(withOwner);
    expect(withOwner.owner?.name).toBe('YounndAI');
  });

  it('domainCount is optional', () => {
    const withCount: Namespace = {
      ...validNamespace,
      domainCount: OFFICIAL_DOMAIN_COUNT,
    };
    expect(withCount.domainCount).toBe(OFFICIAL_DOMAIN_COUNT);
  });

  it('does NOT include internal DB fields', () => {
    const raw = validNamespace as unknown as Record<string, unknown>;
    expect(raw).not.toHaveProperty('institutionalExemption');
    expect(raw).not.toHaveProperty('ownerId');
    expect(raw).not.toHaveProperty('stripeSubscriptionId');
    expect(raw).not.toHaveProperty('createdAt');
    expect(raw).not.toHaveProperty('updatedAt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DomainMetadataLink
// ─────────────────────────────────────────────────────────────────────────────

describe('DomainMetadataLink contract', () => {
  it('type enum includes tool and guide', () => {
    const toolLink: DomainMetadataLink = {
      label: 'Validation Tool',
      url: 'https://example.com/tool',
      type: 'tool',
    };
    const guideLink: DomainMetadataLink = {
      label: 'Usage Guide',
      url: 'https://example.com/guide',
      type: 'guide',
    };
    assertType<DomainMetadataLink>(toolLink);
    assertType<DomainMetadataLink>(guideLink);
    expect(toolLink.type).toBe('tool');
    expect(guideLink.type).toBe('guide');
  });

  it('supports all valid type values', () => {
    const types: DomainMetadataLink['type'][] = [
      'standard',
      'reference',
      'tool',
      'guide',
      'community',
    ];
    expect(types).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DomainSchemaJSON → loadDomainFromJSON roundtrip
// ─────────────────────────────────────────────────────────────────────────────

describe('DomainSchemaJSON → DomainSchema roundtrip', () => {
  const domainJSON: DomainSchemaJSON = {
    domain: 'test.example',
    version: '1.0',
    status: 'active',
    tier: 'community',
    verified: false,
    score: 0,
    notice: null,
    description: 'Test domain for contract validation',
    records: [
      {
        tag: 'VITALS',
        description: 'Vital signs',
        fields: [
          { name: 'heart_rate', type: 'int', required: true },
          { name: 'notes', type: 'string', required: false },
        ],
      },
    ],
  };

  it('loadDomainFromJSON produces valid DomainSchema', () => {
    const schema: DomainSchema = loadDomainFromJSON(domainJSON);
    expect(schema.domain).toBe('test.example');
    expect(schema.version).toBe('1.0');
    expect(schema.status).toBe('active');
    expect(schema.tier).toBe('community');
  });

  it('converts records array to Record map keyed by tag', () => {
    const schema = loadDomainFromJSON(domainJSON);
    expect(schema.records).toHaveProperty('VITALS');
    expect(schema.records['VITALS'].description).toBe('Vital signs');
    expect(Object.keys(schema.records['VITALS'].fields ?? {})).toHaveLength(2);
  });

  it('domain field uses "domain" not "path"', () => {
    const schema = loadDomainFromJSON(domainJSON);
    expect(schema).toHaveProperty('domain');
    expect(schema).not.toHaveProperty('path');
  });
});
