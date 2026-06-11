# How to Use — @younndai/yon-benchmarks

## Prerequisites

- Node.js 18+
- This package is part of the [YounndAI™ monorepo](https://github.com/younndai/yon-spec)

## Running Benchmarks

### Local Suites (No API Keys)

```bash
npm run bench:local
```

Runs all 36 local suites. These test structural properties of the YON format itself — no external services needed.

### LLM Suites

```bash
# All available providers
npm run bench:llm

# Single provider
npm run bench -- --provider openai

# Multiple providers
npm run bench -- --provider openai,google
```

Requires API keys in `.env.local` (see [API Key Setup](#api-key-setup)).

### Full Run

```bash
npm run bench
```

Runs local suites first, then LLM suites for any providers with configured API keys.

### Filtering

```bash
# Filter by suite name
npm run bench -- --filter "generation"
```

## API Key Setup

Create `.env.local` in the package root:

```env
# OpenAI — required for most LLM suites
OPENAI_API_KEY=sk-proj-...

# Anthropic — multi-model comparison
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google — multi-model comparison
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

Missing keys are not errors — suites that need unavailable providers skip gracefully.

## Understanding Reports

After a run, reports are generated in `reports/<timestamp>/`:

| File                  | Description                                       |
| --------------------- | ------------------------------------------------- |
| `summary.md`          | Human-readable results across all suites          |
| `summary.json`        | Machine-readable results for CI integration       |
| `enriched-summary.md` | AI-polished narrative (if LLM provider available) |
| `<suite>/result.json` | Per-suite detailed metrics                        |
| `<suite>/result.md`   | Per-suite human summary                           |

### Key Metrics

- **Structural reliability** — parsing correctness, tag coverage, roundtrip fidelity
- **Cognitive economy** — token efficiency vs JSON/YAML for equivalent content
- **Streaming properties** — incremental parse capability, partial validity
- **Fault isolation** — error recovery, graceful degradation
- **Emitter faithfulness** — generated YON vs spec conformance

## Other Commands

```bash
# Clean all reports
npm run bench:clean

# Re-generate report from last run
npm run bench -- --report
```

---

© 2026 MARLINK TRADING SRL (YounndAI™)
