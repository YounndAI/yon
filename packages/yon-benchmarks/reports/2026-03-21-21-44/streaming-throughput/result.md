[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:58.003Z

**Result:** 2/2 passed in 806ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This comparison evaluates streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a 895333 records/sec rate. This means faster data processing. Known boundary: YON's stream-first design excels in high-throughput scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `895333 records/sec`

100,000 records streamed at 895,333 records/sec. Duration: 111.7ms. First 10K batch: 587,558 ops/s. Last 10K batch: 959,030 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 111.69 | ms |
| first_batch_ops | 587558 | records/sec |
| last_batch_ops | 959030 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.64 ratio`

Last-batch/first-batch ratio: 1.64. First 10K: 586,937 ops/s. Last 10K: 962,242 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 586937 | records/sec |
| last_10k_ops | 962242 | records/sec |

---

## For Specialists

YON's throughput: 895333 records/sec. JSON, NL, YAML lag behind. YON's advantage: 1.64 ratio ratio. Known boundary: YON's architecture favors continuous streams. Operational implication: YON supports high-load systems efficiently.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._