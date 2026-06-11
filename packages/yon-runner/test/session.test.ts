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
 * Conformance tests — Session Manager
 *
 * Covers: create, checkpoint, recover, TTL expiry.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionManager } from "../src/session.js";
import { InMemoryBlockRegistry } from "../src/state.js";

describe("SessionManager", () => {
  it("starts with no active session", () => {
    const sm = new SessionManager();
    expect(sm.isActive()).toBe(false);
    expect(sm.getConfig()).toBeNull();
  });

  it("creates a session", () => {
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 0 });
    expect(sm.isActive()).toBe(true);
    expect(sm.getConfig()?.rid).toBe("sess-1");
  });

  it("checkpoints and recovers", () => {
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 0 });

    const blocks = new InMemoryBlockRegistry();
    blocks.set("a", 42);
    blocks.set("b", "hello");

    sm.checkpoint(
      { rid: "cp-1", label: "step-3" },
      blocks,
      [{ rid: "s1", n: 1, success: true, durationMs: 10 }],
    );

    const cp = sm.recover({ rid: "rec-1", from: "step-3" });
    expect(cp).not.toBeNull();
    expect(cp!.label).toBe("step-3");
    expect(cp!.blocks.get("a")).toBe(42);
    expect(cp!.blocks.get("b")).toBe("hello");
    expect(cp!.stepResults).toHaveLength(1);
  });

  it("recover returns null for unknown checkpoint", () => {
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 0 });
    const cp = sm.recover({ rid: "rec-1", from: "nonexistent" });
    expect(cp).toBeNull();
  });

  it("includes only specified keys when includes is set", () => {
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 0 });

    const blocks = new InMemoryBlockRegistry();
    blocks.set("a", 1);
    blocks.set("b", 2);
    blocks.set("c", 3);

    sm.checkpoint(
      { rid: "cp-1", label: "partial", includes: ["a", "c"] },
      blocks,
      [],
    );

    const cp = sm.recover({ rid: "rec-1", from: "partial" });
    expect(cp!.blocks.size).toBe(2);
    expect(cp!.blocks.has("a")).toBe(true);
    expect(cp!.blocks.has("b")).toBe(false);
    expect(cp!.blocks.has("c")).toBe(true);
  });

  it("TTL expiry deactivates session", () => {
    vi.useFakeTimers();
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 1000 });
    expect(sm.isActive()).toBe(true);

    vi.advanceTimersByTime(1001);
    expect(sm.isActive()).toBe(false);
    vi.useRealTimers();
  });

  it("getCheckpointLabels returns all labels", () => {
    const sm = new SessionManager();
    sm.create({ rid: "sess-1", durability: "ephemeral", ttl: 0 });

    const blocks = new InMemoryBlockRegistry();
    sm.checkpoint({ rid: "cp-1", label: "alpha" }, blocks, []);
    sm.checkpoint({ rid: "cp-2", label: "beta" }, blocks, []);

    expect(sm.getCheckpointLabels()).toEqual(["alpha", "beta"]);
  });
});
