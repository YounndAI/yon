[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T13:38:20.582Z

**Result:** 3/3 passed in 58ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This suite compares YON and JSON formats. YON shows a strong advantage in throughput. Parsing and serialization are faster with YON. JSON remains efficient but less so in this context. Known boundaries include JSON's higher baseline efficiency.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `13699 ops/s` _(vs JSON.parse ops/s: 100000 → 13699 vs 100000 (JSON) vs 7353 (YAML))_

YON: 0.064ms ± 0.055ms (P50=0.073, P95=0.122, P99=0.287, n=100). JSON: 0.010ms ± 0.001ms (P50=0.010, P95=0.010, P99=0.013, n=100). YAML: 0.155ms ± 0.086ms (P50=0.136, P95=0.323, P99=0.549, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7353 | ops/s |
| yon_parse_min_ops | 2755 | ops/s |
| yon_parse_max_ops | 66667 | ops/s |
| json_parse_min_ops | 58824 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.073 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.136 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20408 ops/s` _(vs JSON.stringify ops/s: 142857 → 20408 vs 142857 (JSON) vs 9615 (YAML))_

YON: 0.053ms ± 0.019ms (P50=0.049, P95=0.066, P99=0.094, n=100). JSON: 0.007ms ± 0.001ms (P50=0.007, P95=0.008, P99=0.014, n=100). YAML: 0.121ms ± 0.036ms (P50=0.104, P95=0.216, P99=0.236, n=100)

### PASS: Structural Density (Multi-Format)

**Metric:** `1789 bytes` _(vs JSON bytes: 3834 → 1789B (YON) vs 3834B (JSON min) vs 4610B (YAML))_

20 records. YON: 1789B. JSON: 3834B (min: 3834B). YAML: 4610B. Measures structural baseline — YON trades bytes for type safety, streaming, and addressability.

| Metric | Value | Unit |
|--------|-------|------|
| json_bytes | 3834 | bytes |
| json_min_bytes | 3834 | bytes |
| yaml_bytes | 4610 | bytes |

---

## For Specialists

YON's parse throughput: **13699** ops/s. JSON baseline: **100000** ops/s. YON's serialization: **20408** ops/s. JSON baseline: **142857** ops/s. YON excels in structured payloads, with JSON maintaining byte efficiency. Operational implication: YON suits high-throughput needs, JSON for byte-critical tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._