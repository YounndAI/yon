[← Back to Report](../README.md)

# Type Safety

> **Pillar:** lossless · **Timestamp:** 2026-03-21T03:18:40.386Z

**Result:** 4/4 passed in 0ms

## What This Test Measures

Verifies that YON preserves explicit types (:int, :bool, :str, :ts) through parse-serialize cycles, unlike JSON where types are inferred.

**Method:** Roundtrip tests with typed values, checking for coercion or type loss.

**YON feature tested:** Explicit type suffixes — no Norway Problem

---

## For Everyone

This suite compares YON and JSON for type safety. YON maintains explicit types, unlike JSON's inferred types. YON's explicit type suffixes prevent type loss, offering a strong advantage. Known boundary: YON requires more bytes for self-description.

---

## Test Data

### PASS: Zip Code Preservation (:str)

**Metric:** `3 /3` _(vs JSON (no type annotation): 1 → YON: explicit :str (3/3) | JSON: implicit (1/1))_

YON :str type hint preserved in AST: true. Leading zero preserved: true. Roundtrip survived: true. JSON preserves string value (true) but has no type annotation to enforce it.

### PASS: Boolean Coercion Prevention (:bool)

**Metric:** `1 bool` _(vs JSON value-based distinction: 1 → YON: explicit :bool/:str annotations prevent ambiguity)_

active:bool=true → typeHint=bool: true. name:str="true" → typeHint=str: true. YON annotations prevent coercion. JSON relies on value encoding (true).

### PASS: Int/Float Distinction (:int/:float)

**Metric:** `4 /4`

port:int → true, ratio:float → true, count:int → true. Roundtrip preserved: true. Score: 4/4.

### PASS: Self-Describing Type Budget (§9 Characteristic)

**Metric:** `5 explicit types`

YON: 325B with 5 explicit type annotations (:int, :bool). JSON minified: 143B (no types). JSON pretty: 176B (no types). The rationale: "one explicit type annotation eliminates an entire class of downstream inference bugs." Cost: ~182B. Benefit: zero type-coercion errors.

| Metric | Value | Unit |
|--------|-------|------|
| json_min_bytes | 143 | bytes |
| json_pretty_bytes | 176 | bytes |
| yon_bytes | 325 | bytes |
| yon_vs_json_pretty | 185 | % |

---

## For Specialists

YON preserves types with 3//3 success, compared to JSON's 1. YON's explicit annotations prevent YON: explicit :bool/:str annotations prevent ambiguity. YON distinguishes int/float types in 4//4 tests. Known boundary: YON's self-describing budget is 325 bytes, exceeding JSON's 143. Operational implication: YON's explicit typing aids precision but increases data size.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._