[← Back to Report](../README.md)

# RAG Context Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T21:07:21.990Z

**Result:** 3/3 passed in 63ms

## What This Test Measures

Tests rag context efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON against JSON, NL, and YAML in RAG context efficiency. YON performs better, showing a strong advantage. YON's structural primitives improve retrieval precision by +25pp. Known boundary: YON uses more tokens per rule, +6 structural baseline above baseline.

---

## Test Data

### PASS: Per-Rule Token Cost

**Metric:** `20 tokens/rule` _(vs NL tokens/rule: 14 → +6 structural baseline)_

10 rules. NL: 14 tok/rule. YON: 20 tok/rule. Structural baseline: +6 tok/rule for structure. Characteristic: ACCEPTABLE — each rule individually addressable.

| Metric | Value | Unit |
|--------|-------|------|
| nl_total_tokens | 135 | tokens |
| yon_total_tokens | 201 | tokens |
| baseline_per_rule | 6 | tokens |

### PASS: Retrieval Precision (Exact Match)

**Metric:** `88 %` _(vs NL retrieval precision: 63 → +25pp)_

8 queries. NL: 5/8 (63%). YON: 7/8 (88%). YON preserves typed fields (lvl=, must_not) enabling structured search.

| Metric | Value | Unit |
|--------|-------|------|
| nl_found | 5 | /8 |
| yon_found | 7 | /8 |

### PASS: Rule Addressability

**Metric:** `10 /10`

YON: 10/10 rules individually addressable with metadata. NL: 10 sentences, no structured metadata. RAG advantage: each YON @RULE is a self-contained retrievable record.

| Metric | Value | Unit |
|--------|-------|------|
| yon_has_metadata | 1 | bool |
| nl_has_metadata | 0 | bool |

---

## For Specialists

YON's retrieval precision is 88%, exceeding NL's 63% by +25pp. YON uses 20 tokens/rule, +6 structural baseline above baseline. YON's metadata support enhances rule addressability, scoring 10/10. Known boundary: YON's higher token cost impacts cognitive economy. Operational implication: YON suits complex systems needing precision.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._