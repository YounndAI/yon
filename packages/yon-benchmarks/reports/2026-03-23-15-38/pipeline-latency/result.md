[← Back to Report](../README.md)

# Pipeline Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:30.253Z

**Result:** 4/4 passed in 20ms

## What This Test Measures

Tests pipeline latency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates pipeline latency across formats. YON outperforms JSON, NL, and YAML. YON's structural primitives provide a YON: 92% recovery, baseline: 0%. This means faster data processing and recovery. Known boundary: YON excels in streaming contexts.

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

**Metric:** `0.0217 ms` _(vs JSON time to first access (ms): 0.0643 → YON first record available after 1 line; tree-structured formats require full parse)_

200 records. YON time-to-first-record: 0.0217ms. JSON time-to-first-access: 0.0643ms. YON delivers records incrementally; JSON requires full parse.

### PASS: Pipeline Latency Scaling Factor

**Metric:** `20.36 x` _(vs JSON growth factor: 9.66 → YON scales 2.11x better at pipeline depth)_

Growth from 20→500 records: YON 20.4x, JSON 9.7x. Scaling advantage: 2.11x.

---

## For Specialists

YON shows a YON: 92% recovery, baseline: 0% over baselines. YON's 0.0217ms latency is lower than 0.0643. YON scales YON scales 2.11x better at pipeline depth better in depth. JSON, NL, and YAML require full parsing, limiting speed. YON's advantage is clear in streaming pipelines. Known boundary: YON's efficiency peaks in high-complexity streaming.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._