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
 * Reverse Tag Lookup — find all domains that define a given tag.
 *
 * Multiple domains may define the same tag (e.g., POSITION exists in
 * both yai.hr and yai.fintech). This module surfaces ALL matches and
 * lets consumers disambiguate via context.
 *
 * @module
 */

import type { DomainSchema, DomainRecord } from './types.js';
import type { TagLookupResult } from './types.js';
import { listDomains, getLocalDomain } from './registry.js';

// ─────────────────────────────────────────────────────────────────────────────
// Reverse Index
// ─────────────────────────────────────────────────────────────────────────────

/** Reverse index: tag → domain IDs */
let reverseIndex: Map<string, string[]> | null = null;

/**
 * Build (or rebuild) the reverse tag index from all bundled domains.
 *
 * Called lazily on first lookup. Can be called manually to include
 * additional domains registered via `registerDomain()`.
 *
 * @param additionalDomains - Extra domains to include in the index
 * @returns The built reverse index
 *
 * @example
 * ```ts
 * // Rebuild index after registering custom domains
 * buildTagIndex([myCustomDomain]);
 * ```
 */
export function buildTagIndex(
  additionalDomains?: DomainSchema[],
): Map<string, string[]> {
  reverseIndex = new Map<string, string[]>();

  // Index all registered domains (T1 bundled + T3 local)
  for (const domainId of listDomains()) {
    const domain = getLocalDomain(domainId);
    if (domain) _indexDomain(domain);
  }

  // Index additional domains
  if (additionalDomains) {
    for (const domain of additionalDomains) {
      _indexDomain(domain);
    }
  }

  return reverseIndex;
}

function _indexDomain(domain: DomainSchema): void {
  if (!reverseIndex) return;
  for (const tag of Object.keys(domain.records)) {
    const existing = reverseIndex.get(tag);
    if (existing) {
      if (!existing.includes(domain.domain)) {
        existing.push(domain.domain);
      }
    } else {
      reverseIndex.set(tag, [domain.domain]);
    }
  }
}

function _ensureIndex(): Map<string, string[]> {
  if (!reverseIndex) {
    return buildTagIndex();
  }
  return reverseIndex;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find all domains that define a given tag.
 *
 * Returns ALL matching domains with their record definitions.
 * Consumers disambiguate via context (e.g., `@DOC domain=`).
 *
 * @param tag - The tag to look up (e.g., `POSITION`)
 * @returns Lookup result with all matching domains
 *
 * @example
 * ```ts
 * const result = findDomainsByTag('POSITION');
 * // → {
 * //   tag: 'POSITION',
 * //   matches: [
 * //     { domainId: 'yai.hr', record: { description: 'Job position', ... } },
 * //     { domainId: 'yai.fintech', record: { description: 'Financial position', ... } },
 * //   ]
 * // }
 *
 * if (result.matches.length > 1) {
 *   // Ambiguous — pick by document's @DOC domain=, or ask the user
 *   const match = result.matches.find(m => m.domainId === doc.domain);
 * }
 * ```
 */
export function findDomainsByTag(tag: string): TagLookupResult {
  const index = _ensureIndex();
  const domainIds = index.get(tag) ?? [];

  const matches: Array<{ domainId: string; record: DomainRecord }> = [];

  for (const domainId of domainIds) {
    const domain = getLocalDomain(domainId);
    if (domain) {
      const record = domain.records[tag];
      if (record) {
        matches.push({ domainId, record });
      }
    }
  }

  return { tag, matches };
}
