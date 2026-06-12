[← Back to Report](../README.md)

# Append-Only Provenance

> **Pillar:** lossless · **Timestamp:** 2026-03-22T15:12:17.223Z

**Result:** 3/3 passed in 1ms

## What This Test Measures

Tests append-only provenance capabilities within the lossless pillar.

---

## For Everyone

The Append-Only Provenance suite passed all tests. This ensures data integrity and traceability in document history.

---

## Test Data

### PASS: Patch Chain Integrity

**Metric:** `100 %`

10-patch chain: 10/10 patches parsed. All IDs found: true. Roundtrip intact: true.

| Metric | Value | Unit |
|--------|-------|------|
| patches_found | 10 | /10 |
| roundtrip_intact | 1 | bool |

### PASS: Stamp Audit Trail

**Metric:** `5 /5`

5 @STAMP records interleaved with patches. Recovered: 5/5. All data extractable: true.

| Metric | Value | Unit |
|--------|-------|------|
| stamps_with_full_data | 5 | records |

### PASS: Chain Growth Measurement

**Metric:** `178 bytes`

20 patches + stamps. Base: 255 bytes → Final: 3808 bytes. Avg growth: 178 bytes/step. Max deviation: 2 bytes. Linear growth: VERIFIED.

| Metric | Value | Unit |
|--------|-------|------|
| total_growth | 3553 | bytes |
| base_size | 255 | bytes |
| final_size | 3808 | bytes |
| max_deviation | 2 | bytes |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **1ms**. Provenance patch chain value: **100%** with **10** patches found. Roundtrip integrity: **1**. Provenance stamp audit: **5/5** with full data in **5** stamps. Chain growth: **178bytes** per patch, total growth **3553** bytes. Base size: **255** bytes, final size: **3808** bytes. Max deviation: **2** bytes. Edge cases include full data stamps and roundtrip integrity.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._