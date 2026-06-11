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
 * Typed error classes for @younndai/domains.
 *
 * All errors extend `Error` with proper `name` property for `instanceof` support.
 *
 * @module
 */

/**
 * Thrown when the registry API returns a 404 for a domain request.
 *
 * @example
 * ```ts
 * try {
 *   const schema = await getDomain('nonexistent.domain');
 * } catch (e) {
 *   if (e instanceof DomainNotFoundError) {
 *     console.error(`Domain not found: ${e.domainId}`);
 *   }
 * }
 * ```
 */
export class DomainNotFoundError extends Error {
  readonly name = 'DomainNotFoundError' as const;

  constructor(
    /** The domain ID that was not found */
    public readonly domainId: string,
  ) {
    super(`Domain not found: ${domainId}`);
  }
}

/**
 * Thrown when the registry API is unreachable after graceful degradation is exhausted.
 *
 * This means: network failure, timeout, or 5xx response, AND no stale cache available.
 *
 * @example
 * ```ts
 * try {
 *   const list = await fetchDomainList();
 * } catch (e) {
 *   if (e instanceof RegistryUnavailableError) {
 *     console.error(`Registry down: ${e.cause}`);
 *   }
 * }
 * ```
 */
export class RegistryUnavailableError extends Error {
  readonly name = 'RegistryUnavailableError' as const;

  constructor(
    message: string,
    /** The underlying cause (network error, timeout, etc.) */
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

/**
 * Thrown when the registry API returns a 403 (access denied).
 *
 * Typically occurs when a free-tier consumer attempts a pro/enterprise operation
 * like bulk download.
 *
 * @example
 * ```ts
 * try {
 *   const bundle = await downloadRegistryBundle();
 * } catch (e) {
 *   if (e instanceof AccessDeniedError) {
 *     console.error('Upgrade your plan to access this feature');
 *   }
 * }
 * ```
 */
export class AccessDeniedError extends Error {
  readonly name = 'AccessDeniedError' as const;

  constructor(
    message: string = 'Access denied — this feature requires a higher capacity tier',
  ) {
    super(message);
  }
}
