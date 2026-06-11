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
 * Conformance tests — Validator
 *
 * Covers: F3 (@CATCH do/on), F4 (profile enforcement), F6 (backoff read), N3 (@CATCH/@RETRY require workflow)
 */

import { describe, it, expect } from "vitest";
import { validate } from "../src/engine/validator.js";
import type { YonDocument, YonRecord } from "@younndai/yon-parser";

/**
 * Build a minimal YonDocument with the given records and options.
 */
function makeDoc(
  records: YonRecord[],
  opts: {
    profile?: string;
    features?: string[];
    with?: string[];
    without?: string[];
  } = {},
): YonDocument {
  return {
    version: "1.5",
    kind: "workflow",
    id: "test",
    title: "Test",
    profile: opts.profile,
    features: opts.features,
    with: opts.with,
    without: opts.without,
    records,
    blocks: new Map(),
  };
}

function makeRecord(tag: string, fields: Record<string, string | number>): YonRecord {
  return {
    tag,
    fields: new Map(Object.entries(fields)),
    line: 1,
    column: 1,
  };
}

describe("validate — @STEP extraction", () => {
  it("extracts a basic step", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]!.rid).toBe("s1");
    expect(result.steps[0]!.op).toBe("std:data.parse@v1");
    expect(result.steps[0]!.n).toBe(1);
  });

  it("rejects step without rid", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { n: 1, op: "std:data.parse@v1" })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("missing rid");
  });

  it("rejects step without op", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1 })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("missing op");
  });

  it("rejects duplicate step numbers", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("STEP", { rid: "s2", n: 1, op: "std:data.parse@v1" }),
      ],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("Duplicate step number");
  });

  it("rejects duplicate step RIDs", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("STEP", { rid: "s1", n: 2, op: "std:data.parse@v1" }),
      ],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("Duplicate step RID");
  });
});

describe("validate — F3: @CATCH extraction", () => {
  it("reads 'do' as fallback field", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:fs.read@v1" }),
        makeRecord("CATCH", { rid: "c1", target: "s1", do: "fallback-step" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.catches).toHaveLength(1);
    expect(result.catches[0]!.fallback).toBe("fallback-step");
  });

  it("reads 'on' condition field", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:fs.read@v1" }),
        makeRecord("CATCH", { rid: "c1", target: "s1", do: "fb", on: "timeout|permission" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.catches[0]!.on).toBe("timeout|permission");
  });
});

describe("validate — F6: @RETRY extraction", () => {
  it("reads backoff strategy", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:fs.read@v1" }),
        makeRecord("RETRY", { rid: "r1", target: "s1", max: 3, delay_ms: 1000, backoff: "exponential" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.retries).toHaveLength(1);
    expect(result.retries[0]!.backoff).toBe("exponential");
    expect(result.retries[0]!.delay).toBe(1000);
    expect(result.retries[0]!.max).toBe(3);
  });

  it("defaults to 'none' for invalid backoff", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:fs.read@v1" }),
        makeRecord("RETRY", { rid: "r1", target: "s1", max: 2, backoff: "invalid" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.retries[0]!.backoff).toBe("none");
  });
});

describe("validate — F4/N3: Profile enforcement", () => {
  it("rejects @STEP under 'core' profile (no workflow feature)", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });

  it("rejects @STEP under 'decl' profile (no workflow feature)", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "decl" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });

  it("allows @STEP under 'exec' profile (has workflow feature)", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).not.toThrow();
  });

  it("N3: rejects @CATCH under 'core' profile", () => {
    const doc = makeDoc(
      [makeRecord("CATCH", { rid: "c1", target: "s1", do: "fb" })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });

  it("N3: rejects @RETRY under 'core' profile", () => {
    const doc = makeDoc(
      [makeRecord("RETRY", { rid: "r1", target: "s1", max: 3 })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });

  it("allows @STEP when 'with' adds workflow to core profile", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "core", with: ["workflow"] },
    );
    expect(() => validate(doc)).not.toThrow();
  });

  it("rejects @STEP when 'without' removes workflow from exec profile", () => {
    const doc = makeDoc(
      [makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" })],
      { profile: "exec", without: ["workflow"] },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });
});

describe("validate — @VOID and @PATCH", () => {
  it("removes voided steps", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("STEP", { rid: "s2", n: 2, op: "std:data.parse@v1" }),
        makeRecord("VOID", { target: "s1" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]!.rid).toBe("s2");
  });

  it("patches step fields", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("PATCH", { target: "s1", op: "std:data.hash@v1" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.steps[0]!.op).toBe("std:data.hash@v1");
  });
});

