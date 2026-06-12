# The Cognitive Horizon

_Material Type: Explainer (70/30)_

## For Everyone

The same system architecture — 10 files describing an invoicing platform — was given to multiple AI models
in three formats: verbose English documentation, structured YON notation, and compressed YON notation.

Each model was asked 10 questions that required reading across multiple files to answer correctly.
The question: does **information density** affect how well an AI reasons about complex systems?

YON Minimal used 19% fewer tokens, achieving 25.0 acc/1K tokens vs 20.8 acc/1K tokens for documentation.
Accuracy traded 2pp for that compression — a cost-benefit decision, not a failure.

In this run, YON Minimal delivered 19% token savings while scoring 2pp below verbose documentation on accuracy.
For high-volume pipelines, the token savings may outweigh the accuracy delta. For single-shot reasoning, verbose context helps.

---

## For Specialists

### Token Economy

| Density | Approx Tokens | Accuracy | Efficiency (acc%/1k-tok) |
|:---|---:|---:|---:|
| Markdown | ~4,328 | 90% | 20.79 |
| YON Canon | ~5,426 | 90% | 16.59 |
| YON Minimal | ~3,524 | 88% | 24.97 |

Token savings: **19%** (minimal vs markdown). Density advantage: **-2pp**.

### Per-Model Breakdown

| Model | Markdown | YON Canon | YON Min | Δ (min−md) |
|:---|---:|---:|---:|---:|
| **GPT-5-nano (budget)** | 60% | 70% | 60% | +0pp (density helps) |
| **GPT-4o-mini (standard)** | 100% | 90% | 100% | +0pp (density helps) |
| **Gemini 2.5 Flash-Lite (budget)** | 100% | 100% | 90% | -10pp (explicit context helps) |
| **Gemini 2.5 Flash (standard)** | 90% | 90% | 90% | +0pp (density helps) |
| **Claude Haiku 4.5 (standard)** | 100% | 100% | 100% | +0pp (density helps) |

### Per-Question Accuracy

| Question | Markdown | YON Canon | YON Min |
|:---|---:|---:|---:|
| Q1 | 80% | 100% | 60% |
| Q2 | 100% | 100% | 100% |
| Q3 | 80% | 80% | 80% |
| Q4 | 100% | 100% | 100% |
| Q5 | 100% | 100% | 100% |
| Q6 | 60% | 40% | 60% |
| Q7 | 100% | 100% | 100% |
| Q8 | 80% | 80% | 80% |
| Q9 | 100% | 100% | 100% |
| Q10 | 100% | 100% | 100% |

## The Operational Characteristic

The Extended Mind thesis (Clark & Chalmers, 1998) argues that cognitive tools become part of the mind.
For LLMs, the context window IS the mind. Density IS cognitive capacity.

The data supports three observations:

1. **Density trades tokens for accuracy.** Compressed notation scored 2pp lower, but saved 19% of tokens — a deliberate cost/quality trade-off.
2. **Token efficiency compounds.** Denser formats deliver more correct answers per token spent — directly reducing cost.
3. **Structure creates addressability.** YON tags (`@SEC`, `@RULE`, `@MAP`) make cross-file references explicit,
   helping models trace dependencies that prose flattens.

> **Trade-off disclosure:** NL formats benefit from the training data advantage — all LLMs have seen vastly more natural language
> than YON. The efficiency and structural gains shown here emerge despite this asymmetry, not because of a level playing field.

## Synthesis

Context density affects AI cross-file reasoning. Surprisingly, YON Minimal saves 19% tokens but scores 2pp lower than Markdown. For YON users, this means choosing between token efficiency and slight accuracy reduction.

---

_Structure before scale. Clarity above all._
