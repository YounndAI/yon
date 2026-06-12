# Model Scorecards

> **Purpose:** Per-model buying guide — which model to use with YON and why.
> Aggregates comprehension, generation quality, trap resistance, and value amplifier data across all LLM benchmark suites.

> **Run:** 2026-03-23T01:27:25.744Z
> **Duration:** 56.1 min
> **Coverage:** 70 suites, 608 tests, 100% gate pass rate

---

## Executive Summary

GPT-4o-mini and Claude Haiku 4.5 maintain similar YON comprehension, each with strengths in other areas. Gemini 2.5 Flash excels in YON comprehension but faces trap resistance challenges.

---

## Standard Tier

| Model | Comprehension | Traps | Generation | Structured Delta | Cost (in/1M) |
|-------|:------------:|:-----:|:----------:|:----------------:|:------------:|
| GPT-4o-mini | 90% | 11/12 | — | — | $0.15 |
| Claude Haiku 4.5 | 90% | 12/12 | — | — | $1.00 |
| Gemini 2.5 Flash | 100% | 5/12 | — | — | $0.30 |

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

> YON comprehension aligns with JSON at 90/10. Maintains NL accuracy at 88% with trap resistance of 11/12. Costs low at $0.15/1M in, making it efficient for mixed format tasks.

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

> YON not fully tested, serving as a zero-shot baseline. Budget cost at $0.05/1M in offers value for early-stage experiments. Expected improvements with more YON data could enhance practical use.

</details>

### Pricing

- **Input:** $0.0500/1M tokens
- **Output:** $0.4000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | GPT-5-nano (budget)_score | 90 | % |
| value-amplifier | gpt5-nano(budget)_nl_acc | 38 | % |
| value-amplifier | gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| value-amplifier | gpt5-nano(budget)_canon_acc | 72 | % |
| value-amplifier | gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| value-amplifier | gpt5-nano(budget)_canon_card_acc | 47 | % |
| value-amplifier | gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| value-amplifier | gpt5-nano(budget)_min_acc | 38 | % |
| value-amplifier | gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| value-amplifier | gpt5-nano(budget)_ultra_acc | 69 | % |
| value-amplifier | gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| value-amplifier | gpt5-nano(budget)_min_cold_acc | 0 | % |
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

> YON comprehension strong at 90/10, with unmatched JSON at 100/10. Perfect trap resistance and 91% NL accuracy justify higher cost at $1/1M in. Use for mission-critical tasks requiring precision.

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

This model shows strong zero-shot comprehension (100%). Vulnerable to format traps (5/12).

<details>
<summary>LLM Analysis</summary>

> YON at 100/10, superior comprehension available. Trap resistance at 5/12 is a known boundary. NL accuracy at 97%, with $0.3/1M in cost, suits specific high-accuracy, YON-centric tasks.

</details>

### Performance

- **YON Comprehension:** 100%
- **JSON Comprehension:** 90%
- **Trap Resistance:** 5/12

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

> Not fully tested on YON, offering a zero-shot baseline. Costs at $0.1/1M in suggest feasible scaling. Additional data could improve tailored outcomes for budget-conscious projects.

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
