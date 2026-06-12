[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:09.221Z

**Result:** 4/4 passed in 2ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

This comparison evaluates streaming efficiency. YON and baseline formats like JSON and YAML were tested. YON performs better in error recovery, with a +99% advantage. This means YON handles streaming faults more effectively. Known boundary: YON's time-to-first-record is comparable to others.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.078 ms` _(vs Full parse (block): 0.055 → comparable)_

Streaming TTFR: 0.078ms after 1/128 lines. Full parse: 0.055ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.002 ms/line`

Average: 0.0024ms/line. Growth ratio (last10/first10): 0.05x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.014 | ms |
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
| stream_duration | 0.14 | ms |

---

## For Specialists

YON's error recovery rate is 99.2%, exceeding the baseline by +99%. Time-to-first-record is 0.078ms, comparable to 0.055. YON excels in error recovery, processing 115 events in 0.14. Known boundary: YON's incremental parse cost is 0.002ms/line. Operational implication: YON's structure supports robust streaming, enhancing system resilience.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._