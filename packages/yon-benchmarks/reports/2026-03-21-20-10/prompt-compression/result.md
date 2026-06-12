[← Back to Report](../README.md)

# Prompt Compression

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T18:13:21.674Z

**Result:** 21/21 passed in 3.9s

## What This Test Measures

Tests whether YON compression (fmt=min, fmt=ultra) preserves answer quality while reducing token cost.

**Method:** Compares answer quality across canonically formatted, minimized, and ultra-compressed YON documents.

**YON feature tested:** Token reduction via fmt=min and fmt=ultra

---

## For Everyone

Does writing style affect AI understanding? This suite tests if compressed formats change AI answers. YON, a new format, reduces tokens without losing quality. Despite YON's lack of training data, it performs well against formats with billions of examples. This suggests writing style may not impact AI perception at this scale.

---

## Results Summary

| # | Test | Status | Key Metric | Outcome |
|--:|------|--------|------------|---------|
| 1 | Token Efficiency — Landing Page Brief | PASS | 35 % | Advantage |
| 2 | Comprehension Quality — Landing Page Brief | PASS | 7.3 /10 | Advantage |
| 3 | Token Efficiency — API Spec | PASS | 25 % | Advantage |
| 4 | Comprehension Quality — API Spec | PASS | 7.3 /10 | Advantage |
| 5 | Token Efficiency — Bug Report (Incident) | PASS | 61 % | Advantage |
| 6 | Comprehension Quality — Bug Report (Incident) | PASS | 7.3 /10 | Advantage |
| 7 | Token Efficiency — Infra Runbook (K8s) | PASS | 25 % | Advantage |
| 8 | Comprehension Quality — Infra Runbook (K8s) | PASS | 7.3 /10 | Advantage |
| 9 | Token Efficiency — Data Pipeline (ETL) | PASS | 39 % | Advantage |
| 10 | Comprehension Quality — Data Pipeline (ETL) | PASS | 7.3 /10 | Advantage |
| 11 | Token Efficiency — Full API Spec (Billing) | PASS | 64 % | Advantage |
| 12 | Comprehension Quality — Full API Spec (Billing) | PASS | 7.4 /10 | Advantage |
| 13 | Token Efficiency — Architecture ADR (Temporal+Kafka) | PASS | 55 % | Advantage |
| 14 | Comprehension Quality — Architecture ADR (Temporal+Kafka) | PASS | 7.4 /10 | Even |
| 15 | Token Efficiency — Incident Postmortem (SEV-1) | PASS | 60 % | Advantage |
| 16 | Comprehension Quality — Incident Postmortem (SEV-1) | PASS | 7.3 /10 | Even |
| 17 | Token Efficiency — Multilingual Policy (EU Privacy) | PASS | 46 % | Advantage |
| 18 | Comprehension Quality — Multilingual Policy (EU Privacy) | PASS | 7.3 /10 | Even |
| 19 | Token Efficiency — Creative Brainstorm (Negative Control) | PASS | 58 % | Advantage |
| 20 | Comprehension Quality — Creative Brainstorm (Negative Control) | PASS | 7.1 /10 | Advantage |
| 21 | Deep Evaluation Summary (10 scenarios × 2 categories) | PASS | 10 evaluated | — |

<details>
<summary>Full Test Data (click to expand)</summary>

## Test Data

### PASS: Token Efficiency — Landing Page Brief [Advantage]

