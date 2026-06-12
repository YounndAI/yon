[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:08:21.877Z

**Result:** 3/3 passed in 58.9s

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This test compares YON and JSON formats in multi-agent pipelines. YON performs better, maintaining 100% structure accuracy. JSON achieves 88%. YON's advantage means more reliable data processing. Known boundary: JSON's slower processing time.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 22702 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 25846 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1925 | bytes |
| duration | 10385 | ms |

---

## For Specialists

YON outperforms JSON by 100% to 88%. YON's stream-first relay reduces processing time to 22702ms. JSON takes 25846ms. YON excels in complex pipelines, maintaining 1 validity across 25 records. JSON's known boundary: slower relay impacts system throughput.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._