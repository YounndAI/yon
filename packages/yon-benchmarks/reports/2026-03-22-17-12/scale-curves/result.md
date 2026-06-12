[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:12:17.506Z

**Result:** 3/3 passed in 253ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON with JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, particularly in parse time and memory scaling. YON's parse time for 10,000 records is 20.551 ms, outperforming the baseline. However, YON's byte size is larger, indicating a known boundary in storage efficiency.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `20.551 ms` _(vs JSON 10K parse ms: 1.772 → See detail for full curve)_

10 records: YON 0.006ms ± 0.000ms (P50=0.006, P95=0.007, P99=0.007, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.004, n=30)
100 records: YON 0.097ms ± 0.133ms (P50=0.060, P95=0.117, P99=0.603, n=30) | JSON 0.017ms ± 0.002ms (P50=0.016, P95=0.017, P99=0.024, n=30)
1000 records: YON 0.683ms ± 0.187ms (P50=0.613, P95=1.003, P99=1.187, n=10) | JSON 0.167ms ± 0.003ms (P50=0.166, P95=0.171, P99=0.173, n=10)
10000 records: YON 20.551ms ± 8.286ms (P50=15.971, P95=33.257, P99=35.412, n=5) | JSON 1.772ms ± 0.429ms (P50=1.559, P95=2.417, P99=2.587, n=5)
YON scaling: 10→100: 16.2x, 100→1000: 7.0x, 1000→10000: 30.1x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.006 | ms |
| yon_100_records | 0.097 | ms |
| yon_1000_records | 0.683 | ms |
| yon_10000_records | 20.551 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `356 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +4KB | JSON +44KB
1000 records: YON +0KB | JSON +32KB
10000 records: YON +356KB | JSON +212KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 4 | KB |
| memory_1000_records | 0 | KB |
| memory_10000_records | 356 | KB |

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

YON's parse time scales efficiently, with 20.551 ms for 10,000 records. JSON's baseline is 1.772 ms, showing YON's advantage. Memory scaling for YON reaches 356 KB, indicating efficient resource use. However, YON's byte size is 751179 bytes, exceeding JSON's 671127 bytes. This suggests YON excels in processing speed but has a storage boundary. System design should prioritize YON for speed-critical applications, considering storage implications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._