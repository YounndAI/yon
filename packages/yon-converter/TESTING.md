# Testing — `@younndai/yon-converter`

Every conversion is deterministic. Same input, same output. Every failure is a real defect — there are no flaky tests, no LLM variance, no network dependencies.

The converter is the primary gateway for YON adoption. If format conversion is unreliable, the standard is unreliable. **261 tests guard this gate.**

---

## Quick Start

```bash
# Run the full suite (261 tests, <1s)
npx vitest run

# Watch mode during development
npx vitest --watch

# Generate a timestamped report with conversion artifacts
npx tsx test/generate-report.ts
```

---

## Test Architecture

The suite is organized into 8 intent-based files. Each file answers one question.

| File                 | Question                             | Tests |
| -------------------- | ------------------------------------ | ----: |
| `forward.test.ts`    | Does X → YON produce valid output?   |    35 |
| `reverse.test.ts`    | Does YON → X produce valid output?   |    32 |
| `roundtrip.test.ts`  | Does X → YON → X preserve semantics? |    41 |
| `streaming.test.ts`  | Does the async API work correctly?   |    17 |
| `spec.test.ts`       | Does output comply with YON v2.0?    |    58 |
| `resilience.test.ts` | Does the converter survive chaos?    |    31 |
| `errors.test.ts`     | Does the converter fail gracefully?  |    14 |
| `cli.test.ts`        | Does the CLI parse and dispatch?     |    33 |

### forward.test.ts — 35 tests

Tests every source format's path to YON: JSON, YAML, TOML, CSV, XML, INI. Verifies option coverage (CSV `headers: false`, custom `quote`; XML comments, CDATA, DOCTYPE, numeric character references; INI quoted values).

### reverse.test.ts — 32 tests

Tests every output path from YON: `yonToObject`, `reverseConvert` options (`stripMeta`, `indent`), format-specific emitters (`yonToCsv`, `yonToXml`, `yonToIni`), AST walker (`walkBlock`, `walkRecord` for INTENT/SCOPE), `maybeConvertToArray` indexed pattern detection, and cross-format reverse.

### roundtrip.test.ts — 41 tests

The core reliability proof. Converts `Format → YON → Format` and verifies semantic equality. Every supported format is tested. Includes type fidelity (the `__str__` sentinel mechanism), industrial precision (financial data, ISO 8601 dates, IEEE 754 edge cases), and mixed-type objects.

### streaming.test.ts — 17 tests

Async generator tests for `streamToJson`, `streamToYaml`, `streamToToml`, `streamReverse`, `streamRecords`, and `collectStream`. Verifies chunk metadata, reassembly, data parity with synchronous output, and pre-parsed `YonDocument` input.

### spec.test.ts — 58 tests

Validates output against YON v2.0 requirements:

- **Header compliance**: `@DOC` canonical field order, `exec`/`canon` default omission
- **Extended header (§16.1)**: `mode`, `scenario`, `domain`, `features`, `with`, `without` emission
- **Boundary safety (§6.2)**: ≥ 8 chars, content collision scanning
- **Type fidelity (§3.1.2)**: Nested primitives use `formatTypedValue`, nested roundtrip
- **Tag walkers**: `@MAP`, `@RULE` (rid), `@STEP` (rules, use, timeout_ms), `@CHECK`, `@CATCH`, `@RETRY`, `@ERROR`
- **Tag preservation (G7)**: `_tag` field with `includeMeta` toggle
- **Format detection**: `unknown` classification (renamed from `natural`)
- **YON passthrough**: `reverseConvert` with `targetFormat: 'yon'` — parse → format
- **Reverse formats**: All 6 + YON passthrough

### resilience.test.ts — 31 tests

Scale (100-key objects, 100KB payloads), pathological strings (ZWJ, RTL, emoji, code injection), adversarial keys, real-world fixtures (package.json, tsconfig, GitHub API, Docker Compose, GitHub Actions), concurrent streaming, and format-specific edge cases (ragged CSV, 10-level XML nesting, INI comments).

### errors.test.ts — 14 tests

