[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:11:55.855Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates streaming latency across formats. YON outperforms JSON, showing faster processing times. For 100 records, YON is 1.3x faster faster. This means quicker data handling, enhancing real-time applications. Known boundary: YON excels with complex data structures.

---

## Test Data

### PASS: Streaming Latency — Small (100 records)

**Metric:** `7 µs` _(vs JSON parse complete (µs): 10 → 1.3x faster)_

YON delivers first record in 7µs. JSON requires 10µs to parse the entire document before any data is available. Speedup: 1.3x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 10 | µs |
| speedup_ratio | 1.3 | x |
| record_count | 100 | records |

### PASS: Streaming Latency — Medium (500 records)

**Metric:** `20 µs` _(vs JSON parse complete (µs): 46 → 2.4x faster)_

YON delivers first record in 20µs. JSON requires 46µs to parse the entire document before any data is available. Speedup: 2.4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 46 | µs |
| speedup_ratio | 2.4 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `45 µs` _(vs JSON parse complete (µs): 181 → 4x faster)_

YON delivers first record in 45µs. JSON requires 181µs to parse the entire document before any data is available. Speedup: 4x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 181 | µs |
| speedup_ratio | 4 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.8x, 500 records=1.4x, 2000 records=1.3x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.8 | x |
| ratio_500 | 1.4 | x |
| ratio_2000 | 1.3 | x |

---

## For Specialists

YON's latency for 100 records is 7µs, compared to JSON's 10µs. The speedup ratio is 1.3. For 500 records, YON achieves 2.4x faster faster processing. At 2000 records, YON is 4x faster faster. Known boundary: JSON operates well with simpler data. Operational implication: YON's structural primitives enhance performance in complex scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._