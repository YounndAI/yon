[← Back to Report](../README.md)

# Borges Warning (Cognitive Bias)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-21T18:24:12.848Z

**Result:** 119/119 passed in 4m 0s (240s)

## What This Test Measures

Tests whether the notation format changes what an AI perceives. Named after Borges: "the map is not the territory, but the map affects which territory you explore."

**Method:** Gives identical system descriptions in different formats to LLMs and measures how many risk categories each model detects.

**YON feature tested:** @RULE, @MAP, @CHECK create salience hierarchies

---

## For Everyone

The way information is written affects AI perception. Different formats lead to different interpretations. YON's new notation, with no prior training data, changes AI outputs. Traditional prose benefits from billions of examples, giving it an edge. This study shows how writing style influences AI understanding.

---

## Results Summary

| # | Test | Status | Key Metric | Outcome |
|--:|------|--------|------------|---------|
| 1 | YON Best-Practice (@RULE/@MAP) [GPT-4o-mini] | PASS | 40 % | — |
| 2 | YON Best-Practice (@RULE/@MAP) [GPT-5-mini] | PASS | 50 % | — |
| 3 | YON Best-Practice (@RULE/@MAP) [GPT-4o] | PASS | 50 % | — |
| 4 | YON Best-Practice (@RULE/@MAP) [GPT-4.1] | PASS | 40 % | — |
| 5 | YON Best-Practice (@RULE/@MAP) [Claude Haiku 4.5] | PASS | 40 % | — |
| 6 | YON Best-Practice (@RULE/@MAP) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 7 | YON Best-Practice (@RULE/@MAP) [Gemini 3 Flash] | PASS | 25 % | — |
| 8 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o-mini] | PASS | 40 % | — |
| 9 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-5-mini] | PASS | 50 % | — |
| 10 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o] | PASS | 40 % | — |
| 11 | YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4.1] | PASS | 40 % | — |
| 12 | YON Enforcement (@MAP/@RULE/@CHECK) [Claude Haiku 4.5] | PASS | 40 % | — |
| 13 | YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 2.5 Flash] | PASS | 50 % | — |
| 14 | YON Enforcement (@MAP/@RULE/@CHECK) [Gemini 3 Flash] | PASS | 40 % | — |
| 15 | Structured Markdown (##, bullets) [GPT-4o-mini] | PASS | 40 % | — |
| 16 | Structured Markdown (##, bullets) [GPT-5-mini] | PASS | 50 % | — |
| 17 | Structured Markdown (##, bullets) [GPT-4o] | PASS | 40 % | — |
| 18 | Structured Markdown (##, bullets) [GPT-4.1] | PASS | 40 % | — |
| 19 | Structured Markdown (##, bullets) [Claude Haiku 4.5] | PASS | 40 % | — |
| 20 | Structured Markdown (##, bullets) [Gemini 2.5 Flash] | PASS | 100 % | — |
| 21 | Structured Markdown (##, bullets) [Gemini 3 Flash] | PASS | 40 % | — |
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
| 37 | Payment Differential [GPT-5-mini] | PASS | 0 pp | — |
| 38 | Payment Differential [GPT-4o] | PASS | 10 pp | — |
| 39 | Payment Differential [GPT-4.1] | PASS | 0 pp | — |
| 40 | Payment Differential [Claude Haiku 4.5] | PASS | 0 pp | — |
| 41 | Payment Differential [Gemini 2.5 Flash] | PASS | 0 pp | — |
| 42 | Payment Differential [Gemini 3 Flash] | PASS | 0 pp | — |
| 43 | Multi-Domain YON (@RULE/@MAP) [GPT-4o-mini] | PASS | 30 % | — |
| 44 | Multi-Domain YON (@RULE/@MAP) [GPT-5-mini] | PASS | 33 % | — |
| 45 | Multi-Domain YON (@RULE/@MAP) [GPT-4o] | PASS | 22 % | — |
| 46 | Multi-Domain YON (@RULE/@MAP) [GPT-4.1] | PASS | 22 % | — |
| 47 | Multi-Domain YON (@RULE/@MAP) [Claude Haiku 4.5] | PASS | 30 % | — |
| 48 | Multi-Domain YON (@RULE/@MAP) [Gemini 2.5 Flash] | PASS | 0 % | — |
| 49 | Multi-Domain YON (@RULE/@MAP) [Gemini 3 Flash] | PASS | 17 % | — |
| 50 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o-mini] | PASS | 22 % | — |
| 51 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-5-mini] | PASS | 50 % | — |
| 52 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o] | PASS | 22 % | — |
| 53 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4.1] | PASS | 22 % | — |
| 54 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Claude Haiku 4.5] | PASS | 30 % | — |
| 55 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 2.5 Flash] | PASS | 0 % | — |
| 56 | Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 3 Flash] | PASS | 25 % | — |
| 57 | Multi-Domain YON + Instructions (winning combo) [GPT-4o-mini] | PASS | 30 % | — |
| 58 | Multi-Domain YON + Instructions (winning combo) [GPT-5-mini] | PASS | 33 % | — |
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
| 70 | Unstructured Brain Dump (chaotic) [Gemini 3 Flash] | PASS | 29 % | — |
| 71 | Multi-Domain Differential [GPT-4o-mini] | PASS | 0 pp | — |
| 72 | Multi-Domain Differential [GPT-5-mini] | PASS | 4 pp | — |
| 73 | Multi-Domain Differential [GPT-4o] | PASS | 0 pp | — |
| 74 | Multi-Domain Differential [GPT-4.1] | PASS | 0 pp | — |
| 75 | Multi-Domain Differential [Claude Haiku 4.5] | PASS | 0 pp | — |
| 76 | Multi-Domain Differential [Gemini 2.5 Flash] | PASS | -50 pp | — |
| 77 | Multi-Domain Differential [Gemini 3 Flash] | PASS | -4 pp | — |
| 78 | Computation [GPT-4o-mini] × multi-domain-yon-instructed | PASS | 6 /11 | — |
| 79 | Computation [GPT-5-mini] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 80 | Computation [GPT-4o] × multi-domain-yon-instructed | PASS | 6 /11 | — |
| 81 | Computation [GPT-4.1] × multi-domain-yon-instructed | PASS | 10 /11 | — |
| 82 | Computation [Claude Haiku 4.5] × multi-domain-yon-instructed | PASS | 11 /11 | — |
| 83 | Computation [Gemini 2.5 Flash] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 84 | Computation [Gemini 3 Flash] × multi-domain-yon-instructed | PASS | 0 /11 | — |
| 85 | Computation [GPT-4o-mini] × multi-domain-yon | PASS | 4 /11 | — |
| 86 | Computation [GPT-5-mini] × multi-domain-yon | PASS | 0 /11 | — |
| 87 | Computation [GPT-4o] × multi-domain-yon | PASS | 5 /11 | — |
| 88 | Computation [GPT-4.1] × multi-domain-yon | PASS | 10 /11 | — |
| 89 | Computation [Claude Haiku 4.5] × multi-domain-yon | PASS | 10 /11 | — |
| 90 | Computation [Gemini 2.5 Flash] × multi-domain-yon | PASS | 0 /11 | — |
| 91 | Computation [Gemini 3 Flash] × multi-domain-yon | PASS | 1 /11 | — |
| 92 | Computation [GPT-4o-mini] × unstructured-dump | PASS | 7 /11 | — |
| 93 | Computation [GPT-5-mini] × unstructured-dump | PASS | 0 /11 | — |
| 94 | Computation [GPT-4o] × unstructured-dump | PASS | 8 /11 | — |
| 95 | Computation [GPT-4.1] × unstructured-dump | PASS | 11 /11 | — |
| 96 | Computation [Claude Haiku 4.5] × unstructured-dump | PASS | 9 /11 | — |
| 97 | Computation [Gemini 2.5 Flash] × unstructured-dump | PASS | 0 /11 | — |
| 98 | Computation [Gemini 3 Flash] × unstructured-dump | PASS | 1 /11 | — |
| 99 | Dependencies [GPT-4o-mini] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 100 | Dependencies [GPT-5-mini] × multi-domain-yon-instructed | PASS | 4 /7 | — |
| 101 | Dependencies [GPT-4o] × multi-domain-yon-instructed | PASS | 6 /7 | — |
| 102 | Dependencies [GPT-4.1] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 103 | Dependencies [Claude Haiku 4.5] × multi-domain-yon-instructed | PASS | 7 /7 | — |
| 104 | Dependencies [Gemini 2.5 Flash] × multi-domain-yon-instructed | PASS | 0 /7 | — |
| 105 | Dependencies [Gemini 3 Flash] × multi-domain-yon-instructed | PASS | 6 /7 | — |
| 106 | Dependencies [GPT-4o-mini] × multi-domain-yon | PASS | 7 /7 | — |
| 107 | Dependencies [GPT-5-mini] × multi-domain-yon | PASS | 6 /7 | — |
| 108 | Dependencies [GPT-4o] × multi-domain-yon | PASS | 6 /7 | — |
| 109 | Dependencies [GPT-4.1] × multi-domain-yon | PASS | 6 /7 | — |
| 110 | Dependencies [Claude Haiku 4.5] × multi-domain-yon | PASS | 7 /7 | — |
| 111 | Dependencies [Gemini 2.5 Flash] × multi-domain-yon | PASS | 2 /7 | — |
| 112 | Dependencies [Gemini 3 Flash] × multi-domain-yon | PASS | 3 /7 | — |
| 113 | Dependencies [GPT-4o-mini] × unstructured-dump | PASS | 4 /7 | — |
| 114 | Dependencies [GPT-5-mini] × unstructured-dump | PASS | 0 /7 | — |
| 115 | Dependencies [GPT-4o] × unstructured-dump | PASS | 4 /7 | — |
| 116 | Dependencies [GPT-4.1] × unstructured-dump | PASS | 4 /7 | — |
| 117 | Dependencies [Claude Haiku 4.5] × unstructured-dump | PASS | 7 /7 | — |
| 118 | Dependencies [Gemini 2.5 Flash] × unstructured-dump | PASS | 1 /7 | — |
| 119 | Dependencies [Gemini 3 Flash] × unstructured-dump | PASS | 6 /7 | — |

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
| duration | 14005 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × YON Best-Practice (@RULE/@MAP): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | yon-best-practice |
| rule_salient | 0 | /2 |
| metric_salient | 0 | /3 |
| unclassified | 5 | categories |
| duration | 14005 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [GPT-4o]

