[← Back to Report](../README.md)

# Runner Throughput

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T18:10:48.939Z

**Result:** 3/3 passed in 14ms

## What This Test Measures

Tests runner throughput capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Throughput suite tests processing speed and efficiency. All tests passed, indicating reliable performance across operations.

---

## Test Data

### PASS: Runner Cold Start

**Metric:** `0.00044430000000011206 ms`

Average initialization time: 0.000ms (1000 iter).

### PASS: DAG Logic Ops/Sec

**Metric:** `205888 ops/s`

Executed 100 linear steps in 0.49ms. Throughput: 205,888 ops/s.

### PASS: Context Memory Budget

**Metric:** `215 bytes`

Heap growth: 0.20MB for 1000 instances. ~215 bytes/instance.

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **14ms**. Cold start latency: **0.00044430000000011206 ms**. Throughput: **205888 ops/s**. Memory usage: **215 bytes**. All engineering gates pass, confirming deterministic performance. Edge cases include cold start and sustained throughput.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._