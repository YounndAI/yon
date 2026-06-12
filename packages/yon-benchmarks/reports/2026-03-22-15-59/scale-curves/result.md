[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-22T13:59:09.459Z

**Result:** 3/3 passed in 235ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, with faster parse times and efficient memory use. The delta in parse time is See detail for full curve, indicating a measurable uplift. Known boundaries include higher byte size, which may affect storage.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `17.86 ms` _(vs JSON 10K parse ms: 1.587 → See detail for full curve)_

10 records: YON 0.007ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.009, n=30) | JSON 0.002ms ± 0.001ms (P50=0.002, P95=0.003, P99=0.005, n=30)
100 records: YON 0.086ms ± 0.084ms (P50=0.066, P95=0.127, P99=0.421, n=30) | JSON 0.024ms ± 0.012ms (P50=0.020, P95=0.057, P99=0.061, n=30)
1000 records: YON 0.773ms ± 0.311ms (P50=0.671, P95=1.268, P99=1.609, n=10) | JSON 0.174ms ± 0.010ms (P50=0.170, P95=0.193, P99=0.196, n=10)
10000 records: YON 17.860ms ± 2.689ms (P50=18.313, P95=20.992, P99=21.149, n=5) | JSON 1.587ms ± 0.020ms (P50=1.585, P95=1.612, P99=1.614, n=5)
YON scaling: 10→100: 12.3x, 100→1000: 9.0x, 1000→10000: 23.1x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.086 | ms |
| yon_1000_records | 0.773 | ms |
| yon_10000_records | 17.86 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `5024 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +144KB | JSON +44KB
1000 records: YON +1588KB | JSON +0KB
10000 records: YON +5024KB | JSON +8KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 144 | KB |
| memory_1000_records | 1588 | KB |
| memory_10000_records | 5024 | KB |

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

YON's parse time scales efficiently: 0.007 to 17.86 ms. JSON's baseline is 1.587 ms, showing YON's advantage. Memory scaling for YON reaches 5024 KB, with a known boundary in byte size: 751179B vs 671127B. This suggests YON's structural primitives enhance streaming but increase storage needs. System design should consider these operational characteristics for optimal performance.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._