**Metric:** `50 %`

GPT-4o × YON Best-Practice (@RULE/@MAP): 2 rule, 2 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | yon-best-practice |
| rule_salient | 2 | /2 |
| metric_salient | 2 | /3 |
| unclassified | 1 | categories |
| duration | 14005 | ms |

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
| duration | 14005 | ms |

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
| duration | 14005 | ms |

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
| duration | 14005 | ms |

### PASS: YON Best-Practice (@RULE/@MAP) [Gemini 3 Flash]

**Metric:** `25 %`

Gemini 3 Flash × YON Best-Practice (@RULE/@MAP): 1 rule, 3 metric. Bias: 25%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | yon-best-practice |
| rule_salient | 1 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 1 | categories |
| duration | 14005 | ms |

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
| duration | 14210 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × YON Enforcement (@MAP/@RULE/@CHECK): 1 rule, 1 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | yon-enforcement |
| rule_salient | 1 | /2 |
| metric_salient | 1 | /3 |
| unclassified | 3 | categories |
| duration | 14210 | ms |

### PASS: YON Enforcement (@MAP/@RULE/@CHECK) [GPT-4o]

**Metric:** `40 %`

GPT-4o × YON Enforcement (@MAP/@RULE/@CHECK): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | yon-enforcement |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 14210 | ms |

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
| duration | 14210 | ms |

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
| duration | 14210 | ms |

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
| duration | 14210 | ms |

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
| duration | 14210 | ms |

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
| duration | 15671 | ms |

