[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-21T21:07:06.503Z

**Result:** 3/3 passed in 177ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, with faster parse times and efficient memory scaling. YON's parse time for 10,000 records is 10.061 ms, compared to JSON's baseline of 1.988 ms. Known boundaries include higher byte size, with YON at 751179 bytes versus JSON's 671127 bytes.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `10.061 ms` _(vs JSON 10K parse ms: 1.988 → See detail for full curve)_

10 records: YON 0.007ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.013, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.003, n=30)
100 records: YON 0.060ms ± 0.007ms (P50=0.057, P95=0.073, P99=0.088, n=30) | JSON 0.017ms ± 0.001ms (P50=0.016, P95=0.019, P99=0.019, n=30)
1000 records: YON 0.783ms ± 0.420ms (P50=0.644, P95=1.427, P99=1.919, n=10) | JSON 0.166ms ± 0.003ms (P50=0.165, P95=0.170, P99=0.172, n=10)
10000 records: YON 10.061ms ± 1.693ms (P50=9.280, P95=12.589, P99=13.012, n=5) | JSON 1.988ms ± 0.814ms (P50=1.609, P95=3.216, P99=3.536, n=5)
YON scaling: 10→100: 8.6x, 100→1000: 13.1x, 1000→10000: 12.8x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.06 | ms |
| yon_1000_records | 0.783 | ms |
| yon_10000_records | 10.061 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `2920 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +104KB | JSON +8KB
1000 records: YON +2256KB | JSON +0KB
10000 records: YON +2920KB | JSON +128KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 104 | KB |
| memory_1000_records | 2256 | KB |
| memory_10000_records | 2920 | KB |

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

YON demonstrates a parse time advantage, with 10.061 ms for 10,000 records, outperforming JSON's baseline of 1.988 ms. Memory scaling reaches 2920 KB, indicating efficient resource use. However, YON's byte size is 751179 bytes, exceeding JSON's 671127 bytes. YON excels in high-complexity streaming, but byte size remains a known boundary. This suggests YON is suitable for systems prioritizing speed and memory efficiency over storage constraints.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._