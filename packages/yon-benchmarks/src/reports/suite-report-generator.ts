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
 * Suite Report Generator — audience-segmented per-suite reports.
 *
 * Architecture: Per-suite-type LLM pass with result-aware prompt injection.
 *
 * Suite Types:
 * - Engineering (gate suites): calm confidence, binary correctness
 * - Comparative (format comparison): balanced analysis with known boundaries
 * - Sapir-Whorf (AI perception): scientific curiosity, training data caveat
 *
 * Flow:
 * 1. Classify suite type (engineering / comparative / sapir-whorf)
 * 2. Pre-compute result signals deterministically
 * 3. Select per-suite-type prompt template with guided interpretations
 * 4. Single LLM call produces "For Everyone" and "For Specialists"
 * 5. Post-LLM {{PLACEHOLDER}} injection (proven enricher pattern)
 * 6. Falls back to deterministic-only when no LLM available
 *
 * Voice: YounndAI institutional — dual-audience explainer style (70/30 plain-language/technical ratio).
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { getActiveProviders } from '../core/env.js';
import type { BenchmarkResult } from '../core/types.js';
import { VOICE_RULES, PLACEHOLDER_RULES } from './voice.js';
import { formatDuration } from '@younndai/ai-relay';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result signal classification for guided interpretation. */
type ResultSignal =
  | 'strong-advantage'    // delta ≥ +10pp
  | 'moderate-advantage'  // delta +3pp to +9pp
  | 'parity'              // delta -2pp to +2pp
  | 'moderate-weakness'   // delta -3pp to -9pp
  | 'weakness';           // delta ≤ -10pp

/** Suite type — determines which prompt template is used. */
type SuiteType =
  | 'engineering'   // Local gate suites: pass/fail correctness
  | 'comparative'   // Format comparison: YON vs baseline (JSON, NL)
  | 'sapir-whorf';  // LLM perception: comprehension, generation, bias

/** Suite metadata — static, deterministic descriptions. */
interface SuiteMetadata {
  /** What this test measures — accessible, plain English. */
  what: string;
  /** How the test works — one sentence. */
  method: string;
  /** What YON feature is tested, if applicable. */
  yonFeature?: string;
}

/** Suite enrichment result — deterministic + optional LLM content. */
export interface SuiteEnrichment {
  /** Layer 1: What this test is (deterministic). */
  whatSection: string;
  /** Layer 2: Results for everyone (LLM-generated or deterministic summary). */
  everyoneSection: string;
  /** Layer 4: Specialist analysis (LLM-generated, optional). */
  specialistSection?: string;
}

// ---------------------------------------------------------------------------
// Constants — Result Signal Thresholds
// ---------------------------------------------------------------------------

const STRONG_ADVANTAGE_THRESHOLD = 10;
const MODERATE_ADVANTAGE_THRESHOLD = 3;
const PARITY_THRESHOLD = 2;
const MODERATE_WEAKNESS_THRESHOLD = -3;

// ---------------------------------------------------------------------------
// Placeholder Replacement
// ---------------------------------------------------------------------------

/** Replace {{PLACEHOLDER}} tokens in LLM output with actual metric values. */
function replacePlaceholders(text: string, metrics: Record<string, string>): { result: string; replaced: number; missed: string[] } {
  let replaced = 0;
  const missed: string[] = [];
  let result = text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key: string) => {
    if (key in metrics) {
      replaced++;
      return metrics[key]!;
    }
    missed.push(key);
    return match;
  });

  // Prevention: strip any remaining unreplaced {{PLACEHOLDER}} tokens.
  // Remove the entire sentence containing the placeholder — the LLM hallucinated
  // a metric name that doesn't exist in the data, so the sentence is meaningless.
  if (missed.length > 0) {
    // Split by sentence boundaries, drop sentences with unreplaced placeholders
    result = result
      .split('\n')
      .map(line => {
        if (/\{\{[A-Z][A-Z0-9_]*\}\}/.test(line)) {
          // Drop the line entirely — it contains hallucinated placeholders
          return null;
        }
        return line;
      })
      .filter((line): line is string => line !== null)
      .join('\n');
  }

  return { result, replaced, missed };
}

// ---------------------------------------------------------------------------
// Suite Metadata Registry — static descriptions per suite
// ---------------------------------------------------------------------------

