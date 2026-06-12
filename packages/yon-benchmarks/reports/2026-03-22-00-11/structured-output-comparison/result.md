[← Back to Report](../README.md)

# Structured Output Comparison

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T22:12:09.201Z

**Result:** 3/3 passed in 0ms

## What This Test Measures

Tests structured output comparison capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates YON against JSON for structured output. JSON outperforms YON in byte size by -31%. Both formats show parity in escape burden. YON's zero-training baseline limits its performance here.

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

JSON uses 100 bytes; YON uses 821. JSON wins by -31% in byte size. Escape burden is equal, with both at 10 escapes. YON's readability ratio is 4 levels, favoring simpler structures. JSON suits data-rich environments; YON fits low-training contexts. This impacts system design by prioritizing JSON for efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._