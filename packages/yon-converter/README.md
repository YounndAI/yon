<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-converter/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-converter/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-converter/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-converter</strong><br />
  Deterministic YON™ format converters — code-only, no AI, no inference<br />
  <em>Part of the YON™ toolchain. Data, intent, provenance, and thought — in one stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-converter)](https://www.npmjs.com/package/@younndai/yon-converter)
[![license](https://img.shields.io/npm/l/@younndai/yon-converter)](./LICENSE)

## What is this?

`yon-converter` provides bidirectional conversion between YON v2.0 and seven external formats:

| Format | To YON         | From YON       |
| ------ | -------------- | -------------- |
| JSON   | ✅ `jsonToYon` | ✅ `yonToJson` |
| YAML   | ✅ `yamlToYon` | ✅ `yonToYaml` |
| TOML   | ✅ `tomlToYon` | ✅ `yonToToml` |
| CSV    | ✅ `csvToYon`  | ✅ `yonToCsv`  |
| XML    | ✅ `xmlToYon`  | ✅ `yonToXml`  |
| INI    | ✅ `iniToYon`  | ✅ `yonToIni`  |
| YON    | —              | ✅ passthrough |

YON-to-YON performs a `parse → format` passthrough. The converter is intentionally deterministic — structural transformation (reformat, re-profile, domain migration) is out of scope.

Minimal dependencies: `yaml`, `smol-toml` for format parsing. Everything else is built in.

---

## Install

```bash
npm install @younndai/yon-converter
```

---

## Quick Start

```typescript
import {
  jsonToYon,
  reverseConvert,
  detectFormat,
} from "@younndai/yon-converter";

// JSON → YON
const yon = jsonToYon(
  { name: "test", version: "1.0.0" },
  {
    id: "config",
    title: "Config",
    profile: "core",
    domain: "yai.devops",
  },
);

// YON → JSON
const json = reverseConvert(yon, { targetFormat: "json" });

// YON → YON (passthrough: parse → re-serialize)
const normalized = reverseConvert(yon, { targetFormat: "yon" });

// Auto-detect format
const format = detectFormat(input);
// → 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini' | 'yon' | 'unknown'
```

---

## Format Converters

### JSON

```typescript
import { jsonToYon, yonToJson, yonToObject } from "@younndai/yon-converter";

const yon = jsonToYon('{"key": "value"}', options);
const json = yonToJson(yonString);
const obj = yonToObject(yonString);
```

### YAML

```typescript
import { yamlToYon, yonToYaml } from "@younndai/yon-converter";

const yon = yamlToYon("name: test\nversion: 1.0.0", options);
const yaml = yonToYaml(yonString);
```

### TOML

```typescript
import { tomlToYon, yonToToml } from "@younndai/yon-converter";

const yon = tomlToYon('[package]\nname = "test"', options);
const toml = yonToToml(yonString);
```

### CSV

```typescript
import { csvToYon, yonToCsv } from "@younndai/yon-converter";

const yon = csvToYon("name,age\nAlice,30\nBob,25", options);
const csv = yonToCsv(yonString);
```

### XML

```typescript
import { xmlToYon, yonToXml } from "@younndai/yon-converter";

const yon = xmlToYon("<root><item>value</item></root>", options);
const xml = yonToXml(yonString);
```

### INI

```typescript
import { iniToYon, yonToIni } from "@younndai/yon-converter";

const yon = iniToYon("[section]\nkey=value", options);
const ini = yonToIni(yonString);
```

---

## Options

All `*ToYon` converters accept `JsonToYonOptions`:

```typescript
{
  // Core header fields
  id?: string,                                     // Document ID
  title?: string,                                  // Document title
  kind?: string,                                   // Document kind (default: 'doc')
  profile?: 'core' | 'decl' | 'exec' | 'audit' | 'cognitive' | 'agent' | 'full',  // YON profile (default: 'exec')
  format?: 'canon' | 'min' | 'ultra',             // Output density (default: 'canon')

  // Extended header fields (§16.1)
  mode?: string,                                   // Processing mode (struct|chat|text|hybrid)
  domain?: string,                                 // Domain (e.g., 'yai.health')
  features?: string[],                             // Enabled features
  with?: string[],                                 // Additional features
  without?: string[],                              // Disabled features
}
```

---

## Format Detection

The input declares its format through structure:

```typescript
import { detectFormat } from "@younndai/yon-converter";

detectFormat('{"key": "value"}'); // → 'json'
detectFormat("key: value"); // → 'yaml'
detectFormat("[section]\nkey=v"); // → 'ini'
detectFormat("name,age\nA,30"); // → 'csv'
detectFormat("<root>v</root>"); // → 'xml'
detectFormat("@DOC ver=2.0"); // → 'yon'
detectFormat("some plain text"); // → 'unknown'
```

`unknown` indicates the format could not be determined. A simple enveloping conversion is applied.

---

## Reverse Converter

Convert YON back to any format:

```typescript
import { reverseConvert } from "@younndai/yon-converter";

const json = reverseConvert(yonString, { targetFormat: "json" });
const yaml = reverseConvert(yonString, { targetFormat: "yaml" });

// YON passthrough: parse → format (validates and normalizes)
const yon = reverseConvert(yonString, { targetFormat: "yon" });
```

The YON passthrough validates and normalizes input. Structural transformation is out of scope for this package.

---

## AST Walker

Traverse YON document structure programmatically:

```typescript
import { walkDocument, walkRecord } from "@younndai/yon-converter";
import { parse } from "@younndai/yon-parser";

const doc = parse(yonString);
const data = walkDocument(doc);

// Include metadata records (@DOC, @NOTE, @META)
const full = walkDocument(doc, { includeMeta: true });

// Walk individual records with tag preservation
const record = walkRecord(doc.records[0], { includeMeta: true });
// → { _tag: 'RULE', lvl: 'MUST', when: '...', then: '...' }
```

The walker uses parser `typedFields` when available for spec-compliant type coercion. Supported tags: `@MAP`, `@CFG`, `@SCHEMA`, `@RULE`, `@STEP`, `@CHECK`, `@CATCH`, `@RETRY`, `@ERROR`, `@INPUT`, `@OUTPUT`, `@YIELD`, `@CHECKPOINT`, `@RECOVER`, `@NOTE`, `@SEC`.

---

## Streaming

Convert YON streams incrementally:

```typescript
import {
  streamToJson,
  streamRecords,
  collectStream,
} from "@younndai/yon-converter";

// Stream YON chunks → JSON output
for await (const chunk of streamToJson(yonChunks)) {
  console.log(chunk.delta);
}

// Stream records as they parse
for await (const record of streamRecords(yonChunks)) {
  console.log("Parsed record:", record.tag);
}

// Collect stream to final result
const result = await collectStream(streamToJson(yonChunks));
```

---

## CLI

Convert files from the command line:

```bash
npx yon-convert input.json --to yon
npx yon-convert input.yaml --to yon --profile exec --domain yai.health
npx yon-convert input.yon --to json -o output.json
npx yon-convert input.yon --to yon   # passthrough: parse → format
cat data.toml | npx yon-convert --to yon
```

Supported `--to` formats: `yon`, `json`, `yaml`, `toml`, `csv`, `xml`, `ini`.  
Supported `--profile` values: `core`, `decl`, `exec`, `audit`, `cognitive`, `agent`, `full`.

---

## Types

```typescript
import type {
  InputFormat, // 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini' | 'unknown' | 'yon'
  YonProfile, // 'core' | 'decl' | 'exec' | 'audit' | 'cognitive' | 'agent' | 'full'
  YonFormat, // 'canon' | 'min' | 'ultra'
  JsonToYonOptions, // Forward conversion options (includes extended header fields)
  YonToJsonOptions, // Reverse JSON options
  WalkOptions, // AST walker options
  ReverseConvertOptions, // Reverse converter options (targetFormat includes 'yon')
} from "@younndai/yon-converter";
```

---

_Determinism is trust. The same input yields the same output, every time._

---

## Documentation

- [`HOW-TO-USE.md`](./HOW-TO-USE.md) — task-oriented usage guide.
- [`TESTING.md`](./TESTING.md) — test strategy and coverage.
- [`CHANGELOG.md`](./CHANGELOG.md) — release history.

## The YON Project

YON is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Testing

```bash
npm test
```

Run `npm run test:report` to generate a coverage report.

---

## About YounndAI

**YounndAI™ — You and AI, unified.** (pronounced *"yoon-dye"*)

A philosophy of intelligence: building with intention, so humans and machines
think together without losing what makes either whole.

## License & Attribution

Apache-2.0. © 2026 MARLINK TRADING SRL (YounndAI). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

"YON" and "YounndAI" are trademarks of MARLINK TRADING SRL — see [`TRADEMARK.md`](./TRADEMARK.md).

Created by [Alexandru Mareș](https://allemaar.com).

Website: [yon.younndai.com](https://yon.younndai.com)

<p align="center"><em>Structure before scale. Harmony above all.</em></p>

---

|               |                                                         |
| ------------- | ------------------------------------------------------- |
| **Spec**      | [YON v2.0](https://yon.younndai.com)                    |
| **Author**    | [Alexandru Mareș](https://allemaar.com)                 |
| **Company**   | [MARLINK TRADING SRL](https://younndai.com) · YounndAI™ |
| **License**   | [Apache 2.0](./LICENSE) — © 2026 MARLINK TRADING SRL    |
| **Trademark** | [YounndAI™ Trademark Guidelines](./TRADEMARK.md)        |
