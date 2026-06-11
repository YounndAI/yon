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
 * Conformance tests — HTTP Ops (std:http.*)
 *
 * Covers: YSL §3 (Network & HTTP) — 7 operations.
 * Uses globalThis.fetch mocking via vi.stubGlobal.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRunner } from "../src/index.js";
import { registerHttpOps } from "../src/ops/std-http.js";
import type { ExecutionContext, BlockRegistry, OpHandler } from "../src/types.js";
import { writeFile } from "node:fs/promises";

// Mock node:fs/promises for download tests
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(
  args: Record<string, unknown> = {},
  blockData: Record<string, unknown> = {},
): ExecutionContext {
  const store = new Map(Object.entries(blockData));
  return {
    sandboxRoot: "/workspace",
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

/**
 * Collect all registered ops from registerHttpOps.
 */
function getOps(): Map<string, OpHandler> {
  const ops = new Map<string, OpHandler>();
  registerHttpOps((op, handler) => ops.set(op, handler));
  return ops;
}

// ---------------------------------------------------------------------------
// Fetch mock
// ---------------------------------------------------------------------------

function mockFetchSuccess(body: unknown, contentType = "application/json") {
  const headers = new Headers({ "content-type": contentType });
  if (contentType === "application/json") {
    headers.set("x-request-id", "test-123");
  }

  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    headers,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
    arrayBuffer: () => Promise.resolve(Buffer.from(JSON.stringify(body)).buffer),
    body: true, // Truthy to indicate body exists
  });
}

function mockFetchFailure(status: number, statusText: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    headers: new Headers(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("std:http.* registration", () => {
  it("registers all 7 ops", () => {
    const ops = getOps();
    expect(ops.has("std:http.get@v1")).toBe(true);
    expect(ops.has("std:http.post@v1")).toBe(true);
    expect(ops.has("std:http.put@v1")).toBe(true);
    expect(ops.has("std:http.patch@v1")).toBe(true);
    expect(ops.has("std:http.delete@v1")).toBe(true);
    expect(ops.has("std:http.head@v1")).toBe(true);
    expect(ops.has("std:http.download@v1")).toBe(true);
    expect(ops.size).toBe(7);
  });
});

describe("std:http.* sandbox enforcement", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks HTTP ops when sandbox.network is false", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess({ ok: true }));
    const runner = createRunner({
      permissions: [{ op: "std:http.*", action: "ALLOW" }],
      sandbox: { root: "/workspace", network: false },
    });

    const result = await runner.run(`
@DOC ver=2.0 | id=http-denied | kind=workflow | profile=exec
@STEP n:int=1 | rid=fetch-weather | op=std:http.get@v1 | args=[url="https://api.example.com/weather"]
`);

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("E103");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("std:http.get@v1", () => {
  const ops = getOps();
  const httpGet = ops.get("std:http.get@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ temp: 22, city: "Tokyo" }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("performs GET and returns JSON body", async () => {
    const ctx = makeCtx({ url: "https://api.example.com/weather" });
    const result = await httpGet(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/weather", {
      method: "GET",
      headers: {},
      signal: ctx.signal,
    });
    expect(result).toEqual({ temp: 22, city: "Tokyo" });
  });

  it("passes custom headers", async () => {
    const ctx = makeCtx({
      url: "https://api.example.com/data",
      headers: { Authorization: "Bearer token123" },
    });
    await httpGet(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/data", expect.objectContaining({
      headers: { Authorization: "Bearer token123" },
    }));
  });

  it("returns text for non-JSON responses", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess("Hello World", "text/plain"));
    const ctx = makeCtx({ url: "https://example.com/text" });
    const result = await httpGet(ctx, ctx.args);
    expect(result).toBe("Hello World");
  });

  it("throws on missing url", async () => {
    const ctx = makeCtx({});
    await expect(httpGet(ctx, ctx.args)).rejects.toThrow("requires 'url'");
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetchFailure(404, "Not Found"));
    const ctx = makeCtx({ url: "https://api.example.com/missing" });
    await expect(httpGet(ctx, ctx.args)).rejects.toThrow("404 Not Found");
  });
});

describe("std:http.post@v1", () => {
  const ops = getOps();
  const httpPost = ops.get("std:http.post@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ id: 1, created: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("performs POST with JSON body", async () => {
    const ctx = makeCtx({
      url: "https://api.example.com/items",
      body: '{"name":"Widget"}',
    });
    const result = await httpPost(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items", expect.objectContaining({
      method: "POST",
      body: '{"name":"Widget"}',
    }));
    expect(result).toEqual({ id: 1, created: true });
  });

  it("auto-sets content-type for JSON body", async () => {
    const ctx = makeCtx({
      url: "https://api.example.com/items",
      body: '{"key":"value"}',
    });
    await httpPost(ctx, ctx.args);

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].headers["content-type"]).toBe("application/json");
  });

  it("resolves block reference for body", async () => {
    const ctx = makeCtx(
      { url: "https://api.example.com/items", body: "block:payload" },
      { payload: { name: "Widget" } },
    );
    await httpPost(ctx, ctx.args);

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].body).toBe('{"name":"Widget"}');
  });

  it("throws on missing url", async () => {
    const ctx = makeCtx({ body: "test" });
    await expect(httpPost(ctx, ctx.args)).rejects.toThrow("requires 'url'");
  });
});

