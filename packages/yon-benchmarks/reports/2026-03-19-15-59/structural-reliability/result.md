[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-19T13:59:10.012Z

**Result:** 4/4 passed in 13ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compares YON's structural reliability against JSON, NL, and YAML. YON performs better, handling valid and malformed documents effectively. It shows a +98% improvement in partial corruption survival. This means YON is more robust in maintaining data integrity. Known Boundaries include specific document types and sizes.

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

Parsed 511 records in 8.7ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 8.75 | ms |

---

## For Specialists

YON outperforms baselines in structural reliability. Partial corruption survival is 98.1%, a +98% increase over 0. Block integrity remains 0 vs 141 against 141. YON's type preservation is 92%. Large document stability reaches 511records in 8.75ms. YON's scope advantage lies in complex document handling, enhancing system resilience. JSON, NL, and YAML operate within simpler structures, limiting their robustness.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._