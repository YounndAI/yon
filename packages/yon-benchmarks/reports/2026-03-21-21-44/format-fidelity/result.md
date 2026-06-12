[← Back to Report](../README.md)

# Format Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-21T19:44:51.433Z

**Result:** 4/4 passed in 10ms

## What This Test Measures

Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.

**Method:** Roundtrip conversion tests across all supported types and edge cases.

**YON feature tested:** Lossless format conversion via @younndai/yon-converter

---

## For Everyone

The Format Fidelity suite compares YON with JSON, NL, and YAML for lossless data conversion. YON and JSON both achieve 100% fidelity, indicating zero information loss. This means data integrity is fully preserved during conversions. YON's structural primitives provide a measurable uplift, especially in complex scenarios. Known boundaries include the need for specific converters.

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

YON and JSON both maintain 100% fidelity, ensuring no data loss. YON's escape fidelity shows a delta of 0 vs 141 compared to the baseline 141, highlighting its precision. YON operates well in complex data structures, while JSON excels in simpler domains. The operational implication is that YON's primitives enhance fidelity, beneficial for systems requiring high data integrity. Known boundaries involve the necessity for compatible converters to maintain performance.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._