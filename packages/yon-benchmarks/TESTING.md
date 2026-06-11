# Testing Guide

## Suite Inventory

| Suite                    | Tests | Category | Source                                  |
| ------------------------ | ----- | -------- | --------------------------------------- |
| Structural Reliability   | 4     | Local    | `src/local/structural-reliability.ts`   |
| Streaming Properties     | 4     | Local    | `src/local/streaming-properties.ts`     |
| Format Fidelity          | 4     | Local    | `src/local/format-fidelity.ts`          |
| Hallucination Resistance | 4     | Local    | `src/local/hallucination-resistance.ts` |
| LLM Cognitive Load       | 4     | LLM      | `src/llm/cognitive-load.ts`             |
| LLM Generation Quality   | 3     | LLM      | `src/llm/generation-quality.ts`         |
| Shot Curve Adaptation    | 4     | LLM      | `src/llm/shot-curve.ts`                 |

**Total: 27 tests across 7 suites.**

## Running Tests

```bash
# Unit tests (vitest)
npm test

# Local benchmarks
npm run bench:local

# Full benchmarks with report
npm run bench
```

## Report Structure

After running `npm run bench`, a timestamped directory appears in `reports/`:

```
reports/2026-02-12T19-00-00/
├── structural-reliability.json    # Forensic data
├── structural-reliability.md      # Human-readable
├── streaming-properties.json
├── streaming-properties.md
├── format-fidelity.json
├── format-fidelity.md
├── hallucination-resistance.json
├── hallucination-resistance.md
├── cognitive-load.json            # LLM (if API key present)
├── cognitive-load.md
├── generation-quality.json
├── generation-quality.md
├── shot-curve.json
├── shot-curve.md
├── report.json                    # Aggregate
└── index.md                       # Aggregate with AI enrichment
```

## Vector Files

Test vectors live in `vectors/` and are committed to git. Each vector is a
pre-generated set of YON, JSON, YAML, Markdown, and natural-language inputs
that the benchmark suites read deterministically. The committed vectors are
the canonical inputs — the suites never regenerate them at run time.

---

_Structure before scale. Clarity above all._
