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
 * Local Domain Registry — T3 runtime domain management.
 *
 * Manages in-memory domain registrations alongside bundled T1 domains.
 * Consumers can register custom domains for offline validation,
 * organization-specific schemas, and testing.
 *
 * @module
 */

import type { DomainSchema } from './types.js';
import { BUNDLED_DOMAINS } from './bundled.generated.js';
import { lookupWithFallback } from './normalize.js';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Combined registry: bundled + local domains.
 * Bundled domains are loaded at module init.
 * Local domains are added via registerDomain().
 */
const DOMAIN_REGISTRIES: Record<string, DomainSchema> = { ...BUNDLED_DOMAINS };

// ─────────────────────────────────────────────────────────────────────────────
// Registration API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a domain schema at runtime.
 *
 * Registered domains have the same performance as bundled official domains —
 * no network, instant validation, zero latency.
 *
 * @param schema - A DomainSchema object (use `loadDomainFromJSON()` to adapt from JSON)
 * @returns `true` if newly registered, `false` if it replaced an existing domain
 *
 * @example
 * ```ts
 * registerDomain({
 *   domain: 'acme.shipping',
 *   version: '1.0',
 *   status: 'active',
 *   tier: 'community',
 *   verified: false,
 *   score: 0,
 *   notice: null,
 *   description: 'Internal shipping records',
 *   records: {
 *     SHIPMENT: {
 *       description: 'Shipment tracking record',
 *       requiredFields: ['id', 'origin', 'destination'],
 *     },
 *   },
 * });
 * ```
 */
export function registerDomain(schema: DomainSchema): boolean {
  const isNew = !(schema.domain in DOMAIN_REGISTRIES);
  DOMAIN_REGISTRIES[schema.domain] = schema;
  return isNew;
}

/**
 * Unregister a previously registered domain.
 *
 * Cannot unregister official yai.* domains — they are protected.
 *
 * @param domainId - The domain ID to remove (e.g., `acme.shipping`)
 * @returns `true` if removed, `false` if not found or protected
 *
 * @example
 * ```ts
 * unregisterDomain('acme.shipping'); // true
 * unregisterDomain('yai.health');     // false — protected
 * ```
 */
export function unregisterDomain(domainId: string): boolean {
  if (domainId in BUNDLED_DOMAINS) return false;
  if (domainId in DOMAIN_REGISTRIES) {
    delete DOMAIN_REGISTRIES[domainId];
    return true;
  }
  return false;
}

/**
 * Check whether a domain is an official bundled yai.* domain.
 *
 * @param domainId - The domain ID to check
 * @returns `true` if the domain is bundled with this package
 *
 * @example
 * ```ts
 * isOfficialDomain('yai.health');    // true
 * isOfficialDomain('acme.custom');   // false
 * ```
 */
export function isOfficialDomain(domainId: string): boolean {
  return lookupWithFallback(BUNDLED_DOMAINS, domainId) !== null;
}

/**
 * List all registered domain IDs, optionally filtered.
 *
 * @param filter - `'official'` (bundled), `'local'` (user-registered), or `'all'` (default)
 * @returns Array of domain IDs
 *
 * @example
 * ```ts
 * const all = listDomains();           // all domains
 * const local = listDomains('local');   // only user-registered
 * ```
 */
export function listDomains(filter: 'official' | 'local' | 'all' = 'all'): string[] {
  if (filter === 'official') {
    return Object.keys(BUNDLED_DOMAINS);
  }
  if (filter === 'local') {
    return Object.keys(DOMAIN_REGISTRIES).filter(
      (id) => !(id in BUNDLED_DOMAINS),
    );
  }
  return Object.keys(DOMAIN_REGISTRIES);
}

/**
 * Get all allowed tags for a set of domains.
 *
 * Tag sets are additive — multiple domains combine without conflict.
 *
 * @param domains - Array of domain IDs
 * @returns Set of all tag names across the specified domains
 *
 * @example
 * ```ts
 * const tags = getDomainTags(['yai.health', 'yai.fintech']);
 * // Set { 'VITALS', 'DX', 'RX', 'TXN', 'PORTFOLIO', ... }
 * ```
 */
export function getDomainTags(domains: string[]): Set<string> {
  const tags = new Set<string>();
  for (const domainId of domains) {
    const domain = lookupWithFallback(DOMAIN_REGISTRIES, domainId);
    if (domain?.records) {
      for (const tag of Object.keys(domain.records)) {
        tags.add(tag);
      }
    }
  }
  return tags;
}

/**
 * Get a domain from the local registry (T1 + T3 only, no network).
 *
 * @param domainId - Domain path
 * @returns DomainSchema or null
 *
 * @internal Used by resolve.ts for T1/T3 lookup
 */
export function getLocalDomain(domainId: string): DomainSchema | null {
  return lookupWithFallback(DOMAIN_REGISTRIES, domainId);
}
