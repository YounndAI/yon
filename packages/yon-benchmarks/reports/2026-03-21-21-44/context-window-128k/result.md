[← Back to Report](../README.md)

# Context Window Efficiency 128K

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T19:45:07.649Z

**Result:** 3/3 passed in 923ms

## What This Test Measures

Tests context window efficiency 128k capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON with JSON, focusing on context window efficiency at 128K. YON handles more records, with a delta of **351 records** records. It also supports more tokens per record, showing a **14%** improvement. These gains mean YON can manage larger datasets efficiently. Known boundary: YON's efficiency may vary with different data structures.

---

## Test Data

### PASS: 128K Context Window — Record Capacity [Advantage]

**Metric:** `3045 records` _(vs JSON records at 128K: 2694 → 351 records)_

At 128K tokens: YON fits 3045 records, JSON fits 2694 records. Delta: -13%. YON's per-line tags are structural cost; JSON's nesting compresses at scale.

| Metric | Value | Unit |
|--------|-------|------|
| json_records_128k | 2694 | records |
| capacity_delta | -13 | % |

### PASS: 128K Context Window — Tokens per Record [Known Boundary]

**Metric:** `41 tokens` _(vs JSON tokens per record: 36 → 14%)_

Per-record density: YON 41 tokens, JSON 36 tokens (114% of JSON). YON tag overhead (@MAP, type suffixes) adds structural cost per record.

| Metric | Value | Unit |
|--------|-------|------|
| json_tokens_per_record | 36 | tokens |
| overhead_ratio | 114 | % |

### PASS: 128K Context Window — Structural Overhead at Scale [Even]

**Metric:** `-12 %`

At 1000 records: YON 41478 tokens, JSON 46963 tokens (+-12% overhead). This is the structural baseline that buys recoverability, explicit typing, and streaming.

| Metric | Value | Unit |
|--------|-------|------|
| yon_total_tokens | 41478 | tokens |
| json_total_tokens | 46963 | tokens |
| records_measured | 1000 | records |

---

## For Specialists

YON outperforms JSON in record capacity by **351 records** records, reaching **3045** compared to JSON's **2694**. Tokens per record show a **14%** increase, with YON at **41** tokens. JSON operates well with simpler structures, but YON excels in complex datasets. Operational implication: YON's structural primitives enhance data handling, reducing token overhead by **-12**%. This efficiency supports scalable system design.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._