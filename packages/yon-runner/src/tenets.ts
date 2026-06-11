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
 * YON Runner — Tenet Engine
 *
 * Loads @TENET records from kind=tenets documents,
 * merges document-level tenets, and provides a check interface.
 * Implements YON v2.0 §8 (Agent Execution) tenet handling.
 */

import type { ResolvedTenet } from "./types.js";
import { tenetViolated } from "./errors.js";
import type { RunnerError } from "./types.js";
import type { YonRecord } from "@younndai/yon-parser";

// ---------------------------------------------------------------------------
// TenetEngine
// ---------------------------------------------------------------------------

export class TenetEngine {
  private runnerTenets: ResolvedTenet[] = [];
  private documentTenets: ResolvedTenet[] = [];
  private onTenetCheck?: (
    op: string,
    args: Record<string, unknown>,
    tenets: ResolvedTenet[],
  ) => Promise<boolean>;

  constructor(
    onTenetCheck?: (
      op: string,
      args: Record<string, unknown>,
      tenets: ResolvedTenet[],
    ) => Promise<boolean>,
  ) {
    this.onTenetCheck = onTenetCheck;
  }

  /**
   * Load runner-level tenets from parsed @TENET records.
   * These form the immutable safety floor — document tenets cannot override them.
   */
  loadRunnerTenets(tenets: ResolvedTenet[]): void {
    this.runnerTenets = tenets.map((t) => ({ ...t, source: "runner" as const }));
  }

  /**
   * Merge document-level tenets. Additive only — runner tenets with
   * the same `rid` take precedence (immutable safety floor).
   */
  mergeDocumentTenets(tenets: ResolvedTenet[]): void {
    const runnerRids = new Set(this.runnerTenets.map((t) => t.rid));
    this.documentTenets = tenets
      .filter((t) => !runnerRids.has(t.rid))
      .map((t) => ({ ...t, source: "document" as const }));
  }

  /**
   * Get all effective tenets (runner + document), sorted by precedence (descending).
   */
  getAll(): ResolvedTenet[] {
    return [...this.runnerTenets, ...this.documentTenets].sort(
      (a, b) => b.precedence - a.precedence,
    );
  }

  /**
   * Check tenets for a step. Delegates to onTenetCheck callback.
   * Without a callback, tenets are stored but not actively enforced
   * (semantic enforcement requires LLM reasoning — Specialised tier).
   *
   * @returns null if check passes or no callback, RunnerError if violated
   */
  async check(rid: string, op: string, args: Record<string, unknown>): Promise<RunnerError | null> {
    if (!this.onTenetCheck) {
      return null; // No callback — tenets stored but not enforced
    }

    const allTenets = this.getAll();
    if (allTenets.length === 0) {
      return null;
    }

    const allowed = await this.onTenetCheck(op, args, allTenets);
    if (!allowed) {
      return tenetViolated(rid, `op "${op}" rejected by tenet check`);
    }

    return null;
  }

  /** Whether any tenets are loaded. */
  hasTenets(): boolean {
    return this.runnerTenets.length > 0 || this.documentTenets.length > 0;
  }
}

// ---------------------------------------------------------------------------
// Tenet Extraction (from parsed YON records)
// ---------------------------------------------------------------------------

/**
 * Extract @TENET records from parsed YON records into ResolvedTenet[].
 */
export function extractTenets(
  records: YonRecord[],
  source: "runner" | "document" = "document",
): ResolvedTenet[] {
  return records
    .filter((r) => r.tag?.toUpperCase() === "TENET")
    .map((r) => {
      const f = r.fields;
      const rid = String(f.get("rid") ?? "");
      const levelRaw = String(f.get("level") ?? "L2");
      const content = String(f.get("content") ?? f.get("text") ?? "");
      const precedenceRaw = f.get("precedence");
      const decayRaw = f.get("decay");
      return {
        rid,
        level: (["L0", "L1", "L2", "L3"].includes(levelRaw) ? levelRaw : "L2") as ResolvedTenet["level"],
        content,
        precedence: typeof precedenceRaw === "number" ? precedenceRaw : Number(String(precedenceRaw ?? 0)) || 0,
        decay: typeof decayRaw === "number" ? decayRaw : Number(String(decayRaw ?? 0)) || 0,
        source,
      };
    });
}


