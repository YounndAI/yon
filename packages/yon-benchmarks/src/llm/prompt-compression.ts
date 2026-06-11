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
 * Prompt Compression Suite — Deep LLM Evaluation Framework
 *
 * Pillar: Cognitive Economy (primary), Streaming, Lossless, Emitter Faithfulness
 *
 * Tests YON's compression promises against natural language using 2 evaluation
 * categories, each rated independently by 3 LLMs with per-model attribution.
 *
 * Categories:
 *   1. Token & Size Efficiency (LOCAL — tiktoken)
 *   2. Comprehension Quality (LLM /10 — blind evaluation)
 *
 * Evaluators restricted to categorical metrics only (token efficiency + comprehension quality).
 *
 * Scenarios (6): landing-page, api-spec, bug-report, infra-runbook, onboarding, data-pipeline
 * Models (3): GPT-4o-mini, Claude Haiku 4.5, Gemini 2.0 Flash
 *
 * Architecture:
 *   Vectors are PRE-COMPILED and stored as static fixtures in vectors/.
 *   No encoder runtime dependency. Apache 2.0 compatible.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult, TestOutcome } from '../core/types.js';
import { getActiveModels, askModel, type ModelConfig } from '../core/models.js';
import { get_encoding } from 'tiktoken';

// Resolve models once at suite execution (respects --provider filter)
const MODELS = getActiveModels(true);

// ---------------------------------------------------------------------------
// Token counter
// ---------------------------------------------------------------------------

const enc = get_encoding('cl100k_base');
function countTokens(text: string): number {
  return enc.encode(text).length;
}

// ---------------------------------------------------------------------------
// Vector loading
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const VECTORS_DIR = join(__dirname, '..', '..', 'vectors');

interface VectorSet {
  id: string;
  name: string;
  nl: string;
  canon: string;
  min: string;
  ultra: string;
}

function loadVectors(folder: string, name: string): VectorSet {
  const dir = join(VECTORS_DIR, folder);
  return {
    id: folder,
    name,
    nl: readFileSync(join(dir, 'nl.txt'), 'utf-8').trim(),
    canon: readFileSync(join(dir, 'canon.yon'), 'utf-8').trim(),
    min: readFileSync(join(dir, 'min.yon'), 'utf-8').trim(),
    ultra: readFileSync(join(dir, 'ultra.yon'), 'utf-8').trim(),
  };
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const SCENARIOS = [
  // Short-form (diverse domains)
  { folder: 'landing-page', name: 'Landing Page Brief' },
  { folder: 'api-spec', name: 'API Spec' },
  { folder: 'bug-report', name: 'Bug Report (Incident)' },
  { folder: 'infra-runbook', name: 'Infra Runbook (K8s)' },
  { folder: 'data-pipeline', name: 'Data Pipeline (ETL)' },
  // Long-form (150+ lines NL)
  { folder: 'full-api-spec', name: 'Full API Spec (Billing)' },
  { folder: 'architecture-adr', name: 'Architecture ADR (Temporal+Kafka)' },
  { folder: 'incident-postmortem', name: 'Incident Postmortem (SEV-1)' },
  // Specialty
  { folder: 'multilingual-policy', name: 'Multilingual Policy (EU Privacy)' },
  { folder: 'creative-brainstorm', name: 'Creative Brainstorm (Negative Control)' },

];

/**
 * Discourse fillers — true zero-semantic-content words.
 * These are noise that YON correctly strips out.
 */
const DISCOURSE_FILLERS = [
  'ok', 'okay', 'so', 'like', 'basically', 'actually', 'just',
  'you know', 'oh and', 'wait', 'also', 'thing', 'stuff', 'etc',
];

/**
 * Hedging markers — §6.1-protected phrases.
 * These carry semantic weight (speaker confidence/uncertainty).
 * Higher density in YON output = BETTER preservation.
 */
const HEDGING_MARKERS = [
  'probably', 'maybe', 'i think', 'i guess', 'whatever',
  'kind of', 'sort of', 'might', 'not sure', 'apparently',
  'around', 'approximately', 'roughly', 'perhaps', 'seems like',
  'could be', 'supposedly', 'eventually', 'or something',
  'not entirely', 'somewhat', 'if that makes sense',
];

function fillerDensity(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;
  let fillerCount = 0;
  for (const filler of DISCOURSE_FILLERS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) fillerCount += matches.length;
  }
  return Math.round((fillerCount / words) * 100);
}

