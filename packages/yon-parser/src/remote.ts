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
 * Remote domain client — convenience re-exports from @younndai/domains.
 *
 * These re-exports let YON parser consumers access the remote registry
 * client without adding a separate dependency. If you only need registry
 * access WITHOUT YON parsing, import from `@younndai/domains` directly.
 *
 * @module
 */

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export {
  getDomain,
  fetchDomainList,
  setRegistryUrl,
  getRegistryUrl,
  configureClient,
  setCacheAdapter,
  clearDomainCache,
  getDomainCacheStats,
  resetCacheStats,
} from '@younndai/domains';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export type {
  CacheAdapter,
  CacheEntry,
  CacheStats,
  ClientConfig,
} from '@younndai/domains';
