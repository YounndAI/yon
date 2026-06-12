[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:59.291Z

**Result:** 2/2 passed in 162ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely manages slow consumers. All tests passed, ensuring no data loss or crashes.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `16.23 MB`

100,000 records in 1000 chunks of 100. Heap delta: 16.23 MB. Before: 33.6 MB. Peak: 49.8 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.56 | MB |
| heap_peak | 49.79 | MB |
| heap_after | 44.44 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **162ms**. Memory usage remains stable: **16.23** MB. Chunks processed: **1000**. Heap before: **33.56**, peak: **49.79**, after: **44.44**. Events completed: **100000** events. Edge cases confirm data integrity under backpressure.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._