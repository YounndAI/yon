[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:37.979Z

**Result:** 3/3 passed in 73ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The multi-document streaming test passed successfully. This ensures efficient processing of multiple documents in sequence. YON's streaming feature performs reliably.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1779296 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,779,296 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `1.3 %`

Multi-doc: 1,752,910 ops/s. Single-doc: 1,776,862 ops/s. Boundary cost: 1.3%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1752910 | records/sec |
| single_doc_ops | 1776862 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **73ms**. Throughput: **1779296** records/sec. Boundary cost: **1.3** %. Header resets every **100** documents. Edge cases included boundary cost operations: **1752910** multi-doc vs. **1776862** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._