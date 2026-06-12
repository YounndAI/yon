# Model Scorecards

> **Purpose:** Per-model buying guide — which model to use with YON and why.
> Aggregates comprehension, generation quality, trap resistance, and value amplifier data across all LLM benchmark suites.

> **Run:** 2026-03-22T15:12:14.716Z
> **Duration:** 46.2 min
> **Coverage:** 70 suites, 608 tests, 100% gate pass rate

---

## Executive Summary

Gemini 2.5 Flash excels in NL accuracy and JSON comprehension, offering benefits for structured data tasks. GPT-5-nano and Gemini 2.5 Flash-Lite provide cost-effective baseline benchmarks, poised to improve with YON adaptation.

---

## Standard Tier

| Model | Comprehension | Traps | Generation | Structured Delta | Cost (in/1M) |
|-------|:------------:|:-----:|:----------:|:----------------:|:------------:|
| GPT-4o-mini | 90% | 11/12 | — | — | $0.15 |
| Claude Haiku 4.5 | 90% | 12/12 | — | — | $1.00 |
| Gemini 2.5 Flash | 90% | 4/12 | — | — | $0.30 |

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

> Matches JSON comprehension with YON, ensuring cost-effective versatility. Slight trap resistance requires context checks. Use for balanced cost and performance.

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
| value-amplifier | gpt4o-mini(standard)_canon_card_acc | 81 | % |
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

> Lacks comparable YON data, offering zero-shot baseline. Budget-friendly, expected improvement with YON adaptation. Suitable for low-cost initial testing.

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
| value-amplifier | gpt5-nano(budget)_canon_acc | 47 | % |
| value-amplifier | gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| value-amplifier | gpt5-nano(budget)_canon_card_acc | 38 | % |
| value-amplifier | gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| value-amplifier | gpt5-nano(budget)_min_acc | 6 | % |
| value-amplifier | gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| value-amplifier | gpt5-nano(budget)_ultra_acc | 69 | % |
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

> Excels in trap resistance, boosting reliability with YON. High NL accuracy complements structured tasks. Recommended for precision-driven applications despite higher cost.

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

This model shows strong zero-shot comprehension (90%). Vulnerable to format traps (4/12).

<details>
<summary>LLM Analysis</summary>

> Achieves high NL accuracy and JSON comprehension. Limited trap resistance is a known boundary. Effective in structured data environments with cost advantage.

</details>

### Performance

- **YON Comprehension:** 90%
- **JSON Comprehension:** 100%
- **Trap Resistance:** 4/12

### Pricing

- **Input:** $0.3000/1M tokens
- **Output:** $2.5000/1M tokens

<details>
<summary>Raw Metrics</summary>

| Suite | Metric | Value | Unit |
|-------|--------|------:|------|
| pliability | Gemini 2.5 Flash (standard)_score | 90 | % |

</details>

---

## Gemini 2.5 Flash-Lite

**Provider:** google
**Model ID:** `gemini-2.5-flash-lite`
**Tier:** budget

<details>
<summary>LLM Analysis</summary>

> Provides baseline with budget-friendly pricing, yet lacks YON comprehension data. Potential for growth with adaptation. Use as cost-efficient testing option.

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
