[← Back to Report](../README.md)

# Quality-Adjusted Cost

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-22T13:59:24.811Z

**Result:** 3/3 passed in 6.7s

## What This Test Measures

Tests quality-adjusted cost capabilities within the cognitive-economy pillar.

---

## For Everyone

The suite compares YON against JSON, NL, and YAML. YON shows a strong advantage in quality-adjusted cost. It achieves a -30% reduction compared to prose. This means lower costs for similar complexity tasks. Known boundaries include specific format efficiencies.

---

## Test Data

### PASS: Scale Sweep (7 tiers × 21 total variants, pre-generated)

**Metric:** `-30 % vs prose (avg min, Enterprise)` _(vs % avg baseline at smallest tier (min): 43 → YON wins at Snippet tier (avg 3 variants, min mode))_

YON wins at Snippet tier (avg 3 variants, min mode). Chat: C=+70% M=+43% [5% to 63%] U=+50% FAIL | Snippet: C=+44% M=+6% [-21% to 21%] U=+9% PASS | Prompt: C=-3% M=-26% [-49% to 6%] U=-24% PASS | System: C=-21% M=-35% [-45% to -25%] U=-34% PASS | Enterprise: C=-7% M=-30% [-44% to -17%] U=-29% PASS | Platform: C=+9% M=-23% [-30% to -19%] U=-21% PASS | Knowledge: C=+15% M=-20% [-32% to -14%] U=-17% PASS

| Metric | Value | Unit |
|--------|-------|------|
| avg_prose_tok_chat | 153 | tokens (avg) |
| avg_min_tok_chat | 200 | tokens (avg) |
| avg_baseline_canon_chat | 70 | % vs prose (avg) |
| avg_baseline_min_chat | 43 | % vs prose (avg) |
| avg_baseline_ultra_chat | 50 | % vs prose (avg) |
| avg_prose_tok_snippet | 340 | tokens (avg) |
| avg_min_tok_snippet | 332 | tokens (avg) |
| avg_baseline_canon_snippet | 44 | % vs prose (avg) |
| avg_baseline_min_snippet | 6 | % vs prose (avg) |
| avg_baseline_ultra_snippet | 9 | % vs prose (avg) |
| avg_prose_tok_prompt | 761 | tokens (avg) |
| avg_min_tok_prompt | 508 | tokens (avg) |
| avg_baseline_canon_prompt | -3 | % vs prose (avg) |
| avg_baseline_min_prompt | -26 | % vs prose (avg) |
| avg_baseline_ultra_prompt | -24 | % vs prose (avg) |
| avg_prose_tok_system | 1664 | tokens (avg) |
| avg_min_tok_system | 1136 | tokens (avg) |
| avg_baseline_canon_system | -21 | % vs prose (avg) |
| avg_baseline_min_system | -35 | % vs prose (avg) |
| avg_baseline_ultra_system | -34 | % vs prose (avg) |
| avg_prose_tok_enterprise | 2629 | tokens (avg) |
| avg_min_tok_enterprise | 1766 | tokens (avg) |
| avg_baseline_canon_enterprise | -7 | % vs prose (avg) |
| avg_baseline_min_enterprise | -30 | % vs prose (avg) |
| avg_baseline_ultra_enterprise | -29 | % vs prose (avg) |
| avg_prose_tok_platform | 4197 | tokens (avg) |
| avg_min_tok_platform | 3191 | tokens (avg) |
| avg_baseline_canon_platform | 9 | % vs prose (avg) |
| avg_baseline_min_platform | -23 | % vs prose (avg) |
| avg_baseline_ultra_platform | -21 | % vs prose (avg) |
| avg_prose_tok_knowledge | 5764 | tokens (avg) |
| avg_min_tok_knowledge | 4552 | tokens (avg) |
| avg_baseline_canon_knowledge | 15 | % vs prose (avg) |
| avg_baseline_min_knowledge | -20 | % vs prose (avg) |
| avg_baseline_ultra_knowledge | -17 | % vs prose (avg) |
| verbose_baseline_min_chat | 5 | % vs prose (verbose) |
| clean_baseline_min_chat | 60 | % vs prose (clean) |
| mixed_baseline_min_chat | 63 | % vs prose (mixed) |
| verbose_baseline_min_snippet | -21 | % vs prose (verbose) |
| clean_baseline_min_snippet | 21 | % vs prose (clean) |
| mixed_baseline_min_snippet | 18 | % vs prose (mixed) |
| verbose_baseline_min_prompt | -49 | % vs prose (verbose) |
| clean_baseline_min_prompt | 6 | % vs prose (clean) |
| mixed_baseline_min_prompt | -35 | % vs prose (mixed) |
| verbose_baseline_min_system | -25 | % vs prose (verbose) |
| clean_baseline_min_system | -34 | % vs prose (clean) |
| mixed_baseline_min_system | -45 | % vs prose (mixed) |
| verbose_baseline_min_enterprise | -44 | % vs prose (verbose) |
| clean_baseline_min_enterprise | -29 | % vs prose (clean) |
| mixed_baseline_min_enterprise | -17 | % vs prose (mixed) |
| verbose_baseline_min_platform | -30 | % vs prose (verbose) |
| clean_baseline_min_platform | -19 | % vs prose (clean) |
| mixed_baseline_min_platform | -21 | % vs prose (mixed) |
| verbose_baseline_min_knowledge | -32 | % vs prose (verbose) |
| clean_baseline_min_knowledge | -14 | % vs prose (clean) |
| mixed_baseline_min_knowledge | -14 | % vs prose (mixed) |
| range_min_chat | 58 | % spread (5% to 63%) |
| range_min_snippet | 42 | % spread (-21% to 21%) |
| range_min_prompt | 55 | % spread (-49% to 6%) |
| range_min_system | 20 | % spread (-45% to -25%) |
| range_min_enterprise | 27 | % spread (-44% to -17%) |
| range_min_platform | 11 | % spread (-30% to -19%) |
| range_min_knowledge | 18 | % spread (-32% to -14%) |
| cost_savings_chat | -5 | % (positive = YON cheaper) |
| cost_savings_snippet | 21 | % (positive = YON cheaper) |
| cost_savings_prompt | 46 | % (positive = YON cheaper) |
| cost_savings_system | 45 | % (positive = YON cheaper) |
| cost_savings_enterprise | 46 | % (positive = YON cheaper) |
| cost_savings_platform | 39 | % (positive = YON cheaper) |
| cost_savings_knowledge | 36 | % (positive = YON cheaper) |
| tiers_evaluated | 7 | tiers |
| total_variants | 21 | variants |
| tiers_yon_wins | 6 | tiers |

