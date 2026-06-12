[← Back to Report](../README.md)

# Multi-Hop Resilience

> **Pillar:** streaming · **Timestamp:** 2026-03-21T18:10:55.148Z

**Result:** 4/4 passed in 1ms

## What This Test Measures

Tests multi-hop resilience capabilities within the streaming pillar.

---

## For Everyone

The suite compared YON against JSON, NL, and YAML for multi-hop resilience. YON performed better, recovering 20 records compared to JSON's 0. This means YON handles data corruption more effectively. Known boundary: YON's structural primitives excel in complex streaming environments.

---

## Test Data

### PASS: Multi-Hop — Single Record Corruption

**Metric:** `95 %` _(vs JSON survival %: 0 → 20 vs 0 records)_

3-stage pipeline: Stage 2 corrupts 1 of 20 records. Stage 3 (YON): 20/21 records recovered (95%). Stage 3 (JSON): 0/20 records recovered (total failure). YON isolates corruption to the affected line. JSON's structural integrity cascades.

| Metric | Value | Unit |
|--------|-------|------|
| yon_recovered | 20 | records |
| json_recovered | 0 | records |

### PASS: Multi-Hop — 3 Records Corrupted

**Metric:** `18 records` _(vs JSON recovered: 0 → 18 vs 0)_

3 corruption points injected at indices [3, 10, 17]. YON recovered 18/21 records. JSON: 0/20. Each YON corruption is an independent line failure. JSON corruption is always structural.

### PASS: Multi-Hop — Structural Corruption Cascade

**Metric:** `1 YON isolated` _(vs JSON cascading failure: 0 → YON: 1 line lost | JSON: all 20 records lost)_

Corrupting YON's @ prefix: loses 1 line, others parse normally (20 survived). Corrupting JSON's [ bracket: structural cascade, 0 records recoverable. Format topology determines blast radius — flat > nested for resilience.

| Metric | Value | Unit |
|--------|-------|------|
| yon_records | 20 | records |
| json_records | 0 | records |

### PASS: Multi-Hop — Append-Only Stream Recovery

**Metric:** `19 records` _(vs expected survivors: 19 → 19/19 = 100%)_

Append-only stream with corruption at record 10. Pre-corruption: 10/10 records survived. Post-corruption: 9/9 records survived. Mid-stream corruption does not poison the stream — both past and future records are safe.

| Metric | Value | Unit |
|--------|-------|------|
| pre_corruption | 10 | records |
| post_corruption | 9 | records |

---

## For Specialists

YON shows a 20 vs 0 records recovery advantage over JSON. YON recovered 18 records in multi-corruption scenarios, while JSON recovered none. In structural cascades, YON lost 1 line, whereas JSON lost all 0 records. Known boundary: YON's primitives operate well in high-complexity streaming. Operational implication: YON's resilience supports robust system design, reducing data loss risks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._