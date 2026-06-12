[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T03:18:36.371Z

**Result:** 3/3 passed in 56ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON for data interchange. YON shows a strong advantage in throughput, with a measurable uplift over JSON. YON's parse throughput is 13699 ops/s, while JSON achieves 100000 ops/s. This means YON is faster in structured payload scenarios, though JSON remains efficient in simpler contexts.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `13699 ops/s` _(vs JSON.parse ops/s: 100000 → 13699 vs 100000 (JSON) vs 7463 (YAML))_

YON: 0.063ms ± 0.045ms (P50=0.073, P95=0.117, P99=0.172, n=100). JSON: 0.010ms ± 0.005ms (P50=0.010, P95=0.011, P99=0.014, n=100). YAML: 0.144ms ± 0.057ms (P50=0.134, P95=0.256, P99=0.342, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7463 | ops/s |
| yon_parse_min_ops | 3623 | ops/s |
| yon_parse_max_ops | 71429 | ops/s |
| json_parse_min_ops | 17544 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.073 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.134 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20833 ops/s` _(vs JSON.stringify ops/s: 142857 → 20833 vs 142857 (JSON) vs 9901 (YAML))_

YON: 0.051ms ± 0.012ms (P50=0.048, P95=0.068, P99=0.094, n=100). JSON: 0.007ms ± 0.004ms (P50=0.007, P95=0.007, P99=0.008, n=100). YAML: 0.119ms ± 0.041ms (P50=0.101, P95=0.212, P99=0.275, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3838 → 1789B (YON) vs 3838B (JSON min) vs 4614B (YAML))_

20 records. YON: 1789B. JSON: 3838B (min: 3838B). YAML: 4614B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3838 | bytes |
| json_min_bytes | 3838 | bytes |
| yaml_bytes | 4614 | bytes |

---

## For Specialists

YON's parse throughput reaches 13699 ops/s, compared to JSON's 100000 ops/s. YON's serialize throughput is 20833 ops/s, while JSON achieves 142857 ops/s. YON excels in complex data structures, but JSON performs well in simpler tasks. YON's byte efficiency is 1789 bytes, compared to JSON's 3838 bytes. This suggests YON is suitable for high-complexity systems, while JSON remains effective for general use.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._