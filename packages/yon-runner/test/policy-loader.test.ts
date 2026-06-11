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
 * Conformance tests — Policy Loader
 *
 * Covers: loadPolicyRules extraction from YonRecord[], DENY default,
 * and filtering of non-policy @RULE records.
 */

import { describe, it, expect } from "vitest";
import { loadPolicyRules } from "../src/policy-loader.js";
import type { YonRecord } from "@younndai/yon-parser";

function makeRecord(tag: string, fields: Record<string, string>): YonRecord {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(fields)) map.set(k, v);
  return { tag, fields: map as unknown as YonRecord["fields"] } as YonRecord;
}

describe("loadPolicyRules", () => {
  it("extracts @RULE records with op/action fields", () => {
    const records = [
      makeRecord("RULE", { op: "std:fs.read", action: "ALLOW" }),
      makeRecord("RULE", { op: "std:fs.write", action: "DENY" }),
    ];
    const entries = loadPolicyRules(records);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ op: "std:fs.read", action: "ALLOW" });
    expect(entries[1]).toEqual({ op: "std:fs.write", action: "DENY" });
  });

  it("filters out @RULE records without op field (Ch 3 logic rules)", () => {
    const records = [
      makeRecord("RULE", { lvl: "MUST", when: "foo", then: "bar" }), // Ch 3 logic
      makeRecord("RULE", { op: "std:data.*", action: "ALLOW" }),     // Ch 8 policy
    ];
    const entries = loadPolicyRules(records);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.op).toBe("std:data.*");
  });

  it("defaults to DENY when action is missing or invalid", () => {
    const records = [
      makeRecord("RULE", { op: "std:net.*" }),
      makeRecord("RULE", { op: "std:ai.*", action: "INVALID" }),
    ];
    const entries = loadPolicyRules(records);
    expect(entries[0]!.action).toBe("DENY");
    expect(entries[1]!.action).toBe("DENY");
  });

  it("handles PROMPT action", () => {
    const records = [
      makeRecord("RULE", { op: "std:fs.delete", action: "PROMPT" }),
    ];
    const entries = loadPolicyRules(records);
    expect(entries[0]!.action).toBe("PROMPT");
  });

  it("returns empty for non-RULE records", () => {
    const records = [
      makeRecord("STEP", { rid: "s1", op: "std:fs.read" }),
      makeRecord("TENET", { rid: "t1", content: "No PII" }),
    ];
    const entries = loadPolicyRules(records);
    expect(entries).toHaveLength(0);
  });
});
