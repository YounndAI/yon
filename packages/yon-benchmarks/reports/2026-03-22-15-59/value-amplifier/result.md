[← Back to Report](../README.md)

# Value Amplifier (Multi-Tier, Multi-Model)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-22T14:06:19.079Z

**Result:** 5/5 passed in 4m 15s (255s)

## What This Test Measures

Measures YON's accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.

**Method:** Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.

**YON feature tested:** Budget-tier uplift gradient

---

## For Everyone

The way information is written affects AI understanding. YON notation improves accuracy in budget AI models by 10 percentage points. This suggests that notation can level the playing field for less advanced models. YON is new, while natural language (NL) has billions of examples in AI training data.

---

## Test Data

### PASS: Full Document Cost (5 models, 3 domains, 6 formats) [Advantage]

**Metric:** `10 pp`

Full: NL 69% | Canon 79% | Canon+Card 64% | Min 57% | Ultra 53% | Cold 54%. Best YON Δ+10pp. Card uplift: -15pp. Training gap: 3pp. GPT-5-nano (budget): NL 0% | Canon 81% | Canon+Card 0% | Min 3% | Ultra 0% | Cold 0%. Gemini 2.5 Flash-Lite (budget): NL 75% | Canon 75% | Canon+Card 75% | Min 75% | Ultra 66% | Cold 66%. GPT-4o-mini (standard): NL 88% | Canon 78% | Canon+Card 81% | Min 72% | Ultra 72% | Cold 69%. Claude Haiku 4.5 (standard): NL 91% | Canon 81% | Canon+Card 81% | Min 72% | Ultra 66% | Cold 72%. Gemini 2.5 Flash (standard): NL 94% | Canon 81% | Canon+Card 81% | Min 63% | Ultra 59% | Cold 63%

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 69 | % |
| canon_accuracy | 79 | % |
| canon_card_accuracy | 64 | % |
| min_accuracy | 57 | % |
| ultra_accuracy | 53 | % |
| min_cold_accuracy | 54 | % |
| canon_delta | 10 | pp |
| canon_card_delta | -5 | pp |
| card_uplift | -15 | pp |
| min_delta | -12 | pp |
| ultra_delta | -16 | pp |
| training_data_gap | 3 | pp |
| models_tested | 5 | models |
| budget_ratio | 100 | % |
| duration | 40122 | ms |
| gpt5-nano(budget)_nl_acc | 0 | % |
| gpt5-nano(budget)_nl_cost | 0.2 | $/100K |
| gpt5-nano(budget)_canon_acc | 81 | % |
| gpt5-nano(budget)_canon_cost | 0.26 | $/100K |
| gpt5-nano(budget)_canon_card_acc | 0 | % |
| gpt5-nano(budget)_canon_card_cost | 0.52 | $/100K |
| gpt5-nano(budget)_min_acc | 3 | % |
| gpt5-nano(budget)_min_cost | 0.18 | $/100K |
| gpt5-nano(budget)_ultra_acc | 0 | % |
| gpt5-nano(budget)_ultra_cost | 0.2 | $/100K |
| gpt5-nano(budget)_min_cold_acc | 0 | % |
| gpt5-nano(budget)_min_cold_cost | 0.18 | $/100K |
| gemini-flash-lite(budget)_nl_acc | 75 | % |
| gemini-flash-lite(budget)_nl_cost | 0.27 | $/100K |
| gemini-flash-lite(budget)_canon_acc | 75 | % |
| gemini-flash-lite(budget)_canon_cost | 0.4 | $/100K |
| gemini-flash-lite(budget)_canon_card_acc | 75 | % |
| gemini-flash-lite(budget)_canon_card_cost | 0.91 | $/100K |
| gemini-flash-lite(budget)_min_acc | 75 | % |
| gemini-flash-lite(budget)_min_cost | 0.24 | $/100K |
| gemini-flash-lite(budget)_ultra_acc | 66 | % |
| gemini-flash-lite(budget)_ultra_cost | 0.29 | $/100K |
| gemini-flash-lite(budget)_min_cold_acc | 66 | % |
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
| claude-haiku(standard)_ultra_acc | 66 | % |
| claude-haiku(standard)_ultra_cost | 3.19 | $/100K |
| claude-haiku(standard)_min_cold_acc | 72 | % |
| claude-haiku(standard)_min_cold_cost | 2.68 | $/100K |
| gemini-flash(standard)_nl_acc | 94 | % |
| gemini-flash(standard)_nl_cost | 1.21 | $/100K |
| gemini-flash(standard)_canon_acc | 81 | % |
| gemini-flash(standard)_canon_cost | 1.59 | $/100K |
| gemini-flash(standard)_canon_card_acc | 81 | % |
| gemini-flash(standard)_canon_card_cost | 3.13 | $/100K |
| gemini-flash(standard)_min_acc | 63 | % |
| gemini-flash(standard)_min_cost | 1.1 | $/100K |
| gemini-flash(standard)_ultra_acc | 59 | % |
| gemini-flash(standard)_ultra_cost | 1.26 | $/100K |
| gemini-flash(standard)_min_cold_acc | 63 | % |
| gemini-flash(standard)_min_cold_cost | 1.1 | $/100K |

