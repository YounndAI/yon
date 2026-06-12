[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:07:02.163Z

**Result:** 3/3 passed in 14ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested system performance. All tests passed, confirming efficient operation. This ensures reliable processing speed.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.0004294999999983702 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `217581 ops/s`

Executed 100 linear steps in 0.46ms. Throughput: 217,581 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **14ms**. Cold start time: **0.0004294999999983702** ms. Operations per second: **217581** ops/s. Memory budget: **215** bytes. All engineering gates passed, confirming deterministic performance. Edge cases included cold start efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._