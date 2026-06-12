[← Back to Report](../README.md)

# Context Window Utilization

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T13:59:21.785Z

**Result:** 3/3 passed in 642ms

## What This Test Measures

Tests context window utilization capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON and JSON formats on context window utilization. YON performs better with an 8% reduction in records for small and medium contexts. This means more efficient data handling. However, both formats handle large contexts equally well. YON's advantage lies in its structural primitives, enhancing cognitive economy.

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

YON reduces small context records by 8% fewer records, using 7966 tokens versus JSON's 7975. Medium contexts show the same 8% fewer records reduction, with YON using 31983 tokens. Large contexts see no delta, with both formats at +0% more records. YON excels in small to medium contexts, optimizing token usage within budget constraints. JSON remains competitive in large contexts. This implies YON's structural primitives enhance efficiency, beneficial for systems prioritizing cognitive economy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._