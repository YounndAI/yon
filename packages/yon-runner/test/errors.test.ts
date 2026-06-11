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
 * Conformance tests — Error Codes
 *
 * Covers: v2.0 error code ranges (E001–E006 standard, E101–E112 runner),
 * severity/source fields, and all factory functions.
 */

import { describe, it, expect } from "vitest";
import {
  ErrorCodes,
  createError,
  structuralViolation,
  timeoutExceeded,
  permissionDenied,
  referenceNotFound,
  unterminatedBlock,
  assertionFailed,
  cycleDetected,
  opNotImplemented,
  sandboxViolation,
  runtimeError,
  versionRevoked,
  haltReceived,
  tenetViolated,
  escalateTimeout,
  imprintRejected,
  trustThreshold,
} from "../src/errors.js";

describe("ErrorCodes", () => {
  it("defines 18 error codes (E001–E006 + E101–E112)", () => {
    const codes = Object.keys(ErrorCodes);
    expect(codes).toHaveLength(18);
    // Standard range
    expect(codes[0]).toBe("E001");
    expect(codes[5]).toBe("E006");
    // Runner range
    expect(codes[6]).toBe("E101");
    expect(codes[17]).toBe("E112");
  });

  it("E006 is 'Unterminated block' (v2.0 canonical)", () => {
    expect(ErrorCodes.E006).toBe("Unterminated block");
  });

  it("E101 is 'Cycle detected' (moved from E006)", () => {
    expect(ErrorCodes.E101).toBe("Cycle detected");
  });

  it("E005 is spec-canonical 'Rate limit exceeded'", () => {
    expect(ErrorCodes.E005).toBe("Rate limit exceeded");
  });

  it("E104 is spec-canonical 'Version archived'", () => {
    expect(ErrorCodes.E104).toBe("Version archived");
  });

  it("E106 is 'Assertion failed'", () => {
    expect(ErrorCodes.E106).toBe("Assertion failed");
  });

  it("E107 is 'Runtime error'", () => {
    expect(ErrorCodes.E107).toBe("Runtime error");
  });
});

describe("createError", () => {
  it("formats message as 'CODE: LABEL — detail'", () => {
    const err = createError("E001", "test detail", "rid-1", "op-1");
    expect(err.code).toBe("E001");
    expect(err.message).toContain("E001");
    expect(err.message).toContain("Structural violation");
    expect(err.message).toContain("test detail");
    expect(err.rid).toBe("rid-1");
    expect(err.op).toBe("op-1");
  });

  it("populates severity from SEVERITY_MAP", () => {
    const fatal = createError("E001", "msg");
    expect(fatal.severity).toBe("fatal");

    const recoverable = createError("E002", "msg");
    expect(recoverable.severity).toBe("recoverable");
  });

  it("populates source as runner identifier", () => {
    const err = createError("E001", "msg");
    expect(err.source).toMatch(/^runner:yon-runner\//);
  });
});

describe("error factories", () => {
  it("structuralViolation → E001", () => {
    const err = structuralViolation("msg");
    expect(err.code).toBe("E001");
    expect(err.severity).toBe("fatal");
    expect(err.source).toBeTruthy();
  });

  it("timeoutExceeded → E002", () => {
    const err = timeoutExceeded("r", "op", 5000);
    expect(err.code).toBe("E002");
    expect(err.severity).toBe("recoverable");
  });

  it("permissionDenied → E003", () => {
    expect(permissionDenied("r", "op").code).toBe("E003");
  });

  it("referenceNotFound → E004", () => {
    expect(referenceNotFound("ref:x").code).toBe("E004");
  });

  it("unterminatedBlock → E006", () => {
    const err = unterminatedBlock("r", "data");
    expect(err.code).toBe("E006");
    expect(err.message).toContain("data");
  });

  it("cycleDetected → E101", () => {
    expect(cycleDetected(["a", "b"]).code).toBe("E101");
  });

  it("opNotImplemented → E102", () => {
    expect(opNotImplemented("r", "op").code).toBe("E102");
  });

  it("sandboxViolation → E103", () => {
    expect(sandboxViolation("r", "msg").code).toBe("E103");
  });

  it("versionRevoked → E105", () => {
    const err = versionRevoked("r", "op");
    expect(err.code).toBe("E105");
    expect(err.message).toContain("revoked");
  });

  it("assertionFailed → E106", () => {
    expect(assertionFailed("r", "expr", "msg").code).toBe("E106");
  });

  it("runtimeError → E107", () => {
    expect(runtimeError("r", "op", "msg").code).toBe("E107");
  });

  it("haltReceived → E108", () => {
    const err = haltReceived("r", "global");
    expect(err.code).toBe("E108");
    expect(err.message).toContain("@HALT");
  });

  it("tenetViolated → E109", () => {
    const err = tenetViolated("r", "no-pii");
    expect(err.code).toBe("E109");
    expect(err.message).toContain("@TENET");
  });

  it("escalateTimeout → E110", () => {
    const err = escalateTimeout("r", 30000);
    expect(err.code).toBe("E110");
    expect(err.message).toContain("30000");
  });

  it("imprintRejected → E111", () => {
    const err = imprintRejected("r", "untrusted source");
    expect(err.code).toBe("E111");
    expect(err.message).toContain("@IMPRINT");
  });

  it("trustThreshold → E112", () => {
    const err = trustThreshold("r", 0.3, 0.8);
    expect(err.code).toBe("E112");
    expect(err.message).toContain("0.3");
    expect(err.message).toContain("0.8");
  });
});
