[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T19:44:48.548Z

**Result:** 4/4 passed in 8ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compared YON against JSON, NL, and YAML. YON performed better in structural reliability. It survived partial corruption by +98% more than others. Known boundary: YON's block integrity is lower than JSON's.

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

Parsed 511 records in 3.9ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 3.95 | ms |

---

## For Specialists

YON shows a +98% advantage in partial corruption survival. JSON maintains 141 block integrity, while YON has 5. YON excels in type preservation at 92%. Known boundary: YON's block integrity is limited. Operational implication: YON suits environments prioritizing corruption resilience over block integrity.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._