describe("std:http.put@v1", () => {
  const ops = getOps();
  const httpPut = ops.get("std:http.put@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ updated: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("performs PUT with body", async () => {
    const ctx = makeCtx({
      url: "https://api.example.com/items/1",
      body: '{"name":"Updated"}',
    });
    await httpPut(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items/1", expect.objectContaining({
      method: "PUT",
    }));
  });
});

describe("std:http.patch@v1", () => {
  const ops = getOps();
  const httpPatch = ops.get("std:http.patch@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ patched: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("performs PATCH with body", async () => {
    const ctx = makeCtx({
      url: "https://api.example.com/items/1",
      body: '{"status":"active"}',
    });
    await httpPatch(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items/1", expect.objectContaining({
      method: "PATCH",
    }));
  });
});

describe("std:http.delete@v1", () => {
  const ops = getOps();
  const httpDelete = ops.get("std:http.delete@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ deleted: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("performs DELETE", async () => {
    const ctx = makeCtx({ url: "https://api.example.com/items/1" });
    await httpDelete(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items/1", expect.objectContaining({
      method: "DELETE",
    }));
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetchFailure(403, "Forbidden"));
    const ctx = makeCtx({ url: "https://api.example.com/items/1" });
    await expect(httpDelete(ctx, ctx.args)).rejects.toThrow("403 Forbidden");
  });
});

describe("std:http.head@v1", () => {
  const ops = getOps();
  const httpHead = ops.get("std:http.head@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
        "content-length": "1234",
        "x-custom": "test-value",
      }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns headers as map", async () => {
    const ctx = makeCtx({ url: "https://api.example.com/status" });
    const result = await httpHead(ctx, ctx.args) as Record<string, string>;

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/status", expect.objectContaining({
      method: "HEAD",
    }));
    expect(result["content-type"]).toBe("application/json");
    expect(result["content-length"]).toBe("1234");
    expect(result["x-custom"]).toBe("test-value");
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetchFailure(500, "Internal Server Error"));
    const ctx = makeCtx({ url: "https://api.example.com/status" });
    await expect(httpHead(ctx, ctx.args)).rejects.toThrow("500");
  });
});

describe("std:http.download@v1", () => {
  const ops = getOps();
  const httpDownload = ops.get("std:http.download@v1")!;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      body: true,
      arrayBuffer: () => Promise.resolve(Buffer.from("file-content").buffer),
    }));
    (writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("downloads file to sandbox path", async () => {
    const ctx = makeCtx({
      url: "https://cdn.example.com/file.zip",
      dest_path: "downloads/file.zip",
    });
    const result = await httpDownload(ctx, ctx.args);

    expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/file.zip", expect.objectContaining({
      method: "GET",
    }));
    expect(writeFile).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("rejects path traversal attempts", async () => {
    const ctx = makeCtx({
      url: "https://cdn.example.com/file.zip",
      dest_path: "../../etc/passwd",
    });
    await expect(httpDownload(ctx, ctx.args)).rejects.toThrow("Path traversal");
  });

  it("rejects Windows sibling-prefix sandbox escapes", async () => {
    vi.mocked(writeFile).mockClear();
    const ctx = makeCtx({
      url: "https://cdn.example.com/file.zip",
      dest_path: "..\\workspace2\\file.zip",
    });
    ctx.sandboxRoot = "C:\\workspace";

    await expect(httpDownload(ctx, ctx.args)).rejects.toThrow("Path traversal");
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("throws on missing url", async () => {
    const ctx = makeCtx({ dest_path: "output.zip" });
    await expect(httpDownload(ctx, ctx.args)).rejects.toThrow("requires 'url'");
  });

  it("throws on missing dest_path", async () => {
    const ctx = makeCtx({ url: "https://cdn.example.com/file.zip" });
    await expect(httpDownload(ctx, ctx.args)).rejects.toThrow("requires 'dest_path'");
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetchFailure(403, "Forbidden"));
    const ctx = makeCtx({
      url: "https://cdn.example.com/file.zip",
      dest_path: "output.zip",
    });
    await expect(httpDownload(ctx, ctx.args)).rejects.toThrow("403 Forbidden");
  });
});

