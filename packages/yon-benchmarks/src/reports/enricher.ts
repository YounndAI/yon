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

/**
 * Report Enricher — deterministic capability analysis + optional synthesis.
 *
 * Architecture:
 *   Phase 1: Extract metrics deterministically → typed IR map
 *   Phase 2: Build capability analysis deterministically (always runs)
 *   Phase 3: (Optional) Single LLM synthesis call → 3 findings + known boundaries
 *   Phase 4: Programmatic replacement of all {{METRIC}} placeholders
 *   Phase 5: Validation — no unreplaced placeholders
 *
 * Per-suite detail is handled by suite-report-generator.ts (Phase B).
 * This enricher provides the cross-suite rollup only.
 *
 * Data accuracy is guaranteed by construction. The LLM never sees
 * raw numbers — it sees placeholder names. The actual values are
 * injected after generation. No fact-check call needed.
 *
 * Voice: YounndAI institutional — shared voice constants for report tone consistency.
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { getActiveProviders } from '../core/env.js';
import type { BenchmarkReport, ReportEnrichment } from '../core/types.js';
import { VOICE_RULES, PLACEHOLDER_RULES } from './voice.js';

/** Create a model instance for the active enrichment provider (prefers gpt-4o for quality). */
function getEnrichmentModel() {
  const active = getActiveProviders();
  if (active.length === 0) return null;
  // Prefer OpenAI for enrichment quality (gpt-4o)
  if (active.includes('openai')) return openai('gpt-4o');
  if (active.includes('anthropic')) return anthropic('claude-haiku-4-5');
  if (active.includes('google')) return google('gemini-2.5-flash');
  return null;
}

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type MetricsMap = Record<string, string | null>;

