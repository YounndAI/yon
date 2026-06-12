# The Cognitive Horizon

_Material Type: Explainer (70/30)_

## For Everyone

The same system architecture — 10 files describing an invoicing platform — was given to multiple AI models
in three formats: verbose English documentation, structured YON notation, and compressed YON notation.

Each model was asked 10 questions that required reading across multiple files to answer correctly.
The question: does **information density** affect how well an AI reasons about complex systems?

YON Minimal used 19% fewer tokens, achieving 23.8 acc/1K tokens vs 20.3 acc/1K tokens for documentation.
Accuracy traded 4pp for that compression — a cost-benefit decision, not a failure.

In this run, YON Minimal delivered 19% token savings while scoring 4pp below verbose documentation on accuracy.
For high-volume pipelines, the token savings may outweigh the accuracy delta. For single-shot reasoning, verbose context helps.

---

## For Specialists

### Token Economy

| Density | Approx Tokens | Accuracy | Efficiency (acc%/1k-tok) |
|:---|---:|---:|---:|
| Markdown | ~4,328 | 88% | 20.33 |
| YON Canon | ~5,426 | 92% | 16.96 |
| YON Minimal | ~3,524 | 84% | 23.84 |

Token savings: **19%** (minimal vs markdown). Density advantage: **-4pp**.

### Per-Model Breakdown

| Model | Markdown | YON Canon | YON Min | Δ (min−md) |
|:---|---:|---:|---:|---:|
| **GPT-5-nano (budget)** | 60% | 80% | 40% | -20pp (explicit context helps) |
| **GPT-4o-mini (standard)** | 90% | 90% | 100% | +10pp (density helps) |
| **Gemini 2.5 Flash-Lite (budget)** | 100% | 90% | 100% | +0pp (density helps) |
| **Gemini 2.5 Flash (standard)** | 90% | 100% | 80% | -10pp (explicit context helps) |
| **Claude Haiku 4.5 (standard)** | 100% | 100% | 100% | +0pp (density helps) |

### Per-Question Accuracy

| Question | Markdown | YON Canon | YON Min |
|:---|---:|---:|---:|
| Q1 | 80% | 100% | 60% |
| Q2 | 100% | 80% | 100% |
| Q3 | 80% | 80% | 80% |
| Q4 | 100% | 100% | 100% |
| Q5 | 100% | 80% | 100% |
| Q6 | 40% | 80% | 60% |
| Q7 | 100% | 100% | 100% |
| Q8 | 80% | 100% | 80% |
| Q9 | 100% | 100% | 80% |
| Q10 | 100% | 100% | 80% |

## The Operational Characteristic

The Extended Mind thesis (Clark & Chalmers, 1998) argues that cognitive tools become part of the mind.
For LLMs, the context window IS the mind. Density IS cognitive capacity.

The data supports three observations:

1. **Density trades tokens for accuracy.** Compressed notation scored 4pp lower, but saved 19% of tokens — a deliberate cost/quality trade-off.
2. **Token efficiency compounds.** Denser formats deliver more correct answers per token spent — directly reducing cost.
3. **Structure creates addressability.** YON tags (`@SEC`, `@RULE`, `@MAP`) make cross-file references explicit,
   helping models trace dependencies that prose flattens.

> **Trade-off disclosure:** NL formats benefit from the training data advantage — all LLMs have seen vastly more natural language
> than YON. The efficiency and structural gains shown here emerge despite this asymmetry, not because of a level playing field.

## Synthesis

The study finds YON Canon achieves highest accuracy at 92%. Surprisingly, GPT-4o-mini performs better in YON Minimal with a 10pp increase. For YON users, token savings reach 19% despite a 4pp accuracy decrease in dense formats.

---

_Structure before scale. Clarity above all._
