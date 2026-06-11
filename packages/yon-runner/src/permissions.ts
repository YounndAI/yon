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
 * YON Runner — Permission Model
 *
 * Fail-closed allowlist with ALLOW/DENY/PROMPT actions.
 * Implements Runner Spec §3 (Permission Model).
 */

import type { AllowlistEntry, ExecutionContext } from "./types.js";
import { permissionDenied } from "./errors.js";

// ---------------------------------------------------------------------------
// Permission Engine
// ---------------------------------------------------------------------------

export class PermissionEngine {
  private entries: AllowlistEntry[];
  private readonly onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>;

  constructor(
    entries: AllowlistEntry[] = [],
    onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>,
  ) {
    this.entries = entries;
    this.onPrompt = onPrompt;
  }

  /** Add a permission entry at runtime (e.g., from policy file). */
  addEntry(entry: AllowlistEntry): void {
    this.entries.push(entry);
  }

  /**
   * Check if an op is permitted.
   *
   * Resolution order (§3.2):
   * 1. Explicit DENY → reject immediately
   * 2. Explicit ALLOW with condition → evaluate condition
   * 3. Explicit ALLOW → permit
   * 4. Default → DENY (fail-closed)
   */
  async check(
    op: string,
    ctx: ExecutionContext,
    rid?: string,
  ): Promise<void> {
    const matched = this.findMatches(op);

    // 1. Check for explicit DENY
    for (const entry of matched) {
      if (entry.action === "DENY") {
        throw permissionDenied(rid ?? "", op);
      }
    }

    // 2–3. Check for ALLOW (with optional condition) or PROMPT
    for (const entry of matched) {
      if (entry.action === "ALLOW") {
        if (entry.condition) {
          if (entry.condition(ctx)) return; // Condition met → allow
          // Condition not met → continue checking
        } else {
          return; // Unconditional ALLOW → permit
        }
      }

      if (entry.action === "PROMPT") {
        if (!this.onPrompt) {
          // No prompt handler → treat as DENY
          throw permissionDenied(rid ?? "", op);
        }
        const allowed = await this.onPrompt(op, ctx.args);
        if (allowed) return;
        throw permissionDenied(rid ?? "", op);
      }
    }

    // 4. Default → DENY (fail-closed)
    throw permissionDenied(rid ?? "", op);
  }

  /**
   * Find all matching allowlist entries for an op.
   * Supports exact match and glob patterns (e.g., "std:fs.*").
   */
  private findMatches(op: string): AllowlistEntry[] {
    return this.entries.filter((entry) => matchOp(entry.op, op));
  }
}

/**
 * Match an op against a pattern.
 *
 * Supports:
 * - Exact: "std:fs.read" matches "std:fs.read" AND "std:fs.read@v1"
 * - Glob:  "std:fs.*" matches "std:fs.read", "std:fs.write@v2", etc.
 * - Star:  "*" matches everything
 *
 * Version suffixes (@v1, @v2) are stripped before matching.
 */
function matchOp(pattern: string, op: string): boolean {
  // Strip version suffixes for matching
  const bareOp = op.includes("@") ? op.slice(0, op.indexOf("@")) : op;
  const barePattern = pattern.includes("@") ? pattern.slice(0, pattern.indexOf("@")) : pattern;

  if (barePattern === "*") return true;
  if (barePattern === bareOp) return true;

  // Handle "namespace:category.*" patterns
  if (barePattern.endsWith(".*")) {
    const prefix = barePattern.slice(0, -1); // "std:fs."
    return bareOp.startsWith(prefix);
  }

  // Handle "namespace:*" patterns
  if (barePattern.endsWith(":*")) {
    const prefix = barePattern.slice(0, -1); // "std:"
    return bareOp.startsWith(prefix);
  }

  return false;
}