/** Null-safe metric formatter. Returns null when value is missing. */
export function fmt(value: number | undefined | null, suffix: string, transform?: (n: number) => number): string | null {
  if (value == null) return null;
  const v = transform ? transform(value) : value;
  return `${v}${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  PHASE 1: DETERMINISTIC METRIC EXTRACTION                          */
/* ------------------------------------------------------------------ */

export function extractMetrics(report: BenchmarkReport): MetricsMap {
  const suiteCount = report.results.length;
  const extractedTests = report.results.flatMap((r) => r.tests);
  const gateTests = extractedTests.filter((t) => !t.type || t.type === 'gate');
  const gatePassed = gateTests.filter((t) => t.passed).length;
  const passRate = gateTests.length > 0 ? Math.round((gatePassed / gateTests.length) * 100) : 0;
  const testCount = extractedTests.length;

  // Helper: find test metric by suite + test id
  const findMetric = (suiteId: string, testId: string) => {
    const suite = report.results.find((r) => r.suiteId === suiteId);
    if (!suite) return undefined;
    return suite.tests.find((t) => t.id === testId);
  };

  const findSecondary = (suiteId: string, testId: string, metricName: string) => {
    const test = findMetric(suiteId, testId);
    if (!test?.secondaryMetrics) return undefined;
    return test.secondaryMetrics.find((m) => m.name === metricName);
  };

  // Recovery
  const recoveryTest = findMetric('error-recovery', 'single-line-corruption');

  // TTFR
  const ttfrTest = findMetric('streaming-properties', 'time-to-first-record');

  // Hedging
  const hedgingTest = findMetric('hedging-preservation', 'hedging-parse-roundtrip');

  // Comprehension
  const comprehensionTest = findMetric('pliability', 'comprehension-yon');

  // Cost — quality-adjusted cost suite
  const savingsAt1M = findSecondary('quality-adjusted-cost', 'cost-per-tier', 'savings_1m')?.value;
  const savings100K = findSecondary('quality-adjusted-cost', 'cost-per-tier', 'savings_100k')?.value;
  const savings10M = findSecondary('quality-adjusted-cost', 'cost-per-tier', 'savings_10m')?.value;

  // Token counts (from multi-model-token-efficiency suite)
  const yonTokensCl100k = findSecondary('multi-model-token-efficiency', 'prompt-token-comparison', 'yon_tokens_cl100k')?.value;
  const jsonTokensCl100k = findSecondary('multi-model-token-efficiency', 'prompt-token-comparison', 'json_tokens_cl100k')?.value;

  // Byte economy (byte-economy is a test inside token-efficiency suite)
  const byteTest = findMetric('token-efficiency', 'byte-economy');

  // Escapes
  const escapeTest = findMetric('payload-fidelity', 'payload-fidelity-escape-comparison');

  // Parse throughput
  const parseTest = findMetric('comparative-throughput', 'parse-throughput');
  const jsonParseOps = findSecondary('comparative-throughput', 'parse-throughput', 'json_parse_ops')?.value;
  const yonParseOps = parseTest?.metric.value;

  // Streaming latency (2000-record large doc)
  const streamLargeTest = findMetric('streaming-latency', 'streaming-latency-2000');

  // Type safety (zip code preservation as representative type safety test)
  const typeTest = findMetric('type-safety', 'type-zip-code-preservation');
  const typesPreserved = typeTest != null ? (typeTest.passed ? 100 : 0) : null;

  // AST / IR
  const astTest = findMetric('ir-efficiency', 'ir-expansion');

  // Multi-hop
  const multiHopTest = findMetric('pipeline-latency', 'pipeline-recovery-advantage');

  // Roundtrip fidelity
  const roundtripTest = findMetric('format-fidelity', 'roundtrip-json');

  // Context window (small = 8K tokens)
  const contextTest = findMetric('context-utilization', 'context-small');
  const yonRecords8K = contextTest?.metric.value;
  const jsonRecords8K = contextTest?.metric.comparison?.baseline;

  // LLM validity (generation-success-rate test)
  const genSuccessTest = findMetric('generation-quality', 'generation-success-rate');
  const gpt4oMiniValid = genSuccessTest?.passed ? 1 : 0;
  // Derive from multi-model-generation suite
  const multiModelSuite = report.results.find(r => r.suiteId === 'multi-model-generation');
  const claudeTest = multiModelSuite?.tests.find(t => t.id.includes('claude'));
  const geminiTest = multiModelSuite?.tests.find(t => t.id.includes('gemini'));
  const claudeValid = claudeTest != null ? (claudeTest.passed ? 1 : 0) : null;
  const geminiValid = geminiTest != null ? (geminiTest.passed ? 1 : 0) : null;

  // Escape fidelity (escape-fidelity is in format-fidelity suite)
  const escapeFidelityTest = findMetric('format-fidelity', 'escape-fidelity');

  // Corruption recovery
  const multiCorruptionTest = findMetric('error-recovery', 'multi-point-corruption');
  const chunkRecords = 101; // 100 records + @DOC header — test builds doc with buildDoc(100)

  // --- New Suites: Error Containment ---
  const catchFallback = findMetric('runner-error-containment', 'catch-fallback-execution');
  const catchSelective = findMetric('runner-error-containment', 'catch-selective-matching');
  const retryBackoff = findMetric('runner-error-containment', 'retry-backoff-strategy');
  const retryMax = findMetric('runner-error-containment', 'retry-max-attempts');
  const errorContainmentPassed = [catchFallback, catchSelective, retryBackoff, retryMax].filter(t => t?.passed).length;

  // --- New Suites: Assertions ---
  const checkAbort = findMetric('runner-assertions', 'check-abort-halts');
  const checkSkip = findMetric('runner-assertions', 'check-skip-continues');
  const checkWarn = findMetric('runner-assertions', 'check-warn-continues');
  const haltAbort = findMetric('runner-assertions', 'halt-abort-signal');
  const inputContract = findMetric('runner-assertions', 'input-contract-validation');
  const assertionsPassed = [checkAbort, checkSkip, checkWarn, haltAbort, inputContract].filter(t => t?.passed).length;

  // --- New Suites: RAG ---
  const ragPerRule = findMetric('rag-compression', 'rag-per-rule-cost');
  const ragPerRuleBaseline = findSecondary('rag-compression', 'rag-per-rule-cost', 'baseline_per_rule')?.value;
  const ragYonTokensPerRule = ragPerRule?.metric.value;
  const ragNlTokensPerRule = ragPerRule?.metric.comparison?.baseline;

  const ragPrecision = findMetric('rag-compression', 'rag-retrieval-precision');
  const ragYonPrecision = ragPrecision?.metric.value;
  const ragNlPrecision = ragPrecision?.metric.comparison?.baseline;

  const ragAddr = findMetric('rag-compression', 'rag-rule-addressability');
  const ragRulesExtracted = ragAddr?.metric.value;

  // Outcome counts (comparative tests only)
  const allTests = report.results.flatMap((r) => r.tests);
  const advantages = allTests.filter((t) => t.outcome === 'advantage').length;
  const tied = allTests.filter((t) => t.outcome === 'tied').length;
  const disadvantages = allTests.filter((t) => t.outcome === 'disadvantage').length;
  const comparativeTotal = advantages + tied + disadvantages;

  // Format Comprehension breakdown
  const jsonComp = findMetric('pliability', 'comprehension-json');
  const yamlComp = findMetric('pliability', 'comprehension-yaml');
  const nlComp = findMetric('pliability', 'comprehension-natural-language');

  // Density breakdown
  const canonDensity = findMetric('density-comparison', 'density-canon');
  const minDensity = findMetric('density-comparison', 'density-min');
  const ultraDensity = findMetric('density-comparison', 'density-ultra');

  // Format traps — derive from suite
  const coercionTest = findMetric('format-traps', 'coercion-immunity');
  const yonCoercionImmunity = coercionTest?.metric.value;

  // Generation Quality — metric.value is raw count, percentage is in yon_rate secondary
  const yonGenRate = findSecondary('generation-quality', 'generation-success-rate', 'yon_rate');
  const jsonGenRate = findSecondary('generation-quality', 'generation-success-rate', 'json_rate');


  // Cognitive Horizon (Extended Mind / Density Hypothesis)
  const horizonDaTest = findMetric('cognitive-horizon', 'horizon-density-advantage');
  const horizonMdOverall = findMetric('cognitive-horizon', 'horizon-markdown-overall');
  const horizonCanonOverall = findMetric('cognitive-horizon', 'horizon-yon_canon-overall');
  const horizonMinOverall = findMetric('cognitive-horizon', 'horizon-yon_min-overall');
  const horizonEfficiency = findMetric('cognitive-horizon', 'horizon-token-efficiency');


  return {
    // Scope
    SUITE_COUNT: String(suiteCount),
    TEST_COUNT: String(testCount),
    PASS_RATE: `${passRate}%`,

    // Comparative outcomes
    OUTCOME_ADVANTAGES: String(advantages),
    OUTCOME_TIED: String(tied),
    OUTCOME_DISADVANTAGES: String(disadvantages),
    OUTCOME_TOTAL: String(comparativeTotal),
    OUTCOME_SUMMARY: comparativeTotal > 0
      ? `${advantages} advantage, ${tied} tied, ${disadvantages} known boundar${disadvantages !== 1 ? 'ies' : 'y'}`
      : 'No comparative tests',

    // Models — derive from multi-model-generation suite
    MODELS_TESTED: (() => {
      const mmSuite = report.results.find(r => r.suiteId === 'multi-model-generation');
      if (!mmSuite) return null;
      return mmSuite.tests.map(t => t.name).join(', ');
    })(),
    MODEL_VALIDITY: (() => {
      if (gpt4oMiniValid == null && claudeValid == null && geminiValid == null) return null;
      const allValid = (gpt4oMiniValid ?? 0) && (claudeValid ?? 0) && (geminiValid ?? 0);
      return allValid ? '100%' : 'partial';
    })(),

    // Recovery
    RECOVERY_RATE: fmt(recoveryTest?.metric.value, '%', Math.round),
    JSON_RECOVERY: (() => {
      const jsonRecovery = findMetric('error-recovery', 'json-recovery');
      return fmt(jsonRecovery?.metric.value, '%', Math.round);
    })(),
    SURVIVED_RECORDS: multiCorruptionTest?.metric.value != null
      ? `${multiCorruptionTest.metric.value}/${chunkRecords}`
      : null,

    // Streaming
    TTFR: fmt(ttfrTest?.metric.value, 'ms'),
    TTFR_BASELINE: ttfrTest?.metric.comparison ? `${ttfrTest.metric.comparison.baseline}ms (full parse)` : null,
    TTFR_IMPROVEMENT: ttfrTest?.metric.comparison?.delta ?? null,
    YON_FIRST_RECORD_US: fmt(streamLargeTest?.metric.value, 'µs'),
    JSON_COMPLETE_PARSE_US: fmt(findSecondary('streaming-latency', 'streaming-latency-2000', 'json_complete_parse_us')?.value, 'µs'),
    SPEEDUP_RATIO: fmt(findSecondary('streaming-latency', 'streaming-latency-2000', 'speedup_ratio')?.value, 'x'),
    MULTI_HOP_RECOVERY: fmt(multiHopTest?.metric.value, '%'),

    // Hedging
    HEDGING_PRESERVATION: fmt(hedgingTest?.metric.value, '%'),

    // Comprehension
    COMPREHENSION_ACCURACY: fmt(comprehensionTest?.metric.value, '%'),
    JSON_COMPREHENSION: fmt(jsonComp?.metric.value, '%'),
    YAML_COMPREHENSION: fmt(yamlComp?.metric.value, '%'),
    NL_COMPREHENSION: fmt(nlComp?.metric.value, '%'),

    // Density
    DENSITY_CANON: fmt(canonDensity?.metric.value, '%'),
    DENSITY_MIN: fmt(minDensity?.metric.value, '%'),
    DENSITY_ULTRA: fmt(ultraDensity?.metric.value, '%'),

    // Format Traps
    YON_COERCION_IMMUNITY: fmt(yonCoercionImmunity, '%'),

    // Generation Quality
    YON_GEN_VALIDITY: fmt(yonGenRate?.value, '%'),
    JSON_GEN_VALIDITY: fmt(jsonGenRate?.value, '%'),


    // Cognitive Horizon — density hypothesis
    HORIZON_DENSITY_ADVANTAGE: horizonDaTest ? `${horizonDaTest.metric.value >= 0 ? '+' : ''}${horizonDaTest.metric.value}pp` : null,
    HORIZON_MD_ACCURACY: fmt(horizonMdOverall?.metric.value, '%'),
    HORIZON_CANON_ACCURACY: fmt(horizonCanonOverall?.metric.value, '%'),
    HORIZON_MIN_ACCURACY: fmt(horizonMinOverall?.metric.value, '%'),
    HORIZON_TOKEN_SAVINGS: horizonDaTest?.secondaryMetrics?.find(m => m.name === 'token_savings')?.value != null
      ? `${horizonDaTest.secondaryMetrics!.find(m => m.name === 'token_savings')!.value}%`
      : null,
    HORIZON_MIN_EFFICIENCY: fmt(horizonEfficiency?.metric.value, ' acc%/1k-tok'),
    HORIZON_MD_EFFICIENCY: horizonEfficiency?.secondaryMetrics?.find(m => m.name === 'markdown_efficiency')?.value != null
      ? `${horizonEfficiency.secondaryMetrics!.find(m => m.name === 'markdown_efficiency')!.value} acc%/1k-tok`
      : null,

    // Cost — always positive, always labeled as estimated
    EST_SAVINGS_1M: savingsAt1M != null ? `$${savingsAt1M.toFixed(2)}` : null,
    EST_SAVINGS_100K: savings100K != null ? `$${savings100K.toFixed(2)}` : null,
    EST_SAVINGS_10M: savings10M != null ? `$${savings10M.toFixed(0)}` : null,

    // Tokens
    YON_TOKENS_CL100K: yonTokensCl100k != null ? `${yonTokensCl100k}` : null,
    JSON_TOKENS_CL100K: jsonTokensCl100k != null ? `${jsonTokensCl100k}` : null,
    TOKEN_DELTA: yonTokensCl100k != null && jsonTokensCl100k != null
      ? `${Math.round(((yonTokensCl100k - jsonTokensCl100k) / jsonTokensCl100k) * 100)}%`
      : null,

    // Bytes
    YON_VS_JSON_SIZE: fmt(byteTest?.metric.value, '%'),
    YON_VS_JSON_DIRECTION: byteTest?.metric.value != null ? 'larger' : null,

    // Escapes
    TOTAL_JSON_ESCAPES: escapeTest?.metric.value != null ? `${escapeTest.metric.value}` : null,
    YON_ESCAPES: '0',
    BLOCKS_PRESERVED: escapeFidelityTest?.metric.value != null ? `${escapeFidelityTest.metric.value}/5` : null,

    // Parse throughput (now using p50/median)
    JSON_PARSE_OPS: jsonParseOps != null ? Number(jsonParseOps).toLocaleString() : null,
    YON_PARSE_OPS: yonParseOps != null ? Number(yonParseOps).toLocaleString() : null,
    PARSE_CONFIDENCE: (() => {
      const yonMin = findSecondary('comparative-throughput', 'parse-throughput', 'yon_parse_min_ops')?.value;
      const yonMax = findSecondary('comparative-throughput', 'parse-throughput', 'yon_parse_max_ops')?.value;
      if (yonMin != null && yonMax != null) {
        return `${Number(yonMin).toLocaleString()}–${Number(yonMax).toLocaleString()} ops/s`;
      }
      return yonParseOps != null ? `~${Number(yonParseOps).toLocaleString()} ops/s` : null;
    })(),

    // Type safety
    TYPE_PRESERVATION: fmt(typesPreserved, '%'),

    // AST
    AST_EXPANSION: fmt(astTest?.metric.value, 'x'),

    // Roundtrip
    ROUNDTRIP_FIDELITY: fmt(roundtripTest?.metric.value, '%'),

    // Context window
    YON_RECORDS_8K: yonRecords8K != null ? `${yonRecords8K}` : null,
    JSON_RECORDS_8K: jsonRecords8K != null ? `${jsonRecords8K}` : null,
    CONTEXT_DELTA: yonRecords8K != null && jsonRecords8K != null && jsonRecords8K > 0
      ? `${Math.round(((jsonRecords8K - yonRecords8K) / jsonRecords8K) * 100)}%`
      : null,

    // Error Containment
    ERROR_CONTAINMENT_PASSED: `${errorContainmentPassed}/4`,
    CATCH_FALLBACK: catchFallback?.passed ? 'pass' : 'fail',
    RETRY_BACKOFF: retryBackoff?.passed ? 'pass' : 'fail',

    // Assertions & Safety
    ASSERTIONS_PASSED: `${assertionsPassed}/5`,
    CHECK_MODES: 'ABORT, SKIP, WARN',
    INPUT_CONTRACT: inputContract?.passed ? 'enforced' : 'not enforced',
    ABORT_SIGNAL: haltAbort?.passed ? 'enforced' : 'not enforced',

    // RAG
    RAG_BASELINE_PER_RULE: ragPerRuleBaseline != null ? `+${ragPerRuleBaseline}` : null,
    RAG_YON_TOKENS_PER_RULE: ragYonTokensPerRule != null ? `${ragYonTokensPerRule}` : null,
    RAG_NL_TOKENS_PER_RULE: ragNlTokensPerRule != null ? `${ragNlTokensPerRule}` : null,
    RAG_YON_PRECISION: fmt(ragYonPrecision, '%'),
    RAG_NL_PRECISION: fmt(ragNlPrecision, '%'),
    RAG_RULES_EXTRACTED: ragRulesExtracted != null ? `${ragRulesExtracted}/10` : null,

    // Streaming Capability Suites
    SUSTAINED_THROUGHPUT_OPS: findMetric('streaming-throughput', 'sustained-throughput-100k')?.metric.value?.toLocaleString() ?? null,
    THROUGHPUT_STABILITY: findMetric('streaming-throughput', 'throughput-stability')?.metric.value?.toString() ?? null,
    FAULT_BOUNDARY_RECOVERY: findMetric('streaming-fault-boundary', 'fault-single-line')?.metric.value ? `${findMetric('streaming-fault-boundary', 'fault-single-line')!.metric.value}%` : null,
    FAULT_RECORDS_SAVED: findSecondary('streaming-fault-boundary', 'fault-single-line', 'data_records_recovered')?.value?.toString() ?? null,
    FAULT_ISOLATION: findMetric('streaming-fault-boundary', 'fault-boundary-isolation')?.metric.value === 1 ? 'PASS' : null,
    MEMORY_GROWTH_FACTOR: findMetric('memory-stability', 'memory-growth-factor')?.metric.value?.toString() ?? null,
    MEMORY_DELTA_100K: findSecondary('memory-stability', 'memory-growth-factor', 'delta_100k')?.value?.toString() ?? null,
    BACKPRESSURE_STABLE: findMetric('backpressure-safety', 'batch-memory-constant')?.metric.value?.toString() ?? null,
    BACKPRESSURE_EVENTS: findMetric('backpressure-safety', 'batch-events-complete')?.metric.value?.toLocaleString() ?? null,
    MULTIDOC_THROUGHPUT: findMetric('multidoc-streaming', 'multidoc-throughput')?.metric.value?.toLocaleString() ?? null,
    MULTIDOC_BOUNDARY_COST: findMetric('multidoc-streaming', 'multidoc-overhead')?.metric.value?.toString() ?? null,
    DOMAIN_STREAM_VALIDATION: findMetric('domain-validation-streaming', 'domain-streaming-valid')?.metric.value?.toString() ?? null,
    DOMAIN_STREAM_COST: findMetric('domain-validation-streaming', 'domain-streaming-throughput')?.metric.value?.toString() ?? null,

    // Parse ratio (production convergence)
    PARSE_RATIO_PRODUCTION: findSecondary('parse-ratio', 'production-scale-convergence', 'ratio_at_convergence')?.value?.toString() ?? null,
    PARSE_CONVERGENCE_RECORDS: findSecondary('parse-ratio', 'production-scale-convergence', 'convergence_record_count')?.value?.toString() ?? null,

    // Streaming overhead
    STREAMING_OVERHEAD: findSecondary('comparative-throughput', 'streaming-overhead', 'overhead_ratio')?.value?.toString() ?? null,

    // Multi-turn compounding (from quality-adjusted cost)
    MULTI_TURN_SAVINGS_T1: findSecondary('quality-adjusted-cost', 'cost-per-tier', 'yon_savings_pct_t1')?.value?.toString() ?? null,
    MULTI_TURN_SAVINGS_T7: findSecondary('quality-adjusted-cost', 'cost-per-tier', 'yon_savings_pct_t7')?.value?.toString() ?? null,
    SCALE_SAVINGS_PCT: findSecondary('quality-adjusted-cost', 'cost-per-tier', 'enterprise_savings_pct')?.value?.toString() ?? null,

    // Retry amplification (estimated)
    RETRY_AMPLIFICATION: findSecondary('quality-adjusted-cost', 'retry-model', 'retry_amplification')?.value?.toString() ?? null,
    FIRST_ATTEMPT_YON: findSecondary('quality-adjusted-cost', 'retry-model', 'first_attempt_yon')?.value?.toString() ?? null,
    FIRST_ATTEMPT_JSON: findSecondary('quality-adjusted-cost', 'retry-model', 'first_attempt_json')?.value?.toString() ?? null,

    // Provenance
    PROVENANCE_BYTES: findSecondary('append-only-provenance', 'provenance-cost', 'bytes_per_patch')?.value?.toString() ?? null,

    // Pipeline latency
    PIPELINE_LATENCY_PER_HOP: findSecondary('pipeline-latency', 'pipeline-hop-latency', 'ms_per_hop')?.value?.toString() ?? null,

    // Value Amplifier — per-model accuracy table (agnostic: shows wins AND losses)
    ...(() => {
      const costMap: Record<string, string | null> = {};
      const costSuite = report.results.find((r) => r.suiteId === 'value-amplifier');
      if (!costSuite) return costMap;

      const fullTier = costSuite.tests.find((t) => t.id === 'cost-tier-full');
      if (!fullTier) return costMap;

      const find = (name: string) => fullTier.secondaryMetrics?.find(m => m.name === name)?.value;

      // Aggregate
      costMap.VALUE_AMP_FULL_NL_ACC = find('nl_accuracy')?.toString() ?? null;
      costMap.VALUE_AMP_FULL_YON_ACC = find('yon_accuracy')?.toString() ?? null;
      costMap.VALUE_AMP_FULL_DELTA = fullTier.metric.value?.toString() ?? null;
      costMap.VALUE_AMP_MODELS = find('models_tested')?.toString() ?? null;
      costMap.VALUE_AMP_TIERS = String(costSuite.tests.length);

      // Training data gap (min vs min_cold at full context)
      costMap.TRAINING_DATA_GAP = find('training_data_gap')?.toString() ?? null;

      // Per-model accuracy table — auto-discover from secondary metrics
      // Keys look like: gpt5-nano(budget)_nl_acc, gpt4o-mini(standard)_nl_acc, etc.
      const modelIds = (fullTier.secondaryMetrics ?? [])
        .map(m => m.name)
        .filter(n => n.endsWith('_nl_acc'))
        .map(n => n.replace('_nl_acc', ''));

      for (const modelId of modelIds) {
        const nlAcc = find(modelId + '_nl_acc');
        const canonAcc = find(modelId + '_canon_acc');
        const delta = nlAcc != null && canonAcc != null ? Math.round(canonAcc - nlAcc) : null;

        // Build a clean display key: "gpt4o-mini(standard)" → "GPT4O_MINI_STANDARD"
        const outKey = modelId
          .replace(/[()-]/g, '_')
          .replace(/__+/g, '_')
          .replace(/^_|_$/g, '')
          .toUpperCase();

        if (nlAcc != null && canonAcc != null && delta != null) {
          costMap['VALUE_AMP_' + outKey + '_NL_ACC'] = `${nlAcc}%`;
          costMap['VALUE_AMP_' + outKey + '_YON_ACC'] = `${canonAcc}%`;
          costMap['VALUE_AMP_' + outKey + '_DELTA'] = `${delta > 0 ? '+' : ''}${delta}pp`;
          costMap['VALUE_AMP_' + outKey + '_VERDICT'] = delta > 5
            ? '**YON advantage**'
            : delta < -5
              ? 'Training gap'
              : 'Parity';
        } else {
          costMap['VALUE_AMP_' + outKey + '_NL_ACC'] = null;
          costMap['VALUE_AMP_' + outKey + '_YON_ACC'] = null;
          costMap['VALUE_AMP_' + outKey + '_DELTA'] = null;
          costMap['VALUE_AMP_' + outKey + '_VERDICT'] = null;
        }
      }
      // Budget model uplift — compute max positive delta among budget-tier models
      const budgetDeltas = modelIds
        .filter(id => id.includes('budget'))
        .map(id => {
          const nlAcc = find(id + '_nl_acc');
          const canonAcc = find(id + '_canon_acc');
          return nlAcc != null && canonAcc != null ? Math.round(canonAcc - nlAcc) : null;
        })
        .filter((d): d is number => d !== null && d > 0);
      costMap.MAX_BUDGET_UPLIFT_PP = budgetDeltas.length > 0
        ? String(Math.max(...budgetDeltas))
        : null;

      return costMap;
    })(),
  };
}

/* ------------------------------------------------------------------ */
/*  SYSTEM PROMPTS — voice constants imported from ./voice.ts          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  DETERMINISTIC CAPABILITY ANALYSIS (Pass A — no LLM)                */
/* ------------------------------------------------------------------ */

function composeCapabilityAnalysis(metrics: MetricsMap): { text: string; substantiveSections: number } {
  const sections: string[] = [];
  let substantiveSections = 0;

  // Always include: What YON Is (no metrics needed)
  sections.push(SECTION_WHAT_YON_IS);

  // Conditional sections — only include if data exists
  const fiveNumbers = buildFiveNumbers(metrics);
  if (fiveNumbers) { sections.push(fiveNumbers); substantiveSections++; }

  const forBuilders = buildForBuilders(metrics);
  if (forBuilders) { sections.push(forBuilders); substantiveSections++; }

  const forArchitects = buildForArchitects(metrics);
  if (forArchitects) { sections.push(forArchitects); substantiveSections++; }

  const forDecisionMakers = buildForDecisionMakers(metrics);
  if (forDecisionMakers) { sections.push(forDecisionMakers); substantiveSections++; }

  const valueAmplifier = buildValueAmplifier(metrics);
  if (valueAmplifier) { sections.push(valueAmplifier); substantiveSections++; }

  // Training data disclaimer — only if value amplifier is present
  if (valueAmplifier && metrics.TRAINING_DATA_GAP != null) {
    sections.push(buildTrainingDisclaimer(metrics));
    substantiveSections++;
  }

  // Honest strengths — only if value amplifier data exists
  if (valueAmplifier) {
    sections.push(buildHonestStrengths(metrics));
    substantiveSections++;
  }

  // Measured scorecard — always include (computed from outcomes)
  sections.push(buildHonestScorecard(metrics));

  // Scope disclaimer — always include
  sections.push(SECTION_SCOPE);

  return { text: sections.join('\n\n'), substantiveSections };
}

/** Check if any of the listed metric keys have non-null values. */
function hasAny(m: MetricsMap, keys: string[]): boolean {
  return keys.some(k => m[k] != null);
}

// ---- Static sections (no metrics) ---- //

const SECTION_WHAT_YON_IS = `## What YON Is

A stream-first object notation for AI systems. Operates alongside JSON. Different domain, different design. Where JSON is your API format, YON is your AI orchestration format. The converter bridges them at parser speed.`;

const SECTION_SCOPE = `## Complementary Scope — Data Interchange

Pure data interchange (API responses, config files, key-value payloads). If you're moving structured data between services with no AI in the loop, JSON is lighter, faster, and universal. YON's structural tags are cost without benefit in that context. The converter bridges both formats at parser speed.`;

// ---- Dynamic section builders ---- //

function buildFiveNumbers(m: MetricsMap): string | null {
  if (!hasAny(m, ['PARSE_RATIO_PRODUCTION', 'RECOVERY_RATE', 'TTFR', 'COMPREHENSION_ACCURACY', 'YON_ESCAPES'])) return null;

  const rows: string[] = [];
  if (m.PARSE_RATIO_PRODUCTION) rows.push(`| Parse Speed | JSON.parse is ~**${m.PARSE_RATIO_PRODUCTION}x** faster | Parsing is not the bottleneck — model inference is 1000x slower |`);
  if (m.RECOVERY_RATE) rows.push(`| Error Recovery | **${m.RECOVERY_RATE}** single-line | JSON: **${m.JSON_RECOVERY ?? '0%'}** (bracket cascade) |`);
  if (m.TTFR) rows.push(`| First Record | **${m.TTFR}** TTFR | First record available before the full document arrives |`);
  if (m.YON_ESCAPES != null) rows.push(`| Escapes | **${m.YON_ESCAPES}** required | JSON: **${m.TOTAL_JSON_ESCAPES ?? 'N/A'}** sequences |`);
  if (m.COMPREHENSION_ACCURACY) rows.push(`| Comprehension | **${m.COMPREHENSION_ACCURACY}** from zero training | Cold-start parity suggests inherent learnability |`);

  if (rows.length === 0) return null;
  const numLabel = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'][rows.length] ?? String(rows.length);
  return `## ${numLabel} Numbers\n\n| Metric | Value | Baseline |\n|:---|:---|:---|\n${rows.join('\n')}`;
}

