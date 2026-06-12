# Model Scorecards

> **Purpose:** Per-model buying guide — which model to use with YON and why.
> Aggregates comprehension, generation quality, trap resistance, and value amplifier data across all LLM benchmark suites.

> **Run:** 2026-03-21T18:10:48.855Z
> **Duration:** 60.0 min
> **Coverage:** 70 suites, 608 tests, 100% gate pass rate

---

## Executive Summary

Models demonstrate varied strengths in YON format. Claude Haiku 4.5 and Gemini 2.5 Flash show distinct comprehension and accuracy advantages with potential cost implications.

---

## Standard Tier

| Model | Comprehension | Traps | Generation | Structured Delta | Cost (in/1M) |
|-------|:------------:|:-----:|:----------:|:----------------:|:------------:|
| GPT-4o-mini | 90% | 11/12 | — | — | $0.15 |
| Claude Haiku 4.5 | 90% | 12/12 | — | — | $1.00 |
| Gemini 2.5 Flash | 100% | 6/12 | — | — | $0.30 |

## Budget Tier

| Model | Comprehension | Cost (in/1M) |
|-------|:------------:|:------------:|
| GPT-5-nano | — | $0.05 |
| Gemini 2.5 Flash-Lite | — | $0.10 |

---

## GPT-4o-mini

**Provider:** openai
**Model ID:** `gpt-4o-mini`
**Tier:** standard

This model shows strong zero-shot comprehension (90%). Highly resistant to format traps (11/12).

<details>
<summary>LLM Analysis</summary>

> Scores high in comprehension and NL accuracy. Effective for standard-tier applications within budget constraints. Delta shows YON compatibility benefits data processing.

</details>

### Performance

- **YON Comprehension:** 90%
- **JSON Comprehension:** 90%
- **Trap Resistance:** 11/12

### Pricing

- **Input:** $0.1500/1M tokens
- **Output:** $0.6000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| format-traps | gpt4o-mini_score | 11 | /12 |
| pliability | GPT-4o-mini (standard)_score | 90 | % |
| value-amplifier | gpt4o-mini(standard)_nl_acc | 88 | % |
| value-amplifier | gpt4o-mini(standard)_nl_cost | 0.41 | $/100K |
| value-amplifier | gpt4o-mini(standard)_canon_acc | 78 | % |
| value-amplifier | gpt4o-mini(standard)_canon_cost | 0.6 | $/100K |
| value-amplifier | gpt4o-mini(standard)_canon_card_acc | 78 | % |
| value-amplifier | gpt4o-mini(standard)_canon_card_cost | 1.37 | $/100K |
| value-amplifier | gpt4o-mini(standard)_min_acc | 72 | % |
| value-amplifier | gpt4o-mini(standard)_min_cost | 0.36 | $/100K |
| value-amplifier | gpt4o-mini(standard)_ultra_acc | 72 | % |
| value-amplifier | gpt4o-mini(standard)_ultra_cost | 0.43 | $/100K |
| value-amplifier | gpt4o-mini(standard)_min_cold_acc | 69 | % |
| value-amplifier | gpt4o-mini(standard)_min_cold_cost | 0.36 | $/100K |

</details>

---

## GPT-5-nano

**Provider:** openai
**Model ID:** `gpt-5-nano`
**Tier:** budget

<details>
<summary>LLM Analysis</summary>

> Cost-efficient but lacks specific YON data. Serves as zero-shot baseline with no training data. Potential for YON improvements post-integration.

</details>

### Pricing

- **Input:** $0.0500/1M tokens
- **Output:** $0.4000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | GPT-5-nano (budget)_score | 90 | % |
| value-amplifier | gpt5-nano(budget)_nl_acc | 0 | % |
| value-amplifier | gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| value-amplifier | gpt5-nano(budget)_canon_acc | 78 | % |
| value-amplifier | gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| value-amplifier | gpt5-nano(budget)_canon_card_acc | 41 | % |
| value-amplifier | gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| value-amplifier | gpt5-nano(budget)_min_acc | 69 | % |
| value-amplifier | gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| value-amplifier | gpt5-nano(budget)_ultra_acc | 31 | % |
| value-amplifier | gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| value-amplifier | gpt5-nano(budget)_min_cold_acc | 38 | % |
| value-amplifier | gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |

</details>

---

## Claude Haiku 4.5

**Provider:** anthropic
**Model ID:** `claude-haiku-4-5`
**Tier:** standard

This model shows strong zero-shot comprehension (90%). Highly resistant to format traps (12/12).

<details>
<summary>LLM Analysis</summary>

> Excels in JSON comprehension and trap resistance. High NL accuracy benefits precise applications. Cost may be prohibitive for budget-sensitive settings.

</details>

### Performance

- **YON Comprehension:** 90%
- **JSON Comprehension:** 100%
- **Trap Resistance:** 12/12

### Pricing

- **Input:** $1.0000/1M tokens
- **Output:** $5.0000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | Claude Haiku 4.5 (standard)_score | 90 | % |

</details>

---

## Gemini 2.5 Flash

**Provider:** google
**Model ID:** `gemini-2.5-flash`
**Tier:** standard

This model shows strong zero-shot comprehension (100%). Moderately resistant to format traps (6/12).

<details>
<summary>LLM Analysis</summary>

> Perfect YON and JSON comprehension. Performs well at standard-tier with a focus on high accuracy. Cost-efficient for high-demand scenarios.

</details>

### Performance

- **YON Comprehension:** 100%
- **JSON Comprehension:** 100%
- **Trap Resistance:** 6/12

### Pricing

- **Input:** $0.3000/1M tokens
- **Output:** $2.5000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | Gemini 2.5 Flash (standard)_score | 100 | % |

</details>

---

## Gemini 2.5 Flash-Lite

**Provider:** google
**Model ID:** `gemini-2.5-flash-lite`
**Tier:** budget

<details>
<summary>LLM Analysis</summary>

> Budget-friendly, similar cost to GPT-5-nano. Serves as a competitive zero-shot baseline. Anticipates better operational metrics with YON training data.

</details>

### Pricing

- **Input:** $0.1000/1M tokens
- **Output:** $0.4000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | Gemini 2.5 Flash-Lite (budget)_score | 90 | % |

</details>

---

---

_Structure before scale. Clarity above all._
