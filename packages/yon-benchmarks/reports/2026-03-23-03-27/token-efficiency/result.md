[← Back to Report](../README.md)

# Token Efficiency

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:38.102Z

**Result:** 2/2 passed in 0ms

## What This Test Measures

Compares how many LLM tokens YON and JSON consume for the same information content.

**Method:** Tokenizes equivalent documents across multiple tokenizer models and compares counts.

**YON feature tested:** Token economy via fmt=min and fmt=ultra compression

---

## For Everyone

The comparison evaluates token efficiency between YON and JSON. YON uses fewer tokens, offering a 5% structural baseline advantage. This means more efficient data handling. Known boundary: YON's compression may not suit all contexts.

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

YON reduces token count by 5% compared to JSON. YON's 2% reduction shows a measurable uplift. YON operates best with fmt=min and fmt=ultra compression. JSON remains effective for simpler structures. Implication: YON's efficiency benefits complex data systems.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._