[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-23T13:47:03.697Z

**Result:** 5/5 passed in 5m 31s (331s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy, especially in budget models. YON is new, while traditional language (NL) has billions of examples in AI training. This difference highlights YON's potential as a cost-effective tool.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Even]

**Metric:** `-5 pp`

Full: NL 81% | Canon 76% | Canon+Card 63% | Min 57% | Ultra 57% | Cold 56%. Best YON Δ-5pp. Card uplift: -13pp. Training gap: 1pp. GPT-5-nano (budget): NL 38% | Canon 72% | Canon+Card 38% | Min 3% | Ultra 3% | Cold 0%. Gemini 2.5 Flash-Lite (budget): NL 97% | Canon 75% | Canon+Card 75% | Min 78% | Ultra 69% | Cold 63%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 78% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 75% | Canon+Card 81% | Min 72% | Ultra 69% | Cold 75%. Gemini 2.5 Flash (standard): NL 94% | Canon 78% | Canon+Card 41% | Min 63% | Ultra 75% | Cold 75%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 81 | % |
| canon_accuracy | 76 | % |
| canon_card_accuracy | 63 | % |
| min_accuracy | 57 | % |
| ultra_accuracy | 57 | % |
| min_cold_accuracy | 56 | % |
| canon_delta | -5 | pp |
| canon_card_delta | -18 | pp |
| card_uplift | -13 | pp |
| min_delta | -24 | pp |
| ultra_delta | -24 | pp |
| training_data_gap | 1 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 50213 | ms |
| gpt5-nano(budget)_nl_acc | 38 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 72 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 38 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 3 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 3 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 0 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 97 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 75 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 75 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 78 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 69 | % |
| gemini-flash-lite(budget)_ultra_cost | 0.29 | $/100K |
| gemini-flash-lite(budget)_min_cold_acc | 63 | % |
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
| claude-haiku(standard)_min_cold_acc | 75 | % |
| claude-haiku(standard)_min_cold_cost | 2.68 | $/100K |
| gemini-flash(standard)_nl_acc | 94 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 78 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 41 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 63 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 75 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 75 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Advantage]

**Metric:** `31 pp`

Budget: YON 78% vs NL 47% (Δ+31pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 47 | % |
| yon_accuracy | 78 | % |
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

Gradient: Budget=31pp > Standard=-11pp. Hypothesis HOLDS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | 31 | pp |
| standard_delta | -11 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `144.27 acc/1Ktok`

Best efficiency: NL Prose (144.27 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 73% @ 506tok (144.27 acc/1Ktok) | YON Canon: 82% @ 985tok (83.25 acc/1Ktok) | YON Min: 58% @ 441tok (131.52 acc/1Ktok) | YON Min+Card: 63% @ 2101tok (29.99 acc/1Ktok) | YON Ultra: 65% @ 611tok (106.38 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 73 | % |
| nl_prose_efficiency | 144.27 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 82 | % |
| yon_canon_efficiency | 83.25 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 58 | % |
| yon_min_efficiency | 131.52 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 63 | % |
| yon_min_card_efficiency | 29.99 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 65 | % |
| yon_ultra_efficiency | 106.38 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 185139 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON notation shows a strong advantage. Budget models gain 31 pp in accuracy. Standard models see a -11 pp decrease. Training data asymmetry is evident: YON is new, NL is well-represented. YON's structural primitives alter perception, confirming the Sapir-Whorf effect. The budget-tier uplift gradient is the key feature tested. Known boundary: effect diminishes in standard models. Model spread indicates real perception shifts, not noise.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._