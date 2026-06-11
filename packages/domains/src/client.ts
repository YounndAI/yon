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
 * Registry Client — all remote API methods for @younndai/domains.
 *
 * 10 domain-fetching methods + 1 health check + 4 configuration helpers.
 * Each method uses the shared cache, deduplication, and graceful degradation.
 *
 * Per schema-format.md §Registry API:
 * - Bundled (T1): Official yai.* schemas ship with the package — never network.
 * - Cached  (T2): Previously fetched schemas stored locally with TTL.
 * - Live    (T2): Fetched from registry API on demand.
 * - Local   (T3): User-registered schemas via registerDomain().
 *
 * @module
 */

import type {
  DomainSchema,
  DomainSchemaJSON,
  DomainVersion,
  RegistryStats,
  Notice,
  Announcement,
  Namespace,
  ClientConfig,
  RegistryHealthResult,
  DomainStatus,
  DomainTier,
  NoticeCode,
} from './types.js';
import { loadDomainFromJSON } from './adapter.js';
import {
  AccessDeniedError,
} from './errors.js';
import {
  type CacheAdapter,
  type CacheEntry,
  type CacheStats,
  MemoryCache,
  LATEST_TTL_MS,
  LIST_TTL_MS,
  PINNED_TTL,
} from './cache.js';
import { VERSION } from './version.js';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_REGISTRY_URL = 'https://domains.younndai.com';

let registryUrl = DEFAULT_REGISTRY_URL;
let cache: CacheAdapter = new MemoryCache();
let warnCallback: (message: string) => void = (msg) => {
  if (typeof console !== 'undefined') console.warn(`[@younndai/domains] ${msg}`);
};
let timeoutMs = 10_000;

const stats: CacheStats = {
  entries: 0,
  hits: 0,
  misses: 0,
  revalidations: 0,
  errors: 0,
};

/** In-flight request deduplication */
const inflight = new Map<string, Promise<unknown>>();

// ─────────────────────────────────────────────────────────────────────────────
// Configuration API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configure the registry client.
 *
 * Call once at application init, or not at all for sensible defaults.
 *
 * @param config - Configuration options
 *
 * @example
 * ```ts
 * configureClient({
 *   registryUrl: 'https://domains-staging.younndai.com',
 *   timeout: 5000,
 *   onWarn: (msg) => logger.warn(msg),
 * });
 * ```
 */
export function configureClient(config: ClientConfig): void {
  if (config.registryUrl) setRegistryUrl(config.registryUrl);
  if (config.timeout) timeoutMs = config.timeout;
  if (config.onWarn) warnCallback = config.onWarn;
}

/**
 * Set the registry base URL.
 *
 * @param url - Registry URL (default: `https://domains.younndai.com`)
 *
 * @example
 * ```ts
 * setRegistryUrl('https://domains-staging.younndai.com');
 * ```
 */
export function setRegistryUrl(url: string): void {
  registryUrl = url.replace(/\/$/, '');
}

/**
 * Get the current registry base URL.
 *
 * @returns The registry URL (default: `https://domains.younndai.com`)
 *
 * @example
 * ```ts
 * const url = getRegistryUrl();
 * // → 'https://domains.younndai.com'
 * ```
 */
export function getRegistryUrl(): string {
  return registryUrl;
}

/**
 * Replace the cache adapter (for Redis, IndexedDB, filesystem, etc.)
 *
 * @param adapter - A CacheAdapter implementation
 *
 * @example
 * ```ts
 * import { setCacheAdapter, type CacheAdapter } from '@younndai/domains';
 *
 * const redisAdapter: CacheAdapter = { ... };
 * setCacheAdapter(redisAdapter);
 * ```
 */
export function setCacheAdapter(adapter: CacheAdapter): void {
  cache = adapter;
}

/**
 * Clear all cached domain data.
 *
 * Does not affect bundled T1 or locally registered T3 domains.
 *
 * @example
 * ```ts
 * clearDomainCache();
 * ```
 */
export function clearDomainCache(): void {
  cache.clear();
  stats.entries = 0;
}

