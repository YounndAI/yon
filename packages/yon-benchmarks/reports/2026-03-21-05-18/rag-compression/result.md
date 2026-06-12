[← Back to Report](../README.md)

# RAG Context Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T03:18:55.871Z

**Result:** 3/3 passed in 63ms

## What This Test Measures

Tests rag context efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON against JSON, NL, and YAML for context efficiency. YON shows a strong advantage, with a +25pp improvement in retrieval precision. This means YON retrieves more relevant data, enhancing cognitive economy. Known boundaries include higher token usage, with YON at 201 compared to NL's 135.

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

YON's retrieval precision improves by +25pp over baseline 63. YON finds 7 items, while NL finds 5. YON's structural primitives enhance rule addressability, scoring 10//10. However, YON's token cost is higher, at 201 tokens. This implies YON suits complex systems needing precision, but with higher structural baseline.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._