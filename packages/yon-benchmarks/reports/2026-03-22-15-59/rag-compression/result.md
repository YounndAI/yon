[← Back to Report](../README.md)

# RAG Context Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-22T13:59:24.888Z

**Result:** 3/3 passed in 68ms

## What This Test Measures

Tests rag context efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

This comparison evaluates YON against JSON, NL, and YAML in context efficiency. YON shows a strong advantage, with a retrieval precision delta of **+25pp**. This means YON retrieves more relevant information. However, YON's rule cost is higher by **+6 structural baseline** tokens per rule, indicating a trade-off in token usage.

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

YON's retrieval precision is **88%**, surpassing the baseline by **+25pp**. This indicates better information retrieval. YON's rule cost is **20tokens/rule**, exceeding the baseline by **+6 structural baseline**. YON operates well in complex environments, but higher token usage is a known boundary. This suggests YON is suitable for systems prioritizing precision over token economy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._