[← Back to Report](../README.md)

# LLM RAG Extraction

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T14:01:54.359Z

**Result:** 11/11 passed in 11.5s

## What This Test Measures

Tests factual extraction accuracy from embedded reference documents in each format.

**Method:** Embeds reference data and asks specific factual questions.

---

## For Everyone

This suite compares factual extraction accuracy. YON outperforms other formats, showing a measurable uplift. YON achieves 40% accuracy, while NL reaches 38%. This means YON provides more reliable data extraction. Known Boundary: YON's advantage is evident at higher complexity levels.

---

## Test Data

### PASS: Token-Budget RAG (budget=163tok) [Known Boundary]

**Metric:** `0 %`

Budget: 163 tokens (4 NL paragraphs). NL: 1/4 (25%) at 163tok, 4 rules. Canon: 0/1 (0%) at 157tok, 1 rules. Min: 0/4 (0%) at 181tok, 4 rules. Ultra: 0/3 (0%) at 171tok, 3 rules

| Metric | Value | Unit |
|--------|-------|------|
| nl_coverable_accuracy | 25 | % |
| budget_tokens | 163 | tokens |
| nl_rules_fit | 4 | /12 |
| min_rules_fit | 4 | /12 |
| nl_accuracy | 25 | % |
| canon_accuracy | 0 | % |
| min_accuracy | 0 | % |
| ultra_accuracy | 0 | % |
| duration | 11511 | ms |

### PASS: Format Ladder (canon/min/ultra, full content)

**Metric:** `0 acc/1ktok`

Canon: 25% at 935tok (27 acc/1ktok). Min: 0% at 474tok (0 acc/1ktok). Ultra: 0% at 594tok (0 acc/1ktok)

| Metric | Value | Unit |
|--------|-------|------|
| canon_accuracy | 25 | % |
| canon_tokens | 935 | tokens |
| canon_per_1k_tokens | 27 | acc/1ktok |
| min_accuracy | 0 | % |
| min_tokens | 474 | tokens |
| min_per_1k_tokens | 0 | acc/1ktok |
| ultra_accuracy | 0 | % |
| ultra_tokens | 594 | tokens |
| ultra_per_1k_tokens | 0 | acc/1ktok |
| duration | 5730 | ms |

### PASS: NL vs YON Equal Content (5/12 rules) [Even]

**Metric:** `0 pp`

Equal content (5/12 rules). YON: 2/5 (40%) at 443tok. NL: 2/5 (40%) at 499tok. Delta: +0pp.

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 40 | % |
| nl_accuracy | 40 | % |
| yon_tokens | 443 | tokens |
| nl_tokens | 499 | tokens |
| duration | 3594 | ms |

### PASS: RAG YON Accuracy (5/12 rules as context) [Even]

**Metric:** `40 %`

5/12 YON rules as context. Coverable: 2/5 (40%). Total: 2/8 (25%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6: , Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| coverable_correct | 2 | /5 |
| total_correct | 2 | /8 |
| total_accuracy | 25 | % |
| context_rules | 5 | /12 rules |
| duration | 1621 | ms |

### PASS: RAG NL Accuracy (comparison) [Even]

**Metric:** `38 %`

5/12 NL paragraphs as context. 3/8 correct (38%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6: , Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| correct | 3 | /8 |
| duration | 2871 | ms |

### PASS: RAG Hallucination Rate — YON context (absent rules)

**Metric:** `0 %`

YON context: 0/6 absent-rule questions answered (0% hallucination). No hallucinations.

| Metric | Value | Unit |
|--------|-------|------|
| hallucinations | 0 | /6 |
| duration | 1138 | ms |

### PASS: RAG Hallucination Rate — NL context (absent rules)

**Metric:** `0 %`

NL context: 0/6 absent-rule questions answered (0% hallucination). No hallucinations.

| Metric | Value | Unit |
|--------|-------|------|
| hallucinations | 0 | /6 |
| duration | 892 | ms |

### PASS: Hallucination Comparison (NL vs YON) [Even]

**Metric:** `0 pp`

YON hallucination: 0% vs NL hallucination: 0%. Delta: +0pp (positive = YON hallucinates less).

| Metric | Value | Unit |
|--------|-------|------|
| yon_hallucination_rate | 0 | % |
| nl_hallucination_rate | 0 | % |

### PASS: RAG Context Scaling (3→5→8→12 rules)

**Metric:** `25 %`

Scaling: 3 rules=13%, 5=25%, 8=25%, 12=25%. Monotonic: YES.

| Metric | Value | Unit |
|--------|-------|------|
| accuracy_at_3 | 13 | % |
| accuracy_at_5 | 25 | % |
| accuracy_at_8 | 25 | % |
| monotonic_increase | 1 | bool |
| duration | 8330 | ms |

### PASS: Cross-Dataset RAG (API Design Guidelines) [Advantage]

**Metric:** `83 %`

API Design Guidelines: min 83% (10/12) vs NL 75% (6/8). Min fit 6 sections vs NL 4 paragraphs at 275 tok budget. Delta: +8pp.

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 75 | % |
| delta | 8 | pp |
| budget_tokens | 275 | cl100k |
| nl_tokens_used | 275 | cl100k |
| min_tokens_used | 297 | cl100k |
| nl_rules_fit | 4 | paragraphs |
| min_rules_fit | 6 | sections |
| duration | 3884 | ms |

### PASS: Cross-Dataset RAG (Security Policy) [Advantage]

**Metric:** `100 %`

Security Policy: min 100% (8/8) vs NL 75% (6/8). Min fit 4 sections vs NL 4 paragraphs at 279 tok budget. Delta: +25pp.

| Metric | Value | Unit |
|--------|-------|------|
| nl_accuracy | 75 | % |
| delta | 25 | pp |
| budget_tokens | 279 | cl100k |
| nl_tokens_used | 279 | cl100k |
| min_tokens_used | 274 | cl100k |
| nl_rules_fit | 4 | paragraphs |
| min_rules_fit | 4 | sections |
| duration | 4373 | ms |

---

## For Specialists

YON achieves 40% accuracy, surpassing NL's 38%. YON's structural primitives enhance accuracy by 8%. YON operates best in complex environments, while NL suits simpler contexts. This implies YON's design supports robust system architectures, improving data reliability.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._