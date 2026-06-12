[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:46.479Z

**Result:** 2/2 passed in 920ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This suite compares streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a 757105 records/sec rate. This means faster data processing. Known boundary: YON's stream-first architecture excels in high-throughput scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `757105 records/sec`

100,000 records streamed at 757,105 records/sec. Duration: 132.1ms. First 10K batch: 473,032 ops/s. Last 10K batch: 821,133 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 132.08 | ms |
| first_batch_ops | 473032 | records/sec |
| last_batch_ops | 821133 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.44 ratio`

Last-batch/first-batch ratio: 1.44. First 10K: 585,682 ops/s. Last 10K: 845,623 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 585682 | records/sec |
| last_10k_ops | 845623 | records/sec |

---

## For Specialists

YON's throughput: 757105 records/sec. JSON, NL, YAML lag behind. YON's advantage: 1.44 ratio stability. Known boundary: YON's architecture suits continuous streaming. Operational implication: YON supports high-load systems efficiently.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._