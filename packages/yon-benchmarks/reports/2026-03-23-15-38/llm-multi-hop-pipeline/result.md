[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T13:39:52.377Z

**Result:** 3/3 passed in 1m 11s (71s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This test compares YON and JSON formats in multi-agent pipelines. YON performs better, retaining 100% of original facts versus JSON's 88%. This means YON maintains data integrity more effectively. Known boundary: JSON's structure struggles with complex relays.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 24328 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 33044 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1907 | bytes |
| duration | 13685 | ms |

---

## For Specialists

YON retains 100% of facts, JSON 88%. YON adds 2 facts, JSON retains 7. YON's duration: 24328ms, JSON: 33044ms. YON excels in complex pipelines, JSON suits simpler tasks. Operational implication: YON's primitives enhance multi-hop reliability, crucial for intricate systems.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._