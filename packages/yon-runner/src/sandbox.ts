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
 * YON Runner — Sandbox
 *
 * CWD-scoped filesystem isolation.
 * Implements Runner Spec §8.5 (Sandbox Configuration).
 */

import { resolve, relative, isAbsolute } from "node:path";
import { sandboxViolation } from "./errors.js";
import type { SandboxConfig } from "./types.js";

// ---------------------------------------------------------------------------
// Sandbox
// ---------------------------------------------------------------------------

export class Sandbox {
  readonly root: string;
  readonly networkAllowed: boolean;
  readonly env: Record<string, string>;
  /**
   * Bypass HTTP security defaults (scheme/private-IP/credentials checks)
   * for `url:` reference fetches and std:http.* ops. Mirrors
   * `RunnerConfig.unsafeHttp`. Default: false.
   */
  readonly unsafeHttp: boolean;

  constructor(config: SandboxConfig, unsafeHttp: boolean = false) {
    this.root = resolve(config.root);
    this.networkAllowed = config.network ?? false;
    this.env = { ...config.env };
    this.unsafeHttp = unsafeHttp;
  }

  /**
   * Resolve a path relative to the sandbox root.
   * Throws E103 if the resolved path escapes the sandbox.
   */
  resolvePath(path: string, rid?: string): string {
    const resolved = isAbsolute(path)
      ? resolve(path)
      : resolve(this.root, path);

    const rel = relative(this.root, resolved);

    // Path traversal check — if relative path starts with "..", it escapes
    if (rel.startsWith("..") || isAbsolute(rel)) {
      throw sandboxViolation(
        rid ?? "",
        `Path "${path}" resolves to "${resolved}" which is outside sandbox root "${this.root}"`,
      );
    }

    return resolved;
  }

  /**
   * Check if network access is permitted.
   * Throws E103 if network is not allowed.
   */
  checkNetwork(rid?: string): void {
    if (!this.networkAllowed) {
      throw sandboxViolation(
        rid ?? "",
        "Network access denied by sandbox policy",
      );
    }
  }
}

/**
 * Create a default sandbox rooted at the current working directory.
 */
export function createDefaultSandbox(): Sandbox {
  return new Sandbox({
    root: process.cwd(),
    network: false,
    env: {},
  });
}
