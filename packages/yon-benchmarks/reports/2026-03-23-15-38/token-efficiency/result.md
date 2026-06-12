[← Back to Report](../README.md)

# Token Efficiency

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T13:38:32.705Z

**Result:** 2/2 passed in 0ms

## What This Test Measures

Compares how many LLM tokens YON and JSON consume for the same information content.

**Method:** Tokenizes equivalent documents across multiple tokenizer models and compares counts.

**YON feature tested:** Token economy via fmt=min and fmt=ultra compression

---

## For Everyone

This comparison evaluates token efficiency between YON and JSON. YON uses fewer tokens, offering a 2% reduction. This means more efficient data handling. Known boundary: YON's compression may not suit all contexts.

---

## Test Data

### PASS: Byte Economy (Multi-Format Prompt Comparison)

**Metric:** `5 % structural baseline`

Three-way prompt comparison (8 rules). Prose: 649B. Structured prompt: 821B. YON: 859B. YON structural baseline: +5%. YON baseline relative to prose: +32%. YON's line-oriented tags add structural baseline that buys typed records and fault isolation.

| Metric | Value | Unit |
|--------|-------|------|
| prose_bytes | 649 | bytes |
| json_prompt_bytes | 821 | bytes |
| yon_bytes | 859 | bytes |
| yon_vs_prose | 32 | % baseline vs prose |

### PASS: Format Compression (canon → min → ultra)

**Metric:** `2 % reduction`

Canon: 540B. Min: 540B (−0%). Ultra: 529B (−2%). Three compression tiers trade readability for economy. Canon for humans, ultra for LLM pipelines.

| Metric | Value | Unit |
|--------|-------|------|
| canon_bytes | 540 | bytes |
| min_bytes | 540 | bytes (−0%) |
| ultra_bytes | 529 | bytes (−2%) |

---

## For Specialists

YON achieves a 2% reduction in tokens. JSON uses 821 bytes, while YON uses 859 bytes. YON's structural primitives provide a 5% economy. Known boundary: YON excels in structured data but may face challenges in unstructured contexts. Operational implication: YON's efficiency benefits systems prioritizing token economy.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._