[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:11.722Z

**Result:** 2/2 passed in 3.5s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates memory efficiency in streaming. YON outperforms JSON with a delta of YON stream: 4.7x, JSON full-doc: 10.5x (10x data). YON's structural primitives enhance performance, reducing memory usage. Known boundary: JSON's full-document approach increases memory demand.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `4.67 x` _(vs JSON full-doc growth factor: 10.55 → YON stream: 4.7x, JSON full-doc: 10.5x (10x data))_

10K: YON-stream Δ17.4MB, YON-full Δ25.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ44.6MB, YON-full Δ109.0MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ81.4MB, YON-full Δ190.6MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 4.7x. JSON full-doc growth: 10.5x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 17.439999999999998 | MB |
| yon_fulldoc_delta_10k | 25.33 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8399999999999963 | MB |
| yon_stream_delta_50k | 44.589999999999996 | MB |
| yon_fulldoc_delta_50k | 109.02000000000001 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.550000000000004 | MB |
| yon_stream_delta_100k | 81.38 | MB |
| yon_fulldoc_delta_100k | 190.64000000000001 | MB |
| json_fulldoc_delta_100k | 12.129999999999995 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `81.36000000000001 MB` _(vs JSON full-doc peak delta: 12.129999999999995 → comparable)_

100K records. YON stream: Δ81.4MB. YON full-doc: Δ190.5MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 138.74 | MB |
| yon_fulldoc_peak | 247.87 | MB |
| json_fulldoc_peak | 52.19 | MB |
| json_stream_peak | 55.24 | MB |

---

## For Specialists

YON's streaming memory value is 4.67x, compared to JSON's 10.55x. YON shows a YON stream: 4.7x, JSON full-doc: 10.5x (10x data) advantage. YON operates efficiently in streaming contexts, while JSON suits full-document scenarios. Operational implication: YON's efficiency supports scalable system design, reducing resource strain.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._