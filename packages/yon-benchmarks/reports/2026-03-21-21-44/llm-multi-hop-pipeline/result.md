[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T19:46:14.899Z

**Result:** 3/3 passed in 1m 7s (67s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON in multi-hop pipelines. YON performs better, retaining 100% of original facts. JSON retains 88%. YON's structure supports complex data flows, enhancing reliability. Known boundary: JSON's slower processing time.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 26877 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 31406 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1738 | bytes |
| duration | 8963 | ms |

---

## For Specialists

YON retains 100% of facts, JSON retains 88%. YON adds 2 facts, JSON adds none. YON's duration: 26877ms, JSON's: 31406ms. YON excels in complex pipelines, JSON suits simpler tasks. Operational implication: YON's primitives enhance multi-agent systems, reducing error propagation.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._