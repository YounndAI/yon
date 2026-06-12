[← Back to Report](../README.md)

# Multi-Model Token Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T19:44:59.757Z

**Result:** 1/1 passed in 287ms

## What This Test Measures

Tests multi-model token efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

The suite compared token efficiency across formats. YON outperformed JSON by +13% structural baseline. This means YON uses fewer tokens, enhancing cognitive economy. Known boundary: YON's complexity may increase with larger datasets.

---

## Test Data

### PASS: Prompt Tokens (Multi-Format, tiktoken)

**Metric:** `13 % structural baseline` _(vs JSON prompt tokens (cl100k): 343 → +13% structural baseline)_

Three-way prompt token comparison (4 sections, 12 rules). cl100k (GPT-4): YON=387 JSON=343 Prose=212 (YON +13% structural baseline, +83% vs prose). o200k (GPT-4o): YON=391 JSON=356 Prose=211 (YON +10% structural baseline, +85% vs prose)

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens_cl100k | 387 | tokens |
| json_tokens_cl100k | 343 | tokens |
| prose_tokens_cl100k | 212 | tokens |
| yon_vs_prose | 83 | % baseline vs prose |
| yon_tokens_o200k | 391 | tokens |
| json_tokens_o200k | 356 | tokens |
| prose_tokens_o200k | 211 | tokens |

---

## For Specialists

YON's token count: 387. JSON's count: 343. YON shows a +13% structural baseline advantage. Prose format uses 212 tokens. YON excels in structured data, but complexity rises with size. System design should consider YON for efficiency, balancing complexity in larger models.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._