[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T18:12:26.795Z

**Result:** 3/3 passed in 1m 17s (77s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON in multi-agent pipelines. YON maintains structure better, with a 100% accuracy versus JSON's 88%. This means YON handles complex data flows more reliably. Known boundary: JSON's structure degrades faster under repeated processing.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 27751 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 35871 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1752 | bytes |
| duration | 13301 | ms |

---

## For Specialists

YON achieves 100% accuracy, surpassing JSON's 88% by {{THREE_HOP_YON_RELAY_VALUE - THREE_HOP_JSON_RELAY_VALUE}}%. YON's stream-first relay excels in multi-hop scenarios, preserving 8 original facts and adding 2. JSON retains 7 facts. YON's known boundary: higher initial complexity. JSON's known boundary: faster degradation. Implication: YON suits complex, multi-agent systems needing robust data integrity.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._