/**
 * Get cache statistics for diagnostics and monitoring.
 *
 * @returns Cache stats snapshot
 *
 * @example
 * ```ts
 * const stats = getDomainCacheStats();
 * console.log(`Hit rate: ${(stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)}%`);
 * ```
 */
export function getDomainCacheStats(): CacheStats {
  return { ...stats, entries: cache.size() };
}

/**
 * Reset cache statistics counters.
 *
 * Zeros out hits, misses, revalidations, and errors.
 * Entry count is unaffected (reflects actual cache contents).
 *
 * @example
 * ```ts
 * resetCacheStats();
 * // stats.hits === 0, stats.misses === 0, ...
 * ```
 */
export function resetCacheStats(): void {
  stats.hits = 0;
  stats.misses = 0;
  stats.revalidations = 0;
  stats.errors = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Fetch Helper
// ─────────────────────────────────────────────────────────────────────────────

/** Internal: fetch with timeout, user-agent, and error mapping */
async function _fetch(url: string, opts?: {
  etag?: string | null;
}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': `@younndai/domains/${VERSION}`,
  };

  if (opts?.etag) {
    headers['If-None-Match'] = opts.etag;
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    // Map HTTP error codes to typed errors
    if (response.status === 403) {
      throw new AccessDeniedError();
    }

    return response;
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof AccessDeniedError) throw error;
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Methods (6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single domain schema from the registry.
 *
 * Resolution: cache (if valid) → network → stale cache → error.
 *
 * @param domainId - Domain path (e.g., `yai.health`)
 * @param opts - Optional version pinning and include mode
 * @returns DomainSchema or null if not found / unreachable
 * @throws {AccessDeniedError} if the registry returns 403
 *
 * @example
 * ```ts
 * const schema = await getDomain('yai.health');
 * console.log(schema?.records); // { VITALS: {...}, DX: {...}, ... }
 * ```
 */
export async function getDomain(
  domainId: string,
  opts?: { version?: string; include?: 'schema' | 'metadata' | 'registry' | 'all' },
): Promise<DomainSchema | null> {
  const version = opts?.version;
  const cacheKey = version ? `domain:${domainId}@${version}` : `domain:${domainId}`;

  // ── Check cache ──
  const cached = cache.get<DomainSchema>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    stats.hits++;
    return cached.data;
  }

  // ── Deduplicate concurrent requests ──
  const existing = inflight.get(cacheKey);
  if (existing) {
    stats.hits++;
    return existing as Promise<DomainSchema | null>;
  }

  const promise = _getDomainImpl(domainId, version, opts?.include, cacheKey, cached ?? null);
  inflight.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    inflight.delete(cacheKey);
  }
}

/** Internal implementation for getDomain */
async function _getDomainImpl(
  domainId: string,
  version: string | undefined,
  include: string | undefined,
  cacheKey: string,
  cached: CacheEntry<DomainSchema> | null,
): Promise<DomainSchema | null> {
  const params = new URLSearchParams();
  if (version) params.set('version', version);
  if (include) params.set('include', include);
  const qs = params.toString();
  const url = `${registryUrl}/api/domains/${domainId}${qs ? `?${qs}` : ''}`;

  try {
    const response = await _fetch(url, { etag: cached?.etag });

    // 304 Not Modified → reuse cached, refresh TTL
    if (response.status === 304 && cached) {
      stats.revalidations++;
      const ttl = version ? PINNED_TTL : LATEST_TTL_MS;
      cache.set(cacheKey, {
        ...cached,
        expiresAt: ttl === Infinity ? Infinity : Date.now() + ttl,
      });
      stats.entries = cache.size();
      return cached.data;
    }

    // 404 → not found
    if (response.status === 404) {
      stats.misses++;
      return null;
    }

    // Non-2xx → graceful degradation
    if (!response.ok) {
      stats.errors++;
      warnCallback(`Registry returned ${response.status} for ${domainId}`);
      return cached?.data ?? null;
    }

    // 200 OK → parse and cache
    const json = (await response.json()) as DomainSchemaJSON;
    const schema = loadDomainFromJSON(json);

    const etag = response.headers.get('etag');
    const ttl = version ? PINNED_TTL : LATEST_TTL_MS;

    cache.set(cacheKey, {
      data: schema,
      etag,
      expiresAt: ttl === Infinity ? Infinity : Date.now() + ttl,
      fetchedAt: Date.now(),
    });
    stats.entries = cache.size();
    stats.misses++;

    return schema;
  } catch (error) {
    if (error instanceof AccessDeniedError) throw error;
    stats.errors++;
    const message = error instanceof Error ? error.message : String(error);
    warnCallback(`Registry unreachable for ${domainId}: ${message}`);
    if (cached) return cached.data;
    return null;
  }
}

