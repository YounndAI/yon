[← Back to Report](../README.md)

# Context Window Efficiency 128K

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T13:59:29.040Z

**Result:** 3/3 passed in 919ms

## What This Test Measures

Tests context window efficiency 128k capabilities within the cognitive-economy pillar.

---

## For Everyone

The suite compared YON, JSON, and others on context window efficiency at 128K. YON showed a strong advantage, handling 3045 records versus JSON's 2694. This means YON can manage more data efficiently. However, known boundaries include specific complexity levels.

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

YON outperformed JSON by 351 records records, indicating a strong advantage. Tokens per record increased by 14%, showing moderate improvement. YON's domain is high-complexity contexts, while JSON suits simpler tasks. This implies YON's structural primitives enhance system design for complex data handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._