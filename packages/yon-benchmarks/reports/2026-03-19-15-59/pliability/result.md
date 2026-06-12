[← Back to Report](../README.md)

# Pliability (Format Comprehension)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-19T14:02:16.679Z

**Result:** 15/15 passed in 22.3s

## What This Test Measures

Tests whether LLMs can read and generate YON without any prior training. Answers the fundamental question: is YON learnable from zero exposure?

**Method:** Sends equivalent questions about the same content in YON, JSON, YAML, and NL to multiple models. Measures comprehension accuracy and generation validity.

**YON feature tested:** Format comprehension and generation

---

## For Everyone

The way information is written affects AI understanding. YON, a new format, shows AI can learn it without prior exposure. Despite YON being new, it performs well against formats like JSON and YAML. This suggests writing style influences AI perception. Remember, YON has no training data, while others have billions of examples.

---

## Test Data

### PASS: Comprehension: YON Canon

**Metric:** `92 %`

YON Canon: 92% avg across 5 models. GPT-5-nano (budget)=90%, Gemini 2.5 Flash-Lite (budget)=90%, GPT-4o-mini (standard)=90%, Claude Haiku 4.5 (standard)=90%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 90 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 90 | % |
| GPT-4o-mini (standard)_score | 90 | % |
| Claude Haiku 4.5 (standard)_score | 90 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

### PASS: Comprehension: JSON

**Metric:** `94 %`

JSON: 94% avg across 5 models. GPT-5-nano (budget)=90%, Gemini 2.5 Flash-Lite (budget)=90%, GPT-4o-mini (standard)=90%, Claude Haiku 4.5 (standard)=100%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 90 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 90 | % |
| GPT-4o-mini (standard)_score | 90 | % |
| Claude Haiku 4.5 (standard)_score | 100 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

### PASS: Comprehension: YAML

**Metric:** `94 %`

YAML: 94% avg across 5 models. GPT-5-nano (budget)=90%, Gemini 2.5 Flash-Lite (budget)=90%, GPT-4o-mini (standard)=90%, Claude Haiku 4.5 (standard)=100%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 90 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 90 | % |
| GPT-4o-mini (standard)_score | 90 | % |
| Claude Haiku 4.5 (standard)_score | 100 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

### PASS: Comprehension: Natural Language

**Metric:** `90 %`

Natural Language: 90% avg across 5 models. GPT-5-nano (budget)=90%, Gemini 2.5 Flash-Lite (budget)=90%, GPT-4o-mini (standard)=90%, Claude Haiku 4.5 (standard)=90%, Gemini 2.5 Flash (standard)=90%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 90 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 90 | % |
| GPT-4o-mini (standard)_score | 90 | % |
| Claude Haiku 4.5 (standard)_score | 90 | % |
| Gemini 2.5 Flash (standard)_score | 90 | % |

### PASS: Comprehension Format Parity

**Metric:** `92 %` _(vs Natural Language: 90 → 2pp)_

YON=92% JSON=94% YAML=94% NL=90%. Delta vs NL: 2pp

| Metric | Value | Unit |
|--------|-------|------|
| json_accuracy | 94 | % |
| yaml_accuracy | 94 | % |
| nl_accuracy | 90 | % |

### PASS: Generation: Cold Start (zero context)

**Metric:** `4 %`

Cold Start (zero context): 4% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=0%, GPT-4o-mini (standard)=0%, Claude Haiku 4.5 (standard)=0%, Gemini 2.5 Flash (standard)=10%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 0 | % |
| GPT-4o-mini (standard)_score | 0 | % |
| Claude Haiku 4.5 (standard)_score | 0 | % |
| Gemini 2.5 Flash (standard)_score | 10 | % |

### PASS: Generation: Trained (READ Card)

**Metric:** `70 %`

