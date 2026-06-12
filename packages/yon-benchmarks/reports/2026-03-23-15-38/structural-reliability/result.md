[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T13:38:20.490Z

**Result:** 4/4 passed in 29ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compared YON against JSON, NL, and YAML. YON performed better in handling structural reliability. It survived partial corruption with a +98% improvement. Known boundaries include block integrity, where YON scored 0 vs 141. This means YON is robust in complex scenarios but has limits in block integrity.

---

## Test Data

### PASS: Partial Corruption Survival

**Metric:** `98.1 %` _(vs JSON: 0 → +98%)_

51/52 records recovered. 1 record lost (the corruption source). JSON: 0% recovered (entire document invalidated).

### PASS: Block Integrity

**Metric:** `5 /5 blocks` _(vs JSON escapes needed: 141 → 0 vs 141)_

5/5 blocks preserved verbatim. YON: 0 escapes. JSON equivalent: 141 escapes.

### PASS: Type Preservation

**Metric:** `92 %`

23/25 records survived YON→JSON→YON roundtrip. (2 metadata records dropped by design: @NOTE/@STAMP not supported in JSON).

### PASS: Large Document Stability

**Metric:** `511 records`

Parsed 511 records in 1.9ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 1.9 | ms |

---

## For Specialists

YON's partial corruption survival is 98.1%, a +98% over baseline. JSON, NL, and YAML scored 0. YON's block integrity is 5/5 blocks, with a baseline of 141. YON excels in type preservation at 92%. Known boundary: block integrity remains a challenge. Operational implication: YON suits environments needing high corruption resilience but may require additional block integrity measures.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._