# YON Runner — Testing Guide

> Testing methodology, coverage analysis, and test sufficiency assessment for `@younndai/yon-runner`.

---

## Testing Philosophy

The runner is **deterministic**. Every test produces the same result on every run. There are no LLM calls, no network dependencies, no flaky time-based assertions. The full suite completes in about a second.

Tests verify two concerns:

1. **Correctness** — Does each component do what the spec requires?
2. **Security** — Does the fail-closed model hold under adversarial input?

---

## Quick Start

```bash
# Run all tests (<1s)
npx vitest run

# Type check
npx tsc --noEmit

# Generate execution report (timestamped artifacts)
npx tsx test/generate-report.ts
```

---

## Test Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  269 passing + 30 skipped across 15 files, ~1s total             │
│  ─────────────────────────────────────────────────────────────── │
│  integration.test.ts    End-to-end: createRunner().run() with    │
│                         real YON documents through all 5 phases  │
│  executor.test.ts       Retry delay, catch filter, timeout,      │
│                         Gate Model, stamps, registry, data ops   │
│  ops.test.ts            control.if/match/foreach/parallel/sleep/ │
│                         return/await, handler.*, sys.*, plugins  │
│  http.test.ts           HTTP ops: get, post, put, patch, delete, │
│                         head, download, sandbox, allowlist,      │
│                         security defaults + IPv6 edge cases      │
│  validator.test.ts      @CATCH, @RETRY, profile enforcement,     │
│                         backoff config, workflow requirements,   │
│                         @INPUT/@OUTPUT/@YIELD contracts          │
│  errors.test.ts         Error codes E001–E006, E101–E112         │
│  state.test.ts          Reference resolution (block, ref, file,  │
│                         url), url:-fetch SSRF gate, block        │
│                         registry, input/output                   │
│  conformance.test.ts    33 runner-* vectors from yon-spec —      │
│                         3 active passing, 30 skipped (12 to      │
│                         F-R002.1.{a–f}, 18 specialised-tier)     │
│  permissions.test.ts    Fail-closed, ALLOW/DENY order, wildcard, │
│                         PROMPT handler                           │
│  serializer.test.ts     Output document generation               │
│  tenets.test.ts         Tenet loading, merging, checking,        │
│                         callbacks, sorting, emit                 │
│  policy-loader.test.ts  @RULE extraction, filtering, defaults    │
│  session.test.ts        Checkpoint, recover, TTL expiry,         │
│                         activation, labels                       │
│  stream.test.ts         Streaming lifecycle events,              │
│                         progressive output emission              │
│  public-exports.test.ts Stable public-API entry surface          │
└──────────────────────────────────────────────────────────────────┘
```

### Question-Per-File

> Counts refreshed 2026-06-10. Run `npx vitest run` for the live numbers.

| File                     | Tests | Question It Answers                                                                                |
| ------------------------ | ----: | -------------------------------------------------------------------------------------------------- |
| `integration.test.ts`    |    21 | Does the full pipeline work end-to-end from YON text to RunResult?                                 |
| `ops.test.ts`            |    48 | Do standard operations produce correct results and register properly?                              |
| `http.test.ts`           |    41 | Do HTTP operations handle methods, headers, status codes, downloads, sandbox, allowlist gating, and security defaults including IPv6 edge cases? |
| `validator.test.ts`      |    36 | Does the validator enforce spec-compliant document structure?                                      |
| `conformance.test.ts`    |  3 / 30 skipped | Do the `@younndai/yon-spec/conformance` runner vectors pass? (3 active; 12 skipped to `F-R002.1.{a–f}`; 18 deferred to a future specialised-tier runtime.) |
| `executor.test.ts`       |    29 | Does the execution engine handle retries, timeouts, catch filtering, and the Gate Model correctly? |
| `errors.test.ts`         |    26 | Are all 18 error codes (E001–E006 + E101–E112) correctly defined with severity and source?         |
| `state.test.ts`          |    19 | Does the state system resolve block, ref, file, and url references correctly (incl. url:-fetch SSRF gate)? |
| `permissions.test.ts`    |    10 | Does the permission engine enforce fail-closed security?                                           |
| `tenets.test.ts`         |     8 | Does the TenetEngine load, merge, and check governance rules?                                      |
| `serializer.test.ts`     |     7 | Does the serializer produce valid YON v2.0 output documents?                                       |
| `session.test.ts`        |     7 | Does the SessionManager handle checkpointing, recovery, and TTL expiry?                            |
| `stream.test.ts`         |     7 | Does the streaming runner emit progressive lifecycle events correctly?                             |
| `policy-loader.test.ts`  |     5 | Does the policy loader extract @RULE records into permission entries?                              |
| `public-exports.test.ts` |     2 | Are the package's public-API exports stable for downstream consumers?                              |

---

## Coverage Matrix

| Component          | Unit Tests | Integration | Notes                                                          |
| ------------------ | :--------: | :---------: | -------------------------------------------------------------- |
| Parse phase        |     —      |   ✅ E2E    | Delegated to `@younndai/yon-parser`, exercised via integration |
| Validate phase     |   ✅ 36    |   ✅ E2E    | `validator.test.ts`                                            |
| Resolve phase      |   ✅ 15    |   ✅ E2E    | `state.test.ts` — async file/url resolution                    |
| Plan phase         |     —      |   ✅ E2E    | Implicit via executor + integration tests                      |
| Execute phase      |   ✅ 29    |   ✅ E2E    | `executor.test.ts` + `integration.test.ts`                     |
| Permissions        |   ✅ 10    |  ✅ E2E-2   | `permissions.test.ts` + fail-closed proof                      |
| Tenets             |    ✅ 8    |      —      | `tenets.test.ts` — load, merge, check, emit                    |
| Policy             |    ✅ 5    |      —      | `policy-loader.test.ts` — @RULE extraction                     |
| Sessions           |    ✅ 7    |      —      | `session.test.ts` — checkpoint, recover, TTL                   |
| Streaming          |    ✅ 7    |      —      | `stream.test.ts` — progressive lifecycle emission              |
| Public exports     |    ✅ 2    |      —      | `public-exports.test.ts` — entrypoint stability                |
| std:fs.\* ops      |     —      |  ✅ E2E-1   | Covered by integration (read + write)                          |
| std:data.\* ops    |    ✅ 5    |  ✅ E2E-3   | `executor.test.ts` + integration (parse + serialize)           |
| std:control.\* ops |   ✅ 12    |  ✅ E2E-4   | `ops.test.ts` — 7 ops including await                          |
| std:handler.\* ops   |    ✅ 9    |  ✅ E2E-5   | `ops.test.ts` + notify integration                             |
| std:sys.\* ops     |    ✅ 4    |  ✅ E2E-6   | `ops.test.ts` + info/clock/env integration                     |
| std:http.\* ops    |   ✅ 28    |      —      | `http.test.ts` — 7 methods + sandbox + httpAllowlist           |
| Workflow contracts |    ✅ 4    |  ✅ E2E-10  | @INPUT/@OUTPUT/@YIELD validation                               |
| Error codes        |   ✅ 26    |      —      | `errors.test.ts` — 18 codes, severity, source                  |
| Serializer         |    ✅ 7    |      —      | `serializer.test.ts` — dynamic severity/source                 |
| Sandbox escape     |     —      |  ✅ E2E-8   | Path traversal rejection proof                                 |
| Deprecation        |    ✅ 1    |      —      | `ops.test.ts` — OpRegistry deprecation tracking                |

---

## Spec Alignment

| Runner Spec Section       | Covered By                                 | Status             |
| ------------------------- | ------------------------------------------ | ------------------ |
| §2.1 Five-phase model     | `executor.test.ts`, `validator.test.ts`    | ✅                 |
| §2.2 @STEP resolution     | `state.test.ts`                            | ✅                 |
| §3.1 Permission model     | `permissions.test.ts`                      | ✅                 |
| §3.2 Fail-closed default  | `permissions.test.ts`                      | ✅                 |
| §5 Governance (tenets)    | `tenets.test.ts`                           | ✅                 |
| §5 Governance (policy)    | `policy-loader.test.ts`                    | ✅                 |
| §5 Sessions               | `session.test.ts`                          | ✅                 |
| §6.1 @CHECK assertions    | `validator.test.ts`, `integration.test.ts` | ✅                 |
| §6.2 @CATCH recovery      | `executor.test.ts`                         | ✅                 |
| §6.3 @RETRY backoff       | `executor.test.ts`                         | ✅                 |
| §7.1 @STAMP provenance    | `executor.test.ts`                         | ✅                 |
| §4 std:fs operations      | `integration.test.ts` (E2E-1, E2E-9)       | ✅                 |
| §4 std:data operations    | `executor.test.ts`, `integration.test.ts`  | ✅                 |
| §4 std:control operations | `ops.test.ts`, `integration.test.ts`       | ✅ (7 ops)         |
| §4 std:handler operations   | `ops.test.ts`, `integration.test.ts`       | ✅                 |
| §4 std:http operations    | `http.test.ts`                             | ✅                 |
| §4.3 Plugin system        | `executor.test.ts`                         | ✅                 |
| §5 Workflow contracts     | `integration.test.ts` (E2E-10..13)         | ✅                 |
| §8 Sandbox isolation      | `integration.test.ts` (E2E-8)              | ✅                 |
| §9 Error codes (v2.0)     | `errors.test.ts`                           | ✅ (18 codes)      |
| §11–§12 Cognitive/Agent   | —                                          | Out of scope (specialised tier) |

---

## Current Results

`npx vitest run` → **269 passed / 30 skipped / 0 failed**, 15 test files. The 30 skipped tests are conformance vectors: 12 `runner/` vectors pointing to `F-R002.1.{a–f}` sub-findings, plus 18 `runner-agentic/` + `runner-cognitive/` vectors deferred to a future specialised-tier runtime.

Type check: `npx tsc --noEmit` → **0 errors**

_Last verified: 2026-05-28 (Node 20+)._

---

## Report Generator

The report generator runs representative YON workflows end-to-end through `createRunner()` and writes timestamped artifacts.

```bash
npx tsx test/generate-report.ts
```

### Output

```
test/reports/<timestamp>/
├── _summary.txt               ← Pass/fail tally, timing
├── fs-read-write.input.yon    ← The YON document used
├── fs-read-write.stamps.json  ← Provenance trail
├── fs-read-write.result.json  ← Success, errors, step count
├── control-if.input.yon
├── control-if.stamps.json
├── ...
└── empty-workflow.result.json
```

### Scenarios

| #   | Scenario                 | Validates              |
| --- | ------------------------ | ---------------------- |
| 1   | fs.read + fs.write       | Basic I/O pipeline     |
| 2   | control.if               | Gate Model branching   |
| 3   | control.match            | Multi-branch selection |
| 4   | data.parse + data.format | JSON transform         |
| 5   | Permission deny          | Fail-closed security   |
| 6   | handler.notify             | Console output         |
| 7   | sys.info + sys.clock     | System operations      |
| 8   | Empty workflow           | Minimal valid document |

Report directories are gitignored.

---

## Adding Tests

### Unit test (component behavior)

```typescript
import { describe, it, expect } from "vitest";

