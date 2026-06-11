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
 * Domain ID Normalization — shared helpers for yai.* prefix handling.
 *
 * Extracts the commonly duplicated normalization + fallback lookup
 * pattern used across bundled.ts, registry.ts.
 *
 * @module
 */

/**
 * Normalize a domain ID by ensuring `yai.` prefix for shorthand IDs.
 *
 * @param domainId - Raw domain ID (e.g., `health` or `yai.health`)
 * @returns Normalized domain ID (e.g., `yai.health`)
 *
 * @example
 * ```ts
 * normalizeDomainId('health');      // 'yai.health'
 * normalizeDomainId('yai.health');   // 'yai.health'
 * normalizeDomainId('acme.custom'); // 'yai.acme.custom'
 * ```
 */
export function normalizeDomainId(domainId: string): string {
  return domainId.startsWith('yai.') ? domainId : `yai.${domainId}`;
}

/**
 * Look up a domain in a registry, trying normalized ID first, original as fallback.
 *
 * This preserves the existing two-pass lookup semantics:
 * 1. Try `yai.{domainId}` (or `domainId` if already prefixed)
 * 2. Fall back to the original `domainId` as-is
 *
 * @param registry - The registry map to search
 * @param domainId - Raw domain ID
 * @returns The found value, or `null` if neither lookup hits
 *
 * @example
 * ```ts
 * lookupWithFallback(BUNDLED_DOMAINS, 'health');     // finds yai.health
 * lookupWithFallback(BUNDLED_DOMAINS, 'yai.health');  // finds yai.health
 * lookupWithFallback(BUNDLED_DOMAINS, 'acme.custom'); // null
 * ```
 */
export function lookupWithFallback<T>(
  registry: Record<string, T>,
  domainId: string,
): T | null {
  const normalized = normalizeDomainId(domainId);
  return registry[normalized] ?? registry[domainId] ?? null;
}
