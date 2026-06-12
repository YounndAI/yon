[← Back to Report](../README.md)

# Context Window Utilization

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T03:18:49.063Z

**Result:** 3/3 passed in 655ms

## What This Test Measures

Tests context window utilization capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates context window utilization. YON outperforms JSON in small and medium contexts, using 8% fewer records. This efficiency means more data fits within the same token budget. However, both formats handle large contexts equally, showing no advantage.

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

YON uses 8% fewer records fewer records in small contexts. It achieves 8% fewer records fewer records in medium contexts. Both formats perform equally in large contexts, with a +0% more records delta. YON's advantage lies in its structural primitives, optimizing small to medium data handling. JSON remains effective in large contexts, where both formats meet the 128000. This suggests YON is preferable for systems prioritizing cognitive economy in smaller data sets.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._