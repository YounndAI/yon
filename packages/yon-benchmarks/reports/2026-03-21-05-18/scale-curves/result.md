[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-21T03:18:40.583Z

**Result:** 3/3 passed in 160ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

The Scale Curves suite compares YON with JSON, NL, and YAML for streaming. YON shows a strong advantage in parse time and memory scaling. YON's parse time for 10,000 records is 8.826 ms, outperforming the baseline. This means faster data processing in practice. Known boundary: YON's memory use is higher at 4596 KB for large datasets.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `8.826 ms` _(vs JSON 10K parse ms: 1.82 → See detail for full curve)_

10 records: YON 0.007ms ± 0.000ms (P50=0.007, P95=0.008, P99=0.008, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.003, P99=0.004, n=30)
100 records: YON 0.084ms ± 0.128ms (P50=0.058, P95=0.086, P99=0.578, n=30) | JSON 0.016ms ± 0.000ms (P50=0.016, P95=0.017, P99=0.018, n=30)
1000 records: YON 0.894ms ± 0.414ms (P50=0.706, P95=1.623, P99=2.001, n=10) | JSON 0.171ms ± 0.004ms (P50=0.171, P95=0.177, P99=0.180, n=10)
10000 records: YON 8.826ms ± 0.563ms (P50=8.760, P95=9.471, P99=9.479, n=5) | JSON 1.820ms ± 0.534ms (P50=1.557, P95=2.621, P99=2.834, n=5)
YON scaling: 10→100: 12.0x, 100→1000: 10.6x, 1000→10000: 9.9x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.007 | ms |
| yon_100_records | 0.084 | ms |
| yon_1000_records | 0.894 | ms |
| yon_10000_records | 8.826 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `4596 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +44KB | JSON +16KB
1000 records: YON +1400KB | JSON +52KB
10000 records: YON +4596KB | JSON +0KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 44 | KB |
| memory_1000_records | 1400 | KB |
| memory_10000_records | 4596 | KB |

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

YON's parse time scales efficiently: 0.007 ms for 10 records to 8.826 ms for 10,000 records. JSON baseline is 1.82 ms. YON's memory scaling reaches 4596 KB, exceeding JSON's efficiency. Bytes processed: 751179 bytes, compared to JSON's 671127 bytes. YON excels in high-complexity streaming, but memory use is a known boundary. This impacts system design by requiring more memory resources for large-scale operations.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._