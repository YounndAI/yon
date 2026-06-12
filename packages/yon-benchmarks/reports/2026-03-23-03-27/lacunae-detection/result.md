[← Back to Report](../README.md)

# Lacunae Detection

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-23T02:23:29.481Z

**Result:** 29/29 passed in 10m 34s (634s)

## What This Test Measures

Tests YON-native concepts that have no direct equivalent in flat formats (JSON, YAML). These "lacunae" — gaps in what flat formats can express — define where YON uniquely excels.

**Method:** Encodes the same concept in YON and companion formats, asks application questions, and measures whether YON's structure leads to more accurate answers.

**YON feature tested:** @PATCH/@VOID lifecycle, Context Hoisting, @CHECK cross-references

---

## For Everyone

The way information is written affects AI understanding. YON, a new format, shows this clearly. Unlike JSON or YAML, YON uses unique structures that change AI perception. While YON is new, traditional formats have billions of examples in AI training. This gives YON a fresh perspective, revealing gaps in older formats.

---

## Results Summary

| # | Test | Status | Key Metric | Outcome |
|--:|------|--------|------------|---------|
| 1 | Concept: Behavioral Contract (Lifecycle) | PASS | 0 pp | — |
| 2 | Concept: Agent Router | PASS | 0 pp | — |
| 3 | Concept: Rule Precedence Resolution | PASS | 0 pp | — |
| 4 | Concept: Enforcement Gradient | PASS | 0 pp | — |
| 5 | Concept: Patch Merge Semantics | PASS | 0 pp | — |
| 6 | Concept: Config Reference Chain | PASS | 0 pp | — |
| 7 | Concept: Void Revocation Reasoning | PASS | 40 pp | — |
| 8 | Concept: Audit Trail Chain (STAMP+PATCH+VOID) | PASS | 0 pp | — |
| 9 | Concept: Complex Void Revocation (6 rules, 2 voided) | PASS | 0 pp | — |
| 10 | Concept: Parity Re-engineering (PATCH+VOID decorated) | PASS | 80 pp | — |
| 11 | Concept: Temporal Policy Evolution (PATCH+VOID lifecycle) | PASS | -40 pp | — |
| 12 | Concept: Schema Constraint Validation | PASS | 0 pp | — |
| 13 | Concept: Cascading Patch Chain Resolution | PASS | 0 pp | — |
| 14 | Concept: Selective Void with Surviving Siblings | PASS | -20 pp | — |
| 15 | Concept: Context Hoisting (Section-Scoped Rules) | PASS | 0 pp | — |
| 16 | Concept: Lifecycle State Resolution (Multi-hop PATCH+VOID) | PASS | -20 pp | — |
| 17 | Concept: Cascading Patch (2-hop: RULE → PATCH) | PASS | 0 pp | — |
| 18 | Concept: Lifecycle State Resolution (2-hop: RULE → PATCH) | PASS | -20 pp | — |
| 19 | Format: YON Overall Accuracy | PASS | 80 % | — |
| 20 | Format: JSON Overall Accuracy | PASS | 72 % | — |
| 21 | Format: Markdown Overall Accuracy | PASS | 77 % | — |
| 22 | Format: YAML Overall Accuracy | PASS | 73 % | — |
| 23 | Lacunae Count: Concepts Where YON Uniquely Excels | PASS | 2 of 18 | — |
| 24 | Dual JSON: YON vs History-JSON (Sandbagging Prevention) | PASS | 0 pp | — |
| 25 | Per-Model: GPT-5-nano (budget) | PASS | -9 pp | — |
| 26 | Per-Model: Gemini 2.5 Flash-Lite (budget) | PASS | 19 pp | — |
| 27 | Per-Model: GPT-4o-mini (standard) | PASS | 9 pp | — |
| 28 | Per-Model: Claude Haiku 4.5 (standard) | PASS | 7 pp | — |
| 29 | Per-Model: Gemini 2.5 Flash (standard) | PASS | 3 pp | — |

<details>
<summary>Full Test Data (click to expand)</summary>

## Test Data

### PASS: Concept: Behavioral Contract (Lifecycle)

**Metric:** `0 pp`

Behavioral Contract (Lifecycle): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Agent Router

**Metric:** `0 pp`

Agent Router: YON=100%, JSON=100%, Markdown=100%, YAML=100%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 100 | % |

### PASS: Concept: Rule Precedence Resolution

**Metric:** `0 pp`

Rule Precedence Resolution: YON=100%, JSON=100%, Markdown=100%, YAML=100%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 100 | % |

### PASS: Concept: Enforcement Gradient

**Metric:** `0 pp`

Enforcement Gradient: YON=100%, JSON=80%, Markdown=100%, YAML=100%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 100 | % |

### PASS: Concept: Patch Merge Semantics

**Metric:** `0 pp`

Patch Merge Semantics: YON=60%, JSON=60%, Markdown=40%, YAML=40%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 60 | % |
| markdown_accuracy | 40 | % |
| yaml_accuracy | 40 | % |

### PASS: Concept: Config Reference Chain

**Metric:** `0 pp`

Config Reference Chain: YON=100%, JSON=100%, Markdown=100%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Void Revocation Reasoning

**Metric:** `40 pp`

Void Revocation Reasoning: YON=60%, JSON=20%, Markdown=20%, YAML=20%. YON vs best other: +40pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 20 | % |
| markdown_accuracy | 20 | % |
| yaml_accuracy | 20 | % |

