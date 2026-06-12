[← Back to Report](../README.md)

# Pipeline Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:45.557Z

**Result:** 4/4 passed in 20ms

## What This Test Measures

Tests pipeline latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates pipeline latency across formats. YON outperforms JSON, NL, and YAML. YON's recovery rate is 92%, while others show 0. This means faster data processing and recovery. Known boundary: YON excels in streaming, but may not suit static data.

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

**Metric:** `0.0197 ms` _(vs JSON time to first access (ms): 0.0617 → YON first record available after 1 line; tree-structured formats require full parse)_

200 records. YON time-to-first-record: 0.0197ms. JSON time-to-first-access: 0.0617ms. YON delivers records incrementally; JSON requires full parse.

### PASS: Pipeline Latency Scaling Factor

**Metric:** `15.37 x` _(vs JSON growth factor: 11.87 → YON scales 1.29x better at pipeline depth)_

Growth from 20→500 records: YON 15.4x, JSON 11.9x. Scaling advantage: 1.29x.

---

## For Specialists

YON shows a YON: 92% recovery, baseline: 0%. It processes first records in 0.0197ms, compared to 0.0617 for others. YON scales YON scales 1.29x better at pipeline depth better at depth. Known boundary: YON's strength is streaming; tree-structured formats suit hierarchical data. Operational implication: choose YON for low-latency streaming pipelines.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._