[← Back to Report](../README.md)

# Structured Output Comparison

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-23T13:38:40.312Z

**Result:** 3/3 passed in 0ms

## What This Test Measures

Tests structured output comparison capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates YON against JSON. YON shows weakness in byte size, with a delta of -31%. Escape burden is equivalent, showing no advantage. YON's zero-training baseline limits performance in this domain.

---

## Test Data

### PASS: Structured Output — Byte Size Comparison [Advantage]

**Metric:** `69 %` _(vs JSON size: 100 → -31%)_

Equivalent structured output: YON 821 bytes vs JSON 1197 bytes (69%). YON includes embedded code without escaping; JSON requires escape sequences.

| Metric | Value | Unit |
|--------|-------|------|
| yon_bytes | 821 | bytes |
| json_bytes | 1197 | bytes |

### PASS: Structured Output — Escape Burden [Advantage]

**Metric:** `10 escapes` _(vs JSON escapes: 10 → −10)_

JSON required 10 escape sequences for embedded code and quotes. YON required 0 — @BEGIN/@END blocks embed foreign content without transformation.

| Metric | Value | Unit |
|--------|-------|------|
| yon_escapes | 0 | escapes |
| json_escapes | 10 | escapes |

### PASS: Structured Output — Readability (Lines vs Depth) [Advantage]

**Metric:** `4 levels`

YON: 18 lines, max depth 1. JSON: 47 lines, max depth 5. Flat structure is easier to scan, grep, and stream.

| Metric | Value | Unit |
|--------|-------|------|
| yon_lines | 18 | lines |
| json_lines | 47 | lines |
| yon_max_depth | 1 | levels |
| json_max_depth | 5 | levels |

---

## For Specialists

YON's byte size is 821 bytes, compared to JSON's 1197. The delta is -31%, indicating JSON's efficiency. Escape burden is equal, with both at 0 escapes. YON's readability ratio is 4 levels, with a max depth of 1. JSON reaches 5. YON operates best without training data, limiting its scope. JSON's advantage suggests better fit for structured data tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._