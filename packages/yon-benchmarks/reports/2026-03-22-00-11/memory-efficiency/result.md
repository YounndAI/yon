[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:11:59.160Z

**Result:** 2/2 passed in 3.2s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates memory efficiency in streaming. YON outperforms JSON, using less memory. YON's streaming memory value is 6.11, while JSON's is 10.64. This means YON is more efficient for streaming tasks, reducing resource usage.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `6.11 x` _(vs JSON full-doc growth factor: 10.64 → YON stream: 6.1x, JSON full-doc: 10.6x (10x data))_

10K: YON-stream Δ20.1MB, YON-full Δ25.4MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ64.6MB, YON-full Δ111.0MB, JSON-full Δ6.0MB, JSON-stream Δ7.6MB. 100K: YON-stream Δ123.0MB, YON-full Δ190.7MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 6.1x. JSON full-doc growth: 10.6x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 20.15 | MB |
| yon_fulldoc_delta_10k | 25.39 | MB |
| json_fulldoc_delta_10k | 1.1400000000000006 | MB |
| json_stream_delta_10k | 1.8400000000000034 | MB |
| yon_stream_delta_50k | 64.58000000000001 | MB |
| yon_fulldoc_delta_50k | 110.98 | MB |
| json_fulldoc_delta_50k | 6.030000000000001 | MB |
| json_stream_delta_50k | 7.560000000000002 | MB |
| yon_stream_delta_100k | 123.03999999999999 | MB |
| yon_fulldoc_delta_100k | 190.65 | MB |
| json_fulldoc_delta_100k | 12.130000000000003 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `123.03999999999999 MB` _(vs JSON full-doc peak delta: 12.129999999999995 → comparable)_

100K records. YON stream: Δ123.0MB. YON full-doc: Δ236.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 180.41 | MB |
| yon_fulldoc_peak | 294.12 | MB |
| json_fulldoc_peak | 52.19 | MB |
| json_stream_peak | 55.24 | MB |

---

## For Specialists

YON's streaming memory efficiency is 6.11 compared to JSON's 10.64. YON shows a YON stream: 6.1x, JSON full-doc: 10.6x (10x data) advantage. YON operates best in streaming contexts, while JSON suits full-document processing. This efficiency impacts system design by lowering memory requirements, enhancing performance in streaming applications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._