<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon</strong><br />
  The YON™ toolchain in one install<br />
  <em>Data, intent, provenance, and thought — in one stream.</em>
</p>

---

`@younndai/yon` is the convenience entry point for the **YON toolchain** — install one package and get the parser, generator, runner, converter, domain schemas, AI relay, examples, and benchmarks. Prefer to pull only what you need? Every tool also ships as its own package — install those directly instead.

## Install

```bash
npm install @younndai/yon
```

## Use

Import the tools by namespace from the meta-package:

```ts
import { parser, generator, runner } from "@younndai/yon";

const ast = parser.parse(source);
```

…or import directly from each package — both styles work and resolve to the same code:

```ts
import { parse } from "@younndai/yon-parser";
```

## What's included

| Namespace | Package | What it does |
|---|---|---|
| `parser` | [`@younndai/yon-parser`](https://www.npmjs.com/package/@younndai/yon-parser) | Parse, validate, and format YON |
| `generator` | [`@younndai/yon-generator`](https://www.npmjs.com/package/@younndai/yon-generator) | Build valid YON documents from code |
| `runner` | [`@younndai/yon-runner`](https://www.npmjs.com/package/@younndai/yon-runner) | Execute YON workflows |
| `converter` | [`@younndai/yon-converter`](https://www.npmjs.com/package/@younndai/yon-converter) | Convert between YON and JSON/CSV/INI |
| `domains` | [`@younndai/domains`](https://www.npmjs.com/package/@younndai/domains) | Official domain schemas (fetch / validate / classify) |
| `aiRelay` | [`@younndai/ai-relay`](https://www.npmjs.com/package/@younndai/ai-relay) | Provider-agnostic LLM gateway |
| `examples` | [`@younndai/yon-examples`](https://www.npmjs.com/package/@younndai/yon-examples) | Example corpus |
| `benchmarks` | [`@younndai/yon-benchmarks`](https://www.npmjs.com/package/@younndai/yon-benchmarks) | Performance benchmark suite |

The normative specification lives separately in [`@younndai/yon-spec`](https://www.npmjs.com/package/@younndai/yon-spec) — the tools above depend on it.

## Learn more

- **Spec & guides:** [yon.younndai.com](https://yon.younndai.com)
- **Source:** [github.com/YounndAI/yon](https://github.com/YounndAI/yon)

## License & Attribution

Licensed under the [Apache License 2.0](./LICENSE). YON™ and YounndAI™ are trademarks of MARLINK TRADING SRL (YounndAI) — see [TRADEMARK.md](./TRADEMARK.md) and [NOTICE](./NOTICE). © 2026 MARLINK TRADING SRL (YounndAI) — [younndai.com](https://younndai.com).

<p align="center"><em>Structure before scale. Harmony above all.</em></p>
