[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:28:49.536Z

**Result:** 3/3 passed in 1m 2s (62s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON formats in multi-agent pipelines. YON performs better, maintaining 100% accuracy versus JSON's 88%. YON's structure supports complex data flows, enhancing reliability. Known boundary: JSON's longer processing time impacts efficiency.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 21716 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 33244 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1837 | bytes |
| duration | 7397 | ms |

---

## For Specialists

YON achieves 100% accuracy, surpassing JSON's 88%. YON adds 2 facts, while JSON maintains 7. YON's duration: 21716ms; JSON's: 33244ms. YON excels in stream-first relay, ideal for complex pipelines. JSON's known boundary: slower processing limits real-time applications.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._