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
 * Unified Domain Resolution — T1 → T3 → T2.
 *
 * Resolves a domain by checking tiers in order:
 * 1. T1: Bundled official yai.* domains (instant, offline)
 * 2. T3: User-registered local domains (instant, offline)
 * 3. T2: Remote registry API (network, cached)
 *
 * @module
 */

import type { DomainSchema } from './types.js';
import { getLocalDomain } from './registry.js';
import { getDomain } from './client.js';

/**
 * Resolve a domain schema by ID.
 *
 * Resolution order: T1 (Bundled) → T3 (Local) → T2 (Remote).
 * Set `offline: true` to skip T2 remote resolution.
 *
 * @param domainId - Fully qualified domain path (e.g., `yai.health`)
 * @param options - Resolution options
 * @returns DomainSchema or null if not found
 *
 * @example
 * ```ts
 * // Full resolution (includes remote)
 * const schema = await resolveDomain('yai.health');
 *
 * // Offline only (T1 + T3)
 * const schema = await resolveDomain('yai.health', { offline: true });
 *
 * // With version pinning
 * const schema = await resolveDomain('yai.health', { version: '1.0' });
 * ```
 */
export async function resolveDomain(
  domainId: string,
  options?: {
    /** Skip remote T2 resolution (offline mode) */
    offline?: boolean;
    /** Pin to a specific version */
    version?: string;
  },
): Promise<DomainSchema | null> {
  // T1 + T3: Check local registry first (bundled + user-registered)
  const local = getLocalDomain(domainId);
  if (local) return local;

  // T2: Remote resolution (if not offline)
  if (options?.offline) return null;

  return getDomain(domainId, { version: options?.version });
}