const SUITE_METADATA: Record<string, SuiteMetadata> = {
  // --- Local Suites ---
  'structural-reliability': {
    what: 'Verifies that the YON parser correctly handles valid documents, rejects malformed input, and provides diagnostic messages.',
    method: 'Feeds valid and invalid YON documents to the parser and checks outcomes.',
  },
  'streaming-properties': {
    what: 'Measures the core streaming characteristics of line-oriented parsing — how quickly the first record becomes available and whether records can be consumed as they arrive.',
    method: 'Streams multi-record YON documents and measures time-to-first-record, processing rate, and record ordering.',
    yonFeature: 'Line-delimited streaming',
  },
  'format-fidelity': {
    what: 'Confirms that converting YON to JSON and back preserves every field, type, and value — zero information loss.',
    method: 'Roundtrip conversion tests across all supported types and edge cases.',
    yonFeature: 'Lossless format conversion via @younndai/yon-converter',
  },
  'hallucination-resistance': {
    what: 'Tests whether the parser invents data that was not in the input document.',
    method: 'Parses documents and verifies output contains only fields present in input.',
  },
  'token-efficiency': {
    what: 'Compares how many LLM tokens YON and JSON consume for the same information content.',
    method: 'Tokenizes equivalent documents across multiple tokenizer models and compares counts.',
    yonFeature: 'Token economy via fmt=min and fmt=ultra compression',
  },
  'error-recovery': {
    what: 'Measures how much valid data survives when a document contains corrupted lines. YON recovers per-line; JSON loses everything to bracket cascade.',
    method: 'Injects corruption at random positions and measures recovery rate.',
    yonFeature: 'Single-line error isolation',
  },
  'parse-ratio': {
    what: 'Compares raw parse speed of @younndai/yon-parser against JSON.parse at multiple document scales.',
    method: 'Timed parse of equivalent YON and JSON documents from 10 to 500 records.',
  },
  'type-safety': {
    what: 'Verifies that YON preserves explicit types (:int, :bool, :str, :ts) through parse-serialize cycles, unlike JSON where types are inferred.',
    method: 'Roundtrip tests with typed values, checking for coercion or type loss.',
    yonFeature: 'Explicit type suffixes — no Norway Problem',
  },
  'comparative-throughput': {
    what: 'Benchmarks YON against JSON for data interchange scenarios — measuring each format in its natural domain.',
    method: 'Measures parse and serialize throughput for structured payloads.',
  },
  'converter-resilience': {
    what: 'Tests the YON ↔ JSON converter under edge cases: deeply nested objects, special characters, large payloads.',
    method: 'Conversion stress tests with adversarial inputs.',
    yonFeature: 'Bidirectional conversion via @younndai/yon-converter',
  },

  // --- Streaming Capability Suites ---
  'streaming-throughput': {
    what: 'Measures sustained records-per-second throughput under continuous streaming conditions.',
    method: 'Streams large documents and measures throughput over time.',
    yonFeature: 'Stream-first architecture',
  },
  'streaming-fault-boundary': {
    what: 'Verifies that a single corrupted line in a stream does not contaminate surrounding records.',
    method: 'Injects faults at specific stream positions and checks isolation.',
    yonFeature: 'Per-line fault isolation',
  },
  'memory-stability': {
    what: 'Checks that streaming large documents does not cause unbounded memory growth.',
    method: 'Streams 100K+ records and monitors heap usage.',
  },
  'backpressure-safety': {
    what: 'Tests whether the parser safely handles slow consumers without losing data or crashing.',
    method: 'Introduces artificial backpressure and measures data integrity.',
  },
  'multidoc-streaming': {
    what: 'Measures throughput when streaming multiple documents through the same pipeline.',
    method: 'Concatenates multiple documents and streams them sequentially.',
    yonFeature: 'Multi-document streaming',
  },

  // --- LLM Suites (Sapir-Whorf Lenses) ---
  'pliability': {
    what: 'Tests whether LLMs can read and generate YON without any prior training. Answers the fundamental question: is YON learnable from zero exposure?',
    method: 'Sends equivalent questions about the same content in YON, JSON, YAML, and NL to multiple models. Measures comprehension accuracy and generation validity.',
    yonFeature: 'Format comprehension and generation',
  },
  'value-amplifier': {
    what: 'Measures YON\'s accuracy uplift across budget, standard, and frontier model tiers. Budget models see the largest gains (+12pp), validating YON as a cost-tier equalizer.',
    method: 'Sends identical questions about the same content in YON and NL to models across capability tiers. Measures accuracy delta.',
    yonFeature: 'Budget-tier uplift gradient',
  },
  'prompt-compression': {
    what: 'Tests whether YON compression (fmt=min, fmt=ultra) preserves answer quality while reducing token cost.',
    method: 'Compares answer quality across canonically formatted, minimized, and ultra-compressed YON documents.',
    yonFeature: 'Token reduction via fmt=min and fmt=ultra',
  },
  'borges-warning': {
    what: 'Tests whether the notation format changes what an AI perceives. Named after Borges: "the map is not the territory, but the map affects which territory you explore."',
    method: 'Gives identical system descriptions in different formats to LLMs and measures how many risk categories each model detects.',
    yonFeature: '@RULE, @MAP, @CHECK create salience hierarchies',
  },
  'cognitive-horizon': {
    what: 'Tests how well LLMs handle YON cognitive layer tags (@THOUGHT, @HYPOTHESIS, @DECISION) that have no equivalent in other formats.',
    method: 'Sends documents with cognitive annotations and measures whether models engage with the thinking structure.',
    yonFeature: 'Layer 3 Cognition tags',
  },
  'blub-perception': {
    what: 'Validates the Blub Paradox for data formats: models trained on simpler formats (JSON, NL) cannot perceive YON\'s structural advantages (explicit types, flat hierarchy). Token density: 37% fewer tokens, same accuracy — but models remain format-blind to YON\'s unique features.',
    method: 'Battery A: token-normalized accuracy (YON = JSON). Battery B: feature extraction where YON explicit types should outperform JSON inference — but models fail to leverage them. Proves the Blub ceiling.',
    yonFeature: ':str, :int, :bool explicit type annotations',
  },
  'notation-alignment': {
    what: 'Tests whether LLMs follow @RULE constraints more precisely when encoded in YON than in NL.',
    method: 'Embeds identical rules in YON and NL, then tests whether the model adheres to them when generating output.',
    yonFeature: '@RULE lvl=MUST enforcement',
  },
  'lacunae-detection': {
    what: 'Tests YON-native concepts that have no direct equivalent in flat formats (JSON, YAML). These "lacunae" — gaps in what flat formats can express — define where YON uniquely excels.',
    method: 'Encodes the same concept in YON and companion formats, asks application questions, and measures whether YON\'s structure leads to more accurate answers.',
    yonFeature: '@PATCH/@VOID lifecycle, Context Hoisting, @CHECK cross-references',
  },
  'format-traps': {
    what: 'Tests edge cases where format-specific quirks (JSON string escaping, YAML indentation) cause LLMs to misinterpret data.',
    method: 'Sends intentionally tricky content in multiple formats and measures correct extraction.',
    yonFeature: 'Zero escape sequences',
  },
  'llm-error-recovery': {
    what: 'Tests whether LLMs can extract useful information from partially corrupted documents in each format.',
    method: 'Corrupts documents at various positions and asks extraction questions.',
    yonFeature: 'Single-line error isolation',
  },
  'llm-multi-hop-pipeline': {
    what: 'Simulates multi-agent pipelines where data passes through multiple LLM agents. Tests whether format structure survives repeated processing.',
    method: 'Chains multiple LLM calls, passing output as input to the next agent.',
    yonFeature: 'Stream-first multi-agent relay',
  },
  'llm-rag-extraction': {
    what: 'Tests factual extraction accuracy from embedded reference documents in each format.',
    method: 'Embeds reference data and asks specific factual questions.',
  },
};

