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
 * YON Runner — Resolver
 *
 * Phase 3: Build dependency graph from in/out references.
 * Detect cycles. Produces the DAG.
 * Implements Runner Spec §2.2 (Dependency Graph).
 */

import type { ResolvedStep, DagNode } from "../types.js";
import { cycleDetected } from "../errors.js";

// ---------------------------------------------------------------------------
// DAG Builder
// ---------------------------------------------------------------------------

export interface DependencyGraph {
  nodes: Map<string, DagNode>;
  order: string[]; // RIDs in topological order
}

/**
 * Build a dependency graph from resolved steps.
 *
 * Rules (§2.2):
 * - out of step A → in of step B = directed edge A→B
 * - Cycles are forbidden → E101
 */
export function buildDependencyGraph(steps: ResolvedStep[]): DependencyGraph {
  // Build output→step index: which step produces each output?
  const outputIndex = new Map<string, string>(); // output ref → step RID
  for (const step of steps) {
    for (const out of step.outputs) {
      outputIndex.set(out, step.rid);
    }
  }

  // Build DAG nodes
  const nodes = new Map<string, DagNode>();

  for (const step of steps) {
    const dependsOn: string[] = [];

    for (const input of step.inputs) {
      const producerRid = outputIndex.get(input);
      if (producerRid && producerRid !== step.rid) {
        if (!dependsOn.includes(producerRid)) {
          dependsOn.push(producerRid);
        }
      }
      // If no producer found, the input might be a static block (from @BEGIN)
      // or a ref that's resolved at runtime — don't error here.
    }

    nodes.set(step.rid, {
      step,
      dependsOn,
      dependedBy: [],
    });
  }

  // Build reverse edges (dependedBy)
  for (const [rid, node] of nodes) {
    for (const depRid of node.dependsOn) {
      const depNode = nodes.get(depRid);
      if (depNode) {
        depNode.dependedBy.push(rid);
      }
    }
  }

  // Detect cycles and produce topological order
  const order = topologicalSort(nodes);

  return { nodes, order };
}

// ---------------------------------------------------------------------------
// Topological Sort (Kahn's Algorithm)
// ---------------------------------------------------------------------------

function topologicalSort(nodes: Map<string, DagNode>): string[] {
  const inDegree = new Map<string, number>();
  const order: string[] = [];

  // Calculate in-degrees
  for (const [rid, node] of nodes) {
    inDegree.set(rid, node.dependsOn.length);
  }

  // Queue nodes with no dependencies
  const queue: string[] = [];
  for (const [rid, degree] of inDegree) {
    if (degree === 0) {
      queue.push(rid);
    }
  }

  // Sort by step number for deterministic ordering among equals
  queue.sort((a, b) => {
    const stepA = nodes.get(a)!.step.n;
    const stepB = nodes.get(b)!.step.n;
    return stepA - stepB;
  });

  while (queue.length > 0) {
    const rid = queue.shift()!;
    order.push(rid);

    const node = nodes.get(rid)!;
    for (const depRid of node.dependedBy) {
      const degree = (inDegree.get(depRid) ?? 0) - 1;
      inDegree.set(depRid, degree);
      if (degree === 0) {
        queue.push(depRid);
        // Re-sort for deterministic ordering
        queue.sort((a, b) => {
          const stepA = nodes.get(a)!.step.n;
          const stepB = nodes.get(b)!.step.n;
          return stepA - stepB;
        });
      }
    }
  }

  // If not all nodes are in the order, there's a cycle
  if (order.length !== nodes.size) {
    const remaining = [...nodes.keys()].filter((rid) => !order.includes(rid));
    throw cycleDetected(remaining);
  }

  return order;
}
