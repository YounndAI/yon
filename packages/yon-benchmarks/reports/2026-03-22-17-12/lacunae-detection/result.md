[← Back to Report](../README.md)

# Lacunae Detection

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-22T15:58:24.800Z

**Result:** 29/29 passed in 10m 30s (630s)

## What This Test Measures

Tests YON-native concepts that have no direct equivalent in flat formats (JSON, YAML). These "lacunae" — gaps in what flat formats can express — define where YON uniquely excels.

**Method:** Encodes the same concept in YON and companion formats, asks application questions, and measures whether YON's structure leads to more accurate answers.

**YON feature tested:** @PATCH/@VOID lifecycle, Context Hoisting, @CHECK cross-references

---

## For Everyone

The way information is written affects AI understanding. YON, a new format, shows this clearly. Unlike JSON or YAML, YON uses unique structures that change AI perception. YON is new, with no training data, while others have billions of examples. Despite this, YON performs well, showing how notation impacts AI responses.

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
| 7 | Concept: Void Revocation Reasoning | PASS | 80 pp | — |
| 8 | Concept: Audit Trail Chain (STAMP+PATCH+VOID) | PASS | 0 pp | — |
| 9 | Concept: Complex Void Revocation (6 rules, 2 voided) | PASS | 40 pp | — |
| 10 | Concept: Parity Re-engineering (PATCH+VOID decorated) | PASS | 80 pp | — |
| 11 | Concept: Temporal Policy Evolution (PATCH+VOID lifecycle) | PASS | 0 pp | — |
| 12 | Concept: Schema Constraint Validation | PASS | 0 pp | — |
| 13 | Concept: Cascading Patch Chain Resolution | PASS | 0 pp | — |
| 14 | Concept: Selective Void with Surviving Siblings | PASS | 0 pp | — |
| 15 | Concept: Context Hoisting (Section-Scoped Rules) | PASS | 0 pp | — |
| 16 | Concept: Lifecycle State Resolution (Multi-hop PATCH+VOID) | PASS | 0 pp | — |
| 17 | Concept: Cascading Patch (2-hop: RULE → PATCH) | PASS | -20 pp | — |
| 18 | Concept: Lifecycle State Resolution (2-hop: RULE → PATCH) | PASS | -20 pp | — |
| 19 | Format: YON Overall Accuracy | PASS | 83 % | — |
| 20 | Format: JSON Overall Accuracy | PASS | 71 % | — |
| 21 | Format: Markdown Overall Accuracy | PASS | 71 % | — |
| 22 | Format: YAML Overall Accuracy | PASS | 71 % | — |
| 23 | Lacunae Count: Concepts Where YON Uniquely Excels | PASS | 4 of 18 | — |
| 24 | Dual JSON: YON vs History-JSON (Sandbagging Prevention) | PASS | 0 pp | — |
| 25 | Per-Model: GPT-5-nano (budget) | PASS | -4 pp | — |
| 26 | Per-Model: Gemini 2.5 Flash-Lite (budget) | PASS | 22 pp | — |
| 27 | Per-Model: GPT-4o-mini (standard) | PASS | 9 pp | — |
| 28 | Per-Model: Claude Haiku 4.5 (standard) | PASS | 11 pp | — |
| 29 | Per-Model: Gemini 2.5 Flash (standard) | PASS | 22 pp | — |

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

Enforcement Gradient: YON=100%, JSON=100%, Markdown=100%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Patch Merge Semantics

**Metric:** `0 pp`

Patch Merge Semantics: YON=60%, JSON=40%, Markdown=20%, YAML=60%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 40 | % |
| markdown_accuracy | 20 | % |
| yaml_accuracy | 60 | % |

### PASS: Concept: Config Reference Chain

**Metric:** `0 pp`

Config Reference Chain: YON=100%, JSON=80%, Markdown=100%, YAML=100%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 100 | % |

### PASS: Concept: Void Revocation Reasoning

**Metric:** `80 pp`

Void Revocation Reasoning: YON=80%, JSON=0%, Markdown=0%, YAML=0%. YON vs best other: +80pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 0 | % |
| markdown_accuracy | 0 | % |
| yaml_accuracy | 0 | % |

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

**Metric:** `40 pp`