describe("validate — G3: @CHECK extraction", () => {
  it("extracts basic check with defaults", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks).toHaveLength(1);
    expect(result.checks[0]!.rid).toBe("chk1");
    expect(result.checks[0]!.assert).toBe("rid:s1 != null");
    expect(result.checks[0]!.fail).toBe("ABORT"); // default
    expect(result.checks[0]!.msg).toContain("chk1"); // default msg includes rid
  });

  it("reads fail=WARN", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null", fail: "WARN" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.fail).toBe("WARN");
  });

  it("reads fail=SKIP", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null", fail: "SKIP" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.fail).toBe("SKIP");
  });

  it("defaults unknown fail to ABORT", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null", fail: "EXPLODE" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.fail).toBe("ABORT");
  });

  it("reads custom msg", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null", msg: "Data must exist" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.msg).toBe("Data must exist");
  });

  it("reads target field", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null", target: "s1" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.target).toBe("s1");
  });

  it("target is undefined when not specified", () => {
    const doc = makeDoc(
      [
        makeRecord("STEP", { rid: "s1", n: 1, op: "std:data.parse@v1" }),
        makeRecord("CHECK", { rid: "chk1", assert: "rid:s1 != null" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.checks[0]!.target).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// P2.4: @INPUT/@OUTPUT/@YIELD extraction
// ---------------------------------------------------------------------------

describe("validate — P2.4: @INPUT extraction", () => {
  it("extracts all @INPUT fields", () => {
    const doc = makeDoc(
      [
        makeRecord("INPUT", { rid: "in:src", name: "source_code", type: "block", required: "true", schema: "rid:sch:code", default: "fallback" }),
      ],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.inputs).toHaveLength(1);
    expect(result.inputs[0]!.rid).toBe("in:src");
    expect(result.inputs[0]!.name).toBe("source_code");
    expect(result.inputs[0]!.type).toBe("block");
    expect(result.inputs[0]!.required).toBe(true);
    expect(result.inputs[0]!.schema).toBe("rid:sch:code");
    expect(result.inputs[0]!.default).toBe("fallback");
  });

  it("defaults required to true", () => {
    const doc = makeDoc(
      [makeRecord("INPUT", { rid: "in:x", name: "data" })],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.inputs[0]!.required).toBe(true);
  });

  it("parses required=false", () => {
    const doc = makeDoc(
      [makeRecord("INPUT", { rid: "in:x", name: "optional", required: "false" })],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.inputs[0]!.required).toBe(false);
  });

  it("rejects @INPUT without name", () => {
    const doc = makeDoc(
      [makeRecord("INPUT", { rid: "in:x" })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("missing name");
  });

  it("rejects @INPUT under core profile", () => {
    const doc = makeDoc(
      [makeRecord("INPUT", { rid: "in:x", name: "data" })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });
});

describe("validate — P2.4: @OUTPUT extraction", () => {
  it("extracts all @OUTPUT fields", () => {
    const doc = makeDoc(
      [makeRecord("OUTPUT", { rid: "out:sum", name: "summary", type: "block", schema: "rid:sch:summary" })],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.outputs).toHaveLength(1);
    expect(result.outputs[0]!.rid).toBe("out:sum");
    expect(result.outputs[0]!.name).toBe("summary");
    expect(result.outputs[0]!.type).toBe("block");
    expect(result.outputs[0]!.schema).toBe("rid:sch:summary");
  });

  it("rejects @OUTPUT without name", () => {
    const doc = makeDoc(
      [makeRecord("OUTPUT", { rid: "out:x" })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("missing name");
  });

  it("rejects @OUTPUT under core profile", () => {
    const doc = makeDoc(
      [makeRecord("OUTPUT", { rid: "out:x", name: "data" })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });
});

describe("validate — P2.4: @YIELD extraction", () => {
  it("extracts all @YIELD fields", () => {
    const doc = makeDoc(
      [makeRecord("YIELD", { rid: "y:1", step: "rid:step:parse", value: "block:partial", progress: "0.5" })],
      { profile: "exec" },
    );
    const result = validate(doc);
    expect(result.yields).toHaveLength(1);
    expect(result.yields[0]!.rid).toBe("y:1");
    expect(result.yields[0]!.step).toBe("rid:step:parse");
    expect(result.yields[0]!.value).toBe("block:partial");
    expect(result.yields[0]!.progress).toBe(0.5);
  });

  it("rejects @YIELD without value", () => {
    const doc = makeDoc(
      [makeRecord("YIELD", { rid: "y:1" })],
      { profile: "exec" },
    );
    expect(() => validate(doc)).toThrow("missing value");
  });

  it("rejects @YIELD under core profile", () => {
    const doc = makeDoc(
      [makeRecord("YIELD", { rid: "y:1", value: "block:x" })],
      { profile: "core" },
    );
    expect(() => validate(doc)).toThrow("workflow");
  });
});
