[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-19T13:59:10.039Z

**Result:** 3/3 passed in 17ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested system performance. All tests passed, indicating efficient operation. This ensures reliable processing under load.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.000436300000000017 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `207598 ops/s`

Executed 100 linear steps in 0.48ms. Throughput: 207,598 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **17ms**. Cold start time: **0.000436300000000017** ms. Operations per second: **207598** ops/s. Memory usage: **215** bytes. Edge cases included cold start efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._