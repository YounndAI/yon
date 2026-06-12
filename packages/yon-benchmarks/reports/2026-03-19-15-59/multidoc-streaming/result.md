[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:20.707Z

**Result:** 3/3 passed in 77ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The suite tested multi-document streaming. All tests passed successfully. This ensures efficient processing of multiple documents in sequence.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1262069 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,262,069 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `0.5 %`

Multi-doc: 1,486,812 ops/s. Single-doc: 1,494,299 ops/s. Boundary cost: 0.5%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1486812 | records/sec |
| single_doc_ops | 1494299 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **77ms**. Throughput: **1262069** records/sec. Boundary cost: **0.5** %. Document header reset after **100** documents. Edge cases included boundary cost operations: **1486812** multi-doc, **1494299** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._