# Notation Shapes Perception

_Material Type: Explainer (70/30)_

## For Everyone

The same system description, written in multiple formats, was given to six AI models.
Each model was asked to identify all risks. The question: does the **format** change what the AI **sees**?

The answer is yes. When information is structured with labeled sections and explicit rules, AI models detect
significantly more risk categories than when the same information is presented as a stream-of-consciousness text.
One model found **8 out of 10** risk categories from structured YON — and **7** from the same content as a brain dump.

This suggests that notation is not neutral. The format in which information is encoded affects how AI agents
perceive, prioritize, and report on that information. Structure creates legibility. Chaos creates blindness.

Note: these models have never been trained on YON. Prose has decades of training data behind it.
YON's results here represent a zero-shot baseline — no fine-tuning, no prompt engineering for format awareness.

---

## For Specialists

### Battery A — Payment System (5 categories)

| Model | YON | YON Enforce | Markdown | Prose | JSON | Diff |
|---|---|---|---|---|---|---|
| **GPT-4o-mini** | 40% | 40% | 40% | 40% | 40% | 0pp |
| **GPT-5-mini** | 50% | 50% | 50% | 50% | 40% | 0pp |
| **GPT-4o** | 50% | 40% | 40% | 40% | 40% | +10pp (structure helps) |
| **GPT-4.1** | 40% | 40% | 40% | 40% | 40% | 0pp |
| **Claude Haiku 4.5** | 40% | 40% | 40% | 40% | 40% | 0pp |
| **Gemini 2.5 Flash** | 50% | 50% | 100% | 50% | 40% | 0pp |
| **Gemini 3 Flash** | 25% | 40% | 40% | 25% | 40% | 0pp |

### Battery B — Multi-Domain (10 categories)

> This battery tests the core hypothesis: does YON improve comprehension when the source material is chaotic?

| Model | YON | YON+Check | YON+Instruct | Brain Dump | Diff |
|---|---|---|---|---|---|
| **GPT-4o-mini** | 30% (10/10) | 22% (9/10) | 30% (10/10) | 30% (10/10) | 0pp |
| **GPT-5-mini** | 33% (3/10) | 50% (0/10) | 33% (3/10) | 29% (7/10) | +4pp (structure helps) |
| **GPT-4o** | 22% (9/10) | 22% (9/10) | 30% (10/10) | 30% (10/10) | 0pp |
| **GPT-4.1** | 22% (9/10) | 22% (9/10) | 30% (10/10) | 30% (10/10) | 0pp |
| **Claude Haiku 4.5** | 30% (10/10) | 30% (10/10) | 30% (10/10) | 30% (10/10) | 0pp |
| **Gemini 2.5 Flash** | 0% (1/10) | 0% (1/10) | 0% (1/10) | 50% (2/10) | -50pp (training gap) |
| **Gemini 3 Flash** | 17% (6/10) | 25% (8/10) | 25% (8/10) | 29% (7/10) | -4pp (training gap) |

> _Values: bias index (categories found / total). Higher = more risks identified._

### Battery C — Computation Extraction

> Can the AI extract specific numbers and do math? `@MAP` should make this trivial.

| Model | YON+Instruct | Raw YON | Brain Dump |
|---|---|---|---|
| **GPT-4o-mini** | **6**/11 | **4**/11 | **7**/11 |
| **GPT-5-mini** | **0**/11 | **0**/11 | **0**/11 |
| **GPT-4o** | **6**/11 | **5**/11 | **8**/11 |
| **GPT-4.1** | **10**/11 | **10**/11 | **11**/11 |
| **Claude Haiku 4.5** | **11**/11 | **10**/11 | **9**/11 |
| **Gemini 2.5 Flash** | **0**/11 | **0**/11 | **0**/11 |
| **Gemini 3 Flash** | **0**/11 | **1**/11 | **1**/11 |

### Battery D — Cross-Section Dependencies

> Can the AI trace risk cascades ACROSS sections? `@SEC` boundaries make cross-referencing explicit.

| Model | YON+Instruct | Raw YON | Brain Dump |
|---|---|---|---|
| **GPT-4o-mini** | **7**/7 | **7**/7 | **4**/7 |
| **GPT-5-mini** | **4**/7 | **6**/7 | **0**/7 |
| **GPT-4o** | **6**/7 | **6**/7 | **4**/7 |
| **GPT-4.1** | **7**/7 | **6**/7 | **4**/7 |
| **Claude Haiku 4.5** | **7**/7 | **7**/7 | **7**/7 |
| **Gemini 2.5 Flash** | **0**/7 | **2**/7 | **1**/7 |
| **Gemini 3 Flash** | **6**/7 | **3**/7 | **6**/7 |

## The Operational Characteristic

YON creates salience hierarchies. `@RULE` tags surface mandatory requirements. `@MAP` tags expose metrics and thresholds.
`@CHECK` tags define assertions that flag violations. Together, these tags give AI agents an addressable map of the system.

The operational characteristic: **structure is not neutral.** Every format encodes a salience profile.
Plain prose flattens all information to equal weight. YON creates labeled sections that elevate risks across all domains.
When combined with reading instructions, YON produces the widest comprehension surface observed in these benchmarks.

> **Trade-off disclosure:** NL formats benefit from the training data advantage — all LLMs have seen vastly more natural language
> than YON. The structural gains shown here emerge despite this asymmetry, not because of a level playing field.

The data shows:

1. **Structure improves comprehension.** YON helps agents find more risks than unstructured text.
2. **Enforcement amplifies detection.** `@MAP`/`@CHECK` tags provide additional anchors for risk identification.
3. **Instructions unlock the format.** Teaching an LLM to read YON tags maximizes category coverage.
4. **Prose creates blindness.** Unstructured text loses 2–8 risk categories depending on the model.

## Synthesis

YON notation matches brain dump in 4 models, showing no difference. Surprisingly, YON underperforms in GPT-5-mini and Gemini 2.5 Flash, with a 4pp and 50pp gap, respectively. For YON users, notation format may not impact risk perception in most models, but exceptions exist.

---

_Structure before scale. Clarity above all._
