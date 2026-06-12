[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:29.578Z

**Result:** 4/4 passed in 5ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

This suite compares YON's streaming properties against JSON, NL, and YAML. YON performs better in error recovery, with a +99% improvement. Time-to-first-record is comparable across formats. YON's line-delimited streaming offers a practical advantage in error handling, though initial record availability remains similar.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.103 ms` _(vs Full parse (block): 0.044 → comparable)_

Streaming TTFR: 0.103ms after 1/128 lines. Full parse: 0.044ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.002 ms/line`

Average: 0.0022ms/line. Growth ratio (last10/first10): 0.05x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.012 | ms |
| last_10_avg | 0.001 | ms |
| growth_ratio | 0.05 | x |

### PASS: Error Recovery Boundary

**Metric:** `99.2 %` _(vs JSON (entire doc invalid): 0 → +99%)_

127/128 records recovered (64 before, 63 after). 1 record lost (the fault itself).

| Metric | Value | Unit |
|--------|-------|------|
| records_before_fault | 64 | records |
| records_after_fault | 63 | records |

### PASS: Streaming Parser Events

**Metric:** `115 events`

Streaming parser emitted 115 events (115 records) in 0.1ms.

| Metric | Value | Unit |
|--------|-------|------|
| record_events | 115 | records |
| stream_duration | 0.13 | ms |

---

## For Specialists

YON's error recovery boundary is 99.2%, a +99% increase over the baseline. Time-to-first-record is 0.103ms, comparable to 0.044. YON excels in error recovery, handling 64 records before fault. JSON and YAML operate well in structured environments but lack YON's error resilience. This suggests YON's suitability for systems requiring robust error handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._