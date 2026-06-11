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
 * Borges Warning Suite — Cognitive Bias Detection (Multi-Model)
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Format-dependent comprehension and extraction fidelity
 *
 * Battery A — Risk Coverage (Payment System, 5 categories, 5 formats)
 * Battery B — Risk Coverage (Multi-Domain, 10 categories, 4 formats)
 * Battery C — Computation Extraction (math on @MAP data, 3 formats)
 * Battery D — Cross-Section Dependency (cascade analysis, 3 formats)
 *
 * Requires: At least one LLM API key in .env.local
 */

import { askAllLLMs } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskCategory {
  name: string;
  salience: 'rule-salient' | 'metric-salient';
  keywords: string[];
}

interface ClassificationResult {
  ruleSalient: number;
  metricSalient: number;
  unclassified: number;
}

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

function loadRulesOnlyYon(): string {
  return loadVector('borges-warning', 'system-rules-only.yon');
}

function loadEnforcementYon(): string {
  return loadVector('borges-warning', 'system-with-enforcement.yon');
}

function loadStructuredMarkdown(): string {
  return loadVector('borges-warning', 'system-description.md');
}

function loadUnstructuredProse(): string {
  return loadVector('borges-warning', 'nl-description.txt');
}

function loadStructuredJson(): string {
  return loadVector('borges-warning', 'system-structured-data.json');
}

function loadMultiDomainYon(): string {
  return loadVector('borges-warning', 'multi-domain.yon');
}

function loadMultiDomainEnforced(): string {
  return loadVector('borges-warning', 'multi-domain-enforced.yon');
}

function loadUnstructuredDump(): string {
  return loadVector('borges-warning', 'unstructured-dump.txt');
}

function loadEvaluation(): RiskCategory[] {
  return JSON.parse(loadVector('borges-warning', 'evaluation.json')).categories;
}

