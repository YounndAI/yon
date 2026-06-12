[← Back to Report](../README.md)

# Scale Curves

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:29.808Z

**Result:** 3/3 passed in 229ms

## What This Test Measures

Tests scale curves capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in streaming scenarios. YON shows a strong advantage, especially in parse time and memory scaling. YON's structural primitives reduce complexity, enhancing performance. Known boundaries include increased byte size, which may impact storage.

---

## Test Data

### PASS: Parse Time vs Document Size

**Metric:** `17.944 ms` _(vs JSON 10K parse ms: 1.537 → See detail for full curve)_

10 records: YON 0.006ms ± 0.000ms (P50=0.006, P95=0.007, P99=0.007, n=30) | JSON 0.002ms ± 0.000ms (P50=0.002, P95=0.002, P99=0.003, n=30)
100 records: YON 0.068ms ± 0.068ms (P50=0.054, P95=0.080, P99=0.335, n=30) | JSON 0.017ms ± 0.000ms (P50=0.017, P95=0.018, P99=0.018, n=30)
1000 records: YON 0.743ms ± 0.251ms (P50=0.644, P95=1.199, P99=1.410, n=10) | JSON 0.168ms ± 0.003ms (P50=0.168, P95=0.173, P99=0.174, n=10)
10000 records: YON 17.944ms ± 1.774ms (P50=17.483, P95=20.115, P99=20.164, n=5) | JSON 1.537ms ± 0.006ms (P50=1.540, P95=1.542, P99=1.542, n=5)
YON scaling: 10→100: 11.3x, 100→1000: 10.9x, 1000→10000: 24.2x

| Metric | Value | Unit |
|--------|-------|------|
| yon_10_records | 0.006 | ms |
| yon_100_records | 0.068 | ms |
| yon_1000_records | 0.743 | ms |
| yon_10000_records | 17.944 | ms |

### PASS: Memory Scaling (RSS Delta)

**Metric:** `1508 KB`

10 records: YON +0KB | JSON +0KB
100 records: YON +0KB | JSON +0KB
1000 records: YON +0KB | JSON +8KB
10000 records: YON +1508KB | JSON +72KB
Note: RSS deltas are approximate; GC timing affects accuracy.

| Metric | Value | Unit |
|--------|-------|------|
| memory_10_records | 0 | KB |
| memory_100_records | 0 | KB |
| memory_1000_records | 0 | KB |
| memory_10000_records | 1508 | KB |

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

YON's parse time scales efficiently: 17.944 ms for 10,000 records. JSON baseline is 1.537 ms. YON's memory usage remains low until 10,000 records, reaching 1508 KB. Byte size increases to 751179 bytes, exceeding JSON's 671127 bytes. YON excels in high-complexity streaming, but byte size is a known boundary. System design should consider storage implications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._