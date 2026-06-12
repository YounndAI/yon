[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-22T14:00:38.175Z

**Result:** 3/3 passed in 1m 12s (72s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This comparison evaluates data integrity in multi-agent pipelines. YON outperforms JSON, maintaining 100% accuracy versus JSON's 88%. YON's structure supports complex data flows, enhancing reliability. Known boundary: JSON struggles with added complexity, impacting accuracy.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 24235 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 29964 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 26 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 26 | records |
| yon_bytes | 1858 | bytes |
| duration | 18131 | ms |

---

## For Specialists

YON achieves 100% accuracy, surpassing JSON's 88% by {{THREE_HOP_YON_RELAY_VALUE - THREE_HOP_JSON_RELAY_VALUE}}%. YON retains 8 facts, adding 2. JSON retains 7 facts. YON's stream-first relay optimizes multi-hop processing. JSON's known boundary: increased duration at 29964 versus YON's 24235. Implication: YON suits complex, multi-agent systems, enhancing throughput and accuracy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._