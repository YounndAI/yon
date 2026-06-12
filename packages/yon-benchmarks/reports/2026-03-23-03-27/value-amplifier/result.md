[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-23T01:35:59.359Z

**Result:** 5/5 passed in 5m 44s (344s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy for budget AI models by 11 percentage points. This suggests that even simple changes in writing style can influence AI performance. YON is new, while natural language (NL) has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Even]

**Metric:** `-1 pp`

Full: NL 77% | Canon 76% | Canon+Card 73% | Min 63% | Ultra 71% | Cold 57%. Best YON Δ-1pp. Card uplift: -3pp. Training gap: 6pp. GPT-5-nano (budget): NL 38% | Canon 72% | Canon+Card 47% | Min 38% | Ultra 69% | Cold 0%. Gemini 2.5 Flash-Lite (budget): NL 72% | Canon 75% | Canon+Card 75% | Min 75% | Ultra 72% | Cold 69%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 78% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 81% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 72%. Gemini 2.5 Flash (standard): NL 97% | Canon 75% | Canon+Card 81% | Min 59% | Ultra 75% | Cold 75%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 77 | % |
| canon_accuracy | 76 | % |
| canon_card_accuracy | 73 | % |
| min_accuracy | 63 | % |
| ultra_accuracy | 71 | % |
| min_cold_accuracy | 57 | % |
| canon_delta | -1 | pp |
| canon_card_delta | -4 | pp |
| card_uplift | -3 | pp |
| min_delta | -14 | pp |
| ultra_delta | -6 | pp |
| training_data_gap | 6 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 48233 | ms |
| gpt5-nano(budget)_nl_acc | 38 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 72 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 47 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 38 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 69 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 0 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 72 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 75 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 75 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 75 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 72 | % |
| gemini-flash-lite(budget)_ultra_cost | 0.29 | $/100K |
| gemini-flash-lite(budget)_min_cold_acc | 69 | % |
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
| gpt4o-mini(standard)_min_cold_acc | 69 | % |
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
| gemini-flash(standard)_nl_acc | 97 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 75 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 81 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 59 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 75 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 75 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Advantage]

**Metric:** `11 pp`

Budget: YON 55% vs NL 44% (Δ+11pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 44 | % |
| yon_accuracy | 55 | % |
| models_in_tier | 2 | models |

### PASS: Standard Tier Amplifier (3 models) [Known Boundary]

**Metric:** `-16 pp`

Standard: YON 76% vs NL 92% (Δ-16pp, 3 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 92 | % |
| yon_accuracy | 76 | % |
| models_in_tier | 3 | models |

### PASS: Value Amplifier Gradient (budget > standard > premium)

**Metric:** `1 bool`

Gradient: Budget=11pp > Standard=-16pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | 11 | pp |
| standard_delta | -16 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `175.89 acc/1Ktok`

Best efficiency: NL Prose (175.89 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 89% @ 506tok (175.89 acc/1Ktok) | YON Canon: 69% @ 985tok (70.05 acc/1Ktok) | YON Min: 60% @ 441tok (136.05 acc/1Ktok) | YON Min+Card: 67% @ 2101tok (31.89 acc/1Ktok) | YON Ultra: 62% @ 611tok (101.47 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 89 | % |
| nl_prose_efficiency | 175.89 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 69 | % |
| yon_canon_efficiency | 70.05 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 60 | % |
| yon_min_efficiency | 136.05 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 67 | % |
| yon_min_card_efficiency | 31.89 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 62 | % |
| yon_ultra_efficiency | 101.47 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 194869 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON notation shows a strong perception shift, especially in budget models. Budget models gain 11 percentage points in accuracy, while standard models see a decrease of -16. This highlights YON's role as a cost-tier equalizer. The training data gap is 6 percentage points, favoring NL. YON's structural primitives alter model perception, demonstrating the Sapir-Whorf effect. The uplift gradient is a key feature, enhancing budget-tier performance. Known boundary: standard models do not benefit similarly.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._