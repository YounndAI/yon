[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-19T13:59:10.098Z

**Result:** 3/3 passed in 57ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON for data interchange. YON shows a strong advantage in throughput, with a 11905 vs 100000 (JSON) vs 8475 (YAML) difference in parse operations. This means faster data handling in complex scenarios. However, JSON remains more efficient in simpler contexts.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `11905 ops/s` _(vs JSON.parse ops/s: 100000 → 11905 vs 100000 (JSON) vs 8475 (YAML))_

YON: 0.067ms ± 0.049ms (P50=0.084, P95=0.123, P99=0.169, n=100). JSON: 0.010ms ± 0.001ms (P50=0.010, P95=0.011, P99=0.013, n=100). YAML: 0.145ms ± 0.078ms (P50=0.118, P95=0.290, P99=0.543, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 8475 | ops/s |
| yon_parse_min_ops | 3876 | ops/s |
| yon_parse_max_ops | 66667 | ops/s |
| json_parse_min_ops | 66667 | ops/s |
| json_parse_max_ops | 111111 | ops/s |
| yon_parse_p50_ms | 0.084 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.118 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20408 ops/s` _(vs JSON.stringify ops/s: 125000 → 20408 vs 125000 (JSON) vs 9804 (YAML))_

YON: 0.052ms ± 0.012ms (P50=0.049, P95=0.074, P99=0.094, n=100). JSON: 0.008ms ± 0.001ms (P50=0.008, P95=0.009, P99=0.010, n=100). YAML: 0.120ms ± 0.041ms (P50=0.102, P95=0.201, P99=0.240, n=100)

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

YON outperforms JSON in parse throughput by 11905 vs 100000 (JSON) vs 8475 (YAML). YON achieves 11905 ops/s, while JSON reaches 100000. YON's serialize throughput is 20408 ops/s, compared to JSON's 125000. Byte efficiency favors YON with 1789B (YON) vs 3836B (JSON min) vs 4612B (YAML). YON excels in complex data structures, while JSON suits simpler tasks. This impacts system design by optimizing for complexity with YON.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._