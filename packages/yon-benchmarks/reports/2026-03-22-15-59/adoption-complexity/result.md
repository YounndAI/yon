[← Back to Report](../README.md)

# Adoption Complexity

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-22T13:59:24.813Z

**Result:** 3/3 passed in 1ms

## What This Test Measures

Tests adoption complexity capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON, JSON, and YAML on adoption complexity. YON and JSON perform equally well with minimal valid documents, while YAML requires more lines. YON's structural primitives offer a strong advantage in cognitive economy, reducing complexity at higher levels. Known boundary: YAML's verbosity in minimal cases.

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

YON and JSON both require 6 tokens for minimal documents, while YAML needs 3 lines. YON's advantage emerges in progressive complexity, scoring 7//7. Known boundary: YAML's verbosity limits efficiency in simple cases. Operational implication: YON's primitives enhance system design by reducing cognitive load, especially in complex scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._