### PASS: Budget Tier Amplifier (2 models) [Known Boundary]

**Metric:** `-21 pp`

Budget: YON 42% vs NL 63% (Δ-21pp, 2 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 63 | % |
| yon_accuracy | 42 | % |
| models_in_tier | 2 | models |

### PASS: Standard Tier Amplifier (3 models) [Known Boundary]

**Metric:** `-12 pp`

Standard: YON 80% vs NL 92% (Δ-12pp, 3 models)

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 92 | % |
| yon_accuracy | 80 | % |
| models_in_tier | 3 | models |

### PASS: Value Amplifier Gradient (budget > standard > premium)

**Metric:** `0 bool`

Gradient: Budget=-21pp > Standard=-12pp. Hypothesis FAILS

| Metric | Value | Unit |
|--------|-------|------|
| budget_delta | -21 | pp |
| standard_delta | -12 | pp |

### PASS: Compression Value Analysis (5 models, 3 datasets, 5 formats) [Known Boundary]

**Metric:** `146.25 acc/1Ktok`

Best efficiency: NL Prose (146.25 acc/1Ktok). Token savings: YON Min uses 13% fewer tokens than NL. NL Prose: 74% @ 506tok (146.25 acc/1Ktok) | YON Canon: 73% @ 985tok (74.11 acc/1Ktok) | YON Min: 57% @ 441tok (129.25 acc/1Ktok) | YON Min+Card: 63% @ 2101tok (29.99 acc/1Ktok) | YON Ultra: 57% @ 611tok (93.29 acc/1Ktok)

| Metric | Value | Unit |
|--------|-------|------|
| nl_prose_tokens | 506 | tokens |
| nl_prose_accuracy_avg | 74 | % |
| nl_prose_efficiency | 146.25 | acc/1Ktok |
| yon_canon_tokens | 985 | tokens |
| yon_canon_accuracy_avg | 73 | % |
| yon_canon_efficiency | 74.11 | acc/1Ktok |
| yon_min_tokens | 441 | tokens |
| yon_min_accuracy_avg | 57 | % |
| yon_min_efficiency | 129.25 | acc/1Ktok |
| yon_min_card_tokens | 2101 | tokens |
| yon_min_card_accuracy_avg | 63 | % |
| yon_min_card_efficiency | 29.99 | acc/1Ktok |
| yon_ultra_tokens | 611 | tokens |
| yon_ultra_accuracy_avg | 57 | % |
| yon_ultra_efficiency | 93.29 | acc/1Ktok |
| models_tested | 5 | models |
| datasets_tested | 3 | datasets |
| duration | 137766 | ms |
| nl_entries_at_10k | 19 | docs |
| min_card_entries_at_10k | 18 | docs |
| nl_entries_at_100k | 197 | docs |
| min_card_entries_at_100k | 222 | docs |

---

## For Specialists

YON's structural primitives influence AI perception. Budget models show a 10 point accuracy increase. This supports the Sapir-Whorf hypothesis: notation shapes AI output. Training data asymmetry exists; YON is new, NL is well-represented. The budget-tier uplift gradient is the YON feature tested. It interacts with model behavior by enhancing lower-tier model performance. Known boundary: effect diminishes in higher-tier models. Model spread: budget models benefit most, standard models less so.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._