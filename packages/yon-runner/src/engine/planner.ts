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
 * YON Runner — Planner
 *
 * Phase 4: Produce an execution plan from the dependency graph.
 * Implements Runner Spec §2.3 (Execution Order).
 */

import type { ResolvedStep, ResolvedCheck } from "../types.js";
import type { DependencyGraph } from "./resolver.js";

// ---------------------------------------------------------------------------
// Execution Plan
// ---------------------------------------------------------------------------

export interface ExecutionPlan {
  /** Steps in execution order. */
  steps: PlannedStep[];
}

export interface PlannedStep {
  /** The resolved step. */
  step: ResolvedStep;
  /** Checks to evaluate BEFORE this step runs. */
  preChecks: ResolvedCheck[];
}

// ---------------------------------------------------------------------------
// Planner
// ---------------------------------------------------------------------------

/**
 * Produce an ordered execution plan.
 *
 * Rules (§2.3):
 * 1. Execute steps in topological order
 * 2. @CHECK records are evaluated before dependent steps
 */
export function plan(
  graph: DependencyGraph,
  checks: ResolvedCheck[],
): ExecutionPlan {
  const planned: PlannedStep[] = [];

  // Index checks by target step
  const checksByTarget = new Map<string, ResolvedCheck[]>();
  const globalChecks: ResolvedCheck[] = [];

  for (const check of checks) {
    if (check.target) {
      const existing = checksByTarget.get(check.target) ?? [];
      existing.push(check);
      checksByTarget.set(check.target, existing);
    } else {
      globalChecks.push(check);
    }
  }

  // Build the plan in topological order
  for (const rid of graph.order) {
    const node = graph.nodes.get(rid);
    if (!node) continue;

    const preChecks = [
      ...globalChecks, // Global checks run before every step
      ...(checksByTarget.get(rid) ?? []),
    ];

    planned.push({
      step: node.step,
      preChecks,
    });
  }

  return { steps: planned };
}
