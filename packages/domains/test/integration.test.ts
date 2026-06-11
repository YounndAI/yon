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

// packages/yai-domains/test/integration.test.ts

/**
 * Integration Tests — SDK ↔ API Endpoint Validation
 *
 * Hits the running dev server and validates that API responses
 * match the SDK type contracts. Complements the compile-time
 * contract tests in contract.test.ts.
 *
 * Run with: INTEGRATION=1 npx vitest run test/integration.test.ts
 * Requires: apps/yai-domains running on localhost:3160
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.INTEGRATION_URL || 'http://localhost:3160';

describe.skipIf(!process.env.INTEGRATION)('API endpoint contracts', () => {
  // ─── Stats ─────────────────────────────────────────────────────────
  describe('GET /api/domains/stats', () => {
    it('returns RegistryStats shape with byTier', async () => {
      const res = await fetch(`${BASE_URL}/api/domains/stats`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('totalDomains');
      expect(data).toHaveProperty('totalRecords');
      expect(data).toHaveProperty('totalFields');
      expect(data).toHaveProperty('byTier');
      expect(typeof data.byTier).toBe('object');

      // Negative: no old field names
      expect(data).not.toHaveProperty('tierCounts');
      expect(data).not.toHaveProperty('verifiedCount');
    });
  });

  // ─── Notices ───────────────────────────────────────────────────────
  describe('GET /api/notices', () => {
    it('returns Notice[] with target, not targetPath', async () => {
      const res = await fetch(`${BASE_URL}/api/notices`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('notices');
      expect(Array.isArray(data.notices)).toBe(true);

      if (data.notices.length > 0) {
        const notice = data.notices[0];
        expect(notice).toHaveProperty('code');
        expect(notice).toHaveProperty('scope');
        expect(notice).toHaveProperty('target');
        expect(notice).toHaveProperty('message');
        expect(notice).toHaveProperty('severity');

        // Negative: no internal fields
        expect(notice).not.toHaveProperty('id');
        expect(notice).not.toHaveProperty('targetPath');
        expect(notice).not.toHaveProperty('expiresAt');
        expect(notice).not.toHaveProperty('createdAt');
      }
    });
  });

  // ─── Announcements ─────────────────────────────────────────────────
  describe('GET /api/announcements', () => {
    it('returns Announcement[] without internal fields', async () => {
      const res = await fetch(`${BASE_URL}/api/announcements`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('announcements');
      expect(Array.isArray(data.announcements)).toBe(true);

      if (data.announcements.length > 0) {
        const ann = data.announcements[0];
        expect(ann).toHaveProperty('id');
        expect(ann).toHaveProperty('title');
        expect(ann).toHaveProperty('content');
        expect(ann).toHaveProperty('type');
        expect(ann).toHaveProperty('publishedAt');

        // Negative: no internal fields
        expect(ann).not.toHaveProperty('isBanner');
        expect(ann).not.toHaveProperty('targetPath');
        expect(ann).not.toHaveProperty('expiresAt');
        expect(ann).not.toHaveProperty('createdAt');
      }
    });
  });

  // ─── Namespaces List ───────────────────────────────────────────────
  describe('GET /api/namespaces', () => {
    it('returns Namespace[] with domainCount, no internal fields', async () => {
      const res = await fetch(`${BASE_URL}/api/namespaces`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('namespaces');
      expect(Array.isArray(data.namespaces)).toBe(true);
      expect(data.namespaces.length).toBeGreaterThan(0);

      const ns = data.namespaces[0];
      expect(ns).toHaveProperty('path');
      expect(ns).toHaveProperty('type');
      expect(ns).toHaveProperty('state');
      expect(ns).toHaveProperty('domainCount');
      expect(typeof ns.domainCount).toBe('number');

      // Negative: no internal fields
      expect(ns).not.toHaveProperty('institutionalExemption');
      expect(ns).not.toHaveProperty('ownerId');
      expect(ns).not.toHaveProperty('stripeSubscriptionId');
      expect(ns).not.toHaveProperty('registered');
    });
  });

  // ─── Namespace Detail ──────────────────────────────────────────────
  describe('GET /api/namespaces/yai', () => {
    it('returns namespace with domains and no leaked fields', async () => {
      const res = await fetch(`${BASE_URL}/api/namespaces/yai`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('path', 'yai');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('state');
      expect(data).toHaveProperty('domainCount');
      expect(typeof data.domainCount).toBe('number');
      expect(data).toHaveProperty('domains');
      expect(Array.isArray(data.domains)).toBe(true);

      // Negative: no leaked DB fields
      expect(data).not.toHaveProperty('institutionalExemption');
      expect(data).not.toHaveProperty('ownerId');
      expect(data).not.toHaveProperty('stripeSubscriptionId');
      expect(data).not.toHaveProperty('createdAt');
      expect(data).not.toHaveProperty('updatedAt');

      if (data.domains.length > 0) {
        const domain = data.domains[0];
        expect(domain).toHaveProperty('path');
        expect(domain).toHaveProperty('version');
        expect(domain).toHaveProperty('status');
      }
    });
  });

  // ─── Domain Detail ─────────────────────────────────────────────────
  describe('GET /api/domains/yai.health', () => {
    it('returns full domain schema', async () => {
      const res = await fetch(`${BASE_URL}/api/domains/yai.health`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('domain');
      expect(data).toHaveProperty('records');
      expect(typeof data.records).toBe('object');

      // Uses "domain" not "path"
      expect(data).not.toHaveProperty('path');
    });
  });
});
