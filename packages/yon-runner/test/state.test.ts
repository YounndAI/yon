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
 * Conformance tests — State Management
 *
 * Covers: F5 (file:/url: prefixes), N4 (doc completeness)
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveReference, InMemoryBlockRegistry, resolveInputs, bindOutputs } from "../src/state.js";
import { Sandbox } from "../src/sandbox.js";

describe("resolveReference", () => {
  const blocks = new InMemoryBlockRegistry();
  blocks.set("myblock", "block-value");
  blocks.set("config1", { key: "val" });

  describe("block: prefix", () => {
    it("resolves block reference", async () => {
      expect(await resolveReference("block:myblock", blocks)).toBe("block-value");
    });

    it("throws E004 for missing block", async () => {
      await expect(resolveReference("block:missing", blocks)).rejects.toThrow();
    });
  });

  describe("ref: prefix", () => {
    it("resolves ref reference (alias for block)", async () => {
      expect(await resolveReference("ref:myblock", blocks)).toBe("block-value");
    });

    it("throws E004 for missing ref", async () => {
      await expect(resolveReference("ref:missing", blocks)).rejects.toThrow();
    });
  });

  describe("rid: prefix", () => {
    it("resolves rid reference", async () => {
      blocks.set("step-1", "step-output");
      expect(await resolveReference("rid:step-1", blocks)).toBe("step-output");
    });
  });

  describe("cfg: prefix", () => {
    it("resolves cfg reference", async () => {
      expect(await resolveReference("cfg:config1", blocks)).toEqual({ key: "val" });
    });
  });

  describe("F5: file: prefix", () => {
    it("returns a __fileRef marker object when no sandbox", async () => {
      const result = await resolveReference("file:./data.csv", blocks);
      expect(result).toEqual({ __fileRef: "./data.csv" });
    });

    it("preserves the full path after prefix", async () => {
      const result = await resolveReference("file:/absolute/path.txt", blocks) as { __fileRef: string };
      expect(result.__fileRef).toBe("/absolute/path.txt");
    });
  });

  describe("F5: url: prefix", () => {
    it("throws when no sandbox is provided for url: references", async () => {
      await expect(resolveReference("url:https://example.com", blocks)).rejects.toThrow();
    });
  });

  describe("F5: url: prefix SSRF gate", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("blocks url:http://169.254.169.254/... via validateHttpUrl (E103), fetch not called", async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const sandbox = new Sandbox({ root: "/workspace", network: true }, false);
      await expect(
        resolveReference("url:http://169.254.169.254/latest/meta-data/", blocks, "rid-ssrf", sandbox),
      ).rejects.toMatchObject({ code: "E103" });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("blocks url:file:///etc/passwd via scheme whitelist (E103), fetch not called", async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const sandbox = new Sandbox({ root: "/workspace", network: true }, false);
      await expect(
        resolveReference("url:file:///etc/passwd", blocks, "rid-file", sandbox),
      ).rejects.toMatchObject({ code: "E103" });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("blocks url:http://[fcab::1]/ via ULA fc00::/7 (E103), fetch not called", async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const sandbox = new Sandbox({ root: "/workspace", network: true }, false);
      await expect(
        resolveReference("url:http://[fcab::1]/", blocks, "rid-ula", sandbox),
      ).rejects.toMatchObject({ code: "E103" });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("allows url:https://public.example.com/... when sandbox.unsafeHttp=false but host is public", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "public-body",
      });
      vi.stubGlobal("fetch", fetchSpy);
      const sandbox = new Sandbox({ root: "/workspace", network: true }, false);
      const result = await resolveReference(
        "url:https://public.example.com/x",
        blocks,
        "rid-ok",
        sandbox,
      );
      expect(result).toBe("public-body");
      expect(fetchSpy).toHaveBeenCalledWith("https://public.example.com/x");
    });
  });

  describe("bare value", () => {
    it("returns as literal string", async () => {
      expect(await resolveReference("hello world", blocks)).toBe("hello world");
    });
  });
});

describe("InMemoryBlockRegistry", () => {
  it("stores and retrieves values", () => {
    const reg = new InMemoryBlockRegistry();
    reg.set("a", 42);
    expect(reg.get("a")).toBe(42);
    expect(reg.has("a")).toBe(true);
    expect(reg.has("b")).toBe(false);
  });

  it("lists keys", () => {
    const reg = new InMemoryBlockRegistry();
    reg.set("x", 1);
    reg.set("y", 2);
    expect(reg.keys()).toEqual(["x", "y"]);
  });

  it("toMap returns a copy", () => {
    const reg = new InMemoryBlockRegistry();
    reg.set("a", 1);
    const map = reg.toMap();
    expect(map.get("a")).toBe(1);
    map.set("b", 2);
    expect(reg.has("b")).toBe(false);
  });
});

describe("resolveInputs", () => {
  it("resolves multiple refs into a Map", async () => {
    const blocks = new InMemoryBlockRegistry();
    blocks.set("data", "content");
    const result = await resolveInputs(["block:data", "literal"], blocks, "r1");
    expect(result.get("block:data")).toBe("content");
    expect(result.get("literal")).toBe("literal");
  });
});

describe("bindOutputs", () => {
  it("stores value under output keys", () => {
    const blocks = new InMemoryBlockRegistry();
    bindOutputs(["block:out1", "ref:out2", "bare"], "result", blocks);
    expect(blocks.get("out1")).toBe("result");
    expect(blocks.get("out2")).toBe("result");
    expect(blocks.get("bare")).toBe("result");
  });
});