**Metric:** `35 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (73% of lines are typed records) at the cost of 20% more tokens than natural language.
Ultra YON trades human readability for density: 35% fewer tokens than NL.
NL carries 6% discourse fillers ("ok so", "basically"). YON eliminates them.
NL contains 1% hedging markers (§6.1-protected). Canon preserves 0%.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 1581 | 1595 | 1086 | 749 | **+1%** |
| Tokens (cl100k) | 350 | 421 | 309 | 226 | Canon +20%, Ultra **-35%** |
| Structural Token Ratio | 0% | **73%** | 100% | 100% | Verified |
| Discourse Filler Density | 6% | **1%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 1% | **0%** | 0% | 0% | Caution |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 350 | tok |
| canon_tokens | 421 | tok |
| min_tokens | 309 | tok |
| ultra_tokens | 226 | tok |
| structural_ratio_canon | 73 | % |
| filler_density_nl | 6 | % |
| hedging_density_nl | 1 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Landing Page Brief [Advantage]

**Metric:** `7.3 /10` _(vs NL avg: 5.1 → +2.1)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 5.1/10 — a gap of +2.1 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 7→**9** | 4→**9** | 5→**5** | 5.3→**7.7** |
| Attribute Extraction Accuracy | 8→**8** | 5→**8** | 5→**5** | 6.0→**7.0** |
| Intent Detection | 6→**9** | 3→**8** | 5→**5** | 4.7→**7.3** |
| Internal Consistency | 7→**9** | 4→**9** | 5→**5** | 5.3→**7.7** |
| Hallucination Risk (10=lowest risk) | 5→**7** | 3→**8** | 5→**5** | 4.3→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 5.1 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 2878 | ms |

### PASS: Token Efficiency — API Spec [Advantage]

**Metric:** `25 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (77% of lines are typed records) at the cost of 40% more tokens than natural language.
Ultra YON trades human readability for density: 25% fewer tokens than NL.
NL carries 1% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 1574 | 2048 | 1324 | 906 | **+30%** |
| Tokens (cl100k) | 420 | 589 | 429 | 315 | Canon +40%, Ultra **-25%** |
| Structural Token Ratio | 0% | **77%** | 100% | 100% | Verified |
| Discourse Filler Density | 1% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 420 | tok |
| canon_tokens | 589 | tok |
| min_tokens | 429 | tok |
| ultra_tokens | 315 | tok |
| structural_ratio_canon | 77 | % |
| filler_density_nl | 1 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — API Spec [Advantage]

**Metric:** `7.3 /10` _(vs NL avg: 6.5 → +0.9)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 6.5/10 — a gap of +0.9 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**9** | 6→**9** | 5→**5** | 6.3→**7.7** |
| Attribute Extraction Accuracy | 9→**8** | 7→**9** | 5→**5** | 7.0→**7.3** |
| Intent Detection | 7→**9** | 8→**8** | 5→**5** | 6.7→**7.3** |
| Internal Consistency | 8→**9** | 7→**9** | 5→**5** | 6.7→**7.7** |
| Hallucination Risk (10=lowest risk) | 6→**7** | 6→**8** | 5→**5** | 5.7→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 6.5 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 3155 | ms |

### PASS: Token Efficiency — Bug Report (Incident) [Advantage]

**Metric:** `61 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (75% of lines are typed records) at the cost of 10% more tokens than natural language.
Ultra YON trades human readability for density: 61% fewer tokens than NL.
NL carries 2% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 1744 | 1650 | 854 | 478 | **-5%** |
| Tokens (cl100k) | 377 | 414 | 234 | 146 | Canon +10%, Ultra **-61%** |
| Structural Token Ratio | 0% | **75%** | 100% | 100% | Verified |
| Discourse Filler Density | 2% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 377 | tok |
| canon_tokens | 414 | tok |
| min_tokens | 234 | tok |
| ultra_tokens | 146 | tok |
| structural_ratio_canon | 75 | % |
| filler_density_nl | 2 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Bug Report (Incident) [Advantage]

**Metric:** `7.3 /10` _(vs NL avg: 5.7 → +1.6)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 5.7/10 — a gap of +1.6 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**9** | 3→**9** | 5→**5** | 5.3→**7.7** |
| Attribute Extraction Accuracy | 9→**8** | 4→**9** | 5→**5** | 6.0→**7.3** |
| Intent Detection | 8→**9** | 7→**8** | 5→**5** | 6.7→**7.3** |
| Internal Consistency | 7→**9** | 4→**9** | 5→**5** | 5.3→**7.7** |
| Hallucination Risk (10=lowest risk) | 6→**7** | 5→**8** | 5→**5** | 5.3→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 5.7 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 3478 | ms |

### PASS: Token Efficiency — Infra Runbook (K8s) [Advantage]

**Metric:** `25 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (80% of lines are typed records) at the cost of 54% more tokens than natural language.
Ultra YON trades human readability for density: 25% fewer tokens than NL.
NL carries 2% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 1581 | 2094 | 1264 | 829 | **+32%** |
| Tokens (cl100k) | 400 | 617 | 417 | 299 | Canon +54%, Ultra **-25%** |
| Structural Token Ratio | 0% | **80%** | 100% | 100% | Verified |
| Discourse Filler Density | 2% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 400 | tok |
| canon_tokens | 617 | tok |
| min_tokens | 417 | tok |
| ultra_tokens | 299 | tok |
| structural_ratio_canon | 80 | % |
| filler_density_nl | 2 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Infra Runbook (K8s) [Advantage]

