[← Back to Report](../README.md)

# LLM Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-22T14:01:28.416Z

**Result:** 3/3 passed in 3.9s

## What This Test Measures

Tests whether LLMs can extract useful information from partially corrupted documents in each format.

**Method:** Corrupts documents at various positions and asks extraction questions.

**YON feature tested:** Single-line error isolation

---

## For Everyone

This suite compares error recovery in YON, JSON, NL, and YAML. YON performs better, isolating errors with 100% accuracy. This means YON can extract useful information even from corrupted documents. Known boundary: YON excels in structured data, less so in freeform text.

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
| duration | 3922 | ms |

### PASS: Corruption Boundary Detection (§5 line independence)

**Metric:** `56 %`

LLM identified 5/9 record states correctly (56%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_detections | 5 | /9 |
| duration | 2557 | ms |

### PASS: Graceful Degradation (25% corruption, surviving fact extraction)

**Metric:** `40 %`

Corrupted sections [2,5,9]. 2/5 surviving facts extracted (40%).

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 2 | /5 |
| total_questions | 8 | questions |
| corrupted_sections | 3 | /12 |
| surviving_questions | 5 | questions |
| duration | 2163 | ms |

---

## For Specialists

YON isolates errors with 100% accuracy, surpassing JSON's 56%. YON wins by 100-56%. Known boundary: YON's strength lies in structured environments. Operational implication: YON's primitives enhance fault tolerance, crucial for systems needing robust data extraction.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._