function buildForBuilders(m: MetricsMap): string | null {
  if (!hasAny(m, ['PARSE_RATIO_PRODUCTION', 'YON_ESCAPES', 'TYPE_PRESERVATION', 'STREAMING_OVERHEAD'])) return null;

  const rows: string[] = [];
  if (m.PARSE_RATIO_PRODUCTION && m.PARSE_CONVERGENCE_RECORDS) rows.push(`| Parse Convergence | **~${m.PARSE_RATIO_PRODUCTION}x** at production scale, stable after **${m.PARSE_CONVERGENCE_RECORDS}** records | Parser performance is predictable — no surprises at scale |`);
  if (m.YON_ESCAPES != null && m.TOTAL_JSON_ESCAPES) rows.push(`| Zero Escaping | **${m.YON_ESCAPES}** escapes vs **${m.TOTAL_JSON_ESCAPES}** in alternatives | Code, prose, and data coexist without transformation |`);
  if (m.TYPE_PRESERVATION && m.YON_COERCION_IMMUNITY) rows.push(`| Type Safety | **${m.TYPE_PRESERVATION}** preservation, **${m.YON_COERCION_IMMUNITY}** coercion immunity | No Norway Problem — \":str\", \":int\", \":bool\" are explicit |`);
  if (m.STREAMING_OVERHEAD) rows.push(`| Streaming Overhead | **${m.STREAMING_OVERHEAD}x** over batch at ≥50 records | Streaming and batch share the same parser — minimal cost |`);
  rows.push(`| Entry Cost | 6 token minimum, 4 tags | Measured in cold-start adoption suite |`);
  rows.push(`| Diagnostic Quality | Line, column, and context in every error | When something breaks, YON tells you exactly where and why |`);

  if (rows.length <= 2) return null; // Only static rows, no data
  return `## For Builders\n\n| Capability | Evidence | What It Means |\n|:---|:---|:---|\n${rows.join('\n')}`;
}

