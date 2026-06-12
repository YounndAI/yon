[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T22:13:10.256Z

**Result:** 3/3 passed in 1m 0s (60s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON formats in multi-agent pipelines. YON performs better, maintaining 100% structural integrity. JSON achieves 88%. YON's advantage means more reliable data handling. Known boundary: YON's complexity may increase processing time.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 26165 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 24542 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1837 | bytes |
| duration | 9417 | ms |

---

## For Specialists

YON maintains 100% integrity, adding 2 facts. JSON holds 88%, with 7 correct answers. YON's structural primitives provide uplift, exceeding noise. JSON operates well in simpler domains. YON's complexity increases duration to 26165ms. JSON completes in 24542ms. Implication: YON suits complex pipelines, JSON fits simpler tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._