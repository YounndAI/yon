# YON Benchmark Aggregate Report

> **10 runs** · **70 suites** · **608 tests per run** · **6,080 test executions** · **0 failures**

---

## Methodology and scope

These results are self-run by YounndAI, on five smaller models (Gemini 2.5 Flash, Claude Haiku 4.5, GPT-4o-mini, GPT-5-nano, Gemini 2.5 Flash-Lite), in a single environment. No frontier model is included, and no third-party evaluation exists yet. Read them accordingly.

- **Deterministic metrics** (parsing, recovery, fidelity, throughput) are reproducible and identical across runs.
- **LLM-dependent metrics** (comprehension, value amplifier, alignment) are directional and self-reported, not independent.
- **Tier scope.** The value-amplifier comparison covers budget and standard tiers only. Premium models are excluded by design: they already parse clean structure well, so structured input does not improve their accuracy. The benefit concentrates on cheaper models and fades as capability rises — on standard-tier models the value-amplifier delta runs negative (see the per-run table).

---

## 6 Pillars

| Pillar | Suites | Tests | Pass Rate |
|--------|-------:|------:|----------:|
| cross-cutting | 20 | 69/69 | 100% |
| lossless | 9 | 32/32 | 100% |
| emitter-faithfulness | 5 | 25/25 | 100% |
| streaming | 19 | 60/60 | 100% |
| cognitive-economy | 10 | 53/53 | 100% |
| sapir-whorf | 7 | 369/369 | 100% |
| **Total** | **70** | **608/608** | **100%** |

---

## Deterministic Metrics

Identical across all 10 runs. No variance.

| Metric | Value | Suite |
|:---|:---|:---|
| Error recovery | 99% (JSON: 0%) | Error Recovery |
| Partial failure recovery | 99.7% (JSON: 0%) | Partial Failure Recovery |
| Structural reliability | 98.1% | Structural Reliability |
| Streaming fault boundary | 99.9% | Streaming Fault Boundary |
| Multi-hop resilience | 95% (20 vs 0 records) | Multi-Hop Resilience |
| Hallucination resistance | 0 hallucinated fields | Hallucination Resistance |
| Format fidelity | 100% | Format Fidelity |
| Payload fidelity | 100% (117 escapes avoided, 5 payloads) | Payload Fidelity |
| Hedging preservation | 100% | Hedging Preservation |
| Pipeline delivery | 100% | Pipeline Latency |
| Domain validation | 100% | Domain Validation Streaming |
| Agent handoff fidelity | 100% | Agent Handoff Fidelity |
| Parser conformance | 100% | Parser Conformance |
| Append-only provenance | 100% | Append-Only Provenance |
| LLM error recovery | 100% | LLM Error Recovery |
| Syntax hygiene | 0 escapes (JSON: 15) | Syntax Hygiene |
| Converter resilience | 6 formats | Converter Resilience |
| Format traps | YON: 0/6 corrupted (YAML: 6/6) | Format Traps |
| Token overhead | 5% structural | Token Efficiency |
| IR density ratio | 2.41× | IR Efficiency |
| Multi-model token baseline | 13% | Multi-Model Token Efficiency |
| Context window utilization | 169 records | Context Window Utilization |
| Context window 128K | 3,045 records | Context Window 128K |
| Cost reduction vs prose | 30% at scale | Quality-Adjusted Cost |
| Adoption complexity | 6 tokens | Adoption Complexity |
| RAG context cost | 20 tokens/rule | RAG Context Efficiency |
| Structured output size | 69% (31% smaller) | Structured Output Comparison |
| Prompt compression | 35% token reduction | Prompt Compression |
| Cognitive horizon | 100% (170/170 tests) | Cognitive Horizon |
| Blub perception gap | 0 pp | Blub Perception |
| Borges warning bias index | 40% (119 vectors) | Borges Warning |
| Comprehension (pliability) | 90% | Pliability |

---

