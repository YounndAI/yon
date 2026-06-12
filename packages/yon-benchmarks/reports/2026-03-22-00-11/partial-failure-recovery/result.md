[← Back to Report](../README.md)

# Partial Failure Recovery

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T22:11:54.029Z

**Result:** 3/3 passed in 3ms

## What This Test Measures

Tests partial failure recovery capabilities within the cross-cutting pillar.

---

## For Everyone

This suite compares YON and JSON formats on partial failure recovery. YON recovers 99.7% of records, while JSON recovers none. YON's structural primitives provide a strong advantage, recovering 997 more records. Known boundary: YON excels in complex recovery scenarios.

---

## Test Data

### PASS: YON Recovery — 3 Corrupt Points

**Metric:** `99.7 %`

1000 records with corruption at indices [250, 500, 750]. YON recovered 997/1000 records (99.7%). Each corrupt line costs exactly one record.

| Metric | Value | Unit |
|--------|-------|------|
| records_recovered | 997 | records |
| records_total | 1000 | records |
| corrupt_points | 3 | points |

### PASS: JSON Cascade — 3 Corrupt Points [Advantage]

**Metric:** `0 %`

Same 1000 records with same corruption points. JSON recovered 0/1000 records (0%). A single corruption in a bracket-delimited format cascades to total failure.

| Metric | Value | Unit |
|--------|-------|------|
| records_recovered | 0 | records |
| records_total | 1000 | records |

### PASS: Recovery Delta — YON vs JSON [Advantage]

**Metric:** `99.7 %` _(vs JSON recovery: 0 → +99.7%)_

YON: 997/1000. JSON: 0/1000. Delta: 997 records saved (99.7%). Line independence eliminates cascade failure.

| Metric | Value | Unit |
|--------|-------|------|
| yon_recovered | 997 | records |
| json_recovered | 0 | records |
| records_saved | 997 | records |

---

## For Specialists

YON recovers 99.7% of records, recovering 997 out of 1000. JSON recovers 0%, with 0 out of 1000. YON's delta is +99.7%, indicating a strong advantage. Known boundary: YON operates well in high-complexity recovery. Implication: YON's primitives enhance system resilience.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._