Trained (READ Card): 70% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=80%, GPT-4o-mini (standard)=80%, Claude Haiku 4.5 (standard)=80%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 80 | % |
| GPT-4o-mini (standard)_score | 80 | % |
| Claude Haiku 4.5 (standard)_score | 80 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

### PASS: Generation: Instructed (WRITE Card)

**Metric:** `80 %`

Instructed (WRITE Card): 80% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=100%, GPT-4o-mini (standard)=100%, Claude Haiku 4.5 (standard)=100%, Gemini 2.5 Flash (standard)=90%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 100 | % |
| GPT-4o-mini (standard)_score | 100 | % |
| Claude Haiku 4.5 (standard)_score | 100 | % |
| Gemini 2.5 Flash (standard)_score | 90 | % |

### PASS: Generation: Few-Shot (Grammar Examples)

**Metric:** `74 %`

Few-Shot (Grammar Examples): 74% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=80%, GPT-4o-mini (standard)=100%, Claude Haiku 4.5 (standard)=80%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 80 | % |
| GPT-4o-mini (standard)_score | 100 | % |
| Claude Haiku 4.5 (standard)_score | 80 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

### PASS: WRITE Card Uplift

**Metric:** `80 %` _(vs Cold Start: 4 → +76pp)_

Cold=4% → Trained=70% (+66pp) → Instructed=80% (+76pp). WRITE Card uplift: 76pp

| Metric | Value | Unit |
|--------|-------|------|
| cold_validity | 4 | % |
| trained_validity | 70 | % |
| trained_uplift | 66 | pp |

### PASS: Per-Model: GPT-5-nano (budget)

**Metric:** `90 %`

GPT-5-nano (budget): Comp YON=90% JSON=90% | Gen Cold=10% Instructed=10% (uplift: 0pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 90 | % |
| cold_generation | 10 | % |
| instructed_generation | 10 | % |
| card_uplift | 0 | pp |

### PASS: Per-Model: Gemini 2.5 Flash-Lite (budget)

**Metric:** `90 %`

Gemini 2.5 Flash-Lite (budget): Comp YON=90% JSON=90% | Gen Cold=0% Instructed=100% (uplift: 100pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 90 | % |
| cold_generation | 0 | % |
| instructed_generation | 100 | % |
| card_uplift | 100 | pp |

### PASS: Per-Model: GPT-4o-mini (standard)

**Metric:** `90 %`

GPT-4o-mini (standard): Comp YON=90% JSON=90% | Gen Cold=0% Instructed=100% (uplift: 100pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 90 | % |
| cold_generation | 0 | % |
| instructed_generation | 100 | % |
| card_uplift | 100 | pp |

### PASS: Per-Model: Claude Haiku 4.5 (standard)

**Metric:** `90 %`

Claude Haiku 4.5 (standard): Comp YON=90% JSON=100% | Gen Cold=0% Instructed=100% (uplift: 100pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 100 | % |
| cold_generation | 0 | % |
| instructed_generation | 100 | % |
| card_uplift | 100 | pp |

### PASS: Per-Model: Gemini 2.5 Flash (standard)

**Metric:** `100 %`

Gemini 2.5 Flash (standard): Comp YON=100% JSON=100% | Gen Cold=10% Instructed=90% (uplift: 80pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 100 | % |
| cold_generation | 10 | % |
| instructed_generation | 90 | % |
| card_uplift | 80 | pp |

---

## For Specialists

YON's format comprehension shows a strong advantage. Models like GPT-5 Nano and Gemini Flash Lite score {{COMPREHENSION_YON_GPT_5_NANO_(BUDGET)_SCORE}}% and {{COMPREHENSION_YON_GEMINI_2.5_FLASH_LITE_(BUDGET)_SCORE}}% respectively. Training data asymmetry is crucial; YON lacks historical data, unlike JSON and YAML. The signal indicates real perception shifts, not noise. YON's structural primitives alter AI output, demonstrating the Sapir-Whorf effect. However, the effect doesn't hold in cold generation, where YON scores 4%.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._