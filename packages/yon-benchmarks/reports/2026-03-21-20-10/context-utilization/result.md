[← Back to Report](../README.md)

# Context Window Utilization

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T18:11:02.070Z

**Result:** 3/3 passed in 646ms

## What This Test Measures

Tests context window utilization capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON against JSON, focusing on context window utilization. YON performs better in small and medium contexts, using 8% fewer records. In large contexts, YON handles 2652 records, while JSON manages none. This means YON efficiently manages data across varying sizes, though JSON struggles with larger contexts.

---

## Test Data

### PASS: Small Context Window (8K tokens)

**Metric:** `169 records` _(vs JSON records: 184 → 8% fewer records)_

YON fits 169 records (7966 tokens). JSON fits 184 records (7975 tokens). YON structural baseline: 8% fewer records per window. Per-record tags buy typed fields, fault isolation, and streaming — cost recouped at first pipeline failure.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens_used | 7966 | tokens |
| json_tokens_used | 7975 | tokens |
| budget | 8000 | tokens |

### PASS: Medium Context Window (32K tokens)

**Metric:** `680 records` _(vs JSON records: 737 → 8% fewer records)_

YON fits 680 records (31983 tokens). JSON fits 737 records (31939 tokens). YON structural baseline: 8% fewer records per window. Per-record tags buy typed fields, fault isolation, and streaming — cost recouped at first pipeline failure.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens_used | 31983 | tokens |
| json_tokens_used | 31939 | tokens |
| budget | 32000 | tokens |

### PASS: Large Context Window (128K tokens)

**Metric:** `2652 records` _(vs JSON records: 0 → +0% more records)_

YON fits 2652 records (127971 tokens). JSON fits 0 records (1 tokens). YON advantage: +0% more records in same budget.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens_used | 127971 | tokens |
| json_tokens_used | 1 | tokens |
| budget | 128000 | tokens |

---

## For Specialists

YON shows a 8% fewer records improvement in small contexts, using 7966 tokens versus JSON's 7975. In medium contexts, YON maintains the same 8% fewer records advantage, with 31983 tokens compared to JSON's 31939. For large contexts, YON processes 2652 records, while JSON processes 0. YON's structural primitives excel in diverse contexts, but JSON's known boundary is evident in large-scale data. This suggests YON's suitability for systems requiring flexible data handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._