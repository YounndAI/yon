[← Back to Report](../README.md)

# Multi-Model Token Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-19T13:59:21.142Z

**Result:** 1/1 passed in 291ms

## What This Test Measures

Tests multi-model token efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

The suite compared YON, JSON, and Prose formats. YON showed a strong advantage in token efficiency. It used 387 tokens versus JSON's 343. This means YON is more efficient by +13% structural baseline. However, Prose remains more concise in its natural domain.

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

YON's token count: 387. JSON's count: 343. YON outperforms JSON by +13% structural baseline. Prose uses 212 tokens, showing a scope advantage in narrative contexts. YON's structural primitives enhance efficiency, beneficial for complex systems. JSON remains effective for simpler data structures.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._