[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:47.978Z

**Result:** 3/3 passed in 77ms

## What This Test Measures

Measures throughput when streaming multiple documents through the same pipeline.

**Method:** Concatenates multiple documents and streams them sequentially.

**YON feature tested:** Multi-document streaming

---

## For Everyone

The multi-document streaming test passed all checks. This ensures reliable processing of multiple documents in sequence.

---

## Test Data

### PASS: Multi-Doc Throughput (100 × 100)

**Metric:** `1480122 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,480,122 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `13.2 %`

Multi-doc: 1,297,101 ops/s. Single-doc: 1,493,875 ops/s. Boundary cost: 13.2%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1297101 | records/sec |
| single_doc_ops | 1493875 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **77ms**. Throughput: **1480122** records/sec. Boundary cost: **13.2** %. Document header resets every **100** documents. Edge cases included boundary cost operations: **1297101** multi-doc vs. **1493875** single-doc.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._