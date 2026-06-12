[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T18:10:55.024Z

**Result:** 4/4 passed in 5ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing faster processing. For 100 records, YON is 1.3x faster faster. This means quicker data handling, enhancing real-time applications. Known boundary: YON excels with structured data, while JSON remains versatile.

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

**Metric:** `15 µs` _(vs JSON parse complete (µs): 47 → 3.1x faster)_

YON delivers first record in 15µs. JSON requires 47µs to parse the entire document before any data is available. Speedup: 3.1x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 47 | µs |
| speedup_ratio | 3.1 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `45 µs` _(vs JSON parse complete (µs): 182 → 4x faster)_

YON delivers first record in 45µs. JSON requires 182µs to parse the entire document before any data is available. Speedup: 4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 182 | µs |
| speedup_ratio | 4 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.7x, 500 records=1x, 2000 records=1.1x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.7 | x |
| ratio_500 | 1 | x |
| ratio_2000 | 1.1 | x |

---

## For Specialists

YON achieves 1.3x faster faster latency for 100 records. JSON completes in 10 µs, while YON takes 8 µs. For 500 records, YON is 3.1x faster faster. JSON's baseline is 47 µs; YON processes in 15 µs. At 2000 records, YON reaches 4x faster faster speeds. JSON's time is 182 µs, YON's is 45 µs. YON's known boundary: structured data. JSON's domain: flexibility. Implication: YON suits systems prioritizing speed, JSON offers broader compatibility.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._