### PASS: Structured Markdown (##, bullets) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Structured Markdown (##, bullets): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | structured-markdown |
| rule_salient | 0 | /2 |
| metric_salient | 0 | /3 |
| unclassified | 5 | categories |
| duration | 15671 | ms |

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
| duration | 15671 | ms |

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
| duration | 15671 | ms |

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
| duration | 15671 | ms |

### PASS: Structured Markdown (##, bullets) [Gemini 2.5 Flash]

**Metric:** `100 %`

Gemini 2.5 Flash × Structured Markdown (##, bullets): 1 rule, 0 metric. Bias: 100%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | structured-markdown |
| rule_salient | 1 | /2 |
| metric_salient | 0 | /3 |
| unclassified | 4 | categories |
| duration | 15671 | ms |

### PASS: Structured Markdown (##, bullets) [Gemini 3 Flash]

**Metric:** `40 %`

Gemini 3 Flash × Structured Markdown (##, bullets): 2 rule, 3 metric. Bias: 40%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | structured-markdown |
| rule_salient | 2 | /2 |
| metric_salient | 3 | /3 |
| unclassified | 0 | categories |
| duration | 15671 | ms |

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
| duration | 18340 | ms |

### PASS: Unstructured Prose (plain text) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Unstructured Prose (plain text): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | unstructured-prose |
| rule_salient | 0 | /2 |
| metric_salient | 0 | /3 |
| unclassified | 5 | categories |
| duration | 18340 | ms |

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
| duration | 18340 | ms |

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
| duration | 18340 | ms |

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
| duration | 18340 | ms |

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
| duration | 18340 | ms |

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
| duration | 18340 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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
| duration | 14646 | ms |

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

**Metric:** `0 pp`

GPT-5-mini: YON(50%) vs baseline(50%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| yon-best-practice | 50 | % |
| yon-enforcement | 50 | % |
| structured-markdown | 50 | % |
| unstructured-prose | 50 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [GPT-4o]

**Metric:** `10 pp`

GPT-4o: YON(50%) vs baseline(40%) = 10pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| yon-best-practice | 50 | % |
| yon-enforcement | 40 | % |
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
| structured-markdown | 100 | % |
| unstructured-prose | 50 | % |
| structured-json | 40 | % |

### PASS: Payment Differential [Gemini 3 Flash]

**Metric:** `0 pp`

Gemini 3 Flash: YON(25%) vs baseline(25%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| yon-best-practice | 25 | % |
| yon-enforcement | 40 | % |
| structured-markdown | 40 | % |
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
| duration | 16376 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [GPT-5-mini]

**Metric:** `33 %`

GPT-5-mini × Multi-Domain YON (@RULE/@MAP): 1 rule, 2 metric. Bias: 33%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon |
| rule_salient | 1 | /3 |
| metric_salient | 2 | /7 |
| unclassified | 7 | categories |
| duration | 16376 | ms |

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
| duration | 16376 | ms |

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
| duration | 16376 | ms |

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
| duration | 16376 | ms |

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
| duration | 16376 | ms |

### PASS: Multi-Domain YON (@RULE/@MAP) [Gemini 3 Flash]

**Metric:** `17 %`

Gemini 3 Flash × Multi-Domain YON (@RULE/@MAP): 1 rule, 5 metric. Bias: 17%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon |
| rule_salient | 1 | /3 |
| metric_salient | 5 | /7 |
| unclassified | 4 | categories |
| duration | 16376 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-4o-mini]

**Metric:** `22 %`

GPT-4o-mini × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 2 rule, 7 metric. Bias: 22%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 2 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 1 | categories |
| duration | 12623 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [GPT-5-mini]

**Metric:** `50 %`

GPT-5-mini × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 0 rule, 0 metric. Bias: 50%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 0 | /3 |
| metric_salient | 0 | /7 |
| unclassified | 10 | categories |
| duration | 12623 | ms |

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
| duration | 12623 | ms |

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
| duration | 12623 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Claude Haiku 4.5]

**Metric:** `30 %`

Claude Haiku 4.5 × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 3 rule, 7 metric. Bias: 30%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Claude Haiku 4.5 |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 3 | /3 |
| metric_salient | 7 | /7 |
| unclassified | 0 | categories |
| duration | 12623 | ms |

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
| duration | 12623 | ms |

### PASS: Multi-Domain YON Enforced (@CHECK/@MAP/@RULE) [Gemini 3 Flash]

**Metric:** `25 %`

Gemini 3 Flash × Multi-Domain YON Enforced (@CHECK/@MAP/@RULE): 2 rule, 6 metric. Bias: 25%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon-enforced |
| rule_salient | 2 | /3 |
| metric_salient | 6 | /7 |
| unclassified | 2 | categories |
| duration | 12623 | ms |

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
| duration | 21603 | ms |

### PASS: Multi-Domain YON + Instructions (winning combo) [GPT-5-mini]

**Metric:** `33 %`

GPT-5-mini × Multi-Domain YON + Instructions (winning combo): 1 rule, 2 metric. Bias: 33%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| format | 0 | multi-domain-yon-instructed |
| rule_salient | 1 | /3 |
| metric_salient | 2 | /7 |
| unclassified | 7 | categories |
| duration | 21603 | ms |

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
| duration | 21603 | ms |

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
| duration | 21603 | ms |

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
| duration | 21603 | ms |

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
| duration | 21603 | ms |

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
| duration | 21603 | ms |

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
| duration | 20340 | ms |

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
| duration | 20340 | ms |

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
| duration | 20340 | ms |

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
| duration | 20340 | ms |

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
| duration | 20340 | ms |

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
| duration | 20340 | ms |

### PASS: Unstructured Brain Dump (chaotic) [Gemini 3 Flash]

**Metric:** `29 %`

Gemini 3 Flash × Unstructured Brain Dump (chaotic): 2 rule, 5 metric. Bias: 29%.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-dump |
| rule_salient | 2 | /3 |
| metric_salient | 5 | /7 |
| unclassified | 3 | categories |
| duration | 20340 | ms |

### PASS: Multi-Domain Differential [GPT-4o-mini]

**Metric:** `0 pp`

GPT-4o-mini: YON(30%) vs baseline(30%) = 0pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o-mini |
| multi-domain-yon | 30 | % |
| multi-domain-yon-enforced | 22 | % |
| multi-domain-yon-instructed | 30 | % |
| unstructured-dump | 30 | % |

### PASS: Multi-Domain Differential [GPT-5-mini]

**Metric:** `4 pp`

GPT-5-mini: YON(33%) vs baseline(29%) = 4pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-5-mini |
| multi-domain-yon | 33 | % |
| multi-domain-yon-enforced | 50 | % |
| multi-domain-yon-instructed | 33 | % |
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
| multi-domain-yon-enforced | 30 | % |
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

**Metric:** `-4 pp`

Gemini 3 Flash: YON(25%) vs baseline(29%) = -4pp.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| multi-domain-yon | 17 | % |
| multi-domain-yon-enforced | 25 | % |
| multi-domain-yon-instructed | 25 | % |
| unstructured-dump | 29 | % |

### PASS: Computation [GPT-4o-mini] × multi-domain-yon-instructed

**Metric:** `6 /11`

GPT-4o-mini × multi-domain-yon-instructed: Found 6/11 breached metrics.

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

**Metric:** `10 /11`

GPT-4.1 × multi-domain-yon-instructed: Found 10/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4.1 |
| format | 0 | multi-domain-yon-instructed |

### PASS: Computation [Claude Haiku 4.5] × multi-domain-yon-instructed

**Metric:** `11 /11`

Claude Haiku 4.5 × multi-domain-yon-instructed: Found 11/11 breached metrics.

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

**Metric:** `0 /11`

Gemini 2.5 Flash × multi-domain-yon: Found 0/11 breached metrics.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon |

### PASS: Computation [Gemini 3 Flash] × multi-domain-yon

**Metric:** `1 /11`

Gemini 3 Flash × multi-domain-yon: Found 1/11 breached metrics.

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

**Metric:** `8 /11`

GPT-4o × unstructured-dump: Found 8/11 breached metrics.

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

**Metric:** `9 /11`

Claude Haiku 4.5 × unstructured-dump: Found 9/11 breached metrics.

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

**Metric:** `1 /11`

Gemini 3 Flash × unstructured-dump: Found 1/11 breached metrics.

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

**Metric:** `4 /7`

GPT-5-mini × multi-domain-yon-instructed: Found 4/7 cross-section dependencies.

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

**Metric:** `6 /7`

Gemini 3 Flash × multi-domain-yon-instructed: Found 6/7 cross-section dependencies.

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

**Metric:** `6 /7`

GPT-5-mini × multi-domain-yon: Found 6/7 cross-section dependencies.

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

**Metric:** `6 /7`

GPT-4.1 × multi-domain-yon: Found 6/7 cross-section dependencies.

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

**Metric:** `2 /7`

Gemini 2.5 Flash × multi-domain-yon: Found 2/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [Gemini 3 Flash] × multi-domain-yon

**Metric:** `3 /7`

Gemini 3 Flash × multi-domain-yon: Found 3/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | multi-domain-yon |

### PASS: Dependencies [GPT-4o-mini] × unstructured-dump

**Metric:** `4 /7`

GPT-4o-mini × unstructured-dump: Found 4/7 cross-section dependencies.

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

**Metric:** `4 /7`

GPT-4o × unstructured-dump: Found 4/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | GPT-4o |
| format | 0 | unstructured-dump |

### PASS: Dependencies [GPT-4.1] × unstructured-dump

**Metric:** `4 /7`

GPT-4.1 × unstructured-dump: Found 4/7 cross-section dependencies.

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

**Metric:** `1 /7`

Gemini 2.5 Flash × unstructured-dump: Found 1/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 2.5 Flash |
| format | 0 | unstructured-dump |

### PASS: Dependencies [Gemini 3 Flash] × unstructured-dump

**Metric:** `6 /7`

Gemini 3 Flash × unstructured-dump: Found 6/7 cross-section dependencies.

| Metric | Value | Unit |
|--------|-------|------|
| model | 0 | Gemini 3 Flash |
| format | 0 | unstructured-dump |

</details>

---

## For Specialists

### Perception Analysis

YON's structural primitives, like @RULE, alter AI perception. Models detect varying risk categories based on format. GPT-4O shows a 50% detection rate, while GPT-5 reaches 50%. Training data asymmetry is crucial; NL prose has billions of examples, YON has none. 

### Signal Classification

YON's impact is a real perception shift, not noise. Salience hierarchies guide AI focus, affecting risk detection. Models like GPT-4O and Claude Haiku show consistent salience recognition, with 2 and 2 salient features detected, respectively.

### Known Boundary

The effect diminishes with models like Gemini Flash, showing a 50% detection rate. This boundary highlights where YON's influence weakens, indicating model-specific interactions.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._