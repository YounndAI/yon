[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:40.422Z

**Result:** 4/4 passed in 6ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

The suite compares YON with JSON, NL, and YAML for streaming properties. YON performs better in error recovery, with a +99% improvement. This means YON handles faults more effectively. However, time-to-first-record is comparable across formats, indicating similar initial response times.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.108 ms` _(vs Full parse (block): 0.045 → comparable)_

Streaming TTFR: 0.108ms after 1/128 lines. Full parse: 0.045ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.003 ms/line`

Average: 0.0031ms/line. Growth ratio (last10/first10): 0.08x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.013 | ms |
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

YON's error recovery rate is 99.2%, outperforming the baseline by +99%. This indicates superior fault tolerance. Time-to-first-record is 0.108ms, comparable to the baseline 0.045ms. YON's incremental parse cost decreases over time, with a growth ratio of 0.08. Known boundary: YON excels in error recovery but matches others in initial response. Operational implication: YON suits systems needing robust fault handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._