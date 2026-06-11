<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>YON Toolchain</strong><br />
  The official toolchain for YON — YounndAI Object Notation™<br />
  <em>Data, intent, and instructions in a single stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

---

## What is YON?

YON is a line-oriented, stream-first data format designed for both human and AI consumption. Every record line is independently parseable — no global schema required, enter mid-stream and understand. The same format serves as a data container, a prompt, a configuration file, an execution plan, or a multi-agent controller.

This monorepo publishes the YON toolchain — 8 npm packages under the [`@younndai`](https://www.npmjs.com/org/younndai) scope: a reference parser and validator, a fluent document builder, a sandboxed workflow runner, deterministic format converters, a runnable example cookbook, a benchmark suite, domain schemas, and a provider-agnostic LLM gateway.

## Packages

| Package | What it does |
|---|---|
| [`@younndai/yon-parser`](packages/yon-parser) | Reference parser, validator, and formatter for YON v2.0. |
| [`@younndai/yon-generator`](packages/yon-generator) | Fluent builder API for constructing valid YON documents from code. |
| [`@younndai/yon-runner`](packages/yon-runner) | Executes YON workflow documents in a fail-closed sandbox. |
| [`@younndai/yon-converter`](packages/yon-converter) | Deterministic converters between YON and JSON/YAML/TOML/XML/CSV/INI. |
| [`@younndai/yon-examples`](packages/yon-examples) | Runnable cookbook and CLI for learning YON. |
| [`@younndai/yon-benchmarks`](packages/yon-benchmarks) | Benchmark suite — structural reliability, cognitive economy, streaming. |
| [`@younndai/domains`](packages/domains) | Fetch, validate, introspect, and classify YounndAI Domain schemas. |
| [`@younndai/ai-relay`](packages/ai-relay) | Provider-agnostic LLM gateway with a model registry. |

## Quick Start

```bash
npm install @younndai/yon-parser
```

```ts
import { parseDocument } from "@younndai/yon-parser";

const doc = parseDocument(`@DOC ver=2.0 | id=hello | title="Hello World"
@NOTE text="Every line stands alone."`);
```

See each package's README for its full API, and the [Quick Start guide](https://github.com/YounndAI/yon-spec/blob/main/guides/quickstart.md) in the specification repo.

## The YON Project

- **Specification** — [`YounndAI/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard. Published as [`@younndai/yon-spec`](https://www.npmjs.com/package/@younndai/yon-spec).
- **Toolchain** — this repository.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Development

```bash
npm install
npm run build
npm test
```

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
| **Spec**      | [YON v2.0](https://github.com/YounndAI/yon-spec)        |
| **Author**    | [Alexandru Mareș](https://allemaar.com)                 |
| **Company**   | [MARLINK TRADING SRL](https://younndai.com) · YounndAI™ |
| **License**   | [Apache 2.0](./LICENSE) — © 2026 MARLINK TRADING SRL    |
| **Trademark** | [YounndAI™ Trademark Guidelines](./TRADEMARK.md)        |