describe("my component", () => {
  it("does the thing", () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Report scenario (end-to-end)

Add to the `SCENARIOS` array in `test/generate-report.ts`:

```typescript
{
  id: "my-scenario",
  label: "My scenario (what it validates)",
  permissions: [{ op: "std:fs.*", action: "ALLOW" }],
  expectSuccess: true,
  yon: `@DOC ver=2.0 | kind=workflow | id=test | title="Test" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="input.txt"]`,
}
```

---

## Test Sufficiency Assessment

### Verdict: Adoption-Ready

Tests verify all core components individually and as an integrated whole. End-to-end integration tests prove the five-phase pipeline works from YON text to RunResult. The permission model, error handling, validation rules, control flow (7 ops), data operations, HTTP operations (including sandbox network enforcement and `httpAllowlist` gating), filesystem I/O, workflow contracts, sandbox isolation, governance (tenets + policy), sessions (checkpoint + recovery), streaming emission, @CHECK assertions, @RETRY recovery, @CATCH fallback, abort signal cancellation, and output serialization are all covered.

### Resolved Gaps

The following gaps were identified during assessment and resolved:

| #   | Gap                                 | Resolution                      | Test ID               |
| --- | ----------------------------------- | ------------------------------- | --------------------- |
| 1   | ~~No end-to-end integration tests~~ | 21 E2E tests added              | E2E-1 through E2E-21  |
| 2   | ~~No fs ops tests~~                 | Read + write pipeline tested    | E2E-1                 |
| 3   | ~~No sandbox escape tests~~         | Path traversal rejection proven | E2E-8                 |
| 8   | ~~No multi-step dependency chain~~  | 3-step chain tested             | E2E-9                 |
| 9   | ~~No workflow contract tests~~      | @INPUT/@OUTPUT/@YIELD validated | E2E-10 through E2E-13 |
| 4   | ~~No @CHECK assertion evaluation~~  | ABORT/SKIP/WARN tested          | E2E-14 through E2E-16 |
| 5   | ~~No @RETRY integration~~           | Retry with re-execution tested  | E2E-17                |
| 6   | ~~No @CATCH fallback execution~~    | Fallback + on-filter tested     | E2E-18, E2E-19        |
| 7   | ~~No abort signal tests~~           | External signal cancellation    | E2E-20                |
| 10  | ~~HTTP ops bypassed network sandbox~~ | `sandbox.network=false` blocks `std:http.*` before fetch | `http.test.ts` |
| 11  | ~~Download sibling-prefix path escape~~ | Download paths resolve through sandbox containment | `http.test.ts` |
| 12  | ~~Interaction namespace named too narrowly~~ | Standard interaction ops renamed to `std:handler.*` | `ops.test.ts`, `integration.test.ts` |

---

## License

Apache-2.0 — © 2026 MARLINK TRADING SRL (YounndAI)

_Structure before scale._
