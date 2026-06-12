[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-22T15:12:14.751Z

**Result:** 3/3 passed in 17ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested operational speed and efficiency. All tests passed, confirming reliable performance. This ensures consistent processing under load.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.0004508000000000152 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `198177 ops/s`

Executed 100 linear steps in 0.50ms. Throughput: 198,177 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **17ms**. Cold start latency: **0.0004508000000000152 ms**. Throughput: **198177 ops/s**. Memory usage: **215 bytes**. All engineering gates passed, confirming deterministic performance. Edge cases included cold start and sustained operations.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._