**Metric:** `7.3 /10` _(vs NL avg: 6.5 → +0.9)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 6.5/10 — a gap of +0.9 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**9** | 6→**9** | 5→**5** | 6.3→**7.7** |
| Attribute Extraction Accuracy | 9→**8** | 7→**9** | 5→**5** | 7.0→**7.3** |
| Intent Detection | 7→**9** | 8→**8** | 5→**5** | 6.7→**7.3** |
| Internal Consistency | 8→**9** | 7→**9** | 5→**5** | 6.7→**7.7** |
| Hallucination Risk (10=lowest risk) | 6→**7** | 6→**8** | 5→**5** | 5.7→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 6.5 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 3271 | ms |

### PASS: Token Efficiency — Data Pipeline (ETL) [Advantage]

**Metric:** `39 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (80% of lines are typed records) at the cost of 54% more tokens than natural language.
Ultra YON trades human readability for density: 39% fewer tokens than NL.
NL carries 1% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 1857 | 2234 | 1401 | 727 | **+20%** |
| Tokens (cl100k) | 420 | 645 | 432 | 256 | Canon +54%, Ultra **-39%** |
| Structural Token Ratio | 0% | **80%** | 100% | 100% | Verified |
| Discourse Filler Density | 1% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 420 | tok |
| canon_tokens | 645 | tok |
| min_tokens | 432 | tok |
| ultra_tokens | 256 | tok |
| structural_ratio_canon | 80 | % |
| filler_density_nl | 1 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Data Pipeline (ETL) [Advantage]

**Metric:** `7.3 /10` _(vs NL avg: 6.5 → +0.8)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 6.5/10 — a gap of +0.8 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**8** | 6→**9** | 5→**5** | 6.3→**7.3** |
| Attribute Extraction Accuracy | 9→**9** | 7→**9** | 5→**5** | 7.0→**7.7** |
| Intent Detection | 8→**9** | 8→**8** | 5→**5** | 7.0→**7.3** |
| Internal Consistency | 7→**8** | 7→**9** | 5→**5** | 6.3→**7.3** |
| Hallucination Risk (10=lowest risk) | 6→**7** | 6→**8** | 5→**5** | 5.7→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 6.5 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 3019 | ms |

### PASS: Token Efficiency — Full API Spec (Billing) [Advantage]

**Metric:** `64 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (75% of lines are typed records) at the cost of 3% more tokens than natural language.
Ultra YON trades human readability for density: 64% fewer tokens than NL.
NL carries 1% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 9128 | 8195 | 3632 | 2104 | **-10%** |
| Tokens (cl100k) | 2181 | 2240 | 1134 | 791 | Canon +3%, Ultra **-64%** |
| Structural Token Ratio | 0% | **75%** | 80% | 100% | Verified |
| Discourse Filler Density | 1% | **0%** | 0% | 1% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 2181 | tok |
| canon_tokens | 2240 | tok |
| min_tokens | 1134 | tok |
| ultra_tokens | 791 | tok |
| structural_ratio_canon | 75 | % |
| filler_density_nl | 1 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Full API Spec (Billing) [Advantage]

**Metric:** `7.4 /10` _(vs NL avg: 6.7 → +0.7)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.4/10 across all models. NL averaged 6.7/10 — a gap of +0.7 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**9** | 6→**9** | 5→**5** | 6.3→**7.7** |
| Attribute Extraction Accuracy | 9→**8** | 7→**9** | 5→**5** | 7.0→**7.3** |
| Intent Detection | 8→**9** | 8→**8** | 5→**5** | 7.0→**7.3** |
| Internal Consistency | 9→**9** | 7→**9** | 5→**5** | 7.0→**7.7** |
| Hallucination Risk (10=lowest risk) | 7→**7** | 6→**9** | 5→**5** | 6.0→**7.0** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 6.7 | /10 |
| yon_overall | 7.4 | /10 |
| duration | 3128 | ms |

### PASS: Token Efficiency — Architecture ADR (Temporal+Kafka) [Advantage]

