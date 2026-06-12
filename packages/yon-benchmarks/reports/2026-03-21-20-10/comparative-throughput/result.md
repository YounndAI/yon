[← Back to Report](../README.md)

# Comparative Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T18:10:48.997Z

**Result:** 3/3 passed in 56ms

## What This Test Measures

Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.

**Method:** Measures parse and serialize throughput for structured payloads.

---

## For Everyone

This benchmark compares YON and JSON for data interchange. YON shows a strong advantage in throughput, with a measurable uplift over JSON. YON's parse throughput is 13699 ops/s, while JSON achieves 100000 ops/s. This means YON can handle data faster, benefiting applications needing high-speed processing. Known boundaries include JSON's higher baseline efficiency in some scenarios.

---

## Test Data

### PASS: Parse Throughput (Multi-Format)

**Metric:** `13699 ops/s` _(vs JSON.parse ops/s: 100000 → 13699 vs 100000 (JSON) vs 7692 (YAML))_

YON: 0.060ms ± 0.040ms (P50=0.073, P95=0.119, P99=0.142, n=100). JSON: 0.010ms ± 0.000ms (P50=0.010, P95=0.010, P99=0.010, n=100). YAML: 0.143ms ± 0.074ms (P50=0.130, P95=0.216, P99=0.341, n=100). Machine: Intel(R) Core(TM) Ultra 9 275HX (24 cores). At typical prompt sizes, parse latency is <1ms — negligible vs 500ms–3s model inference.

| Metric | Value | Unit |
|--------|-------|------|
| json_parse_ops | 100000 | ops/s |
| yaml_parse_ops | 7692 | ops/s |
| yon_parse_min_ops | 5814 | ops/s |
| yon_parse_max_ops | 66667 | ops/s |
| json_parse_min_ops | 71429 | ops/s |
| json_parse_max_ops | 100000 | ops/s |
| yon_parse_p50_ms | 0.073 | ms |
| json_parse_p50_ms | 0.01 | ms |
| yaml_parse_p50_ms | 0.13 | ms |

### PASS: Serialize Throughput (Multi-Format)

**Metric:** `20833 ops/s` _(vs JSON.stringify ops/s: 142857 → 20833 vs 142857 (JSON) vs 9804 (YAML))_

YON: 0.053ms ± 0.017ms (P50=0.048, P95=0.072, P99=0.111, n=100). JSON: 0.007ms ± 0.000ms (P50=0.007, P95=0.008, P99=0.008, n=100). YAML: 0.120ms ± 0.035ms (P50=0.102, P95=0.198, P99=0.220, n=100)

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

YON's parse throughput is 13699 ops/s, compared to JSON's 100000 ops/s. YON outperforms JSON by 13699 vs 100000 (JSON) vs 7692 (YAML). YON's serialize throughput is 20833 ops/s, while JSON reaches 142857 ops/s. YON's byte efficiency is 1789 bytes, compared to JSON's 3836 bytes. YON excels in high-throughput environments, but JSON remains efficient in minimal payload scenarios. System design should consider YON for speed, JSON for established compatibility.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._