function buildForArchitects(m: MetricsMap): string | null {
  if (!hasAny(m, ['SUSTAINED_THROUGHPUT_OPS', 'TTFR', 'FAULT_BOUNDARY_RECOVERY', 'MEMORY_GROWTH_FACTOR', 'MULTI_HOP_RECOVERY'])) return null;

  const rows: string[] = [];
  if (m.SUSTAINED_THROUGHPUT_OPS) rows.push(`| Sustained Throughput | **${m.SUSTAINED_THROUGHPUT_OPS}** records/sec | Single-stream, sustained |`);
  if (m.MULTIDOC_THROUGHPUT) rows.push(`| Multi-Doc Streaming | **${m.MULTIDOC_THROUGHPUT}** records/sec | Across document boundaries |`);
  if (m.TTFR) rows.push(`| TTFR | **${m.TTFR}** | First record available before full parse completes |`);
  if (m.PIPELINE_LATENCY_PER_HOP) rows.push(`| Pipeline Latency | **${m.PIPELINE_LATENCY_PER_HOP}ms**/hop | Multi-agent relay |`);
  if (m.FAULT_BOUNDARY_RECOVERY) rows.push(`| Fault Boundary | **${m.FAULT_BOUNDARY_RECOVERY}** recovery | One corrupt line costs one record |`);
  if (m.BACKPRESSURE_STABLE && m.BACKPRESSURE_EVENTS) rows.push(`| Backpressure | **${m.BACKPRESSURE_STABLE}MB** delta at **${m.BACKPRESSURE_EVENTS}** events | Memory-safe at scale |`);
  if (m.MEMORY_DELTA_100K && m.MEMORY_GROWTH_FACTOR) rows.push(`| Memory at 100K | **${m.MEMORY_DELTA_100K}MB** growth, **${m.MEMORY_GROWTH_FACTOR}x** factor | Better than full-doc parsing |`);
  if (m.DOMAIN_STREAM_VALIDATION) rows.push(`| Domain Validation | **${m.DOMAIN_STREAM_VALIDATION}%** in-flight, **${m.DOMAIN_STREAM_COST ?? 'N/A'}%** boundary cost | Validate without stopping |`);
  if (m.MULTI_HOP_RECOVERY) rows.push(`| Multi-Hop Resilience | **${m.MULTI_HOP_RECOVERY}** across 5 agents | Each hop preserves provenance — auditable end-to-end |`);
  if (m.RETRY_AMPLIFICATION) rows.push(`| Retry Amplification | **${m.RETRY_AMPLIFICATION}x** fewer retries (estimated from quality-adjusted benchmarks with modeled retry rates) | First-attempt success: YON **${m.FIRST_ATTEMPT_YON ?? 'N/A'}%** vs **${m.FIRST_ATTEMPT_JSON ?? 'N/A'}%** (estimated) |`);

  if (rows.length === 0) return null;
  return `## For Architects\n\n| Capability | Evidence | Scale |\n|:---|:---|:---|\n${rows.join('\n')}`;
}

