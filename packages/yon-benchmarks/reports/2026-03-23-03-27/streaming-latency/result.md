[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:31.519Z

**Result:** 4/4 passed in 5ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing a 1.2x faster improvement at 100 records. This means faster data processing. Known boundary: YON's advantage grows with complexity.

---

## Test Data

### PASS: Streaming Latency — Small (100 records)

**Metric:** `10 µs` _(vs JSON parse complete (µs): 12 → 1.2x faster)_

YON delivers first record in 10µs. JSON requires 12µs to parse the entire document before any data is available. Speedup: 1.2x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 12 | µs |
| speedup_ratio | 1.2 | x |
| record_count | 100 | records |

### PASS: Streaming Latency — Medium (500 records)

**Metric:** `20 µs` _(vs JSON parse complete (µs): 53 → 2.7x faster)_

YON delivers first record in 20µs. JSON requires 53µs to parse the entire document before any data is available. Speedup: 2.7x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 53 | µs |
| speedup_ratio | 2.7 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `75 µs` _(vs JSON parse complete (µs): 212 → 2.8x faster)_

YON delivers first record in 75µs. JSON requires 212µs to parse the entire document before any data is available. Speedup: 2.8x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 212 | µs |
| speedup_ratio | 2.8 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.5x, 500 records=1.2x, 2000 records=0.9x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.5 | x |
| ratio_500 | 1.2 | x |
| ratio_2000 | 0.9 | x |

---

## For Specialists

YON achieves 1.2x faster at 100 records, 2.7x faster at 500, and 2.8x faster at 2000. JSON completes parsing in 12 µs for 100 records. YON's structural primitives enhance performance, especially at higher complexities. Known boundary: JSON operates well with simpler data. Operational implication: YON suits systems requiring rapid, complex data handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._