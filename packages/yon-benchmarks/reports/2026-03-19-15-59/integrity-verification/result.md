[← Back to Report](../README.md)

# Integrity Verification

> **Pillar:** lossless · **Timestamp:** 2026-03-19T13:59:12.971Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests integrity verification capabilities within the lossless pillar.

---

## For Everyone

The integrity verification suite confirms data remains unchanged. All tests passed, ensuring reliable data handling.

---

## Test Data

### PASS: Block Integrity Pass

**Metric:** `1 bool`

Valid SHA-256 hash → verifyBlockIntegrity() returns true. Integrity verified.

| Metric | Value | Unit |
|--------|-------|------|
| result | 1 | state |
| duration | 3.16 | ms |

### PASS: Block Integrity Fail

**Metric:** `1 bool`

Tampered content with wrong hash → returns false. Tamper detection verified.

| Metric | Value | Unit |
|--------|-------|------|
| result | 1 | state |
| duration | 0.08 | ms |

### PASS: No Hash → null

**Metric:** `1 bool`

Block without sha256 field → returns null (graceful skip). No false positives.

| Metric | Value | Unit |
|--------|-------|------|
| result_null | 1 | bool |
| duration | 0.01 | ms |

### PASS: Document Integrity

**Metric:** `1 bool`

3 blocks: valid (true), tampered (false), no-hash (skipped). Document integrity verified.

| Metric | Value | Unit |
|--------|-------|------|
| checked_count | 2 | blocks |
| valid_pass | 1 | bool |
| tampered_fail | 1 | bool |
| nohash_skipped | 1 | bool |
| duration | 0.28 | ms |

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **4ms**. Integrity block pass result: **1** in **3.16** ms. Document integrity checked: **2** with valid pass: **1**. Edge cases include tampered and no-hash documents.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._