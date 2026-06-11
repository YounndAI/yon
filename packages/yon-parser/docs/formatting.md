# Formatting

| Status   | Informative                                         |
| -------- | --------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                       |
| Spec     | YON v2.0 — [§4.3 Formats](https://yon.younndai.com) |
| Requires | [Parsing](parsing.md)                               |

> Formatting converts a parsed AST back into a YON string. The `fmt=` field on `@DOC` declares the intended format — it is set at **document creation time** (by generators or authors), not by the parser. The parser's `format()` function re-serializes an existing AST into one of three deterministic modes.

---

## Format Modes

YON defines three output formats. The `fmt=` field on `@DOC` declares which mode a document was authored in. All modes are **lossless** — they preserve full semantic fidelity. The difference is density.

| Mode  | `fmt=` Value | Purpose                                                         |
| ----- | ------------ | --------------------------------------------------------------- |
| Canon | `canon`      | Full clarity. Preferred for authoring, review, version control. |
| Min   | `min`        | Reduced whitespace. Suitable for transmission and storage.      |
| Ultra | `ultra`      | Maximum token reduction. Optimized for LLM context windows.     |

> **Important:** The format is a property of the **document**, not a parser operation. Generators (like `@younndai/yon-generator`) create documents in a specific format. The parser reads any format and can re-serialize into any format.

### Canon

```plaintext
@DOC ver=2.0 | id=example | title="Full Clarity" | fmt=canon

@SEC name="Overview"
@NOTE text="This is the canonical format."
@RULE lvl=MUST | when="user submits form" | then="validate all fields"
```

### Min

```plaintext
@DOC ver=2.0|id=example|title="Full Clarity"|fmt=min
@SEC name="Overview"
@NOTE text="This is the canonical format."
@RULE lvl=MUST|when="user submits form"|then="validate all fields"
```

### Ultra

```plaintext
@DOC ver=2.0|id=example|title="Full Clarity"|fmt=ultra
@SEC name="Overview"
@NOTE text="This is the canonical format."
@RULE lvl=MUST|when="user submits form"|then="validate all fields"
```

---

## `format(doc, options?)` → `string`

Re-serialize a parsed AST into a deterministic YON string.

```typescript
import { parse, format } from "@younndai/yon-parser";

const doc = parse(input);

// Re-serialize in canon mode
const canon = format(doc, { mode: "canon" });

// Re-serialize in min mode
const min = format(doc, { mode: "min" });

// Re-serialize in ultra mode
const ultra = format(doc, { mode: "ultra" });
```

### `FormatOptions`

| Option | Type     | Default   | Description                            |
| ------ | -------- | --------- | -------------------------------------- |
| `mode` | `string` | `"canon"` | Output format: `canon`, `min`, `ultra` |

---

## Formatting Guarantees

- **Idempotent**: `format(parse(format(parse(input)))) === format(parse(input))`
- **Deterministic**: Same AST always produces the same output
- **Lossless**: All semantic content is preserved across modes
- **Bare value optimization**: Simple values without special characters use bare (unquoted) form per §3.1.3

---

## Granular Formatting API

For per-record or per-block formatting without processing the entire document.

### `formatRecord(record, mode?)` → `string`

Format a single record:

```typescript
import { formatRecord } from "@younndai/yon-parser";

const line = formatRecord(record, "canon");
// → '@RULE lvl=MUST | when="user submits" | then="validate"'
```

### `formatBlock(block, mode?)` → `string`

Format a single block (including `@BEGIN`/`@END` wrappers):

```typescript
import { formatBlock } from "@younndai/yon-parser";

const blockStr = formatBlock(block, "canon");
// → '@BEGIN JSON | id="data"\n{"key": "value"}\n@END JSON'
```

### `sortFields(fields)` → `Map`

Sort record fields in deterministic order per §17:

```typescript
import { sortFields } from "@younndai/yon-parser";

const sorted = sortFields(record.fields);
// Fields ordered: fixed keys first (id, rid, name, ...), then alphabetical
```

---

## Related

- [Parsing](parsing.md) — parse input before formatting
- [Validation](validation.md) — validate before formatting
- [Reference](reference.md) — format options and types

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
