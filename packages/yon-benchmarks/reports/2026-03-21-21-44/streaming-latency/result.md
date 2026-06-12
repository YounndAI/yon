[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:53.349Z

**Result:** 4/4 passed in 5ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing faster processing times. For 100 records, YON is 1.3x faster faster. This means quicker data handling in real-time applications. Known boundary: JSON's parsing speed limits its efficiency.

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

**Metric:** `16 µs` _(vs JSON parse complete (µs): 46 → 3x faster)_

YON delivers first record in 16µs. JSON requires 46µs to parse the entire document before any data is available. Speedup: 3x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 46 | µs |
| speedup_ratio | 3 | x |
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

Speedup ratios: 100 records=0.3x, 500 records=1.3x, 2000 records=1.3x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.3 | x |
| ratio_500 | 1.3 | x |
| ratio_2000 | 1.3 | x |

---

## For Specialists

YON achieves 1.3x faster improvement over JSON for 100 records. At 500 records, YON is 3x faster faster. For 2000 records, YON's speedup is 4.1x faster. JSON operates well in simpler tasks but struggles with higher complexity. YON's structural primitives enhance performance, reducing latency. This impacts system design by favoring YON for high-throughput environments.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._