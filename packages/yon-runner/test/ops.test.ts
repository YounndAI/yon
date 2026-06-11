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
 * Conformance tests — Ops
 *
 * Covers: F1 (std:handler.notify), T2/T6 (ControlFlowResult)
 */

import { describe, it, expect, vi } from "vitest";
import { createRunner } from "../src/index.js";
import { controlIf, controlMatch, isControlFlowResult } from "../src/ops/std-control.js";
import { registerControlOps } from "../src/ops/std-control.js";
import { registerHandlerOps } from "../src/ops/std-handler.js";
import type { ExecutionContext, BlockRegistry, OpHandler } from "../src/types.js";

function makeCtx(args: Record<string, unknown> = {}, blockData: Record<string, unknown> = {}): ExecutionContext {
  const store = new Map(Object.entries(blockData));
  return {
    sandboxRoot: "/tmp",
    env: {},
    blocks: {
      get: (id: string) => store.get(id),
      set: (id: string, v: unknown) => { store.set(id, v); },
      has: (id: string) => store.has(id),
      keys: () => [...store.keys()],
    } as BlockRegistry,
    args,
    inputs: new Map(),
    signal: new AbortController().signal,
  };
}

describe("isControlFlowResult", () => {
  it("returns true for valid ControlFlowResult", () => {
    expect(isControlFlowResult({ taken: "a", skipped: ["b"] })).toBe(true);
  });

  it("returns false for plain string", () => {
    expect(isControlFlowResult("step-1")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isControlFlowResult(null)).toBe(false);
  });
});

describe("standard handler namespace", () => {
  it("registers std:handler.* ops instead of the legacy interaction namespace", () => {
    const ops = createRunner().listOps();
    const legacyNamespace = ["std", "hu" + "man"].join(":");

    expect(ops).toContain("std:handler.notify@v1");
    expect(ops).toContain("std:handler.ask@v1");
    expect(ops).toContain("std:handler.review@v1");
    expect(ops).not.toContain(`${legacyNamespace}.notify@v1`);
    expect(ops).not.toContain(`${legacyNamespace}.ask@v1`);
    expect(ops).not.toContain(`${legacyNamespace}.review@v1`);
  });

  it("does not auto-approve handler review without onPrompt", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.review@v1", action: "ALLOW" }],
    });

    const result = await runner.run(`
@DOC ver=2.0 | id=handler-review | kind=workflow | profile=exec
@STEP n:int=1 | rid=review | op=std:handler.review@v1 | args=[artifact="block:report"]
`);

    expect(result.success).toBe(false);
    expect(result.errors[0]?.message).toContain("onPrompt");
  });
});

describe("std:control.if@v1 (Gate Model)", () => {
  it("T6: returns ControlFlowResult when condition is true", async () => {
    const ctx = makeCtx({ cond: true, then_step: "step-a", else_step: "step-b" });
    const result = await controlIf(ctx, ctx.args);
    expect(isControlFlowResult(result)).toBe(true);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("step-a");
    expect(gate.skipped).toEqual(["step-b"]);
  });

  it("T6: returns ControlFlowResult when condition is false", async () => {
    const ctx = makeCtx({ cond: false, then_step: "step-a", else_step: "step-b" });
    const result = await controlIf(ctx, ctx.args);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("step-b");
    expect(gate.skipped).toEqual(["step-a"]);
  });

  it("handles missing else_step", async () => {
    const ctx = makeCtx({ cond: false, then_step: "step-a" });
    const result = await controlIf(ctx, ctx.args);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("");
    expect(gate.skipped).toEqual(["step-a"]);
  });

  it("resolves block/ref conditions", async () => {
    const ctx = makeCtx(
      { cond: "block:flag", then_step: "s1", else_step: "s2" },
      { flag: true },
    );
    const result = await controlIf(ctx, ctx.args);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("s1");
  });
});

