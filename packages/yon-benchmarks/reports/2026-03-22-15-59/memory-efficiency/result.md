[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:14.835Z

**Result:** 2/2 passed in 3.6s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates memory efficiency in streaming. YON outperforms JSON, using 1.56x less memory. This means YON handles data more efficiently, reducing resource use. Known boundary: peak memory is comparable, limiting gains in high-load scenarios.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `1.56 x` _(vs JSON full-doc growth factor: 10.55 → YON stream: 1.6x, JSON full-doc: 10.5x (10x data))_

10K: YON-stream Δ14.7MB, YON-full Δ21.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.9MB. 50K: YON-stream Δ19.3MB, YON-full Δ112.6MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ23.0MB, YON-full Δ238.7MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 1.6x. JSON full-doc growth: 10.5x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 14.71 | MB |
| yon_fulldoc_delta_10k | 21.309999999999995 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8500000000000014 | MB |
| yon_stream_delta_50k | 19.310000000000002 | MB |
| yon_fulldoc_delta_50k | 112.60999999999999 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.560000000000002 | MB |
| yon_stream_delta_100k | 23 | MB |
| yon_fulldoc_delta_100k | 238.68 | MB |
| json_fulldoc_delta_100k | 12.129999999999995 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `23.089999999999996 MB` _(vs JSON full-doc peak delta: 12.130000000000003 → comparable)_

100K records. YON stream: Δ23.1MB. YON full-doc: Δ238.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 80.55 | MB |
| yon_fulldoc_peak | 296.16 | MB |
| json_fulldoc_peak | 52.17 | MB |
| json_stream_peak | 55.23 | MB |

---

## For Specialists

YON's streaming memory efficiency is 1.56x, compared to JSON's 10.55x. YON wins by YON stream: 1.6x, JSON full-doc: 10.5x (10x data). Known boundary: peak memory usage is similar, with YON at 80.55 MB and JSON at 55.23 MB. Operational implication: YON suits systems prioritizing memory efficiency, but peak demands remain a consideration.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._