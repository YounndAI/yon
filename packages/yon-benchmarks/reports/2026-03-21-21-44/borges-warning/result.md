[← Back to Report](../README.md)

# Borges Warning (Cognitive Bias)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-21T19:59:35.057Z

**Result:** 119/119 passed in 5m 20s (320s)

## What This Test Measures

Tests whether the notation format changes what an AI perceives. Named after Borges: "the map is not the territory, but the map affects which territory you explore."

**Method:** Gives identical system descriptions in different formats to LLMs and measures how many risk categories each model detects.

**YON feature tested:** @RULE, @MAP, @CHECK create salience hierarchies

---

## For Everyone

The way information is written changes AI perception. Different formats lead to different AI responses. YON is new, with no training data, while natural language has billions of examples. This test shows that notation affects AI understanding, highlighting the importance of how we present information.

---

## Results Summary

| # | Test | Status | Key Metric | Outcome |
|--:|------|--------|------------|---------|
| 1 | YON Best-Practice (@RULE/@MAP) [GPT-4o-mini] | PASS | 40 % | — |
| 2 | YON Best-Practice (@RULE/@MAP) [GPT-5-mini] | PASS | 33 % | — |
| 3 | YON Best-Practice (@RULE/@MAP) [GPT-4o] | PASS | 40 % | — |
| 4 | YON Best-Practice (@RULE/@MAP) [GPT-4.1] | PASS | 40 % | — |
| 5 | YON Best-Practice (@RULE/@MAP) [Claude Haiku 4.5] | PASS | 40 % | — |
| 6 | YON Best-Practice (@RULE/@MAP) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 7 | YON Best-Practice (@RULE/@MAP) [Gemini 3 Flash] | PASS | 40 % | — |
| 8 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o-mini] | PASS | 40 % | — |
| 9 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-5-mini] | PASS | 50 % | — |
| 10 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o] | PASS | 50 % | — |
| 11 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4.1] | PASS | 40 % | — |
| 12 | YON Enforcement (@MAP/@RULE/@CHECK) [Claude Haiku 4.5] | PASS | 40 % | — |
| 13 | YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 14 | YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 3 Flash] | PASS | 40 % | — |
| 15 | Structured Markdown (##, bullets) [GPT-4o-mini] | PASS | 40 % | — |
| 16 | Structured Markdown (##, bullets) [GPT-5-mini] | PASS | 33 % | — |
| 17 | Structured Markdown (##, bullets) [GPT-4o] | PASS | 40 % | — |
| 18 | Structured Markdown (##, bullets) [GPT-4.1] | PASS | 40 % | — |
| 19 | Structured Markdown (##, bullets) [Claude Haiku 4.5] | PASS | 40 % | — |
| 20 | Structured Markdown (##, bullets) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 21 | Structured Markdown (##, bullets) [Gemini 3 Flash] | PASS | 25 % | — |
| 22 | Unstructured Prose (plain text) [GPT-4o-mini] | PASS | 40 % | — |
| 23 | Unstructured Prose (plain text) [GPT-5-mini] | PASS | 50 % | — |
| 24 | Unstructured Prose (plain text) [GPT-4o] | PASS | 40 % | — |
| 25 | Unstructured Prose (plain text) [GPT-4.1] | PASS | 40 % | — |
| 26 | Unstructured Prose (plain text) [Claude Haiku 4.5] | PASS | 40 % | — |
| 27 | Unstructured Prose (plain text) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 28 | Unstructured Prose (plain text) [Gemini 3 Flash] | PASS | 25 % | — |
| 29 | Structured JSON (config schema) [GPT-4o-mini] | PASS | 40 % | — |
| 30 | Structured JSON (config schema) [GPT-5-mini] | PASS | 40 % | — |
| 31 | Structured JSON (config schema) [GPT-4o] | PASS | 40 % | — |
| 32 | Structured JSON (config schema) [GPT-4.1] | PASS | 40 % | — |
| 33 | Structured JSON (config schema) [Claude Haiku 4.5] | PASS | 40 % | — |
| 34 | Structured JSON (config schema) [Gemini 2.5 Flash] | PASS | 40 % | — |
| 35 | Structured JSON (config schema) [Gemini 3 Flash] | PASS | 40 % | — |
| 36 | Payment Differential [GPT-4o-mini] | PASS | 0 pp | — |
| 37 | Payment Differential [GPT-5-mini] | PASS | -17 pp | — |
| 38 | Payment Differential [GPT-4o] | PASS | 0 pp | — |
| 39 | Payment Differential [GPT-4.1] | PASS | 0 pp | — |
| 40 | Payment Differential [Claude Haiku 4.5] | PASS | 0 pp | — |
| 41 | Payment Differential [Gemini 2.5 Flash] | PASS | 0 pp | — |
| 42 | Payment Differential [Gemini 3 Flash] | PASS | 15 pp | — |
| 43 | Multi-Domain YON (@RULE/@MAP) [GPT-4o-mini] | PASS | 30 % | — |
| 44 | Multi-Domain YON (@RULE/@MAP) [GPT-5-mini] | PASS | 50 % | — |
| 45 | Multi-Domain YON (@RULE/@MAP) [GPT-4o] | PASS | 22 % | — |
| 46 | Multi-Domain YON (@RULE/@MAP) [GPT-4.1] | PASS | 22 % | — |
| 47 | Multi-Domain YON (@RULE/@MAP) [Claude Haiku 4.5] | PASS | 30 % | — |
| 48 | Multi-Domain YON (@RULE/@MAP) [Gemini 2.5 Flash] | PASS | 0 % | — |
| 49 | Multi-Domain YON (@RULE/@MAP) [Gemini 3 Flash] | PASS | 22 % | — |
| 50 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o-mini] | PASS | 30 % | — |
| 51 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-5-mini] | PASS | 0 % | — |
| 52 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o] | PASS | 22 % | — |
| 53 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4.1] | PASS | 22 % | — |
| 54 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Claude Haiku 4.5] | PASS | 22 % | — |
| 55 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 2.5 Flash] | PASS | 0 % | — |
| 56 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 3 Flash] | PASS | 14 % | — |
| 57 | Multi-Domain YON + Instructions (winning combo) [GPT-4o-mini] | PASS | 30 % | — |
| 58 | Multi-Domain YON + Instructions (winning combo) [GPT-5-mini] | PASS | 50 % | — |
| 59 | Multi-Domain YON + Instructions (winning combo) [GPT-4o] | PASS | 30 % | — |
| 60 | Multi-Domain YON + Instructions (winning combo) [GPT-4.1] | PASS | 30 % | — |
| 61 | Multi-Domain YON + Instructions (winning combo) [Claude Haiku 4.5] | PASS | 30 % | — |
| 62 | Multi-Domain YON + Instructions (winning combo) [Gemini 2.5 Flash] | PASS | 0 % | — |
| 63 | Multi-Domain YON + Instructions (winning combo) [Gemini 3 Flash] | PASS | 25 % | — |
| 64 | Unstructured Brain Dump (chaotic) [GPT-4o-mini] | PASS | 30 % | — |
| 65 | Unstructured Brain Dump (chaotic) [GPT-5-mini] | PASS | 29 % | — |
| 66 | Unstructured Brain Dump (chaotic) [GPT-4o] | PASS | 30 % | — |
| 67 | Unstructured Brain Dump (chaotic) [GPT-4.1] | PASS | 30 % | — |
| 68 | Unstructured Brain Dump (chaotic) [Claude Haiku 4.5] | PASS | 30 % | — |
| 69 | Unstructured Brain Dump (chaotic) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 70 | Unstructured Brain Dump (chaotic) [Gemini 3 Flash] | PASS | 50 % | — |
| 71 | Multi-Domain Differential [GPT-4o-mini] | PASS | 0 pp | — |
| 72 | Multi-Domain Differential [GPT-5-mini] | PASS | 21 pp | — |
| 73 | Multi-Domain Differential [GPT-4o] | PASS | 0 pp | — |
| 74 | Multi-Domain Differential [GPT-4.1] | PASS | 0 pp | — |
| 75 | Multi-Domain Differential [Claude Haiku 4.5] | PASS | 0 pp | — |
| 76 | Multi-Domain Differential [Gemini 2.5 Flash] | PASS | -50 pp | — |
| 77 | Multi-Domain Differential [Gemini 3 Flash] | PASS | -25 pp | — |
| 78 | Computation [GPT-4o-mini] × multi-domain-yon-instructed | PASS | 8 /11 | — |
| 79 | Computation [GPT-5-mini] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 80 | Computation [GPT-4o] × multi-domain-yon-instructed | PASS | 6 /11 | — |
| 81 | Computation [GPT-4.1] × multi-domain-yon-instructed | PASS | 11 /11 | — |
| 82 | Computation [Claude Haiku 4.5] × multi-domain-yon-instructed | PASS | 10 /11 | — |
| 83 | Computation [Gemini 2.5 Flash] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 84 | Computation [Gemini 3 Flash] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 85 | Computation [GPT-4o-mini] × multi-domain-yon | PASS | 4 /11 | — |
| 86 | Computation [GPT-5-mini] × multi-domain-yon | PASS | 0 /11 | — |
| 87 | Computation [GPT-4o] × multi-domain-yon | PASS | 5 /11 | — |
| 88 | Computation [GPT-4.1] × multi-domain-yon | PASS | 10 /11 | — |
| 89 | Computation [Claude Haiku 4.5] × multi-domain-yon | PASS | 10 /11 | — |
| 90 | Computation [Gemini 2.5 Flash] × multi-domain-yon | PASS | 1 /11 | — |
| 91 | Computation [Gemini 3 Flash] × multi-domain-yon | PASS | 0 /11 | — |
| 92 | Computation [GPT-4o-mini] × unstructured-dump | PASS | 7 /11 | — |
| 93 | Computation [GPT-5-mini] × unstructured-dump | PASS | 0 /11 | — |
| 94 | Computation [GPT-4o] × unstructured-dump | PASS | 7 /11 | — |
| 95 | Computation [GPT-4.1] × unstructured-dump | PASS | 11 /11 | — |
| 96 | Computation [Claude Haiku 4.5] × unstructured-dump | PASS | 7 /11 | — |
| 97 | Computation [Gemini 2.5 Flash] × unstructured-dump | PASS | 0 /11 | — |
| 98 | Computation [Gemini 3 Flash] × unstructured-dump | PASS | 0 /11 | — |
| 99 | Dependencies [GPT-4o-mini] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 100 | Dependencies [GPT-5-mini] × multi-domain-yon-instructed | PASS | 1 /7 | — |
| 101 | Dependencies [GPT-4o] × multi-domain-yon-instructed | PASS | 6 /7 | — |
| 102 | Dependencies [GPT-4.1] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 103 | Dependencies [Claude Haiku 4.5] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 104 | Dependencies [Gemini 2.5 Flash] × multi-domain-yon-instructed | PASS | 0 /7 | — |
| 105 | Dependencies [Gemini 3 Flash] × multi-domain-yon-instructed | PASS | 5 /7 | — |
| 106 | Dependencies [GPT-4o-mini] × multi-domain-yon | PASS | 7 /7 | — |
| 107 | Dependencies [GPT-5-mini] × multi-domain-yon | PASS | 0 /7 | — |
| 108 | Dependencies [GPT-4o] × multi-domain-yon | PASS | 6 /7 | — |
| 109 | Dependencies [GPT-4.1] × multi-domain-yon | PASS | 7 /7 | — |
| 110 | Dependencies [Claude Haiku 4.5] × multi-domain-yon | PASS | 7 /7 | — |
| 111 | Dependencies [Gemini 2.5 Flash] × multi-domain-yon | PASS | 1 /7 | — |
| 112 | Dependencies [Gemini 3 Flash] × multi-domain-yon | PASS | 5 /7 | — |
| 113 | Dependencies [GPT-4o-mini] × unstructured-dump | PASS | 3 /7 | — |
| 114 | Dependencies [GPT-5-mini] × unstructured-dump | PASS | 0 /7 | — |
| 115 | Dependencies [GPT-4o] × unstructured-dump | PASS | 3 /7 | — |
| 116 | Dependencies [GPT-4.1] × unstructured-dump | PASS | 7 /7 | — |
| 117 | Dependencies [Claude Haiku 4.5] × unstructured-dump | PASS | 7 /7 | — |
| 118 | Dependencies [Gemini 2.5 Flash] × unstructured-dump | PASS | 0 /7 | — |
| 119 | Dependencies [Gemini 3 Flash] × unstructured-dump | PASS | 7 /7 | — |