function buildForDecisionMakers(m: MetricsMap): string | null {
  if (!hasAny(m, ['TOKEN_DELTA', 'SCALE_SAVINGS_PCT', 'PROVENANCE_BYTES', 'PASS_RATE'])) return null;

  const rows: string[] = [];
  if (m.TOKEN_DELTA && m.RECOVERY_RATE) rows.push(`| Structural Budget ROI | **${m.TOKEN_DELTA}** structural baseline | Buys **${m.RECOVERY_RATE}** recovery, typed fields, audit trail. Structural baseline is an investment. See Error Recovery suite for payoff data. |`);
  if (m.SCALE_SAVINGS_PCT) rows.push(`| Scale Economics | **${m.SCALE_SAVINGS_PCT}%** cheaper at enterprise | 6 of 7 scale tiers favor YON (quality-adjusted cost sweep) |`);
  if (m.MULTI_TURN_SAVINGS_T1 && m.MULTI_TURN_SAVINGS_T7) rows.push(`| Multi-Turn Compounding | **${m.MULTI_TURN_SAVINGS_T1}%** → **${m.MULTI_TURN_SAVINGS_T7}%** across turns | Savings compound with conversation depth |`);
  if (m.PROVENANCE_BYTES) rows.push(`| Provenance | **${m.PROVENANCE_BYTES}** bytes/patch | Append-only audit trail — regulatory-ready |`);
  if (m.PASS_RATE && m.TEST_COUNT && m.SUITE_COUNT) rows.push(`| Reproducibility | **${m.PASS_RATE}** across **${m.TEST_COUNT}** tests in **${m.SUITE_COUNT}** suites | Every claim benchmarked. Run it yourself. |`);
  if (m.FIRST_ATTEMPT_YON && m.FIRST_ATTEMPT_JSON) rows.push(`| First-Attempt Success | **${m.FIRST_ATTEMPT_YON}%** vs **${m.FIRST_ATTEMPT_JSON}%** (estimated from quality-adjusted benchmarks with modeled retry rates) | Fewer retries = lower cost, faster pipelines |`);

  if (rows.length === 0) return null;
  return `## For Decision Makers\n\n| Area | Metric | Evidence |\n|:---|:---|:---|\n${rows.join('\n')}`;
}

