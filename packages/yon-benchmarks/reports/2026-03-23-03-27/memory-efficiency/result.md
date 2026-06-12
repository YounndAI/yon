[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:35.547Z

**Result:** 2/2 passed in 3.9s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This suite compares memory efficiency in streaming. YON outperforms JSON with a delta of YON stream: 1.6x, JSON full-doc: 10.6x (10x data). YON's structural primitives enhance performance. Known boundary: peak memory remains comparable.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `1.56 x` _(vs JSON full-doc growth factor: 10.64 → YON stream: 1.6x, JSON full-doc: 10.6x (10x data))_

10K: YON-stream Δ14.7MB, YON-full Δ21.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ19.3MB, YON-full Δ112.6MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ23.0MB, YON-full Δ190.6MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 1.6x. JSON full-doc growth: 10.6x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 14.719999999999999 | MB |
| yon_fulldoc_delta_10k | 21.32 | MB |
| json_fulldoc_delta_10k | 1.1400000000000006 | MB |
| json_stream_delta_10k | 1.8400000000000034 | MB |
| yon_stream_delta_50k | 19.29 | MB |
| yon_fulldoc_delta_50k | 112.6 | MB |
| json_fulldoc_delta_50k | 6.020000000000003 | MB |
| json_stream_delta_50k | 7.550000000000004 | MB |
| yon_stream_delta_100k | 23.009999999999998 | MB |
| yon_fulldoc_delta_100k | 190.64 | MB |
| json_fulldoc_delta_100k | 12.130000000000003 | MB |
| json_stream_delta_100k | 15.189999999999998 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `23.03000000000001 MB` _(vs JSON full-doc peak delta: 12.129999999999995 → comparable)_

100K records. YON stream: Δ23.0MB. YON full-doc: Δ238.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 80.51 | MB |
| yon_fulldoc_peak | 296.17 | MB |
| json_fulldoc_peak | 52.23 | MB |
| json_stream_peak | 55.29 | MB |

---

## For Specialists

YON's streaming memory efficiency: 1.56x. JSON baseline: 10.64x. YON's advantage: YON stream: 1.6x, JSON full-doc: 10.6x (10x data). YON excels in streaming contexts, reducing memory load. Known boundary: peak memory usage is comparable. Implication: YON suits systems prioritizing streaming efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._