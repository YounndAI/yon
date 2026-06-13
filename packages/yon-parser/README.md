<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-parser/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-parser/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-parser/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-parser</strong><br />
  YON v2.0 reference parser, validator, and formatter<br />
  Parses partial and malformed input line by line.<br />
  <em>Part of the YON™ toolchain. Data, intent, provenance, and thought — in one stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-parser)](https://www.npmjs.com/package/@younndai/yon-parser)
[![license](https://img.shields.io/npm/l/@younndai/yon-parser)](./LICENSE)

## What is this?

`@younndai/yon-parser` is the reference implementation of the YON v2.0 block format — a parser, validator, and deterministic formatter. Reference implementations define correctness: other YON parsers should match this behavior. It parses YON text into a structured AST, validates records and blocks against the spec and domain schemas, and formats documents in canonical, minimal, and ultra-compact modes.

## Install

```bash
npm install @younndai/yon-parser
```

## Quick Start

```ts
import { parse, validate, format } from "@younndai/yon-parser";

// Parse YON string → AST
const doc = parse('@DOC ver=2.0 | id=test | title="Hello"\n@NOTE text="World"');

// Validate (strict mode)
const result = validate(doc, { strict: true });
if (!result.valid) {
  console.error(result.errors);
}

// Format (deterministic output)
const formatted = format(doc, { mode: "canon" });
```

## Key Features

- **Full YON v2.0 compliance** — conformance vectors + comprehensive deterministic test suite.
- **Streaming parser** — line-by-line event-driven parsing for transport.
- **Granular validation API** — per-record and per-block validation, field constraints (range, enum, pattern, type), and domain lifecycle checking.
- **Domain resolution** — 34 bundled offline domains (full list: `listDomains('official')`), remote resolution with caching, and runtime registration of custom schemas.
- **Deterministic formatting** — canon, min, and ultra output modes, plus SHA-256 block integrity helpers.
- **Detailed diagnostics** — line numbers and error codes on every failure.

## CLI

```bash
yon validate document.yon --profile exec   # Validate a file
yon validate document.yon --lenient        # Validate in lenient mode
yon format document.yon --mode CANON       # Format a file
yon format document.yon --check            # Format with diff check
yon parse document.yon --json              # Parse and output JSON AST
```

## Documentation

| Document                         | Description                                               |
| -------------------------------- | --------------------------------------------------------- |
| [Overview](docs/overview.md)     | Architecture, processing pipeline, spec mapping           |
| [Parsing](docs/parsing.md)       | `parse()`, Lexer, token types, AST shape                  |
| [Validation](docs/validation.md) | `validate()`, granular API, field constraints, lifecycle  |
| [Formatting](docs/formatting.md) | `format()`, canon/min/ultra modes, granular formatting    |
| [Streaming](docs/streaming.md)   | `StreamingYonParser`, line-by-line transport parsing      |
| [Domains](docs/domains.md)       | Two-tier resolution, registration, lifecycle, constraints |
| [Integrity](docs/integrity.md)   | SHA-256 verification helpers                              |
| [Reference](docs/reference.md)   | Types, constants, error codes, profiles, features         |
| [How to Use](HOW-TO-USE.md)      | Comprehensive usage guide with examples                   |
| [Changelog](CHANGELOG.md)        | Version history and release notes                         |

## The YON Project

YON is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Testing

```bash
# Run all tests (see TESTING.md for current count)
npx vitest run

# Generate a timestamped report
npx tsx test/generate-report.ts
```

See [TESTING.md](./TESTING.md) for test architecture, conformance vectors, and the report generator.

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