## Performance (N=10)

| Metric | Min | Avg | Max |
|:---|---:|---:|---:|
| Runner throughput (ops/s) | 122,835 | 199,960 | 226,398 |
| Comparative throughput (ops/s) | 11,364 | 13,336 | 14,085 |
| Streaming throughput (rec/s) | 694,341 | 819,596 | 917,676 |
| Multi-doc streaming (rec/s) | 1,262,069 | 1,577,887 | 1,779,296 |
| Parse ratio (vs JSON.parse) | 1.55× | 2.06× | 2.41× |
| Time-to-first-record (ms) | 0.069 | 0.100 | 0.152 |
| AI SDK parse latency (ms) | 0.040 | 0.052 | 0.061 |
| Scale curves — 10K records (ms) | 8.436 | 12.907 | 20.551 |
| Scale behavior (YON/JSON ×) | 8.80× | 9.77× | 11.01× |
| Streaming latency (µs/rec) | 7 | 8 | 10 |
| Concurrent parse (ms/doc) | 0.17 | 0.32 | 0.43 |

### Per-Run Detail — Throughput

| Run | Runner ops/s | Comp ops/s | Stream rec/s | Multidoc rec/s |
|:---|---:|---:|---:|---:|
| 1 | 207,598 | 11,905 | 694,341 | 1,262,069 |
| 2 | 212,314 | 13,699 | 757,105 | 1,480,122 |
| 3 | 205,888 | 13,699 | 799,636 | 1,600,999 |
| 4 | 190,223 | 11,364 | 895,333 | 1,776,956 |
| 5 | 217,581 | 13,699 | 790,220 | 1,579,479 |
| 6 | 213,493 | 14,085 | 765,599 | 1,488,893 |
| 7 | 122,835 | 13,699 | 915,080 | 1,596,679 |
| 8 | 198,177 | 12,821 | 917,676 | 1,641,120 |
| 9 | 218,484 | 14,085 | 846,949 | 1,779,296 |
| 10 | 226,398 | 13,699 | 808,021 | 1,574,258 |

### Per-Run Detail — Parse & Latency

| Run | Parse × | TTFR ms | SDK ms | Scale 10K ms | Scale × | Conc ms | Latency µs |
|:---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 2.30 | 0.069 | 0.060 | 8.436 | 9.80 | 0.21 | 8 |
| 2 | 2.15 | 0.108 | 0.046 | 8.826 | 10.03 | 0.43 | 8 |
| 3 | 2.09 | 0.139 | 0.049 | 10.815 | 10.60 | 0.25 | 8 |
| 4 | 2.30 | 0.073 | 0.057 | 15.021 | 8.81 | 0.43 | 8 |
| 5 | 2.22 | 0.152 | 0.042 | 10.061 | 10.41 | 0.25 | 7 |
| 6 | 2.41 | 0.080 | 0.055 | 9.142 | 9.63 | 0.40 | 7 |
| 7 | 1.55 | 0.078 | 0.055 | 17.860 | 8.80 | 0.43 | 8 |
| 8 | 1.58 | 0.072 | 0.061 | 20.551 | 8.97 | 0.24 | 7 |
| 9 | 1.69 | 0.103 | 0.040 | 17.944 | 11.01 | 0.17 | 10 |
| 10 | 2.31 | 0.139 | 0.052 | 10.473 | 9.67 | 0.43 | 8 |

---

## Memory (N=10)

| Metric | Min | Avg | Max |
|:---|---:|---:|---:|
| Memory efficiency factor | 1.56× | 3.81× | 6.11× |
| Memory stability at 100K (MB) | 14.67 | 17.13 | 20.15 |
| Backpressure delta at 100K (MB) | 16.17 | 51.72 | 91.07 |
| Sustained allocation (MB) | 119.90 | 128.81 | 139.92 |

### Per-Run Detail — Memory

