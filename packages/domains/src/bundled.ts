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
 * Bundled domain access — official yai.* domains from package-owned schemas.
 *
 * These domains are compiled from domains/yai at build time and
 * available instantly, offline, with zero network.
 *
 * @module
 */

import type { DomainSchema } from './types.js';
import { BUNDLED_DOMAINS } from './bundled.generated.js';
import { lookupWithFallback } from './normalize.js';

/**
 * Get a bundled official domain by its ID.
 *
 * @param domainId - Fully qualified domain path (e.g., `yai.health`)
 * @returns The DomainSchema, or `null` if not a bundled domain
 *
 * @example
 * ```ts
 * const health = getBundledDomain('yai.health');
 * if (health) {
 *   console.log(health.records); // { VITALS: {...}, DX: {...}, ... }
 * }
 * ```
 */
export function getBundledDomain(domainId: string): DomainSchema | null {
  return lookupWithFallback(BUNDLED_DOMAINS, domainId);
}

/**
 * List all bundled domain IDs.
 *
 * @returns Array of fully qualified domain paths
 *
 * @example
 * ```ts
 * const ids = listBundledDomains();
 * // ['yai.health', 'yai.fintech', 'yai.hr', ...]
 * console.log(`${ids.length} bundled domains`);
 * ```
 */
export function listBundledDomains(): string[] {
  return Object.keys(BUNDLED_DOMAINS);
}

/**
 * Check whether a domain ID is a bundled official domain.
 *
 * @param domainId - Fully qualified domain path
 * @returns `true` if the domain is bundled with this package
 *
 * @example
 * ```ts
 * isBundledDomain('yai.health');    // true
 * isBundledDomain('acme.custom');   // false
 * ```
 */
export function isBundledDomain(domainId: string): boolean {
  return lookupWithFallback(BUNDLED_DOMAINS, domainId) !== null;
}
