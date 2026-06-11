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
 * Domain types and registration — convenience re-exports from @younndai/domains.
 *
 * These re-exports let YON parser consumers access domain APIs without
 * adding a separate dependency. If you only need domain functionality
 * (validation, introspection, registry) WITHOUT YON parsing, import
 * from `@younndai/domains` directly instead.
 *
 * @module
 */

// ── Types (shared vocabulary — NOT deprecated) ──────────────────────────────
export type {
  DomainSchema,
  DomainRecord,
  DomainSchemaJSON,
  DomainStatus,
  DomainTier,
  NoticeCode,
  FieldConstraint,
} from '@younndai/domains';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export {
  getBundledDomain,
  listBundledDomains,
  isBundledDomain,
} from '@younndai/domains';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export {
  registerDomain,
  unregisterDomain,
  isOfficialDomain,
  listDomains,
  getDomainTags,
  getLocalDomain,
} from '@younndai/domains';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export { loadDomainFromJSON } from '@younndai/domains';

/** @deprecated Import from `@younndai/domains` directly. Will be removed in v1.0. */
export { resolveDomain } from '@younndai/domains';
