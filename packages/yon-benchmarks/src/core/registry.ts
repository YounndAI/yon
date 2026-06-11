/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { BenchmarkSuite, SuiteCategory } from './types.js';

// Local Suites
import { runStructuralReliability } from '../local/structural-reliability.js';
import { runStreamingProperties } from '../local/streaming-properties.js';
import { runFormatFidelity } from '../local/format-fidelity.js';
import { runHallucinationResistance } from '../local/hallucination-resistance.js';
import { runTokenEfficiency } from '../local/token-efficiency.js';
import { runRunnerThroughput } from '../local/runner-throughput.js';
import { runIREfficiency } from '../local/ir-efficiency.js';
import { runSyntaxHygiene } from '../local/syntax-hygiene.js';
import { runComparativeThroughput } from '../local/comparative-throughput.js';
import { runScaleCurves } from '../local/scale-curves.js';
import { runConcurrencyStress } from '../local/concurrency-stress.js';
import { runConverterResilience } from '../local/converter-resilience.js';
import { runDiagnosticQuality } from '../local/diagnostic-quality.js';
import { runLowLevelHardening } from '../local/low-level-hardening.js';
import { runMigrationFidelity } from '../local/migration-fidelity.js';
import { runSecurityAndEconomy } from '../local/security-and-economy.js';
import { runMultiModelTokenEfficiency } from '../local/multi-model-token-efficiency.js';
import { runErrorRecovery } from '../local/error-recovery.js';
import { runRealWorldCorpus } from '../local/real-world-corpus.js';
import { runParseRatio } from '../local/parse-ratio.js';
// Spec Alignment Suites
import { runStreamingLatency } from '../local/streaming-latency.js';
import { runPayloadFidelity } from '../local/payload-fidelity.js';
import { runScaleBehavior } from '../local/scale-behavior.js';
import { runMultiHopResilience } from '../local/multi-hop-resilience.js';
// Gap-Closing Suites

import { runContextUtilization } from '../local/context-utilization.js';
import { runLineToolInterop } from '../local/line-tool-interop.js';
import { runMemoryEfficiency } from '../local/memory-efficiency.js';
// Coverage Expansion Suites
import { runHedgingPreservation } from '../local/hedging-preservation.js';
import { runPipelineLatency } from '../local/pipeline-latency.js';
import { runRunnerPermissions } from '../local/runner-permissions.js';
import { runTypeSafety } from '../local/type-safety.js';
import { runAppendOnlyProvenance } from '../local/append-only-provenance.js';
import { runAdoptionComplexity } from '../local/adoption-complexity.js';
import { runErrorContainment } from '../local/runner-error-containment.js';
import { runAssertions } from '../local/runner-assertions.js';
import { runRagCompression } from '../local/rag-compression.js';
import { runParserConformance } from '../local/parser-conformance.js';
import { runGeneratorValidity } from '../local/generator-validity.js';
import { runQualityAdjustedCost } from '../local/quality-adjusted-cost.js';
// Benchmarks Remediation Suites (L3/L4/Extended/Runner/Domains/Integrity)
import { runGeneratorL3Cognition } from '../local/generator-l3-cognition.js';
import { runGeneratorL4Agent } from '../local/generator-l4-agent.js';
import { runGeneratorExtended } from '../local/generator-extended.js';
import { runRunnerSessions } from '../local/runner-sessions.js';
import { runRunnerTenets } from '../local/runner-tenets.js';
import { runRunnerPolicyLoader } from '../local/runner-policy-loader.js';
import { runDomainResolution } from '../local/domain-resolution.js';
import { runIntegrityVerification } from '../local/integrity-verification.js';
// Streaming Capability Suites
import { runStreamingThroughput } from '../local/streaming-throughput.js';
import { runStreamingFaultBoundary } from '../local/streaming-fault-boundary.js';
import { runMemoryStability } from '../local/memory-stability.js';
import { runBackpressureSafety } from '../local/backpressure-safety.js';
import { runMultidocStreaming } from '../local/multidoc-streaming.js';
import { runDomainValidationStreaming } from '../local/domain-validation-streaming.js';
import { runAgentHandoffFidelity } from '../local/agent-handoff-fidelity.js';
import { runPartialFailureRecovery } from '../local/partial-failure-recovery.js';
import { runAiSdkStreamingIntegration } from '../local/ai-sdk-streaming-integration.js';
import { runStructuredOutputComparison } from '../local/structured-output-comparison.js';
import { runContextWindow128K } from '../local/context-window-128k.js';

