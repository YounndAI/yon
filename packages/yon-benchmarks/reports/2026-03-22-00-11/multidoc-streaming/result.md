[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:12:01.623Z

**Result:** 3/3 passed in 73ms

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

**Metric:** `1488893 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,488,893 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `-2.4 %`

Multi-doc: 1,530,808 ops/s. Single-doc: 1,495,484 ops/s. Boundary cost: -2.4%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1530808 | records/sec |
| single_doc_ops | 1495484 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **73ms**. Throughput: **1488893** records/sec. Boundary cost: **-2.4** %. Header reset every **100** documents. Edge cases included boundary cost operations: **1530808** multi-doc vs. **1495484** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._