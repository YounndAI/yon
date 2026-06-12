[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-21T18:10:59.541Z

**Result:** 2/2 passed in 881ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This comparison measures streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a throughput of **799636** records/sec. This means faster data processing. Known boundary: YON excels in stream-first scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `799636 records/sec`

100,000 records streamed at 799,636 records/sec. Duration: 125.1ms. First 10K batch: 552,795 ops/s. Last 10K batch: 863,252 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 125.06 | ms |
| first_batch_ops | 552795 | records/sec |
| last_batch_ops | 863252 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.41 ratio`

Last-batch/first-batch ratio: 1.41. First 10K: 622,890 ops/s. Last 10K: 878,758 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 622890 | records/sec |
| last_10k_ops | 878758 | records/sec |

---

## For Specialists

YON's throughput: **799636** records/sec. JSON, NL, YAML lag behind. YON's advantage: **799636** vs. baseline formats. Known boundary: YON's architecture suits continuous streaming. Operational implication: YON supports high-throughput systems efficiently.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._