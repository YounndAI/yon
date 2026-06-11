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
 * YON Runner — Workflow Ops (std:workflow.*)
 *
 * Implements YSL §9 (Workflow Composition) — Reference runner: workflow.call.
 * `std:workflow.emit` requires a specialized runner (EXPERIMENTAL reactive feature).
 */

import type { OpHandler } from "../types.js";

// ---------------------------------------------------------------------------
// Ops
// ---------------------------------------------------------------------------

/**
 * std:workflow.call@v1 — Invoke sub-workflow.
 *
 * In the reference runner, this is a stub that resolves the reference and args
 * but does not actually dispatch a sub-workflow execution (which requires
 * a specialized runner's orchestration layer).
 *
 * The reference runner returns a descriptor of the call for downstream processing.
 *
 * Args:
 * - ref: document reference (workflow to invoke)
 * - args: arguments to pass to the sub-workflow (optional, map)
 *
 * Returns: block (call descriptor with ref and args)
 */
const workflowCall: OpHandler = async (ctx) => {
  const ref = String(ctx.args["ref"] ?? "");
  if (!ref) throw new Error("std:workflow.call requires 'ref' argument");

  const args = ctx.args["args"];

  // In the reference runner, return a call descriptor.
  // A specialized runner would actually execute the referenced workflow.
  return {
    __type: "workflow:call",
    ref,
    args: args ?? {},
  };
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerWorkflowOps(
  register: (op: string, handler: OpHandler) => void,
): void {
  register("std:workflow.call@v1", workflowCall);
}
