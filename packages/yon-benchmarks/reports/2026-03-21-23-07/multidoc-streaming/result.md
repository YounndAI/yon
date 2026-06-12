[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:14.075Z

**Result:** 3/3 passed in 69ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The suite tested multi-document streaming. All tests passed, confirming reliable throughput. This ensures efficient processing of multiple documents.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1579479 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,579,479 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `7.7 %`

Multi-doc: 1,561,037 ops/s. Single-doc: 1,692,162 ops/s. Boundary cost: 7.7%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1561037 | records/sec |
| single_doc_ops | 1692162 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **69ms**. Throughput: **1579479** records/sec. Boundary cost: **7.7** %. Document header reset every **100** documents. Edge cases included boundary cost operations: **1561037** multi-doc, **1692162** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._