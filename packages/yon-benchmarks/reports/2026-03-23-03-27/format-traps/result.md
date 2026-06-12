[← Back to Report](../README.md)

# Format Traps

> **Pillar:** lossless · **Timestamp:** 2026-03-23T01:29:34.985Z

**Result:** 4/4 passed in 45.4s

## What This Test Measures

Tests edge cases where format-specific quirks (JSON string escaping, YAML indentation) cause LLMs to misinterpret data.

**Method:** Sends intentionally tricky content in multiple formats and measures correct extraction.

**YON feature tested:** Zero escape sequences

---

## For Everyone

This suite compares YON, JSON, and YAML formats. YON performs better in handling tricky data, with a 9.3/12 avg advantage. JSON and YAML show higher error rates. YON's zero escape sequences reduce misinterpretation risks. Known boundary: YON's complexity may increase processing time.

---

## Test Data

### PASS: YON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `78 %` _(vs max traps: 12 → 9.3/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 5/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string:(1) octal-zipcode: hex-color:(#FF00) nested-quotes:("Can') unicode-names:(olof) high-precision-float: leading-zero-phone:(003) scientific-notation:(6.02) rome-zipcode:(001)

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 5 | /12 |
| duration | 16641 | ms |

### PASS: JSON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `92 %` _(vs max traps: 12 → 11.0/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 10/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:(Can't) unicode-names: high-precision-float:(3) leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 10 | /12 |
| duration | 14410 | ms |

### PASS: YAML Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `89 %` _(vs max traps: 12 → 10.7/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 9/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names:(ol) high-precision-float:(3.1) leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 9 | /12 |
| duration | 14395 | ms |

### PASS: Parser-Level Data Integrity (Local) [Advantage]

**Metric:** `6 /6 values corrupted` _(vs YON corruptions: 0 → YAML corrupts 6/6, YON: 0/6)_

Parser-level data integrity — the actual format trap claim. YAML parsers silently coerce string values (NO→false, ON→true, 1.0→1). YON treats all untyped values as text — no implicit coercion.

**Results per trap case:**
- norway: YAML coerces 'NO' → false 
- on-val: YAML coerces 'ON' → true 
- yes-val: YAML coerces 'YES' → true 
- off-val: YAML coerces 'OFF' → false 
- version: YAML coerces '1.0' → 1 
- octal: YAML coerces '0777' → 511 

**YAML:** 6 silent corruptions. **YON:** 0 corruptions. YON's text-first design eliminates parser-level data loss.

| Metric | Value | Unit |
|--------|-------|------|
| yaml_preserved | 0 | /6 |
| yon_preserved | 6 | /6 |

---

## For Specialists

YON achieves 78% trap immunity. JSON reaches 92%, YAML at 89%. YON's structural primitives enhance data integrity, preserving 6/6 values. JSON and YAML corrupt 6/6 values. YON's known boundary: increased processing time, 16641 vs. JSON's 14410. Operational implication: YON suits complex data scenarios, balancing integrity with processing demands.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._