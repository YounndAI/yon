[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T03:18:36.313Z

**Result:** 3/3 passed in 17ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested operational efficiency. All tests passed, confirming reliable performance. This ensures consistent processing speed.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.000525300000000243 ms`

Average initialization time: 0.001ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `212314 ops/s`

Executed 100 linear steps in 0.47ms. Throughput: 212,314 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **17ms**. Cold start time: **0.000525300000000243** ms. Operations per second: **212314** ops/s. Memory budget: **215** bytes. All engineering gates passed, indicating deterministic performance. Edge cases included cold start efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._