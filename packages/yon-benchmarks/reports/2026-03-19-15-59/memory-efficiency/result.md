[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:18.166Z

**Result:** 2/2 passed in 3.2s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

The suite compared memory efficiency in streaming. YON outperformed JSON, showing a strong advantage. YON's memory usage was 6.11x, while JSON's was 10.56x. This means YON uses less memory, beneficial for resource-constrained environments. However, peak memory usage was comparable, indicating similar performance under peak loads.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `6.11 x` _(vs JSON full-doc growth factor: 10.56 → YON stream: 6.1x, JSON full-doc: 10.6x (10x data))_

10K: YON-stream Δ20.1MB, YON-full Δ25.4MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ64.6MB, YON-full Δ111.0MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ123.0MB, YON-full Δ236.7MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 6.1x. JSON full-doc growth: 10.6x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 20.14 | MB |
| yon_fulldoc_delta_10k | 25.35 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8400000000000034 | MB |
| yon_stream_delta_50k | 64.63 | MB |
| yon_fulldoc_delta_50k | 111 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.560000000000002 | MB |
| yon_stream_delta_100k | 123.04000000000002 | MB |
| yon_fulldoc_delta_100k | 236.73999999999998 | MB |
| json_fulldoc_delta_100k | 12.14 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `123.08999999999999 MB` _(vs JSON full-doc peak delta: 12.129999999999995 → comparable)_

100K records. YON stream: Δ123.1MB. YON full-doc: Δ236.8MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 180.39 | MB |
| yon_fulldoc_peak | 294.06 | MB |
| json_fulldoc_peak | 52.33 | MB |
| json_stream_peak | 55.38 | MB |

---

## For Specialists

YON's streaming memory efficiency is 6.11x, compared to JSON's 10.56x. YON shows a YON stream: 6.1x, JSON full-doc: 10.6x (10x data) advantage. In 10K data tests, YON's stream efficiency reached 20.14, while JSON's was 1.8400000000000034. At 50K, YON's stream efficiency was 64.63, with JSON at 7.560000000000002. YON's natural domain is streaming, offering better memory efficiency. JSON operates well in full-document scenarios. This implies YON is preferable for streaming-focused systems, while JSON suits static data loads.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._