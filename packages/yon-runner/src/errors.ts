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
 * YON Runner — Error Codes
 *
 * Spec error codes E001–E006 (standard) and E101–E112 (runner)
 * as defined in YON v2.0 §9.3 and Runner Specification §9.
 */

import type { RunnerError } from "./types.js";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// Runner Source ID
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

export const RUNNER_SOURCE = `runner:yon-runner/${version}`;

// ---------------------------------------------------------------------------
// Error Code Registry (v2.0 normative ranges)
// ---------------------------------------------------------------------------

export const ErrorCodes = {
  // Standard errors (E001–E006)
  E001: "Structural violation",
  E002: "Timeout exceeded",
  E003: "Permission denied",
  E004: "Reference not found",
  E005: "Rate limit exceeded",
  E006: "Unterminated block",
  // Runner errors (E101–E112)
  E101: "Cycle detected",
  E102: "Op not implemented",
  E103: "Sandbox violation",
  E104: "Version archived",
  E105: "Version revoked",
  E106: "Assertion failed",
  E107: "Runtime error",
  E108: "@HALT received",
  E109: "@TENET violated",
  E110: "@ESCALATE timeout",
  E111: "@IMPRINT rejected",
  E112: "Trust threshold",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

// ---------------------------------------------------------------------------
// Severity Defaults
// ---------------------------------------------------------------------------

const SEVERITY_MAP: Record<ErrorCode, "fatal" | "recoverable" | "warning"> = {
  E001: "fatal",
  E002: "recoverable",
  E003: "fatal",
  E004: "fatal",
  E005: "recoverable",
  E006: "fatal",
  E101: "fatal",
  E102: "fatal",
  E103: "fatal",
  E104: "warning",
  E105: "fatal",
  E106: "recoverable",
  E107: "fatal",
  E108: "fatal",
  E109: "fatal",
  E110: "recoverable",
  E111: "fatal",
  E112: "fatal",
};

// ---------------------------------------------------------------------------
// Error Factory
// ---------------------------------------------------------------------------

/** Create a spec-compliant RunnerError with severity and source. */
export function createError(
  code: ErrorCode,
  message: string,
  rid?: string,
  op?: string,
): RunnerError {
  return {
    code,
    message: `${code}: ${ErrorCodes[code]} — ${message}`,
    severity: SEVERITY_MAP[code],
    source: RUNNER_SOURCE,
    rid,
    op,
  };
}

// ---------------------------------------------------------------------------
// Convenience constructors
// ---------------------------------------------------------------------------

export function structuralViolation(message: string, rid?: string): RunnerError {
  return createError("E001", message, rid);
}

export function timeoutExceeded(rid: string, op: string, timeoutMs: number): RunnerError {
  return createError("E002", `Step timed out after ${timeoutMs}ms`, rid, op);
}

export function permissionDenied(rid: string, op: string): RunnerError {
  return createError("E003", `Op "${op}" denied by permission policy`, rid, op);
}

export function referenceNotFound(ref: string, rid?: string): RunnerError {
  return createError("E004", `Reference "${ref}" could not be resolved`, rid);
}

export function unterminatedBlock(rid: string, blockId: string): RunnerError {
  return createError("E006", `Block "${blockId}" is not terminated`, rid);
}

export function cycleDetected(rids: string[]): RunnerError {
  return createError("E101", `Dependency cycle: ${rids.join(" → ")}`);
}

export function opNotImplemented(rid: string, op: string): RunnerError {
  return createError("E102", `Op "${op}" is not registered`, rid, op);
}

export function sandboxViolation(rid: string, message: string): RunnerError {
  return createError("E103", message, rid);
}

export function versionRevoked(rid: string, op: string): RunnerError {
  return createError("E105", `Op "${op}" has been revoked`, rid, op);
}

export function assertionFailed(rid: string, assert: string, msg: string): RunnerError {
  return createError("E106", `${msg} (assert: ${assert})`, rid);
}

export function runtimeError(rid: string, op: string, message: string): RunnerError {
  return createError("E107", message, rid, op);
}

export function haltReceived(rid: string, scope: string): RunnerError {
  return createError("E108", `@HALT received in scope "${scope}"`, rid);
}

export function tenetViolated(rid: string, tenet: string): RunnerError {
  return createError("E109", `@TENET "${tenet}" violated`, rid);
}

export function escalateTimeout(rid: string, timeoutMs: number): RunnerError {
  return createError("E110", `@ESCALATE timed out after ${timeoutMs}ms`, rid);
}

export function imprintRejected(rid: string, reason: string): RunnerError {
  return createError("E111", `@IMPRINT rejected: ${reason}`, rid);
}

export function trustThreshold(rid: string, trust: number, threshold: number): RunnerError {
  return createError("E112", `Trust ${trust} below threshold ${threshold}`, rid);
}
