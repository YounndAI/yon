[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T22:11:51.146Z

**Result:** 3/3 passed in 18ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tested operational speed and efficiency. All tests passed, confirming reliable performance under load.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.0004594000000000165 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `213493 ops/s`

Executed 100 linear steps in 0.47ms. Throughput: 213,493 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **18ms**. Cold start time: **0.0004594000000000165** ms. Operations per second: **213493** ops/s. Memory budget: **215** bytes. The suite confirms consistent throughput. Edge cases included varying load scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._