# YON Benchmark Report

> **Version:** 0.1.0 · **Timestamp:** 2026-03-19T13:59:09.998Z
> **Platform:** win32 · **Node:** v22.19.0
> **LLM Access:** Yes

---

**156/156** gate tests passed, **336** comparative, **116** measurement — across **70** suites in 1h 2m (3727s).

## For Everyone

- All **156** engineering tests pass. Parser, converter, and streaming work correctly.
- LLMs achieve **71%** accuracy reading YON — from zero training data, no model has ever seen this notation before. Budget models gain up to **+44pp** with structured input.
- LLMs read YON at **92%** accuracy — comparable to JSON and prose. No special training required.
- **7** LLM-powered tests validate how AI models interact with YON across comprehension, generation, and extraction.

## Structural Advantages — Deterministic, Unmatchable

> These are architectural properties, not LLM-dependent. They hold on every run, every model, every dataset.

| Advantage | Evidence | vs Alternatives |
|:----------|:---------|:----------------|
| Error Recovery | **99%** single-line recovery | JSON: **0%** (bracket cascade destroys all subsequent data) |
| Zero Escaping | **0** escapes required | JSON: **15** escape sequences |
| Streaming TTFR | **0.069ms** first record | JSON must wait for closing bracket |
| Fault Boundary | **99.9%** data recovery at scale | One corrupt line costs one record, not the document |
| Multi-Hop Resilience | **95%** across 5 agent relay | JSON relay: lost records due to accumulated escaping errors |
| Type Safety | **3** /3 explicit type annotations | No Norway Problem — `:str`, `:int`, `:bool` are explicit |
| Append-Only Provenance | **100%** audit trail fidelity | Built-in `@PATCH` + `@VOID` — no external change tracking needed |
| Sustained Throughput | **694,341** records/sec | Single-stream, sustained, memory-stable |

## Research Validation — Sapir-Whorf for AI

> The Sapir-Whorf hypothesis posits that the structure of language shapes cognition. These **364** tests across **6** suites measure whether the same principle holds for AI — does notation shape how LLMs think?

| Hypothesis | Suite | Tests | Measured Evidence |
|:-----------|:------|------:|:------------------|
| Format Comprehension Parity | [Pliability](./pliability/result.md) | 15 | **92%** accuracy — matching trained formats from zero training data |
| Cognitive Bias Detection | [Borges Warning](./borges-warning/result.md) | 119 | **119** bias vectors tested — notation shapes LLM reasoning patterns |
| Extended Mind (cognitive scaffolding) | [Cognitive Horizon](./cognitive-horizon/result.md) | 170 | **100** % across **170** cognition tests — structured notation extends working memory |
| Lacunae (what notation makes visible) | [Lacunae Detection](./lacunae-detection/result.md) | 29 | **14** YON advantages, **9** parity across **29** concept extractions — structured notation surfaces hidden requirements |
| Blub Paradox (format ceiling) | [Blub Perception](./blub-perception/result.md) | 16 | **16** cross-model tests — do simpler formats limit reasoning? |
| Notation as Alignment | [Notation as Alignment](./notation-alignment/result.md) | 15 | **15** alignment vectors — structured input shapes output quality |

> See [Sapir-Whorf and YON](../../docs/concepts/sapir-whorf-and-yon.md) and [Notation as Cognitive Architecture](../../docs/concepts/notation-as-cognitive-architecture.md) for the theoretical framework behind these measurements.

---

## Navigate

- [Suite Scorecard](./scorecard.md) — Full results table
- [Key Findings & Analysis](./analysis.md) — Data tables and LLM narrative

---

_Structure before scale. Clarity above all._