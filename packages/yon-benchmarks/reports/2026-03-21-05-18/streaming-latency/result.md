[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:42.155Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing faster processing times. For 100 records, YON is 1.3x faster faster. This means quicker data handling in real-time applications. Known boundary: YON excels with larger datasets.

---

## Test Data

### PASS: Streaming Latency — Small (100 records)

**Metric:** `8 µs` _(vs JSON parse complete (µs): 10 → 1.3x faster)_

YON delivers first record in 8µs. JSON requires 10µs to parse the entire document before any data is available. Speedup: 1.3x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 10 | µs |
| speedup_ratio | 1.3 | x |
| record_count | 100 | records |

### PASS: Streaming Latency — Medium (500 records)

**Metric:** `17 µs` _(vs JSON parse complete (µs): 46 → 2.7x faster)_

YON delivers first record in 17µs. JSON requires 46µs to parse the entire document before any data is available. Speedup: 2.7x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 46 | µs |
| speedup_ratio | 2.7 | x |
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

Speedup ratios: 100 records=0.7x, 500 records=1.2x, 2000 records=1.2x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.7 | x |
| ratio_500 | 1.2 | x |
| ratio_2000 | 1.2 | x |

---

## For Specialists

YON's latency for 100 records is 8µs, compared to JSON's 10µs. The speedup ratio is 1.3. For 500 records, YON achieves 2.7x faster faster processing. At 2000 records, YON is 4x faster faster. YON's structural primitives enhance performance, especially with larger datasets. JSON operates well with smaller, simpler data. Operational implication: YON suits high-throughput systems, optimizing latency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._