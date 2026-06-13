<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-benchmarks/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-benchmarks/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-benchmarks/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-benchmarks</strong><br />
  Quantitative evidence for the YON™ format — structural reliability, cognitive economy, streaming<br />
  <em>Part of the YON™ toolchain. Data, intent, provenance, and thought — in one stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-benchmarks)](https://www.npmjs.com/package/@younndai/yon-benchmarks)
[![license](https://img.shields.io/npm/l/@younndai/yon-benchmarks)](./LICENSE)

## What is this?

Quantitative evidence for the YON™ format. Measures structural reliability, cognitive economy, streaming properties, fault isolation, and emitter faithfulness across 58 local suites and 12 LLM suites.

## Install

```bash
npm install @younndai/yon-benchmarks
```

## Quick Start

```bash
# Local suites only (no API keys needed)
npm run bench:local

# Full run (local + LLM suites if keys available)
npm run bench

# LLM suites only
npm run bench:llm

# Single provider
npm run bench -- --provider openai

# Multiple providers
npm run bench -- --provider openai,google

# Filter by suite name
npm run bench -- --filter "generation"
```

## API Key Setup

Copy `.env.example` to `.env.local` in this package directory and fill in your provider keys:

```env
# OpenAI — required for most LLM suites (default provider)
OPENAI_API_KEY=sk-proj-...

# Anthropic — used for multi-model comparison suites
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google — used for multi-model comparison suites
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

**Missing keys are not errors.** Suites that need a missing provider will skip with a message explaining which key to add. Local suites never require API keys.

### Which keys unlock which suites?

| Suite                    | OpenAI | Anthropic | Google |
| ------------------------ | ------ | --------- | ------ |
| Cognitive Load           | ✅     | —         | —      |
| Generation Quality       | ✅     | —         | —      |
| Shot Curve               | ✅     | —         | —      |
| Information Preservation | ✅     | —         | —      |
| Format Comprehension     | ✅     | ✅        | ✅     |
| Format Traps             | ✅     | ✅        | ✅     |
| Density Comparison       | ✅     | ✅        | ✅     |
| Prompt Compression       | ✅     | ✅        | ✅     |
| Multi-Model Generation   | ✅     | ✅        | ✅     |
| Report Enrichment        | ✅     | ✅        | ✅     |

Report Enrichment is a post-run analysis/synthesis step over the suite results, not one of the 9 counted LLM suites. Suites marked with a single ✅ default to OpenAI but will fall back to any available provider. Multi-model suites run across all available providers.

## CLI Reference

```
npm run bench [flags]

Flags:
  --local                 Run local suites only (no LLM)
  --llm                   Run LLM suites only (skip local)
  --provider <name>       Restrict LLM to specific provider(s)
                          Values: openai, anthropic, google
                          Comma-separated for multiple: openai,google
  --filter <term>         Run only suites whose name contains <term>
  --report                Force report generation (default for full runs)
```

### Examples

```bash
# Quick local check during development
npm run bench:local

# Test with just OpenAI
npm run bench -- --provider openai

# Multi-model comparison (OpenAI + Google)
npm run bench -- --provider openai,google

# Run a specific LLM suite
npm run bench -- --llm --filter "cognitive"

# Full run with all providers
npm run bench
```

## What It Measures

### Six Pillars

| Pillar                   | What it validates                                                                | Example suites                             |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------ |
| **Streaming**            | Line-oriented processing, first-record latency                                   | Streaming Properties, Streaming Latency    |
| **Lossless**             | Zero information loss through format conversions                                 | Format Fidelity, Payload Fidelity, Hedging |
| **Cognitive Economy**    | Token efficiency at compressed densities (min/ultra), context window utilization | Token Efficiency, Context Utilization      |
| **Cross-cutting**        | Structural reliability, error recovery, throughput                               | Error Recovery, Comparative Throughput     |
| **Emitter Faithfulness** | LLMs generate valid YON without fine-tuning                                      | Generation Quality, Multi-Model Validity   |
| **Sapir-Whorf**          | Whether notation shapes model cognition — comprehension, salience, priming       | Notation Alignment, Profile Priming, Value Amplifier |

### Suite Breakdown

- **58 local suites** — deterministic, no API keys needed
- **12 LLM suites** — require API keys, measure AI comprehension and generation

## Report Output

Reports are written to `reports/<timestamp>/`:

```
reports/
  2026-02-14-13-17/
    summary.md              # Human-readable summary
    summary.json             # Machine-readable results
    enriched-summary.md      # AI-polished version (if LLM available)
    <suite-name>/
      result.json            # Per-suite detailed results
      result.md              # Per-suite human summary
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

Deterministic vitest suites run without API keys. The benchmark suites above (`npm run bench`) are separate from the unit tests.

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
