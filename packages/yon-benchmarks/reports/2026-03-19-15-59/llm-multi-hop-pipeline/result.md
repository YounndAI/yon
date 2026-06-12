[← Back to Report](../README.md)

# LLM Multi-Hop Pipeline

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-19T14:00:29.211Z

**Result:** 3/3 passed in 1m 0s (60s)

## What This Test Measures

Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.

**Method:** Chains multiple LLM calls, passing output as input to the next agent.

**YON feature tested:** Stream-first multi-agent relay

---

## For Everyone

This suite compares YON and JSON in multi-agent pipelines. YON retains more structure, showing a 100% accuracy versus JSON's 88%. This means YON better preserves data integrity across agents. However, JSON processes faster, completing in 22530 milliseconds. Each format has its strengths, depending on the need for speed or accuracy.

---

## Test Data

### PASS: Three-Hop YON Relay (cross-model) [Advantage]

**Metric:** `100 %`

3-hop relay. Original facts: 8/8. Added facts: 2/2. Total: 10/10 (100%). Q1: , Q2: , Q3: , Q4: , Q5: , Q6:  (modified), Q7: , Q8: 

| Metric | Value | Unit |
|--------|-------|------|
| original_facts | 8 | /8 |
| added_facts | 2 | /2 |
| duration | 25307 | ms |

### PASS: Three-Hop JSON Relay (comparison) [Known Boundary]

**Metric:** `88 %`

3-hop JSON relay. Facts at hop 3: 7/8 (88%).

| Metric | Value | Unit |
|--------|-------|------|
| correct_answers | 7 | /8 |
| duration | 22530 | ms |

### PASS: Intermediate YON Parse Validity (§3 compliance)

**Metric:** `1 bool`

LLM-generated YON parses successfully: 25 records.

| Metric | Value | Unit |
|--------|-------|------|
| record_count | 25 | records |
| yon_bytes | 1925 | bytes |
| duration | 12330 | ms |

---

## For Specialists

YON achieves 100% accuracy, adding 2 facts, while JSON reaches 88% with 7 correct answers. YON's stream-first relay enhances structural retention, beneficial for complex pipelines. JSON's faster processing time of 22530 milliseconds suits time-sensitive tasks. YON's scope advantage lies in maintaining data integrity, while JSON excels in speed. System design should consider these operational characteristics for optimal format selection.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._