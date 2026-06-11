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
 * Conformance tests — Result Serializer
 *
 * Tests that serializeResult produces valid YON kind=result documents.
 */

import { describe, it, expect } from "vitest";
import { serializeResult } from "../src/serializer.js";
import type { RunResult } from "../src/types.js";

function makeResult(overrides?: Partial<RunResult>): RunResult {
  return {
    success: true,
    steps: [],
    outputs: new Map(),
    stamps: [],
    errors: [],
    durationMs: 42,
    ...overrides,
  };
}

describe("serializeResult", () => {
  it("produces valid @DOC kind=result header", () => {
    const doc = serializeResult(makeResult());
    expect(doc).toMatch(/^@DOC ver=2\.0 \| id=run-result \| title="Execution Result" \| kind=result \| profile=audit$/m);
  });

  it("accepts custom id and title", () => {
    const doc = serializeResult(makeResult(), { id: "my-run", title: "My Run" });
    expect(doc).toContain('id=my-run');
    expect(doc).toContain('title="My Run"');
  });

  it("serializes stamps in order", () => {
    const result = makeResult({
      stamps: [
        { event: "run:start", ts: "2026-02-10T00:00:00Z", src: "runner:yon-runner/2.0.0" },
        { event: "step:complete", ts: "2026-02-10T00:00:01Z", src: "runner:yon-runner/2.0.0", rid: "step-1" },
      ],
    });
    const doc = serializeResult(result);
    expect(doc).toContain('@STAMP ts="2026-02-10T00:00:00Z" | event="run:start"');
    expect(doc).toContain('@STAMP ts="2026-02-10T00:00:01Z" | event="step:complete"');
    expect(doc).toContain("rid=step-1");
  });

  it("serializes errors as @ERROR records", () => {
    const result = makeResult({
      errors: [
        { code: "E106", message: "E106: Assertion failed — check expr", severity: "recoverable" as const, source: "runner:yon-runner/2.0.0", rid: "step-2" },
      ],
    });
    const doc = serializeResult(result);
    expect(doc).toContain("@ERROR code=E106");
    expect(doc).toContain("rid=step-2");
    expect(doc).toContain("severity=recoverable");
    expect(doc).toContain('source="runner:yon-runner/2.0.0"');
  });

  it("serializes output blocks as @BEGIN/@END", () => {
    const outputs = new Map<string, unknown>();
    outputs.set("result-block", "Hello, world!");
    const result = makeResult({ outputs });
    const doc = serializeResult(result);
    expect(doc).toContain('@BEGIN id="result-block"');
    expect(doc).toContain("Hello, world!");
    expect(doc).toContain('@END id="result-block"');
  });

  it("serializes object outputs as JSON", () => {
    const outputs = new Map<string, unknown>();
    outputs.set("data", { count: 42 });
    const result = makeResult({ outputs });
    const doc = serializeResult(result);
    expect(doc).toContain('"count": 42');
  });

  it("empty result produces minimal document", () => {
    const doc = serializeResult(makeResult());
    const lines = doc.trim().split("\n").filter((l) => l.trim() !== "");
    expect(lines).toHaveLength(1); // Just the @DOC header
    expect(lines[0]).toContain("@DOC");
  });
});