### PASS: Retry Cost Amplification (Enterprise, Min, 3 variants)

**Metric:** `46 % savings (positive = YON cheaper)` _(vs Prose retry rate (%): 43 → Prose retries 43% vs break-even -23%)_

Enterprise (avg 3 variants, min format). YON: 1766 tok, Prose: 2629 tok (33% savings). Net cost savings with retries: 46%. Break-even: prose needs ≥-23% retries.

| Metric | Value | Unit |
|--------|-------|------|
| verbose_yon_min_tokens | 2031 | tokens |
| clean_yon_min_tokens | 1426 | tokens |
| mixed_yon_min_tokens | 1841 | tokens |
| verbose_prose_tokens | 3655 | tokens |
| clean_prose_tokens | 2012 | tokens |
| mixed_prose_tokens | 2220 | tokens |
| avg_yon_min_tokens | 1766 | tokens (avg) |
| avg_prose_tokens | 2629 | tokens (avg) |
| token_savings_pct | 33 | % savings vs prose (avg, positive = YON smaller) |
| variants_count | 3 | variants |
| yon_avg_retries | 0.149 | retries/call |
| prose_avg_retries | 0.429 | retries/call |
| yon_total_cost_1m | 5074.71 | $/1M calls |
| prose_total_cost_1m | 9389.29 | $/1M calls |
| break_even_retry_rate | -23 | % |

### PASS: Multi-Turn Context Cost (Enterprise, Min, 3 variants avg)

**Metric:** `28 % savings at 5 turns (positive = YON cheaper)` _(vs Prose cost ($/1M 5-turn sessions): 37862.5 → 28% savings at 5 turns, 24% at 10 turns)_

1T: YON=1766tok Prose=2629tok (33% savings). 3T: YON=5898tok Prose=8487tok (31% savings). 5T: YON=10830tok Prose=15145tok (28% savings). 10T: YON=26660tok Prose=35290tok (24% savings).

| Metric | Value | Unit |
|--------|-------|------|
| verbose_yon_base_tokens | 2031 | tokens/turn |
| clean_yon_base_tokens | 1426 | tokens/turn |
| mixed_yon_base_tokens | 1841 | tokens/turn |
| verbose_prose_base_tokens | 3655 | tokens/turn |
| clean_prose_base_tokens | 2012 | tokens/turn |
| mixed_prose_base_tokens | 2220 | tokens/turn |
| savings_1t | 33 | % savings |
| savings_3t | 31 | % savings |
| savings_5t | 28 | % savings |
| savings_10t | 24 | % savings |
| avg_base_token_savings | 33 | % savings vs prose/turn |
| variants_count | 3 | variants |

---

## For Specialists

YON outperforms others by -30% in cost savings. It wins in 6 out of 7 tiers. JSON and YAML perform well in simpler domains. YON's structural primitives reduce token usage, impacting system design positively. Known boundaries include format-specific efficiencies and retry rates.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._