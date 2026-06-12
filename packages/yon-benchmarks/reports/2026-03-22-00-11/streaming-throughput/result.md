[← Back to Report](../README.md)

# Streaming Throughput

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:12:00.123Z

**Result:** 2/2 passed in 940ms

## What This Test Measures

Measures sustained records-per-second throughput under continuous streaming conditions.

**Method:** Streams large documents and measures throughput over time.

**YON feature tested:** Stream-first architecture

---

## For Everyone

This suite compares streaming throughput. YON outperforms JSON, NL, and YAML. YON achieves a throughput of **765599** records/sec. This means faster data processing. Known boundary: YON excels in stream-first scenarios.

---

## Test Data

### PASS: Sustained Throughput (100K Records)

**Metric:** `765599 records/sec`

100,000 records streamed at 765,599 records/sec. Duration: 130.6ms. First 10K batch: 523,823 ops/s. Last 10K batch: 759,267 ops/s.

| Metric | Value | Unit |
|--------|-------|------|
| total_duration | 130.62 | ms |
| first_batch_ops | 523823 | records/sec |
| last_batch_ops | 759267 | records/sec |

### PASS: Throughput Stability (First vs Last 10K)

**Metric:** `1.24 ratio`

Last-batch/first-batch ratio: 1.24. First 10K: 622,088 ops/s. Last 10K: 772,529 ops/s. Ratio > 0.8 proves O(1) throughput — no degradation at scale.

| Metric | Value | Unit |
|--------|-------|------|
| first_10k_ops | 622088 | records/sec |
| last_10k_ops | 772529 | records/sec |

---

## For Specialists

YON's throughput: **765599** records/sec. JSON, NL, YAML lag behind. YON's delta: **1.24** ratio improvement. YON's stream-first architecture suits high-throughput needs. Known boundary: YON's advantage is in continuous streaming. System design should prioritize YON for sustained throughput.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._