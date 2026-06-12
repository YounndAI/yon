[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T18:11:00.988Z

**Result:** 3/3 passed in 69ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The suite tests multi-document streaming. All tests passed successfully. This ensures efficient document processing in pipelines.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1600999 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,600,999 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `3.4 %`

Multi-doc: 1,637,090 ops/s. Single-doc: 1,693,910 ops/s. Boundary cost: 3.4%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1637090 | records/sec |
| single_doc_ops | 1693910 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **69ms**. Throughput: **1600999** records/sec. Boundary cost: **3.4** %. Document header resets every **100** documents. Edge cases include boundary cost operations: **1637090** multi-doc vs. **1693910** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._