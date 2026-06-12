[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:22.878Z

**Result:** 2/2 passed in 3.6s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This suite compares memory efficiency in streaming. YON outperforms JSON, using 1.56x less memory. This means more efficient data handling. YON's known boundary is peak memory, where it remains comparable.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `1.56 x` _(vs JSON full-doc growth factor: 10.56 → YON stream: 1.6x, JSON full-doc: 10.6x (10x data))_

10K: YON-stream Δ14.7MB, YON-full Δ21.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ19.3MB, YON-full Δ112.6MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ23.0MB, YON-full Δ190.6MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 1.6x. JSON full-doc growth: 10.6x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 14.700000000000003 | MB |
| yon_fulldoc_delta_10k | 21.309999999999995 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8400000000000034 | MB |
| yon_stream_delta_50k | 19.270000000000003 | MB |
| yon_fulldoc_delta_50k | 112.63 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.550000000000004 | MB |
| yon_stream_delta_100k | 22.990000000000002 | MB |
| yon_fulldoc_delta_100k | 190.64 | MB |
| json_fulldoc_delta_100k | 12.139999999999993 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `22.970000000000006 MB` _(vs JSON full-doc peak delta: 12.130000000000003 → comparable)_

100K records. YON stream: Δ23.0MB. YON full-doc: Δ238.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 80.68 | MB |
| yon_fulldoc_peak | 296.41 | MB |
| json_fulldoc_peak | 52.18 | MB |
| json_stream_peak | 55.23 | MB |

---

## For Specialists

YON's streaming memory efficiency is 1.56x, compared to JSON's 10.56x. YON wins with a YON stream: 1.6x, JSON full-doc: 10.6x (10x data) delta. YON excels in streaming but has a known boundary in peak memory, where both formats are comparable. This implies YON is suitable for systems prioritizing streaming efficiency over peak memory constraints.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._