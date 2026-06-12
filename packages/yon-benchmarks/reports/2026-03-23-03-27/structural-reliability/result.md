[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:25.772Z

**Result:** 4/4 passed in 27ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compares YON against JSON, NL, and YAML. YON performs better in structural reliability, handling valid and malformed documents effectively. YON's survival rate for partial corruption is 98.1%, a +98% improvement over others. Known boundary: YON's block integrity matches baseline at 141.

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

Parsed 511 records in 2.4ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 2.35 | ms |

---

## For Specialists

YON shows a +98% advantage in partial corruption survival. YON maintains 5/5 blocks integrity, matching the baseline of 141. Type preservation reaches 92%, supporting complex data structures. Large document stability holds at 511records, with parse time of 2.35ms. Operational implication: YON's reliability supports robust system design, though block integrity remains a known boundary.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._