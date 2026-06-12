[← Back to Report](../README.md)

# Runner Permission Model

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:26.278Z

**Result:** 5/5 passed in 1ms

## What This Test Measures

Tests runner permission model capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Permission Model suite tested permission handling. All tests passed successfully. This ensures reliable permission enforcement across systems.

---

## Test Data

### PASS: Fail-Closed Default (Empty Allowlist)

**Metric:** `100 %`

Tested 6 operations with empty allowlist. 6/6 denied. Fail-closed: VERIFIED.

### PASS: Explicit Allow (Selective Permit)

**Metric:** `100 %`

Allowlist: std:fs.*, std:data.*. Correct allows: 3/3. Correct denials: 3/3. Accuracy: 100%.

| Metric | Value | Unit |
|--------|-------|------|
| correct_allows | 3 | /3 |
| correct_denials | 3 | /3 |

### PASS: Explicit DENY Overrides ALLOW

**Metric:** `1 bool`

Allowlist: std:fs.* (ALLOW) + std:fs.write (DENY). std:fs.read allowed: true. std:fs.write denied: true. DENY overrides wildcard ALLOW: VERIFIED.

### PASS: Glob Pattern Matching

**Metric:** `100 %`

All 6 glob patterns resolved correctly.

### PASS: Version Suffix Stripping

**Metric:** `4 /4`

Entry: std:fs.read (ALLOW). std:fs.read@v1: true. std:fs.read@v2: true. std:fs.read (bare): true. std:fs.write@v1 (no match): true. Version stripping: VERIFIED.

---

## For Specialists

Pass rate: **100%** across **5** tests. Duration: **1ms**. Key metrics include **100%** fail-closed default and **100%** explicit allow. Engineering fact: explicit allow correctly processes **3** allows and **3** denials. Edge cases tested include glob matching at **100%**.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._