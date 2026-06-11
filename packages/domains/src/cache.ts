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
 * Cache infrastructure for @younndai/domains.
 *
 * Provides a pluggable cache adapter pattern with a default
 * in-memory implementation. Supports TTL, ETag for revalidation,
 * and hit/miss/error statistics.
 *
 * @module
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Cache TTL for latest resolution (24 hours in ms) */
export const LATEST_TTL_MS = 24 * 60 * 60 * 1000;

/** Cache TTL for domain list / search (5 minutes in ms) */
export const LIST_TTL_MS = 5 * 60 * 1000;

/** Sentinel for pinned (immutable) entries — never expires */
export const PINNED_TTL = Infinity;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single cache entry with TTL and ETag for revalidation.
 *
 * @example
 * ```ts
 * const entry: CacheEntry<DomainSchema> = {
 *   data: schema,
 *   etag: '"abc123"',
 *   expiresAt: Date.now() + LATEST_TTL_MS,
 *   fetchedAt: Date.now(),
 * };
 * ```
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** ETag for revalidation (If-None-Match) */
  etag: string | null;
  /** Expiry timestamp: Date.now() + TTL, or Infinity for pinned */
  expiresAt: number;
  /** When this entry was first fetched */
  fetchedAt: number;
}

/**
 * Pluggable cache adapter for custom storage backends.
 *
 * Implement this interface to use Redis, IndexedDB, filesystem,
 * or any other storage backend.
 *
 * @example
 * ```ts
 * import { setCacheAdapter, type CacheAdapter } from '@younndai/domains';
 *
 * const redisAdapter: CacheAdapter = {
 *   get: (key) => redis.get(key),
 *   set: (key, entry) => redis.set(key, entry),
 *   delete: (key) => redis.del(key),
 *   clear: () => redis.flushdb(),
 *   size: () => redis.dbsize(),
 * };
 * setCacheAdapter(redisAdapter);
 * ```
 */
export interface CacheAdapter {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, entry: CacheEntry<T>): void;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * Cache statistics for diagnostics and monitoring.
 *
 * @example
 * ```ts
 * const stats = getDomainCacheStats();
 * console.log(`Hit rate: ${stats.hits / (stats.hits + stats.misses) * 100}%`);
 * ```
 */
export interface CacheStats {
  /** Number of entries currently cached */
  entries: number;
  /** Cache hits: served from cache without network */
  hits: number;
  /** Cache misses: required network fetch */
  misses: number;
  /** Successful ETag revalidations (304 Not Modified) */
  revalidations: number;
  /** Network errors / fetch failures */
  errors: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default In-Memory Cache
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default in-memory cache using a Map.
 * No persistence, no size limits — suitable for short-lived processes
 * and development. For production, consider a custom CacheAdapter.
 */
export class MemoryCache implements CacheAdapter {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return entry as CacheEntry<T>;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.store.set(key, entry as CacheEntry<unknown>);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
