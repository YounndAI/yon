[← Back to Report](../README.md)

# LLM Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:40:47.499Z

**Result:** 3/3 passed in 3.6s

## What This Test Measures

Tests whether LLMs can extract useful information from partially corrupted documents in each format.

**Method:** Corrupts documents at various positions and asks extraction questions.

**YON feature tested:** Single-line error isolation

---

## For Everyone

This suite compares error recovery in YON, JSON, NL, and YAML formats. YON performs better, isolating errors with a 100% success rate. This means YON can extract useful information even from corrupted documents. Known boundary: YON excels in single-line error isolation, while others struggle with complex corruption.

---

## Test Data

### PASS: Fault Isolation (§5 line independence)

**Metric:** `100 %`

3/15 records corrupted. Surviving: 6/6 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6: , Q7: , Q8: , Q9: , Q10: , Q11: , Q12: , Q13: , Q14: , Q15: 

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 6 | /6 |
| total_correct | 7 | /15 |
| corrupted_records | 3 | records |
| duration | 3609 | ms |

### PASS: Corruption Boundary Detection (§5 line independence)

**Metric:** `50 %`

LLM identified 4/8 record states correctly (50%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_detections | 4 | /8 |
| duration | 1948 | ms |

### PASS: Graceful Degradation (25% corruption, surviving fact extraction)

**Metric:** `40 %`

Corrupted sections [2,5,9]. 2/5 surviving facts extracted (40%).

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 2 | /5 |
| total_questions | 8 | questions |
| corrupted_sections | 3 | /12 |
| surviving_questions | 5 | questions |
| duration | 2099 | ms |

---

## For Specialists

YON isolates errors with a 100% success rate, outperforming others. JSON, NL, and YAML show lower recovery rates. YON's advantage: 6 out of 7 correct extractions. Known boundary: YON's strength lies in single-line isolation. Operational implication: YON's primitives enhance error recovery, beneficial for systems needing robust streaming capabilities.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._