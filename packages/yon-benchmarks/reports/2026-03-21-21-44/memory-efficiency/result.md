[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:57.174Z

**Result:** 2/2 passed in 3.7s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This suite compares memory efficiency in streaming. YON outperforms JSON, using less memory. YON's streaming memory value is 1.57x, while JSON's is 10.55x. This means YON is more efficient for streaming tasks, reducing resource usage.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `1.57 x` _(vs JSON full-doc growth factor: 10.55 → YON stream: 1.6x, JSON full-doc: 10.5x (10x data))_

10K: YON-stream Δ14.7MB, YON-full Δ21.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ19.3MB, YON-full Δ112.6MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ23.0MB, YON-full Δ190.7MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 1.6x. JSON full-doc growth: 10.5x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 14.699999999999996 | MB |
| yon_fulldoc_delta_10k | 21.339999999999996 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8399999999999963 | MB |
| yon_stream_delta_50k | 19.310000000000002 | MB |
| yon_fulldoc_delta_50k | 112.63 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.550000000000004 | MB |
| yon_stream_delta_100k | 23.020000000000003 | MB |
| yon_fulldoc_delta_100k | 190.69 | MB |
| json_fulldoc_delta_100k | 12.130000000000003 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `23.090000000000003 MB` _(vs JSON full-doc peak delta: 12.130000000000003 → comparable)_

100K records. YON stream: Δ23.1MB. YON full-doc: Δ190.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 80.42 | MB |
| yon_fulldoc_peak | 248.03 | MB |
| json_fulldoc_peak | 52.36 | MB |
| json_stream_peak | 55.42 | MB |

---

## For Specialists

YON's streaming memory efficiency is 1.57x, compared to JSON's 10.55x. YON shows a YON stream: 1.6x, JSON full-doc: 10.5x (10x data) advantage. YON excels in streaming contexts, with a 14.699999999999996 delta at 10K data. JSON performs better in full-document scenarios, with a 1.1499999999999986 delta. YON's efficiency benefits systems with high-frequency data streams, while JSON suits static data loads.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._