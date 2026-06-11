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
 * YON Runner — State Management
 *
 * Block registry, reference resolution, and output binding.
 * Implements Runner Spec §5 (State Management).
 */

import type { BlockRegistry } from "./types.js";
import { referenceNotFound, sandboxViolation } from "./errors.js";
import { validateHttpUrl } from "./ops/std-http.js";

// ---------------------------------------------------------------------------
// Block Registry Implementation
// ---------------------------------------------------------------------------

export class InMemoryBlockRegistry implements BlockRegistry {
  private readonly store = new Map<string, unknown>();

  get(id: string): unknown | undefined {
    return this.store.get(id);
  }

  set(id: string, value: unknown): void {
    this.store.set(id, value);
  }

  has(id: string): boolean {
    return this.store.has(id);
  }

  keys(): string[] {
    return [...this.store.keys()];
  }

  /** Get the raw map (for serialization / output). */
  toMap(): Map<string, unknown> {
    return new Map(this.store);
  }
}

// ---------------------------------------------------------------------------
// Reference Resolution (§5.3)
// ---------------------------------------------------------------------------

import type { Sandbox } from "./sandbox.js";
import { readFileSync } from "node:fs";

/**
 * Resolve a reference string to its value.
 *
 * Prefixes:
 * - `block:X`  → lookup in block registry
 * - `ref:X`    → lookup in block registry (output binding alias)
 * - `rid:X`    → lookup record by rid (returns the step output)
 * - `cfg:X`    → lookup @CFG by id
 * - `file:X`   → read file from sandbox (async)
 * - `url:X`    → permission-gated fetch (async)
 * - Bare value → return as literal string
 */
export async function resolveReference(
  ref: string,
  blocks: BlockRegistry,
  rid?: string,
  sandbox?: Sandbox,
): Promise<unknown> {
  if (ref.startsWith("block:")) {
    const id = ref.slice(6);
    if (!blocks.has(id)) {
      throw referenceNotFound(ref, rid);
    }
    return blocks.get(id);
  }

  if (ref.startsWith("ref:")) {
    const id = ref.slice(4);
    if (!blocks.has(id)) {
      throw referenceNotFound(ref, rid);
    }
    return blocks.get(id);
  }

  if (ref.startsWith("rid:")) {
    // RID references resolve to the output of the step with that RID.
    // The step's output is stored in the block registry under the RID.
    const id = ref.slice(4);
    if (!blocks.has(id)) {
      throw referenceNotFound(ref, rid);
    }
    return blocks.get(id);
  }

  if (ref.startsWith("cfg:")) {
    const id = ref.slice(4);
    if (!blocks.has(id)) {
      throw referenceNotFound(ref, rid);
    }
    return blocks.get(id);
  }

  if (ref.startsWith("file:")) {
    const path = ref.slice(5);
    if (!sandbox) {
      // No sandbox — return marker for compatibility
      return { __fileRef: path };
    }
    try {
      const resolved = sandbox.resolvePath(path, rid);
      return readFileSync(resolved, "utf-8");
    } catch (e) {
      if (e && typeof e === "object" && "code" in e) throw e; // Re-throw RunnerError
      throw referenceNotFound(`${ref} — file read failed`, rid);
    }
  }

  if (ref.startsWith("url:")) {
    const url = ref.slice(4);
    if (!sandbox) {
      throw referenceNotFound(`${ref} — url: requires sandbox with network access`, rid);
    }
    try {
      sandbox.checkNetwork(rid);
      // Apply the same HTTP security gate that std:http.* ops use:
      // scheme whitelist + private-IP block + credentials stripping.
      // Mirrors std-http.ts validateHttpUrl wire-in so `url:` reference
      // fetches cannot bypass the defaults.
      let validated: URL;
      let warning: string | undefined;
      try {
        ({ url: validated, warning } = validateHttpUrl(url, sandbox.unsafeHttp));
      } catch (validationError) {
        throw sandboxViolation(
          rid ?? "",
          validationError instanceof Error ? validationError.message : String(validationError),
        );
      }
      if (warning) console.warn(`[yon-runner] ${warning}`);
      const response = await fetch(validated.toString());
      if (!response.ok) {
        throw referenceNotFound(`${ref} — HTTP ${response.status}`, rid);
      }
      return await response.text();
    } catch (e) {
      if (e && typeof e === "object" && "code" in e) throw e; // Re-throw RunnerError
      throw referenceNotFound(`${ref} — fetch failed`, rid);
    }
  }

  // Bare value — return as string literal
  return ref;
}

/**
 * Resolve all input references for a step (async).
 */
export async function resolveInputs(
  inputs: string[],
  blocks: BlockRegistry,
  rid?: string,
  sandbox?: Sandbox,
): Promise<Map<string, unknown>> {
  const resolved = new Map<string, unknown>();
  for (const ref of inputs) {
    resolved.set(ref, await resolveReference(ref, blocks, rid, sandbox));
  }
  return resolved;
}

/**
 * Bind a step's output to the block registry.
 */
export function bindOutputs(
  outputs: string[],
  value: unknown,
  blocks: BlockRegistry,
): void {
  for (const out of outputs) {
    const id = out.startsWith("block:") ? out.slice(6)
      : out.startsWith("ref:") ? out.slice(4)
      : out;
    blocks.set(id, value);
  }
}

