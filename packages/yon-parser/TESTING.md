# Testing — `@younndai/yon-parser`

Every test is deterministic. Same input, same output. No LLM variance, no network dependencies, no flaky tests.

The parser is the foundation of the YON stack. If parsing is unreliable, everything above it is unreliable. **A comprehensive deterministic test suite guards this foundation.**

_Per-file test counts last refreshed: 2026-06-10._

---

## Quick Start

```bash
# Run the full suite
npx vitest run

# Watch mode during development
npx vitest --watch

# Generate a timestamped report with parse/format artifacts
npx tsx test/generate-report.ts
```

---

## Test Architecture

The suite is organized into 13 files. Each file tests a different concern.

| File                          | Question                                                       | Tests |
| ----------------------------- | -------------------------------------------------------------- | ----: |
| `domain-integrity.test.ts`    | Are bundled domain schemas internally consistent?              |   647 |
| `conformance.test.ts`         | Does the parser match the yon-spec conformance vectors?        |   417 |
| `domain-alignment.test.ts`    | Do parser domains match yon-spec domain schemas?               |   172 |
| `domain-coverage.test.ts`     | Are all domains and their tags covered?                        |   136 |
| `profiles-v2.test.ts`         | Do v2.0 profiles/features/tags behave correctly?               |    63 |
| `pass-regressions.test.ts`    | Are fixed bugs still fixed?                                    |    43 |
| `fast-parse-parity.test.ts`   | Does the fast-path parser match the reference parser?          |    42 |
| `streaming.test.ts`           | Does the streaming parser match the batch parser?              |    34 |
| `tag-alignment.test.ts`       | Do FEATURE_TAGS match the spec tag vocabulary?                 |    29 |
| `domain-remote.test.ts`       | Does remote domain resolution behave correctly (offline)?      |    22 |
| `domain-registration.test.ts` | Does third-party domain registration work?                     |    16 |
| `performance.test.ts`         | Does parse/validate/format stay within time budgets?           |     8 |
| `domain-remote-live.test.ts`  | Live network domain resolution — **skipped by default**.       |    46 |

`domain-remote-live.test.ts` requires network access and is skipped in the
default run. Counts above reflect the most recent quiet-run baseline; the deterministic
suite excludes the live tests.

### conformance.test.ts

Runs every `.yon` test vector from the `@younndai/yon-spec` conformance suite. Each vector is tested for:

1. **Parse** — does it parse successfully (or fail where expected)?
2. **Validate strict** — does strict validation produce the expected result?
3. **Validate lenient** — does lenient validation produce the expected result?

Vectors are auto-discovered via `getVectorPaths()` from `@younndai/yon-spec/conformance`.
If zero vectors are found, the suite **fails** (it must never silently pass).

Expected results are defined in `.expected.json` files alongside each vector:

```json
{
  "parse": "ok",
  "validate_strict": "ok",
  "validate_lenient": "ok"
}
```

Valid values: `"ok"` (pass), `"error"` (must fail), `"warn"` (valid with warnings), `"skip"` (not applicable).

### pass-regressions.test.ts

Guards against re-introduction of fixed bugs. Each test pins a behavior that
regressed at least once.

### streaming.test.ts

Tests the streaming parser against the Transport requirements: single-line `parseLine`,
chunked input, multi-doc lifecycle, async iteration, and batch parity.

---

## Conformance Vector System

The parser validates against the canonical vector suite maintained in `@younndai/yon-spec`:

```
packages/yon-spec/conformance/vectors/
├── <category>-<name>.yon          ← flat vector files, one per case
├── <category>-<name>.expected.json ← expected parse/validate outcomes
└── runner*/                        ← runner lifecycle vector subdirectories
```

Each `.yon` file has a corresponding `.expected.json` that declares the expected parse,
strict validation, and lenient validation outcomes. The conformance runner auto-discovers
all vectors via `getVectorPaths()` from `@younndai/yon-spec/conformance`.

---

## Report Generator

Produces a timestamped directory with parse and format artifacts for audit and compliance review.

```bash
npx tsx test/generate-report.ts
```

The `test/reports/` directory is gitignored. Reports are generated locally — evidence, not source.

---

## Reading Results

```
 Test Files  12 passed | 1 skipped (13)
      Tests  1629 passed | 46 skipped (1675)
```

_Example output; counts evolve._

| Symbol | Meaning                               |
| ------ | ------------------------------------- |
| **✓**  | Pass. Expected behavior confirmed.    |
| **×**  | Real defect. Investigate immediately. |

---

## Adding Tests

### New conformance vector

1. Create `packages/yon-spec/conformance/vectors/<category>-<name>.yon`
2. Create matching `.expected.json`:
   ```json
   { "parse": "ok", "validate_strict": "ok", "validate_lenient": "ok" }
   ```
3. Run `npx vitest run` — the vector is auto-discovered.

### New regression test

Add to `test/pass-regressions.test.ts`, mapping the test to a finding ID.

### New streaming test

Add to `test/streaming.test.ts`.

---

## Running in Your Environment

The default test suite requires no external services, no API keys, no network access.

```bash
git clone <repo>
cd packages/yon-parser
npm install
npx vitest run
```

If all pass, the parser is reliable for your workload.

_Structure before scale._
