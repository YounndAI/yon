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
 * Public surface tests — assert the package's `.` entrypoint exports
 * the symbols downstream consumers depend on.
 *
 * Closes the structural gap where the package root did not re-export
 * `validate()`.
 */

import { describe, it, expect } from "vitest";
import { validate } from "../src/index.js";
import { parse as parserParse } from "@younndai/yon-parser";

describe("public exports", () => {
  it("validate is exported as a function from the package root", () => {
    expect(typeof validate).toBe("function");
  });

  it("validate accepts a parsed YonDocument and returns a ValidationResult shape", () => {
    const doc = parserParse(
      `@DOC ver=2.0 | id=public-exports-smoke | kind=workflow | profile=exec\n`,
    );
    const result = validate(doc);
    expect(result).toBeDefined();
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.blocks instanceof Map).toBe(true);
  });
});