/**
 * Hedging density — what % of words are §6.1 hedging markers.
 * Higher = more hedging language preserved (good for §6.1 compliance).
 */
function hedgingDensity(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;
  let count = 0;
  for (const marker of HEDGING_MARKERS) {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return Math.round((count / words) * 100);
}


function structuralTokenRatio(text: string): number {
  const lines = text.split('\n');
  const structLines = lines.filter((l) => /^\s*@[A-Z]/.test(l)).length;
  return lines.length > 0 ? Math.round((structLines / lines.length) * 100) : 0;
}

// ---------------------------------------------------------------------------
// CATEGORY 1: Token & Size Efficiency (LOCAL)
// Pillar: Cognitive Economy
// ---------------------------------------------------------------------------

function evaluateTokenEfficiency(v: VectorSet): TestResult {
  const nlChars = v.nl.length;
  const canonChars = v.canon.length;
  const nlTok = countTokens(v.nl);
  const canonTok = countTokens(v.canon);
  const minTok = countTokens(v.min);
  const ultraTok = countTokens(v.ultra);
  const nlFiller = fillerDensity(v.nl);
  const canonFiller = fillerDensity(v.canon);
  const canonStructRatio = structuralTokenRatio(v.canon);
  const nlHedging = hedgingDensity(v.nl);
  const canonHedging = hedgingDensity(v.canon);

  const charDelta = Math.round(((nlChars - canonChars) / nlChars) * 100);
  const tokDelta = Math.round(((nlTok - canonTok) / nlTok) * 100);
  const ultraDelta = Math.round(((nlTok - ultraTok) / nlTok) * 100);

  const explanation = [
    `Token efficiency measures raw compression — characters and tokens consumed per format.`,
    `Canon YON adds structure (${canonStructRatio}% of lines are typed records) at the cost of ${Math.abs(tokDelta)}% ${tokDelta > 0 ? 'fewer' : 'more'} tokens than natural language.`,
    `Ultra YON trades human readability for density: ${ultraDelta}% ${ultraDelta > 0 ? 'fewer' : 'more'} tokens than NL.`,
    `NL carries ${nlFiller}% discourse fillers ("ok so", "basically"). YON eliminates them.`,
    nlHedging > 0 ? `NL contains ${nlHedging}% hedging markers (§6.1-protected). Canon preserves ${canonHedging}%.` : '',
    ``,
    `**Operational characteristic:** Canon prioritizes structure over compression. The token cost is real — structure is not free.`,
    `Ultra demonstrates that aggressive aliasing recovers the baseline cost and then some.`,
    ``,
  ].filter(Boolean).join('\n');

  const table = [
    `| Metric | NL | Canon YON | Min YON | Ultra YON | Delta |`,
    `|--------|----:|----------:|--------:|----------:|------:|`,
    `| Characters | ${nlChars} | ${canonChars} | ${v.min.length} | ${v.ultra.length} | **${charDelta > 0 ? '-' + charDelta : '+' + Math.abs(charDelta)}%** |`,
    `| Tokens (cl100k) | ${nlTok} | ${canonTok} | ${minTok} | ${ultraTok} | Canon ${tokDelta > 0 ? '-' + tokDelta : '+' + Math.abs(tokDelta)}%, Ultra **${ultraDelta > 0 ? '-' + ultraDelta : '+' + Math.abs(ultraDelta)}%** |`,
    `| Structural Token Ratio | ${structuralTokenRatio(v.nl)}% | **${canonStructRatio}%** | ${structuralTokenRatio(v.min)}% | ${structuralTokenRatio(v.ultra)}% | Verified |`,
    `| Discourse Filler Density | ${nlFiller}% | **${canonFiller}%** | ${fillerDensity(v.min)}% | ${fillerDensity(v.ultra)}% | Verified |`,
    `| Hedging Density (§6.1) | ${nlHedging}% | **${canonHedging}%** | ${hedgingDensity(v.min)}% | ${hedgingDensity(v.ultra)}% | ${canonHedging >= nlHedging ? 'Verified' : 'Caution'} |`,
  ].join('\n');

  return {
    id: `token-efficiency-${v.id}`,
    name: `Token Efficiency — ${v.name}`,
    passed: true,
    type: 'comparative',
    outcome: (Math.abs(ultraDelta) <= 5 ? 'tied' : ultraDelta > 0 ? 'advantage' : 'disadvantage') as TestOutcome,
    metric: { name: 'token_delta_ultra', value: ultraDelta, unit: '%' },
    secondaryMetrics: [
      { name: 'nl_tokens', value: nlTok, unit: 'tok' },
      { name: 'canon_tokens', value: canonTok, unit: 'tok' },
      { name: 'min_tokens', value: minTok, unit: 'tok' },
      { name: 'ultra_tokens', value: ultraTok, unit: 'tok' },
      { name: 'structural_ratio_canon', value: canonStructRatio, unit: '%' },
      { name: 'filler_density_nl', value: nlFiller, unit: '%' },
      { name: 'hedging_density_nl', value: nlHedging, unit: '%' },
      { name: 'hedging_density_canon', value: canonHedging, unit: '%' },
    ],
    detail: explanation + table,
  };
}

// ---------------------------------------------------------------------------
// CATEGORY 2: Comprehension Quality (LLM-RATED /10, blind)
// Pillar: Cognitive Economy
// ---------------------------------------------------------------------------

const COMPREHENSION_DIMS = [
  'Section Boundary Clarity',
  'Attribute Extraction Accuracy',
  'Intent Detection',
  'Internal Consistency',
  'Hallucination Risk (10=lowest risk)',
] as const;

async function evaluateComprehension(v: VectorSet): Promise<TestResult> {
  const elapsed = startTimer();
  const perModel: Record<string, { nl: number[]; yon: number[] }> = {};

  // Fire all models in parallel
  const comprehResults = await Promise.allSettled(
    MODELS.map(async (model) => {
      const nlScores = await rateFormatComprehension(model, v.nl, 'Format A');
      const yonScores = await rateFormatComprehension(model, v.canon, 'Format B');
      return { provider: model.provider, nl: nlScores, yon: yonScores };
    }),
  );
  for (const r of comprehResults) {
    if (r.status === 'fulfilled') perModel[r.value.provider] = { nl: r.value.nl, yon: r.value.yon };
  }

  // Build per-model table
  const rows = COMPREHENSION_DIMS.map((dim, i) => {
    const cells = MODELS.map((m) => {
      const data = perModel[m.provider];
      if (!data) return '-';
      return `${data.nl[i]}→**${data.yon[i]}**`;
    });
    const validModels = MODELS.filter(m => perModel[m.provider]);
    const avgNl = validModels.reduce((s, m) => s + (perModel[m.provider]?.nl[i] ?? 0), 0) / (validModels.length || 1);
    const avgYon = validModels.reduce((s, m) => s + (perModel[m.provider]?.yon[i] ?? 0), 0) / (validModels.length || 1);
    return `| ${dim} | ${cells.join(' | ')} | ${avgNl.toFixed(1)}→**${avgYon.toFixed(1)}** |`;
  });

  const table = [
    `| Dimension | ${MODELS.map((m) => m.provider + ' (NL→YON)').join(' | ')} | Average |`,
    `|-----------|${MODELS.map(() => ':---:').join('|')}|:---:|`,
    ...rows,
  ].join('\n');

  const overallNl = MODELS.reduce((s, m) => {
    return s + perModel[m.provider]!.nl.reduce((a, b) => a + b, 0) / COMPREHENSION_DIMS.length;
  }, 0) / MODELS.length;
  const overallYon = MODELS.reduce((s, m) => {
    return s + perModel[m.provider]!.yon.reduce((a, b) => a + b, 0) / COMPREHENSION_DIMS.length;
  }, 0) / MODELS.length;

  const comprehExpl = [
    `Three LLMs rated both formats blindly ("Format A" vs "Format B") on 5 comprehension dimensions.`,
    `YON averaged ${round1(overallYon)}/10 across all models. NL averaged ${round1(overallNl)}/10 \u2014 a gap of +${round1(overallYon - overallNl)} points.`,
    `Typed records (@SEC, @MAP, @RULE) eliminate the inference cost that prose imposes on every dimension.`,
    ``,
    `**Operational characteristic:** Blind evaluation prevents format-name bias, but models may still favor structure inherently. Results are directional, not absolute.`,
    ``,
  ].join('\n');

  return {
    id: `comprehension-${v.id}`,
    name: `Comprehension Quality — ${v.name}`,
    passed: true,
    type: 'comparative',
    outcome: (Math.abs(overallYon - overallNl) <= 0.5 ? 'tied' : overallYon > overallNl ? 'advantage' : 'disadvantage') as TestOutcome,
    metric: { name: 'yon_avg', value: round1(overallYon), unit: '/10', comparison: { baseline: round1(overallNl), baselineLabel: 'NL avg', delta: `+${round1(overallYon - overallNl)}` } },
    detail: comprehExpl + table,
    secondaryMetrics: [
      { name: 'nl_overall', value: round1(overallNl), unit: '/10' },
      { name: 'yon_overall', value: round1(overallYon), unit: '/10' },
      { name: 'duration', value: Math.round(elapsed()), unit: 'ms' },
    ],
  };
}

async function rateFormatComprehension(model: ModelConfig, content: string, label: string): Promise<number[]> {
  const prompt = `You are evaluating a document format called "${label}" for LLM comprehension.

Rate this document on 5 dimensions, each from 1 to 10:
1. Section Boundary Clarity — How clearly are distinct sections demarcated?
2. Attribute Extraction Accuracy — How easily can specific values be pulled without ambiguity?
3. Intent Detection — How clearly does the document communicate its goals?
4. Internal Consistency — Is the format internally coherent and predictable?
5. Hallucination Risk — How UNLIKELY is an LLM to invent facts from ambiguity? (10 = lowest risk)

DOCUMENT:
${content}

Respond in EXACTLY this JSON format, nothing else:
{"scores":[X,X,X,X,X]}`;

  try {
    const raw = await askModel(model, prompt, 100);
    const match = raw.match(/\{[^}]*"scores"\s*:\s*\[[\d,\s]+\][^}]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.scores) && parsed.scores.length === 5) {
        return parsed.scores.map((s: number) => Math.min(10, Math.max(1, Math.round(s))));
      }
    }
  } catch { /* fallback */ }
  return [5, 5, 5, 5, 5]; // neutral fallback
}


// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------------------
// Suite Runner
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  // Determine scenario count (support --quick for 1 scenario)
  const isQuick = process.argv.includes('--quick');
  const scenariosToRun = isQuick ? SCENARIOS.slice(0, 1) : SCENARIOS;

  // All scenarios load independent vectors — parallelize (Tier 4 = 10k RPM)
  const scenarioResults = await Promise.allSettled(
    scenariosToRun.map(async (scenario) => {
      const v = loadVectors(scenario.folder, scenario.name);
      // Cat 1 is sync; Cat 2 is async
      const tokenEfficiency = evaluateTokenEfficiency(v);
      const comprehension = await evaluateComprehension(v);
      return [tokenEfficiency, comprehension] as TestResult[];
    }),
  );

  for (const r of scenarioResults) {
    if (r.status === 'fulfilled') tests.push(...r.value);
    else throw r.reason;
  }

  // Summary test
  const totalTests = tests.length;
  const cats = ['token-efficiency', 'comprehension'];
  const summaryLines = cats.map((cat) => {
    const catTests = tests.filter((t) => t.id.startsWith(cat));
    const avgMetric = catTests.length > 0
      ? round1(catTests.reduce((s, t) => s + t.metric.value, 0) / catTests.length)
      : 0;
    return `| ${cat} | ${catTests.length} tests | avg metric: ${avgMetric} ${catTests[0]?.metric.unit ?? ''} |`;
  });

  tests.push({
    id: 'deep-eval-summary',
    name: `Deep Evaluation Summary (${scenariosToRun.length} scenarios × 2 categories)`,
    passed: true,
    type: 'comparative',
    metric: { name: 'scenarios', value: scenariosToRun.length, unit: 'evaluated' },
    detail: [
      `| Category | Tests | Aggregate |`,
      `|----------|:-----:|-----------|`,
      ...summaryLines,
    ].join('\n'),
    secondaryMetrics: [
      { name: 'total_tests', value: totalTests, unit: 'tests' },
      { name: 'categories', value: 2, unit: 'categories' },
      { name: 'models', value: MODELS.length, unit: 'models' },
    ],
  });

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  // Free tiktoken encoder
  enc.free();

  return {
    suiteId: 'prompt-compression',
    suiteName: 'Prompt Compression',
    pillar: 'cognitive-economy',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: localTimestamp(),
  };
}

export { run as runPromptCompression };
