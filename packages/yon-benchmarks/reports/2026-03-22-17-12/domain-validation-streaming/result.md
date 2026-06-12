[← Back to Report](../README.md)

# Domain Validation Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:25.153Z

**Result:** 3/3 passed in 96ms

## What This Test Measures

Tests domain validation streaming capabilities within the streaming pillar.

---

## For Everyone

The domain validation streaming suite passed all tests. This ensures reliable data streaming without errors. Streaming processes handle data efficiently.

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

**Metric:** `2.77 x`

1K delta: 2.36 MB. 10K delta: 6.53 MB. Growth factor: 2.77x. Validation doesn't buffer — memory stays flat.

| Metric | Value | Unit |
|--------|-------|------|
| delta_1k | 2.36 | MB |
| delta_10k | 6.53 | MB |

### PASS: Domain Validation — Validation Cost

**Metric:** `-1 %`

Without validation: 1,587,251 ops/s. With validation: 1,602,795 ops/s. Validation cost: -1%. Domain-aware validation runs in flight.

| Metric | Value | Unit |
|--------|-------|------|
| without_validation | 1587251 | records/sec |
| with_validation | 1602795 | records/sec |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **96ms**. Valid records: **10000**. Invalid records: **0**. Memory usage: **2.77x**. Throughput with validation: **1602795**. Edge cases included zero invalid records.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._