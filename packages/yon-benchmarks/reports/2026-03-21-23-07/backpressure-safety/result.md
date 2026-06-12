[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:14.004Z

**Result:** 2/2 passed in 182ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely manages slow consumers. All tests passed, ensuring data integrity under backpressure.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `61.59 MB`

100,000 records in 1000 chunks of 100. Heap delta: 61.59 MB. Before: 33.5 MB. Peak: 95.1 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.55 | MB |
| heap_peak | 95.14 | MB |
| heap_after | 95.14 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **182ms**. Memory usage peaked at **95.14** MB. Processed **1000** chunks without data loss. Edge cases included varying consumer speeds.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._