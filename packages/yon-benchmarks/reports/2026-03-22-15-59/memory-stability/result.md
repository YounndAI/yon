[← Back to Report](../README.md)

# Memory Stability

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:16.793Z

**Result:** 3/3 passed in 1.1s

## What This Test Measures

Checks that streaming large documents does not cause unbounded memory growth.

**Method:** Streams 100K+ records and monitors heap usage.

---

## For Everyone

The suite confirms stable memory usage during streaming. All tests passed, ensuring large documents stream without excessive memory growth.

---

## Test Data

### PASS: Heap Delta at 10K Records

**Metric:** `14.71 MB`

YON streaming heap delta at 10K records: 14.71 MB. Streaming mode (accumulate: false) — records are consumed, not retained.

### PASS: Heap Delta at 100K Records

**Metric:** `23.02 MB`

YON streaming heap delta at 100K records: 23.02 MB. Streaming mode (accumulate: false) — records are consumed, not retained.

### PASS: Memory Growth Factor (100K / 10K)

**Metric:** `1.57 x`

10K delta: 14.67 MB. 100K delta: 23.01 MB. Growth factor: 1.57x. A factor near 1.0 proves O(1) memory — heap is flat regardless of scale.

| Metric | Value | Unit |
|--------|-------|------|
| delta_10k | 14.67 | MB |
| delta_100k | 23.01 | MB |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **1.1s**. Memory usage remains stable: **14.71 MB** for 10K records, **23.02 MB** for 100K records. Growth factor: **1.57 x**. Edge cases include streaming over **100K** records.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._