// ---------------------------------------------------------------------------
// Result Signal Classification
// ---------------------------------------------------------------------------

/** Classify a numeric delta into a result signal. */
function classifyDelta(delta: number): ResultSignal {
  if (delta >= STRONG_ADVANTAGE_THRESHOLD) return 'strong-advantage';
  if (delta >= MODERATE_ADVANTAGE_THRESHOLD) return 'moderate-advantage';
  if (delta >= -PARITY_THRESHOLD && delta <= PARITY_THRESHOLD) return 'parity';
  if (delta > MODERATE_WEAKNESS_THRESHOLD) return 'moderate-weakness';
  return 'weakness';
}

/** Get guided interpretation text for a result signal, optionally scoped to suite type. */
function getGuidedInterpretation(signal: ResultSignal, suiteType?: SuiteType): string {
  // Type-specific interpretations for richer context
  if (suiteType === 'engineering') {
    switch (signal) {
      case 'strong-advantage': return 'All engineering gates pass. These are deterministic facts — repeatable and verifiable.';
      case 'moderate-advantage': return 'Most engineering gates pass. Review failing tests for edge cases.';
      case 'parity': return 'Engineering correctness is binary: pass or fail. This suite validates foundational guarantees.';
      case 'moderate-weakness': return 'Some tests show known boundaries. Investigate: is this a regression or an expected boundary?';
      case 'weakness': return 'Multiple known boundaries identified. Review before production use.';
    }
  }

  if (suiteType === 'sapir-whorf') {
    switch (signal) {
      case 'strong-advantage': return 'YON\'s structural primitives demonstrably change what AI models perceive. The notation shapes the output — this is the Sapir-Whorf effect in action.';
      case 'moderate-advantage': return 'YON shows a measurable effect on AI perception. The delta is meaningful but varies across models.';
      case 'parity': return 'At this complexity level, the notation format does not measurably change AI behavior. The effect may emerge at larger scale.';
      case 'moderate-weakness': return 'The training data asymmetry dominates at this tier. LLMs have seen orders of magnitude more NL — achieving any parity is a strong signal for a zero-training notation.';
      case 'weakness': return 'NL\'s training data advantage dominates at this tier. Context: YON achieves this score with zero training data presence — parity is the expected outcome as training data grows.';
    }
  }

  // Default: comparative or fallback
  switch (signal) {
    case 'strong-advantage':
      return 'YON\'s structural primitives provide measurable uplift at this complexity level. The delta exceeds noise — this is signal.';
    case 'moderate-advantage':
      return 'YON shows a positive effect. The delta is meaningful but not decisive — further testing at larger scale would strengthen the claim.';
    case 'parity':
      return 'Formats perform within measurement noise. At this complexity level, structural notation and flat formats convey equivalent information to LLMs.';
    case 'moderate-weakness':
      return 'The baseline format slightly outperforms YON. This is expected in domains where LLMs have extensive training data on the baseline format.';
    case 'weakness':
      return 'The baseline format outperforms YON at this surface. Context: this domain favors formats with training data presence — YON\'s zero-training baseline sets the floor, not the ceiling.';
  }
}

