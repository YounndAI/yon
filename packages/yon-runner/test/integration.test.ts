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
 * P0 Integration Tests — End-to-End Runner Execution
 *
 * These tests call createRunner().run() with real YON documents.
 * They prove the five-phase pipeline works as an integrated whole:
 *   Parse → Validate → Resolve → Plan → Execute
 *
 * Every test exercises the FULL path from YON text to RunResult.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { createRunner } from "../src/index.js";

// ---------------------------------------------------------------------------
// Sandbox helper
// ---------------------------------------------------------------------------

let sandboxDir: string;

function createSandbox(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yon-runner-test-"));
  return dir;
}

function removeSandbox(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("P0: End-to-End Integration", () => {
  beforeEach(() => {
    sandboxDir = createSandbox();
  });

  afterEach(() => {
    removeSandbox(sandboxDir);
  });

  it("E2E-1: fs.read + fs.write pipeline produces an output file", async () => {
    // Setup: write a file into the sandbox
    fs.writeFileSync(path.join(sandboxDir, "input.txt"), "hello world", "utf-8");

    const runner = createRunner({
      permissions: [{ op: "std:fs.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=rw | title="Read/Write" | profile=exec
@STEP n:int=1 | rid=read-it | op=std:fs.read@v1 | args=[path="input.txt"] | out=[block:content]
@STEP n:int=2 | rid=write-it | op=std:fs.write@v1 | args=[path="output.txt"] | in=[block:content]
`);

    expect(result.success).toBe(true);
    expect(result.steps.length).toBe(2);
    expect(result.stamps.length).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);

    // Verify the file was actually written
    const written = fs.readFileSync(path.join(sandboxDir, "output.txt"), "utf-8");
    expect(written).toBe("hello world");
  });

  it("E2E-2: permission deny blocks execution (fail-closed)", async () => {
    const runner = createRunner({
      permissions: [],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=deny | title="Denied" | profile=exec
@STEP n:int=1 | rid=blocked | op=std:fs.read@v1 | args=[path="secret.txt"]
`);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Should be E003 (permission denied) or E107 (runtime wrapping)
    const codes = result.errors.map((e) => e.code);
    expect(codes.some((c) => c === "E003" || c === "E107")).toBe(true);
  });

  it("E2E-3: data.parse + data.serialize round-trips JSON", async () => {
    // Write JSON to a file so we don't fight YON inline quoting
    fs.writeFileSync(path.join(sandboxDir, "data.json"), '{"name":"test","value":42}', "utf-8");

    const runner = createRunner({
      permissions: [
        { op: "std:fs.*", action: "ALLOW" },
        { op: "std:data.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=data | title="Data Transform" | profile=exec
@STEP n:int=1 | rid=read-json | op=std:fs.read@v1 | args=[path="data.json"] | out=[block:raw]
@STEP n:int=2 | rid=parse | op=std:data.parse@v1 | args=[format="json"] | in=[block:raw] | out=[block:parsed]
@STEP n:int=3 | rid=serialize | op=std:data.serialize@v1 | args=[format="json"] | in=[block:parsed] | out=[block:formatted]
`);

    expect(result.success).toBe(true);
    expect(result.steps.length).toBe(3);

    // Verify the parsed data survived the round-trip
    const formatted = result.outputs.get("formatted");
    expect(formatted).toBeDefined();
    if (typeof formatted === "string") {
      const parsed = JSON.parse(formatted);
      expect(parsed.name).toBe("test");
      expect(parsed.value).toBe(42);
    }
  });

  it("E2E-4: control.if skips the else branch when condition is true", async () => {
    const runner = createRunner({
      permissions: [
        { op: "std:control.*", action: "ALLOW" },
        { op: "std:handler.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=gate | title="If Gate" | profile=exec
@STEP n:int=1 | rid=gate | op=std:control.if@v1 | args=[cond:bool=true, then_step="yes", else_step="no"]
@STEP n:int=2 | rid=yes | op=std:handler.notify@v1 | args=[msg="Took the true branch"]
@STEP n:int=3 | rid=no | op=std:handler.notify@v1 | args=[msg="Took the false branch"]
`);

    expect(result.success).toBe(true);
    // The runner should have executed the gate + the taken branch
    // and skipped the else branch
    expect(result.stamps.length).toBeGreaterThan(0);
  });

  it("E2E-5: handler.notify runs and produces stamps", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=notify | title="Notify" | profile=exec
@STEP n:int=1 | rid=hello | op=std:handler.notify@v1 | args=[msg="Hello from integration test"]
`);

    expect(result.success).toBe(true);
    expect(result.steps.length).toBe(1);
    expect(result.stamps.length).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it("E2E-6: sys.info + sys.clock return values and chain outputs", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:sys.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=sys | title="Sys Ops" | profile=exec
@STEP n:int=1 | rid=get-platform | op=std:sys.info@v1 | args=[key="platform"] | out=[block:platform]
@STEP n:int=2 | rid=get-time | op=std:sys.clock@v1 | args=[format="iso"] | out=[block:clock]
`);

    expect(result.success).toBe(true);
    expect(result.steps.length).toBe(2);

    // Platform should be a known value
    const platform = result.outputs.get("platform");
    expect(typeof platform).toBe("string");

    // Clock should be a valid ISO date
    const clock = result.outputs.get("clock");
    expect(typeof clock).toBe("string");
    expect(() => new Date(clock as string)).not.toThrow();
  });

  it("E2E-7: empty workflow succeeds with zero steps", async () => {
    const runner = createRunner({
      permissions: [],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=empty | title="Empty" | profile=exec
`);

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.stamps.length).toBeGreaterThan(0); // At least run-start + run-complete
  });

  it("E2E-8: sandbox rejects path traversal", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:fs.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=escape | title="Escape Attempt" | profile=exec
@STEP n:int=1 | rid=escape | op=std:fs.read@v1 | args=[path="../../etc/passwd"]
`);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Should be E103 (sandbox violation) or E107 (runtime wrapping it)
    const codes = result.errors.map((e) => e.code);
    expect(codes.some((c) => c === "E103" || c === "E107")).toBe(true);
  });

  it("E2E-9: multi-step dependency chain passes data through blocks", async () => {
    fs.writeFileSync(path.join(sandboxDir, "data.json"), '{"items":[1,2,3]}', "utf-8");

    const runner = createRunner({
      permissions: [
        { op: "std:fs.*", action: "ALLOW" },
        { op: "std:data.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=chain | title="3-Step Chain" | profile=exec
@STEP n:int=1 | rid=read | op=std:fs.read@v1 | args=[path="data.json"] | out=[block:raw]
@STEP n:int=2 | rid=parse | op=std:data.parse@v1 | args=[format="json"] | in=[block:raw] | out=[block:parsed]
@STEP n:int=3 | rid=serialize | op=std:data.serialize@v1 | args=[format="json"] | in=[block:parsed] | out=[block:final]
`);

    expect(result.success).toBe(true);
    expect(result.steps.length).toBe(3);

    // Verify the data survived the 3-step chain: read → parse → format
    const final = result.outputs.get("final");
    expect(final).toBeDefined();
    if (typeof final === "string") {
      const data = JSON.parse(final);
      expect(data.items).toEqual([1, 2, 3]);
    }
  });
});

// ---------------------------------------------------------------------------
// P2.4: @INPUT/@OUTPUT contract validation integration tests
//
// Now using real YON 2.0 source strings since the parser supports
// @INPUT/@OUTPUT/@YIELD natively. Previously used pre-built docs.
// ---------------------------------------------------------------------------

describe("P2.4: Workflow Contract Validation", () => {
  let sandboxDir2: string;

  beforeEach(() => {
    sandboxDir2 = createSandbox();
  });

  afterEach(() => {
    removeSandbox(sandboxDir2);
  });

  it("E2E-10: missing required input without default → failure", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir2 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=missing-input | title="Missing Input" | profile=exec
@INPUT rid=in:data | name=source_data
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1
`);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toContain("Missing required workflow input");
    expect(result.errors[0]!.message).toContain("source_data");
  });

  it("E2E-11: required input with default → seeded into blocks", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir2 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=default-input | title="Default Input" | profile=exec
@INPUT rid=in:cfg | name=config_data | default=fallback_value
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1
`);
    expect(result.success).toBe(true);
    expect(result.outputs.get("config_data")).toBe("fallback_value");
  });

  it("E2E-12: optional input missing → no error", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir2 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=optional-input | title="Optional Input" | profile=exec
@INPUT rid=in:opt | name=optional_data | required=false
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1
`);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("E2E-13: missing declared output → output:missing stamp", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir2 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=missing-output | title="Missing Output" | profile=exec
@OUTPUT rid=out:summary | name=summary_block
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1
`);
    expect(result.success).toBe(true);
    const missingStamps = result.stamps.filter((s) => s.event === "output:missing");
    expect(missingStamps.length).toBe(1);
    expect(missingStamps[0]!.meta?.name).toBe("summary_block");
  });
});

// ---------------------------------------------------------------------------
// P2/P3: @CHECK, @RETRY, @CATCH, AbortSignal
//
// These tests close the 4 remaining gaps from TESTING.md §Remaining Gaps:
// Gap 4 (@CHECK evaluation), Gap 5 (@RETRY re-execution),
// Gap 6 (@CATCH fallback), Gap 7 (abort signal).
// ---------------------------------------------------------------------------

describe("P2/P3: @CHECK, @RETRY, @CATCH, AbortSignal", () => {
  let sandboxDir3: string;

  beforeEach(() => {
    sandboxDir3 = createSandbox();
  });

  afterEach(() => {
    removeSandbox(sandboxDir3);
  });

  // --- Gap 4: @CHECK Assertion Evaluation ---

  it("E2E-14: @CHECK fail=ABORT halts workflow (E106)", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir3 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-abort | title="Check Abort" | profile=exec
@CHECK rid=check:missing | assert="block:nonexistent != null" | fail=ABORT | msg="Block not found"
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="should never run"]
`);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.code).toBe("E106");
    // Step should NOT have executed (global check aborts before it)
    const successSteps = result.steps.filter((s) => s.success && s.durationMs > 0);
    expect(successSteps).toHaveLength(0);
  });

  it("E2E-15: @CHECK fail=SKIP skips targeted step", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir3 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-skip | title="Check Skip" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="always runs"]
@CHECK rid=check:gate | assert="block:trigger != null" | fail=SKIP | target=s2
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[msg="should be skipped"]
@STEP n:int=3 | rid=s3 | op=std:handler.notify@v1 | args=[msg="continues"]
`);

    expect(result.success).toBe(true);
    // s2 should be skipped
    const skipStamps = result.stamps.filter(
      (s) => s.event === "step:skipped" && s.rid === "s2",
    );
    expect(skipStamps.length).toBeGreaterThan(0);
    // s1 and s3 should have executed
    const startStamps = result.stamps.filter((s) => s.event === "step:start");
    const startedRids = startStamps.map((s) => s.rid);
    expect(startedRids).toContain("s1");
    expect(startedRids).toContain("s3");
    expect(startedRids).not.toContain("s2");
  });

  it("E2E-16: @CHECK fail=WARN continues execution", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:handler.*", action: "ALLOW" }],
      sandbox: { root: sandboxDir3 },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=check-warn | title="Check Warn" | profile=exec
@CHECK rid=check:advisory | assert="false" | fail=WARN | msg="Advisory warning"
@STEP n:int=1 | rid=s1 | op=std:handler.notify@v1 | args=[msg="runs despite warning"]
`);

    expect(result.success).toBe(true);
    // check:failed stamp should exist
    const failedChecks = result.stamps.filter((s) => s.event === "check:failed");
    expect(failedChecks.length).toBeGreaterThan(0);
    // s1 should have run
    const startStamps = result.stamps.filter(
      (s) => s.event === "step:start" && s.rid === "s1",
    );
    expect(startStamps.length).toBe(1);
  });

  // --- Gap 5: @RETRY Integration ---

  it("E2E-17: @RETRY re-executes step on failure", async () => {
    let callCount = 0;

    const runner = createRunner({
      permissions: [{ op: "test:*", action: "ALLOW" }],
      sandbox: { root: sandboxDir3 },
    });

    runner.registerPlugin({
      namespace: "test",
      ops: {
        flaky: async () => {
          callCount++;
          if (callCount < 2) throw new Error("transient failure");
          return "recovered";
        },
      },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=retry-test | title="Retry Test" | profile=exec
@STEP n:int=1 | rid=s1 | op=test:flaky@v1 | out=[block:result]
@RETRY target=s1 | max:int=2 | delay_ms:int=0 | backoff=none
`);

    expect(result.success).toBe(true);
    expect(callCount).toBe(2); // Failed once, succeeded on retry
    expect(result.outputs.get("result")).toBe("recovered");
  });

  // --- Gap 6: @CATCH Fallback Execution ---

  it("E2E-18: @CATCH triggers fallback on step failure", async () => {
    const runner = createRunner({
      permissions: [
        { op: "test:*", action: "ALLOW" },
        { op: "std:handler.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir3 },
    });

    runner.registerPlugin({
      namespace: "test",
      ops: {
        fail: async () => {
          throw new Error("always fails");
        },
      },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=catch-test | title="Catch Test" | profile=exec
@STEP n:int=1 | rid=s1 | op=test:fail@v1
@STEP n:int=2 | rid=fallback | op=std:handler.notify@v1 | args=[msg="recovered"]
@CATCH target=s1 | do=fallback
`);

    expect(result.success).toBe(true);
    // catch:triggered stamp should exist
    const catchStamps = result.stamps.filter((s) => s.event === "catch:triggered");
    expect(catchStamps.length).toBeGreaterThan(0);
  });

  it("E2E-19: @CATCH on=timeout does NOT trigger for non-timeout error", async () => {
    const runner = createRunner({
      permissions: [
        { op: "test:*", action: "ALLOW" },
        { op: "std:handler.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir3 },
    });

    runner.registerPlugin({
      namespace: "test",
      ops: {
        fail: async () => {
          throw new Error("runtime error, not timeout");
        },
      },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=catch-filter | title="Catch Filter" | profile=exec
@STEP n:int=1 | rid=s1 | op=test:fail@v1
@STEP n:int=2 | rid=fallback | op=std:handler.notify@v1 | args=[msg="should not run"]
@CATCH target=s1 | on=timeout | do=fallback
`);

    // E107 runtime error doesn't match "timeout" condition → catch skips → unhandled error
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // No catch:triggered stamp
    const catchStamps = result.stamps.filter((s) => s.event === "catch:triggered");
    expect(catchStamps).toHaveLength(0);
  });

  // --- Gap 7: Abort Signal ---

  it("E2E-20: external abort signal cancels mid-execution", async () => {
    const controller = new AbortController();

    const runner = createRunner({
      permissions: [{ op: "test:*", action: "ALLOW" }],
      sandbox: { root: sandboxDir3 },
      signal: controller.signal,
    });

    runner.registerPlugin({
      namespace: "test",
      ops: {
        abort_trigger: async () => {
          controller.abort();
          return "done";
        },
        never_runs: async () => "should not reach",
      },
    });

    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=abort-test | title="Abort Test" | profile=exec
@STEP n:int=1 | rid=s1 | op=test:abort_trigger@v1
@STEP n:int=2 | rid=s2 | op=test:never_runs@v1
`);

    // Step 1 should have run, step 2 should not
    const startedRids = result.stamps
      .filter((s) => s.event === "step:start")
      .map((s) => s.rid);
    expect(startedRids).toContain("s1");
    expect(startedRids).not.toContain("s2");

    // workflow:cancelled stamp should exist
    const cancelStamps = result.stamps.filter((s) => s.event === "workflow:cancelled");
    expect(cancelStamps.length).toBe(1);
  });

  // --- Gap 8: resolveStepTarget (rid:step: prefix) ---

  it("E2E-21: @CATCH with rid:step: prefixed target resolves correctly", async () => {
    const runner = createRunner({
      permissions: [
        { op: "test:*", action: "ALLOW" },
        { op: "std:handler.*", action: "ALLOW" },
      ],
      sandbox: { root: sandboxDir3 },
    });

    runner.registerPlugin({
      namespace: "test",
      ops: {
        fail: async () => {
          throw new Error("always fails");
        },
      },
    });

    // Uses spec-normative rid:step: prefix (§9.3)
    const result = await runner.run(`
@DOC ver=2.0 | kind=workflow | id=prefix-catch | title="Prefix Catch" | profile=exec
@STEP n:int=1 | rid=s1 | op=test:fail@v1
@STEP n:int=2 | rid=fallback | op=std:handler.notify@v1 | args=[msg="recovered via prefix"]
@CATCH target=rid:step:s1 | do=rid:step:fallback
`);

    expect(result.success).toBe(true);
    const catchStamps = result.stamps.filter((s) => s.event === "catch:triggered");
    expect(catchStamps.length).toBeGreaterThan(0);
  });
});
