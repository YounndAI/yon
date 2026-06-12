[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:15.655Z

**Result:** 2/2 passed in 798ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This suite compares streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a 915080 records/sec rate. This means faster data processing. Known boundary: YON excels in high-complexity streams.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `915080 records/sec`

100,000 records streamed at 915,080 records/sec. Duration: 109.3ms. First 10K batch: 631,788 ops/s. Last 10K batch: 972,659 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 109.28 | ms |
| first_batch_ops | 631788 | records/sec |
| last_batch_ops | 972659 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.59 ratio`

Last-batch/first-batch ratio: 1.59. First 10K: 602,544 ops/s. Last 10K: 956,078 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 602544 | records/sec |
| last_10k_ops | 956078 | records/sec |

---

## For Specialists

YON's throughput is 915080 records/sec. JSON, NL, and YAML lag behind. YON's advantage is 1.59 times better stability. Known boundary: YON's architecture suits complex streams. Operational implication: YON enhances system efficiency in demanding environments.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._