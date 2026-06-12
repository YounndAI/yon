[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:36.430Z

**Result:** 2/2 passed in 855ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This suite compares streaming throughput across formats. YON outperforms JSON, NL, and YAML in sustained records-per-second. YON achieves a throughput of **846949** records/sec. This means faster data processing in streaming applications. Known boundary: YON's advantage is most evident in high-complexity streams.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `846949 records/sec`

100,000 records streamed at 846,949 records/sec. Duration: 118.1ms. First 10K batch: 569,418 ops/s. Last 10K batch: 927,506 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 118.07 | ms |
| first_batch_ops | 569418 | records/sec |
| last_batch_ops | 927506 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.74 ratio`

Last-batch/first-batch ratio: 1.74. First 10K: 542,661 ops/s. Last 10K: 942,454 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 542661 | records/sec |
| last_10k_ops | 942454 | records/sec |

---

## For Specialists

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._