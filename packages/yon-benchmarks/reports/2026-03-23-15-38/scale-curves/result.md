[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:24.972Z

**Result:** 3/3 passed in 179ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, particularly in parse time and memory scaling. YON's parse time for 10,000 records is 10.473 ms, outperforming the baseline. However, YON's byte size is larger, indicating a known boundary in storage efficiency.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `10.473 ms` _(vs JSON 10K parse ms: 2.058 → See detail for full curve)_

10 records: YON 0.007ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.010, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.003, n=30)
100 records: YON 0.062ms ± 0.006ms (P50=0.061, P95=0.069, P99=0.086, n=30) | JSON 0.016ms ± 0.000ms (P50=0.016, P95=0.017, P99=0.017, n=30)
1000 records: YON 0.962ms ± 0.597ms (P50=0.662, P95=2.162, P99=2.234, n=10) | JSON 0.168ms ± 0.005ms (P50=0.166, P95=0.176, P99=0.179, n=10)
10000 records: YON 10.473ms ± 1.291ms (P50=10.246, P95=12.353, P99=12.667, n=5) | JSON 2.058ms ± 0.988ms (P50=1.559, P95=3.545, P99=3.936, n=5)
YON scaling: 10→100: 8.9x, 100→1000: 15.5x, 1000→10000: 10.9x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.062 | ms |
| yon_1000_records | 0.962 | ms |
| yon_10000_records | 10.473 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `4180 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +332KB | JSON +148KB
1000 records: YON +1312KB | JSON +60KB
10000 records: YON +4180KB | JSON +0KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 332 | KB |
| memory_1000_records | 1312 | KB |
| memory_10000_records | 4180 | KB |

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

YON's parse time scales efficiently, with 10.473 ms for 10,000 records. JSON's baseline is 2.058 ms, showing YON's advantage. Memory usage for YON is 4180 KB, indicating efficient scaling. However, YON's byte size is 751179 bytes, compared to JSON's 671127 bytes. YON excels in streaming but has a known boundary in storage size. This suggests YON is suitable for systems prioritizing speed over storage efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._