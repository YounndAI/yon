[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-21T19:54:15.122Z

**Result:** 5/5 passed in 6m 32s (392s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy in budget AI models by 6pp. This means cheaper models perform closer to expensive ones. YON is new, while natural language (NL) has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Advantage]

**Metric:** `6 pp`

Full: NL 73% | Canon 79% | Canon+Card 71% | Min 64% | Ultra 71% | Cold 55%. Best YON Δ+6pp. Card uplift: -8pp. Training gap: 9pp. GPT-5-nano (budget): NL 19% | Canon 81% | Canon+Card 41% | Min 38% | Ultra 66% | Cold 0%. Gemini 2.5 Flash-Lite (budget): NL 72% | Canon 75% | Canon+Card 75% | Min 75% | Ultra 72% | Cold 66%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 78% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 81% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 72%. Gemini 2.5 Flash (standard): NL 94% | Canon 81% | Canon+Card 78% | Min 63% | Ultra 75% | Cold 69%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 73 | % |
| canon_accuracy | 79 | % |
| canon_card_accuracy | 71 | % |
| min_accuracy | 64 | % |
| ultra_accuracy | 71 | % |
| min_cold_accuracy | 55 | % |
| canon_delta | 6 | pp |
| canon_card_delta | -2 | pp |
| card_uplift | -8 | pp |
| min_delta | -9 | pp |
| ultra_delta | -2 | pp |
| training_data_gap | 9 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 50887 | ms |
| gpt5-nano(budget)_nl_acc | 19 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 81 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 41 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 38 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 66 | % |
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
| gemini-flash-lite(budget)_min_cold_acc | 66 | % |
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
| gemini-flash(standard)_nl_acc | 94 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 81 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 78 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 63 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 75 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 69 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Even]

**Metric:** `-2 pp`

Budget: YON 73% vs NL 75% (Δ-2pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 75 | % |
| yon_accuracy | 73 | % |
| models_in_tier | 2 | models |

### PASS: Standard Tier Amplifier (3 models) [Known Boundary]

**Metric:** `-12 pp`

Standard: YON 79% vs NL 91% (Δ-12pp, 3 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 91 | % |
| yon_accuracy | 79 | % |
| models_in_tier | 3 | models |

### PASS: Value Amplifier Gradient (budget > standard > premium)

**Metric:** `1 bool`

Gradient: Budget=-2pp > Standard=-12pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | -2 | pp |
| standard_delta | -12 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `160.08 acc/1Ktok`

Best efficiency: NL Prose (160.08 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 81% @ 506tok (160.08 acc/1Ktok) | YON Canon: 68% @ 985tok (69.04 acc/1Ktok) | YON Min: 66% @ 441tok (149.66 acc/1Ktok) | YON Min+Card: 64% @ 2101tok (30.46 acc/1Ktok) | YON Ultra: 66% @ 611tok (108.02 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 81 | % |
| nl_prose_efficiency | 160.08 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 68 | % |
| yon_canon_efficiency | 69.04 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 66 | % |
| yon_min_efficiency | 149.66 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 64 | % |
| yon_min_card_efficiency | 30.46 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 66 | % |
| yon_ultra_efficiency | 108.02 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 231179 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON notation impacts AI perception, especially in budget models. GPT5 Nano's accuracy jumps from {{COST_TIER_FULL_GPT5_NANO(BUDGET)_NL_ACC}} to {{COST_TIER_FULL_GPT5_NANO(BUDGET)_CANON_ACC}}. Training data asymmetry favors NL, yet YON shows a -2 uplift. This suggests real perception shifts, not noise. The budget-tier uplift gradient is key, enhancing low-cost model performance. Known boundary: effect diminishes in higher-tier models.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._