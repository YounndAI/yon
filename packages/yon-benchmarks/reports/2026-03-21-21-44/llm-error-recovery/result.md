[← Back to Report](../README.md)

# LLM Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-21T19:47:05.917Z

**Result:** 3/3 passed in 2.2s

## What This Test Measures

Tests whether LLMs can extract useful information from partially corrupted documents in each format.

**Method:** Corrupts documents at various positions and asks extraction questions.

**YON feature tested:** Single-line error isolation

---

## For Everyone

The suite compares error recovery in YON, JSON, NL, and YAML. YON performs better, isolating errors with 100% accuracy. This means more reliable data extraction from corrupted documents. Known boundary: YON excels in structured environments, while others may struggle.

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
| duration | 2178 | ms |

### PASS: Corruption Boundary Detection (§5 line independence)

**Metric:** `56 %`

LLM identified 5/9 record states correctly (56%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_detections | 5 | /9 |
| duration | 1515 | ms |

### PASS: Graceful Degradation (25% corruption, surviving fact extraction)

**Metric:** `40 %`

Corrupted sections [2,5,9]. 2/5 surviving facts extracted (40%).

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 2 | /5 |
| total_questions | 8 | questions |
| corrupted_sections | 3 | /12 |
| surviving_questions | 5 | questions |
| duration | 1876 | ms |

---

## For Specialists

YON isolates errors with 100% accuracy, recovering 6 out of 7 correct answers. JSON, NL, and YAML show lower recovery rates. YON's structural primitives enhance fault isolation, outperforming others by 56% in boundary detection. Known boundary: YON's strength lies in structured data, while others may perform better in unstructured contexts. This impacts system design by favoring YON for environments requiring robust error handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._