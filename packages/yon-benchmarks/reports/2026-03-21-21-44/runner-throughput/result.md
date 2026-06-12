[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T19:44:48.574Z

**Result:** 3/3 passed in 17ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested operational speed and efficiency. All tests passed, confirming reliable performance under specified conditions.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.000501700000000028 ms`

Average initialization time: 0.001ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `190223 ops/s`

Executed 100 linear steps in 0.53ms. Throughput: 190,223 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **17ms**. Cold start time: **0.000501700000000028 ms**. Operations per second: **190223 ops/s**. Memory budget: **215 bytes**. The suite confirms consistent throughput performance. Edge cases included cold start latency and memory constraints.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._