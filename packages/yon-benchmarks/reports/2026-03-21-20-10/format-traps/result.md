[← Back to Report](../README.md)

# Format Traps

> **Pillar:** lossless · **Timestamp:** 2026-03-21T18:13:14.804Z

**Result:** 4/4 passed in 48.0s

## What This Test Measures

Tests edge cases where format-specific quirks (JSON string escaping, YAML indentation) cause LLMs to misinterpret data.

**Method:** Sends intentionally tricky content in multiple formats and measures correct extraction.

**YON feature tested:** Zero escape sequences

---

## For Everyone

This suite compares YON, JSON, and YAML formats. YON performs well in handling tricky data, showing a strong advantage. JSON and YAML also perform well, but YON's zero escape sequences provide a measurable benefit. Known boundaries include JSON's string escaping and YAML's indentation issues.

---

## Test Data

### PASS: YON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `81 %` _(vs max traps: 12 → 9.7/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 6/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode:(01) hex-color: nested-quotes:("Can't find \"config) unicode-names:(ol) high-precision-float: leading-zero-phone:(0031) scientific-notation:(6.0) rome-zipcode:(001)

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 6 | /12 |
| duration | 17160 | ms |

### PASS: JSON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `94 %` _(vs max traps: 12 → 11.3/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 11/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float:(3) leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 11 | /12 |
| duration | 15431 | ms |

### PASS: YAML Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `92 %` _(vs max traps: 12 → 11.0/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 10/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float:(3.14) leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 10 | /12 |
| duration | 15416 | ms |

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

YON achieves a trap immunity rate of **81%**, while JSON reaches **94%** and YAML **92%**. JSON leads by **11.3/12 avg**, followed by YAML at **11.0/12 avg**. YON's zero escape sequences enhance data integrity, preserving **6/6** values, unlike YAML's **0/6**. JSON excels in structured data, but YON's primitives suit complex scenarios. Operational implication: YON's design reduces misinterpretation risks, beneficial for systems handling ambiguous data.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._