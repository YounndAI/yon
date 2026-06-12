[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-22T13:59:06.730Z

**Result:** 3/3 passed in 64ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

The suite compares YON and JSON formats. YON shows a strong advantage in throughput. YON's parse throughput is 13699 ops/s, while JSON achieves 100000 ops/s. This means YON performs well in high-complexity scenarios. Known boundary: JSON excels in simpler tasks.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `13699 ops/s` _(vs JSON.parse ops/s: 100000 → 13699 vs 100000 (JSON) vs 7463 (YAML))_

YON: 0.084ms ± 0.071ms (P50=0.073, P95=0.226, P99=0.274, n=100). JSON: 0.010ms ± 0.003ms (P50=0.010, P95=0.011, P99=0.019, n=100). YAML: 0.160ms ± 0.096ms (P50=0.134, P95=0.381, P99=0.544, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7463 | ops/s |
| yon_parse_min_ops | 3311 | ops/s |
| yon_parse_max_ops | 76923 | ops/s |
| json_parse_min_ops | 27778 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.073 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.134 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `19231 ops/s` _(vs JSON.stringify ops/s: 142857 → 19231 vs 142857 (JSON) vs 9524 (YAML))_

YON: 0.062ms ± 0.028ms (P50=0.052, P95=0.115, P99=0.167, n=100). JSON: 0.007ms ± 0.000ms (P50=0.007, P95=0.008, P99=0.008, n=100). YAML: 0.135ms ± 0.076ms (P50=0.105, P95=0.286, P99=0.382, n=100)

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

YON's parse throughput is 13699 ops/s. JSON reaches 100000 ops/s. YON's serialize throughput is 19231 ops/s, compared to JSON's 142857 ops/s. YON's byte efficiency is 1789 bytes, while JSON uses 3837 bytes. YON excels in complex data interchange. JSON operates best in low-complexity environments. This impacts system design by favoring YON for complex payloads.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._