[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:17.029Z

**Result:** 3/3 passed in 65ms

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

**Metric:** `1596679 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,596,679 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `2.7 %`

Multi-doc: 1,766,441 ops/s. Single-doc: 1,816,036 ops/s. Boundary cost: 2.7%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1766441 | records/sec |
| single_doc_ops | 1816036 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **65ms**. Throughput: **1596679** records/sec. Boundary cost: **2.7** %. Header reset every **100** documents. Edge cases include boundary cost operations: **1766441** multi-doc vs. **1816036** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._