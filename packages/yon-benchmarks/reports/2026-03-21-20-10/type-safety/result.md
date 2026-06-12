[← Back to Report](../README.md)

# Type Safety

> **Pillar:** lossless · **Timestamp:** 2026-03-21T18:10:53.221Z

**Result:** 4/4 passed in 0ms

## What This Test Measures

Verifies that YON preserves explicit types (:int, :bool, :str, :ts) through parse-serialize cycles, unlike JSON where types are inferred.

**Method:** Roundtrip tests with typed values, checking for coercion or type loss.

**YON feature tested:** Explicit type suffixes — no Norway Problem

---

## For Everyone

This suite compares type safety in YON and JSON. YON preserves explicit types, while JSON infers them. YON performs better, maintaining types across all tests. This means fewer errors in data handling. Known boundary: YON's explicit types increase data size.

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

YON maintains explicit types: YON: explicit :str (3/3) | JSON: implicit (1/1). JSON infers types, risking errors. YON wins with a 3//3 advantage. Known boundary: YON's data size is 325 bytes, larger than JSON's 143. Operational implication: YON's explicit typing enhances reliability but increases storage needs.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._