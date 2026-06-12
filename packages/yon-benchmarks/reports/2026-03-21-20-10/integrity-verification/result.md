[← Back to Report](../README.md)

# Integrity Verification

> **Pillar:** lossless · **Timestamp:** 2026-03-21T18:10:53.218Z

**Result:** 4/4 passed in 2ms

## What This Test Measures

Tests integrity verification capabilities within the lossless pillar.

---

## For Everyone

The integrity verification suite tested document integrity. All tests passed, ensuring data remains unchanged during processing.

---

## Test Data

### PASS: Block Integrity Pass

**Metric:** `1 bool`

Valid SHA-256 hash → verifyBlockIntegrity() returns true. Integrity verified.

| Metric | Value | Unit |
|--------|-------|------|
| result | 1 | state |
| duration | 1.32 | ms |

### PASS: Block Integrity Fail

**Metric:** `1 bool`

Tampered content with wrong hash → returns false. Tamper detection verified.

| Metric | Value | Unit |
|--------|-------|------|
| result | 1 | state |
| duration | 0.07 | ms |

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

Pass rate: **100%** across **4** tests. Duration: **2ms**. Integrity block pass duration: **1.32** ms. Document integrity checked: **2**. Edge cases included tampered documents, which failed as expected.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._