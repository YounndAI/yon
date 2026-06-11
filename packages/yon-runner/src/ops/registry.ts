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
 * YON Runner — Op Registry
 *
 * Op handler registration, version resolution, and plugin support.
 * Implements Runner Spec §4.1–4.3.
 */

import type { OpHandler, OpPlugin } from "../types.js";

// ---------------------------------------------------------------------------
// Op Registry
// ---------------------------------------------------------------------------

export class OpRegistry {
  /** Full op key → handler (e.g., "std:fs.read@v1" → handler) */
  private readonly handlers = new Map<string, OpHandler>();

  /** Namespace:name → sorted version list (for "latest" resolution) */
  private readonly versions = new Map<string, string[]>();

  /** Deprecated ops → replacement message */
  private readonly deprecated = new Map<string, string>();

  /**
   * Register a single op handler.
   * @param op Full op identifier (e.g., "std:fs.read@v1")
   * @param handler The handler function
   */
  register(op: string, handler: OpHandler): void {
    const parsed = parseOpId(op);
    if (!parsed) return;

    const { nsKey, version } = parsed;

    // Store handler by full key
    this.handlers.set(op, handler);

    // Track versions
    const versionList = this.versions.get(nsKey) ?? [];
    if (!versionList.includes(version)) {
      versionList.push(version);
      versionList.sort(compareVersions);
    }
    this.versions.set(nsKey, versionList);
  }

  /**
   * Register a plugin (§4.3).
   */
  registerPlugin(plugin: OpPlugin): void {
    const version = plugin.version ?? "v1";
    for (const [name, handler] of Object.entries(plugin.ops)) {
      const fullOp = `${plugin.namespace}:${name}@${version}`;
      this.register(fullOp, handler);
    }
  }

  /**
   * Look up a handler for an op.
   *
   * Version resolution (§4.2):
   * - "std:fs.read@v1" → exact version required
   * - "std:fs.read"    → latest available version
   */
  lookup(op: string): OpHandler | undefined {
    // Try exact match first
    const exact = this.handlers.get(op);
    if (exact) return exact;

    // If no @ version specified, resolve to latest
    const parsed = parseOpId(op);
    if (!parsed) return undefined;

    if (parsed.version === "latest") {
      const versionList = this.versions.get(parsed.nsKey);
      if (!versionList || versionList.length === 0) return undefined;
      const latestVersion = versionList[versionList.length - 1]!;
      const latestKey = `${parsed.nsKey}@${latestVersion}`;
      return this.handlers.get(latestKey);
    }

    return undefined;
  }

  /**
   * Check if an op is registered (any version).
   */
  has(op: string): boolean {
    return this.lookup(op) !== undefined;
  }

  /**
   * Mark an op as deprecated with an optional replacement message.
   */
  deprecate(op: string, message?: string): void {
    this.deprecated.set(op, message ?? `${op} is deprecated`);
  }

  /**
   * Check if an op is deprecated. Returns the deprecation message or undefined.
   */
  getDeprecation(op: string): string | undefined {
    // Check exact match first
    const exact = this.deprecated.get(op);
    if (exact) return exact;

    // Check without version
    const parsed = parseOpId(op);
    if (parsed) {
      return this.deprecated.get(parsed.nsKey);
    }
    return undefined;
  }

  /**
   * Get all registered op keys (for introspection/testing).
   */
  getRegisteredOps(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ---------------------------------------------------------------------------
// Op ID Parsing
// ---------------------------------------------------------------------------

interface ParsedOp {
  nsKey: string;   // "std:fs.read"
  version: string; // "v1" or "latest"
}

function parseOpId(op: string): ParsedOp | undefined {
  const colonIdx = op.indexOf(":");
  if (colonIdx === -1) return undefined;

  const atIdx = op.indexOf("@");
  if (atIdx === -1) {
    return { nsKey: op, version: "latest" };
  }

  return {
    nsKey: op.slice(0, atIdx),
    version: op.slice(atIdx + 1),
  };
}

/**
 * Compare version strings (e.g., "v1" < "v2" < "v10").
 */
function compareVersions(a: string, b: string): number {
  const numA = parseInt(a.replace(/^v/, ""), 10);
  const numB = parseInt(b.replace(/^v/, ""), 10);
  return numA - numB;
}
