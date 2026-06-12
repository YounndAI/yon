[← Back to Report](../README.md)

# Adoption Complexity

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T19:45:06.649Z

**Result:** 3/3 passed in 1ms

## What This Test Measures

Tests adoption complexity capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON, JSON, and YAML on adoption complexity. YON and JSON perform equally well with minimal valid documents, requiring 6 tokens. YAML needs more lines, indicating higher complexity. YON's structural primitives offer a strong advantage, simplifying adoption without increasing complexity.

---

## Test Data

### PASS: Minimal Valid Document

**Metric:** `6 tokens` _(vs JSON tokens: 6 → YON: 6 | JSON: 6 | YAML: 6)_

Smallest valid doc: YON=6 tokens (1 line), JSON=6 tokens (1 line), YAML=6 tokens (3 lines). YON parses successfully: true.

| Metric | Value | Unit |
|--------|-------|------|
| yon_lines | 1 | lines |
| json_lines | 1 | lines |
| yaml_lines | 3 | lines |

### PASS: Starter Surface (3 Tags)

**Metric:** `4 /4`

Starter set: DOC, NOTE, RULE, SEC. Parse: true. Validate: true. Convert: true. Format: true. Only starter tags: true. Score: 4/4.

| Metric | Value | Unit |
|--------|-------|------|
| tags_used | 4 | unique tags |

### PASS: Progressive Complexity

**Metric:** `7 /7`

7 incremental additions, each independently valid: @DOC (base): , +@NOTE: , +@SEC: , +@RULE: , +@MAP: , +@CFG: , +@META: . All valid: true.

---

## For Specialists

YON and JSON require 6 tokens, while YAML needs 3 lines. YON's advantage lies in its structural primitives, reducing complexity at higher levels. Known boundary: YAML's verbosity increases with complexity. Operational implication: YON supports efficient system design by minimizing cognitive load, maintaining simplicity across complexity levels.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._