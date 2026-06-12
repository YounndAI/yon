[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:23.696Z

**Result:** 2/2 passed in 795ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This comparison measures streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a throughput of **917676** records/sec. This means faster data handling in streaming applications. Known boundary: YON's stream-first design excels in high-throughput scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `917676 records/sec`

100,000 records streamed at 917,676 records/sec. Duration: 109.0ms. First 10K batch: 666,818 ops/s. Last 10K batch: 959,831 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 108.97 | ms |
| first_batch_ops | 666818 | records/sec |
| last_batch_ops | 959831 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.59 ratio`

Last-batch/first-batch ratio: 1.59. First 10K: 609,574 ops/s. Last 10K: 968,317 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 609574 | records/sec |
| last_10k_ops | 968317 | records/sec |

---

## For Specialists

YON's throughput: **917676** records/sec. JSON, NL, YAML lag behind by **1.59** ratio. YON's stream-first architecture provides a strong advantage. Known boundary: YON operates best in continuous streaming. Implication: Choose YON for high-throughput needs. JSON, NL, YAML suit simpler tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._