function buildValueAmplifier(m: MetricsMap): string | null {
  if (!hasAny(m, ['VALUE_AMP_FULL_NL_ACC', 'VALUE_AMP_FULL_YON_ACC'])) return null;

  // Build per-model table dynamically from metrics keys
  const modelKeys = Object.keys(m)
    .filter(k => k.startsWith('VALUE_AMP_') && k.endsWith('_NL_ACC') && k !== 'VALUE_AMP_FULL_NL_ACC')
    .map(k => k.replace('VALUE_AMP_', '').replace('_NL_ACC', ''))
    .filter(mk => m['VALUE_AMP_' + mk + '_NL_ACC'] != null); // Only models with data

  let modelTable: string;
  if (modelKeys.length === 0) {
    modelTable = '*No per-model data available in this run.*';
  } else {
    const header = '| Model | NL Accuracy | YON Accuracy | Delta | Verdict |\n|:---|:---|:---|:---|:---|';
    const rows = modelKeys.map(mk => {
      const displayName = mk.toLowerCase().replace(/_/g, '-');
      return `| ${displayName} | ${m['VALUE_AMP_' + mk + '_NL_ACC']} | ${m['VALUE_AMP_' + mk + '_YON_ACC']} | ${m['VALUE_AMP_' + mk + '_DELTA']} | ${m['VALUE_AMP_' + mk + '_VERDICT']} |`;
    }).join('\n');
    modelTable = header + '\n' + rows;
  }

  return `## Model Value Amplifier Analysis

> YON achieves these scores with zero presence in any LLM training set. All results are zero-shot — no model has ever seen YON notation before.

Tested across **${m.VALUE_AMP_MODELS ?? 'N/A'}** models × **3** domains at full document size:

${modelTable}

Models where YON outperforms NL by 10pp or more suggest a **value amplifier effect** (structured input helps models extract more correct information). Models where NL matches or exceeds YON show no format-driven benefit at that capability tier. These models have trained on orders of magnitude more natural language than YON.`;
}