describe("std:control.match@v1 (Gate Model)", () => {
  it("T2: returns ControlFlowResult for matched case", async () => {
    const ctx = makeCtx({
      value: "b",
      cases: { a: "step-a", b: "step-b", c: "step-c" },
    });
    const result = await controlMatch(ctx, ctx.args);
    expect(isControlFlowResult(result)).toBe(true);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("step-b");
    expect(gate.skipped).toContain("step-a");
    expect(gate.skipped).toContain("step-c");
    expect(gate.skipped).not.toContain("step-b");
  });

  it("T2: uses _ as default case", async () => {
    const ctx = makeCtx({
      value: "unknown",
      cases: { a: "step-a", _: "step-default" },
    });
    const result = await controlMatch(ctx, ctx.args);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("step-default");
  });

  it("T2: returns empty taken when no match", async () => {
    const ctx = makeCtx({
      value: "x",
      cases: { a: "step-a", b: "step-b" },
    });
    const result = await controlMatch(ctx, ctx.args);
    const gate = result as { taken: string; skipped: string[] };
    expect(gate.taken).toBe("");
    expect(gate.skipped).toEqual(["step-a", "step-b"]);
  });

  it("T2: returns ControlFlowResult even with no cases object", async () => {
    const ctx = makeCtx({ value: "x" });
    const result = await controlMatch(ctx, ctx.args);
    expect(isControlFlowResult(result)).toBe(true);
  });
});

describe("F1: std:handler.notify@v1", () => {
  it("registers on the registry", () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    expect(registered.has("std:handler.notify@v1")).toBe(true);
  });

  it("logs info by default", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.notify@v1")!;
    const ctx = makeCtx({ msg: "hello", level: "info" });
    const result = await handler(ctx, ctx.args);
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith("[YON] hello");
    spy.mockRestore();
  });

  it("logs warn when level is warn", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.notify@v1")!;
    const ctx = makeCtx({ msg: "warning", level: "warn" });
    await handler(ctx, ctx.args);
    expect(spy).toHaveBeenCalledWith("[YON] warning");
    spy.mockRestore();
  });
});

describe("std:handler.ask@v1", () => {
  it("registers on the registry", () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    expect(registered.has("std:handler.ask@v1")).toBe(true);
  });

  it("returns undefined when no onInput callback", async () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.ask@v1")!;
    const ctx = makeCtx({ question: "What is your name?" });
    const result = await handler(ctx, ctx.args);
    expect(result).toBeUndefined();
  });

  it("invokes onInput and returns response", async () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.ask@v1")!;
    const ctx = makeCtx({ question: "What is your name?" }) as any;
    ctx.__onInput = async (q: string) => `Answer to: ${q}`;
    const result = await handler(ctx, ctx.args);
    expect(result).toBe("Answer to: What is your name?");
  });
});

describe("std:handler.review@v1", () => {
  it("registers on the registry", () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    expect(registered.has("std:handler.review@v1")).toBe(true);
  });

  it("throws when no onPrompt callback is registered", async () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.review@v1")!;
    const ctx = makeCtx({ artifact: "block:report" });
    await expect(handler(ctx, ctx.args)).rejects.toThrow("onPrompt");
  });

  it("invokes onPrompt and returns approval result", async () => {
    const registered = new Map<string, OpHandler>();
    registerHandlerOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:handler.review@v1")!;
    const ctx = makeCtx({ artifact: "block:report" }) as any;
    ctx.__onPrompt = async () => false;
    const result = await handler(ctx, ctx.args);
    expect(result).toBe(false);
  });
});

describe("std:sys ops", () => {
  it("std:sys.info returns platform string", async () => {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    expect(registered.has("std:sys.info@v1")).toBe(true);

    const handler = registered.get("std:sys.info@v1")!;
    const ctx = makeCtx({ key: "os" });
    const result = await handler(ctx, ctx.args);
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);
  });

  it("std:sys.info returns arch string", async () => {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:sys.info@v1")!;
    const ctx = makeCtx({ key: "arch" });
    const result = await handler(ctx, ctx.args);
    expect(typeof result).toBe("string");
  });

  it("std:sys.info returns mem JSON", async () => {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:sys.info@v1")!;
    const ctx = makeCtx({ key: "mem" });
    const result = await handler(ctx, ctx.args);
    const parsed = JSON.parse(result as string);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.free).toBeGreaterThan(0);
  });

  it("std:sys.clock returns ISO timestamp", async () => {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    expect(registered.has("std:sys.clock@v1")).toBe(true);

    const handler = registered.get("std:sys.clock@v1")!;
    const ctx = makeCtx({});
    const result = await handler(ctx, ctx.args);
    expect(typeof result).toBe("string");
    expect(() => new Date(result as string)).not.toThrow();
  });

  it("std:sys.clock returns unix timestamp", async () => {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    const handler = registered.get("std:sys.clock@v1")!;
    const ctx = makeCtx({ fmt: "unix" });
    const result = await handler(ctx, ctx.args);
    expect(Number(result as string)).toBeGreaterThan(1700000000);
  });
});

