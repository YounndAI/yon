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
 * YON Runner — HTTP Ops (std:http.*)
 *
 * Implements YSL §3 (Network & HTTP) — 7 operations.
 *
 * Risk Levels:
 * - 🟡 MEDIUM: get, post, put, patch, delete, head (network access)
 * - 🔴 HIGH:   download (mutates filesystem)
 *
 * All operations require `network: true` in the sandbox config.
 * The runner's permission engine gates each op individually.
 */

import { writeFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import type { OpHandler } from "../types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// NOTE: HTTP permission gating is handled at the executor level via
// PermissionEngine.check() (executor.ts). Individual ops do NOT perform
// permission checks, but they do enforce executor-injected sandbox hooks.
//
// URL allowlist gating (RunnerConfig.httpAllowlist) is layered on top of
// PermissionEngine: the executor decides whether the op may run at all;
// the allowlist below decides whether the specific URL is reachable.
// ---------------------------------------------------------------------------

/**
 * Hostname-only private/loopback/metadata-range check.
 * NOTE: hostname-string check only — DNS rebinding protection is a v2.1
 * follow-up (RunnerConfig.dnsRebindingProtection opt-in).
 */
function isPrivateOrLoopbackHostname(hostname: string): boolean {
  // Strip brackets from IPv6 literals (WHATWG keeps them in .hostname) and
  // a single trailing dot from FQDN-style hostnames (`localhost.`).
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");

  // Cloud metadata sentinel (security-critical; must block independently
  // of the broader 169.254.0.0/16 range below).
  if (host === "169.254.169.254") return true;

  // IPv4-mapped IPv6 (::ffff:a.b.c.d). WHATWG normalizes the dotted-decimal
  // portion into two 16-bit hex hextets — `::ffff:127.0.0.1` arrives as
  // `::ffff:7f00:1`. Extract the embedded v4 and recurse-check.
  const v4MappedMatch = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(host);
  if (v4MappedMatch) {
    const high = parseInt(v4MappedMatch[1]!, 16);
    const low = parseInt(v4MappedMatch[2]!, 16);
    const v4 = `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
    if (isPrivateOrLoopbackHostname(v4)) return true;
  }

  // IPv4-compatible IPv6 (::a.b.c.d, deprecated by RFC 4291 §2.5.5.1 but
  // still routed by some legacy stacks). Same parse-and-recurse as above,
  // distinguished from the mapped form by the absence of `ffff:`.
  const v4CompatMatch = /^::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(host);
  if (v4CompatMatch && !host.startsWith("::ffff:")) {
    const high = parseInt(v4CompatMatch[1]!, 16);
    const low = parseInt(v4CompatMatch[2]!, 16);
    const v4 = `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
    if (isPrivateOrLoopbackHostname(v4)) return true;
  }

  // IPv4 loopback
  if (host.startsWith("127.")) return true;
  if (host === "0.0.0.0") return true;
  if (host === "localhost") return true;

  // IPv4 RFC 1918 private ranges
  if (host.startsWith("10.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return true;
  if (host.startsWith("192.168.")) return true;

  // IPv4 link-local (CIDR 169.254.0.0/16)
  if (host.startsWith("169.254.")) return true;

  // IPv6 loopback
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;

  // IPv6 unspecified address (::/128) — `[::]` collapsed by WHATWG, plus
  // the fully-expanded form.
  if (host === "::" || host === "0:0:0:0:0:0:0:0") return true;

  // IPv6 link-local (fe80::/10)
  if (host.startsWith("fe80:")) return true;

  // IPv6 unique local (RFC 4193, fc00::/7) — any address whose first byte
  // is 0xFC or 0xFD. First hextet starts with `fc` or `fd` plus 0-2 hex
  // chars (full hextet width = 4). Catches fcab::1, fc02:abcd::, etc.
  if (/^f[cd][0-9a-f]{0,2}:/.test(host)) return true;

  return false;
}

/**
 * Validate an outbound HTTP URL against three sync security checks:
 *   1. Scheme whitelist (https:, http: only) → E103
 *   2. Credentials-in-URL: strip in place, surface warning to caller
 *   3. Private-IP / loopback / cloud-metadata hostname block → E103
 *
 * All three checks are bypassed when `unsafeHttp === true`.
 */
export function validateHttpUrl(
  urlString: string,
  unsafeHttp: boolean,
): { url: URL; warning?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`E103 sandbox violation: Invalid URL "${urlString}"`);
  }

  // Check 1 — scheme whitelist
  if (!unsafeHttp) {
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(
        `E103 sandbox violation: Scheme "${parsed.protocol}" not permitted (allowed: https:, http:)`,
      );
    }
  }

  // Check 2 — credentials-in-URL
  let warning: string | undefined;
  if (parsed.username !== "" || parsed.password !== "") {
    if (unsafeHttp) {
      // Preserve credentials; log a stderr line per request.
      console.warn("[yon-runner] unsafeHttp=true preserves URL credentials");
    } else {
      parsed.username = "";
      parsed.password = "";
      warning = "Credentials in URL were stripped before request (use Authorization header instead)";
    }
  }

  // Check 3 — private-IP block (hostname-only, no DNS resolve)
  if (!unsafeHttp) {
    const hostname = parsed.hostname.toLowerCase();
    if (isPrivateOrLoopbackHostname(hostname)) {
      throw new Error(
        `E103 sandbox violation: Hostname "${hostname}" resolves to private/loopback/metadata range; blocked by default. Set RunnerConfig.unsafeHttp:true to bypass.`,
      );
    }
  }

  return { url: parsed, warning };
}

