[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:25.812Z

**Result:** 3/3 passed in 17ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested processing speed and efficiency. All tests passed, confirming reliable performance. This ensures consistent operation under expected loads.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.0005329000000001543 ms`

Average initialization time: 0.001ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `218484 ops/s`

Executed 100 linear steps in 0.46ms. Throughput: 218,484 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **17ms**. Cold start time: **0.0005329000000001543 ms**. Operations per second: **218484 ops/s**. Memory budget: **215 bytes**. All engineering gates passed, confirming deterministic performance. Edge cases included cold start and sustained throughput.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._