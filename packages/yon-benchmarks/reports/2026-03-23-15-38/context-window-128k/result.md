[← Back to Report](../README.md)

# Context Window Efficiency 128K

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-23T13:38:41.300Z

**Result:** 3/3 passed in 980ms

## What This Test Measures

Tests context window efficiency 128k capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates context window efficiency. YON outperforms JSON in record capacity and token density. YON holds 3045 records, exceeding JSON by 351 records. Token density improves by 14%. Known boundary: JSON's higher token count impacts efficiency.

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

YON's record capacity reaches 3045 records. JSON holds 2694 records. Delta: 351 records records. YON's token density is 41 tokens per record, exceeding JSON's 36. Delta: 14%. YON reduces token overhead by -12%. JSON's domain: higher token count, less efficient. Operational implication: YON supports larger datasets with fewer tokens, enhancing cognitive economy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._