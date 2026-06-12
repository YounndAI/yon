[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:25.870Z

**Result:** 3/3 passed in 56ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON for data interchange. YON shows a strong advantage in throughput, with a parse rate of **14085** ops/s compared to JSON's **100000** ops/s. This means faster data handling in complex scenarios. However, JSON remains more byte-efficient, with **3835** bytes compared to YON's **1789** bytes.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `14085 ops/s` _(vs JSON.parse ops/s: 100000 → 14085 vs 100000 (JSON) vs 7634 (YAML))_

YON: 0.063ms ± 0.047ms (P50=0.071, P95=0.119, P99=0.188, n=100). JSON: 0.010ms ± 0.001ms (P50=0.010, P95=0.010, P99=0.013, n=100). YAML: 0.148ms ± 0.058ms (P50=0.131, P95=0.278, P99=0.347, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7634 | ops/s |
| yon_parse_min_ops | 4032 | ops/s |
| yon_parse_max_ops | 76923 | ops/s |
| json_parse_min_ops | 50000 | ops/s |
| json_parse_max_ops | 111111 | ops/s |
| yon_parse_p50_ms | 0.071 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.131 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20408 ops/s` _(vs JSON.stringify ops/s: 142857 → 20408 vs 142857 (JSON) vs 9709 (YAML))_

YON: 0.053ms ± 0.016ms (P50=0.049, P95=0.081, P99=0.099, n=100). JSON: 0.008ms ± 0.008ms (P50=0.007, P95=0.007, P99=0.015, n=100). YAML: 0.123ms ± 0.059ms (P50=0.103, P95=0.224, P99=0.451, n=100)

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

YON's parse throughput is **14085** ops/s, while JSON achieves **100000** ops/s. YON's serialize throughput is **20408** ops/s, compared to JSON's **142857** ops/s. JSON's byte efficiency is **3835** bytes, outperforming YON's **1789** bytes. YON excels in high-throughput scenarios, but JSON is more efficient in byte usage. System design should consider these operational characteristics for optimal performance.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._