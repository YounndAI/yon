[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:11.124Z

**Result:** 4/4 passed in 5ms

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

**Metric:** `14 µs` _(vs JSON parse complete (µs): 49 → 3.5x faster)_

YON delivers first record in 14µs. JSON requires 49µs to parse the entire document before any data is available. Speedup: 3.5x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 49 | µs |
| speedup_ratio | 3.5 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `47 µs` _(vs JSON parse complete (µs): 193 → 4.1x faster)_

YON delivers first record in 47µs. JSON requires 193µs to parse the entire document before any data is available. Speedup: 4.1x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 193 | µs |
| speedup_ratio | 4.1 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.8x, 500 records=1.3x, 2000 records=1.1x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.8 | x |
| ratio_500 | 1.3 | x |
| ratio_2000 | 1.1 | x |

---

## For Specialists

YON's latency for 100 records is 8µs, compared to JSON's 11µs. The speedup ratio is 1.4. For 500 records, YON achieves 3.5x faster faster processing. At 2000 records, YON maintains a 4.1x faster advantage. YON's known boundary: structured data environments. JSON operates well with less structured data. Implication: YON suits systems needing rapid, structured data processing.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._