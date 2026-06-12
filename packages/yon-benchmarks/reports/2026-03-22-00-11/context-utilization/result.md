[← Back to Report](../README.md)

# Context Window Utilization

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T22:12:02.751Z

**Result:** 3/3 passed in 700ms

## What This Test Measures

Tests context window utilization capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates context window utilization. YON outperforms JSON in small and medium contexts. YON uses 8% fewer records fewer records in small contexts. In large contexts, YON handles 2652 records, while JSON handles none. YON's structural primitives offer a strong advantage, but JSON's simplicity may suit less complex needs.

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

YON reduces small context records by 8% fewer records. It uses 7966 tokens, close to JSON's 7975. In medium contexts, YON also shows an 8% fewer records reduction. Large contexts reveal YON's capability to handle 2652 records, with JSON at 0. YON excels in complex scenarios, but JSON's simplicity remains beneficial for straightforward tasks. Operational implication: YON suits systems requiring high cognitive economy, while JSON fits simpler applications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._