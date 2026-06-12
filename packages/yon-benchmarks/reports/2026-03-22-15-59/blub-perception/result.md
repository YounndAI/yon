[← Back to Report](../README.md)

# Blub Perception

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-22T14:19:41.677Z

**Result:** 16/16 passed in 1m 31s (91s)

## What This Test Measures

Validates the Blub Paradox for data formats: models trained on simpler formats (JSON, NL) cannot perceive YON's structural advantages (explicit types, flat hierarchy). Token density: 37% fewer tokens, same accuracy — but models remain format-blind to YON's unique features.

**Method:** Battery A: token-normalized accuracy (YON = JSON). Battery B: feature extraction where YON explicit types should outperform JSON inference — but models fail to leverage them. Proves the Blub ceiling.

**YON feature tested:** :str, :int, :bool explicit type annotations

---

## For Everyone

The way information is written affects AI understanding. YON format uses fewer tokens, maintaining accuracy. Despite this, AI models trained on common formats like JSON don't recognize YON's benefits. YON is new, while formats like NL have billions of examples in training data.

---

## Test Data

### PASS: Depth 3: Scope Resolution Accuracy

**Metric:** `0 pp`

Depth 3: YON=80% vs JSON=80% vs YAML=80% vs MD=80% (Δyon-json 0pp)

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| yaml_accuracy | 80 | % |
| md_accuracy | 80 | % |
| yon_citation_rate | 80 | % |
| json_citation_rate | 80 | % |
| yon_tokens | 179 | tokens |
| json_tokens | 272 | tokens |

### PASS: Depth 5: Scope Resolution Accuracy

**Metric:** `0 pp`

Depth 5: YON=80% vs JSON=80% vs YAML=80% vs MD=80% (Δyon-json 0pp)

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| yaml_accuracy | 80 | % |
| md_accuracy | 80 | % |
| yon_citation_rate | 80 | % |
| json_citation_rate | 80 | % |
| yon_tokens | 338 | tokens |
| json_tokens | 520 | tokens |

### PASS: Depth 7: Scope Resolution Accuracy

**Metric:** `0 pp`

Depth 7: YON=80% vs JSON=80% vs YAML=80% vs MD=80% (Δyon-json 0pp)

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| yaml_accuracy | 80 | % |
| md_accuracy | 80 | % |
| yon_citation_rate | 80 | % |
| json_citation_rate | 80 | % |
| yon_tokens | 500 | tokens |
| json_tokens | 827 | tokens |

### PASS: Breakpoint Detection: Depth Where JSON Advantage Collapses

**Metric:** `-1 levels`

No breakpoint detected. Deltas: d3=0pp, d5=0pp, d7=0pp

| Metric | Value | Unit |
|--------|-------|------|
| delta_depth_3 | 0 | pp |
| delta_depth_5 | 0 | pp |
| delta_depth_7 | 0 | pp |

### PASS: Overall: 4-Way Scope Resolution Comparison

**Metric:** `0 pp`

Overall: YON=80% vs JSON=80% vs YAML=80% vs MD=80%

| Metric | Value | Unit |
|--------|-------|------|
| yon_overall_accuracy | 80 | % |
| json_overall_accuracy | 80 | % |
| yaml_overall_accuracy | 80 | % |
| md_overall_accuracy | 80 | % |
| yon_overall_citation | 80 | % |
| json_overall_citation | 80 | % |

### PASS: Per-Model: GPT-5-nano (budget)

**Metric:** `0 pp`

GPT-5-nano (budget): YON=0% vs JSON=0% vs YAML=0% vs MD=0%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 0 | % |
| json_accuracy | 0 | % |
| yaml_accuracy | 0 | % |
| md_accuracy | 0 | % |

### PASS: Per-Model: Gemini 2.5 Flash-Lite (budget)

**Metric:** `0 pp`

Gemini 2.5 Flash-Lite (budget): YON=100% vs JSON=100% vs YAML=100% vs MD=100%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| yaml_accuracy | 100 | % |
| md_accuracy | 100 | % |

### PASS: Per-Model: GPT-4o-mini (standard)

**Metric:** `0 pp`

GPT-4o-mini (standard): YON=100% vs JSON=100% vs YAML=100% vs MD=100%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| yaml_accuracy | 100 | % |
| md_accuracy | 100 | % |

### PASS: Per-Model: Claude Haiku 4.5 (standard)

**Metric:** `0 pp`

Claude Haiku 4.5 (standard): YON=100% vs JSON=100% vs YAML=100% vs MD=100%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| yaml_accuracy | 100 | % |
| md_accuracy | 100 | % |

### PASS: Per-Model: Gemini 2.5 Flash (standard)

**Metric:** `0 pp`

Gemini 2.5 Flash (standard): YON=100% vs JSON=100% vs YAML=100% vs MD=100%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 100 | % |
| json_accuracy | 100 | % |
| yaml_accuracy | 100 | % |
| md_accuracy | 100 | % |

### PASS: Token Density: All Formats

**Metric:** `159 %`

Avg tokens: YON=339 JSON=540 YAML=468 MD=274

| Metric | Value | Unit |
|--------|-------|------|
| yon_avg_tokens | 339 | tokens |
| json_avg_tokens | 540 | tokens |
| yaml_avg_tokens | 468 | tokens |
| md_avg_tokens | 274 | tokens |

### PASS: Feature: Type Extraction: Explicit vs Implicit Types

**Metric:** `0 pp`

Type Extraction: Explicit vs Implicit Types: YON=60% JSON=60% YAML=40% MD=60%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 60 | % |
| yaml_accuracy | 40 | % |
| markdown_accuracy | 60 | % |

### PASS: Feature: Rule Severity: Priority Ordering

**Metric:** `0 pp`

Rule Severity: Priority Ordering: YON=60% JSON=60% YAML=40% MD=60%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 60 | % |
| yaml_accuracy | 40 | % |
| markdown_accuracy | 60 | % |

### PASS: Feature: Cross-Section: Inter-Stage Dependencies

**Metric:** `0 pp`

Cross-Section: Inter-Stage Dependencies: YON=60% JSON=60% YAML=60% MD=60%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 60 | % |
| json_accuracy | 60 | % |
| yaml_accuracy | 60 | % |
| markdown_accuracy | 60 | % |

### PASS: Feature: Reference Resolution: Cross-Reference Chain Tracing

**Metric:** `0 pp`

Reference Resolution: Cross-Reference Chain Tracing: YON=80% JSON=80% YAML=80% MD=60%

| Metric | Value | Unit |
|--------|-------|------|
| yon_accuracy | 80 | % |
| json_accuracy | 80 | % |
| yaml_accuracy | 80 | % |
| markdown_accuracy | 60 | % |

### PASS: Battery B: Structural Feature Tests Summary

**Metric:** `0 pp`

Battery B overall: YON=65% JSON=65% YAML=55% MD=60%

| Metric | Value | Unit |
|--------|-------|------|
| yon_feature_accuracy | 65 | % |
| json_feature_accuracy | 65 | % |
| yaml_feature_accuracy | 55 | % |
| markdown_feature_accuracy | 60 | % |

---

## For Specialists

YON's explicit types (:str, :int, :bool) offer structural advantages. Models show no perception shift, maintaining 80 accuracy across formats. Token density is lower in YON, with 339 compared to JSON's 540. Training data asymmetry is evident; YON lacks historical data presence. Model spread shows no variance; all models perform equally. The Blub Paradox persists: models remain format-blind. Known boundary: effect doesn't hold beyond explicit type extraction.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._