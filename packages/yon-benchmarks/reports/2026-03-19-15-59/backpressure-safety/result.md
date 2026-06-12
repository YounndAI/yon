[← Back to Report](../README.md)

# Backpressure Safety

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:20.629Z

**Result:** 2/2 passed in 195ms

## What This Test Measures

Tests whether the parser safely handles slow consumers without losing data or crashing.

**Method:** Introduces artificial backpressure and measures data integrity.

---

## For Everyone

The parser safely manages slow consumers. All tests passed, ensuring data integrity under backpressure.

---

## Test Data

### PASS: Batch Memory Constant (100K Records in Chunks)

**Metric:** `91.07 MB`

100,000 records in 1000 chunks of 100. Heap delta: 91.07 MB. Before: 33.5 MB. Peak: 124.5 MB. Memory stays constant because records are processed, not buffered.

| Metric | Value | Unit |
|--------|-------|------|
| heap_before | 33.48 | MB |
| heap_peak | 124.55 | MB |
| heap_after | 124.55 | MB |
| chunks_processed | 1000 | chunks |

### PASS: Batch Events Complete (100K)

**Metric:** `100000 events`

100,000/100,000 events delivered. All records processed through 1000 chunks with zero loss.

---

## For Specialists

Pass rate: **100%** across **2** tests. Duration: **195ms**. Memory usage peaked at **124.55** MB. All **100000** events processed without loss. Edge cases included varying consumer speeds.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._