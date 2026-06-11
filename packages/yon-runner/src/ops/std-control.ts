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
 * YON Runner — Control Flow Ops (std:control.*)
 *
 * Implements YSL §8 (Control Flow) — Reference runner: if, match, foreach, parallel, sleep, return, await.
 */

import type { OpHandler, ExecutionContext } from "../types.js";

// ---------------------------------------------------------------------------
// Gate Model Result (Runner Spec §2.5)
// ---------------------------------------------------------------------------

/**
 * Result of a control flow op.
 * The executor uses this to skip un-taken branches (Gate Model).
 */
export interface ControlFlowResult {
  /** RID of the branch to execute */
  taken: string;
  /** RIDs of branches to skip (may be empty) */
  skipped: string[];
}

/** Type guard for ControlFlowResult. */
export function isControlFlowResult(value: unknown): value is ControlFlowResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "taken" in value &&
    "skipped" in value
  );
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * std:control.if@v1 — Conditional gate.
 *
 * Evaluates condition, returns taken branch RID and skipped branch RID.
 * The executor uses the Gate Model to skip the un-taken branch
 * and all its transitive dependents.
 *
 * Args:
 * - cond: boolean/ref to evaluate
 * - then_step: RID of step to execute if true
 * - else_step: RID of step to execute if false
 *
 * Returns: ControlFlowResult
 */
export const controlIf: OpHandler = async (ctx) => {
  const cond = resolveCondition(ctx, "cond");
  const thenStep = String(ctx.args["then_step"] ?? "");
  const elseStep = String(ctx.args["else_step"] ?? "");

  if (cond) {
    return {
      taken: thenStep,
      skipped: elseStep ? [elseStep] : [],
    } satisfies ControlFlowResult;
  }

  if (elseStep) {
    return {
      taken: elseStep,
      skipped: thenStep ? [thenStep] : [],
    } satisfies ControlFlowResult;
  }

  // §2.5 Rule 4: false with no else_step → skip then, output is void
  return {
    taken: "",
    skipped: thenStep ? [thenStep] : [],
  } satisfies ControlFlowResult;
};

/**
 * std:control.match@v1 — Pattern match gate.
 *
 * Evaluates value against cases map, returns taken branch RID
 * and all un-matched case RIDs as skipped.
 *
 * Args:
 * - value: the value to match against
 * - cases: a map of value→step RID pairs
 *
 * Returns: ControlFlowResult
 */
export const controlMatch: OpHandler = async (ctx) => {
  const value = String(ctx.args["value"] ?? "");
  const cases = ctx.args["cases"];

  if (typeof cases === "object" && cases !== null) {
    const caseMap = cases as Record<string, string>;
    const allRids = Object.values(caseMap);

    // Find the matched case
    let matchedKey: string | undefined;
    if (value in caseMap) {
      matchedKey = value;
    } else if ("_" in caseMap) {
      matchedKey = "_";
    } else if ("default" in caseMap) {
      matchedKey = "default";
    }

    if (matchedKey !== undefined) {
      const taken = caseMap[matchedKey]!;
      const skipped = allRids.filter((rid) => rid !== taken);
      return { taken, skipped } satisfies ControlFlowResult;
    }
    // §2.5 Rule 5 + §8 Rule 5: no match → emit gate:no-match stamp, skip all
    // The stamp is emitted via the step output (executor reads it downstream)
    return {
      taken: "",
      skipped: allRids,
      __noMatch: true, // Signal to executor for gate:no-match stamp
    } satisfies ControlFlowResult & { __noMatch?: boolean };
  }

  // Invalid or missing cases arg — void output, nothing to skip
  return {
    taken: "",
    skipped: [],
  } satisfies ControlFlowResult;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveCondition(ctx: ExecutionContext, key: string): boolean {
  const raw = ctx.args[key];
  if (raw == null) return false;

  // String values (post-parser-fix: bare true/false are always strings)
  if (raw === "true") return true;
  if (raw === "false") return false;

  // Reference resolution
  const ref = String(raw);
  if (ref.startsWith("ref:") || ref.startsWith("block:")) {
    const refId = ref.includes(":") ? ref.split(":").slice(1).join(":") : ref;
    const value = ctx.blocks.get(refId);
    return value != null && value !== false && value !== 0 && value !== "";
  }

  // Truthy evaluation
  return Boolean(raw);
}

/**
 * Resolve a list from args. Accepts arrays, JSON strings, or block references.
 */
function resolveList(
  raw: unknown,
  ctx: ExecutionContext,
): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    // Block reference
    if (raw.startsWith("block:") || raw.startsWith("ref:")) {
      const refId = raw.includes(":") ? raw.split(":").slice(1).join(":") : raw;
      const value = ctx.blocks.get(refId);
      if (Array.isArray(value)) return value;
      if (value != null) return [value];
      return [];
    }
    // JSON parse attempt
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [raw];
    }
  }
  if (raw != null) return [raw];
  return [];
}