| Run | MemEff × | Stability MB | Backpressure MB | Sustained MB |
|:---|---:|---:|---:|---:|
| 1 | 6.11 | 20.15 | 91.07 | 119.94 |
| 2 | 5.71 | 20.12 | 85.49 | 135.94 |
| 3 | 4.67 | 17.44 | 61.63 | 119.98 |
| 4 | 1.57 | 14.74 | 16.23 | 139.92 |
| 5 | 4.67 | 17.41 | 61.59 | 119.90 |
| 6 | 6.11 | 20.12 | 91.02 | 132.84 |
| 7 | 1.56 | 14.71 | 16.23 | 139.22 |
| 8 | 1.56 | 14.70 | 16.20 | 139.23 |
| 9 | 1.56 | 14.67 | 16.17 | 121.11 |
| 10 | 4.67 | 17.40 | 61.61 | 120.03 |

---

## LLM-Dependent Metrics (N=10)

### Value Amplifier

| Run | Budget Tier Uplift | Standard Tier Uplift | Aggregate Delta |
|:---|---:|---:|---:|
| 1 | +20 pp | -12 pp | +1 pp |
| 2 | +16 pp | -12 pp | -1 pp |
| 3 | +31 pp | -14 pp | +4 pp |
| 4 | +32 pp | -11 pp | +6 pp |
| 5 | +8 pp | -12 pp | -4 pp |
| 6 | +30 pp | -14 pp | +4 pp |
| 7 | +40 pp | -11 pp | +10 pp |
| 8 | +16 pp | -11 pp | 0 pp |
| 9 | +18 pp | -14 pp | -1 pp |
| 10 | +6 pp | -14 pp | -6 pp |

Range (10 runs): **+6 to +40 pp** (Budget) · Avg: **+22 pp** (Budget) · Overall Aggregate: **+1 pp**. Always positive at budget tier.

### Notation as Alignment

| Run | Alignment |
|:---|---:|
| 1 | 31% |
| 2 | 47% |
| 3 | 44% |
| 4 | 42% |
| 5 | 36% |
| 6 | 42% |
| 7 | 36% |
| 8 | 40% |
| 9 | 42% |
| 10 | 33% |

Range: **31–47%** · Avg: **39.3%**

### Lacunae Detection (29 concepts per run)

| Run | YON Wins | Parity | Losses |
|:---|---:|---:|---:|
| 1 | 14 | 9 | 6 |
| 2 | 14 | 13 | 2 |
| 3 | 14 | 9 | 6 |
| 4 | 12 | 14 | 3 |
| 5 | 13 | 12 | 4 |
| 6 | 13 | 8 | 8 |
| 7 | 11 | 12 | 6 |
| 8 | 12 | 14 | 3 |
| 9 | 11 | 13 | 5 |
| 10 | 15 | 8 | 6 |

Avg: **12.9 wins · 11.2 parity · 4.9 losses** · Win ratio: **2.6:1**
YON preserves more concepts than it loses in every run (10/10).

---

## Summary

| Claim | Value |
|:---|:---|
| Parse speed | ~2× vs JSON.parse |
| Time-to-first-record | sub-millisecond |
| Error recovery | 99% (JSON: 0%) |
| Runner throughput | ~200K ops/s |
| Streaming throughput | ~820K records/sec |
| Multi-doc streaming | ~1.6M records/sec |
| Scale advantage | ~10× at scale |
| Value amplifier | budget +22pp avg (+6 to +40pp); standard −12pp; aggregate +1pp (premium excluded) |
| Comprehension | 90% (zero training data) |
| Concept preservation | 2.6:1 ratio |
| Total test executions | 6,080 |
| Failures | 0 |

---

## Environment

- **Node:** v22.19.0
- **Platform:** win32
- **LLM Models:** Gemini Flash, Claude Haiku, GPT-4o-mini, GPT-5-nano, Gemini Flash-Lite

---

_Every value traces to a specific run. This report is machine-readable and human-auditable._
