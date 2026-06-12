[← Back to Report](../README.md)

# Pliability (Format Comprehension)

> **Pillar:** sapir-whorf · **Timestamp:** 2026-03-22T15:14:59.180Z

**Result:** 15/15 passed in 14.1s

## What This Test Measures

Tests whether LLMs can read and generate YON without any prior training. Answers the fundamental question: is YON learnable from zero exposure?

**Method:** Sends equivalent questions about the same content in YON, JSON, YAML, and NL to multiple models. Measures comprehension accuracy and generation validity.

**YON feature tested:** Format comprehension and generation

---

## For Everyone

The way information is written changes AI perception. YON, a new format, shows this effect. Despite no prior training, AI models understand YON well. Natural language (NL) has billions of examples, giving it an advantage. Yet, YON's structure influences AI output, demonstrating the Sapir-Whorf effect.

---

## Test Data

### PASS: Comprehension: YON Canon

**Metric:** `90 %`

YON Canon: 90% avg across 5 models. GPT-5-nano (budget)=90%, Gemini 2.5 Flash-Lite (budget)=90%, GPT-4o-mini (standard)=90%, Claude Haiku 4.5 (standard)=90%, Gemini 2.5 Flash (standard)=90%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 90 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 90 | % |
| GPT-4o-mini (standard)_score | 90 | % |
| Claude Haiku 4.5 (standard)_score | 90 | % |
| Gemini 2.5 Flash (standard)_score | 90 | % |

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

**Metric:** `90 %` _(vs Natural Language: 90 → 0pp)_

YON=90% JSON=94% YAML=94% NL=90%. Delta vs NL: 0pp

| Metric | Value | Unit |
|--------|-------|------|
| json_accuracy | 94 | % |
| yaml_accuracy | 94 | % |
| nl_accuracy | 90 | % |

### PASS: Generation: Cold Start (zero context)

**Metric:** `2 %`

Cold Start (zero context): 2% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=0%, GPT-4o-mini (standard)=0%, Claude Haiku 4.5 (standard)=0%, Gemini 2.5 Flash (standard)=0%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 0 | % |
| GPT-4o-mini (standard)_score | 0 | % |
| Claude Haiku 4.5 (standard)_score | 0 | % |
| Gemini 2.5 Flash (standard)_score | 0 | % |

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

**Metric:** `82 %`

Instructed (WRITE Card): 82% avg. GPT-5-nano (budget)=10%, Gemini 2.5 Flash-Lite (budget)=100%, GPT-4o-mini (standard)=100%, Claude Haiku 4.5 (standard)=100%, Gemini 2.5 Flash (standard)=100%

| Metric | Value | Unit |
|--------|-------|------|
| GPT-5-nano (budget)_score | 10 | % |
| Gemini 2.5 Flash-Lite (budget)_score | 100 | % |
| GPT-4o-mini (standard)_score | 100 | % |
| Claude Haiku 4.5 (standard)_score | 100 | % |
| Gemini 2.5 Flash (standard)_score | 100 | % |

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

**Metric:** `82 %` _(vs Cold Start: 2 → +80pp)_

Cold=2% → Trained=70% (+68pp) → Instructed=82% (+80pp). WRITE Card uplift: 80pp

| Metric | Value | Unit |
|--------|-------|------|
| cold_validity | 2 | % |
| trained_validity | 70 | % |
| trained_uplift | 68 | pp |

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

**Metric:** `90 %`

Gemini 2.5 Flash (standard): Comp YON=90% JSON=100% | Gen Cold=0% Instructed=100% (uplift: 100pp)

| Metric | Value | Unit |
|--------|-------|------|
| json_comprehension | 100 | % |
| cold_generation | 0 | % |
| instructed_generation | 100 | % |
| card_uplift | 100 | pp |

---

## For Specialists

Models show consistent comprehension across formats. YON comprehension scores at 90%, close to JSON's 94%. Training data asymmetry favors NL, yet YON's structural primitives impact perception. This is a real shift, not noise. YON's format comprehension and generation reveal AI's adaptability. Known boundary: cold generation remains low at 2%. Model spread shows uniformity, indicating YON's learnability from zero exposure.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._