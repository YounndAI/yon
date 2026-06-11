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
 * Conformance tests — Permission Engine
 *
 * Covers: F9 (version-aware matching)
 */

import { describe, it, expect } from "vitest";
import { PermissionEngine } from "../src/permissions.js";
import type { AllowlistEntry, ExecutionContext, BlockRegistry } from "../src/types.js";

function makeCtx(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    sandboxRoot: "/tmp",
    env: {},
    blocks: { get: () => undefined, set: () => {}, has: () => false, keys: () => [] } as BlockRegistry,
    args,
    inputs: new Map(),
    signal: new AbortController().signal,
  };
}

describe("PermissionEngine", () => {
  describe("fail-closed default", () => {
    it("denies ops when no rules match", async () => {
      const engine = new PermissionEngine([]);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.read@v1", ctx, "r1")).rejects.toThrow();
    });
  });

  describe("ALLOW/DENY ordering", () => {
    it("allows when an ALLOW rule matches", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.*", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.read@v1", ctx, "r1")).resolves.toBeUndefined();
    });

    it("denies when DENY matches before ALLOW", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.read", action: "DENY" },
        { op: "std:fs.*", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.read@v1", ctx, "r1")).rejects.toThrow();
    });
  });

  describe("F9: version-aware matching", () => {
    it("matches 'std:fs.read' against 'std:fs.read@v1'", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.read", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.read@v1", ctx)).resolves.toBeUndefined();
    });

    it("matches 'std:fs.*' against 'std:fs.write@v2'", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.*", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.write@v2", ctx)).resolves.toBeUndefined();
    });

    it("matches 'std:*' against 'std:data.parse@v1'", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:*", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:data.parse@v1", ctx)).resolves.toBeUndefined();
    });

    it("matches '*' against anything", async () => {
      const entries: AllowlistEntry[] = [
        { op: "*", action: "ALLOW" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("custom:foo.bar@v3", ctx)).resolves.toBeUndefined();
    });
  });

  describe("PROMPT behavior", () => {
    it("calls onPrompt handler and allows when it returns true", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.delete", action: "PROMPT" },
      ];
      const engine = new PermissionEngine(entries, async () => true);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.delete@v1", ctx)).resolves.toBeUndefined();
    });

    it("denies when onPrompt returns false", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.delete", action: "PROMPT" },
      ];
      const engine = new PermissionEngine(entries, async () => false);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.delete@v1", ctx)).rejects.toThrow();
    });

    it("denies when PROMPT but no handler", async () => {
      const entries: AllowlistEntry[] = [
        { op: "std:fs.delete", action: "PROMPT" },
      ];
      const engine = new PermissionEngine(entries);
      const ctx = makeCtx();
      await expect(engine.check("std:fs.delete@v1", ctx)).rejects.toThrow();
    });
  });
});
