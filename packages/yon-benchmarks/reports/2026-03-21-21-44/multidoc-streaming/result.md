[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:59.354Z

**Result:** 3/3 passed in 61ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The suite tests multi-document streaming. All tests passed successfully. This ensures efficient processing of multiple documents in sequence.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1776956 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,776,956 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `3.4 %`

Multi-doc: 1,834,660 ops/s. Single-doc: 1,900,021 ops/s. Boundary cost: 3.4%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1834660 | records/sec |
| single_doc_ops | 1900021 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **61ms**. Throughput: **1776956 records/sec**. Boundary cost: **3.4 %** for **1834660** operations. Document header resets every **100 documents**. Edge cases include sequential document streaming.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._