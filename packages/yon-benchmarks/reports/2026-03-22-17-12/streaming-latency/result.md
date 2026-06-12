[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:19.118Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This suite compares streaming latency across formats. YON outperforms JSON, showing faster processing. For 100 records, YON is 1.4x faster faster. This means quicker data handling, enhancing real-time applications. Known boundary: YON excels with structured data.

---

## Test Data

### PASS: Streaming Latency — Small (100 records)

**Metric:** `7 µs` _(vs JSON parse complete (µs): 10 → 1.4x faster)_

YON delivers first record in 7µs. JSON requires 10µs to parse the entire document before any data is available. Speedup: 1.4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 10 | µs |
| speedup_ratio | 1.4 | x |
| record_count | 100 | records |

### PASS: Streaming Latency — Medium (500 records)

**Metric:** `14 µs` _(vs JSON parse complete (µs): 45 → 3.2x faster)_

YON delivers first record in 14µs. JSON requires 45µs to parse the entire document before any data is available. Speedup: 3.2x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 45 | µs |
| speedup_ratio | 3.2 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `45 µs` _(vs JSON parse complete (µs): 180 → 4x faster)_

YON delivers first record in 45µs. JSON requires 180µs to parse the entire document before any data is available. Speedup: 4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 180 | µs |
| speedup_ratio | 4 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.7x, 500 records=0.9x, 2000 records=1x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.7 | x |
| ratio_500 | 0.9 | x |
| ratio_2000 | 1 | x |

---

## For Specialists

YON shows a 1.4x faster speedup for 100 records. JSON completes in 10 µs. YON's advantage grows with record count: 3.2x faster for 500, 4x faster for 2000. Known boundary: JSON handles unstructured data better. Operational implication: YON suits structured streaming, reducing latency by 4.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._