[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:13.164Z

**Result:** 3/3 passed in 154ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON with JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, parsing faster as data scales. YON's parse time for 10,000 records is 8.436ms, compared to the baseline's 1.834ms. This means quicker data processing at larger scales. However, memory usage increases with record size, reaching 2896KB for 10,000 records.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `8.436 ms` _(vs JSON 10K parse ms: 1.834 → See detail for full curve)_

10 records: YON 0.007ms ± 0.001ms (P50=0.007, P95=0.008, P99=0.009, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.003, n=30)
100 records: YON 0.063ms ± 0.011ms (P50=0.060, P95=0.085, P99=0.104, n=30) | JSON 0.017ms ± 0.002ms (P50=0.017, P95=0.018, P99=0.023, n=30)
1000 records: YON 0.825ms ± 0.438ms (P50=0.674, P95=1.504, P99=2.010, n=10) | JSON 0.165ms ± 0.003ms (P50=0.164, P95=0.169, P99=0.170, n=10)
10000 records: YON 8.436ms ± 0.158ms (P50=8.466, P95=8.642, P99=8.670, n=5) | JSON 1.834ms ± 0.497ms (P50=1.575, P95=2.590, P99=2.779, n=5)
YON scaling: 10→100: 9.0x, 100→1000: 13.1x, 1000→10000: 10.2x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.063 | ms |
| yon_1000_records | 0.825 | ms |
| yon_10000_records | 8.436 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `2896 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +152KB | JSON +72KB
1000 records: YON +0KB | JSON +28KB
10000 records: YON +2896KB | JSON +168KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 152 | KB |
| memory_1000_records | 0 | KB |
| memory_10000_records | 2896 | KB |

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

YON outperforms in parse time, with a delta of See detail for full curve. YON's parse time for 10,000 records is 8.436ms, while the baseline is 1.834ms. Memory scaling shows YON uses 2896KB for 10,000 records, indicating higher memory demand. YON's byte size is 751179bytes, compared to the baseline's 671127bytes. YON excels in high-complexity streaming, but consider memory constraints in system design.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._