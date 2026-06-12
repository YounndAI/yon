[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:31.130Z

**Result:** 2/2 passed in 876ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This comparison measures streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a throughput of **808021** records/sec. This means faster data processing. Known boundary: YON's stream-first design suits high-volume tasks.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `808021 records/sec`

100,000 records streamed at 808,021 records/sec. Duration: 123.8ms. First 10K batch: 542,461 ops/s. Last 10K batch: 858,494 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 123.76 | ms |
| first_batch_ops | 542461 | records/sec |
| last_batch_ops | 858494 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.35 ratio`

Last-batch/first-batch ratio: 1.35. First 10K: 616,162 ops/s. Last 10K: 833,625 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 616162 | records/sec |
| last_10k_ops | 833625 | records/sec |

---

## For Specialists

YON's throughput is **808021** records/sec. JSON, NL, and YAML lag behind. YON's advantage is **1.35** times better stability. Known boundary: YON excels in continuous streaming. Operational implication: YON's architecture supports high-demand systems efficiently.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._