/**
 * Build the URL gate from an allowlist. Three modes:
 *   - undefined   → returns a no-op gate (preserves v2.0 behavior)
 *   - []          → returns a deny-all gate
 *   - populated   → returns a match-required gate (string=prefix, RegExp=.test)
 */
function buildUrlGate(
  allowlist: readonly (string | RegExp)[] | undefined,
): (url: string, op: string) => void {
  if (allowlist === undefined) {
    return () => { /* no-op: unchanged behavior */ };
  }
  if (allowlist.length === 0) {
    return (url, op) => {
      throw new Error(
        `${op} denied by httpAllowlist (deny-all): ${url}`,
      );
    };
  }
  return (url, op) => {
    for (const entry of allowlist) {
      if (typeof entry === "string") {
        if (url.startsWith(entry)) return;
      } else if (entry.test(url)) {
        return;
      }
    }
    throw new Error(
      `${op} denied by httpAllowlist (no match): ${url}`,
    );
  };
}

/**
 * Parse headers from args. Accepts a map, a JSON string, or undefined.
 */
function parseHeaders(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && raw !== null) {
    return raw as Record<string, string>;
  }
  return {};
}

/**
 * Resolve body content from args. Can be a block reference or a string.
 */
function resolveBody(
  raw: unknown,
  ctx: Parameters<OpHandler>[0],
): string | undefined {
  if (!raw) return undefined;
  const key = String(raw);
  // If it looks like a block reference, resolve from the block registry
  if (key.startsWith("block:")) {
    const blockId = key.slice(6);
    const blockContent = ctx.blocks.get(blockId);
    if (blockContent === undefined) return key;
    return typeof blockContent === "string"
      ? blockContent
      : JSON.stringify(blockContent);
  }
  return key;
}

