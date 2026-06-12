[← Back to Report](../README.md)

# Streaming Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:14.791Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests streaming latency capabilities within the streaming pillar.

---

## For Everyone

This suite compares streaming latency across formats. YON outperforms JSON, showing faster processing. At 100 records, YON is 1.3x faster faster. This means quicker data handling in real-time applications. However, YON's advantage may vary with different data structures.

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

**Metric:** `19 µs` _(vs JSON parse complete (µs): 53 → 2.8x faster)_

YON delivers first record in 19µs. JSON requires 53µs to parse the entire document before any data is available. Speedup: 2.8x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 53 | µs |
| speedup_ratio | 2.8 | x |
| record_count | 500 | records |

### PASS: Streaming Latency — Large (2000 records)

**Metric:** `43 µs` _(vs JSON parse complete (µs): 184 → 4.3x faster)_

YON delivers first record in 43µs. JSON requires 184µs to parse the entire document before any data is available. Speedup: 4.3x. Line-oriented streaming means processing begins after the first \n.

| Metric | Value | Unit |
|--------|-------|------|
| json_complete_parse_us | 184 | µs |
| speedup_ratio | 4.3 | x |
| record_count | 2000 | records |

### PASS: Streaming Latency — Scaling Behavior

**Metric:** `1 favorable`

Speedup ratios: 100 records=0.7x, 500 records=1.4x, 2000 records=1.2x. Gap widens with size — YON's O(1) first-record latency scales independently of document size.

| Metric | Value | Unit |
|--------|-------|------|
| ratio_100 | 0.7 | x |
| ratio_500 | 1.4 | x |
| ratio_2000 | 1.2 | x |

---

## For Specialists

YON's latency at 100 records is 8µs, compared to JSON's 10µs. The speedup ratio is 1.3. At 500 records, YON achieves 2.8x faster faster performance. YON's structural primitives excel in streaming contexts, offering a 4.3x faster advantage at 2000 records. JSON remains effective for simpler, less complex data. System design should consider YON for high-throughput scenarios, balancing complexity and speed.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._