// LLM Suites
import { runPliability } from '../llm/pliability.js';
import { runFormatTraps } from '../llm/format-traps.js';
import { runPromptCompression } from '../llm/prompt-compression.js';
import { runLlmErrorRecovery } from '../llm/llm-error-recovery.js';
import { runMultiHopPipeline } from '../llm/llm-multi-hop-pipeline.js';
import { runRagExtraction } from '../llm/llm-rag-extraction.js';
import { runValueAmplifier } from '../llm/value-amplifier.js';
import { runBorgesWarning } from '../llm/borges-warning.js';
import { runCognitiveHorizon } from '../llm/cognitive-horizon.js';
import { runBlubPerception } from '../llm/blub-perception.js';
import { runNotationAlignment } from '../llm/notation-alignment.js';
import { runLacunaeDetection } from '../llm/lacunae-detection.js';

/**
 * Static registry of all benchmark suites.
 * This is the source of truth for the orchestrator.
 */
export const BENCHMARK_REGISTRY: BenchmarkSuite[] = [
  // --- Local Suites ---
  {
    id: 'structural-reliability',
    name: 'Structural Reliability',
    category: 'local',
    pillar: 'cross-cutting',
    run: runStructuralReliability,
  },
  {
    id: 'streaming-properties',
    name: 'Streaming Properties',
    category: 'local',
    pillar: 'streaming',
    run: runStreamingProperties,
  },
  {
    id: 'format-fidelity',
    name: 'Format Fidelity',
    category: 'local',
    pillar: 'lossless',
    run: runFormatFidelity,
  },
  {
    id: 'hallucination-resistance',
    name: 'Hallucination Resistance',
    category: 'local',
    pillar: 'cross-cutting',
    run: runHallucinationResistance,
  },
  {
    id: 'token-efficiency',
    name: 'Token Efficiency',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runTokenEfficiency,
  },
  // Phase 2 Additions
  {
    id: 'runner-throughput',
    name: 'Runner Throughput',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRunnerThroughput,
  },
  {
    id: 'ir-efficiency',
    name: 'IR Efficiency',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runIREfficiency,
  },
  {
    id: 'syntax-hygiene',
    name: 'Syntax Hygiene',
    category: 'local',
    pillar: 'lossless',
    run: runSyntaxHygiene,
  },
  // Tier 1 Credibility Suites
  {
    id: 'comparative-throughput',
    name: 'Comparative Throughput',
    category: 'local',
    pillar: 'cross-cutting',
    run: runComparativeThroughput,
  },
  {
    id: 'scale-curves',
    name: 'Scale Curves',
    category: 'local',
    pillar: 'streaming',
    run: runScaleCurves,
  },
  // Phase 3 Suites (restored)
  {
    id: 'concurrency-stress',
    name: 'Concurrency & Updates',
    category: 'local',
    pillar: 'streaming',
    run: runConcurrencyStress,
  },
  {
    id: 'converter-resilience',
    name: 'Converter Resilience',
    category: 'local',
    pillar: 'lossless',
    run: runConverterResilience,
  },
  {
    id: 'diagnostic-quality',
    name: 'Diagnostic Quality',
    category: 'local',
    pillar: 'cross-cutting',
    run: runDiagnosticQuality,
  },
  {
    id: 'low-level-hardening',
    name: 'Low-Level Hardening',
    category: 'local',
    pillar: 'streaming',
    run: runLowLevelHardening,
  },
  {
    id: 'migration-fidelity',
    name: 'Migration Fidelity',
    category: 'local',
    pillar: 'cross-cutting',
    run: runMigrationFidelity,
  },
  {
    id: 'security-and-economy',
    name: 'Security',
    category: 'local',
    pillar: 'lossless',
    run: runSecurityAndEconomy,
  },
  // Tier 2 Credibility Suites
  {
    id: 'multi-model-token-efficiency',
    name: 'Multi-Model Token Efficiency',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runMultiModelTokenEfficiency,
  },
  {
    id: 'error-recovery',
    name: 'Error Recovery',
    category: 'local',
    pillar: 'streaming',
    run: runErrorRecovery,
  },
  {
    id: 'real-world-corpus',
    name: 'Real-World Corpus',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRealWorldCorpus,
  },
  // Spec Alignment Suites — Closing the gap between what YON promises and what we test
  {
    id: 'streaming-latency',
    name: 'Streaming Latency',
    category: 'local',
    pillar: 'streaming',
    run: runStreamingLatency,
  },
  {
    id: 'payload-fidelity',
    name: 'Payload Fidelity',
    category: 'local',
    pillar: 'lossless',
    run: runPayloadFidelity,
  },
  {
    id: 'scale-behavior',
    name: 'Scale Behavior',
    category: 'local',
    pillar: 'streaming',
    run: runScaleBehavior,
  },
  {
    id: 'multi-hop-resilience',
    name: 'Multi-Hop Resilience',
    category: 'local',
    pillar: 'streaming',
    run: runMultiHopResilience,
  },
  // Gap-Closing Suites — Investor/Specialist coverage
  {
    id: 'context-utilization',
    name: 'Context Window Utilization',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runContextUtilization,
  },
  {
    id: 'line-tool-interop',
    name: 'Line-Tool Interoperability',
    category: 'local',
    pillar: 'streaming',
    run: runLineToolInterop,
  },
  {
    id: 'memory-efficiency',
    name: 'Memory Efficiency',
    category: 'local',
    pillar: 'streaming',
    run: runMemoryEfficiency,
  },
  {
    id: 'quality-adjusted-cost',
    name: 'Quality-Adjusted Cost',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runQualityAdjustedCost,
  },
  // Benchmarks Remediation — Generator L3/L4/Extended
  {
    id: 'generator-l3-cognition',
    name: 'Generator L3 Cognition',
    category: 'local',
    pillar: 'emitter-faithfulness',
    run: runGeneratorL3Cognition,
  },
  {
    id: 'generator-l4-agent',
    name: 'Generator L4 Agent',
    category: 'local',
    pillar: 'emitter-faithfulness',
    run: runGeneratorL4Agent,
  },
  {
    id: 'generator-extended',
    name: 'Generator Extended Records',
    category: 'local',
    pillar: 'emitter-faithfulness',
    run: runGeneratorExtended,
  },
  // Benchmarks Remediation — Runner Sessions/Tenets/Policy
  {
    id: 'runner-sessions',
    name: 'Runner Sessions',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRunnerSessions,
  },
  {
    id: 'runner-tenets',
    name: 'Runner Tenets',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRunnerTenets,
  },
  {
    id: 'runner-policy-loader',
    name: 'Runner Policy Loader',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRunnerPolicyLoader,
  },
  // Benchmarks Remediation — Domains/Integrity
  {
    id: 'domain-resolution',
    name: 'Domain Resolution',
    category: 'local',
    pillar: 'cross-cutting',
    run: runDomainResolution,
  },
  {
    id: 'integrity-verification',
    name: 'Integrity Verification',
    category: 'local',
    pillar: 'lossless',
    run: runIntegrityVerification,
  },

  // --- LLM Suites ---
  // Tier 3 — LLM Comprehension Suites
  {
    id: 'pliability',
    name: 'Pliability (Format Comprehension)',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runPliability,
  },
  {
    id: 'format-traps',
    name: 'Format Traps',
    category: 'llm',
    pillar: 'lossless',
    run: runFormatTraps,
  },
  {
    id: 'prompt-compression',
    name: 'Prompt Compression',
    category: 'llm',
    pillar: 'cognitive-economy',
    run: runPromptCompression,
  },

  // Coverage Expansion Suites — Spec Promise Gap-Closing
  {
    id: 'hedging-preservation',
    name: 'Hedging Preservation',
    category: 'local',
    pillar: 'emitter-faithfulness',
    run: runHedgingPreservation,
  },
  {
    id: 'pipeline-latency',
    name: 'Pipeline Latency',
    category: 'local',
    pillar: 'streaming',
    run: runPipelineLatency,
  },
  {
    id: 'runner-permissions',
    name: 'Runner Permission Model',
    category: 'local',
    pillar: 'cross-cutting',
    run: runRunnerPermissions,
  },
  {
    id: 'type-safety',
    name: 'Type Safety',
    category: 'local',
    pillar: 'lossless',
    run: runTypeSafety,
  },
  {
    id: 'append-only-provenance',
    name: 'Append-Only Provenance',
    category: 'local',
    pillar: 'lossless',
    run: runAppendOnlyProvenance,
  },
  {
    id: 'adoption-complexity',
    name: 'Adoption Complexity',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runAdoptionComplexity,
  },
  // Governance & RAG Suites
  {
    id: 'runner-error-containment',
    name: 'Runner Error Containment',
    category: 'local',
    pillar: 'cross-cutting',
    run: runErrorContainment,
  },
  {
    id: 'runner-assertions',
    name: 'Runner Assertions & Safety',
    category: 'local',
    pillar: 'cross-cutting',
    run: runAssertions,
  },
  {
    id: 'rag-compression',
    name: 'RAG Context Compression',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runRagCompression,
  },
  // Cross-Package Suites — Unified view of other YON packages
  {
    id: 'parser-conformance',
    name: 'Parser Conformance',
    category: 'local',
    pillar: 'cross-cutting',
    run: runParserConformance,
  },
  {
    id: 'generator-validity',
    name: 'Generator Validity',
    category: 'local',
    pillar: 'emitter-faithfulness',
    run: runGeneratorValidity,
  },
  // --- Streaming Capability Suites ---
  {
    id: 'streaming-throughput',
    name: 'Streaming Throughput',
    category: 'local',
    pillar: 'streaming',
    run: runStreamingThroughput,
  },
  {
    id: 'streaming-fault-boundary',
    name: 'Streaming Fault Boundary',
    category: 'local',
    pillar: 'streaming',
    run: runStreamingFaultBoundary,
  },
  {
    id: 'memory-stability',
    name: 'Memory Stability',
    category: 'local',
    pillar: 'streaming',
    run: runMemoryStability,
  },
  {
    id: 'backpressure-safety',
    name: 'Backpressure Safety',
    category: 'local',
    pillar: 'streaming',
    run: runBackpressureSafety,
  },
  {
    id: 'multidoc-streaming',
    name: 'Multi-Document Streaming',
    category: 'local',
    pillar: 'streaming',
    run: runMultidocStreaming,
  },
  {
    id: 'domain-validation-streaming',
    name: 'Domain Validation Streaming',
    category: 'local',
    pillar: 'streaming',
    run: runDomainValidationStreaming,
  },
  // Parse Ratio Suite — multi-scale YON/JSON.parse comparison
  {
    id: 'parse-ratio',
    name: 'Parse Ratio (YON vs JSON.parse)',
    category: 'local',
    pillar: 'cross-cutting',
    run: runParseRatio,
  },
  // --- Phase 3: New Benchmark Suites ---
  {
    id: 'agent-handoff-fidelity',
    name: 'Agent Handoff Fidelity',
    category: 'local',
    pillar: 'streaming',
    run: runAgentHandoffFidelity,
  },
  {
    id: 'partial-failure-recovery',
    name: 'Partial Failure Recovery',
    category: 'local',
    pillar: 'cross-cutting',
    run: runPartialFailureRecovery,
  },
  {
    id: 'ai-sdk-streaming-integration',
    name: 'AI SDK Streaming Integration',
    category: 'local',
    pillar: 'cross-cutting',
    run: runAiSdkStreamingIntegration,
  },
  {
    id: 'structured-output-comparison',
    name: 'Structured Output Comparison',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runStructuredOutputComparison,
  },
  {
    id: 'context-window-128k',
    name: 'Context Window Efficiency 128K',
    category: 'local',
    pillar: 'cognitive-economy',
    run: runContextWindow128K,
  },
  // Phase 2 — High-Priority LLM Suites (Streaming + Cross-Cutting)
  {
    id: 'llm-error-recovery',
    name: 'LLM Error Recovery',
    category: 'llm',
    pillar: 'streaming',
    run: runLlmErrorRecovery,
  },
  {
    id: 'llm-multi-hop-pipeline',
    name: 'LLM Multi-Hop Pipeline',
    category: 'llm',
    pillar: 'cross-cutting',
    run: runMultiHopPipeline,
  },
  // Phase 3 — Medium-Priority LLM Suites (Cognitive Economy)
  {
    id: 'llm-rag-extraction',
    name: 'LLM RAG Extraction',
    category: 'llm',
    pillar: 'cognitive-economy',
    run: runRagExtraction,
  },
  {
    id: 'value-amplifier',
    name: 'Value Amplifier (Multi-Tier, Multi-Model)',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runValueAmplifier,
  },
  {
    id: 'borges-warning',
    name: 'Borges Warning (Cognitive Bias)',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runBorgesWarning,
  },
  {
    id: 'cognitive-horizon',
    name: 'Cognitive Horizon (Extended Mind)',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runCognitiveHorizon,
  },
  {
    id: 'blub-perception',
    name: 'Blub Perception',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runBlubPerception,
  },
  {
    id: 'notation-alignment',
    name: 'Notation as Alignment',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runNotationAlignment,
  },
  {
    id: 'lacunae-detection',
    name: 'Lacunae Detection',
    category: 'llm',
    pillar: 'sapir-whorf',
    run: runLacunaeDetection,
  },
];

/** Get all registered suites. Uses the static registry. */
export function getAllSuites(): BenchmarkSuite[] {
  return BENCHMARK_REGISTRY;
}

/** Get suites filtered by category. */
export function getSuitesByCategory(category: SuiteCategory): BenchmarkSuite[] {
  return BENCHMARK_REGISTRY.filter((s) => s.category === category);
}

/** Get a single suite by ID. */
export function getSuite(id: string): BenchmarkSuite | undefined {
  return BENCHMARK_REGISTRY.find((s) => s.id === id);
}

export function clearRegistry(): void {
  // Static registry cannot be cleared.
}
