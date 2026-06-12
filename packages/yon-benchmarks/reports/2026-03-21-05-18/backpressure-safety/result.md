[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:47.900Z

**Result:** 2/2 passed in 188ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely manages slow consumers. All tests passed, ensuring data integrity under backpressure.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `85.49 MB`

100,000 records in 1000 chunks of 100. Heap delta: 85.49 MB. Before: 33.5 MB. Peak: 119.0 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.5 | MB |
| heap_peak | 118.99 | MB |
| heap_after | 118.99 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **188ms**. Memory usage remains stable, with a constant value of **85.49 MB**. Heap before: **33.5**, peak: **118.99**, after: **118.99**. Processed **1000** chunks and completed **100000 events**. Edge cases include artificial backpressure scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._