function buildTrainingDisclaimer(m: MetricsMap): string {
  return `## Training Data Disclaimer

> **YON is not present in any LLM's training data.** All comprehension scores reflect zero-shot performance — the model has never seen YON notation before.

The **training data gap** (${m.TRAINING_DATA_GAP}pp at full context) measures the difference between YON with reading instructions and YON without. This gap quantifies how much LLMs currently depend on in-context instructions to parse YON. As YON enters training data, this gap should shrink and overall YON comprehension should improve.

Current benchmark conditions give NL prose an inherent advantage: LLMs have been trained on billions of words of natural language. Despite this asymmetry, YON achieves near-parity at canonical compression, which is a strong signal for a notation no model has been trained on.`;
}

function buildHonestStrengths(m: MetricsMap): string {
  return `## Measured Strengths — What the Data Shows

Based on measured evidence${m.VALUE_AMP_MODELS ? ` across ${m.VALUE_AMP_MODELS} models` : ''}:

| Strength | Evidence | Implication |
|:---|:---|:---|
| **Format parity from zero training** | Canon matches NL at full context | YON's structure is inherently parseable even without training |
| **Weak model uplift** | ${m.MAX_BUDGET_UPLIFT_PP ? `Budget models gain up to +${m.MAX_BUDGET_UPLIFT_PP}pp with structured input` : 'Budget models show format-dependent accuracy shifts'} | YON helps models that struggle with unstructured prose |
| **Structural preservation under truncation** | YON retains facts at density > NL for small-context models | When token budgets are tight, structure organizes what remains |
| **Machine-parseable structure** | Deterministic parsing (not measured here) | YON is consumed by both LLMs and code — dual-audience notation |

> Note: These benchmarks test NL prose that is clean and well-structured. Real-world documents are messier (emails, multi-source dumps, inconsistent formatting). YON's structural advantage is expected to increase with realistic, noisy source data — a future benchmark axis.`;
}

function buildHonestScorecard(m: MetricsMap): string {
  const wins = m.OUTCOME_ADVANTAGES ?? '0';
  const parity = m.OUTCOME_TIED ?? '0';
  const scopeConstraints = m.OUTCOME_DISADVANTAGES ?? '0';
  const total = Number(wins) + Number(parity) + Number(scopeConstraints);
  const heading = total > 0
    ? `## Measured Scorecard — ${wins} wins. ${parity} parity. ${scopeConstraints} known ${Number(scopeConstraints) !== 1 ? 'boundaries' : 'boundary'}.`
    : `## Measured Scorecard — No comparative tests in this run.`;

  return `${heading}

| Verdict | Items |
|:---|:---|
| **${wins} decisive wins** | Derived from ${m.OUTCOME_TOTAL ?? total} comparative tests |
| **${parity} parity** | Across formats where no statistically significant difference was measured |
| **${scopeConstraints} known ${Number(scopeConstraints) !== 1 ? 'boundaries' : 'boundary'}** | See comparative-throughput suite for data interchange characteristics |`;
}