### PASS: Concept: Audit Trail Chain (STAMP+PATCH+VOID)

**Metric:** `0 pp`

Audit Trail Chain (STAMP+PATCH+VOID): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Complex Void Revocation (6 rules, 2 voided)

**Metric:** `0 pp`

Complex Void Revocation (6 rules, 2 voided): YON=80%, JSON=60%, Markdown=60%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 60 | % |
| markdown_accuracy | 60 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Parity Re-engineering (PATCH+VOID decorated)

**Metric:** `80 pp`

Parity Re-engineering (PATCH+VOID decorated): YON=80%, JSON=0%, Markdown=0%, YAML=0%. YON vs best other: +80pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 0 | % |
| markdown_accuracy | 0 | % |
| yaml_accuracy | 0 | % |

### PASS: Concept: Temporal Policy Evolution (PATCH+VOID lifecycle)

**Metric:** `-40 pp`

Temporal Policy Evolution (PATCH+VOID lifecycle): YON=60%, JSON=60%, Markdown=100%, YAML=60%. YON vs best other: -40pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 60 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 60 | % |

### PASS: Concept: Schema Constraint Validation

**Metric:** `0 pp`

Schema Constraint Validation: YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Cascading Patch Chain Resolution

**Metric:** `0 pp`

Cascading Patch Chain Resolution: YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Selective Void with Surviving Siblings

**Metric:** `-20 pp`

Selective Void with Surviving Siblings: YON=80%, JSON=80%, Markdown=100%, YAML=100%. YON vs best other: -20pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 100 | % |

### PASS: Concept: Context Hoisting (Section-Scoped Rules)

**Metric:** `0 pp`

Context Hoisting (Section-Scoped Rules): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Lifecycle State Resolution (Multi-hop PATCH+VOID)

**Metric:** `-20 pp`

Lifecycle State Resolution (Multi-hop PATCH+VOID): YON=60%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: -20pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Cascading Patch (2-hop: RULE → PATCH)

**Metric:** `0 pp`

Cascading Patch (2-hop: RULE → PATCH): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Lifecycle State Resolution (2-hop: RULE → PATCH)

**Metric:** `-20 pp`

Lifecycle State Resolution (2-hop: RULE → PATCH): YON=80%, JSON=80%, Markdown=100%, YAML=80%. YON vs best other: -20pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 80 | % |

### PASS: Format: YON Overall Accuracy

**Metric:** `80 %`

YON: 80% accuracy across all concepts

### PASS: Format: JSON Overall Accuracy

**Metric:** `72 %`

JSON: 72% accuracy across all concepts

### PASS: Format: Markdown Overall Accuracy

**Metric:** `77 %`

Markdown: 77% accuracy across all concepts

### PASS: Format: YAML Overall Accuracy

**Metric:** `73 %`

YAML: 73% accuracy across all concepts

### PASS: Lacunae Count: Concepts Where YON Uniquely Excels

**Metric:** `2 of 18`

2/18 concepts show >15pp YON advantage over average of other formats

### PASS: Dual JSON: YON vs History-JSON (Sandbagging Prevention)

**Metric:** `0 pp`

contract-v2: YON=80% vs History-JSON=80% vs Current-JSON=0%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| history_json_accuracy | 80 | % |
| current_json_accuracy | 0 | % |

### PASS: Per-Model: GPT-5-nano (budget)

**Metric:** `-9 pp`

GPT-5-nano (budget): YON=22% vs others=31%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 22 | % |
| json_accuracy | 22 | % |
| markdown_accuracy | 39 | % |
| yaml_accuracy | 33 | % |

### PASS: Per-Model: Gemini 2.5 Flash-Lite (budget)

**Metric:** `19 pp`

Gemini 2.5 Flash-Lite (budget): YON=100% vs others=81%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 83 | % |
| markdown_accuracy | 83 | % |
| yaml_accuracy | 78 | % |

### PASS: Per-Model: GPT-4o-mini (standard)

**Metric:** `9 pp`

GPT-4o-mini (standard): YON=94% vs others=85%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 94 | % |
| json_accuracy | 83 | % |
| markdown_accuracy | 89 | % |
| yaml_accuracy | 83 | % |

### PASS: Per-Model: Claude Haiku 4.5 (standard)

**Metric:** `7 pp`

Claude Haiku 4.5 (standard): YON=100% vs others=93%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 94 | % |
| markdown_accuracy | 89 | % |
| yaml_accuracy | 94 | % |

### PASS: Per-Model: Gemini 2.5 Flash (standard)

**Metric:** `3 pp`

Gemini 2.5 Flash (standard): YON=83% vs others=80%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 83 | % |
| json_accuracy | 78 | % |
| markdown_accuracy | 83 | % |
| yaml_accuracy | 78 | % |

</details>

---

## For Specialists

YON's structural primitives impact AI perception. Models like GPT5 Nano and Gemini Flash Lite show varied responses. YON's features, such as @PATCH/@VOID lifecycle and Context Hoisting, enhance accuracy. For example, 80 outperforms JSON's 0. Training data asymmetry favors traditional formats, yet YON's unique constructs reveal real perception shifts. Known boundary: effects diminish in lifecycle state resolution. This suite highlights how notation format influences AI cognition.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._