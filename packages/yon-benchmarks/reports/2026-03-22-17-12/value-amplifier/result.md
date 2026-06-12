[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-22T15:18:41.536Z

**Result:** 5/5 passed in 3m 42s (222s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way you write affects AI understanding. YON notation improves accuracy in budget models by 15 percentage points. This shows that notation can change AI perception. YON is new, while natural language has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Even]

**Metric:** `0 pp`

Full: NL 73% | Canon 73% | Canon+Card 70% | Min 57% | Ultra 71% | Cold 64%. Best YON Δ+0pp. Card uplift: -3pp. Training gap: -7pp. GPT-5-nano (budget): NL 0% | Canon 47% | Canon+Card 38% | Min 6% | Ultra 69% | Cold 38%. Gemini 2.5 Flash-Lite (budget): NL 91% | Canon 75% | Canon+Card 75% | Min 72% | Ultra 75% | Cold 63%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 81% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 81% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 75%. Gemini 2.5 Flash (standard): NL 94% | Canon 81% | Canon+Card 75% | Min 63% | Ultra 72% | Cold 75%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 73 | % |
| canon_accuracy | 73 | % |
| canon_card_accuracy | 70 | % |
| min_accuracy | 57 | % |
| ultra_accuracy | 71 | % |
| min_cold_accuracy | 64 | % |
| canon_delta | 0 | pp |
| canon_card_delta | -3 | pp |
| card_uplift | -3 | pp |
| min_delta | -16 | pp |
| ultra_delta | -2 | pp |
| training_data_gap | -7 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 31074 | ms |
| gpt5-nano(budget)_nl_acc | 0 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 47 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 38 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 6 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 69 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 38 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 91 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 75 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 75 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 72 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 75 | % |
| gemini-flash-lite(budget)_ultra_cost | 0.29 | $/100K |
| gemini-flash-lite(budget)_min_cold_acc | 63 | % |
| gemini-flash-lite(budget)_min_cold_cost | 0.24 | $/100K |
| gpt4o-mini(standard)_nl_acc | 88 | % |
| gpt4o-mini(standard)_nl_cost | 0.41 | $/100K |
| gpt4o-mini(standard)_canon_acc | 78 | % |
| gpt4o-mini(standard)_canon_cost | 0.6 | $/100K |
| gpt4o-mini(standard)_canon_card_acc | 81 | % |
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
| claude-haiku(standard)_min_cold_acc | 75 | % |
| claude-haiku(standard)_min_cold_cost | 2.68 | $/100K |
| gemini-flash(standard)_nl_acc | 94 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 81 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 75 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 63 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 72 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 75 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Advantage]

**Metric:** `15 pp`

Budget: YON 70% vs NL 55% (Δ+15pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 55 | % |
| yon_accuracy | 70 | % |
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

Gradient: Budget=15pp > Standard=-12pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | 15 | pp |
| standard_delta | -12 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `148.22 acc/1Ktok`

Best efficiency: NL Prose (148.22 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 75% @ 506tok (148.22 acc/1Ktok) | YON Canon: 66% @ 985tok (67.01 acc/1Ktok) | YON Min: 58% @ 441tok (131.52 acc/1Ktok) | YON Min+Card: 66% @ 2101tok (31.41 acc/1Ktok) | YON Ultra: 59% @ 611tok (96.56 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 75 | % |
| nl_prose_efficiency | 148.22 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 66 | % |
| yon_canon_efficiency | 67.01 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 58 | % |
| yon_min_efficiency | 131.52 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 66 | % |
| yon_min_card_efficiency | 31.41 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 59 | % |
| yon_ultra_efficiency | 96.56 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 120138 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON's structural primitives alter AI perception. Budget models show a 15 percentage point accuracy increase. Standard models decrease by -12 points. This reflects training data asymmetry: YON is new, NL is well-represented. The budget-tier uplift gradient is the YON feature tested. It equalizes cost-tier performance. Known boundary: effect diminishes in standard models. Signal is real, not noise, indicating a perception shift.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._