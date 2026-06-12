[← Back to Report](../README.md)

# Structural Reliability

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T03:18:36.274Z

**Result:** 4/4 passed in 28ms

## What This Test Measures

Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.

**Method:** Feeds valid and invalid YON documents to the parser and checks outcomes.

---

## For Everyone

The suite compared YON against JSON, NL, and YAML. YON performed better in structural reliability. It survived partial corruption by +98% more than others. This means YON maintains integrity under stress. Known boundary: YON excels in structured environments.

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

Parsed 511 records in 5.5ms. No truncation.

| Metric | Value | Unit |
|--------|-------|------|
| parse_time | 5.45 | ms |

---

## For Specialists

YON shows a 98.1% survival rate. Baseline formats show 0%. YON's block integrity is 5/5 blocks, compared to baseline's 141. Type preservation is 92%. YON's large document stability is 511records with a parse time of 5.45ms. Known boundary: YON operates best with structured data. Operational implication: YON's resilience supports robust system design.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._