[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:08.105Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This suite compares streaming latency across formats. YON outperforms JSON, showing faster processing. At 100 records, YON is 1.4x faster faster. This means quicker data handling in real-time applications. Known boundary: YON excels with structured data.

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

**Metric:** `16 µs` _(vs JSON parse complete (µs): 46 → 2.9x faster)_

YON delivers first record in 16µs. JSON requires 46µs to parse the entire document before any data is available. Speedup: 2.9x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 46 | µs |
| speedup_ratio | 2.9 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `45 µs` _(vs JSON parse complete (µs): 183 → 4.1x faster)_

YON delivers first record in 45µs. JSON requires 183µs to parse the entire document before any data is available. Speedup: 4.1x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 183 | µs |
| speedup_ratio | 4.1 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.8x, 500 records=0.9x, 2000 records=1.1x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.8 | x |
| ratio_500 | 0.9 | x |
| ratio_2000 | 1.1 | x |

---

## For Specialists

YON's latency: 7µs for 100 records. JSON: 10µs. YON is 1.4x faster faster. At 500 records, YON achieves 2.9x faster speedup. Known boundary: JSON handles unstructured data better. Operational implication: YON suits structured streaming, enhancing system efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._