<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-examples/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-examples/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-examples/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-examples</strong><br />
  YON™ v2.0 cookbook — runnable examples for learning by reading<br />
  <em>Part of the YON™ toolchain. Data, intent, provenance, and thought — in one stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-examples)](https://www.npmjs.com/package/@younndai/yon-examples)
[![license](https://img.shields.io/npm/l/@younndai/yon-examples)](./LICENSE)

## What is this?

A cookbook of runnable YON v2.0 examples — 59 examples across 13 categories covering all 72 YON v2.0 spec tags. Browse them from the CLI or discover them programmatically.

| Category         | What You Learn                             |
| ---------------- | ------------------------------------------ |
| Getting Started  | Hello world, pipelines, rules, config      |
| Data Engineering | ETL, validation, transforms, streaming     |
| Control Flow     | Conditional branching, loops, parallelism  |
| Resilience       | Retries, circuit breakers, sessions        |
| DevOps           | CI pipelines, health checks                |
| Advanced         | Plugins, sub-workflows, streams            |
| Declarative      | Standards, policies, specs                 |
| Domains          | Fintech, health, legal, gaming, e-commerce |
| Showcase         | Cognitive + Agent profile demos            |
| Cognition        | L3 reasoning, memory, perception, affect   |
| Agents           | L4 signaling, governance, collaboration    |
| Privacy          | Consent, redaction, classification         |
| Change Control   | Patches, voids, versioned edits            |

## Install

```bash
npm install @younndai/yon-examples
```

## Quick Start

```bash
npx yon-examples list                        # List all examples
npx yon-examples show hello-world            # View an example
npx yon-examples list --category 08-domains  # Filter by category
npx yon-examples categories                  # List categories
```

## Key Features

- 59 runnable YON v2.0 examples across 13 categories.
- Full coverage of all 72 YON v2.0 spec tags.
- CLI for listing, filtering, and viewing examples.
- Programmatic discovery API for embedding examples in your own tools.
- Every example is validated by the test suite.

## Programmatic API

```typescript
import {
  discoverExamples,
  readExample,
  findExample,
} from "@younndai/yon-examples";

const examples = discoverExamples();
const etl = findExample("etl-pipeline");
if (etl) console.log(readExample(etl));
```

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

Every `.yon` file in the `examples/` directory is automatically discovered and parsed during testing. Adding a new example? Just put it in the right category folder — tests pick it up automatically.

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
