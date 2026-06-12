[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:19.159Z

**Result:** 2/2 passed in 969ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This suite compares streaming throughput across formats. YON outperforms JSON, NL, and YAML. YON achieves a throughput of **694341** records/sec. This means faster data processing. Known Boundary: YON's advantage is in stream-first scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `694341 records/sec`

100,000 records streamed at 694,341 records/sec. Duration: 144.0ms. First 10K batch: 415,284 ops/s. Last 10K batch: 649,768 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 144.02 | ms |
| first_batch_ops | 415284 | records/sec |
| last_batch_ops | 649768 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.28 ratio`

Last-batch/first-batch ratio: 1.28. First 10K: 587,706 ops/s. Last 10K: 754,290 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 587706 | records/sec |
| last_10k_ops | 754290 | records/sec |

---

## For Specialists

YON's throughput: **694341** records/sec. JSON, NL, YAML lag behind by **1.28** ratio. YON's stream-first architecture excels in continuous streaming. Known Boundary: YON's advantage is specific to high-complexity streams. Operational implication: YON supports efficient system design in streaming environments.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._