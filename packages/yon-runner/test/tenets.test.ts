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
 * Conformance tests — Tenet Engine
 *
 * Covers: TenetEngine load, merge, check, extraction from YonRecord.
 */

import { describe, it, expect, vi } from "vitest";
import { TenetEngine } from "../src/tenets.js";
import type { ResolvedTenet } from "../src/types.js";

const makeTenet = (overrides: Partial<ResolvedTenet> = {}): ResolvedTenet => ({
  rid: "t-1",
  level: "L2",
  content: "No PII in logs",
  precedence: 10,
  decay: 0,
  source: "runner",
  ...overrides,
});

describe("TenetEngine", () => {
  it("loads runner tenets and returns them via getAll()", () => {
    const engine = new TenetEngine();
    engine.loadRunnerTenets([makeTenet({ rid: "t-1" }), makeTenet({ rid: "t-2" })]);
    expect(engine.getAll()).toHaveLength(2);
    expect(engine.getAll()[0]!.source).toBe("runner");
  });

  it("merges document tenets additively (no runner rid conflict)", () => {
    const engine = new TenetEngine();
    engine.loadRunnerTenets([makeTenet({ rid: "t-1" })]);
    engine.mergeDocumentTenets([
      makeTenet({ rid: "t-2", source: "document" }),
      makeTenet({ rid: "t-1", source: "document" }), // Should be filtered: runner owns t-1
    ]);
    expect(engine.getAll()).toHaveLength(2);
    // t-1 is runner, t-2 is document
    const sources = engine.getAll().map((t) => t.source);
    expect(sources).toContain("runner");
    expect(sources).toContain("document");
  });

  it("getAll() sorts by precedence descending", () => {
    const engine = new TenetEngine();
    engine.loadRunnerTenets([
      makeTenet({ rid: "low", precedence: 1 }),
      makeTenet({ rid: "high", precedence: 100 }),
      makeTenet({ rid: "mid", precedence: 50 }),
    ]);
    const all = engine.getAll();
    expect(all[0]!.rid).toBe("high");
    expect(all[1]!.rid).toBe("mid");
    expect(all[2]!.rid).toBe("low");
  });

  it("check() returns null when no callback is set", async () => {
    const engine = new TenetEngine();
    engine.loadRunnerTenets([makeTenet()]);
    const err = await engine.check("rid-1", "std:fs.read", {});
    expect(err).toBeNull();
  });

  it("check() returns null when callback approves", async () => {
    const cb = vi.fn().mockResolvedValue(true);
    const engine = new TenetEngine(cb);
    engine.loadRunnerTenets([makeTenet()]);
    const err = await engine.check("rid-1", "std:fs.read", {});
    expect(err).toBeNull();
    expect(cb).toHaveBeenCalledOnce();
  });

  it("check() returns E109 when callback rejects", async () => {
    const cb = vi.fn().mockResolvedValue(false);
    const engine = new TenetEngine(cb);
    engine.loadRunnerTenets([makeTenet()]);
    const err = await engine.check("rid-1", "std:fs.read", {});
    expect(err).not.toBeNull();
    expect(err!.code).toBe("E109");
    expect(err!.message).toContain("tenet check");
  });

  it("check() returns null when no tenets are loaded", async () => {
    const cb = vi.fn();
    const engine = new TenetEngine(cb);
    const err = await engine.check("rid-1", "std:fs.read", {});
    expect(err).toBeNull();
    expect(cb).not.toHaveBeenCalled();
  });

  it("hasTenets() reflects loaded state", () => {
    const engine = new TenetEngine();
    expect(engine.hasTenets()).toBe(false);
    engine.loadRunnerTenets([makeTenet()]);
    expect(engine.hasTenets()).toBe(true);
  });
});
