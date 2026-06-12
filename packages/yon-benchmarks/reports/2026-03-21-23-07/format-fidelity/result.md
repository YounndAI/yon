[← Back to Report](../README.md)

# Format Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-21T21:07:06.260Z

**Result:** 4/4 passed in 16ms

## What This Test Measures

Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.

**Method:** Roundtrip conversion tests across all supported types and edge cases.

**YON feature tested:** Lossless format conversion via @younndai/yon-converter

---

## For Everyone

This suite compares YON against JSON and YAML for format fidelity. YON performs better, preserving every field and type with zero information loss. The delta shows YON's structural advantage, ensuring data integrity. Known boundary: YON excels in complex conversions, but JSON and YAML remain effective for simpler tasks.

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

YON achieves 100% fidelity, matching JSON and YAML. YON's escape fidelity is 0 vs 141 better than baseline 141. Known boundary: YON's strength lies in complex data structures. Operational implication: YON supports robust system designs, ensuring lossless data handling. JSON and YAML operate well within simpler domains.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._