// ---------------------------------------------------------------------------
// httpAllowlist gating (RunnerConfig.httpAllowlist)
// ---------------------------------------------------------------------------

function getGatedOps(allowlist: readonly (string | RegExp)[] | undefined): Map<string, OpHandler> {
  const ops = new Map<string, OpHandler>();
  registerHttpOps((op, handler) => ops.set(op, handler), allowlist);
  return ops;
}

describe("std:http.* httpAllowlist", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("undefined allowlist preserves v2.0 behavior (no gating)", async () => {
    const get = getGatedOps(undefined).get("std:http.get@v1")!;
    const ctx = makeCtx({ url: "https://anywhere.example.com/x" });
    await expect(get(ctx, ctx.args)).resolves.toEqual({ ok: true });
  });

  it("empty allowlist denies all std:http.* invocations", async () => {
    const get = getGatedOps([]).get("std:http.get@v1")!;
    const ctx = makeCtx({ url: "https://anywhere.example.com/x" });
    await expect(get(ctx, ctx.args)).rejects.toThrow(
      "std:http.get@v1 denied by httpAllowlist (deny-all): https://anywhere.example.com/x",
    );
  });

  it("string entries match by prefix", async () => {
    const get = getGatedOps(["https://api.example.com/"]).get("std:http.get@v1")!;
    const allowed = makeCtx({ url: "https://api.example.com/weather" });
    const denied = makeCtx({ url: "https://evil.example.com/weather" });
    await expect(get(allowed, allowed.args)).resolves.toEqual({ ok: true });
    await expect(get(denied, denied.args)).rejects.toThrow(
      "std:http.get@v1 denied by httpAllowlist (no match): https://evil.example.com/weather",
    );
  });

  it("RegExp entries match via .test()", async () => {
    const post = getGatedOps([/^https:\/\/[a-z0-9-]+\.example\.com\//]).get("std:http.post@v1")!;
    const allowed = makeCtx({ url: "https://api.example.com/submit" });
    const denied = makeCtx({ url: "https://evil.attacker.net/submit" });
    await expect(post(allowed, allowed.args)).resolves.toEqual({ ok: true });
    await expect(post(denied, denied.args)).rejects.toThrow(
      "std:http.post@v1 denied by httpAllowlist (no match)",
    );
  });

  it("gates apply across all 7 ops (get, post, put, patch, delete, head, download)", async () => {
    const ops = getGatedOps([]);
    const ctx = makeCtx({ url: "https://anywhere.example.com/x", dest_path: "out.bin" });
    for (const opName of ["std:http.get@v1", "std:http.post@v1", "std:http.put@v1", "std:http.patch@v1", "std:http.delete@v1", "std:http.head@v1", "std:http.download@v1"]) {
      const handler = ops.get(opName)!;
      await expect(handler(ctx, ctx.args)).rejects.toThrow("denied by httpAllowlist (deny-all)");
    }
  });
});

// ---------------------------------------------------------------------------
// HTTP security defaults — F-R006 closure
// ---------------------------------------------------------------------------

function getSecurityOps(unsafeHttp: boolean = false): Map<string, OpHandler> {
  const ops = new Map<string, OpHandler>();
  registerHttpOps((op, handler) => ops.set(op, handler), undefined, unsafeHttp);
  return ops;
}

describe("std:http.* security defaults (F-R006 closure)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects non-http(s) schemes with E103", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of [
      "file:///etc/passwd",
      "data:text/plain;base64,SGVsbG8=",
      "ftp://files.example.com/x",
      "gopher://example.com/0/x",
      "blob:https://example.com/abc-123",
    ]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Scheme ".*" not permitted/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts https: and http: schemes with public hostnames", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    const ctxHttps = makeCtx({ url: "https://example.com/x" });
    await expect(get(ctxHttps, ctxHttps.args)).resolves.toEqual({ ok: true });
    const ctxHttp = makeCtx({ url: "http://example.com/x" });
    await expect(get(ctxHttp, ctxHttp.args)).resolves.toEqual({ ok: true });
  });

  it("blocks IPv4 loopback hostnames (127.0.0.1, localhost, 0.0.0.0)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of ["http://127.0.0.1/", "http://localhost/", "http://0.0.0.0/"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private\/loopback\/metadata/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv4 RFC 1918 private ranges (10/8, 172.16-31/12, 192.168/16)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of ["http://10.0.0.1/", "http://192.168.1.1/", "http://172.20.0.1/"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv4 link-local AND the cloud-metadata sentinel (169.254.169.254)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    // Generic link-local
    const ctxLL = makeCtx({ url: "http://169.254.0.1/" });
    await expect(get(ctxLL, ctxLL.args)).rejects.toThrow(
      /E103 sandbox violation: Hostname "169\.254\.0\.1" resolves to private/,
    );
    // Cloud-metadata sentinel — explicit verification
    const ctxMeta = makeCtx({ url: "http://169.254.169.254/latest/meta-data/" });
    await expect(get(ctxMeta, ctxMeta.args)).rejects.toThrow(
      /Hostname "169\.254\.169\.254" resolves to private\/loopback\/metadata range/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv6 loopback (::1) and link-local (fe80::1)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of ["http://[::1]/", "http://[fe80::1]/"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("strips credentials from URL, emits warning, mutates ctx.args.url", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ctx = makeCtx({ url: "https://user:pass@example.com/x" });
    await expect(get(ctx, ctx.args)).resolves.toEqual({ ok: true });
    expect(ctx.args["url"]).toBe("https://example.com/x");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Credentials in URL were stripped before request"),
    );
    const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[0]).toBe("https://example.com/x");
    warnSpy.mockRestore();
  });

  it("unsafeHttp:true emits init warning via createRunner and bypasses all 3 checks", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // (a) createRunner({unsafeHttp:true}) emits a one-time init warning
    createRunner({ unsafeHttp: true });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("WARNING: unsafeHttp=true bypasses HTTP security defaults"),
    );
    warnSpy.mockClear();

    // (b) Direct op invocation with unsafeHttp=true bypasses all 3 checks
    const get = getSecurityOps(true).get("std:http.get@v1")!;

    // private-IP bypass
    const ctxIp = makeCtx({ url: "http://127.0.0.1/x" });
    await expect(get(ctxIp, ctxIp.args)).resolves.toEqual({ ok: true });

    // credentials preserved (not stripped), per-request stderr warning
    const ctxCreds = makeCtx({ url: "https://user:pass@example.com/x" });
    await expect(get(ctxCreds, ctxCreds.args)).resolves.toEqual({ ok: true });
    expect(ctxCreds.args["url"]).toBe("https://user:pass@example.com/x");
    expect(warnSpy).toHaveBeenCalledWith(
      "[yon-runner] unsafeHttp=true preserves URL credentials",
    );

    // scheme bypass under unsafeHttp:true — `file:///etc/passwd`
    // proceeds (mocked fetch). Confirms the scheme check is also bypassed,
    // not only the credentials/private-IP checks.
    const ctxFile = makeCtx({ url: "file:///etc/passwd" });
    await expect(get(ctxFile, ctxFile.args)).resolves.toEqual({ ok: true });

    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// HTTP security defaults — edge cases
