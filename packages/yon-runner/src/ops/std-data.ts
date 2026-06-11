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
 * YON Runner — std:data.* Operations
 *
 * Pure data transformation operations. Always safe (🟢).
 * Implements YSL §5 (Data Processing).
 */

import type { OpHandler } from "../types.js";

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** std:data.parse@v1 — Parse JSON/YAML/CSV to object. */
export const dataParse: OpHandler = async (ctx) => {
  const text = String(ctx.args["text"] ?? ctx.inputs.values().next().value ?? "");
  const format = String(ctx.args["format"] ?? "json").toLowerCase();

  switch (format) {
    case "json":
      return JSON.parse(text);
    case "csv": {
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length === 0) return [];
      const headers = lines[0]!.split(",").map((h) => h.trim());
      return lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
        return obj;
      });
    }
    default:
      return text; // Fallback, return as-is
  }
};

/** std:data.serialize@v1 — Serialize object to string. */
export const dataSerialize: OpHandler = async (ctx) => {
  const data = ctx.args["data"] ?? ctx.inputs.values().next().value;
  const format = String(ctx.args["format"] ?? "json").toLowerCase();

  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    default:
      return String(data);
  }
};

/** std:data.extract@v1 — Extract structured JSON from unstructured text. */
export const dataExtract: OpHandler = async (ctx) => {
  const source = String(ctx.args["source"] ?? ctx.inputs.values().next().value ?? "");
  // Simple JSON extraction: find first { ... } or [ ... ]
  const jsonMatch = source.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]!);
    } catch {
      return source;
    }
  }
  return source;
};

/** std:data.regex@v1 — Find all regex matches. */
export const dataRegex: OpHandler = async (ctx) => {
  const pattern = String(ctx.args["pattern"] ?? "");
  const text = String(ctx.args["text"] ?? ctx.inputs.values().next().value ?? "");
  const regex = new RegExp(pattern, "g");
  return [...text.matchAll(regex)].map((m) => m[0]);
};

/** std:data.json_merge@v1 — Merge two JSON objects. */
export const dataJsonMerge: OpHandler = async (ctx) => {
  const base = ctx.args["base"] ?? ctx.inputs.get("base") ?? {};
  const override = ctx.args["override"] ?? ctx.inputs.get("override") ?? {};
  return { ...(typeof base === "object" ? base : {}), ...(typeof override === "object" ? override : {}) };
};

/** std:data.render@v1 — Render a template with variables. */
export const dataRender: OpHandler = async (ctx) => {
  const template = String(ctx.args["template"] ?? ctx.inputs.values().next().value ?? "");
  const vars = (ctx.args["vars"] ?? {}) as Record<string, unknown>;

  // Simple Mustache-style: {{key}} → value
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return String(vars[key] ?? `{{${key}}}`);
  });
};

/** std:data.validate@v1 — Validate data against JSON Schema (basic). */
export const dataValidate: OpHandler = async (ctx) => {
  const data = ctx.args["data"] ?? ctx.inputs.values().next().value;
  const schema = ctx.args["schema"];

  // Basic type validation (full JSON Schema validation would require a library)
  if (!schema || typeof schema !== "object") return true;

  const s = schema as Record<string, unknown>;
  if (s["type"] === "object" && typeof data !== "object") return false;
  if (s["type"] === "array" && !Array.isArray(data)) return false;
  if (s["type"] === "string" && typeof data !== "string") return false;
  if (s["type"] === "number" && typeof data !== "number") return false;

  return true;
};

/** std:data.hash@v1 — Compute hash. */
export const dataHash: OpHandler = async (ctx) => {
  const data = String(ctx.args["data"] ?? ctx.inputs.values().next().value ?? "");
  const algo = String(ctx.args["algo"] ?? "sha256");

  const { createHash } = await import("node:crypto");
  return createHash(algo).update(data).digest("hex");
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerDataOps(register: (op: string, handler: OpHandler) => void): void {
  register("std:data.parse@v1", dataParse);
  register("std:data.serialize@v1", dataSerialize);
  register("std:data.extract@v1", dataExtract);
  register("std:data.regex@v1", dataRegex);
  register("std:data.json_merge@v1", dataJsonMerge);
  register("std:data.render@v1", dataRender);
  register("std:data.validate@v1", dataValidate);
  register("std:data.hash@v1", dataHash);
}
