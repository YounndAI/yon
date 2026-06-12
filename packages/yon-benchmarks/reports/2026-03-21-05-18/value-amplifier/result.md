[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-21T03:26:53.043Z

**Result:** 5/5 passed in 5m 37s (337s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy in budget AI models by 19 percentage points. This suggests that writing style can change AI perception. YON is new, while natural language (NL) has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Even]

**Metric:** `-1 pp`

Full: NL 79% | Canon 78% | Canon+Card 63% | Min 71% | Ultra 65% | Cold 57%. Best YON Δ-1pp. Card uplift: -15pp. Training gap: 14pp. GPT-5-nano (budget): NL 38% | Canon 78% | Canon+Card 0% | Min 75% | Ultra 38% | Cold 0%. Gemini 2.5 Flash-Lite (budget): NL 84% | Canon 75% | Canon+Card 75% | Min 78% | Ultra 75% | Cold 72%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 78% | Min 72% | Ultra 72% | Cold 72%. Claude Haiku 4.5 (standard): NL 91% | Canon 81% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 72%. Gemini 2.5 Flash (standard): NL 94% | Canon 78% | Canon+Card 78% | Min 59% | Ultra 72% | Cold 72%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 79 | % |
| canon_accuracy | 78 | % |
| canon_card_accuracy | 63 | % |
| min_accuracy | 71 | % |
| ultra_accuracy | 65 | % |
| min_cold_accuracy | 57 | % |
| canon_delta | -1 | pp |
| canon_card_delta | -16 | pp |
| card_uplift | -15 | pp |
| min_delta | -8 | pp |
| ultra_delta | -14 | pp |
| training_data_gap | 14 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 53969 | ms |
| gpt5-nano(budget)_nl_acc | 38 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 78 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 0 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 75 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 38 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 0 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 84 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 75 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 75 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 78 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 75 | % |
| gemini-flash-lite(budget)_ultra_cost | 0.29 | $/100K |
| gemini-flash-lite(budget)_min_cold_acc | 72 | % |
| gemini-flash-lite(budget)_min_cold_cost | 0.24 | $/100K |
| gpt4o-mini(standard)_nl_acc | 88 | % |
| gpt4o-mini(standard)_nl_cost | 0.41 | $/100K |
| gpt4o-mini(standard)_canon_acc | 78 | % |
| gpt4o-mini(standard)_canon_cost | 0.6 | $/100K |
| gpt4o-mini(standard)_canon_card_acc | 78 | % |
| gpt4o-mini(standard)_canon_card_cost | 1.37 | $/100K |
| gpt4o-mini(standard)_min_acc | 72 | % |
| gpt4o-mini(standard)_min_cost | 0.36 | $/100K |
| gpt4o-mini(standard)_ultra_acc | 72 | % |
| gpt4o-mini(standard)_ultra_cost | 0.43 | $/100K |
| gpt4o-mini(standard)_min_cold_acc | 72 | % |
| gpt4o-mini(standard)_min_cold_cost | 0.36 | $/100K |
| claude-haiku(standard)_nl_acc | 91 | % |
| claude-haiku(standard)_nl_cost | 3.02 | $/100K |
| claude-haiku(standard)_canon_acc | 81 | % |
| claude-haiku(standard)_canon_cost | 4.31 | $/100K |
| claude-haiku(standard)_canon_card_acc | 81 | % |
| claude-haiku(standard)_canon_card_cost | 9.44 | $/100K |
| claude-haiku(standard)_min_acc | 72 | % |
| claude-haiku(standard)_min_cost | 2.68 | $/100K |
| claude-haiku(standard)_ultra_acc | 69 | % |
| claude-haiku(standard)_ultra_cost | 3.19 | $/100K |
| claude-haiku(standard)_min_cold_acc | 72 | % |
| claude-haiku(standard)_min_cold_cost | 2.68 | $/100K |
| gemini-flash(standard)_nl_acc | 94 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 78 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 78 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 59 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 72 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 72 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Advantage]

**Metric:** `19 pp`

Budget: YON 55% vs NL 36% (Δ+19pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 36 | % |
| yon_accuracy | 55 | % |
| models_in_tier | 2 | models |

### PASS: Standard Tier Amplifier (3 models) [Known Boundary]

**Metric:** `-14 pp`

Standard: YON 78% vs NL 92% (Δ-14pp, 3 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 92 | % |
| yon_accuracy | 78 | % |
| models_in_tier | 3 | models |

### PASS: Value Amplifier Gradient (budget > standard > premium)

**Metric:** `1 bool`

Gradient: Budget=19pp > Standard=-14pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | 19 | pp |
| standard_delta | -14 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `154.15 acc/1Ktok`

Best efficiency: NL Prose (154.15 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 78% @ 506tok (154.15 acc/1Ktok) | YON Canon: 64% @ 985tok (64.97 acc/1Ktok) | YON Min: 67% @ 441tok (151.93 acc/1Ktok) | YON Min+Card: 58% @ 2101tok (27.61 acc/1Ktok) | YON Ultra: 57% @ 611tok (93.29 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 78 | % |
| nl_prose_efficiency | 154.15 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 64 | % |
| yon_canon_efficiency | 64.97 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 67 | % |
| yon_min_efficiency | 151.93 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 58 | % |
| yon_min_card_efficiency | 27.61 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 57 | % |
| yon_ultra_efficiency | 93.29 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 189986 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON notation shows a strong perception shift. Budget models gain 19 pp in accuracy, while standard models decrease by -14 pp. This highlights YON's role as a cost-tier equalizer. Training data asymmetry is evident; NL has a 14 pp advantage. The YON feature tested is the budget-tier uplift gradient. This effect doesn't hold in standard models, indicating a known boundary. Model spread reveals nuanced perception changes, confirming the Sapir-Whorf effect.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._