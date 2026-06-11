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
 * Offline Bulk Download — registry bundle for offline usage.
 *
 * Enables downloading all accessible domains from the registry
 * into a portable bundle. The bundle can be saved to disk, loaded later,
 * and applied to the local registry.
 *
 * **Access control:** The download function calls existing registry endpoints.
 * Access is enforced server-side by the registry API at domains.younndai.com.
 *
 * @module
 */

import type { DomainSchema, DomainSchemaJSON } from './types.js';
import { loadDomainFromJSON } from './adapter.js';
import { getDomain, fetchDomainList } from './client.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Portable registry bundle */
export interface RegistryBundle {
  /** Bundle format version */
  version: 1;
  /** When the bundle was created */
  createdAt: string;
  /** Total domains in bundle */
  domainCount: number;
  /** Total records across all domains */
  totalRecords: number;
  /** SHA-256 content hash for integrity */
  hash: string;
  /** Domain schemas keyed by domain path */
  domains: Record<string, DomainSchema>;
}

/** Bundle manifest (summary without full schema data) */
export interface BundleManifest {
  version: number;
  createdAt: string;
  domainCount: number;
  totalRecords: number;
  hash: string;
  domainPaths: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Download all accessible domains from the registry into a bundle.
 *
 * Fetches the domain list, then fetches each domain's full schema.
 * Progress callback available for large downloads.
 *
 * @param opts - Options
 * @returns Registry bundle
 * @throws {AccessDeniedError} if tier doesn't allow bulk download
 *
 * @example
 * ```ts
 * const bundle = await downloadRegistryBundle({
 *   onProgress: (current, total) => {
 *     console.log(`${current}/${total} domains downloaded`);
 *   },
 * });
 * console.log(`Downloaded ${bundle.domainCount} domains`);
 * ```
 */
export async function downloadRegistryBundle(opts?: {
  /** Filter by tier */
  tier?: string;
  /** Progress callback: (current, total) */
  onProgress?: (current: number, total: number) => void;
}): Promise<RegistryBundle> {
  // Step 1: Get domain list
  const list = await fetchDomainList({
    tier: opts?.tier,
    limit: 1000,
  });

  const domainPaths = list.domains.map((d) => d.domain);

  // Step 2: Fetch each domain's full schema
  const domains: Record<string, DomainSchema> = {};
  let totalRecords = 0;

  for (let i = 0; i < domainPaths.length; i++) {
    const path = domainPaths[i]!;
    const schema = await getDomain(path, { include: 'schema' });

    if (schema) {
      domains[path] = schema;
      totalRecords += Object.keys(schema.records).length;
    }

    opts?.onProgress?.(i + 1, domainPaths.length);
  }

  // Step 3: Build bundle
  const bundle: RegistryBundle = {
    version: 1,
    createdAt: new Date().toISOString(),
    domainCount: Object.keys(domains).length,
    totalRecords,
    hash: await _computeHash(JSON.stringify(domains)),
    domains,
  };

  return bundle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save / Load
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialize a bundle to a JSON string for storage.
 *
 * @param bundle - Registry bundle
 * @returns JSON string
 *
 * @example
 * ```ts
 * const json = serializeBundle(bundle);
 * fs.writeFileSync('domains-bundle.json', json);
 * ```
 */
export function serializeBundle(bundle: RegistryBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Deserialize a bundle from a JSON string.
 *
 * @param json - JSON string (from serializeBundle or file)
 * @returns Registry bundle
 *
 * @example
 * ```ts
 * const json = fs.readFileSync('domains-bundle.json', 'utf8');
 * const bundle = deserializeBundle(json);
 * ```
 */
export function deserializeBundle(json: string): RegistryBundle {
  const data = JSON.parse(json) as RegistryBundle;

  if (data.version !== 1) {
    throw new Error(`Unknown bundle version: ${data.version}`);
  }

  return data;
}

/**
 * Load a bundle from a raw JSON array of domain schemas.
 *
 * Useful when loading yon-spec JSON files directly.
 *
 * @param schemas - Array of raw DomainSchemaJSON objects
 * @returns Registry bundle
 */
export async function loadBundleFromJSON(
  schemas: DomainSchemaJSON[],
): Promise<RegistryBundle> {
  const domains: Record<string, DomainSchema> = {};
  let totalRecords = 0;

  for (const json of schemas) {
    const schema = loadDomainFromJSON(json);
    domains[schema.domain] = schema;
    totalRecords += Object.keys(schema.records).length;
  }

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    domainCount: Object.keys(domains).length,
    totalRecords,
    hash: await _computeHash(JSON.stringify(domains)),
    domains,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a bundle — register all its domains locally (T3).
 *
 * After applying, all bundle domains are available offline
 * for validation, introspection, and JSON Schema export.
 *
 * @param bundle - Registry bundle
 * @param registerFn - Registration function (defaults to registerDomain)
 * @returns Number of domains registered
 *
 * @example
 * ```ts
 * import { applyBundle, registerDomain } from '@younndai/domains';
 *
 * const count = applyBundle(bundle, registerDomain);
 * console.log(`Registered ${count} domains for offline use`);
 * ```
 */
export function applyBundle(
  bundle: RegistryBundle,
  registerFn: (schema: DomainSchema) => boolean,
): number {
  let count = 0;
  for (const schema of Object.values(bundle.domains)) {
    registerFn(schema);
    count++;
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a lightweight manifest from a bundle.
 *
 * Useful for comparing bundles, checking freshness, or displaying
 * summary info without loading the full schema data.
 *
 * @param bundle - Registry bundle
 * @returns Bundle manifest (no schema data)
 *
 * @example
 * ```ts
 * const manifest = getBundleManifest(bundle);
 * console.log(`Bundle: ${manifest.domainCount} domains, created ${manifest.createdAt}`);
 * ```
 */
export function getBundleManifest(bundle: RegistryBundle): BundleManifest {
  return {
    version: bundle.version,
    createdAt: bundle.createdAt,
    domainCount: bundle.domainCount,
    totalRecords: bundle.totalRecords,
    hash: bundle.hash,
    domainPaths: Object.keys(bundle.domains),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal
// ─────────────────────────────────────────────────────────────────────────────

/** Compute SHA-256 hash — uses Web Crypto API (universal) */
async function _computeHash(content: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: simple string hash for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
