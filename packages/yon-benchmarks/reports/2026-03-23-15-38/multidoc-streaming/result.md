[← Back to Report](../README.md)

# Multi-Document Streaming

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:32.588Z

**Result:** 3/3 passed in 71ms

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

**Metric:** `1574258 records/sec`

100 documents × 100 records = 10,000 total. Throughput: 1,574,258 records/sec. Multi-document streaming is a first-class capability.

### PASS: Multi-Doc Boundary Cost vs Single Document

**Metric:** `3.9 %`

Multi-doc: 1,563,159 ops/s. Single-doc: 1,626,916 ops/s. Boundary cost: 3.9%. Document isolation is free.

| Metric | Value | Unit |
|--------|-------|------|
| multi_doc_ops | 1563159 | records/sec |
| single_doc_ops | 1626916 | records/sec |

### PASS: Multi-Doc — docHeader.id Resets Per Document

**Metric:** `100 documents`

100/100 unique docHeader.id values captured. docHeader getter resets correctly on each @DOC boundary.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **71ms**. Throughput measured at **1574258** records/sec. Boundary cost: **3.9** % for **1563159** multi-doc operations versus **1626916** single-doc operations. Document header resets every **100** documents. Edge cases included sequential document streaming.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._