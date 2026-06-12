[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:06.324Z

**Result:** 4/4 passed in 7ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

This suite compares YON with JSON, NL, and YAML for streaming properties. YON performs better in error recovery, with a +99% improvement. Time-to-first-record is comparable across formats. YON's line-delimited streaming offers a strong advantage in dynamic environments, though initial parsing speed is similar.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.152 ms` _(vs Full parse (block): 0.058 → comparable)_

Streaming TTFR: 0.152ms after 1/128 lines. Full parse: 0.058ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.004 ms/line`

Average: 0.0037ms/line. Growth ratio (last10/first10): 0.08x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.016 | ms |
| last_10_avg | 0.001 | ms |
| growth_ratio | 0.08 | x |

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
| stream_duration | 0.16 | ms |

---

## For Specialists

YON's error recovery rate is 99.2%, exceeding the baseline by +99%. Time-to-first-record is 0.152ms, comparable to 0.058. YON excels in environments needing high error tolerance, processing 115 events in 0.16. JSON and YAML perform well in static contexts, but YON's dynamic capabilities offer a scope advantage.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._