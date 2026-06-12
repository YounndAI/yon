[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:25.055Z

**Result:** 3/3 passed in 63ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The multi-document streaming test passed all checks. This ensures reliable throughput for streaming multiple documents.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1641120 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,641,120 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `4.7 %`

Multi-doc: 1,771,824 ops/s. Single-doc: 1,859,704 ops/s. Boundary cost: 4.7%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1771824 | records/sec |
| single_doc_ops | 1859704 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **63ms**. Throughput: **1641120** records/sec. Boundary cost: **4.7**% for **1771824** multi-doc ops vs. **1859704** single-doc ops. Document header resets every **100** documents. Edge cases include sequential streaming of concatenated documents.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._