<details>
<summary>Full Test Data (click to expand)</summary>

## Test Data

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-4o-mini]

**Metric:** `40 %`

GPT-4o-mini × YON Best-Practice (@RULE/@MAP): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-5-mini]

**Metric:** `33 %`

GPT-5-mini × YON Best-Practice (@RULE/@MAP): 1 rule, 2 metric. Bias: 33%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | yon-best-practice |
| rule_salient | 1 | /2 |
| metric_salient | 2 | /3 |
| unclassified | 2 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-4o]

**Metric:** `40 %`

GPT-4o × YON Best-Practice (@RULE/@MAP): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-4.1]

**Metric:** `40 %`

GPT-4.1 × YON Best-Practice (@RULE/@MAP): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [Claude Haiku 4.5]

**Metric:** `40 %`

Claude Haiku 4.5 × YON Best-Practice (@RULE/@MAP): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [Gemini 2.5 Flash]

**Metric:** `50 %`

Gemini 2.5 Flash × YON Best-Practice (@RULE/@MAP): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | yon-best-practice |
| rule_salient | 1 | /2 |
| metric_salient | 1 | /3 |
| unclassified | 3 | categories |
| duration | 24947 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [Gemini 3 Flash]

**Metric:** `40 %`

Gemini 3 Flash × YON Best-Practice (@RULE/@MAP): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 24947 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o-mini]

