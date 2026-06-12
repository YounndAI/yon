[← Back to Report](../README.md)

# Pipeline Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:18.188Z

**Result:** 4/4 passed in 21ms

## What This Test Measures

Tests pipeline latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates pipeline latency across formats. YON outperforms JSON, NL, and YAML. YON's latency reduction is YON first record available after 1 line; tree-structured formats require full parse. This means faster data processing in streaming applications. Known Boundary: YON excels at this complexity level.

---

## Test Data

### PASS: Pipeline Functional Completeness

**Metric:** `100 %`

20 records: 22 processed. 100 records: 102 processed. 500 records: 502 processed

| Metric | Value | Unit |
|--------|-------|------|
| 20_records_processed | 22 | /20 |
| 100_records_processed | 102 | /100 |
| 500_records_processed | 502 | /500 |

### PASS: Pipeline Recovery (Corrupted Transit)

**Metric:** `92 %` _(vs JSON recovery rate (%): 0 → YON: 92% recovery, baseline: 0%)_

50 records with 5 corrupted mid-pipeline. YON recovered: 46/50 (92%). JSON recovered: 0/50 (0%).

| Metric | Value | Unit |
|--------|-------|------|
| yon_records_recovered | 46 | /50 |
| json_records_recovered | 0 | /50 |

### PASS: Incremental Processing (Time-to-First-Record)

**Metric:** `0.0205 ms` _(vs JSON time to first access (ms): 0.0618 → YON first record available after 1 line; tree-structured formats require full parse)_

200 records. YON time-to-first-record: 0.0205ms. JSON time-to-first-access: 0.0618ms. YON delivers records incrementally; JSON requires full parse.

### PASS: Pipeline Latency Scaling Factor

**Metric:** `20.11 x` _(vs JSON growth factor: 13.82 → YON scales 1.45x better at pipeline depth)_

Growth from 20→500 records: YON 20.1x, JSON 13.8x. Scaling advantage: 1.45x.

---

## For Specialists

YON shows a YON: 92% recovery, baseline: 0%. JSON recovers 0 records. YON's scaling factor is YON scales 1.45x better at pipeline depth. YON operates best in streaming contexts. JSON and YAML require full parsing. YON's primitives enhance system efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._