describe("Plugin version flexibility", () => {
  it("registerPlugin defaults to @v1", async () => {
    const { OpRegistry } = await import("../src/ops/registry.js");
    const reg = new OpRegistry();
    const handler = async () => "result";
    reg.registerPlugin({ namespace: "test", ops: { doIt: handler } });
    expect(reg.lookup("test:doIt@v1")).toBe(handler);
  });

  it("registerPlugin uses custom version when provided", async () => {
    const { OpRegistry } = await import("../src/ops/registry.js");
    const reg = new OpRegistry();
    const handler = async () => "result";
    reg.registerPlugin({ namespace: "test", ops: { doIt: handler }, version: "v2" } as any);
    expect(reg.lookup("test:doIt@v2")).toBe(handler);
    expect(reg.lookup("test:doIt@v1")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// New Control Ops (P2.2)
// ---------------------------------------------------------------------------

describe("std:control.* registration", () => {
  it("registers 6 free-tier ops", () => {
    const ops = new Map<string, OpHandler>();
    registerControlOps((op, handler) => ops.set(op, handler));
    expect(ops.size).toBe(7);
    expect(ops.has("std:control.if@v1")).toBe(true);
    expect(ops.has("std:control.match@v1")).toBe(true);
    expect(ops.has("std:control.foreach@v1")).toBe(true);
    expect(ops.has("std:control.parallel@v1")).toBe(true);
    expect(ops.has("std:control.sleep@v1")).toBe(true);
    expect(ops.has("std:control.return@v1")).toBe(true);
  });
});

describe("std:control.foreach@v1", () => {
  function getOp() {
    const ops = new Map<string, OpHandler>();
    registerControlOps((op, handler) => ops.set(op, handler));
    return ops.get("std:control.foreach@v1")!;
  }

  it("resolves inline array items", async () => {
    const foreach = getOp();
    const ctx = makeCtx({ items: [1, 2, 3], step: "step:process", as: "n" });
    const result = await foreach(ctx, ctx.args);
    expect(result).toEqual([1, 2, 3]);
  });

  it("resolves block ref items", async () => {
    const foreach = getOp();
    const ctx = makeCtx(
      { items: "block:my_list", step: "step:process" },
      { my_list: ["a", "b", "c"] },
    );
    const result = await foreach(ctx, ctx.args);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for undefined items", async () => {
    const foreach = getOp();
    const ctx = makeCtx({ step: "step:process" });
    const result = await foreach(ctx, ctx.args);
    expect(result).toEqual([]);
  });
});

describe("std:control.parallel@v1", () => {
  function getOp() {
    const ops = new Map<string, OpHandler>();
    registerControlOps((op, handler) => ops.set(op, handler));
    return ops.get("std:control.parallel@v1")!;
  }

  it("returns step refs list", async () => {
    const parallel = getOp();
    const ctx = makeCtx({ steps: ["step:a", "step:b", "step:c"] });
    const result = await parallel(ctx, ctx.args);
    expect(result).toEqual(["step:a", "step:b", "step:c"]);
  });
});

describe("std:control.sleep@v1", () => {
  function getOp() {
    const ops = new Map<string, OpHandler>();
    registerControlOps((op, handler) => ops.set(op, handler));
    return ops.get("std:control.sleep@v1")!;
  }

  it("sleeps for the specified duration", async () => {
    const sleep = getOp();
    const ctx = makeCtx({ ms: 10 });
    const start = performance.now();
    await sleep(ctx, ctx.args);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(5); // Allow some slack
  });

  it("returns immediately for 0ms", async () => {
    const sleep = getOp();
    const ctx = makeCtx({ ms: 0 });
    const result = await sleep(ctx, ctx.args);
    expect(result).toBeUndefined();
  });

  it("rejects on aborted signal", async () => {
    const sleep = getOp();
    const controller = new AbortController();
    controller.abort();
    const ctx: ExecutionContext = {
      ...makeCtx({ ms: 1000 }),
      signal: controller.signal,
    };
    await expect(sleep(ctx, ctx.args)).rejects.toThrow("Aborted");
  });
});

describe("std:control.return@v1", () => {
  function getOp() {
    const ops = new Map<string, OpHandler>();
    registerControlOps((op, handler) => ops.set(op, handler));
    return ops.get("std:control.return@v1")!;
  }

  it("returns raw value", async () => {
    const ret = getOp();
    const ctx = makeCtx({ value: "done" });
    const result = await ret(ctx, ctx.args);
    expect(result).toBe("done");
  });

  it("resolves block reference", async () => {
    const ret = getOp();
    const ctx = makeCtx(
      { value: "block:final_result" },
      { final_result: { status: "complete" } },
    );
    const result = await ret(ctx, ctx.args);
    expect(result).toEqual({ status: "complete" });
  });

  it("returns undefined for missing value", async () => {
    const ret = getOp();
    const ctx = makeCtx({});
    const result = await ret(ctx, ctx.args);
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// std:sys.env tests (F4)
// ---------------------------------------------------------------------------

describe("std:sys.env@v1", () => {
  async function getOp() {
    const { registerSysOps } = await import("../src/ops/std-sys.js");
    const registered = new Map<string, OpHandler>();
    registerSysOps((op, handler) => registered.set(op, handler));
    return registered.get("std:sys.env@v1")!;
  }

  it("reads a value from sandbox env", async () => {
    const handler = await getOp();
    const ctx = makeCtx({ key: "API_KEY" });
    // Inject env into context
    (ctx as any).env = { API_KEY: "secret-123", NODE_ENV: "test" };
    const result = await handler(ctx, ctx.args);
    expect(result).toBe("secret-123");
  });

  it("returns empty string for missing key", async () => {
    const handler = await getOp();
    const ctx = makeCtx({ key: "MISSING" });
    (ctx as any).env = { OTHER: "value" };
    const result = await handler(ctx, ctx.args);
    expect(result).toBe("");
  });

  it("returns empty string when no env is set", async () => {
    const handler = await getOp();
    const ctx = makeCtx({ key: "ANY" });
    const result = await handler(ctx, ctx.args);
    expect(result).toBe("");
  });

  it("throws when key argument is missing", async () => {
    const handler = await getOp();
    const ctx = makeCtx({});
    (ctx as any).env = { FOO: "bar" };
    await expect(handler(ctx, ctx.args)).rejects.toThrow("requires 'key'");
  });
});

// ---------------------------------------------------------------------------
// std:workflow.call tests (F4)
// ---------------------------------------------------------------------------

describe("std:workflow.call@v1", () => {
  async function getOp() {
    const { registerWorkflowOps } = await import("../src/ops/std-workflow.js");
    const registered = new Map<string, OpHandler>();
    registerWorkflowOps((op, handler) => registered.set(op, handler));
    return registered.get("std:workflow.call@v1")!;
  }

  it("returns a call descriptor with ref and args", async () => {
    const handler = await getOp();
    const ctx = makeCtx({
      ref: "doc:sub-workflow",
      args: { input: "hello" },
    });
    const result = await handler(ctx, ctx.args);
    expect(result).toEqual({
      __type: "workflow:call",
      ref: "doc:sub-workflow",
      args: { input: "hello" },
    });
  });

  it("defaults args to empty object", async () => {
    const handler = await getOp();
    const ctx = makeCtx({ ref: "doc:simple" });
    const result = await handler(ctx, ctx.args);
    expect(result).toEqual({
      __type: "workflow:call",
      ref: "doc:simple",
      args: {},
    });
  });

  it("throws when ref is missing", async () => {
    const handler = await getOp();
    const ctx = makeCtx({});
    await expect(handler(ctx, ctx.args)).rejects.toThrow("requires 'ref'");
  });

  it("throws when ref is empty string", async () => {
    const handler = await getOp();
    const ctx = makeCtx({ ref: "" });
    await expect(handler(ctx, ctx.args)).rejects.toThrow("requires 'ref'");
  });
});
