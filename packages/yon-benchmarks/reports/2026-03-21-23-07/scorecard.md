[← Back to Report](./README.md)

# Suite Scorecard

| # | Suite | Pillar | Tests | Key Metric | Verdict |
|--:|-------|--------|------:|------------|---------|
| 1 | [Structural Reliability](./structural-reliability/result.md) | cross-cutting | 4 | 98.1 % (+98%) | Verified |
| 2 | [Hallucination Resistance](./hallucination-resistance/result.md) | cross-cutting | 4 | all passed (zero hallucinated fields) | Verified |
| 3 | [Runner Throughput](./runner-throughput/result.md) | cross-cutting | 3 | <1µs init (217,581 ops/s) | Verified |
| 4 | [Comparative Throughput](./comparative-throughput/result.md) | cross-cutting | 3 | 13,699 ops/s (1.6× faster than YAML) | Verified |
| 5 | [Diagnostic Quality](./diagnostic-quality/result.md) | cross-cutting | 2 | 3 fields (line, column, snippet) | Verified |
| 6 | [Migration Fidelity](./migration-fidelity/result.md) | cross-cutting | 1 | 4 records (lossless JSON→YON→JSON) | Verified |
| 7 | [Real-World Corpus](./real-world-corpus/result.md) | cross-cutting | 4 | all passed (production docs parse clean) | Verified |
| 8 | [Runner Sessions](./runner-sessions/result.md) | cross-cutting | 4 | all passed (session lifecycle correct) | Verified |
| 9 | [Runner Tenets](./runner-tenets/result.md) | cross-cutting | 5 | all passed (5 core tenets enforced) | Verified |
| 10 | [Runner Policy Loader](./runner-policy-loader/result.md) | cross-cutting | 3 | all passed (policy loading verified) | Verified |
| 11 | [Domain Resolution](./domain-resolution/result.md) | cross-cutting | 4 | all passed (domain routing correct) | Verified |
| 12 | [Runner Permission Model](./runner-permissions/result.md) | cross-cutting | 5 | 100 % | Verified |
| 13 | [Runner Error Containment](./runner-error-containment/result.md) | cross-cutting | 4 | all passed (errors contained, no leaks) | Verified |
| 14 | [Runner Assertions & Safety](./runner-assertions/result.md) | cross-cutting | 5 | all passed (5 safety assertions hold) | Verified |
| 15 | [Parser Conformance](./parser-conformance/result.md) | cross-cutting | 3 | 100 % | Verified |
| 16 | [Parse Ratio (YON vs JSON.parse)](./parse-ratio/result.md) | cross-cutting | 4 | 2.22× vs JSON.parse (converges at scale) | Verified |
| 17 | [AI SDK Streaming Integration](./ai-sdk-streaming-integration/result.md) | cross-cutting | 3 | 0.042 ms (parse latency, real-time safe) | Verified |
| 18 | [Format Fidelity](./format-fidelity/result.md) | lossless | 4 | 100 % | Verified |
| 19 | [Syntax Hygiene](./syntax-hygiene/result.md) | lossless | 2 | 0 escapes (0 vs 15) | Verified |
| 20 | [Converter Resilience](./converter-resilience/result.md) | lossless | 4 | 6 formats (all converters pass) | Verified |
| 21 | [Security](./security-and-economy/result.md) | lossless | 1 | 2 records (injection-safe) | Verified |
| 22 | [Payload Fidelity](./payload-fidelity/result.md) | lossless | 6 | 100 % (22 escapes avoided) | Verified |
| 23 | [Integrity Verification](./integrity-verification/result.md) | lossless | 4 | all passed (hash integrity verified) | Verified |
| 24 | [Type Safety](./type-safety/result.md) | lossless | 4 | 3 /3 (YON: explicit :str (3/3) | JSON: implicit (1/1)) | Verified |
| 25 | [Append-Only Provenance](./append-only-provenance/result.md) | lossless | 3 | 100 % | Verified |
| 26 | [Generator L3 Cognition](./generator-l3-cognition/result.md) | emitter-faithfulness | 4 | all passed (L3 cognitive extraction) | Verified |
| 27 | [Generator L4 Agent](./generator-l4-agent/result.md) | emitter-faithfulness | 6 | all passed (L4 agent directives) | Verified |
| 28 | [Generator Extended Records](./generator-extended/result.md) | emitter-faithfulness | 6 | all passed (extended record types) | Verified |
| 29 | [Hedging Preservation](./hedging-preservation/result.md) | emitter-faithfulness | 4 | 100 % | Verified |
| 30 | [Generator Validity](./generator-validity/result.md) | emitter-faithfulness | 5 | all passed (output spec-conformant) | Verified |
| 31 | [Streaming Properties](./streaming-properties/result.md) | streaming | 4 | 0.152 ms TTFR (first record before doc completes) | Verified |
| 32 | [Scale Curves](./scale-curves/result.md) | streaming | 3 | 10.061 ms (10K records linear) | Verified |
| 33 | [Concurrency & Updates](./concurrency-stress/result.md) | streaming | 2 | 0.25 ms/doc (concurrent parse) | Verified |
| 34 | [Low-Level Hardening](./low-level-hardening/result.md) | streaming | 3 | 119.9 MB (sustained, zero leaks) | Verified |
| 35 | [Error Recovery](./error-recovery/result.md) | streaming | 4 | 99 % (99% vs 0%) | Verified |
| 36 | [Streaming Latency](./streaming-latency/result.md) | streaming | 4 | 7 µs per record (1.3× faster) | Verified |
| 37 | [Scale Behavior](./scale-behavior/result.md) | streaming | 4 | 10.41× throughput ratio (YON/JSON at scale) | Verified |
| 38 | [Multi-Hop Resilience](./multi-hop-resilience/result.md) | streaming | 4 | 95 % (20 vs 0 records) | Verified |
| 39 | [Line-Tool Interoperability](./line-tool-interop/result.md) | streaming | 4 | 25 lines (grep/sed/awk compatible, 100% parseable) | Verified |
| 40 | [Memory Efficiency](./memory-efficiency/result.md) | streaming | 2 | 4.67× more efficient (stream vs full-doc) | Verified |
| 41 | [Pipeline Latency](./pipeline-latency/result.md) | streaming | 4 | 100 % | Verified |
| 42 | [Streaming Throughput](./streaming-throughput/result.md) | streaming | 2 | 790,220 records/sec | Verified |
| 43 | [Streaming Fault Boundary](./streaming-fault-boundary/result.md) | streaming | 3 | 99.9 % (faults isolated, stream continues) | Verified |
| 44 | [Memory Stability](./memory-stability/result.md) | streaming | 3 | 17.41 MB growth (100K events, stable) | Verified |
| 45 | [Backpressure Safety](./backpressure-safety/result.md) | streaming | 2 | 61.59 MB delta (100K events, memory-safe) | Verified |
| 46 | [Multi-Document Streaming](./multidoc-streaming/result.md) | streaming | 3 | 1,579,479 records/sec | Verified |
| 47 | [Domain Validation Streaming](./domain-validation-streaming/result.md) | streaming | 3 | 100 % | Verified |
| 48 | [Agent Handoff Fidelity](./agent-handoff-fidelity/result.md) | streaming | 3 | 100 % | Verified |
| 49 | [Token Efficiency](./token-efficiency/result.md) | cross-cutting | 2 | 5 % structural overhead (buys type safety + recovery) | Verified |
| 50 | [IR Efficiency](./ir-efficiency/result.md) | cognitive-economy | 2 | 2.41× information density ratio | Verified |
| 51 | [Multi-Model Token Efficiency](./multi-model-token-efficiency/result.md) | cognitive-economy | 1 | 13 % structural baseline (consistent across models) | Verified |
| 52 | [Context Window Utilization](./context-utilization/result.md) | cognitive-economy | 3 | 169 records (structured packing) | Verified |
| 53 | [Quality-Adjusted Cost](./quality-adjusted-cost/result.md) | cognitive-economy | 3 | 30 % cost reduction vs prose (at scale) | Verified |
| 54 | [Adoption Complexity](./adoption-complexity/result.md) | cognitive-economy | 3 | 6 tokens to learn (same as JSON & YAML) | Verified |
| 55 | [RAG Context Efficiency](./rag-compression/result.md) | cognitive-economy | 3 | 20 tokens/rule (compact context packing) | Verified |
| 56 | [LLM Error Recovery](./llm-error-recovery/result.md) | streaming | 3 | 100 % | Verified |
| 57 | [Pliability (Format Comprehension)](./pliability/result.md) | sapir-whorf | 15 | 92 % comprehension (zero training data) | Verified |
| 58 | [Borges Warning (Cognitive Bias)](./borges-warning/result.md) | sapir-whorf | 119 | 40 % bias index (119 cognitive vectors tested) | Verified |
| 59 | [Cognitive Horizon (Extended Mind)](./cognitive-horizon/result.md) | sapir-whorf | 170 | 100 % (170/170 tests) | Verified |
| 60 | [Blub Perception](./blub-perception/result.md) | sapir-whorf | 16 | 0 pp gap (format parity across depths) | Verified |
| 61 | [Notation as Alignment](./notation-alignment/result.md) | sapir-whorf | 15 | 36 % alignment (structured input shapes output quality) | Verified |
| 62 | [Lacunae Detection](./lacunae-detection/result.md) | sapir-whorf | 29 | 13 YON wins, 12 parity (29 concepts) | Verified |
| 63 | [Partial Failure Recovery](./partial-failure-recovery/result.md) | cross-cutting | 3 | 99.7 % recovered (JSON: 0%) | Clear Advantage |
| 64 | [Structured Output Comparison](./structured-output-comparison/result.md) | cognitive-economy | 3 | 69 % (31% smaller) | Clear Advantage |
| 65 | [Prompt Compression](./prompt-compression/result.md) | cognitive-economy | 21 | 35 % token reduction (same information, fewer tokens) | Clear Advantage |
| 66 | [LLM RAG Extraction](./llm-rag-extraction/result.md) | cognitive-economy | 11 | 100 % (2 domains, cross-dataset) | Strong |
| 67 | [Context Window Efficiency 128K](./context-window-128k/result.md) | cognitive-economy | 3 | 3,045 records in 128K context | Mixed |
| 68 | [LLM Multi-Hop Pipeline](./llm-multi-hop-pipeline/result.md) | cross-cutting | 3 | 100 % fidelity across hops | Mixed |
| 69 | [Format Traps](./format-traps/result.md) | lossless | 4 | YON: 0/6 corrupted (YAML: 6/6 corrupted) | Competitive |
| 70 | [Value Amplifier (Multi-Tier, Multi-Model)](./value-amplifier/result.md) | sapir-whorf | 5 | +23 pp (budget models gain most from structure) | Competitive |

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

---

## Environment

- **Node:** v22.19.0
- **Platform:** win32
- **LLM Access:** Yes

---

[← Back to Report](./README.md)