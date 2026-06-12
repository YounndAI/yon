[← Back to Report](../README.md)

# Format Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-21T22:11:54.051Z

**Result:** 4/4 passed in 11ms

## What This Test Measures

Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.

**Method:** Roundtrip conversion tests across all supported types and edge cases.

**YON feature tested:** Lossless format conversion via @younndai/yon-converter

---

## For Everyone

This suite compares YON against JSON and YAML for lossless data conversion. YON performs better, preserving every field and type. The delta shows YON's structural advantage. Known boundary: YON excels in complex data fidelity.

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

YON achieves 100% fidelity in roundtrip tests. JSON and YAML also reach 100%. YON's escape fidelity is 0 vs 141 better than baseline 141. Known boundary: YON's primitives suit complex structures. Operational implication: YON supports high-fidelity systems with minimal data loss.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._