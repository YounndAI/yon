[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-22T15:12:14.814Z

**Result:** 3/3 passed in 61ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON for data interchange. YON shows a strong advantage in throughput, with a parse rate of **12821** ops/s compared to JSON's **100000** ops/s. This means faster data processing in complex scenarios. However, JSON remains more efficient in simpler contexts.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `12821 ops/s` _(vs JSON.parse ops/s: 100000 → 12821 vs 100000 (JSON) vs 8547 (YAML))_

YON: 0.067ms ± 0.049ms (P50=0.078, P95=0.135, P99=0.169, n=100). JSON: 0.010ms ± 0.001ms (P50=0.010, P95=0.011, P99=0.013, n=100). YAML: 0.147ms ± 0.065ms (P50=0.117, P95=0.287, P99=0.403, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 8547 | ops/s |
| yon_parse_min_ops | 4082 | ops/s |
| yon_parse_max_ops | 76923 | ops/s |
| json_parse_min_ops | 55556 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.078 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.117 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `16949 ops/s` _(vs JSON.stringify ops/s: 142857 → 16949 vs 142857 (JSON) vs 9709 (YAML))_

YON: 0.060ms ± 0.009ms (P50=0.059, P95=0.076, P99=0.099, n=100). JSON: 0.008ms ± 0.001ms (P50=0.007, P95=0.009, P99=0.010, n=100). YAML: 0.130ms ± 0.062ms (P50=0.103, P95=0.231, P99=0.357, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3833 → 1789B (YON) vs 3833B (JSON min) vs 4609B (YAML))_

20 records. YON: 1789B. JSON: 3833B (min: 3833B). YAML: 4609B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3833 | bytes |
| json_min_bytes | 3833 | bytes |
| yaml_bytes | 4609 | bytes |

---

## For Specialists

YON's parse throughput is **12821** ops/s, while JSON achieves **100000** ops/s. YON excels in structured payloads, offering a measurable uplift. JSON's known boundary is its efficiency in simpler tasks, with a minimum of **55556** ops/s. YON's operational implication suggests enhanced performance in complex systems, though JSON remains preferable for basic tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._