// ---------------------------------------------------------------------------

describe("std:http.* security defaults — edge cases", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchSuccess({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks IPv6 ULA across the full fc00::/7 range (not only fc00:/fd00: prefixes)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of ["http://[fcab::1]/", "http://[fc02:abcd::]/", "http://[fdff:1234::]/"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv4-mapped IPv6 (::ffff:a.b.c.d) for loopback and cloud-metadata", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    // [::ffff:127.0.0.1] → WHATWG-normalized to [::ffff:7f00:1]
    const ctxLoop = makeCtx({ url: "http://[::ffff:127.0.0.1]/" });
    await expect(get(ctxLoop, ctxLoop.args)).rejects.toThrow(
      /E103 sandbox violation: Hostname ".*" resolves to private/,
    );
    // [::ffff:a9fe:a9fe] = mapped form of 169.254.169.254 (cloud-metadata sentinel)
    const ctxMeta = makeCtx({ url: "http://[::ffff:a9fe:a9fe]/" });
    await expect(get(ctxMeta, ctxMeta.args)).rejects.toThrow(
      /E103 sandbox violation: Hostname ".*" resolves to private/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv4-compatible IPv6 (::a.b.c.d, deprecated) for loopback", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    // [::127.0.0.1] → WHATWG-normalized to [::7f00:1] (no ffff: prefix)
    const ctx = makeCtx({ url: "http://[::127.0.0.1]/" });
    await expect(get(ctx, ctx.args)).rejects.toThrow(
      /E103 sandbox violation: Hostname ".*" resolves to private/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks IPv6 unspecified address (::) in both forms", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    // WHATWG collapses both `[::]` and `[0:0:0:0:0:0:0:0]` to `::`.
    for (const url of ["http://[::]/", "http://[0:0:0:0:0:0:0:0]/"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks trailing-dot hostnames (localhost., 127.0.0.1.)", async () => {
    const get = getSecurityOps().get("std:http.get@v1")!;
    for (const url of ["http://localhost./", "http://127.0.0.1./"]) {
      const ctx = makeCtx({ url });
      await expect(get(ctx, ctx.args)).rejects.toThrow(
        /E103 sandbox violation: Hostname ".*" resolves to private/,
      );
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});
