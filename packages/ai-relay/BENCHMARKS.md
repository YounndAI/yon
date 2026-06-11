# AI Relay Model Benchmark Report

> **Historical report (2026-05-09 pricing snapshot).** This is the original
> February 2026 benchmark run that informed the first preset selection. It
> references a `precise` preset and a `gpt-4o`-based scheme that **predate** the
> current preset set (`fast` / `balanced` / `reasoning` / `cheap`). Kept for
> provenance — see the README for the current presets and pricing.

**Date:** February 4, 2026  
**Package:** `@younndai/ai-relay` (historical — pre-v3 preset scheme)  
**SDK:** Vercel AI SDK with `@ai-sdk/openai`

## Objective

Select optimal OpenAI models for YON generation presets based on **speed** and **cost**. Choose wisely—every call costs tokens.

## Test Methodology

- **Iterations:** 5 per model
- **Prompt:** "Say hello." (minimal, consistent load)
- **Max Tokens:** 4000 (required for reasoning models)
- **Measured:** Latency (ms), completion tokens, success rate

## Results

| Model           | Avg Time | Tokens | Success | Cost (in/out per 1M) |
| --------------- | -------- | ------ | ------- | -------------------- |
| **gpt-4o**      | 566ms    | 9      | 100%    | $2.50 / $10.00       |
| **gpt-4o-mini** | 707ms    | 9      | 100%    | $0.15 / $0.60        |
| **gpt-5.2**     | 1353ms   | 5      | 100%    | $1.75 / $14.00       |
| gpt-5-mini      | 2673ms   | 44     | 100%    | $0.25 / $2.00        |
| gpt-5-nano      | 3292ms   | 160    | 100%    | $0.05 / $0.40        |

## Key Findings

Data informs decisions. These findings shaped our presets.

1. **Reasoning Models Are Slow:** gpt-5-nano and gpt-5-mini consume tokens for internal "thinking" before responding, resulting in 3-5x slower response times. The high token counts (44-160) reflect this internal reasoning overhead.

2. **gpt-4o Is Fastest:** Despite higher cost, gpt-4o delivers the lowest latency (566ms avg).

3. **gpt-4o-mini Is Best Value:** Nearly as fast (707ms) at 1/17th the cost. Ideal for high-volume workloads.

4. **gpt-5.2 Is Best Reasoning:** Moderate latency (1353ms), but lowest output tokens (5) indicating minimal bloat. Best for quality-critical, complex transformations.

## Preset Selection

Presets encode judgment. Choose based on use case, not defaults.

| Preset       | Model       | Rationale                                                                                                      |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------- |
| **fast**     | gpt-4o-mini | Best value for high-frequency pipelines, batch processing, AOT generation. Sub-second latency at minimal cost. |
| **balanced** | gpt-4o      | Fastest response for interactive use. Worth the premium for user-facing applications.                          |
| **precise**  | gpt-5.2     | Best reasoning quality for complex transformations. Use when accuracy trumps speed.                            |

## Cost Comparison (1M tokens processed)

Cost scales with volume. Plan accordingly.

| Preset             | Input Cost | Output Cost | Total      |
| ------------------ | ---------- | ----------- | ---------- |
| fast (gpt-4o-mini) | $0.15      | $0.60       | **$0.75**  |
| balanced (gpt-4o)  | $2.50      | $10.00      | **$12.50** |
| precise (gpt-5.2)  | $1.75      | $14.00      | **$15.75** |

## Notes

- **gpt-5-nano/mini require high max_tokens:** Without setting `maxTokens: 4000+`, these models return empty output due to token exhaustion during internal reasoning.
- **Reasoning models for batch only:** Consider gpt-5-nano ($0.45/1M total) for extremely cost-sensitive batch processing where latency is not critical.
- **Revisit quarterly:** OpenAI pricing and model availability change frequently. Re-benchmark when new models release.

---

_Measured by AI Relay. Numbers don't lie, but conditions vary. Verify before trusting._
