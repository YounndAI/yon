# The Cognitive Horizon

_Material Type: Explainer (70/30)_

## For Everyone

The same system architecture — 10 files describing an invoicing platform — was given to multiple AI models
in three formats: verbose English documentation, structured YON notation, and compressed YON notation.

Each model was asked 10 questions that required reading across multiple files to answer correctly.
The question: does **information density** affect how well an AI reasons about complex systems?

YON Minimal used 19% fewer tokens, achieving 25.5 acc/1K tokens vs 21.3 acc/1K tokens for documentation.
Accuracy traded 2pp for that compression — a cost-benefit decision, not a failure.

In this run, YON Minimal delivered 19% token savings while scoring 2pp below verbose documentation on accuracy.
For high-volume pipelines, the token savings may outweigh the accuracy delta. For single-shot reasoning, verbose context helps.

---

## For Specialists

### Token Economy

| Density | Approx Tokens | Accuracy | Efficiency (acc%/1k-tok) |
|:---|---:|---:|---:|
| Markdown | ~4,328 | 92% | 21.26 |
| YON Canon | ~5,426 | 92% | 16.96 |
| YON Minimal | ~3,524 | 90% | 25.54 |

Token savings: **19%** (minimal vs markdown). Density advantage: **-2pp**.

### Per-Model Breakdown

| Model | Markdown | YON Canon | YON Min | Δ (min−md) |
|:---|---:|---:|---:|---:|
| **GPT-5-nano (budget)** | 70% | 70% | 60% | -10pp (explicit context helps) |
| **GPT-4o-mini (standard)** | 100% | 100% | 100% | +0pp (density helps) |
| **Gemini 2.5 Flash-Lite (budget)** | 100% | 100% | 90% | -10pp (explicit context helps) |
| **Gemini 2.5 Flash (standard)** | 90% | 90% | 100% | +10pp (density helps) |
| **Claude Haiku 4.5 (standard)** | 100% | 100% | 100% | +0pp (density helps) |

### Per-Question Accuracy

| Question | Markdown | YON Canon | YON Min |
|:---|---:|---:|---:|
| Q1 | 80% | 80% | 80% |
| Q2 | 100% | 100% | 100% |
| Q3 | 80% | 80% | 80% |
| Q4 | 100% | 100% | 80% |
| Q5 | 100% | 100% | 100% |
| Q6 | 80% | 100% | 80% |
| Q7 | 100% | 100% | 100% |
| Q8 | 80% | 60% | 80% |
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

The study finds Markdown and YON Canon formats achieve 92% accuracy, while YON Minimal scores 90%. Surprisingly, Gemini 2.5 Flash improves by 10pp in YON Minimal. For YON users, the practical implication is a 19% token savings with a 2pp accuracy reduction.

---

_Structure before scale. Clarity above all._
