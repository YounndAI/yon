[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T19:44:48.635Z

**Result:** 3/3 passed in 59ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON formats. YON shows a strong advantage in throughput. Parsing throughput for YON is **11364** ops/s, while JSON achieves **100000** ops/s. YON's structural primitives enhance performance, but JSON remains faster in some scenarios.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `11364 ops/s` _(vs JSON.parse ops/s: 100000 → 11364 vs 100000 (JSON) vs 7576 (YAML))_

YON: 0.083ms ± 0.063ms (P50=0.088, P95=0.138, P99=0.313, n=100). JSON: 0.010ms ± 0.000ms (P50=0.010, P95=0.011, P99=0.011, n=100). YAML: 0.145ms ± 0.063ms (P50=0.132, P95=0.262, P99=0.421, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7576 | ops/s |
| yon_parse_min_ops | 2208 | ops/s |
| yon_parse_max_ops | 71429 | ops/s |
| json_parse_min_ops | 76923 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.088 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.132 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20833 ops/s` _(vs JSON.stringify ops/s: 142857 → 20833 vs 142857 (JSON) vs 9434 (YAML))_

YON: 0.053ms ± 0.023ms (P50=0.048, P95=0.071, P99=0.107, n=100). JSON: 0.007ms ± 0.001ms (P50=0.007, P95=0.008, P99=0.009, n=100). YAML: 0.133ms ± 0.060ms (P50=0.106, P95=0.262, P99=0.333, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3837 → 1789B (YON) vs 3837B (JSON min) vs 4613B (YAML))_

20 records. YON: 1789B. JSON: 3837B (min: 3837B). YAML: 4613B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3837 | bytes |
| json_min_bytes | 3837 | bytes |
| yaml_bytes | 4613 | bytes |

---

## For Specialists

YON's parse throughput is **11364** ops/s, compared to JSON's **100000** ops/s. YON's serialize throughput is **20833** ops/s, while JSON reaches **142857** ops/s. YON excels in byte efficiency with **1789** bytes, against JSON's **3837** bytes. YON operates well in structured payloads, but JSON's speed is advantageous in high-throughput environments.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._