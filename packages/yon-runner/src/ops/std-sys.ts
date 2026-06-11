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
 * YON Runner — System Ops (std:sys.*)
 *
 * Implements YSL §7 (System & Shell) — 🟢 SAFE ops + env.
 * `std:sys.shell` (🔴 DANGEROUS) is intentionally excluded from the free tier.
 */

import { arch, platform, totalmem, freemem } from "node:os";
import type { OpHandler } from "../types.js";

// ---------------------------------------------------------------------------
// Ops
// ---------------------------------------------------------------------------

/**
 * std:sys.info@v1 — Get environment metadata.
 *
 * Accepts `key` argument: "os" | "arch" | "mem" (defaults to "os").
 * Returns a string with the requested information.
 */
const sysInfo: OpHandler = async (ctx) => {
  const key = String(ctx.args["key"] ?? "os");
  switch (key) {
    case "os":
      return platform();
    case "arch":
      return arch();
    case "mem":
      return JSON.stringify({
        total: totalmem(),
        free: freemem(),
      });
    default:
      return platform();
  }
};

/**
 * std:sys.clock@v1 — Get current timestamp.
 *
 * Accepts optional `fmt` argument (default: ISO 8601).
 * Returns an ISO 8601 timestamp string.
 */
const sysClock: OpHandler = async (ctx) => {
  const fmt = String(ctx.args["fmt"] ?? "iso");
  const now = new Date();
  switch (fmt) {
    case "unix":
      return String(Math.floor(now.getTime() / 1000));
    case "ms":
      return String(now.getTime());
    case "iso":
    default:
      return now.toISOString();
  }
};

/**
 * std:sys.env@v1 — Read environment variable from sandbox.
 *
 * Reads from the sandboxed env context (not raw process.env).
 * Returns empty string if the variable is not set.
 *
 * Args:
 * - key: name of the environment variable
 *
 * Returns: string value of the variable
 */
const sysEnv: OpHandler = async (ctx) => {
  const key = String(ctx.args["key"] ?? "");
  if (!key) throw new Error("std:sys.env requires 'key' argument");
  return String(ctx.env[key] ?? "");
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerSysOps(
  register: (op: string, handler: OpHandler) => void,
): void {
  register("std:sys.info@v1", sysInfo);
  register("std:sys.clock@v1", sysClock);
  register("std:sys.env@v1", sysEnv);
}
