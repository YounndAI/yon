[← Back to Report](../README.md)

# Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:31.509Z

**Result:** 4/4 passed in 1ms

## What This Test Measures

Measures how much valid data survives when a document contains corrupted lines. YON recovers per-line; JSON loses everything to bracket cascade.

**Method:** Injects corruption at random positions and measures recovery rate.

**YON feature tested:** Single-line error isolation

---

## For Everyone

This suite compares error recovery in YON and JSON. YON recovers 99% of data, while JSON recovers none. YON's single-line error isolation offers a 99% vs 0% advantage. JSON's bracket cascade is a known boundary, losing all data when errors occur.

---

## Test Data

### PASS: Single-Line Corruption Recovery

**Metric:** `99 %` _(vs JSON recovery %: 0 → 99% vs 0%)_

YON recovered 100/101 records (99%). JSON: total failure (0/100). Line-oriented format enables record-level fault isolation.

| Metric | Value | Unit |
|--------|-------|------|
| yon_records | 100 | records |
| json_records | 0 | records |

### PASS: Multi-Point Corruption Recovery (5 faults)

**Metric:** `96 records` _(vs JSON recovery (total fail): 0 → 96 vs 0)_

5 corruption points injected. YON recovered 96/101 records (95%). JSON: total failure. Each fault is isolated to its line.

### PASS: Stream Truncation Recovery (60% of doc)

**Metric:** `60 records` _(vs JSON truncation recovery: 0 → 60 vs 0)_

Document truncated at 60%. YON recovered 60 records (all complete lines before cut point). JSON: total failure. Streaming-first design means every complete line is immediately usable.

### PASS: Encoding Corruption Resilience

**Metric:** `51 records` _(vs total records: 51 → 100% survived)_

3 lines corrupted with replacement characters. YON recovered 51/51 records (100%). Line-per-record isolation limits blast radius.

---

## For Specialists

YON recovers 100 records per single-line error. JSON recovers 0 records, showing a 99% vs 0% delta. YON's multi-point corruption recovery is 96 records, compared to JSON's 0. Truncation recovery in YON is 60 records, with JSON at 0. Encoding corruption sees YON at 51 records, maintaining 100% survival. YON's structural primitives excel in streaming, while JSON's bracket dependency limits recovery. This impacts system design by favoring YON for error-prone environments.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._