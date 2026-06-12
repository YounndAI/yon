[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-22T15:13:42.016Z

**Result:** 3/3 passed in 1m 8s (68s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON formats in multi-hop LLM pipelines. YON performs better, retaining 100% of original facts versus JSON's 88%. This means YON maintains data integrity more effectively. However, JSON's known boundary is longer processing time, taking 30188 milliseconds compared to YON's 27648 milliseconds.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 27648 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 30188 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1844 | bytes |
| duration | 10661 | ms |

---

## For Specialists

YON retains 100% of facts, adding 2 new facts. JSON retains 88% with 7 correct answers. YON's structural primitives offer a 100% to 88% delta. JSON operates within a longer duration boundary, 30188 milliseconds. YON's stream-first relay reduces processing time, enhancing system efficiency.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._