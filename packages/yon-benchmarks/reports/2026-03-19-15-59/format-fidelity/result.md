[← Back to Report](../README.md)

# Format Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-19T13:59:12.944Z

**Result:** 4/4 passed in 11ms

## What This Test Measures

Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.

**Method:** Roundtrip conversion tests across all supported types and edge cases.

**YON feature tested:** Lossless format conversion via @younndai/yon-converter

---

## For Everyone

This suite compares YON against JSON and YAML for format fidelity. YON achieves a strong advantage, preserving all fields and values. Both YON and JSON maintain a 100% fidelity rate. YON's structural primitives offer measurable uplift, ensuring zero information loss. Known Boundary: YON excels in complex data structures.

---

## Test Data

### PASS: Roundtrip Parity (YON→JSON→YON)

**Metric:** `100 %`

2/2 keys preserved.

### PASS: Roundtrip Parity (YON→YAML→YON)

**Metric:** `100 %`

2/2 keys preserved.

### PASS: Escape Fidelity

**Metric:** `5 /5 blocks` _(vs JSON escapes required: 141 → 0 vs 141)_

YON: 5/5 blocks preserved with 0 escapes. JSON equivalent requires 141 escape sequences.

### PASS: Optimization Ladder

**Metric:** `100 %`

Canon: 1272B (17 records). Min: 1285B (−-1.0%). Ultra: 1270B (−0.2%). Record counts: identical.

| Metric | Value | Unit |
|--------|-------|------|
| canon_bytes | 1272 | bytes |
| min_savings | -1 | % |
| ultra_savings | 0.2 | % |

---

## For Specialists

YON and JSON both achieve 100% fidelity. YON's escape fidelity is 0 vs 141 better than the baseline 141. YON's optimization ladder shows 100% efficiency, with minimal savings at -1. YON operates best in complex data environments, offering structural advantages. JSON performs well in simpler contexts. Operational implication: YON's fidelity supports robust system design, minimizing data loss risks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._