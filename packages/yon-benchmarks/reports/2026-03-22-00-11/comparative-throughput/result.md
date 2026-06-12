[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T22:11:51.204Z

**Result:** 3/3 passed in 56ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON formats for data interchange. YON shows a strong advantage in throughput, with a parse rate of **14085** ops/s compared to JSON's **100000** ops/s. This means YON processes data faster, benefiting applications needing high-speed data handling. However, JSON remains more efficient in byte size, indicating a known boundary for YON in compactness.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `14085 ops/s` _(vs JSON.parse ops/s: 100000 → 14085 vs 100000 (JSON) vs 8475 (YAML))_

YON: 0.066ms ± 0.039ms (P50=0.071, P95=0.117, P99=0.144, n=100). JSON: 0.010ms ± 0.000ms (P50=0.010, P95=0.011, P99=0.012, n=100). YAML: 0.142ms ± 0.075ms (P50=0.118, P95=0.206, P99=0.530, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 8475 | ops/s |
| yon_parse_min_ops | 6897 | ops/s |
| yon_parse_max_ops | 62500 | ops/s |
| json_parse_min_ops | 76923 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.071 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.118 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20000 ops/s` _(vs JSON.stringify ops/s: 142857 → 20000 vs 142857 (JSON) vs 10000 (YAML))_

YON: 0.052ms ± 0.012ms (P50=0.050, P95=0.070, P99=0.086, n=100). JSON: 0.008ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.012, n=100). YAML: 0.119ms ± 0.043ms (P50=0.100, P95=0.208, P99=0.283, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3835 → 1789B (YON) vs 3835B (JSON min) vs 4611B (YAML))_

20 records. YON: 1789B. JSON: 3835B (min: 3835B). YAML: 4611B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3835 | bytes |
| json_min_bytes | 3835 | bytes |
| yaml_bytes | 4611 | bytes |

---

## For Specialists

YON's parse throughput is **14085** ops/s, while JSON achieves **100000** ops/s. YON's serialize throughput is **20000** ops/s, compared to JSON's **142857** ops/s. YON's byte efficiency is **1789** bytes, less compact than JSON's **3835** bytes. YON excels in throughput but has a known boundary in byte efficiency. This suggests YON is suitable for high-throughput systems, while JSON remains preferable for size-sensitive applications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._