/**
 * Fetch multiple domain schemas efficiently.
 *
 * Parallelizes getDomain calls with request deduplication.
 * Each unique domain is fetched exactly once.
 *
 * @param domainIds - Array of domain paths
 * @returns Map of domainId → DomainSchema (nulls omitted)
 *
 * @example
 * ```ts
 * const schemas = await getDomains(['yai.health', 'yai.fintech']);
 * schemas.forEach((schema, id) => console.log(id, schema.records));
 * ```
 */
export async function getDomains(
  domainIds: string[],
): Promise<Map<string, DomainSchema>> {
  const unique = [...new Set(domainIds)];
  const results = await Promise.all(unique.map((id) => getDomain(id)));
  const map = new Map<string, DomainSchema>();
  for (let i = 0; i < unique.length; i++) {
    const result = results[i];
    if (result) map.set(unique[i]!, result);
  }
  return map;
}

/** Lean domain item from the list endpoint */
interface ListDomainItem {
  path: string;
  version: string;
  status: string;
  state?: string;
  tier: string;
  verified: boolean;
  score: number;
  notice: string | null;
  description: string;
  records?: number;
  totalFieldCount?: number;
  tagline?: string | null;
  tags?: string[];
}

/**
 * Fetch the paginated domain list from the registry.
 *
 * @param opts - Filter, sort, and pagination options
 * @returns Domain list with pagination info
 *
 * @example
 * ```ts
 * const result = await fetchDomainList({ tier: 'official', sort: 'alpha' });
 * result.domains.forEach(d => console.log(d.domain));
 * ```
 */
export async function fetchDomainList(opts?: {
  tier?: string;
  namespace?: string;
  status?: string;
  q?: string;
  sort?: 'alpha' | 'latest';
  cursor?: string;
  limit?: number;
}): Promise<{
  domains: DomainSchema[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}> {
  const params = new URLSearchParams();
  if (opts?.tier) params.set('tier', opts.tier);
  if (opts?.namespace) params.set('namespace', opts.namespace);
  if (opts?.status) params.set('status', opts.status);
  if (opts?.q) params.set('q', opts.q);
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.cursor) params.set('cursor', opts.cursor);
  if (opts?.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const cacheKey = `list:${qs || 'all'}`;

  // Cache check
  const cached = cache.get<{ domains: DomainSchema[]; nextCursor: string | null; hasMore: boolean; total: number }>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    stats.hits++;
    return cached.data;
  }

  try {
    const response = await _fetch(`${registryUrl}/api/domains${qs ? `?${qs}` : ''}`);

    if (!response.ok) {
      stats.errors++;
      warnCallback(`Registry returned ${response.status} for domain list`);
      return cached?.data ?? { domains: [], nextCursor: null, hasMore: false, total: 0 };
    }

    const json = await response.json() as {
      domains: ListDomainItem[];
      nextCursor: string | null;
      hasMore: boolean;
      total: number;
    };

    const domains: DomainSchema[] = (json.domains ?? [])
      .filter((item) => item.path && item.description)
      .map((item) => ({
        domain: item.path,
        version: item.version || '1.0',
        status: (item.status || 'active') as DomainStatus,
        tier: (item.tier || 'community') as DomainTier,
        verified: item.verified ?? false,
        score: item.score ?? 0,
        notice: (item.notice ?? null) as NoticeCode,
        description: item.description,
        records: {},
      }));

    const result = {
      domains,
      nextCursor: json.nextCursor ?? null,
      hasMore: json.hasMore ?? false,
      total: json.total ?? domains.length,
    };

    cache.set(cacheKey, {
      data: result,
      etag: response.headers.get('etag'),
      expiresAt: Date.now() + LIST_TTL_MS,
      fetchedAt: Date.now(),
    });
    stats.entries = cache.size();
    stats.misses++;

    return result;
  } catch (error) {
    if (error instanceof AccessDeniedError) throw error;
    stats.errors++;
    warnCallback(`Registry unreachable for domain list: ${error instanceof Error ? error.message : String(error)}`);
    return cached?.data ?? { domains: [], nextCursor: null, hasMore: false, total: 0 };
  }
}

