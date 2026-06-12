[← Back to Report](../README.md)

# Streaming Fault Boundary

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:19.166Z

**Result:** 3/3 passed in 6ms

## What This Test Measures

Verifies that a single corrupted line in a stream does not contaminate surrounding records.

**Method:** Injects faults at specific stream positions and checks isolation.

**YON feature tested:** Per-line fault isolation

---

## For Everyone

The suite tested stream fault isolation. All tests passed, ensuring corrupted lines don't affect others. This means reliable data processing.

---

## Test Data

### PASS: Single Line Corruption → N-1 Recovery

**Metric:** `99.9 %`

Corrupted 1 of 1000 data lines (index 500). Recovered: 999/1000 data records (99.9%). Error events: 1. Line independence: a corrupt line costs exactly one record.

| Metric | Value | Unit |
|--------|-------|------|
| data_records_recovered | 999 | records |
| error_events_count | 1 | errors |
| corrupt_lines | 1 | lines |

### PASS: 5-Point Corruption → N-5 Recovery

**Metric:** `99.5 %`

Corrupted 5 data lines at indices [50, 200, 500, 750, 950]. Recovered: 995/1000 data records (99.5%). Error events: 5. Each fault costs exactly one record.

| Metric | Value | Unit |
|--------|-------|------|
| data_records_recovered | 995 | records |
| error_events_count | 5 | errors |
| corrupt_lines | 5 | lines |

### PASS: Fault Boundary Isolation — Adjacent Records Intact

**Metric:** `1 pass/fail`

Corruption at index 500. Record 499 (before): INTACT. Record 500 (corrupt): CORRECTLY ABSENT. Record 501 (after): INTACT. Fault boundary is exactly one line — no cascade.

| Metric | Value | Unit |
|--------|-------|------|
| before_intact | 1 | bool |
| after_intact | 1 | bool |
| corrupt_absent | 1 | bool |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **6ms**. Fault isolation value: **1**. Single-line recovery: **99.9%** with **999** records recovered. Multi-point recovery: **99.5%**. Edge cases included single and multi-point faults.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._