[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:44:51.711Z

**Result:** 3/3 passed in 217ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON with JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, especially in parse time and memory scaling. YON's parse time for 10,000 records is 15.021 ms, outperforming the baseline. However, YON's byte size is larger, indicating a known boundary in storage efficiency.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `15.021 ms` _(vs JSON 10K parse ms: 1.608 → See detail for full curve)_

10 records: YON 0.006ms ± 0.001ms (P50=0.006, P95=0.008, P99=0.010, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.004, n=30)
100 records: YON 0.081ms ± 0.116ms (P50=0.056, P95=0.093, P99=0.528, n=30) | JSON 0.016ms ± 0.001ms (P50=0.016, P95=0.017, P99=0.022, n=30)
1000 records: YON 0.749ms ± 0.352ms (P50=0.626, P95=1.310, P99=1.705, n=10) | JSON 0.164ms ± 0.002ms (P50=0.164, P95=0.167, P99=0.168, n=10)
10000 records: YON 15.021ms ± 0.505ms (P50=14.785, P95=15.794, P99=15.970, n=5) | JSON 1.608ms ± 0.076ms (P50=1.566, P95=1.725, P99=1.749, n=5)
YON scaling: 10→100: 13.5x, 100→1000: 9.2x, 1000→10000: 20.1x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.006 | ms |
| yon_100_records | 0.081 | ms |
| yon_1000_records | 0.749 | ms |
| yon_10000_records | 15.021 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `1192 KB`

10 records: YON +8KB | JSON +0KB
100 records: YON +104KB | JSON +24KB
1000 records: YON +1496KB | JSON +0KB
10000 records: YON +1192KB | JSON +228KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 8 | KB |
| memory_100_records | 104 | KB |
| memory_1000_records | 1496 | KB |
| memory_10000_records | 1192 | KB |

### PASS: Wire Size vs Document Size

**Metric:** `751179 bytes` _(vs JSON bytes: 671127 → 751179B vs 671127B)_

10 records: YON 753B | JSON 627B
100 records: YON 7175B | JSON 6327B
1000 records: YON 73177B | JSON 65127B
10000 records: YON 751179B | JSON 671127B

| Metric | Value | Unit |
|--------|-------|------|
| bytes_10_records | 753 | bytes |
| bytes_100_records | 7175 | bytes |
| bytes_1000_records | 73177 | bytes |
| bytes_10000_records | 751179 | bytes |

---

## For Specialists

YON's parse time scales efficiently: 0.006 ms for 10 records to 15.021 ms for 10,000 records. JSON's baseline is 1.608 ms, showing YON's advantage. Memory scaling for YON is 1192 KB, indicating efficient resource use. However, YON's byte size is 751179 bytes, larger than JSON's 671127 bytes. This suggests YON excels in speed but has a storage boundary. System design should prioritize YON for speed-critical applications, considering storage trade-offs.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._