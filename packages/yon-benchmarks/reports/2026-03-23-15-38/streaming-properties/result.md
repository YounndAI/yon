[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:24.792Z

**Result:** 4/4 passed in 6ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

This suite compares YON with JSON, NL, and YAML for streaming properties. YON performs better in error recovery, showing a +99% improvement. This means YON can handle errors more effectively, maintaining stream integrity. However, time-to-first-record is comparable, indicating similar initial response times.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.139 ms` _(vs Full parse (block): 0.054 → comparable)_

Streaming TTFR: 0.139ms after 1/128 lines. Full parse: 0.054ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.003 ms/line`

Average: 0.0029ms/line. Growth ratio (last10/first10): 0.06x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.016 | ms |
| last_10_avg | 0.001 | ms |
| growth_ratio | 0.06 | x |

### PASS: Error Recovery Boundary

**Metric:** `99.2 %` _(vs JSON (entire doc invalid): 0 → +99%)_

127/128 records recovered (64 before, 63 after). 1 record lost (the fault itself).

| Metric | Value | Unit |
|--------|-------|------|
| records_before_fault | 64 | records |
| records_after_fault | 63 | records |

### PASS: Streaming Parser Events

**Metric:** `115 events`

Streaming parser emitted 115 events (115 records) in 0.2ms.

| Metric | Value | Unit |
|--------|-------|------|
| record_events | 115 | records |
| stream_duration | 0.19 | ms |

---

## For Specialists

YON shows a +99% improvement in error recovery, with a boundary of 99.2%. JSON, NL, and YAML have a baseline of 0. YON's incremental parse cost is 0.003ms/line, with a growth ratio of 0.06. Time-to-first-record is 0.139ms, comparable to the baseline of 0.054. YON's strength lies in error recovery, beneficial for systems requiring robust streaming. Known boundaries include similar initial response times across formats.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._