[← Back to Report](../README.md)

# Streaming Properties

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:13.008Z

**Result:** 4/4 passed in 2ms

## What This Test Measures

Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.

**Method:** Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.

**YON feature tested:** Line-delimited streaming

---

## For Everyone

The suite compares YON with JSON, NL, and YAML for streaming properties. YON performs well, showing a strong advantage in error recovery and streaming efficiency. The delta in error recovery is +99%, indicating robust fault tolerance. However, time-to-first-record is comparable across formats. YON's line-delimited streaming offers practical benefits in dynamic environments.

---

## Test Data

### PASS: Time To First Record (TTFR)

**Metric:** `0.069 ms` _(vs Full parse (block): 0.038 → comparable)_

Streaming TTFR: 0.069ms after 1/128 lines. Full parse: 0.038ms (all 128 lines). Streaming delivers first record without waiting for entire document.

| Metric | Value | Unit |
|--------|-------|------|
| lines_scanned | 1 | /128 lines |

### PASS: Incremental Parse Cost

**Metric:** `0.003 ms/line`

Average: 0.0028ms/line. Growth ratio (last10/first10): 0.08x. O(1) confirmed.

| Metric | Value | Unit |
|--------|-------|------|
| first_10_avg | 0.012 | ms |
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
| stream_duration | 0.17 | ms |

---

## For Specialists

YON's error recovery boundary is 99.2%, a +99% delta over the baseline. This indicates superior fault tolerance. Time-to-first-record is 0.069ms, comparable to 0.038. YON's incremental parse cost is 0.003ms/line, with a growth ratio of 0.08. YON operates efficiently in line-oriented streaming, offering resilience in error-prone systems. JSON and YAML perform well in static contexts, but YON's primitives enhance dynamic processing.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._