**Metric:** `40 %`

GPT-4o-mini × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × YON Enforcement (@MAP/@RULE/@CHECK): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | yon-enforcement |
| rule_salient | 0 | /2 |
| metric_salient | 0 | /3 |
| unclassified | 5 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o]

**Metric:** `50 %`

GPT-4o × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 2 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 2 | /3 |
| unclassified | 1 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4.1]

**Metric:** `40 %`

GPT-4.1 × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [Claude Haiku 4.5]

**Metric:** `40 %`

Claude Haiku 4.5 × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 2.5 Flash]

**Metric:** `50 %`

Gemini 2.5 Flash × YON Enforcement (@MAP/@RULE/@CHECK): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | yon-enforcement |
| rule_salient | 1 | /2 |
| metric_salient | 1 | /3 |
| unclassified | 3 | categories |
| duration | 22424 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 3 Flash]

**Metric:** `40 %`

Gemini 3 Flash × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22424 | ms |

### PASS: Structured Markdown (##, bullets) [GPT-4o-mini]

**Metric:** `40 %`

GPT-4o-mini × Structured Markdown (##, bullets): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | structured-markdown |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [GPT-5-mini]

**Metric:** `33 %`

GPT-5-mini × Structured Markdown (##, bullets): 1 rule, 2 metric. Bias: 33%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | structured-markdown |
| rule_salient | 1 | /2 |
| metric_salient | 2 | /3 |
| unclassified | 2 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [GPT-4o]

**Metric:** `40 %`

GPT-4o × Structured Markdown (##, bullets): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | structured-markdown |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [GPT-4.1]

**Metric:** `40 %`

GPT-4.1 × Structured Markdown (##, bullets): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | structured-markdown |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [Claude Haiku 4.5]

**Metric:** `40 %`

Claude Haiku 4.5 × Structured Markdown (##, bullets): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | structured-markdown |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [Gemini 2.5 Flash]

**Metric:** `50 %`

Gemini 2.5 Flash × Structured Markdown (##, bullets): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | structured-markdown |
| rule_salient | 1 | /2 |
| metric_salient | 1 | /3 |
| unclassified | 3 | categories |
| duration | 22721 | ms |

### PASS: Structured Markdown (##, bullets) [Gemini 3 Flash]

**Metric:** `25 %`

Gemini 3 Flash × Structured Markdown (##, bullets): 1 rule, 3 metric. Bias: 25%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | structured-markdown |
| rule_salient | 1 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 1 | categories |
| duration | 22721 | ms |

### PASS: Unstructured Prose (plain text) [GPT-4o-mini]

**Metric:** `40 %`

GPT-4o-mini × Unstructured Prose (plain text): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | unstructured-prose |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Unstructured Prose (plain text): 2 rule, 2 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | unstructured-prose |
| rule_salient | 2 | /2 |
| metric_salient | 2 | /3 |
| unclassified | 1 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [GPT-4o]

**Metric:** `40 %`

GPT-4o × Unstructured Prose (plain text): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | unstructured-prose |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [GPT-4.1]

**Metric:** `40 %`

GPT-4.1 × Unstructured Prose (plain text): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | unstructured-prose |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [Claude Haiku 4.5]

**Metric:** `40 %`

Claude Haiku 4.5 × Unstructured Prose (plain text): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | unstructured-prose |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [Gemini 2.5 Flash]

**Metric:** `50 %`

Gemini 2.5 Flash × Unstructured Prose (plain text): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | unstructured-prose |
| rule_salient | 1 | /2 |
| metric_salient | 1 | /3 |
| unclassified | 3 | categories |
| duration | 22005 | ms |

### PASS: Unstructured Prose (plain text) [Gemini 3 Flash]

**Metric:** `25 %`

Gemini 3 Flash × Unstructured Prose (plain text): 1 rule, 3 metric. Bias: 25%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-prose |
| rule_salient | 1 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 1 | categories |
| duration | 22005 | ms |

### PASS: Structured JSON (config schema) [GPT-4o-mini]

**Metric:** `40 %`

GPT-4o-mini × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [GPT-5-mini]

**Metric:** `40 %`

GPT-5-mini × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [GPT-4o]

**Metric:** `40 %`

GPT-4o × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [GPT-4.1]

**Metric:** `40 %`

GPT-4.1 × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [Claude Haiku 4.5]

**Metric:** `40 %`

Claude Haiku 4.5 × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [Gemini 2.5 Flash]

**Metric:** `40 %`

Gemini 2.5 Flash × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Structured JSON (config schema) [Gemini 3 Flash]

**Metric:** `40 %`

Gemini 3 Flash × Structured JSON (config schema): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | structured-json |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 21544 | ms |

### PASS: Payment Differential [GPT-4o-mini]

**Metric:** `0 pp`

GPT-4o-mini: YON(40%) vs baseline(40%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| yon-best-practice | 40 | % |
| yon-enforcement | 40 | % |
| structured-markdown | 40 | % |
| unstructured-prose | 40 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [GPT-5-mini]

**Metric:** `-17 pp`

GPT-5-mini: YON(33%) vs baseline(50%) = -17pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| yon-best-practice | 33 | % |
| yon-enforcement | 50 | % |
| structured-markdown | 33 | % |
| unstructured-prose | 50 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [GPT-4o]

**Metric:** `0 pp`

GPT-4o: YON(40%) vs baseline(40%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| yon-best-practice | 40 | % |
| yon-enforcement | 50 | % |
| structured-markdown | 40 | % |
| unstructured-prose | 40 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [GPT-4.1]

**Metric:** `0 pp`

GPT-4.1: YON(40%) vs baseline(40%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| yon-best-practice | 40 | % |
| yon-enforcement | 40 | % |
| structured-markdown | 40 | % |
| unstructured-prose | 40 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [Claude Haiku 4.5]

**Metric:** `0 pp`

Claude Haiku 4.5: YON(40%) vs baseline(40%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| yon-best-practice | 40 | % |
| yon-enforcement | 40 | % |
| structured-markdown | 40 | % |
| unstructured-prose | 40 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [Gemini 2.5 Flash]

**Metric:** `0 pp`

Gemini 2.5 Flash: YON(50%) vs baseline(50%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| yon-best-practice | 50 | % |
| yon-enforcement | 50 | % |
| structured-markdown | 50 | % |
| unstructured-prose | 50 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [Gemini 3 Flash]

**Metric:** `15 pp`

Gemini 3 Flash: YON(40%) vs baseline(25%) = 15pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| yon-best-practice | 40 | % |
| yon-enforcement | 40 | % |
| structured-markdown | 25 | % |
| unstructured-prose | 25 | % |
| structured-json | 40 | % |

### PASS: Multi-Domain YON (@RULE/@MAP) [GPT-4o-mini]

**Metric:** `30 %`

GPT-4o-mini × Multi-Domain YON (@RULE/@MAP): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Multi-Domain YON (@RULE/@MAP): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon |
| rule_salient | 0 | /3 |
| metric_salient | 0 | /7 |
| unclassified | 10 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [GPT-4o]

**Metric:** `22 %`

GPT-4o × Multi-Domain YON (@RULE/@MAP): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [GPT-4.1]

**Metric:** `22 %`

GPT-4.1 × Multi-Domain YON (@RULE/@MAP): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [Claude Haiku 4.5]

**Metric:** `30 %`

Claude Haiku 4.5 × Multi-Domain YON (@RULE/@MAP): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [Gemini 2.5 Flash]

**Metric:** `0 %`

Gemini 2.5 Flash × Multi-Domain YON (@RULE/@MAP): 0 rule, 1 metric. Bias: 0%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon |
| rule_salient | 0 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 9 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [Gemini 3 Flash]

**Metric:** `22 %`

Gemini 3 Flash × Multi-Domain YON (@RULE/@MAP): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 21654 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o-mini]

**Metric:** `30 %`

GPT-4o-mini × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-5-mini]

**Metric:** `0 %`

GPT-5-mini × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 0 rule, 1 metric. Bias: 0%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 0 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 9 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o]

**Metric:** `22 %`

GPT-4o × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4.1]

**Metric:** `22 %`

GPT-4.1 × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Claude Haiku 4.5]

**Metric:** `22 %`

Claude Haiku 4.5 × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 2.5 Flash]

**Metric:** `0 %`

Gemini 2.5 Flash × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 0 rule, 1 metric. Bias: 0%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 0 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 9 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 3 Flash]

**Metric:** `14 %`

Gemini 3 Flash × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 1 rule, 6 metric. Bias: 14%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 1 | /3 |
| metric_salient | 6 | /7 |
| unclassified | 3 | categories |
| duration | 20979 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [GPT-4o-mini]

**Metric:** `30 %`

GPT-4o-mini × Multi-Domain YON + Instructions (winning combo): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Multi-Domain YON + Instructions (winning combo): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 0 | /3 |
| metric_salient | 0 | /7 |
| unclassified | 10 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [GPT-4o]

**Metric:** `30 %`

GPT-4o × Multi-Domain YON + Instructions (winning combo): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [GPT-4.1]

**Metric:** `30 %`

GPT-4.1 × Multi-Domain YON + Instructions (winning combo): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [Claude Haiku 4.5]

**Metric:** `30 %`

Claude Haiku 4.5 × Multi-Domain YON + Instructions (winning combo): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [Gemini 2.5 Flash]

**Metric:** `0 %`

Gemini 2.5 Flash × Multi-Domain YON + Instructions (winning combo): 0 rule, 1 metric. Bias: 0%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 0 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 9 | categories |
| duration | 22919 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [Gemini 3 Flash]

**Metric:** `25 %`

Gemini 3 Flash × Multi-Domain YON + Instructions (winning combo): 2 rule, 6 metric. Bias: 25%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 2 | /3 |
| metric_salient | 6 | /7 |
| unclassified | 2 | categories |
| duration | 22919 | ms |

### PASS: Unstructured Brain Dump (chaotic) [GPT-4o-mini]

**Metric:** `30 %`

GPT-4o-mini × Unstructured Brain Dump (chaotic): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | unstructured-dump |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [GPT-5-mini]

**Metric:** `29 %`

GPT-5-mini × Unstructured Brain Dump (chaotic): 2 rule, 5 metric. Bias: 29%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | unstructured-dump |
| rule_salient | 2 | /3 |
| metric_salient | 5 | /7 |
| unclassified | 3 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [GPT-4o]

**Metric:** `30 %`

GPT-4o × Unstructured Brain Dump (chaotic): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | unstructured-dump |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [GPT-4.1]

**Metric:** `30 %`

GPT-4.1 × Unstructured Brain Dump (chaotic): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | unstructured-dump |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [Claude Haiku 4.5]

**Metric:** `30 %`

Claude Haiku 4.5 × Unstructured Brain Dump (chaotic): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | unstructured-dump |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [Gemini 2.5 Flash]

**Metric:** `50 %`

Gemini 2.5 Flash × Unstructured Brain Dump (chaotic): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | unstructured-dump |
| rule_salient | 1 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 8 | categories |
| duration | 21505 | ms |

### PASS: Unstructured Brain Dump (chaotic) [Gemini 3 Flash]

**Metric:** `50 %`

Gemini 3 Flash × Unstructured Brain Dump (chaotic): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-dump |
| rule_salient | 1 | /3 |
| metric_salient | 1 | /7 |
| unclassified | 8 | categories |
| duration | 21505 | ms |

### PASS: Multi-Domain Differential [GPT-4o-mini]

**Metric:** `0 pp`

GPT-4o-mini: YON(30%) vs baseline(30%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| multi-domain-yon | 30 | % |
| multi-domain-yon-enforced | 30 | % |
| multi-domain-yon-instructed | 30 | % |
| unstructured-dump | 30 | % |

### PASS: Multi-Domain Differential [GPT-5-mini]

**Metric:** `21 pp`

GPT-5-mini: YON(50%) vs baseline(29%) = 21pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| multi-domain-yon | 50 | % |
| multi-domain-yon-enforced | 0 | % |
| multi-domain-yon-instructed | 50 | % |
| unstructured-dump | 29 | % |

### PASS: Multi-Domain Differential [GPT-4o]

**Metric:** `0 pp`

GPT-4o: YON(30%) vs baseline(30%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| multi-domain-yon | 22 | % |
| multi-domain-yon-enforced | 22 | % |
| multi-domain-yon-instructed | 30 | % |
| unstructured-dump | 30 | % |

### PASS: Multi-Domain Differential [GPT-4.1]

**Metric:** `0 pp`

GPT-4.1: YON(30%) vs baseline(30%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| multi-domain-yon | 22 | % |
| multi-domain-yon-enforced | 22 | % |
| multi-domain-yon-instructed | 30 | % |
| unstructured-dump | 30 | % |

### PASS: Multi-Domain Differential [Claude Haiku 4.5]

**Metric:** `0 pp`

Claude Haiku 4.5: YON(30%) vs baseline(30%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| multi-domain-yon | 30 | % |
| multi-domain-yon-enforced | 22 | % |
| multi-domain-yon-instructed | 30 | % |
| unstructured-dump | 30 | % |

### PASS: Multi-Domain Differential [Gemini 2.5 Flash]

**Metric:** `-50 pp`

Gemini 2.5 Flash: YON(0%) vs baseline(50%) = -50pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| multi-domain-yon | 0 | % |
| multi-domain-yon-enforced | 0 | % |
| multi-domain-yon-instructed | 0 | % |
| unstructured-dump | 50 | % |

### PASS: Multi-Domain Differential [Gemini 3 Flash]

**Metric:** `-25 pp`

Gemini 3 Flash: YON(25%) vs baseline(50%) = -25pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| multi-domain-yon | 22 | % |
| multi-domain-yon-enforced | 14 | % |
| multi-domain-yon-instructed | 25 | % |
| unstructured-dump | 50 | % |

### PASS: Computation [GPT-4o-mini] × multi-domain-yon-instructed

**Metric:** `8 /11`

GPT-4o-mini × multi-domain-yon-instructed: Found 8/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [GPT-5-mini] × multi-domain-yon-instructed

**Metric:** `0 /11`

GPT-5-mini × multi-domain-yon-instructed: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [GPT-4o] × multi-domain-yon-instructed

**Metric:** `6 /11`

GPT-4o × multi-domain-yon-instructed: Found 6/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [GPT-4.1] × multi-domain-yon-instructed

**Metric:** `11 /11`

GPT-4.1 × multi-domain-yon-instructed: Found 11/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [Claude Haiku 4.5] × multi-domain-yon-instructed

**Metric:** `10 /11`

Claude Haiku 4.5 × multi-domain-yon-instructed: Found 10/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [Gemini 2.5 Flash] × multi-domain-yon-instructed

**Metric:** `0 /11`

Gemini 2.5 Flash × multi-domain-yon-instructed: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [Gemini 3 Flash] × multi-domain-yon-instructed

**Metric:** `0 /11`

Gemini 3 Flash × multi-domain-yon-instructed: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [GPT-4o-mini] × multi-domain-yon

**Metric:** `4 /11`

GPT-4o-mini × multi-domain-yon: Found 4/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon |

### PASS: Computation [GPT-5-mini] × multi-domain-yon

**Metric:** `0 /11`

GPT-5-mini × multi-domain-yon: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon |

### PASS: Computation [GPT-4o] × multi-domain-yon

**Metric:** `5 /11`

GPT-4o × multi-domain-yon: Found 5/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon |

### PASS: Computation [GPT-4.1] × multi-domain-yon

**Metric:** `10 /11`

GPT-4.1 × multi-domain-yon: Found 10/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon |

### PASS: Computation [Claude Haiku 4.5] × multi-domain-yon

**Metric:** `10 /11`

Claude Haiku 4.5 × multi-domain-yon: Found 10/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon |

### PASS: Computation [Gemini 2.5 Flash] × multi-domain-yon

**Metric:** `1 /11`

Gemini 2.5 Flash × multi-domain-yon: Found 1/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon |

### PASS: Computation [Gemini 3 Flash] × multi-domain-yon

**Metric:** `0 /11`

Gemini 3 Flash × multi-domain-yon: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon |

### PASS: Computation [GPT-4o-mini] × unstructured-dump

**Metric:** `7 /11`

GPT-4o-mini × unstructured-dump: Found 7/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | unstructured-dump |

### PASS: Computation [GPT-5-mini] × unstructured-dump

**Metric:** `0 /11`

GPT-5-mini × unstructured-dump: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | unstructured-dump |

### PASS: Computation [GPT-4o] × unstructured-dump

**Metric:** `7 /11`

GPT-4o × unstructured-dump: Found 7/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | unstructured-dump |

### PASS: Computation [GPT-4.1] × unstructured-dump

**Metric:** `11 /11`

GPT-4.1 × unstructured-dump: Found 11/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | unstructured-dump |

### PASS: Computation [Claude Haiku 4.5] × unstructured-dump

**Metric:** `7 /11`

Claude Haiku 4.5 × unstructured-dump: Found 7/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | unstructured-dump |

### PASS: Computation [Gemini 2.5 Flash] × unstructured-dump

**Metric:** `0 /11`

Gemini 2.5 Flash × unstructured-dump: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | unstructured-dump |

### PASS: Computation [Gemini 3 Flash] × unstructured-dump

**Metric:** `0 /11`

Gemini 3 Flash × unstructured-dump: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-dump |

### PASS: Dependencies [GPT-4o-mini] × multi-domain-yon-instructed

**Metric:** `7 /7`

GPT-4o-mini × multi-domain-yon-instructed: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [GPT-5-mini] × multi-domain-yon-instructed

**Metric:** `1 /7`

GPT-5-mini × multi-domain-yon-instructed: Found 1/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [GPT-4o] × multi-domain-yon-instructed

**Metric:** `6 /7`

GPT-4o × multi-domain-yon-instructed: Found 6/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [GPT-4.1] × multi-domain-yon-instructed

**Metric:** `7 /7`

GPT-4.1 × multi-domain-yon-instructed: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [Claude Haiku 4.5] × multi-domain-yon-instructed

**Metric:** `7 /7`

Claude Haiku 4.5 × multi-domain-yon-instructed: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [Gemini 2.5 Flash] × multi-domain-yon-instructed

**Metric:** `0 /7`

Gemini 2.5 Flash × multi-domain-yon-instructed: Found 0/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [Gemini 3 Flash] × multi-domain-yon-instructed

**Metric:** `5 /7`

Gemini 3 Flash × multi-domain-yon-instructed: Found 5/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon-instructed |

### PASS: Dependencies [GPT-4o-mini] × multi-domain-yon

**Metric:** `7 /7`

GPT-4o-mini × multi-domain-yon: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [GPT-5-mini] × multi-domain-yon

**Metric:** `0 /7`

GPT-5-mini × multi-domain-yon: Found 0/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [GPT-4o] × multi-domain-yon

**Metric:** `6 /7`

GPT-4o × multi-domain-yon: Found 6/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [GPT-4.1] × multi-domain-yon

**Metric:** `7 /7`

GPT-4.1 × multi-domain-yon: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [Claude Haiku 4.5] × multi-domain-yon

**Metric:** `7 /7`

Claude Haiku 4.5 × multi-domain-yon: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [Gemini 2.5 Flash] × multi-domain-yon

**Metric:** `1 /7`

Gemini 2.5 Flash × multi-domain-yon: Found 1/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [Gemini 3 Flash] × multi-domain-yon

**Metric:** `5 /7`

Gemini 3 Flash × multi-domain-yon: Found 5/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [GPT-4o-mini] × unstructured-dump

**Metric:** `3 /7`

GPT-4o-mini × unstructured-dump: Found 3/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | unstructured-dump |

### PASS: Dependencies [GPT-5-mini] × unstructured-dump

**Metric:** `0 /7`

GPT-5-mini × unstructured-dump: Found 0/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | unstructured-dump |

### PASS: Dependencies [GPT-4o] × unstructured-dump

**Metric:** `3 /7`

GPT-4o × unstructured-dump: Found 3/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | unstructured-dump |

### PASS: Dependencies [GPT-4.1] × unstructured-dump

**Metric:** `7 /7`

GPT-4.1 × unstructured-dump: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | unstructured-dump |

### PASS: Dependencies [Claude Haiku 4.5] × unstructured-dump

**Metric:** `7 /7`

Claude Haiku 4.5 × unstructured-dump: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | unstructured-dump |

### PASS: Dependencies [Gemini 2.5 Flash] × unstructured-dump

**Metric:** `0 /7`

Gemini 2.5 Flash × unstructured-dump: Found 0/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | unstructured-dump |

### PASS: Dependencies [Gemini 3 Flash] × unstructured-dump

**Metric:** `7 /7`

Gemini 3 Flash × unstructured-dump: Found 7/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-dump |

</details>

---

## For Specialists

YON's structural primitives influence AI perception. Models like GPT-4O and Claude Haiku show consistent salience detection with YON. Metrics indicate a perception shift, not noise. YON's @RULE, @MAP, @CHECK features create hierarchies, altering model behavior. Training data asymmetry is crucial; YON lacks historical data, unlike natural language. Known boundary: effect diminishes with unstructured formats.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._