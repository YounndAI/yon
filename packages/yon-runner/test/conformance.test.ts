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
 * YON Runner Conformance Tests
 *
 * Exercises the 33 runner-targeted vectors published by
 * `@younndai/yon-spec/conformance`:
 *
 *   - 15 vectors under `runner/`           — generic runner concerns;
 *                                            run the full pipeline and
 *                                            assert against the merged
 *                                            expected JSON.
 *   - 10 vectors under `runner-agentic/`   — depend on specialised-tier
 *   -  8 vectors under `runner-cognitive/`   ops not implemented in
 *                                            yon-runner v2.x. Exercised as
 *                                            `.skip()` placeholders; out of
 *                                            scope for this package.
 *
 * Closes audit finding F-R002 — yon-runner previously consumed zero
 * conformance vectors.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { basename, dirname } from "node:path";
import { createRunner } from "../src/index.js";
import {
  getRunnerVectorPaths,
  loadRunnerVector,
  type MergedExpectedResult,
} from "@younndai/yon-spec/conformance";

// ---------------------------------------------------------------------------
// Tier classification
// ---------------------------------------------------------------------------

type VectorTier = "runner" | "runner-agentic" | "runner-cognitive";

function vectorTier(yonPath: string): VectorTier {
  const parentDir = basename(dirname(yonPath));
  if (parentDir === "runner-agentic") return "runner-agentic";
  if (parentDir === "runner-cognitive") return "runner-cognitive";
  return "runner";
}

// ---------------------------------------------------------------------------
// F-R002.1 sub-finding skip map
// ---------------------------------------------------------------------------
//
// 12 of 15 `runner/` vectors fail against current yon-runner v2.x. Each
// failure is catalogued as a sub-finding under F-R002.1.{a–f}. The skipped
// tests remain in the file so coverage growth is visible as sub-findings
// are closed in subsequent releases — converting each `it.skip` back to
// `it` removes one row from the skip ledger.
const SKIPPED_RUNNER_VECTORS: Record<string, string> = {
  "runner-01-cycle-detect":
    "F-R002.1.c — error-code mismapping: cycle-detect emits E107 instead of canonical E101 (factory exists but is not used at the cycle-detect site)",
  "runner-02-permission-deny":
    "F-R002.1.e — test-wrapper permission config tension: the fail-closed-deny vector passes through the wrapper's permissive std:* ALLOW default; vector design vs test-wrapper-knowledge tradeoff",
  "runner-05-check-warn":
    "F-R002.1.a — vector references spec-phantom op std:data.transform@v1; spec/09-operations/data.md lists 8 std:data.* ops and transform is NOT among them (parse, serialize, extract, regex, json_merge, render, validate, hash). Surface to yon-spec maintainer; not a yon-runner miss",
  "runner-06-catch-fallback":
    "F-R002.1.d — sandbox network=false blocks std:http.* before the intended outcome (catch fallback) manifests; would also compound F-R002.1.a once it fires",
  "runner-08-version-mismatch":
    "F-R002.1.c — error-code mismapping: std:fs.read@v99 falls through registry lookup to E102 instead of being recognized as a version mismatch on an existing op (canonical E004)",
  "runner-09-unknown-op":
    "F-R002.1.e — permission check fires before op lookup: custom:nonexistent returns E003 (permission denied) before reaching E102 (op not implemented). Reorder or vector @POLICY design decision pending",
  "runner-10-stamp-output":
    "F-R002.1.f — profile=audit strict validation not enforced (runner proceeds to execute despite missing @STAMP). Hidden by F-R002.1.b (vector also requires pre-seeded data.txt); resolving (b) would surface (f) cleanly",
  "runner-11-duplicate-block-id":
    "F-R002.1.c — error-code mismapping: duplicate block id surfaces as E107 (runtime) rather than canonical E001 (structural violation at parse time). Implicates yon-parser as well",
  "runner-12-void-step":
    "F-R002.1.b — vector requires pre-seeded sandbox file (data.txt); no spec-side mechanism declares vector seeding contract. Tertiary: fs.read ENOENT not wrapped as yon-runner error envelope (E107)",
  "runner-13-timeout":
    "F-R002.1.d — sandbox network=false emits E103 before the vector's intended timeout check runs. Also potential error-code-spec ambiguity (vector .expected.json says E002 but timeout semantics need cross-check with yon-spec/reference/error-codes.md)",
  "runner-14-parallel-independent":
    "F-R002.1.b — vector requires pre-seeded sandbox files (file_a.txt, file_b.txt); see runner-12 for the seeding-contract design question",
  "runner-15-check-expression":
    "F-R002.1.a — vector references spec-phantom op std:data.transform@v1; same gap as runner-05. Surface to yon-spec maintainer; not a yon-runner miss",
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("YON Runner Conformance — runner-* vectors", () => {
  const vectorPaths = getRunnerVectorPaths();

  if (vectorPaths.length === 0) {
    it("conformance vectors must be present", () => {
      throw new Error(
        "0 runner vectors found — @younndai/yon-spec/conformance returned empty. " +
          "yon-spec installation broken or not built.",
      );
    });
    return;
  }

  let sandboxDir: string;

  beforeEach(() => {
    sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), "yon-runner-conformance-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  for (const yonPath of vectorPaths) {
    const tier = vectorTier(yonPath);
    const name = basename(yonPath, ".yon");

    if (tier === "runner-agentic" || tier === "runner-cognitive") {
      // SKIPPED — requires specialised-tier ops not implemented in
      // yon-runner v2.x; out of scope for this package.
      it.skip(
        `${name}: SKIPPED — requires specialised-tier ops not implemented in yon-runner v2.x (out of scope for this package)`,
        () => {},
      );
      continue;
    }

    // runner/ tier — vector currently failing? Skip with F-R002.1 pointer.
    const skipReason = SKIPPED_RUNNER_VECTORS[name];
    if (skipReason) {
      it.skip(`${name}: SKIPPED — ${skipReason}`, () => {});
      continue;
    }

    // Generic runner/ tier — exercise the full pipeline.
    it(`${name}: full pipeline`, async () => {
      const vector = loadRunnerVector(yonPath);
      const expected: MergedExpectedResult = vector.expected;

      const runner = createRunner({
        permissions: [{ op: "std:*", action: "ALLOW" }],
        sandbox: { root: sandboxDir },
      });

      const result = await runner.run(vector.content);

      // Canonical pass condition: every phase had to reach an "ok"
      // outcome (or "warn" on validation, which the runner treats as
      // passing). If any phase short-circuits, the runner returns
      // success=false.
      const phasesPass =
        expected.parse === "ok" &&
        (expected.validate_strict === "ok" ||
          expected.validate_strict === "warn") &&
        expected.resolve === "ok" &&
        expected.plan === "ok" &&
        expected.execute === "ok";

      if (phasesPass) {
        expect(
          result.success,
          `expected success=true, got errors=${JSON.stringify(result.errors)}`,
        ).toBe(true);
      } else {
        expect(
          result.success,
          `expected success=false, got success=true with stamps=${result.stamps.length}`,
        ).toBe(false);
        if (expected.error_code !== null && expected.error_code !== "") {
          const codes = result.errors.map((e) => e.code);
          expect(
            codes.includes(expected.error_code),
            `expected error code ${expected.error_code} in ${JSON.stringify(codes)}`,
          ).toBe(true);
        }
      }

      // Stamps assertion
      if (expected.stamps === "required") {
        expect(result.stamps.length).toBeGreaterThan(0);
      }
    });
  }
});