// ---------------------------------------------------------------------------
// Additional Free Ops
// ---------------------------------------------------------------------------

/**
 * std:control.foreach@v1 — Iterate items.
 *
 * In the reference runner, foreach resolves the items list and returns it
 * as the step output. This enables data pipeline patterns where downstream
 * steps consume the resolved list.
 *
 * Full per-item step dispatch (executing `step` for each item with `as`
 * binding) requires executor-level integration, which is available in
 * specialized runners.
 *
 * Args:
 * - items: list of values (or ref/block reference to a list)
 * - step: RID of the step template to execute per item (reserved)
 * - as: variable name to bind each item to (reserved, default: "item")
 *
 * Returns: list of resolved items
 */
const controlForeach: OpHandler = async (ctx) => {
  const items = resolveList(ctx.args["items"], ctx);
  // `step` and `as` are reserved for specialized runner per-item dispatch.
  // Reference runner returns the resolved items list directly.
  return items;
};

/**
 * std:control.parallel@v1 — Execute steps concurrently.
 *
 * In the reference runner, parallel resolves the step refs list and returns
 * it. The current sequential executor runs them in order; a specialized
 * runner would dispatch via Promise.all.
 *
 * Args:
 * - steps: list of step RIDs to execute concurrently
 *
 * Returns: list of step refs (executor handles scheduling)
 */
const controlParallel: OpHandler = async (ctx) => {
  const steps = resolveList(ctx.args["steps"], ctx);
  return steps;
};

/**
 * std:control.sleep@v1 — Pause execution.
 *
 * Args:
 * - ms: number of milliseconds to sleep (required)
 *
 * Returns: void
 */
const controlSleep: OpHandler = async (ctx) => {
  const ms = Number(ctx.args["ms"] ?? 0);
  if (ms <= 0) return undefined;

  // Respect cancellation signal during sleep
  return new Promise<undefined>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("Aborted"));
    };

    const timer = setTimeout(() => {
      ctx.signal.removeEventListener("abort", onAbort);
      resolve(undefined);
    }, ms);

    // If already aborted
    if (ctx.signal.aborted) {
      clearTimeout(timer);
      reject(new Error("Aborted"));
      return;
    }

    ctx.signal.addEventListener("abort", onAbort, { once: true });
  });
};

/**
 * std:control.return@v1 — Early workflow exit.
 *
 * Returns a value (typically a ref) as the workflow output and signals
 * early termination.
 *
 * Args:
 * - value: the value or ref to return (required)
 *
 * Returns: the resolved value
 */
const controlReturn: OpHandler = async (ctx) => {
  const raw = ctx.args["value"];
  if (raw == null) return undefined;

  const ref = String(raw);
  // Resolve block/ref references
  if (ref.startsWith("block:") || ref.startsWith("ref:")) {
    const refId = ref.includes(":") ? ref.split(":").slice(1).join(":") : ref;
    return ctx.blocks.get(refId) ?? ref;
  }

  return raw;
};

/**
 * std:control.await@v1 — Synchronisation barrier.
 *
 * Verifies that all referenced block/ref outputs have been resolved
 * in the block registry. In the sequential runner, this acts as a
 * verification step (all deps are already resolved sequentially).
 * In a parallel runner, this would block until all refs resolve.
 *
 * Args:
 * - refs: list of block/ref references to await
 *
 * Returns: void (spec §8: "Does NOT execute any ops")
 */
const controlAwait: OpHandler = async (ctx) => {
  const refs = resolveList(ctx.args["refs"], ctx);
  for (const ref of refs) {
    const refStr = String(ref);
    const id = refStr.includes(":") ? refStr.split(":").slice(1).join(":") : refStr;
    if (!ctx.blocks.has(id)) {
      throw new Error(`await: reference "${refStr}" not yet resolved`);
    }
  }
  return undefined; // void
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerControlOps(register: (op: string, handler: OpHandler) => void): void {
  register("std:control.if@v1", controlIf);
  register("std:control.match@v1", controlMatch);
  register("std:control.foreach@v1", controlForeach);
  register("std:control.parallel@v1", controlParallel);
  register("std:control.sleep@v1", controlSleep);
  register("std:control.return@v1", controlReturn);
  register("std:control.await@v1", controlAwait);
}
