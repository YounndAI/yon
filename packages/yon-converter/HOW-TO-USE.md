# How to Use — @younndai/yon-converter

## Overview

`yon-converter` provides deterministic, bidirectional conversion between YON™ v2.0 and seven external formats. No AI, no inference — the same input always produces the same output.

## Installation

```bash
npm install @younndai/yon-converter
```

## Supported Formats

| Format | To YON      | From YON    |
| ------ | ----------- | ----------- |
| JSON   | `jsonToYon` | `yonToJson` |
| YAML   | `yamlToYon` | `yonToYaml` |
| TOML   | `tomlToYon` | `yonToToml` |
| XML    | `xmlToYon`  | `yonToXml`  |
| CSV    | `csvToYon`  | `yonToCsv`  |
| INI    | `iniToYon`  | `yonToIni`  |

Additional exports: `yonToObject` (returns plain JS object), `reverseConvert` (auto-detect reverse), `detectFormat`.

## Converting To YON

All `*ToYon` functions accept raw data and return a YON string.

### JSON → YON

```typescript
import { jsonToYon } from "@younndai/yon-converter";

const json = { name: "Example", version: "1.0" };
const yon = jsonToYon(json);
// @DOC ver=2.0 | id=generated | title="Generated Document"
// @MAP name="data" | pairs=["name"->"Example","version"->"1.0"]
```

Accepts a `string` (raw JSON) or a `Record<string, unknown>` (parsed object).

### JsonToYonOptions

Control the `@DOC` header per YON v2.0 §16.1:

```typescript
const yon = jsonToYon(data, {
  profile: "decl", // YON profile (default: "exec")
  format: "min", // YON format (default: "canon")
  kind: "config", // Document kind (default: "doc")
  id: "my-config", // Document ID (default: "generated")
  title: "My Config", // Document title
  domain: "yai.health", // Domain namespace
  mode: "struct", // Processing mode: struct|chat|text|hybrid
  scenario: "api-call", // Scenario preset
  features: ["streaming"], // Explicitly enabled features
  with: ["validation"], // Additional features
  without: ["logging"], // Disabled features
});
```

### YAML / TOML / INI / CSV / XML → YON

Same pattern — each has format-specific options extending `JsonToYonOptions`:

```typescript
import {
  yamlToYon,
  tomlToYon,
  csvToYon,
  iniToYon,
  xmlToYon,
} from "@younndai/yon-converter";

const yon = yamlToYon(yamlString, { profile: "decl" });
const yon2 = csvToYon(csvString, { title: "Import Data" });
```

## Converting From YON

All `yonTo*` functions take a **parsed `YonDocument`** (from `@younndai/yon-parser`), not a raw string.

### YON → JSON

```typescript
import { parse } from "@younndai/yon-parser";
import { yonToJson, yonToObject } from "@younndai/yon-converter";

const document = parse(yonString);

// As JSON string (pretty-printed)
const json = yonToJson(document, { indent: 2 });

// As plain JavaScript object
const obj = yonToObject(document);
```

### YonToJsonOptions

```typescript
yonToJson(document, {
  indent: 2, // JSON indentation (default: 2)
  includeMeta: false, // Include metadata records (default: false)
  refHandling: "ignore", // How to handle unresolved refs: "error" | "placeholder" | "ignore"
});
```

## Auto-Detect Reverse Conversion

`reverseConvert` detects the output format automatically:

```typescript
import { reverseConvert } from "@younndai/yon-converter";

const result = reverseConvert(document, { format: "yaml" });
```

## Streaming

For large documents, use streaming converters that yield chunks:

```typescript
import { streamToJson, collectStream } from "@younndai/yon-converter";

// Stream chunks
for await (const chunk of streamToJson(asyncYonStream)) {
  process.stdout.write(chunk.content);
}

// Or collect all at once
const result = await collectStream(streamToJson(asyncYonStream));
```

Available: `streamToJson`, `streamToYaml`, `streamToToml`, `streamReverse`, `streamRecords`.

## Format Detection

```typescript
import { detectFormat } from "@younndai/yon-converter";

const format = detectFormat(rawInput); // "json" | "yaml" | "toml" | "xml" | "csv" | "ini" | "yon" | "unknown"
```

## Key Principles

- **Deterministic** — same input → same output, always
- **Spec-aligned** — `@DOC` headers follow §16.1 canonical field order
- **Round-trip safe** — `jsonToYon` → parse → `yonToJson` preserves semantics
- **No AI** — pure algorithmic transformation

---

© 2026 MARLINK TRADING SRL (YounndAI™)