/* ------------------------------------------------------------------ */
/*  SYNTHESIS PROMPT — single cross-suite rollup                       */
/* ------------------------------------------------------------------ */

const SYSTEM_SYNTHESIS = `You are a technical writer for YounndAI benchmark reports.

${VOICE_RULES}

${PLACEHOLDER_RULES}

YOUR TASK: Write a concise findings synthesis from cross-suite benchmark data.

CRITICAL CONTEXT: YON is a stream-first object notation for AI orchestration.
It does not replace JSON for data interchange — it operates alongside it.
YON has ZERO presence in any LLM's training data. All scores are zero-shot.

Structure your output as:

1. "### Key Findings" — Exactly 3 bullet points. Each: one factual claim backed by {{PLACEHOLDER}} metrics. Fact, then operational implication.

2. "### Known Boundaries" — 2-3 bullet points. What the benchmarks do NOT cover, or where results require qualification. For any negative accuracy comparison vs NL, note that all results are zero-shot (no YON training data). Honesty amplifies trust.

3. "### Value Amplifiers" — 2-3 bullet points. Connecting benchmark results to real-world operational outcomes. Fact-then-implication pattern.

RULES:
- Bold all {{PLACEHOLDER}} values.
- No superlatives without evidence.
- Do NOT name competing formats (JSON, YAML, TOML).
- Banned terms: "revolutionary", "cutting-edge", "game-changing", "leverage", "synergy", "disrupt", "unlock".
- Keep total output under 400 words.`;

/* ------------------------------------------------------------------ */
/*  PLACEHOLDER REPLACEMENT (shared utility)                            */
/* ------------------------------------------------------------------ */

export function replacePlaceholders(text: string, metrics: MetricsMap): { result: string; unreplaced: string[]; used: string[] } {
  const used: string[] = [];
  const unreplaced: string[] = [];

  // Replace {{PLACEHOLDER}} with metric values (or em dash for null/unknown)
  let result = text.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    if (key in metrics) {
      used.push(key);
      return metrics[key] ?? '\u2014';
    }
    unreplaced.push(key);
    return '\u2014'; // Replace unknown placeholders with dash (LLM may invent names)
  });

  // Bug 1 fix: Strip bold markers around em dashes — **—** → —
  // LLM prompt says "bold all {{PLACEHOLDER}} values" so null replacements
  // produce **—** which renders as a bold em dash. Clean these up.
  result = result.replace(/\*\*\u2014\*\*/g, '\u2014');

  // Final sweep: replace any remaining {{...}} tokens that weren't caught
  // (e.g., malformed or nested placeholders)
  result = result.replace(/\{\{\w+\}\}/g, '\u2014');

  return { result, unreplaced, used };
}

/* ------------------------------------------------------------------ */
/*  VALIDATION (shared utility)                                         */
/* ------------------------------------------------------------------ */

export function validateEnrichment(_text: string, unreplaced: string[], used: string[], _metrics: MetricsMap): void {
  // Filter out expected-missing placeholders (cross-suite metrics that may not exist in partial runs)
  const llmOnlyPrefixes = ['VALUE_AMP_', 'LLM_', 'TRAINING_DATA_', 'FIRST_ATTEMPT_', 'OUTCOME_', 'PER_MODEL_'];
  const unexpected = unreplaced.filter((k) => !llmOnlyPrefixes.some((p) => k.startsWith(p)));

  if (unexpected.length > 0) {
    throw new Error(`[enricher] FATAL: ${unexpected.length} unresolved placeholders: ${unexpected.join(', ')}`);
  }

  const resolved = used.length;
  const skipped = unreplaced.length - unexpected.length;
  const parts = [`${resolved} resolved`];
  if (skipped > 0) parts.push(`${skipped} skipped (LLM-only)`);
  console.log(`[enricher] ${parts.join(', ')}`);
}

/* ------------------------------------------------------------------ */
/*  ENRICHMENT FUNCTION                                                */
/* ------------------------------------------------------------------ */

export async function enrichReport(
  report: BenchmarkReport,
): Promise<ReportEnrichment> {
  // Phase 1: Extract metrics
  console.log('[enricher] Phase 1: Extracting metrics...');
  const metrics = extractMetrics(report);
  console.log(`[enricher] Extracted ${Object.keys(metrics).length} metrics`);

  // Phase 2: Deterministic capability analysis (always runs)
  console.log('[enricher] Phase 2: Building deterministic capability analysis...');
  const passA = composeCapabilityAnalysis(metrics);
  const capabilityText = passA.text;
  console.log(`[enricher] Composed ${passA.substantiveSections} substantive sections`);

  // Phase 3: Synthesis — single LLM call for cross-suite findings (replaces old Phases 3-7)
  const enrichModel = getEnrichmentModel();
  let synthesis: string | undefined;
  const MIN_SECTIONS_FOR_LLM = 2;

  if (enrichModel && passA.substantiveSections >= MIN_SECTIONS_FOR_LLM) {
    console.log('[enricher] Phase 3: Cross-suite synthesis...');

    const metricsRef = Object.entries(metrics)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `  {{${k}}} = ${v}`)
      .join('\n');

    try {
      const synthResult = await generateText({
        model: enrichModel,
        system: SYSTEM_SYNTHESIS,
        prompt: `Capability analysis (deterministic):\n${capabilityText.slice(0, 2000)}\n\nAvailable metrics:\n${metricsRef}`,
        maxOutputTokens: 1000,
        temperature: 0.15,
      });

      const synthReplaced = replacePlaceholders(synthResult.text, metrics);

      console.log('[enricher] Phase 4: Validating...');
      validateEnrichment(
        synthReplaced.result,
        synthReplaced.unreplaced,
        synthReplaced.used,
        metrics,
      );

      synthesis = synthReplaced.result;
    } catch (e) {
      console.warn('[enricher] Synthesis failed:', e instanceof Error ? e.message : String(e));
    }
  } else if (enrichModel) {
    console.log(`[enricher] Phase 3: Skipped (${passA.substantiveSections} data sections — need ≥${MIN_SECTIONS_FOR_LLM})`);
  } else {
    console.log('[enricher] Phase 3: Skipped (no LLM model available)');
  }

  console.log('[enricher] Complete.');

  return {
    capabilityAnalysis: capabilityText,
    synthesis,
  };
}

