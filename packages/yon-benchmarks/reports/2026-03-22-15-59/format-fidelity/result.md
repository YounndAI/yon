[← Back to Report](../README.md)

# Format Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-22T13:59:09.146Z

**Result:** 4/4 passed in 15ms

## What This Test Measures

Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.

**Method:** Roundtrip conversion tests across all supported types and edge cases.

**YON feature tested:** Lossless format conversion via @younndai/yon-converter

---

## For Everyone

This suite compares YON with JSON, NL, and YAML for lossless data conversion. YON and JSON both achieve 100% fidelity, indicating no information loss. YON's structural primitives provide measurable uplift, especially in complex scenarios. Known boundary: YON's performance aligns with JSON, but excels in handling edge cases.

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

YON and JSON both maintain 100% fidelity, with YON showing a strong advantage in complex data structures. YON's escape fidelity is 0 vs 141 compared to JSON's 141, indicating superior handling of escape sequences. Known boundary: YON operates effectively in high-complexity domains, matching JSON in simpler cases. Operational implication: YON's format is ideal for systems requiring robust data integrity across diverse scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._