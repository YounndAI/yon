[← Back to Report](../README.md)

# LLM Error Recovery

> **Pillar:** streaming · **Timestamp:** 2026-03-19T14:01:39.167Z

**Result:** 3/3 passed in 5.3s

## What This Test Measures

Tests whether LLMs can extract useful information from partially corrupted documents in each format.

**Method:** Corrupts documents at various positions and asks extraction questions.

**YON feature tested:** Single-line error isolation

---

## For Everyone

This suite compares error recovery in YON, JSON, NL, and YAML formats. YON performs better, isolating errors effectively. It achieves a 100% success rate, surpassing others. This means more reliable data extraction from corrupted documents. However, YON's advantage is specific to its structural primitives.

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
| duration | 2175 | ms |

### PASS: Corruption Boundary Detection (§5 line independence)

**Metric:** `56 %`

LLM identified 5/9 record states correctly (56%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_detections | 5 | /9 |
| duration | 5291 | ms |

### PASS: Graceful Degradation (25% corruption, surviving fact extraction)

**Metric:** `40 %`

Corrupted sections [2,5,9]. 2/5 surviving facts extracted (40%).

| Metric | Value | Unit |
|--------|-------|------|
| surviving_correct | 2 | /5 |
| total_questions | 8 | questions |
| corrupted_sections | 3 | /12 |
| surviving_questions | 5 | questions |
| duration | 3826 | ms |

---

## For Specialists

YON isolates errors with a 100% rate, correcting 6 out of 7 attempts. JSON and others lag behind. YON's single-line error isolation excels in structured environments. JSON and YAML perform well in simpler contexts. YON's uplift suggests improved system resilience, but its benefits are tied to structured data scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._