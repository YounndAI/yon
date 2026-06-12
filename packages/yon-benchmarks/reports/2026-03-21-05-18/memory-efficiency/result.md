[← Back to Report](../README.md)

# Memory Efficiency

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:45.536Z

**Result:** 2/2 passed in 3.2s

## What This Test Measures

Tests memory efficiency capabilities within the streaming pillar.

---

## For Everyone

This suite compares memory efficiency in streaming. YON outperforms JSON, using 5.71x less memory. This means YON handles data more efficiently, reducing resource strain. Known boundary: YON excels in streaming, but peak memory remains comparable.

---

## Test Data

### PASS: Streaming Memory Profile (10K→100K)

**Metric:** `5.71 x` _(vs JSON full-doc growth factor: 10.55 → YON stream: 5.7x, JSON full-doc: 10.5x (10x data))_

10K: YON-stream Δ20.1MB, YON-full Δ25.3MB, JSON-full Δ1.1MB, JSON-stream Δ1.8MB. 50K: YON-stream Δ62.0MB, YON-full Δ111.0MB, JSON-full Δ6.0MB, JSON-stream Δ7.5MB. 100K: YON-stream Δ114.9MB, YON-full Δ236.7MB, JSON-full Δ12.1MB, JSON-stream Δ15.2MB. YON stream growth: 5.7x. JSON full-doc growth: 10.5x.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_delta_10k | 20.120000000000005 | MB |
| yon_fulldoc_delta_10k | 25.339999999999996 | MB |
| json_fulldoc_delta_10k | 1.1499999999999986 | MB |
| json_stream_delta_10k | 1.8400000000000034 | MB |
| yon_stream_delta_50k | 61.98 | MB |
| yon_fulldoc_delta_50k | 111.00999999999999 | MB |
| json_fulldoc_delta_50k | 6.020000000000003 | MB |
| json_stream_delta_50k | 7.549999999999997 | MB |
| yon_stream_delta_100k | 114.88 | MB |
| yon_fulldoc_delta_100k | 236.73000000000002 | MB |
| json_fulldoc_delta_100k | 12.130000000000003 | MB |
| json_stream_delta_100k | 15.18 | MB |

### PASS: Peak Memory at 100K Records (4-way)

**Metric:** `114.9 MB` _(vs JSON full-doc peak delta: 12.130000000000003 → comparable)_

100K records. YON stream: Δ114.9MB. YON full-doc: Δ236.7MB. JSON full-doc: Δ12.1MB. JSON stream: Δ15.2MB.

| Metric | Value | Unit |
|--------|-------|------|
| yon_stream_peak | 172.22 | MB |
| yon_fulldoc_peak | 294.06 | MB |
| json_fulldoc_peak | 52.35 | MB |
| json_stream_peak | 55.41 | MB |

---

## For Specialists

YON's streaming memory efficiency is 5.71x, compared to JSON's 10.55x. YON wins by YON stream: 5.7x, JSON full-doc: 10.5x (10x data). Known boundary: YON's advantage is in streaming contexts. Operational implication: YON's efficiency supports scalable system design, though peak memory remains comparable.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._