Invalid inputs (malformed JSON, TOML, empty CSV), invalid reverse inputs (empty string, non-YON text), unicode preservation, long strings, numeric keys, deeply nested fallback, special characters in keys, and YON-significant values in data.

### cli.test.ts — 33 tests

Tests the CLI surface: `parseArgs` (all flags, combinations, validation error cases) and `convertToYon` dispatch (all 6 formats, YON passthrough, `unknown` wrapping, extended options, unsupported format error).

---

## Format Coverage Matrix

| Format | Forward | Reverse | Round-Trip | Streaming | Resilience |
| ------ | :-----: | :-----: | :--------: | :-------: | :--------: |
| JSON   |    ✓    |    ✓    |     ✓      |     ✓     |     ✓      |
| YAML   |    ✓    |    ✓    |     ✓      |     ✓     |     ✓      |
| TOML   |    ✓    |    ✓    |     ✓      |     ✓     |     ✓      |
| CSV    |    ✓    |    ✓    |     ✓      |     —     |     ✓      |
| XML    |    ✓    |    ✓    |     ✓      |     —     |     ✓      |
| INI    |    ✓    |    ✓    |     ✓      |     —     |     ✓      |

---

## Report Generator

Produces a timestamped directory with conversion artifacts and a summary. Useful for audits and compliance reviews.

```bash
npx tsx test/generate-report.ts
```

### Output Structure

```
test/reports/2026-02-10T02-20-00/
├── _summary.txt                  ← Pass/fail, timing, char counts
├── json-flat.yon                 ← Forward conversion output
├── json-flat.reverse.json        ← Reverse conversion proof
├── yaml-docker-compose.yon
├── yaml-docker-compose.reverse.json
├── xml-config.yon
├── xml-config.reverse.xml
├── ini-gitconfig.yon
├── ini-gitconfig.reverse.ini
└── ... (26 files total)
```

The `test/reports/` directory is gitignored. Reports are generated locally — evidence, not source.

---

## Reading Results

```
 ✓ test/cli.test.ts         (32 tests) 11ms
 ✓ test/forward.test.ts     (35 tests) 18ms
 ✓ test/reverse.test.ts     (32 tests) 13ms
 ✓ test/roundtrip.test.ts   (41 tests) 17ms
 ✓ test/streaming.test.ts   (17 tests) 26ms
 ✓ test/spec.test.ts        (58 tests) 18ms
 ✓ test/resilience.test.ts  (31 tests) 32ms
 ✓ test/errors.test.ts      (14 tests) 11ms

 Test Files  8 passed (8)
      Tests  261 passed (261)
   Duration  604ms
```

| Symbol | Meaning                               |
| ------ | ------------------------------------- |
| **✓**  | Pass. Expected behavior confirmed.    |
| **×**  | Real defect. Investigate immediately. |

The expected result is **261/261, always.** Any failure indicates a regression.

---

## Adding Tests

### New unit test

Add to the relevant `test/*.test.ts` file:

```typescript
it("handles your edge case", () => {
  const input = { key: "value" };
  const yon = jsonToYon(input, { id: "test", title: "Test" });
  expect(yon).toContain("value");
});
```

### New report scenario

Add to the `SCENARIOS` array in `test/generate-report.ts`:

```typescript
{
  id: 'json-your-case',
  label: 'JSON → YON (description)',
  sourceFormat: 'json',
  input: { /* your structure */ },
  reverseFormat: 'json',
},
```

### New round-trip test

Add to `test/roundtrip.test.ts`:

```typescript
it("your data survives round-trip", () => {
  const input = { key: "value" };
  const yon = jsonToYon(input, { id: "rt", title: "RT" });
  const json = reverseConvert(yon, { targetFormat: "json" });
  expect(JSON.parse(json).key).toBe("value");
});
```

---

## Running in Your Environment

The test suite requires no external services, no API keys, no network access.

```bash
git clone <repo>
cd packages/yon-converter
npm install
npx vitest run
```

Tests verify that the converter behaves identically in your environment. If all 261 pass, the converter is reliable for your workload.

_Structure before scale._
