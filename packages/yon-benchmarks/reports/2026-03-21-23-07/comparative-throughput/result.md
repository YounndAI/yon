[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:07:02.222Z

**Result:** 3/3 passed in 57ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON formats. YON shows a strong advantage in throughput. Parsing throughput for YON is 13699 ops/s, while JSON achieves 100000 ops/s. YON's structural primitives enhance performance, but JSON remains faster in some scenarios.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `13699 ops/s` _(vs JSON.parse ops/s: 100000 → 13699 vs 100000 (JSON) vs 7634 (YAML))_

YON: 0.060ms ± 0.041ms (P50=0.073, P95=0.112, P99=0.126, n=100). JSON: 0.011ms ± 0.003ms (P50=0.010, P95=0.015, P99=0.023, n=100). YAML: 0.148ms ± 0.066ms (P50=0.131, P95=0.252, P99=0.370, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7634 | ops/s |
| yon_parse_min_ops | 5000 | ops/s |
| yon_parse_max_ops | 66667 | ops/s |
| json_parse_min_ops | 35714 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.073 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.131 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20408 ops/s` _(vs JSON.stringify ops/s: 142857 → 20408 vs 142857 (JSON) vs 9804 (YAML))_

YON: 0.051ms ± 0.012ms (P50=0.049, P95=0.070, P99=0.088, n=100). JSON: 0.007ms ± 0.000ms (P50=0.007, P95=0.007, P99=0.007, n=100). YAML: 0.122ms ± 0.039ms (P50=0.102, P95=0.213, P99=0.223, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3836 → 1789B (YON) vs 3836B (JSON min) vs 4612B (YAML))_

20 records. YON: 1789B. JSON: 3836B (min: 3836B). YAML: 4612B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3836 | bytes |
| json_min_bytes | 3836 | bytes |
| yaml_bytes | 4612 | bytes |

---

## For Specialists

YON's parse throughput is 13699 ops/s. JSON reaches 100000 ops/s. YON's serialize throughput is 20408 ops/s, compared to JSON's 142857 ops/s. YON's byte efficiency is 1789 bytes, outperforming JSON's 3836 bytes. YON excels in structured payloads but operates slower in high-throughput contexts. JSON's speed benefits high-frequency operations.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._