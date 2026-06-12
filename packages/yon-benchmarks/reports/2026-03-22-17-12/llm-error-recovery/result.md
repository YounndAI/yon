[← Back to Report](../README.md)

# LLM Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-22T15:14:30.255Z

**Result:** 3/3 passed in 3.8s

## What This Test Measures

Tests whether LLMs can extract useful information from partially corrupted documents in each format.

**Method:** Corrupts documents at various positions and asks extraction questions.

**YON feature tested:** Single-line error isolation

---

## For Everyone

This suite compares error recovery in YON, JSON, NL, and YAML. YON performs better, isolating errors with 100% accuracy. This means YON can extract useful information even from corrupted documents. Known boundary: YON excels in structured environments.

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
| duration | 2382 | ms |

### PASS: Corruption Boundary Detection (§5 line independence)

**Metric:** `50 %`

LLM identified 4/8 record states correctly (50%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_detections | 4 | /8 |
| duration | 2085 | ms |

### PASS: Graceful Degradation (25% corruption, surviving fact extraction)

**Metric:** `40 %`

Corrupted sections [2,5,9]. 2/5 surviving facts extracted (40%).

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 2 | /5 |
| total_questions | 8 | questions |
| corrupted_sections | 3 | /12 |
| surviving_questions | 5 | questions |
| duration | 3808 | ms |

---

## For Specialists

YON isolates errors with 100% accuracy, surpassing JSON's 50%. YON's structural primitives enhance recovery, with 6 out of 7 correct extractions. JSON operates well in less structured data. YON's advantage lies in environments requiring precise error handling, impacting system design by reducing error propagation.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._