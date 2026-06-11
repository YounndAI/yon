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
 * YON Runner — Stamp Emission
 *
 * @STAMP provenance records for audit trails.
 * Implements Runner Spec §7 (Output Document).
 */

import type { Stamp } from "./types.js";

// ---------------------------------------------------------------------------
// Stamp Collector
// ---------------------------------------------------------------------------

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

export class StampCollector {
  private readonly stamps: Stamp[] = [];
  private readonly src: string;

  constructor(src: string = `runner:yon-runner/${version}`) {
    this.src = src;
  }

  /** Emit a stamp. */
  emit(event: string, rid?: string, meta?: Record<string, unknown>): void {
    this.stamps.push({
      event,
      ts: new Date().toISOString(),
      src: this.src,
      rid,
      meta,
    });
  }

  /** Get all emitted stamps. */
  getAll(): Stamp[] {
    return [...this.stamps];
  }

  // -----------------------------------------------------------------------
  // Convenience emitters
  // -----------------------------------------------------------------------

  runStart(): void {
    this.emit("run:start");
  }

  runComplete(durationMs: number, stepCount: number): void {
    this.emit("run:complete", undefined, { durationMs, stepCount });
  }

  runFailed(error: string): void {
    this.emit("run:failed", undefined, { error });
  }

  stepStart(rid: string, op: string): void {
    this.emit("step:start", rid, { op });
  }

  stepComplete(rid: string, durationMs: number): void {
    this.emit("step:complete", rid, { durationMs });
  }

  stepFailed(rid: string, errorCode: string, message: string): void {
    this.emit("step:failed", rid, { errorCode, message });
  }

  stepSkipped(rid: string, reason: string): void {
    this.emit("step:skipped", rid, { reason });
  }

  checkPassed(rid: string): void {
    this.emit("check:passed", rid);
  }

  checkFailed(rid: string, action: string): void {
    this.emit("check:failed", rid, { action });
  }

  workflowCancelled(): void {
    this.emit("workflow:cancelled");
  }

  outputMissing(rid: string, name: string): void {
    this.emit("output:missing", rid, { name });
  }

  halt(rid: string, scope: string): void {
    this.emit("halt", rid, { scope });
  }

  tenetViolation(rid: string, tenet: string): void {
    this.emit("tenet:violation", rid, { tenet });
  }

  escalateTimeout(rid: string, timeoutMs: number): void {
    this.emit("escalate:timeout", rid, { timeoutMs });
  }

  imprintRejected(rid: string, reason: string): void {
    this.emit("imprint:rejected", rid, { reason });
  }
}