function loadMultiDomainEvaluation(): RiskCategory[] {
  return JSON.parse(loadVector('borges-warning', 'evaluation-multi-domain.json')).categories;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Classify risks mentioned in an LLM response using keyword matching.
 * Case-insensitive. Matches longest keywords first to avoid partial matches.
 */
function classifyRisks(response: string, categories: RiskCategory[]): ClassificationResult {
  const lower = response.toLowerCase();
  let ruleSalient = 0;
  let metricSalient = 0;

  for (const cat of categories) {
    const sorted = [...cat.keywords].sort((a, b) => b.length - a.length);
    const matched = sorted.some((kw) => lower.includes(kw.toLowerCase()));

    if (matched) {
      if (cat.salience === 'rule-salient') {
        ruleSalient++;
      } else {
        metricSalient++;
      }
    }
  }

  const total = categories.length;
  const classified = ruleSalient + metricSalient;
  return { ruleSalient, metricSalient, unclassified: total - classified };
}

/**
 * Calculate bias index: proportion of rule-salient matches.
 * 100% = only rule risks mentioned (max blind spot)
 * 50% = perfectly balanced
 * 0% = only metric risks mentioned
 */
function biasIndex(result: ClassificationResult): number {
  const total = result.ruleSalient + result.metricSalient;
  if (total === 0) return 50;
  return Math.round((result.ruleSalient / total) * 100);
}

// ---------------------------------------------------------------------------
// Prompt Construction
// ---------------------------------------------------------------------------

function buildPrompt(vectorContent: string): string {
  return [
    'Read the following system description:',
    vectorContent,
    '',
    'Identify ALL risks present in this system. List every risk you can find, organized by domain.',
  ].join('\n');
}

/**
 * Instructed prompt — teaches the LLM how to read YON notation.
 * This is the "winning combo": best-practice YON + reading instructions.
 */
function buildInstructedPrompt(vectorContent: string): string {
  return [
    'The following document uses YON notation. `@RULE` tags indicate mandatory requirements with severity levels (MUST/MUST_NOT). `@MAP` tags contain structured key-value pairs with thresholds and metrics. `@SEC` tags define domain sections. `@CHECK` tags define assertions that should trigger alerts when violated.',
    '',
    'Analyze ALL sections for risks. Pay equal attention to @RULE, @MAP, and @CHECK tags — each may reveal critical issues.',
    '',
    vectorContent,
    '',
    'Identify ALL risks present in this system. List every risk you can find, organized by domain.',
  ].join('\n');
}

/**
 * Computation prompt — asks LLM to extract numbers and do math.
 * YON's @MAP makes number extraction trivial. Brain dump buries numbers in prose.
 */
function buildComputationPrompt(vectorContent: string): string {
  return [
    'Read the following system description:',
    vectorContent,
    '',
    'Answer these questions with specific numbers:',
    '1. How many distinct metrics or thresholds are currently in breach of their targets?',
    '2. List each breached metric with its current value and its target value.',
    '3. What percentage of all monitored metrics are currently within acceptable thresholds?',
    '4. Which single metric poses the most urgent risk and why?',
  ].join('\n');
}

/**
 * Cross-section dependency prompt — asks LLM to find cascading risks.
 * YON's @SEC boundaries make cross-referencing explicit. Brain dump has no sections.
 */
function buildDependencyPrompt(vectorContent: string): string {
  return [
    'Read the following system description:',
    vectorContent,
    '',
    'Analyze dependencies BETWEEN domains/sections:',
    '1. Which risks in one section could directly trigger or worsen risks in another section?',
    '2. Identify the single most dangerous cascade chain (A causes B causes C).',
    '3. Which section has the most outbound dependencies (creates risks for other sections)?',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Format Test Runner
// ---------------------------------------------------------------------------

interface FormatSpec {
  id: string;
  label: string;
  loader: () => string;
  metricPrefix: string;
  testType: 'measurement' | 'comparative';
}

/** Battery A: Payment system (5 categories) */
const BATTERY_A: FormatSpec[] = [
  {
    id: 'yon-best-practice',
    label: 'YON Best-Practice (@RULE/@MAP)',
    loader: loadRulesOnlyYon,
    metricPrefix: 'yon_best_practice',
    testType: 'measurement',
  },
  {
    id: 'yon-enforcement',
    label: 'YON Enforcement (@MAP/@RULE/@CHECK)',
    loader: loadEnforcementYon,
    metricPrefix: 'yon_enforcement',
    testType: 'measurement',
  },
  {
    id: 'structured-markdown',
    label: 'Structured Markdown (##, bullets)',
    loader: loadStructuredMarkdown,
    metricPrefix: 'structured_md',
    testType: 'comparative',
  },
  {
    id: 'unstructured-prose',
    label: 'Unstructured Prose (plain text)',
    loader: loadUnstructuredProse,
    metricPrefix: 'unstructured',
    testType: 'comparative',
  },
  {
    id: 'structured-json',
    label: 'Structured JSON (config schema)',
    loader: loadStructuredJson,
    metricPrefix: 'json',
    testType: 'comparative',
  },
];

/** Battery B: Multi-domain system (10 categories, 4 formats) */
const BATTERY_B: FormatSpec[] = [
  {
    id: 'multi-domain-yon',
    label: 'Multi-Domain YON (@RULE/@MAP)',
    loader: loadMultiDomainYon,
    metricPrefix: 'multi_yon',
    testType: 'measurement',
  },
  {
    id: 'multi-domain-yon-enforced',
    label: 'Multi-Domain YON Enforced (@CHECK/@MAP/@RULE)',
    loader: loadMultiDomainEnforced,
    metricPrefix: 'multi_yon_enforced',
    testType: 'measurement',
  },
  {
    id: 'multi-domain-yon-instructed',
    label: 'Multi-Domain YON + Instructions (winning combo)',
    loader: loadMultiDomainYon,
    metricPrefix: 'multi_yon_instructed',
    testType: 'measurement',
  },
  {
    id: 'unstructured-dump',
    label: 'Unstructured Brain Dump (chaotic)',
    loader: loadUnstructuredDump,
    metricPrefix: 'dump',
    testType: 'comparative',
  },
];

// ---------------------------------------------------------------------------
// Battery C & D — Computation and Cross-Section Dependency
// ---------------------------------------------------------------------------

/** Computation extraction: which metrics are in breach? (math on @MAP data) */
const BATTERY_C_FORMATS = ['multi-domain-yon-instructed', 'multi-domain-yon', 'unstructured-dump'] as const;

/** Cross-section dependency: cascade risks across @SEC boundaries */
const BATTERY_D_FORMATS = ['multi-domain-yon-instructed', 'multi-domain-yon', 'unstructured-dump'] as const;

/**
 * Known cross-section dependencies for cascade scoring.
 */
const KNOWN_CASCADES = [
  ['payment', 'security'],         // Chargeback → fraud screening → security audit
  ['infrastructure', 'pipeline'],  // DB full → ETL fails → data freshness degrades
  ['pipeline', 'compliance'],      // PII in analytics → GDPR violation
  ['security', 'infrastructure'],  // No rate limiting → DDoS → scaling issues
  ['infrastructure', 'payment'],   // DR failure → payment processing outage
] as const;

function scoreComputation(response: string): number {
  const lower = response.toLowerCase();
  let score = 0;
  // Count unique breach matches (deduplicated by category)
  const categories = [
    { keywords: ['chargeback', '2.1%', 'visa threshold'], found: false },
    { keywords: ['db_storage', 'database', '92%', 'storage capacity', 'full in 45'], found: false },
    { keywords: ['cold start', 'cold_start', '12s', '12 second'], found: false },
    { keywords: ['disaster recovery', 'no dr', 'rto', 'untested'], found: false },
    { keywords: ['etl', 'failing silently', 'silent fail'], found: false },
    { keywords: ['data freshness', '6+ hours', '6 hours'], found: false },
    { keywords: ['pii', 'gdpr', 'article 5', 'personal data'], found: false },
    { keywords: ['storage growth', '15%', 'month-over-month'], found: false },
    { keywords: ['admin', 'service account', '23', 'least privilege'], found: false },
    { keywords: ['pen test', 'penetration test', '14 months'], found: false },
    { keywords: ['rate limit', 'throttling', 'no throttling'], found: false },
  ];
  for (const cat of categories) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      cat.found = true;
      score++;
    }
  }
  return score; // out of 11
}

function scoreDependency(response: string): number {
  const lower = response.toLowerCase();
  let score = 0;
  // Check for cross-section references (mentions two different domains in proximity)
  for (const [sectionA, sectionB] of KNOWN_CASCADES) {
    if (lower.includes(sectionA) && lower.includes(sectionB)) score++;
  }
  // Bonus for cascade chain identification
  if (lower.includes('cascade') || lower.includes('chain') || lower.includes('causes') || lower.includes('trigger')) score++;
  if (lower.includes('outbound') || lower.includes('most depend') || lower.includes('highest risk')) score++;
  return Math.min(score, 7); // cap at 7
}

/**
 * Run a single format test across all models.
 */
async function testFormat(
  format: FormatSpec,
  categories: RiskCategory[],
): Promise<{ tests: TestResult[]; classifications: Map<string, ClassificationResult> }> {
  const elapsed = startTimer();
  const content = format.loader();
  const prompt = format.id === 'multi-domain-yon-instructed'
    ? buildInstructedPrompt(content)
    : buildPrompt(content);
  const responses = await askAllLLMs(prompt, 1500);
  const durationMs = elapsed();

  const tests: TestResult[] = [];
  const classifications = new Map<string, ClassificationResult>();

  for (const r of responses) {
    const cls = classifyRisks(r.response, categories);
    const index = biasIndex(cls);
    classifications.set(r.modelId, cls);

    tests.push({
      id: `${format.id}-${r.modelId}`,
      name: `${format.label} [${r.name}]`,
      passed: true,
      type: format.testType,
      metric: { name: `${format.metricPrefix}_bias_index`, value: index, unit: '%' },
      secondaryMetrics: [
        { name: 'model', value: 0, unit: r.name },
        { name: 'format', value: 0, unit: format.id },
        { name: 'rule_salient', value: cls.ruleSalient, unit: `/${categories.filter((c) => c.salience === 'rule-salient').length}` },
        { name: 'metric_salient', value: cls.metricSalient, unit: `/${categories.filter((c) => c.salience === 'metric-salient').length}` },
        { name: 'unclassified', value: cls.unclassified, unit: 'categories' },
        { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
      ],
      detail: `${r.name} × ${format.label}: ${cls.ruleSalient} rule, ${cls.metricSalient} metric. Bias: ${index}%.`,
    });
  }

  return { tests, classifications };
}

// ---------------------------------------------------------------------------
// Cross-Format Differential Builder
// ---------------------------------------------------------------------------

function buildDifferentials(
  battery: FormatSpec[],
  allResults: Map<string, Map<string, ClassificationResult>>,
  tests: TestResult[],
  prefix: string,
  yonId: string,
  baselineId: string,
): TestResult[] {
  const differentials: TestResult[] = [];
  const allModelIds = new Set<string>();
  for (const cls of allResults.values()) {
    for (const modelId of cls.keys()) allModelIds.add(modelId);
  }

  for (const modelId of allModelIds) {
    const indices: Record<string, number> = {};
    let hasAll = true;

    for (const format of battery) {
      const cls = allResults.get(format.id)?.get(modelId);
      if (!cls) { hasAll = false; break; }
      indices[format.id] = biasIndex(cls);
    }

    if (!hasAll) continue;

    const yonIdx = indices[yonId] ?? 50;
    const baseIdx = indices[baselineId] ?? 50;
    const primaryDiff = yonIdx - baseIdx;

    const displayName =
      tests.find((t) => t.id.endsWith(modelId))?.name.match(/\[(.+)\]/)?.[1] ?? modelId;

    const secondaryMetrics = battery.map((f) => ({
      name: f.id,
      value: indices[f.id] ?? 50,
      unit: '%',
    }));
    secondaryMetrics.unshift({ name: 'model', value: 0, unit: displayName });

    differentials.push({
      id: `${prefix}-diff-${modelId}`,
      name: `${prefix === 'A' ? 'Payment' : 'Multi-Domain'} Differential [${displayName}]`,
      passed: true,
      type: 'measurement',
      metric: { name: `${prefix.toLowerCase()}_yon_vs_baseline`, value: primaryDiff, unit: 'pp' },
      secondaryMetrics,
      detail: `${displayName}: YON(${yonIdx}%) vs baseline(${baseIdx}%) = ${primaryDiff}pp.`,
    });
  }

  return differentials;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  // ── Battery A: Payment System (5 categories, 5 formats) ──
  const categoriesA = loadEvaluation();
  const resultsA = new Map<string, Map<string, ClassificationResult>>();

  for (const format of BATTERY_A) {
    const result = await testFormat(format, categoriesA);
    tests.push(...result.tests);
    resultsA.set(format.id, result.classifications);
  }

  tests.push(...buildDifferentials(
    BATTERY_A, resultsA, tests, 'A', 'yon-best-practice', 'unstructured-prose',
  ));

  // ── Battery B: Multi-Domain (10 categories, 2 formats) ──
  const categoriesB = loadMultiDomainEvaluation();
  const resultsB = new Map<string, Map<string, ClassificationResult>>();

  for (const format of BATTERY_B) {
    const result = await testFormat(format, categoriesB);
    tests.push(...result.tests);
    resultsB.set(format.id, result.classifications);
  }

  tests.push(...buildDifferentials(
    BATTERY_B, resultsB, tests, 'B', 'multi-domain-yon-instructed', 'unstructured-dump',
  ));

  // ── Battery C: Computation Extraction (math on @MAP data) ──
  const loaderMap: Record<string, () => string> = {
    'multi-domain-yon-instructed': loadMultiDomainYon,
    'multi-domain-yon': loadMultiDomainYon,
    'unstructured-dump': loadUnstructuredDump,
  };

  for (const fmtId of BATTERY_C_FORMATS) {
    const content = loaderMap[fmtId]!();
    const prompt = fmtId === 'multi-domain-yon-instructed'
      ? buildInstructedPrompt(content).replace(/Identify ALL risks.*organized by domain\./, '') + '\n' + buildComputationPrompt('').split('\n').slice(2).join('\n')
      : buildComputationPrompt(content);
    const responses = await askAllLLMs(prompt, 1500);

    for (const r of responses) {
      const score = scoreComputation(r.response);
      tests.push({
        id: `C-compute-${fmtId}-${r.modelId}`,
        name: `Computation [${r.name}] × ${fmtId}`,
        passed: true,
        type: 'comparative',
        metric: { name: `compute_${fmtId}_breaches`, value: score, unit: '/11' },
        secondaryMetrics: [
          { name: 'model', value: 0, unit: r.name },
          { name: 'format', value: 0, unit: fmtId },
        ],
        detail: `${r.name} × ${fmtId}: Found ${score}/11 breached metrics.`,
      });
    }
  }

  // ── Battery D: Cross-Section Dependencies (cascade risks) ──
  for (const fmtId of BATTERY_D_FORMATS) {
    const content = loaderMap[fmtId]!();
    const prompt = fmtId === 'multi-domain-yon-instructed'
      ? buildInstructedPrompt(content).replace(/Identify ALL risks.*organized by domain\./, '') + '\n' + buildDependencyPrompt('').split('\n').slice(2).join('\n')
      : buildDependencyPrompt(content);
    const responses = await askAllLLMs(prompt, 1500);

    for (const r of responses) {
      const score = scoreDependency(r.response);
      tests.push({
        id: `D-deps-${fmtId}-${r.modelId}`,
        name: `Dependencies [${r.name}] × ${fmtId}`,
        passed: true,
        type: 'comparative',
        metric: { name: `deps_${fmtId}_cascades`, value: score, unit: '/7' },
        secondaryMetrics: [
          { name: 'model', value: 0, unit: r.name },
          { name: 'format', value: 0, unit: fmtId },
        ],
        detail: `${r.name} × ${fmtId}: Found ${score}/7 cross-section dependencies.`,
      });
    }
  }

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'borges-warning',
    suiteName: 'Borges Warning (Cognitive Bias)',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runBorgesWarning };
