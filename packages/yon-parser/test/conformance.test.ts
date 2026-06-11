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
 * YON Conformance Tests
 *
 * Runs all test vectors against the parser and validator.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { parse, validate } from "../src/index.js";
import { getVectorPaths, type ExpectedResult } from "@younndai/yon-spec/conformance";

// Get all .yon files from yon-spec conformance suite
function getTestVectors(): string[] {
  try {
    return getVectorPaths();
  } catch {
    return [];
  }
}

// Load expected result for a test vector
function loadExpected(yonPath: string): ExpectedResult | null {
  const expectedPath = yonPath.replace('.yon', '.expected.json');
  try {
    const content = readFileSync(expectedPath, 'utf-8');
    return JSON.parse(content) as ExpectedResult;
  } catch {
    return null;
  }
}

describe('YON Conformance Tests', () => {
  const testVectors = getTestVectors();
  
  if (testVectors.length === 0) {
    it('conformance vectors must be present', () => {
      throw new Error(
        'No conformance vectors found — @younndai/yon-spec/conformance returned 0 vectors. ' +
          'The conformance suite must not silently pass; verify yon-spec is installed and built.'
      );
    });
    return;
  }

  describe.each(testVectors)('Vector: %s', (vectorPath) => {
    const name = basename(vectorPath, '.yon');
    const content = readFileSync(vectorPath, 'utf-8');
    const expected = loadExpected(vectorPath);

    if (!expected) {
      it.skip(`${name}: Missing expected.json`, () => {});
      return;
    }

    it(`${name}: parse`, () => {
      if (expected.parse === 'ok') {
        expect(() => parse(content)).not.toThrow();
      } else {
        expect(() => parse(content)).toThrow();
      }
    });

    if (expected.parse === 'ok') {
      it(`${name}: validate (strict)`, () => {
        const doc = parse(content);
        const result = validate(doc, { strict: true });
        
        if (expected.validate_strict === 'ok') {
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        } else if (expected.validate_strict === 'warn') {
          // 'warn' in strict = valid but with warnings
          expect(result.valid).toBe(true);
          expect(result.warnings.length).toBeGreaterThan(0);
        } else {
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });

      it(`${name}: validate (lenient)`, () => {
        const doc = parse(content);
        const result = validate(doc, { strict: false });
        
        if (expected.validate_lenient === 'ok') {
          expect(result.valid).toBe(true);
          expect(result.warnings).toHaveLength(0);
        } else if (expected.validate_lenient === 'warn') {
          // 'warn' means warnings present but still valid (no errors)
          expect(result.valid).toBe(true);
          expect(result.warnings.length).toBeGreaterThan(0);
        } else {
          // 'error' means validation failed even in lenient mode
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    }
  });
});