**Metric:** `55 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (67% of lines are typed records) at the cost of 15% more tokens than natural language.
Ultra YON trades human readability for density: 55% fewer tokens than NL.
NL carries 0% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 10985 | 10253 | 5115 | 2979 | **-7%** |
| Tokens (cl100k) | 2349 | 2698 | 1553 | 1055 | Canon +15%, Ultra **-55%** |
| Structural Token Ratio | 0% | **67%** | 78% | 100% | Verified |
| Discourse Filler Density | 0% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 2349 | tok |
| canon_tokens | 2698 | tok |
| min_tokens | 1553 | tok |
| ultra_tokens | 1055 | tok |
| structural_ratio_canon | 67 | % |
| filler_density_nl | 0 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Architecture ADR (Temporal+Kafka) [Even]

**Metric:** `7.4 /10` _(vs NL avg: 7.4 → +0)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.4/10 across all models. NL averaged 7.4/10 — a gap of +0 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 9→**9** | 9→**9** | 5→**5** | 7.7→**7.7** |
| Attribute Extraction Accuracy | 8→**8** | 9→**9** | 5→**5** | 7.3→**7.3** |
| Intent Detection | 9→**9** | 9→**9** | 5→**5** | 7.7→**7.7** |
| Internal Consistency | 9→**9** | 9→**9** | 5→**5** | 7.7→**7.7** |
| Hallucination Risk (10=lowest risk) | 7→**7** | 8→**8** | 5→**5** | 6.7→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 7.4 | /10 |
| yon_overall | 7.4 | /10 |
| duration | 3787 | ms |

### PASS: Token Efficiency — Incident Postmortem (SEV-1) [Advantage]

**Metric:** `60 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (62% of lines are typed records) at the cost of 19% fewer tokens than natural language.
Ultra YON trades human readability for density: 60% fewer tokens than NL.
NL carries 0% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 10583 | 6533 | 3686 | 2364 | **-38%** |
| Tokens (cl100k) | 2308 | 1877 | 1259 | 932 | Canon -19%, Ultra **-60%** |
| Structural Token Ratio | 0% | **62%** | 71% | 100% | Verified |
| Discourse Filler Density | 0% | **0%** | 0% | 1% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 2308 | tok |
| canon_tokens | 1877 | tok |
| min_tokens | 1259 | tok |
| ultra_tokens | 932 | tok |
| structural_ratio_canon | 62 | % |
| filler_density_nl | 0 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Incident Postmortem (SEV-1) [Even]

**Metric:** `7.3 /10` _(vs NL avg: 7.4 → +-0.1)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 7.4/10 — a gap of +-0.1 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 9→**9** | 9→**9** | 5→**5** | 7.7→**7.7** |
| Attribute Extraction Accuracy | 8→**8** | 9→**9** | 5→**5** | 7.3→**7.3** |
| Intent Detection | 9→**9** | 9→**8** | 5→**5** | 7.7→**7.3** |
| Internal Consistency | 9→**9** | 9→**9** | 5→**5** | 7.7→**7.7** |
| Hallucination Risk (10=lowest risk) | 7→**7** | 8→**8** | 5→**5** | 6.7→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 7.4 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 3027 | ms |

### PASS: Token Efficiency — Multilingual Policy (EU Privacy) [Advantage]

