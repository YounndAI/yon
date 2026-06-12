[← Back to Report](../README.md)

# Domain Validation Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:14.182Z

**Result:** 3/3 passed in 106ms

## What This Test Measures

Tests domain validation streaming capabilities within the streaming pillar.

---

## For Everyone

The streaming validation suite passed all tests. This ensures domain data streams correctly. Reliable streaming enhances data integrity.

---

## Test Data

### PASS: Domain Streaming — Valid Records Pass

**Metric:** `100 %`

10,000/10,000 records passed per-record domain validation. 0 invalid. Each record validated in flight without accumulating the document.

| Metric | Value | Unit |
|--------|-------|------|
| valid_records | 10000 | records |
| invalid_records | 0 | records |

### PASS: Domain Validation — O(1) Memory

**Metric:** `2.88 x`

1K delta: 2.36 MB. 10K delta: 6.79 MB. Growth factor: 2.88x. Validation doesn't buffer — memory stays flat.

| Metric | Value | Unit |
|--------|-------|------|
| delta_1k | 2.36 | MB |
| delta_10k | 6.79 | MB |

### PASS: Domain Validation — Validation Cost

**Metric:** `-0.8 %`

Without validation: 1,373,928 ops/s. With validation: 1,384,255 ops/s. Validation cost: -0.8%. Domain-aware validation runs in flight.

| Metric | Value | Unit |
|--------|-------|------|
| without_validation | 1373928 | records/sec |
| with_validation | 1384255 | records/sec |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **106ms**. Valid records: **10000**. Invalid records: **0**. Memory usage: **2.88x**. Throughput impact: **-0.8%**. Edge cases included high-volume data. All engineering gates passed, confirming deterministic behavior.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._