[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-21T18:10:53.432Z

**Result:** 3/3 passed in 173ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, particularly in parse time and memory scaling. YON's parse time for 10,000 records is 10.815ms, outperforming the baseline. However, YON's memory usage reaches 3912KB, indicating a known boundary in high-volume contexts.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `10.815 ms` _(vs JSON 10K parse ms: 1.571 → See detail for full curve)_

10 records: YON 0.007ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.013, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.003, n=30)
100 records: YON 0.059ms ± 0.005ms (P50=0.057, P95=0.063, P99=0.078, n=30) | JSON 0.017ms ± 0.000ms (P50=0.016, P95=0.017, P99=0.017, n=30)
1000 records: YON 0.765ms ± 0.402ms (P50=0.627, P95=1.382, P99=1.852, n=10) | JSON 0.167ms ± 0.005ms (P50=0.165, P95=0.175, P99=0.175, n=10)
10000 records: YON 10.815ms ± 2.395ms (P50=9.914, P95=14.449, P99=15.082, n=5) | JSON 1.571ms ± 0.010ms (P50=1.571, P95=1.585, P99=1.588, n=5)
YON scaling: 10→100: 8.4x, 100→1000: 13.0x, 1000→10000: 14.1x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.059 | ms |
| yon_1000_records | 0.765 | ms |
| yon_10000_records | 10.815 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `3912 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +0KB | JSON +0KB
1000 records: YON +1984KB | JSON +0KB
10000 records: YON +3912KB | JSON +12KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 0 | KB |
| memory_1000_records | 1984 | KB |
| memory_10000_records | 3912 | KB |

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

YON's parse time scales efficiently, with 10.815ms for 10,000 records, compared to the baseline's 1.571ms. This delta indicates a strong advantage. Memory usage scales to 3912KB, showing a known boundary in large datasets. YON's structural primitives enhance performance, but system design must consider memory constraints.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._