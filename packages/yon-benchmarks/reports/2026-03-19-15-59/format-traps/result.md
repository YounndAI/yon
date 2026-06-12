[← Back to Report](../README.md)

# Format Traps

> **Pillar:** lossless · **Timestamp:** 2026-03-19T14:01:33.868Z

**Result:** 4/4 passed in 1m 5s (65s)

## What This Test Measures

Tests edge cases where format-specific quirks (JSON string escaping, YAML indentation) cause LLMs to misinterpret data.

**Method:** Sends intentionally tricky content in multiple formats and measures correct extraction.

**YON feature tested:** Zero escape sequences

---

## For Everyone

This suite tests how formats handle tricky data. YON, JSON, and YAML were compared. YAML performed best with 92%, followed by JSON at 89%, and YON at 86%. YON's zero escape sequences offer a scope advantage in data integrity, preserving all values. Each format has unique strengths and constraints.

---

## Test Data

### PASS: YON Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `86 %` _(vs max traps: 12 → 10.3/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 8/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't) unicode-names:(ol) high-precision-float: leading-zero-phone:(00) scientific-notation: rome-zipcode:(00)

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 8 | /12 |
| duration | 28475 | ms |

### PASS: JSON Trap Immunity (3 LLMs × 12 traps) [Even]

**Metric:** `89 %` _(vs max traps: 12 → 10.7/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 9/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names:(olof@) high-precision-float:(3.1415926535) leading-zero-phone: scientific-notation:(6.022e) rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 9 | /12 |
| duration | 17346 | ms |

### PASS: YAML Trap Immunity (3 LLMs × 12 traps) [Known Boundary]

**Metric:** `92 %` _(vs max traps: 12 → 11.0/12 avg)_

GPT-4o-mini: 11/12, Claude Haiku 4.5: 12/12, Gemini 2.5 Flash: 10/12. Per-trap: GPT-4o-mini: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can't find \"config) unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Claude Haiku 4.5: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes: unicode-names: high-precision-float: leading-zero-phone: scientific-notation: rome-zipcode: | Gemini 2.5 Flash: norway-country-code: on-off-config: yes-no-answers: version-string: octal-zipcode: hex-color: nested-quotes:("Can) unicode-names: high-precision-float: leading-zero-phone: scientific-notation:(6.0) rome-zipcode:

| Metric | Value | Unit |
|--------|-------|------|
| gpt4o-mini_score | 11 | /12 |
| claude-haiku_score | 12 | /12 |
| gemini-flash_score | 10 | /12 |
| duration | 18832 | ms |

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

YAML leads with 92%, surpassing JSON's 89% and YON's 86%. YON excels in parser-level integrity, preserving 6/0 values, while YAML corrupts 0/0. YON's structural primitives reduce escape sequence errors, beneficial for complex data systems. JSON and YAML operate well in structured environments but face known boundaries with data integrity.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._