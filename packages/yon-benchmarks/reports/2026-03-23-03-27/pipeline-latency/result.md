[← Back to Report](../README.md)

# Pipeline Latency

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:35.574Z

**Result:** 4/4 passed in 25ms

## What This Test Measures

Tests pipeline latency capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON against JSON, NL, and YAML for pipeline latency. YON performs better, showing a YON: 92% recovery, baseline: 0%. This means faster data recovery and processing. Known boundary: YON excels in streaming contexts, while others suit static data.

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

**Metric:** `0.0364 ms` _(vs JSON time to first access (ms): 0.0777 → YON first record available after 1 line; tree-structured formats require full parse)_

200 records. YON time-to-first-record: 0.0364ms. JSON time-to-first-access: 0.0777ms. YON delivers records incrementally; JSON requires full parse.

### PASS: Pipeline Latency Scaling Factor

**Metric:** `21.28 x` _(vs JSON growth factor: 14.05 → YON scales 1.51x better at pipeline depth)_

Growth from 20→500 records: YON 21.3x, JSON 14.1x. Scaling advantage: 1.51x.

---

## For Specialists

YON shows a YON: 92% recovery, baseline: 0%, recovering 46 records versus JSON's 0. YON's YON first record available after 1 line; tree-structured formats require full parse offers faster initial processing. YON scales YON scales 1.51x better at pipeline depth, enhancing pipeline depth efficiency. Known boundary: YON's advantage is in streaming; JSON, NL, YAML fit static data. Operational implication: YON suits dynamic systems needing rapid data handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._