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
 * YON Runner — Result Serializer
 *
 * Serializes a RunResult into a YON `kind=result` document.
 * Implements Runner Spec §7 (Output Document).
 *
 * Pure function — no side effects, no I/O.
 */

import type { RunResult, Stamp, RunnerError } from "./types.js";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Serialize a RunResult into a YON output document.
 *
 * Produces a `@DOC kind=result` document containing:
 * - All `@STAMP` records in chronological order
 * - `@ERROR` records for each error
 * - `@BEGIN`/`@END` blocks for each named output
 */
export function serializeResult(
  result: RunResult,
  options?: { id?: string; title?: string },
): string {
  const lines: string[] = [];

  // Document header
  const docId = options?.id ?? "run-result";
  const title = options?.title ?? "Execution Result";
  lines.push(`@DOC ver=2.0 | id=${docId} | title="${title}" | kind=result | profile=audit`);
  lines.push("");

  // Stamps
  if (result.stamps.length > 0) {
    for (const stamp of result.stamps) {
      lines.push(serializeStamp(stamp));
    }
    lines.push("");
  }

  // Errors
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      lines.push(serializeError(error));
    }
    lines.push("");
  }

  // Output blocks
  for (const [id, value] of result.outputs) {
    const content = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    lines.push(`@BEGIN id="${id}"`);
    lines.push(content);
    lines.push(`@END id="${id}"`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeStamp(stamp: Stamp): string {
  const parts = [`@STAMP ts="${stamp.ts}"`, `event="${stamp.event}"`, `src="${stamp.src}"`];
  if (stamp.rid) parts.push(`rid=${stamp.rid}`);
  return parts.join(" | ");
}

function serializeError(error: RunnerError): string {
  const parts = [`@ERROR code=${error.code}`, `msg="${error.message}"`];
  if (error.rid) parts.push(`rid=${error.rid}`);
  if (error.op) parts.push(`op="${error.op}"`);
  parts.push(`severity=${error.severity ?? "fatal"}`);
  parts.push(`source="${error.source ?? "unknown"}"`);
  return parts.join(" | ");
}
