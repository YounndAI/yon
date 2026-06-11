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
 * Tests for stream execution (Phase 1 — runStream).
 */
import { describe, it, expect, vi } from "vitest";
import { createRunner } from "../src/index.js";
import type { RunnerStreamEvent, RunnerTelemetry } from "../src/types.js";

// Helper: Create an async iterable from string chunks
async function* chunksFrom(lines: string[]): AsyncIterable<string> {
  for (const line of lines) {
    yield line + "\n";
  }
}

describe("runStream", () => {
  it("processes a single document stream", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:*", action: "ALLOW" }],
    });

    const events: RunnerStreamEvent[] = [];
    const source = chunksFrom([
      '@DOC ver=2.0 | kind=workflow | id=test | title="Stream Test" | profile=exec | fmt=MIN',
      "@STEP rid=s1 | n=1 | op=std:data.parse@v1 | text='{\"x\":1}' | format=json",
    ]);

    for await (const event of runner.runStream(source)) {
      events.push(event);
    }

    // Should have: doc:start, step events, doc:end, end
    const types = events.map((e) => e.type);
    expect(types).toContain("doc:start");
    expect(types).toContain("doc:end");
    expect(types[types.length - 1]).toBe("end");
  });

  it("emits doc:end with step results", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:*", action: "ALLOW" }],
    });

    const events: RunnerStreamEvent[] = [];
    const source = chunksFrom([
      '@DOC ver=2.0 | kind=workflow | id=test | title="Test" | profile=exec | fmt=MIN',
      "@STEP rid=s1 | n=1 | op=std:data.parse@v1 | text='{\"x\":1}' | format=json",
    ]);

    for await (const event of runner.runStream(source)) {
      events.push(event);
    }

    const docEnd = events.find((e) => e.type === "doc:end") as any;
    expect(docEnd).toBeDefined();
    expect(docEnd.summary).toHaveProperty("steps");
    expect(docEnd.summary).toHaveProperty("stamps");
    // Steps should exist regardless of success/failure
    expect(Array.isArray(docEnd.summary.steps)).toBe(true);
  });

  it("handles abort signal", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:*", action: "ALLOW" }],
    });

    const controller = new AbortController();
    // Abort immediately
    controller.abort();

    const events: RunnerStreamEvent[] = [];
    const source = chunksFrom([
      '@DOC ver=2.0 | kind=workflow | id=test | title="Test" | profile=exec | fmt=MIN',
      "@STEP rid=s1 | n=1 | op=std:data.parse@v1 | text='{\"x\":1}' | format=json",
    ]);

    for await (const event of runner.runStream(source, { signal: controller.signal })) {
      events.push(event);
    }

    const endEvent = events.find((e) => e.type === "end") as any;
    expect(endEvent).toBeDefined();
    expect(endEvent.aborted).toBe(true);
  });

  it("fires telemetry hooks", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:*", action: "ALLOW" }],
    });

    const streamEvents: RunnerStreamEvent[] = [];
    const telemetry: RunnerTelemetry = {
      onStreamEvent: (e) => streamEvents.push(e),
    };

    const source = chunksFrom([
      '@DOC ver=2.0 | kind=workflow | id=test | title="Test" | profile=exec | fmt=MIN',
      "@STEP rid=s1 | n=1 | op=std:data.parse@v1 | text='{\"x\":1}' | format=json",
    ]);

    // Drain the generator
    for await (const _ of runner.runStream(source, { telemetry })) {
      // events collected via telemetry
    }

    expect(streamEvents.length).toBeGreaterThan(0);
    expect(streamEvents.map((e) => e.type)).toContain("doc:start");
  });

  it("handles multi-doc streams", async () => {
    const runner = createRunner({
      permissions: [{ op: "std:*", action: "ALLOW" }],
    });

    const events: RunnerStreamEvent[] = [];
    const source = chunksFrom([
      '@DOC ver=2.0 | kind=workflow | id=test1 | title="Doc 1" | profile=exec | fmt=MIN',
      "@STEP rid=s1 | n=1 | op=std:data.parse@v1 | text='{\"a\":1}' | format=json",
      "",
      '@DOC ver=2.0 | kind=workflow | id=test2 | title="Doc 2" | profile=exec | fmt=MIN',
      "@STEP rid=s2 | n=1 | op=std:data.parse@v1 | text='{\"b\":2}' | format=json",
    ]);

    for await (const event of runner.runStream(source)) {
      events.push(event);
    }

    const docStarts = events.filter((e) => e.type === "doc:start");
    const docEnds = events.filter((e) => e.type === "doc:end");
    expect(docStarts.length).toBe(2);
    expect(docEnds.length).toBe(2);
  });
});

describe("listOps", () => {
  it("returns all registered ops", () => {
    const runner = createRunner();
    const ops = runner.listOps();

    expect(Array.isArray(ops)).toBe(true);
    expect(ops.length).toBeGreaterThan(0);
    // Should include fs, data, control, etc.
    expect(ops.some((op) => op.startsWith("std:fs."))).toBe(true);
    expect(ops.some((op) => op.startsWith("std:data."))).toBe(true);
    expect(ops.some((op) => op.startsWith("std:control."))).toBe(true);
  });

  it("includes plugin ops after registration", () => {
    const runner = createRunner();
    runner.registerPlugin({
      namespace: "custom",
      ops: { "my.op": async () => "test" },
    });

    const ops = runner.listOps();
    expect(ops.some((op) => op.includes("custom:my.op"))).toBe(true);
  });
});