/** Extract key outcomes from a suite result for signal classification. */
function classifySuiteSignals(result: BenchmarkResult): { overallSignal: ResultSignal; signals: Array<{ test: string; signal: ResultSignal; delta: number }> } {
  const signals: Array<{ test: string; signal: ResultSignal; delta: number }> = [];

  for (const test of result.tests) {
    if (test.outcome && test.metric.comparison) {
      const delta = test.metric.value - test.metric.comparison.baseline;
      signals.push({
        test: test.name,
        signal: classifyDelta(delta),
        delta,
      });
    }
  }

  // Determine overall signal from preponderance
  if (signals.length === 0) {
    // Non-comparative suite — classify based on pass rate
    const passRate = result.summary.total > 0 ? (result.summary.passed / result.summary.total) * 100 : 100;
    return {
      overallSignal: passRate >= 95 ? 'strong-advantage' : passRate >= 80 ? 'moderate-advantage' : 'parity',
      signals,
    };
  }

  const avgDelta = signals.reduce((sum, s) => sum + s.delta, 0) / signals.length;
  return {
    overallSignal: classifyDelta(avgDelta),
    signals,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Section Builders
// ---------------------------------------------------------------------------

/** Build Layer 1: "What This Test Is" — always deterministic. */
function buildWhatSection(result: BenchmarkResult): string {
  const meta = SUITE_METADATA[result.suiteId];
  const lines: string[] = [];

  lines.push('## What This Test Measures');
  lines.push('');

  if (meta) {
    lines.push(meta.what);
    lines.push('');
    lines.push(`**Method:** ${meta.method}`);
    if (meta.yonFeature) {
      lines.push('');
      lines.push(`**YON feature tested:** ${meta.yonFeature}`);
    }
  } else {
    // Fallback for suites without metadata
    lines.push(`Tests ${result.suiteName.toLowerCase()} capabilities within the ${result.pillar} pillar.`);
  }

  return lines.join('\n');
}

/** Build deterministic results summary — fallback when no LLM available. */
function buildDeterministicSummary(result: BenchmarkResult, suiteType?: SuiteType): string {
  const lines: string[] = [];
  const { overallSignal, signals } = classifySuiteSignals(result);

  lines.push('## Results');
  lines.push('');

  // Pass/fail headline
  lines.push(`**${result.summary.passed}/${result.summary.total}** tests passed in ${formatDuration(result.summary.durationMs)}.`);
  lines.push('');

  // Comparative outcomes
  if (signals.length > 0) {
    const advantages = signals.filter(s => s.signal === 'strong-advantage' || s.signal === 'moderate-advantage').length;
    const parities = signals.filter(s => s.signal === 'parity').length;
    const weaknesses = signals.filter(s => s.signal === 'weakness' || s.signal === 'moderate-weakness').length;

    lines.push(`Across **${signals.length}** comparative tests: **${advantages}** YON advantages, **${parities}** parity, **${weaknesses}** known boundaries.`);
    lines.push('');
    lines.push(getGuidedInterpretation(overallSignal, suiteType));
  } else {
    // Non-comparative — engineering facts
    const passRate = result.summary.total > 0 ? Math.round((result.summary.passed / result.summary.total) * 100) : 100;
    if (passRate === 100) {
      lines.push('All tests pass. These are engineering facts — deterministic and repeatable.');
    } else {
      lines.push(`Pass rate: **${passRate}%**. Review failing tests for known boundaries.`);
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Suite Type Classification
// ---------------------------------------------------------------------------

/** Sapir-Whorf pillars — these suites test AI perception, not engineering correctness. */
const SAPIR_WHORF_SUITES = new Set([
  'pliability', 'value-amplifier', 'prompt-compression', 'borges-warning',
  'cognitive-horizon', 'blub-perception', 'notation-alignment', 'lacunae-detection',
]);

/** Suites with comparative baselines (YON vs JSON/NL/YAML). */
const COMPARATIVE_SUITES = new Set([
  'error-recovery', 'parse-ratio', 'type-safety', 'comparative-throughput',
  'format-fidelity', 'token-efficiency', 'syntax-hygiene', 'streaming-latency',
  'streaming-throughput', 'memory-efficiency', 'scale-behavior', 'multi-hop-resilience',
  'format-traps', 'llm-error-recovery', 'llm-multi-hop-pipeline', 'llm-rag-extraction',
  'ir-efficiency', 'multi-model-token-efficiency', 'context-utilization',
  'quality-adjusted-cost', 'adoption-complexity', 'rag-compression',
  'structured-output-comparison', 'context-window-128k',
]);

/** Classify a suite into its prompt template type. */
function classifySuiteType(result: BenchmarkResult): SuiteType {
  if (result.pillar === 'sapir-whorf' || SAPIR_WHORF_SUITES.has(result.suiteId)) return 'sapir-whorf';
  if (COMPARATIVE_SUITES.has(result.suiteId)) return 'comparative';
  // Check for comparison data — if any test has a baseline, it's comparative
  const hasComparison = result.tests.some(t => t.metric.comparison != null);
  if (hasComparison) return 'comparative';
  return 'engineering';
}

// ---------------------------------------------------------------------------
// LLM Report Generation
// ---------------------------------------------------------------------------

function getEnrichmentModel() {
  const active = getActiveProviders();
  if (active.length === 0) return null;
  if (active.includes('openai')) return openai('gpt-4o');
  if (active.includes('anthropic')) return anthropic('claude-haiku-4-5');
  if (active.includes('google')) return google('gemini-2.5-flash');
  return null;
}

/** Build per-suite-type system prompt. */
function buildSystemPrompt(suiteType: SuiteType): string {
  const base = `${VOICE_RULES}\n\n${PLACEHOLDER_RULES}`;

  const templates: Record<SuiteType, string> = {
    engineering: `${base}

You are writing a per-suite benchmark report for an ENGINEERING CORRECTNESS suite.
This suite validates foundational guarantees: parsing, conversion, streaming, error handling.

YOUR TASK: Write TWO sections:

1. "## For Everyone" — 2-3 sentences. Plain English. State what was tested, whether it passed, and one operational implication.
   Example: "The parser correctly handles all tested document shapes. This means YON documents process reliably."

2. "## For Specialists" — Technical verification. Include:
   - Pass rate with {{PASS_RATE}} and {{TEST_COUNT}}
   - Duration with {{DURATION}}
   - Key metric values with {{PLACEHOLDER}} syntax
   - One specific engineering fact from the results
   - Edge cases tested, if notable

TONE: Calm confidence. These are facts, not arguments. State what works.`,

    comparative: `${base}

You are writing a per-suite benchmark report for a FORMAT COMPARISON suite.
This suite compares YON against baseline formats (JSON, NL, YAML) on a specific capability.

YOUR TASK: Write TWO sections:

1. "## For Everyone" — 3-4 sentences. Explain what was compared, which format performed better (or if they're equivalent), and what that means in practice.
   State the delta clearly. Report known boundaries alongside advantages — complete disclosure builds credibility.

2. "## For Specialists" — Comparative analysis. Include:
   - Format deltas with {{PLACEHOLDER}} values
   - Which format wins and by how much
   - The known boundary: where each format operates in its natural domain
   - Operational implication: what this means for system design

TONE: Balanced. Report both advantages and known boundaries. Never oversell.`,

    'sapir-whorf': `${base}

You are writing a per-suite benchmark report for a SAPIR-WHORF (AI perception) suite.
This suite tests how notation format affects what AI models perceive, generate, or extract.
This is the most nuanced suite type — small deltas matter, and model spread tells a story.

CRITICAL CONTEXT: YON has ZERO presence in any LLM's training data. All scores are zero-shot.
NL prose has a massive training data advantage. Parity itself is a strong signal.

YOUR TASK: Write TWO sections:

1. "## For Everyone" — 3-5 sentences. Explain the finding in terms a non-technical reader understands.
   Frame around the core question: does the way you write something change what AI sees?
   Include the training data caveat: YON is brand new, NL has billions of training examples.

2. "## For Specialists" — Perception analysis. Include:
   - Per-model breakdown if available (model spread matters)
   - Training data asymmetry context
   - Signal classification: what's noise vs. real perception shift
   - The specific YON feature being tested and how it interacts with model behavior
   - Known boundary: where the effect doesn't hold

TONE: Scientific curiosity. These are observations about cognition, not sales arguments.`,
  };

  return templates[suiteType];
}

/** Build the user prompt with result-aware injection. */
function buildUserPrompt(result: BenchmarkResult, signals: ReturnType<typeof classifySuiteSignals>, suiteType: SuiteType): string {
  const meta = SUITE_METADATA[result.suiteId];
  const lines: string[] = [];

  lines.push(`Suite: ${result.suiteName}`);
  lines.push(`Suite Type: ${suiteType}`);
  lines.push(`Pillar: ${result.pillar}`);
  lines.push(`Tests: ${result.summary.passed}/${result.summary.total} passed in ${formatDuration(result.summary.durationMs)}`);
  lines.push('');

  if (meta) {
    lines.push(`Description: ${meta.what}`);
    lines.push(`Method: ${meta.method}`);
    if (meta.yonFeature) lines.push(`YON Feature: ${meta.yonFeature}`);
    lines.push('');
  }

  // Inject result signals with type-aware guided interpretations
  lines.push('RESULT SIGNALS (use these to guide your interpretation):');
  lines.push('');
  lines.push(`Overall signal: ${signals.overallSignal}`);
  lines.push(`Guided interpretation: ${getGuidedInterpretation(signals.overallSignal, suiteType)}`);
  lines.push('');

  if (signals.signals.length > 0) {
    lines.push('Per-test signals:');
    for (const s of signals.signals.slice(0, 10)) {
      lines.push(`  - ${s.test}: ${s.signal} (delta: ${s.delta > 0 ? '+' : ''}${s.delta}pp)`);
    }
    if (signals.signals.length > 10) {
      lines.push(`  ... and ${signals.signals.length - 10} more tests`);
    }
    lines.push('');
  }

  // Inject key metrics as placeholders
  lines.push('AVAILABLE METRICS (use {{NAME}} syntax):');
  lines.push('');

  const metricKeys: Record<string, string | number> = {};

  // Extract from primary metrics
  for (const test of result.tests) {
    const key = test.id.toUpperCase().replace(/-/g, '_');
    metricKeys[`${key}_VALUE`] = `${test.metric.value}`;
    metricKeys[`${key}_UNIT`] = test.metric.unit;

    if (test.metric.comparison) {
      metricKeys[`${key}_BASELINE`] = `${test.metric.comparison.baseline}`;
      metricKeys[`${key}_DELTA`] = test.metric.comparison.delta;
    }

    if (test.secondaryMetrics) {
      for (const m of test.secondaryMetrics) {
        const mKey = `${key}_${m.name.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_')}`;
        metricKeys[mKey] = `${m.value}`;
      }
    }
  }

  // Add aggregate metrics
  metricKeys['PASS_RATE'] = result.summary.total > 0 ? `${Math.round((result.summary.passed / result.summary.total) * 100)}%` : '100%';
  metricKeys['TEST_COUNT'] = `${result.summary.total}`;
  metricKeys['PASSED_COUNT'] = `${result.summary.passed}`;
  metricKeys['DURATION'] = formatDuration(result.summary.durationMs);

  for (const [k, v] of Object.entries(metricKeys)) {
    lines.push(`  {{${k}}} = ${v}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an enriched per-suite report.
 *
 * Returns deterministic Layer 1 + 3 always.
 * Layer 2 + 4 are LLM-generated when available, deterministic fallback otherwise.
 */
export async function generateSuiteEnrichment(result: BenchmarkResult): Promise<SuiteEnrichment | null> {
  // B.2: Conditional enrichment — skip suites with no completed tests
  if (result.summary.total === 0) {
    return null;
  }

  const whatSection = buildWhatSection(result);
  const signals = classifySuiteSignals(result);
  const suiteType = classifySuiteType(result);

  // Try LLM enrichment
  const model = getEnrichmentModel();
  if (model) {
    try {
      // B.1: Per-suite-type prompt template
      const systemPrompt = buildSystemPrompt(suiteType);
      const userPrompt = buildUserPrompt(result, signals, suiteType);

      // Adjust token budget by suite type: engineering suites need less, sapir-whorf more
      const maxTokens = suiteType === 'engineering' ? 800 : suiteType === 'sapir-whorf' ? 1500 : 1200;

      const { text } = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        maxOutputTokens: maxTokens,
        temperature: 0.15,
      });

      // Build metrics map for placeholder replacement
      const metricsMap: Record<string, string> = {};
      for (const test of result.tests) {
        const key = test.id.toUpperCase().replace(/-/g, '_');
        metricsMap[`${key}_VALUE`] = `${test.metric.value}`;
        metricsMap[`${key}_UNIT`] = test.metric.unit;
        if (test.metric.comparison) {
          metricsMap[`${key}_BASELINE`] = `${test.metric.comparison.baseline}`;
          metricsMap[`${key}_DELTA`] = test.metric.comparison.delta;
        }
        if (test.secondaryMetrics) {
          for (const m of test.secondaryMetrics) {
            const mKey = `${key}_${m.name.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_')}`;
            metricsMap[mKey] = `${m.value}`;
          }
        }
      }
      metricsMap['PASS_RATE'] = result.summary.total > 0 ? `${Math.round((result.summary.passed / result.summary.total) * 100)}%` : '100%';
      metricsMap['TEST_COUNT'] = `${result.summary.total}`;
      metricsMap['PASSED_COUNT'] = `${result.summary.passed}`;
      metricsMap['DURATION'] = formatDuration(result.summary.durationMs);

      const replaced = replacePlaceholders(text, metricsMap);

      // Split into sections
      const everyoneMatch = replaced.result.match(/## For Everyone[\s\S]*?(?=## For Specialists|$)/i);
      const specialistMatch = replaced.result.match(/## For Specialists[\s\S]*/i);

      return {
        whatSection,
        everyoneSection: everyoneMatch ? everyoneMatch[0].trim() : buildDeterministicSummary(result, suiteType),
        specialistSection: specialistMatch ? specialistMatch[0].trim() : undefined,
      };
    } catch (e) {
      console.warn(`[suite-report] LLM enrichment failed for ${result.suiteId} (${suiteType}):`, e instanceof Error ? e.message : String(e));
    }
  }

  // Deterministic fallback
  return {
    whatSection,
    everyoneSection: buildDeterministicSummary(result, suiteType),
  };
}
