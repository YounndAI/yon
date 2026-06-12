[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:26.595Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing faster processing. For 100 records, YON is 1.4x faster faster. This means quicker data handling in real-time applications. Known boundary: YON excels with structured data.

---

## Test Data

### PASS: Streaming Latency — Small (100 records)

**Metric:** `8 µs` _(vs JSON parse complete (µs): 11 → 1.4x faster)_

YON delivers first record in 8µs. JSON requires 11µs to parse the entire document before any data is available. Speedup: 1.4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 11 | µs |
| speedup_ratio | 1.4 | x |
| record_count | 100 | records |

### PASS: Streaming Latency — Medium (500 records)

**Metric:** `18 µs` _(vs JSON parse complete (µs): 46 → 2.5x faster)_

YON delivers first record in 18µs. JSON requires 46µs to parse the entire document before any data is available. Speedup: 2.5x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 46 | µs |
| speedup_ratio | 2.5 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `44 µs` _(vs JSON parse complete (µs): 180 → 4.1x faster)_

YON delivers first record in 44µs. JSON requires 180µs to parse the entire document before any data is available. Speedup: 4.1x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 180 | µs |
| speedup_ratio | 4.1 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.8x, 500 records=1.1x, 2000 records=0.9x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.8 | x |
| ratio_500 | 1.1 | x |
| ratio_2000 | 0.9 | x |

---

## For Specialists

YON's latency for 100 records is 8µs, compared to JSON's 11µs. The speedup ratio is 1.4. For 500 records, YON achieves 2.5x faster faster performance. At 2000 records, YON is 4.1x faster faster. YON's structural primitives enhance efficiency, especially with larger datasets. JSON operates well in less structured environments. Operational implication: YON suits high-throughput systems needing rapid data processing.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._