/**
 * Search domains by full-text query.
 *
 * @param query - Search query (min 2 chars)
 * @returns Matching domain schemas
 *
 * @example
 * ```ts
 * const results = await searchDomains('health');
 * results.forEach(d => console.log(d.domain, d.description));
 * ```
 */
export async function searchDomains(query: string): Promise<DomainSchema[]> {
  const cacheKey = `search:${query}`;

  const cached = cache.get<DomainSchema[]>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    stats.hits++;
    return cached.data;
  }

  try {
    const response = await _fetch(`${registryUrl}/api/domains/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      stats.errors++;
      return cached?.data ?? [];
    }

    const json = await response.json() as { results: ListDomainItem[] };
    const results: DomainSchema[] = (json.results ?? []).map((item) => ({
      domain: item.path,
      version: item.version || '1.0',
      status: (item.status || 'active') as DomainStatus,
      tier: (item.tier || 'community') as DomainTier,
      verified: item.verified ?? false,
      score: item.score ?? 0,
      notice: (item.notice ?? null) as NoticeCode,
      description: item.description,
      records: {},
    }));

    cache.set(cacheKey, {
      data: results,
      etag: null,
      expiresAt: Date.now() + LIST_TTL_MS,
      fetchedAt: Date.now(),
    });
    stats.entries = cache.size();
    stats.misses++;

    return results;
  } catch (error) {
    if (error instanceof AccessDeniedError) throw error;
    stats.errors++;
    return cached?.data ?? [];
  }
}

/**
 * Get version history for a domain.
 *
 * @param domainId - Domain path (e.g., `yai.health`)
 * @returns Array of version entries
 *
 * @example
 * ```ts
 * const versions = await getDomainVersions('yai.health');
 * versions.forEach(v => console.log(`${v.version}: ${v.status}`));
 * ```
 */
export async function getDomainVersions(domainId: string): Promise<DomainVersion[]> {
  const cacheKey = `versions:${domainId}`;

  const cached = cache.get<DomainVersion[]>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    stats.hits++;
    return cached.data;
  }

  try {
    const response = await _fetch(`${registryUrl}/api/domains/${domainId}/versions`);

    if (!response.ok) {
      stats.errors++;
      return cached?.data ?? [];
    }

    const json = await response.json() as { versions: DomainVersion[] };
    const versions = json.versions ?? [];

    cache.set(cacheKey, {
      data: versions,
      etag: null,
      expiresAt: Date.now() + LIST_TTL_MS,
      fetchedAt: Date.now(),
    });
    stats.entries = cache.size();
    stats.misses++;

    return versions;
  } catch (error) {
    if (error instanceof AccessDeniedError) throw error;
    stats.errors++;
    return cached?.data ?? [];
  }
}

/**
 * Get aggregate registry statistics.
 *
 * @returns Total domains, records, fields, and per-tier breakdown
 *
 * @example
 * ```ts
 * const stats = await getRegistryStats();
 * console.log(`${stats.totalDomains} domains, ${stats.totalRecords} records`);
 * ```
 */
export async function getRegistryStats(): Promise<RegistryStats | null> {
  const cacheKey = 'stats';

  const cached = cache.get<RegistryStats>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    stats.hits++;
    return cached.data;
  }

  try {
    const response = await _fetch(`${registryUrl}/api/domains/stats`);

    if (!response.ok) {
      stats.errors++;
      return cached?.data ?? null;
    }

    const data = await response.json() as RegistryStats;

    cache.set(cacheKey, {
      data,
      etag: null,
      expiresAt: Date.now() + LIST_TTL_MS,
      fetchedAt: Date.now(),
    });
    stats.entries = cache.size();
    stats.misses++;

    return data;
  } catch (error) {
    if (error instanceof AccessDeniedError) throw error;
    stats.errors++;
    return cached?.data ?? null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Namespace Methods (2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List all namespaces from the registry.
 *
 * @param opts - Optional type filter
 * @returns Array of namespaces
 *
 * @example
 * ```ts
 * const namespaces = await listNamespaces({ type: 'official' });
 * namespaces.forEach(ns => console.log(ns.path));
 * ```
 */
export async function listNamespaces(opts?: {
  type?: string;
}): Promise<Namespace[]> {
  const params = new URLSearchParams();
  if (opts?.type) params.set('type', opts.type);
  const qs = params.toString();

  try {
    const response = await _fetch(`${registryUrl}/api/namespaces${qs ? `?${qs}` : ''}`);
    if (!response.ok) return [];
    const json = await response.json() as { namespaces: Namespace[] };
    return json.namespaces ?? [];
  } catch {
    return [];
  }
}

/**
 * Get a single namespace by path.
 *
 * @param path - Namespace path (e.g., `yai`)
 * @returns Namespace or null if not found
 *
 * @example
 * ```ts
 * const ns = await getNamespace('yai');
 * console.log(`${ns?.domainCount} domains in yai namespace`);
 * ```
 */
export async function getNamespace(path: string): Promise<Namespace | null> {
  try {
    const response = await _fetch(`${registryUrl}/api/namespaces/${path}`);
    if (!response.ok) return null;
    return await response.json() as Namespace;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Operations Methods (2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get active operational notices.
 *
 * @param opts - Optional scope and severity filters
 * @returns Array of notices
 *
 * @example
 * ```ts
 * const notices = await getNotices({ scope: 'domain', severity: 'critical' });
 * ```
 */
export async function getNotices(opts?: {
  scope?: string;
  severity?: string;
  target?: string;
}): Promise<Notice[]> {
  const params = new URLSearchParams();
  if (opts?.scope) params.set('scope', opts.scope);
  if (opts?.severity) params.set('severity', opts.severity);
  if (opts?.target) params.set('target', opts.target);
  const qs = params.toString();

  try {
    const response = await _fetch(`${registryUrl}/api/notices${qs ? `?${qs}` : ''}`);
    if (!response.ok) return [];
    const json = await response.json() as { notices: Notice[] };
    return json.notices ?? [];
  } catch {
    return [];
  }
}

/**
 * Get published announcements / news feed.
 *
 * @param opts - Optional type and audience filters
 * @returns Array of announcements
 *
 * @example
 * ```ts
 * const news = await getAnnouncements({ type: 'release' });
 * ```
 */
export async function getAnnouncements(opts?: {
  type?: string;
  audience?: string;
}): Promise<Announcement[]> {
  const params = new URLSearchParams();
  if (opts?.type) params.set('type', opts.type);
  if (opts?.audience) params.set('audience', opts.audience);
  const qs = params.toString();

  try {
    const response = await _fetch(`${registryUrl}/api/announcements${qs ? `?${qs}` : ''}`);
    if (!response.ok) return [];
    const json = await response.json() as { announcements: Announcement[] };
    return json.announcements ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Check (1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check registry health — useful for CI/CD readiness checks.
 *
 * @returns Health check result with ok status, latency, and timestamp
 *
 * @example
 * ```ts
 * const health = await checkRegistryHealth();
 * if (!health.ok) {
 *   throw new Error('Registry is unreachable');
 * }
 * console.log(`Registry latency: ${health.latencyMs}ms`);
 * ```
 */
export async function checkRegistryHealth(): Promise<RegistryHealthResult> {
  const start = Date.now();

  try {
    const response = await _fetch(`${registryUrl}/api/health`);
    const latencyMs = Date.now() - start;

    return {
      ok: response.ok,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }
}
