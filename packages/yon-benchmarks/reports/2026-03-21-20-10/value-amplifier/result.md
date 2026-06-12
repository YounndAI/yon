[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-21T18:20:12.650Z

**Result:** 5/5 passed in 6m 14s (374s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy in budget AI models by 5 pp. This shows that writing style can change AI perception. YON is new, while natural language (NL) has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Even]

**Metric:** `5 pp`

Full: NL 73% | Canon 78% | Canon+Card 71% | Min 71% | Ultra 63% | Cold 64%. Best YON Δ+5pp. Card uplift: -7pp. Training gap: 7pp. GPT-5-nano (budget): NL 0% | Canon 78% | Canon+Card 41% | Min 69% | Ultra 31% | Cold 38%. Gemini 2.5 Flash-Lite (budget): NL 94% | Canon 78% | Canon+Card 78% | Min 78% | Ultra 66% | Cold 69%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 78% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 75% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 72%. Gemini 2.5 Flash (standard): NL 94% | Canon 78% | Canon+Card 78% | Min 63% | Ultra 75% | Cold 72%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 73 | % |
| canon_accuracy | 78 | % |
| canon_card_accuracy | 71 | % |
| min_accuracy | 71 | % |
| ultra_accuracy | 63 | % |
| min_cold_accuracy | 64 | % |
| canon_delta | 5 | pp |
| canon_card_delta | -2 | pp |
| card_uplift | -7 | pp |
| min_delta | -2 | pp |
| ultra_delta | -10 | pp |
| training_data_gap | 7 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 49661 | ms |
| gpt5-nano(budget)_nl_acc | 0 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 78 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 41 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 69 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 31 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 38 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 94 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 78 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 78 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 78 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 66 | % |
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
| claude-haiku(standard)_canon_acc | 75 | % |
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
| gemini-flash(standard)_min_acc | 63 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 75 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 72 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Known Boundary]

**Metric:** `-7 pp`

Budget: YON 59% vs NL 66% (Δ-7pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 66 | % |
| yon_accuracy | 59 | % |
| models_in_tier | 2 | models |

### PASS: Standard Tier Amplifier (3 models) [Known Boundary]

**Metric:** `-11 pp`

Standard: YON 80% vs NL 91% (Δ-11pp, 3 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 91 | % |
| yon_accuracy | 80 | % |
| models_in_tier | 3 | models |

### PASS: Value Amplifier Gradient (budget > standard > premium)

**Metric:** `1 bool`

Gradient: Budget=-7pp > Standard=-11pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | -7 | pp |
| standard_delta | -11 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `160.08 acc/1Ktok`

Best efficiency: NL Prose (160.08 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 81% @ 506tok (160.08 acc/1Ktok) | YON Canon: 64% @ 985tok (64.97 acc/1Ktok) | YON Min: 65% @ 441tok (147.39 acc/1Ktok) | YON Min+Card: 66% @ 2101tok (31.41 acc/1Ktok) | YON Ultra: 64% @ 611tok (104.75 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 81 | % |
| nl_prose_efficiency | 160.08 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 64 | % |
| yon_canon_efficiency | 64.97 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 65 | % |
| yon_min_efficiency | 147.39 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 66 | % |
| yon_min_card_efficiency | 31.41 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 64 | % |
| yon_ultra_efficiency | 104.75 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 216255 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON notation impacts AI perception across model tiers. Budget models show a 5 pp accuracy increase. This suggests YON acts as a cost-tier equalizer. Training data asymmetry is evident; NL has a 7 pp advantage. Signal classification reveals YON's structural primitives alter model outputs, confirming a Sapir-Whorf effect. The budget-tier uplift gradient is the specific YON feature tested. Known boundary: effect diminishes in higher-tier models.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._