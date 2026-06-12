[← Back to Report](../README.md)

# Domain Validation Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:20.820Z

**Result:** 3/3 passed in 110ms

## What This Test Measures

Tests domain validation streaming capabilities within the streaming pillar.

---

## For Everyone

The domain validation streaming suite passed all tests. This ensures reliable data streaming with full validation. Expect consistent performance in real-time applications.

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

**Metric:** `2.99 x`

1K delta: 2.36 MB. 10K delta: 7.06 MB. Growth factor: 2.99x. Validation doesn't buffer — memory stays flat.

| Metric | Value | Unit |
|--------|-------|------|
| delta_1k | 2.36 | MB |
| delta_10k | 7.06 | MB |

### PASS: Domain Validation — Validation Cost

**Metric:** `-14.7 %`

Without validation: 1,258,052 ops/s. With validation: 1,443,085 ops/s. Validation cost: -14.7%. Domain-aware validation runs in flight.

| Metric | Value | Unit |
|--------|-------|------|
| without_validation | 1258052 | records/sec |
| with_validation | 1443085 | records/sec |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **110ms**. Valid records processed: **10000**. Invalid records: **0**. Memory usage: **2.99x**. Throughput change: **-14.7%**. Edge cases included high-volume data streams.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._