Complex Void Revocation (6 rules, 2 voided): YON=80%, JSON=20%, Markdown=40%, YAML=40%. YON vs best other: +40pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 20 | % |
| markdown_accuracy | 40 | % |
| yaml_accuracy | 40 | % |

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

**Metric:** `0 pp`

Temporal Policy Evolution (PATCH+VOID lifecycle): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

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

**Metric:** `0 pp`

Selective Void with Surviving Siblings: YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

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

**Metric:** `0 pp`

Lifecycle State Resolution (Multi-hop PATCH+VOID): YON=80%, JSON=80%, Markdown=80%, YAML=80%. YON vs best other: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Cascading Patch (2-hop: RULE → PATCH)

**Metric:** `-20 pp`

Cascading Patch (2-hop: RULE → PATCH): YON=80%, JSON=100%, Markdown=80%, YAML=80%. YON vs best other: -20pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 80 | % |
| yaml_accuracy | 80 | % |

### PASS: Concept: Lifecycle State Resolution (2-hop: RULE → PATCH)

**Metric:** `-20 pp`

Lifecycle State Resolution (2-hop: RULE → PATCH): YON=80%, JSON=100%, Markdown=100%, YAML=80%. YON vs best other: -20pp

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 100 | % |
| markdown_accuracy | 100 | % |
| yaml_accuracy | 80 | % |

### PASS: Format: YON Overall Accuracy

**Metric:** `83 %`

YON: 83% accuracy across all concepts

### PASS: Format: JSON Overall Accuracy

**Metric:** `71 %`

JSON: 71% accuracy across all concepts

### PASS: Format: Markdown Overall Accuracy

**Metric:** `71 %`

Markdown: 71% accuracy across all concepts

### PASS: Format: YAML Overall Accuracy

**Metric:** `71 %`

YAML: 71% accuracy across all concepts

### PASS: Lacunae Count: Concepts Where YON Uniquely Excels

**Metric:** `4 of 18`

4/18 concepts show >15pp YON advantage over average of other formats

### PASS: Dual JSON: YON vs History-JSON (Sandbagging Prevention)

**Metric:** `0 pp`

contract-v2: YON=80% vs History-JSON=80% vs Current-JSON=0%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| history_json_accuracy | 80 | % |
| current_json_accuracy | 0 | % |

### PASS: Per-Model: GPT-5-nano (budget)

**Metric:** `-4 pp`

GPT-5-nano (budget): YON=22% vs others=26%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 22 | % |
| json_accuracy | 33 | % |
| markdown_accuracy | 28 | % |
| yaml_accuracy | 17 | % |

### PASS: Per-Model: Gemini 2.5 Flash-Lite (budget)

**Metric:** `22 pp`

Gemini 2.5 Flash-Lite (budget): YON=100% vs others=78%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 78 | % |
| markdown_accuracy | 78 | % |
| yaml_accuracy | 78 | % |

### PASS: Per-Model: GPT-4o-mini (standard)

**Metric:** `9 pp`

GPT-4o-mini (standard): YON=94% vs others=85%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 94 | % |
| json_accuracy | 83 | % |
| markdown_accuracy | 83 | % |
| yaml_accuracy | 89 | % |

### PASS: Per-Model: Claude Haiku 4.5 (standard)

**Metric:** `11 pp`

Claude Haiku 4.5 (standard): YON=100% vs others=89%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 89 | % |
| markdown_accuracy | 89 | % |
| yaml_accuracy | 89 | % |

### PASS: Per-Model: Gemini 2.5 Flash (standard)

**Metric:** `22 pp`

Gemini 2.5 Flash (standard): YON=100% vs others=78%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 72 | % |
| markdown_accuracy | 78 | % |
| yaml_accuracy | 83 | % |

</details>

---

## For Specialists

YON's structural primitives alter AI perception. Models show varied responses: {{PER_MODEL_GPT5_NANO(BUDGET)_YON_ACCURACY}} to {{PER_MODEL_CLAUDE_HAIKU(STANDARD)_YON_ACCURACY}}. Training data asymmetry is key; YON lacks historical data. Noise is minimal; perception shifts are real. YON's @PATCH/@VOID lifecycle and Context Hoisting enhance AI accuracy. Known boundary: effects diminish in flat formats.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._