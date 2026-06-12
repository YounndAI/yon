[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T13:38:20.523Z

**Result:** 3/3 passed in 15ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested operational speed and efficiency. All tests passed, confirming reliable performance. This ensures consistent processing under load.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.0004301999999997861 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `226398 ops/s`

Executed 100 linear steps in 0.44ms. Throughput: 226,398 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **15ms**. Cold start time: **0.0004301999999997861** ms. Operations per second: **226398** ops/s. Memory budget: **215** bytes. All engineering gates passed, confirming deterministic performance. Edge cases included cold start and sustained throughput.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._