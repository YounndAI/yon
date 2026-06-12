[← Back to Report](../README.md)

# Adoption Complexity

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-23T13:38:40.239Z

**Result:** 3/3 passed in 1ms

## What This Test Measures

Tests adoption complexity capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates adoption complexity across formats. YON, JSON, and YAML show similar minimal valid document sizes, each using 6 tokens. However, YON and JSON require fewer lines than YAML. This means YON and JSON offer simpler structures, reducing cognitive load.

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

YON and JSON both use 1 lines for minimal documents, while YAML uses 3. This indicates YON's structural efficiency. YON's adoption starter surface is 4//4, matching JSON's simplicity. Known boundary: YAML's complexity increases with document size. Operational implication: YON's primitives support streamlined design, enhancing cognitive economy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._