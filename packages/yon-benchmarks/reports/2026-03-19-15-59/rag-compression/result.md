[← Back to Report](../README.md)

# RAG Context Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T13:59:28.114Z

**Result:** 3/3 passed in 73ms

## What This Test Measures

Tests rag context efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON and baseline formats on context efficiency. YON shows a strong advantage, with a +25pp improvement in retrieval precision. This means YON retrieves more relevant information. However, YON's token cost is higher by +6 structural baseline. Consider this when balancing precision and cost.

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

YON outperforms in retrieval precision by +25pp. It achieves 88%, compared to baseline's 63%. YON's structural primitives enhance precision but increase token cost by +6 structural baseline. YON uses 201 tokens, while baseline uses 135. YON's metadata support improves rule addressability, scoring 10/10. Consider YON for systems prioritizing precision, with awareness of token cost.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._