function resolveSandboxPath(ctx: Parameters<OpHandler>[0], path: string): string {
  if (ctx.__resolveSandboxPath) {
    return ctx.__resolveSandboxPath(path);
  }

  const root = resolve(ctx.sandboxRoot);
  const resolved = resolve(root, path);
  const rel = relative(root, resolved);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(
      `Path traversal detected: ${path} escapes sandbox root`,
    );
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Ops
// ---------------------------------------------------------------------------

/**
 * std:http.get@v1 — Perform HTTP GET.
 *
 * In:  url (string), headers (map, optional)
 * Out: block (response body)
 */
const httpGet: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.get requires 'url' argument");

  const headers = parseHeaders(ctx.args["headers"]);
  const response = await fetch(url, {
    method: "GET",
    headers,
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP GET ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

/**
 * std:http.post@v1 — Perform HTTP POST.
 *
 * In:  url (string), body (block ref or string), headers (map, optional)
 * Out: block (response body)
 */
const httpPost: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.post requires 'url' argument");

  const body = resolveBody(ctx.args["body"], ctx);
  const headers = parseHeaders(ctx.args["headers"]);

  // Auto-set content-type if not provided and body looks like JSON
  if (body && !headers["content-type"] && !headers["Content-Type"]) {
    try {
      JSON.parse(body);
      headers["content-type"] = "application/json";
    } catch {
      // Not JSON, leave content-type unset
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP POST ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

/**
 * std:http.put@v1 — Perform HTTP PUT.
 *
 * In:  url (string), body (block ref or string), headers (map, optional)
 * Out: block (response body)
 */
const httpPut: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.put requires 'url' argument");

  const body = resolveBody(ctx.args["body"], ctx);
  const headers = parseHeaders(ctx.args["headers"]);

  if (body && !headers["content-type"] && !headers["Content-Type"]) {
    try {
      JSON.parse(body);
      headers["content-type"] = "application/json";
    } catch {
      // Not JSON
    }
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body,
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP PUT ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

/**
 * std:http.patch@v1 — Perform HTTP PATCH.
 *
 * In:  url (string), body (block ref or string), headers (map, optional)
 * Out: block (response body)
 */
const httpPatch: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.patch requires 'url' argument");

  const body = resolveBody(ctx.args["body"], ctx);
  const headers = parseHeaders(ctx.args["headers"]);

  if (body && !headers["content-type"] && !headers["Content-Type"]) {
    try {
      JSON.parse(body);
      headers["content-type"] = "application/json";
    } catch {
      // Not JSON
    }
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body,
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP PATCH ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

/**
 * std:http.delete@v1 — Perform HTTP DELETE.
 *
 * In:  url (string), headers (map, optional)
 * Out: block (response body)
 */
const httpDelete: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.delete requires 'url' argument");

  const headers = parseHeaders(ctx.args["headers"]);
  const response = await fetch(url, {
    method: "DELETE",
    headers,
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP DELETE ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

/**
 * std:http.head@v1 — Fetch headers only.
 *
 * In:  url (string)
 * Out: map (response headers as key-value pairs)
 */
const httpHead: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.head requires 'url' argument");

  const response = await fetch(url, {
    method: "HEAD",
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP HEAD ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  // Convert Headers to a plain object
  const result: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

/**
 * std:http.download@v1 — Stream large file to disk. 🔴 HIGH RISK.
 *
 * In:  url (string), dest_path (string relative to sandbox root)
 * Out: bool (true on success)
 */
const httpDownload: OpHandler = async (ctx) => {
  // Permission gating is handled by the executor's PermissionEngine.
  const url = String(ctx.args["url"] ?? "");
  if (!url) throw new Error("std:http.download requires 'url' argument");

  const destPath = String(ctx.args["dest_path"] ?? "");
  if (!destPath) {
    throw new Error("std:http.download requires 'dest_path' argument");
  }

  // Sandbox path resolution — prevent path traversal
  const resolvedPath = resolveSandboxPath(ctx, destPath);

  const response = await fetch(url, {
    method: "GET",
    signal: ctx.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP DOWNLOAD ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error(`HTTP DOWNLOAD ${url} returned empty body`);
  }

  // Read the response body and write to file
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(resolvedPath, buffer);

  return true;
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerHttpOps(
  register: (op: string, handler: OpHandler) => void,
  allowlist?: readonly (string | RegExp)[],
  unsafeHttp: boolean = false,
): void {
  const gate = buildUrlGate(allowlist);
  const gated = (opName: string, handler: OpHandler): OpHandler =>
    async (ctx, args) => {
      ctx.__checkNetwork?.();
      const url = String(ctx.args["url"] ?? "");
      if (url) {
        const { url: validated, warning } = validateHttpUrl(url, unsafeHttp);
        if (warning) console.warn(`[yon-runner] ${warning}`);
        const canonical = validated.toString();
        if (canonical !== url) ctx.args["url"] = canonical;
        gate(canonical, opName);
      }
      return handler(ctx, args);
    };
  register("std:http.get@v1", gated("std:http.get@v1", httpGet));
  register("std:http.post@v1", gated("std:http.post@v1", httpPost));
  register("std:http.put@v1", gated("std:http.put@v1", httpPut));
  register("std:http.patch@v1", gated("std:http.patch@v1", httpPatch));
  register("std:http.delete@v1", gated("std:http.delete@v1", httpDelete));
  register("std:http.head@v1", gated("std:http.head@v1", httpHead));
  register("std:http.download@v1", gated("std:http.download@v1", httpDownload));
}
