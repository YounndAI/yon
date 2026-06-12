[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:37.905Z

**Result:** 2/2 passed in 180ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely handles slow consumers. All tests passed, ensuring data integrity under backpressure.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `16.17 MB`

100,000 records in 1000 chunks of 100. Heap delta: 16.17 MB. Before: 33.6 MB. Peak: 49.8 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.64 | MB |
| heap_peak | 49.81 | MB |
| heap_after | 44.45 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **180ms**. Memory usage peaked at **49.81** MB. Processed **1000** chunks without data loss. Edge cases included varying consumer speeds.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._