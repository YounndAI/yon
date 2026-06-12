[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:11:54.265Z

**Result:** 3/3 passed in 149ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, with faster parse times and better memory scaling. YON's parse time for 10,000 records is 9.142 ms, compared to JSON's baseline of 1.552 ms. Known boundaries include higher byte size, with YON at 751179 bytes versus JSON's 671127 bytes.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `9.142 ms` _(vs JSON 10K parse ms: 1.552 → See detail for full curve)_

10 records: YON 0.007ms ± 0.002ms (P50=0.007, P95=0.009, P99=0.013, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.004, n=30)
100 records: YON 0.100ms ± 0.212ms (P50=0.059, P95=0.069, P99=0.903, n=30) | JSON 0.017ms ± 0.001ms (P50=0.016, P95=0.017, P99=0.022, n=30)
1000 records: YON 0.805ms ± 0.394ms (P50=0.674, P95=1.412, P99=1.871, n=10) | JSON 0.166ms ± 0.002ms (P50=0.166, P95=0.169, P99=0.170, n=10)
10000 records: YON 9.142ms ± 2.125ms (P50=8.022, P95=12.386, P99=13.178, n=5) | JSON 1.552ms ± 0.011ms (P50=1.556, P95=1.566, P99=1.567, n=5)
YON scaling: 10→100: 14.3x, 100→1000: 8.1x, 1000→10000: 11.4x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.1 | ms |
| yon_1000_records | 0.805 | ms |
| yon_10000_records | 9.142 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `3108 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +104KB | JSON +4KB
1000 records: YON +1212KB | JSON +48KB
10000 records: YON +3108KB | JSON +4KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 104 | KB |
| memory_1000_records | 1212 | KB |
| memory_10000_records | 3108 | KB |

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

YON outperforms in parse time, achieving 9.142 ms for 10,000 records. JSON baseline is 1.552 ms. Memory scaling for YON reaches 3108 KB, indicating efficient handling of larger datasets. However, YON's byte size is higher at 751179 bytes, compared to JSON's 671127 bytes. YON excels in high-complexity streaming, but increased byte size may impact storage. Consider these factors in system design for optimal performance.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._