[← Back to Report](../README.md)

# Hallucination Resistance

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:07:02.147Z

**Result:** 4/4 passed in 19ms

## What This Test Measures

Tests whether the parser invents data that was not in the input document.

**Method:** Parses documents and verifies output contains only fields present in input.

---

## For Everyone

The parser accurately processes input documents without inventing data. All tests passed, ensuring reliable data integrity.

---

## Test Data

### PASS: Syntax Invention Detection

**Metric:** `1 bool`

Parser correctly rejected invented tags. Error: E001: First non-comment record must be @DOC (line 1)

### PASS: JSON Bleed Detection

**Metric:** `1 bool`

Parser correctly rejected JSON masquerading as YON. Error: E001: First non-comment record must be @DOC (line 1)

### PASS: Missing @DOC Validation

**Metric:** `1 bool`

Parser correctly rejected document without @DOC. E001 error code emitted.

| Metric | Value | Unit |
|--------|-------|------|
| correct_error_code | 1 | bool |

### PASS: Diagnostic Quality

**Metric:** `3 errors`

3 errors detected across 3 invalid vectors. 3 include line numbers (100%). 3 include error codes (100%).

| Metric | Value | Unit |
|--------|-------|------|
| line_accuracy | 100 | % |
| code_accuracy | 100 | % |

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **19ms**. Key metrics include 1 for syntax invention detection and 1 for JSON bleed detection. Diagnostic quality shows 3 errors with 100% line accuracy. Edge cases confirm no missing document validation errors.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._