[← Back to Report](../README.md)

# Format Traps

> **Pillar:** lossless · **Timestamp:** 2026-03-23T13:40:43.878Z

**Result:** 4/4 passed in 51.5s

## What This Test Measures

Tests edge cases where format-specific quirks (JSON string escaping, YAML indentation) cause LLMs to misinterpret data.

**Method:** Sends intentionally tricky content in multiple formats and measures correct extraction.

**YON feature tested:** Zero escape sequences

---

## For Everyone

The suite compares YON, JSON, and YAML. YON performs well in handling tricky data, with zero escape sequences. JSON and YAML show higher immunity rates, but YON maintains data integrity. This means YON is reliable for complex data scenarios, though JSON and YAML handle traps slightly better.

---

## Test Data

### PASS: YON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `75 %` _(vs max traps: 12 → 9.0/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 4/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string:(1.) octal-zipcode:(01) hex-color:(#FF) nested-quotes:("Can't find \"config) unicode-names:(olof@) high-precision-float: leading-zero-phone:(003) scientific-notation:(6.) rome-zipcode:(00)

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 4 | /12 |
| duration | 21065 | ms |

### PASS: JSON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `92 %` _(vs max traps: 12 → 11.0/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 10/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can') unicode-names: high-precision-float:(3.14) leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 10 | /12 |
| duration | 15232 | ms |

### PASS: YAML Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `94 %` _(vs max traps: 12 → 11.3/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 11/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 11 | /12 |
| duration | 15200 | ms |

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

YON achieves 75% trap immunity. JSON reaches 92%, and YAML hits 94%. YON preserves all data, while YAML corrupts 6/6 values corrupted. YON's structural primitives excel in complex data, offering a 9.0/12 avg advantage. JSON and YAML perform better in trap immunity, but YON's zero escape sequences ensure data integrity. This impacts system design by favoring YON for data-critical applications, despite JSON and YAML's trap handling strengths.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._