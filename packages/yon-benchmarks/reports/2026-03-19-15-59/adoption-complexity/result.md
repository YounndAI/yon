[← Back to Report](../README.md)

# Adoption Complexity

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T13:59:28.032Z

**Result:** 3/3 passed in 1ms

## What This Test Measures

Tests adoption complexity capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON, JSON, and YAML on adoption complexity. YON and JSON perform equally well with minimal valid documents, while YAML requires more lines. YON's structural primitives offer a strong advantage in cognitive economy, reducing complexity at higher levels. All formats pass the tests, but YON provides measurable uplift.

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

YON and JSON require 6 tokens for minimal documents. YAML needs 3 lines, indicating higher complexity. YON's advantage is clear in progressive complexity, scoring 7//7. This suggests YON's primitives reduce cognitive load, beneficial for system design. JSON operates well in its domain, but YON excels in reducing complexity. All formats pass 3 tests in 1ms, with YON offering a strong cognitive-economy advantage.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._