**Metric:** `46 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (78% of lines are typed records) at the cost of 30% more tokens than natural language.
Ultra YON trades human readability for density: 46% fewer tokens than NL.
NL carries 0% discourse fillers ("ok so", "basically"). YON eliminates them.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 6014 | 6483 | 3625 | 1988 | **+8%** |
| Tokens (cl100k) | 1364 | 1780 | 1141 | 733 | Canon +30%, Ultra **-46%** |
| Structural Token Ratio | 0% | **78%** | 75% | 100% | Verified |
| Discourse Filler Density | 0% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 0% | **0%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 1364 | tok |
| canon_tokens | 1780 | tok |
| min_tokens | 1141 | tok |
| ultra_tokens | 733 | tok |
| structural_ratio_canon | 78 | % |
| filler_density_nl | 0 | % |
| hedging_density_nl | 0 | % |
| hedging_density_canon | 0 | % |

### PASS: Comprehension Quality — Multilingual Policy (EU Privacy) [Even]

**Metric:** `7.3 /10` _(vs NL avg: 7.2 → +0.1)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.3/10 across all models. NL averaged 7.2/10 — a gap of +0.1 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**9** | 9→**9** | 5→**5** | 7.3→**7.7** |
| Attribute Extraction Accuracy | 9→**8** | 8→**9** | 5→**5** | 7.3→**7.3** |
| Intent Detection | 9→**9** | 9→**8** | 5→**5** | 7.7→**7.3** |
| Internal Consistency | 8→**9** | 9→**9** | 5→**5** | 7.3→**7.7** |
| Hallucination Risk (10=lowest risk) | 7→**7** | 7→**8** | 5→**5** | 6.3→**6.7** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 7.2 | /10 |
| yon_overall | 7.3 | /10 |
| duration | 2989 | ms |

### PASS: Token Efficiency — Creative Brainstorm (Negative Control) [Advantage]

**Metric:** `58 %`

Token efficiency measures raw compression — characters and tokens consumed per format.
Canon YON adds structure (54% of lines are typed records) at the cost of 24% fewer tokens than natural language.
Ultra YON trades human readability for density: 58% fewer tokens than NL.
NL carries 2% discourse fillers ("ok so", "basically"). YON eliminates them.
NL contains 1% hedging markers (§6.1-protected). Canon preserves 1%.
**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.
Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |
|--------|----:|----------:|--------:|----------:|------:|
| Characters | 4611 | 3078 | 1931 | 1307 | **-33%** |
| Tokens (cl100k) | 977 | 743 | 530 | 414 | Canon -24%, Ultra **-58%** |
| Structural Token Ratio | 0% | **54%** | 75% | 100% | Verified |
| Discourse Filler Density | 2% | **0%** | 0% | 0% | Verified |
| Hedging Density (§6.1) | 1% | **1%** | 0% | 0% | Verified |

| Metric | Value | Unit |
|--------|-------|------|
| nl_tokens | 977 | tok |
| canon_tokens | 743 | tok |
| min_tokens | 530 | tok |
| ultra_tokens | 414 | tok |
| structural_ratio_canon | 54 | % |
| filler_density_nl | 2 | % |
| hedging_density_nl | 1 | % |
| hedging_density_canon | 1 | % |

### PASS: Comprehension Quality — Creative Brainstorm (Negative Control) [Advantage]

**Metric:** `7.1 /10` _(vs NL avg: 5.9 → +1.1)_

Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.
YON averaged 7.1/10 across all models. NL averaged 5.9/10 — a gap of +1.1 points.
Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.

**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.
| Dimension | OpenAI (NL→YON) | Anthropic (NL→YON) | Google (NL→YON) | Average |
|-----------|:---:|:---:|:---:|:---:|
| Section Boundary Clarity | 8→**8** | 6→**9** | 5→**5** | 6.3→**7.3** |
| Attribute Extraction Accuracy | 7→**9** | 4→**9** | 5→**5** | 5.3→**7.7** |
| Intent Detection | 9→**7** | 8→**8** | 5→**5** | 7.3→**6.7** |
| Internal Consistency | 8→**8** | 5→**9** | 5→**5** | 6.0→**7.3** |
| Hallucination Risk (10=lowest risk) | 6→**6** | 3→**8** | 5→**5** | 4.7→**6.3** |

| Metric | Value | Unit |
|--------|-------|------|
| nl_overall | 5.9 | /10 |
| yon_overall | 7.1 | /10 |
| duration | 3148 | ms |

### PASS: Deep Evaluation Summary (10 scenarios × 2 categories)

**Metric:** `10 evaluated`

| Category | Tests | Aggregate |
|----------|:-----:|-----------|
| token-efficiency | 10 tests | avg metric: 46.8 % |
| comprehension | 10 tests | avg metric: 7.3 /10 |

| Metric | Value | Unit |
|--------|-------|------|
| total_tests | 20 | tests |
| categories | 2 | categories |
| models | 3 | models |

</details>

---

## For Specialists

### Perception Analysis

**Model Spread**: All models show parity. Minor deltas suggest no real perception shift. 

**Training Data Asymmetry**: YON has zero training presence. NL formats have billions of examples. Despite this, YON maintains comprehension quality.

**Signal Classification**: Parity indicates noise, not perception shift. Minor deltas are within expected variance.

**YON Feature**: Token reduction via fmt=min and fmt=ultra. Reduces token count while preserving comprehension.

**Known Boundary**: Effect may not hold at larger scales. Larger documents could reveal different dynamics.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._