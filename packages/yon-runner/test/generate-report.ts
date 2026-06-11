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
 * @younndai/yon-runner — Report Generator
 *
 * Runs representative YON workflow scenarios end-to-end through createRunner()
 * and writes a timestamped report directory with execution artifacts.
 *
 * Usage:  npx tsx test/generate-report.ts
 *
 * Output: test/reports/<timestamp>/
 *   ├── _summary.txt
 *   ├── fs-read-write.stamps.json
 *   ├── control-if.stamps.json
 *   └── ...
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createRunner } from "../src/index.js";
import type { RunResult } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

interface Scenario {
  id: string;
  label: string;
  yon: string;
  permissions: Array<{ op: string; action: "ALLOW" | "DENY" | "PROMPT" }>;
  sandbox?: { root: string };
  expectSuccess: boolean;
  /** Setup function — creates files needed before execution. */
  setup?: (sandboxRoot: string) => void;
  /** Cleanup function — removes files after execution. */
  cleanup?: (sandboxRoot: string) => void;
}

function buildSandboxRoot(id: string): string {
  const dir = path.join(__dirname, "reports", "_sandbox", id);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const SCENARIOS: Scenario[] = [
  // ── 1. fs.read + fs.write ──────────────────────────────────────────────
  {
    id: "fs-read-write",
    label: "fs.read + fs.write (basic I/O pipeline)",
    permissions: [{ op: "std:fs.*", action: "ALLOW" }],
    expectSuccess: true,
    setup: (root) => fs.writeFileSync(path.join(root, "input.txt"), "hello world", "utf-8"),
    cleanup: (root) => {
      try { fs.unlinkSync(path.join(root, "input.txt")); } catch {}
      try { fs.unlinkSync(path.join(root, "output.txt")); } catch {}
    },
    yon: `@DOC ver=2.0 | kind=workflow | id=fs-rw | title="FS Read/Write" | profile=exec

@STEP n:int=1 | rid=read-step | op=std:fs.read@v1 | args=[path="input.txt"] | out=[block:content]
@STEP n:int=2 | rid=write-step | op=std:fs.write@v1 | args=[path="output.txt"] | in=[block:content]`,
  },

  // ── 2. control.if (Gate Model) ─────────────────────────────────────────
  {
    id: "control-if",
    label: "control.if (Gate Model branching)",
    permissions: [
      { op: "std:control.*", action: "ALLOW" },
      { op: "std:handler.*", action: "ALLOW" },
    ],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=gate-if | title="If Branch" | profile=exec

@STEP n:int=1 | rid=check-flag | op=std:control.if@v1 | args=[cond:bool=true, then_step="notify-yes", else_step="notify-no"]
@STEP n:int=2 | rid=notify-yes | op=std:handler.notify@v1 | args=[msg="Condition was true"]
@STEP n:int=3 | rid=notify-no | op=std:handler.notify@v1 | args=[msg="Condition was false"]`,
  },

  // ── 3. control.match ───────────────────────────────────────────────────
  {
    id: "control-match",
    label: "control.match (multi-branch selection)",
    permissions: [
      { op: "std:control.*", action: "ALLOW" },
      { op: "std:handler.*", action: "ALLOW" },
    ],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=gate-match | title="Match Selector" | profile=exec

@STEP n:int=1 | rid=select | op=std:control.match@v1 | args=[value="b", cases=[a="branch-a", b="branch-b"]]
@STEP n:int=2 | rid=branch-a | op=std:handler.notify@v1 | args=[msg="Took branch A"]
@STEP n:int=3 | rid=branch-b | op=std:handler.notify@v1 | args=[msg="Took branch B"]`,
  },

  // ── 4. data.parse + data.serialize ─────────────────────────────────────
  {
    id: "data-transform",
    label: "data.parse + data.serialize (JSON transform)",
    permissions: [{ op: "std:data.*", action: "ALLOW" }],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=data-xform | title="Data Transform" | profile=exec

@STEP n:int=1 | rid=parse-json | op=std:data.parse@v1 | args=[format="json", text='{"name":"test","value":42}'] | out=[block:parsed]
@STEP n:int=2 | rid=serialize-json | op=std:data.serialize@v1 | args=[format="json"] | in=[block:parsed] | out=[block:formatted]`,
  },

  // ── 5. Permission deny (fail-closed proof) ─────────────────────────────
  {
    id: "permission-deny",
    label: "Permission deny (fail-closed security)",
    permissions: [],
    expectSuccess: false,
    yon: `@DOC ver=2.0 | kind=workflow | id=deny-test | title="Denied" | profile=exec

@STEP n:int=1 | rid=blocked | op=std:fs.read@v1 | args=[path="secret.txt"]`,
  },

  // ── 6. handler.notify ────────────────────────────────────────────────────
  {
    id: "handler-notify",
    label: "handler.notify (console output)",
    permissions: [{ op: "std:handler.*", action: "ALLOW" }],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=notify | title="Notify" | profile=exec

@STEP n:int=1 | rid=say-hello | op=std:handler.notify@v1 | args=[msg="Hello from the runner", level="info"]`,
  },

  // ── 7. sys.info + sys.clock ────────────────────────────────────────────
  {
    id: "sys-ops",
    label: "sys.info + sys.clock (system operations)",
    permissions: [{ op: "std:sys.*", action: "ALLOW" }],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=sys-ops | title="System Ops" | profile=exec

@STEP n:int=1 | rid=get-platform | op=std:sys.info@v1 | args=[key="platform"] | out=[block:platform]
@STEP n:int=2 | rid=get-time | op=std:sys.clock@v1 | args=[format="iso"] | out=[block:timestamp]`,
  },

  // ── 8. Empty workflow (minimal valid document) ─────────────────────────
  {
    id: "empty-workflow",
    label: "Empty workflow (no steps, still valid)",
    permissions: [],
    expectSuccess: true,
    yon: `@DOC ver=2.0 | kind=workflow | id=empty | title="Empty" | profile=exec`,
  },

  // ── 9. Sandbox path traversal (security proof) ─────────────────────────
  {
    id: "sandbox-escape",
    label: "Sandbox path traversal rejection (security)",
    permissions: [{ op: "std:fs.*", action: "ALLOW" }],
    expectSuccess: false,
    yon: `@DOC ver=2.0 | kind=workflow | id=escape | title="Escape" | profile=exec

@STEP n:int=1 | rid=escape | op=std:fs.read@v1 | args=[path="../../etc/passwd"]`,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const now = new Date();
  const ts = now.toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "");
  const reportDir = path.join(__dirname, "reports", ts);
  fs.mkdirSync(reportDir, { recursive: true });

  const summaryLines: string[] = [];
  summaryLines.push("YON Runner — Test Report");
  summaryLines.push(`Generated: ${now.toISOString()}`);
  summaryLines.push(`Scenarios: ${SCENARIOS.length}`);
  summaryLines.push(`${"─".repeat(60)}`);
  summaryLines.push("");

  let pass = 0;
  let fail = 0;

  for (const scenario of SCENARIOS) {
    const start = performance.now();
    const sandboxRoot = buildSandboxRoot(scenario.id);

    try {
      // Setup
      scenario.setup?.(sandboxRoot);

      // Build runner
      const runner = createRunner({
        permissions: scenario.permissions,
        sandbox: { root: sandboxRoot },
      });

      // Execute
      const result: RunResult = await runner.run(scenario.yon);
      const durationMs = (performance.now() - start).toFixed(1);

      // Write artifacts
      fs.writeFileSync(
        path.join(reportDir, `${scenario.id}.input.yon`),
        scenario.yon,
        "utf-8",
      );
      fs.writeFileSync(
        path.join(reportDir, `${scenario.id}.stamps.json`),
        JSON.stringify(result.stamps, null, 2),
        "utf-8",
      );
      fs.writeFileSync(
        path.join(reportDir, `${scenario.id}.result.json`),
        JSON.stringify(
          {
            success: result.success,
            stepCount: result.steps.length,
            errorCount: result.errors.length,
            errors: result.errors,
            durationMs: result.durationMs,
          },
          null,
          2,
        ),
        "utf-8",
      );

      // Evaluate
      const matched = result.success === scenario.expectSuccess;

      if (matched) {
        summaryLines.push(`✅ ${scenario.label}`);
        summaryLines.push(`   success=${result.success} (expected=${scenario.expectSuccess}), ${result.steps.length} steps, ${durationMs}ms`);
        pass++;
      } else {
        summaryLines.push(`❌ ${scenario.label}`);
        summaryLines.push(`   MISMATCH: success=${result.success}, expected=${scenario.expectSuccess}`);
        if (result.errors.length > 0) {
          summaryLines.push(`   Errors: ${result.errors.map((e) => e.code).join(", ")}`);
        }
        fail++;
      }
      summaryLines.push("");

      // Cleanup
      scenario.cleanup?.(sandboxRoot);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      summaryLines.push(`❌ ${scenario.label}`);
      summaryLines.push(`   CRASH: ${errMsg}`);
      summaryLines.push("");
      fail++;
    }
  }

  // Final tally
  summaryLines.push(`${"─".repeat(60)}`);
  summaryLines.push(`TOTAL: ${pass + fail} scenarios | ${pass} pass | ${fail} fail`);
  summaryLines.push(`Status: ${fail === 0 ? "✅ ALL PASS" : "❌ FAILURES DETECTED"}`);

  const summary = summaryLines.join("\n");
  fs.writeFileSync(path.join(reportDir, "_summary.txt"), summary, "utf-8");

  console.log(summary);
  console.log(`\nReport saved to: ${reportDir}`);

  // Cleanup sandbox directory
  try {
    fs.rmSync(path.join(__dirname, "reports", "_sandbox"), { recursive: true, force: true });
  } catch {}

  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Report generation failed:", err);
  process.exit(1);
});
