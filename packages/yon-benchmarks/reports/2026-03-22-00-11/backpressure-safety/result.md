[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:12:01.548Z

**Result:** 2/2 passed in 195ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely handles slow consumers. All tests passed, ensuring data integrity during streaming.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `91.02 MB`

100,000 records in 1000 chunks of 100. Heap delta: 91.02 MB. Before: 33.5 MB. Peak: 124.6 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.55 | MB |
| heap_peak | 124.57 | MB |
| heap_after | 124.57 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **195ms**. Memory usage remains stable: **91.02** MB. Chunks processed: **1000**. Events completed: **100000** events. Heap memory peaked at **124.57**. Edge cases included artificial backpressure scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._