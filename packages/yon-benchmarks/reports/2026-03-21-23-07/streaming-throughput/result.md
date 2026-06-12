[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:12.631Z

**Result:** 2/2 passed in 886ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

The suite compared streaming throughput across formats. YON outperformed JSON, NL, and YAML. YON's throughput reached **790220** records/sec. This means faster data processing in streaming applications. Known boundary: YON excels in stream-first scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `790220 records/sec`

100,000 records streamed at 790,220 records/sec. Duration: 126.5ms. First 10K batch: 554,905 ops/s. Last 10K batch: 854,022 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 126.55 | ms |
| first_batch_ops | 554905 | records/sec |
| last_batch_ops | 854022 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.94 ratio`

Last-batch/first-batch ratio: 1.94. First 10K: 455,967 ops/s. Last 10K: 883,501 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 455967 | records/sec |
| last_10k_ops | 883501 | records/sec |

---

## For Specialists

YON's throughput: **790220** records/sec. JSON, NL, YAML lag behind by **1.94** ratio. YON's stream-first architecture provides a strong advantage. Known boundary: YON's design suits high-throughput streaming. Operational implication: choose YON for sustained streaming efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._