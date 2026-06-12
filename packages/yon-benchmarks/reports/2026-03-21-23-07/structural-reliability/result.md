[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:07:02.127Z

**Result:** 4/4 passed in 36ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compares YON against JSON, NL, and YAML. YON performs better in handling document corruption and integrity. It shows a +98% improvement over baselines. This means YON is more reliable for complex data structures. Known boundary: YON's block integrity is lower than JSON.

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

Parsed 511 records in 2.0ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 1.98 | ms |

---

## For Specialists

YON's partial corruption survival is 98.1%, baseline at 0. This indicates a +98% uplift. YON maintains 5/5 blocks integrity, compared to JSON's 141. Known boundary: YON's block integrity is limited. Operational implication: YON suits environments needing high corruption resilience but may require additional integrity checks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._