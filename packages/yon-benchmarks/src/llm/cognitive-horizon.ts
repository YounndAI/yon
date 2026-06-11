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
 * Cognitive Horizon Suite — Extended Mind / Density Hypothesis (Multi-Model)
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Context density vs. cross-file reasoning performance
 *
 * Hypothesis: More YON-dense context → better cross-file reasoning,
 * because the notation expands the agent's cognitive horizon.
 *
 * Tests Clark & Chalmers's Extended Mind thesis: the context window
 * IS the mind, so density IS cognitive capacity.
 *
 * Design:
 *   - 10 system files describing "InvoiceFlow" platform
 *   - 3 densities: Markdown (~8000 tokens), YON canon (~5500), YON min (~3200)
 *   - 10 cross-file reasoning questions (each requires 3+ files)
 *   - Multi-model execution across budget/standard/premium tiers
 *   - Cross-provider parallelism (same provider stays sequential)
 *
 * Prediction: YON min > YON canon > Markdown accuracy,
 * and the density advantage is largest on budget-tier models.
 *
 * Requires: At least one LLM API key in .env.local
 */

import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import {
  createFullTierModels,
  getActiveModels,
  askModel,
  type ModelConfig,
} from '../core/models.js';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DensityKey = 'markdown' | 'yon_canon' | 'yon_min';

interface SystemFile {
  name: string;
  mdFile: string;
  yonFile: string;
  minFile: string;
}

interface Question {
  id: number;
  text: string;
  /** Keywords that MUST appear in a correct answer (case-insensitive OR match) */
  expectedKeywords: string[];
  /** Minimum number of keywords that must match to score 1 */
  minMatches: number;
  /** Files required (for documentation only) */
  filesRequired: string[];
}

// ---------------------------------------------------------------------------
// System Files — 10 InvoiceFlow architecture files
// ---------------------------------------------------------------------------

const SYSTEM_FILES: SystemFile[] = [
  { name: 'api-spec', mdFile: 'api-spec.md', yonFile: 'api-spec.yon', minFile: 'api-spec.min.yon' },
  { name: 'db-schema', mdFile: 'db-schema.md', yonFile: 'db-schema.yon', minFile: 'db-schema.min.yon' },
  { name: 'auth-rules', mdFile: 'auth-rules.md', yonFile: 'auth-rules.yon', minFile: 'auth-rules.min.yon' },
  { name: 'validation', mdFile: 'validation.md', yonFile: 'validation.yon', minFile: 'validation.min.yon' },
  { name: 'error-codes', mdFile: 'error-codes.md', yonFile: 'error-codes.yon', minFile: 'error-codes.min.yon' },
  { name: 'rate-limits', mdFile: 'rate-limits.md', yonFile: 'rate-limits.yon', minFile: 'rate-limits.min.yon' },
  { name: 'logging-policy', mdFile: 'logging-policy.md', yonFile: 'logging-policy.yon', minFile: 'logging-policy.min.yon' },
  { name: 'deploy-config', mdFile: 'deploy-config.md', yonFile: 'deploy-config.yon', minFile: 'deploy-config.min.yon' },
  { name: 'team-structure', mdFile: 'team-structure.md', yonFile: 'team-structure.yon', minFile: 'team-structure.min.yon' },
  { name: 'monitoring', mdFile: 'monitoring.md', yonFile: 'monitoring.yon', minFile: 'monitoring.min.yon' },
];

// ---------------------------------------------------------------------------
// Questions — 10 cross-file reasoning questions
// ---------------------------------------------------------------------------

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Can an admin create a draft invoice via POST /invoices? What validation runs on the line_items?',
    expectedKeywords: ['admin', 'allow', 'description', 'quantity', 'unit_price', 'at least 1', 'draft'],
    minMatches: 4,
    filesRequired: ['api-spec', 'auth-rules', 'validation'],
  },
  {
    id: 2,
    text: 'A viewer hits GET /invoices 200 times in 1 minute. What happens? What error code and HTTP status are returned?',
    expectedKeywords: ['rate limit', '429', 'RATE_001', 'retry-after', '120', 'viewer', '0.5'],
    minMatches: 3,
    filesRequired: ['api-spec', 'rate-limits', 'error-codes'],
  },
  {
    id: 3,
    text: 'The payment_method field is updated on an invoice. Is this change logged? If so, at what level? Is the value redacted?',
    expectedKeywords: ['info', 'changed fields', 'admin', 'payment_method', 'not values'],
    minMatches: 3,
    filesRequired: ['db-schema', 'logging-policy', 'validation'],
  },
  {
    id: 4,
    text: 'Yuto Nakamura wants to deploy a release to production. Can he? Why or why not?',
    expectedKeywords: ['manager', 'admin', 'cannot', 'denied', 'prod', 'admin only'],
    minMatches: 3,
    filesRequired: ['team-structure', 'auth-rules', 'deploy-config'],
  },
  {
    id: 5,
    text: 'Invoice total is set to -50. What error code is returned? What HTTP status?',
    expectedKeywords: ['VAL_002', '400', 'greater than zero', 'total', 'must be'],
    minMatches: 3,
    filesRequired: ['validation', 'error-codes', 'api-spec'],
  },
  {
    id: 6,
    text: 'The POST /payments endpoint SLO is breached. Who gets paged and at what severity? What is the response time requirement?',
    expectedKeywords: ['99.99', 'Chen Wei', 'P1', '15 min', 'payments', 'PagerDuty'],
    minMatches: 3,
    filesRequired: ['monitoring', 'team-structure', 'api-spec'],
  },
  {
    id: 7,
    text: 'Is the audit_log table writable via any REST endpoint? How are records created?',
    expectedKeywords: ['not exposed', 'no', 'internally', 'system', 'append-only', 'create', 'update', 'status_change'],
    minMatches: 3,
    filesRequired: ['db-schema', 'api-spec', 'auth-rules'],
  },
  {
    id: 8,
    text: 'A viewer role in the staging environment can access which endpoints? Can they see payments?',
    expectedKeywords: ['GET /invoices', 'own team', 'viewer', 'cannot', 'payments', 'deny', 'read-only'],
    minMatches: 3,
    filesRequired: ['auth-rules', 'deploy-config', 'api-spec'],
  },
  {
    id: 9,
    text: 'How many columns in the users table contain PII? List them. Are they all redacted in logs?',
    expectedKeywords: ['email', 'full_name', 'phone', '3', 'redacted', 'PII'],
    minMatches: 4,
    filesRequired: ['db-schema', 'logging-policy'],
  },
  {
    id: 10,
    text: 'If the feature flag new_payment_flow is off in prod, what changes about POST /payments behavior? Can non-USD payments be made?',
    expectedKeywords: ['USD', 'only', 'off', 'multi-currency', 'prod', 'new_payment_flow'],
    minMatches: 3,
    filesRequired: ['deploy-config', 'api-spec', 'validation'],
  },
];

// ---------------------------------------------------------------------------
// Vector Loading (fail-safe)
// ---------------------------------------------------------------------------

function loadDensity(density: DensityKey): string {
  const parts: string[] = [];
  for (const file of SYSTEM_FILES) {
    const filename =
      density === 'markdown'
        ? file.mdFile
        : density === 'yon_canon'
          ? file.yonFile
          : file.minFile;
    try {
      parts.push(`=== ${file.name} ===\n${loadVector('cognitive-horizon', filename)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠ Failed to load vector ${filename}: ${msg}`);
      parts.push(`=== ${file.name} ===\n[LOAD ERROR: ${msg.slice(0, 60)}]`);
    }
  }
  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreAnswer(answer: string, question: Question): { correct: boolean; matchCount: number; matched: string[] } {
  const lower = answer.toLowerCase();
  const matched: string[] = [];
  for (const kw of question.expectedKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
    }
  }
  return { correct: matched.length >= question.minMatches, matchCount: matched.length, matched };
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildPrompt(context: string, question: string): string {
  return [
    'You are given a complete system architecture description consisting of 10 files.',
    'Read ALL files carefully before answering.',
    '',
    '--- SYSTEM ARCHITECTURE ---',
    context,
    '--- END SYSTEM ARCHITECTURE ---',
    '',
    `Question: ${question}`,
    '',
    'Answer the question using ONLY information from the files above. Be specific — cite exact values, codes, roles, and thresholds where relevant.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Per-Model Density Test (fail-safe per question)
// ---------------------------------------------------------------------------

const DENSITY_LABELS: Record<DensityKey, string> = {
  markdown: 'Markdown',
  yon_canon: 'YON Canon',
  yon_min: 'YON Minimal',
};

async function testDensityForModel(
  model: ModelConfig,
  density: DensityKey,
  context: string,
): Promise<{ correct: number; total: number; perQuestion: TestResult[] }> {
  let correct = 0;
  const perQuestion: TestResult[] = [];

  for (const q of QUESTIONS) {
    try {
      const prompt = buildPrompt(context, q.text);
      const answer = await askModel(model, prompt, 2000);
      const result = scoreAnswer(answer, q);
      if (result.correct) correct++;

      perQuestion.push({
        id: `horizon-${density}-q${q.id}-${model.providerKey}`,
        name: `${DENSITY_LABELS[density]} Q${q.id} [${model.name}]`,
        passed: true,
        type: 'comparative',
        metric: {
          name: `q${q.id}_match_count`,
          value: result.matchCount,
          unit: `/${q.expectedKeywords.length}`,
        },
        secondaryMetrics: [
          { name: 'correct', value: result.correct ? 1 : 0, unit: 'bool' },
          { name: 'model', value: 0, unit: model.name },
          { name: 'density', value: 0, unit: density },
        ],
        detail: `Q${q.id}: ${result.correct ? '✓' : '✗'} (${result.matchCount}/${q.minMatches} keywords: ${result.matched.join(', ') || 'none'})`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      perQuestion.push({
        id: `horizon-${density}-q${q.id}-${model.providerKey}`,
        name: `${DENSITY_LABELS[density]} Q${q.id} [${model.name}]`,
        passed: false,
        type: 'comparative',
        metric: { name: `q${q.id}_match_count`, value: 0, unit: `/${q.expectedKeywords.length}` },
        detail: `ERROR: ${msg.slice(0, 100)}`,
      });
    }
  }

  return { correct, total: QUESTIONS.length, perQuestion };
}

// ---------------------------------------------------------------------------
// Parallel Execution — group by provider, parallelize across providers
// ---------------------------------------------------------------------------

interface ModelDensityResult {
  model: ModelConfig;
  density: DensityKey;
  result: { correct: number; total: number; perQuestion: TestResult[] };
}

async function runDensityForProviderGroup(
  models: ModelConfig[],
  density: DensityKey,
  context: string,
): Promise<ModelDensityResult[]> {
  // Within same provider: sequential (rate limit safety)
  const results: ModelDensityResult[] = [];
  for (const model of models) {
    try {
      const result = await testDensityForModel(model, density, context);
      results.push({ model, density, result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`  ⚠ Model ${model.name} failed on ${density}: ${msg}`);
      results.push({
        model,
        density,
        result: {
          correct: 0,
          total: QUESTIONS.length,
          perQuestion: [{
            id: `horizon-${density}-model-fail-${model.providerKey}`,
            name: `${DENSITY_LABELS[density]} [${model.name}] — Model Failure`,
            passed: false,
            type: 'comparative',
            metric: { name: 'model_error', value: 0, unit: 'error' },
            detail: `MODEL ERROR: ${msg.slice(0, 120)}`,
          }],
        },
      });
    }
  }
  return results;
}

function groupByProvider(models: ModelConfig[]): Map<string, ModelConfig[]> {
  const groups = new Map<string, ModelConfig[]>();
  for (const m of models) {
    // Extract provider from providerKey (e.g., "openai:gpt-4o-mini" → "openai")
    const provider = m.providerKey.split(':')[0] ?? m.providerKey;
    const list = groups.get(provider) ?? [];
    list.push(m);
    groups.set(provider, list);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Main Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  // Get models — full tier matrix for Sapir-Whorf thesis suites
  let MODELS: ModelConfig[];
  try {
    const fullTier = createFullTierModels();
    MODELS = fullTier.length > 0 ? fullTier : getActiveModels(true);
  } catch {
    MODELS = getActiveModels(true);
  }

  if (MODELS.length === 0) {
    return {
      suiteId: 'cognitive-horizon',
      suiteName: 'Cognitive Horizon (Extended Mind)',
      pillar: 'sapir-whorf',
      tests: [{
        id: 'no-models',
        name: 'Cognitive Horizon: No Models',
        passed: false,
        type: 'gate',
        metric: { name: 'available_models', value: 0, unit: 'models' },
        detail: 'No LLM API keys configured. Skipping.',
      }],
      summary: { total: 1, passed: 0, failed: 1, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  // Pre-load all densities (fail-safe — loadDensity catches internally)
  const densityKeys: DensityKey[] = ['markdown', 'yon_canon', 'yon_min'];
  let contexts: Record<DensityKey, string>;
  try {
    contexts = {
      markdown: loadDensity('markdown'),
      yon_canon: loadDensity('yon_canon'),
      yon_min: loadDensity('yon_min'),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      suiteId: 'cognitive-horizon',
      suiteName: 'Cognitive Horizon (Extended Mind)',
      pillar: 'sapir-whorf',
      tests: [{
        id: 'vector-load-fail',
        name: 'Cognitive Horizon: Vector Load Failure',
        passed: false,
        type: 'gate',
        metric: { name: 'vector_load', value: 0, unit: 'error' },
        detail: `Failed to load vector files: ${msg.slice(0, 120)}`,
      }],
      summary: { total: 1, passed: 0, failed: 1, durationMs: elapsed() },
      timestamp: localTimestamp(),
    };
  }

  // Measure token counts (approximate: 1 token ≈ 4 chars)
  const tokenCounts: Record<DensityKey, number> = {
    markdown: Math.round(contexts.markdown.length / 4),
    yon_canon: Math.round(contexts.yon_canon.length / 4),
    yon_min: Math.round(contexts.yon_min.length / 4),
  };

  console.log(`\n  📐 Context sizes — MD: ~${tokenCounts.markdown} tokens, YON canon: ~${tokenCounts.yon_canon} tokens, YON min: ~${tokenCounts.yon_min} tokens`);
  console.log(`  Compression — canon: ${Math.round((1 - tokenCounts.yon_canon / tokenCounts.markdown) * 100)}% smaller, min: ${Math.round((1 - tokenCounts.yon_min / tokenCounts.markdown) * 100)}% smaller`);

  const densityLabelsFull: Record<DensityKey, string> = {
    markdown: 'Markdown (verbose)',
    yon_canon: 'YON Canon (fmt=full)',
    yon_min: 'YON Minimal (fmt=min)',
  };

  const densityTotals: Record<DensityKey, { correct: number; total: number }> = {
    markdown: { correct: 0, total: 0 },
    yon_canon: { correct: 0, total: 0 },
    yon_min: { correct: 0, total: 0 },
  };

  // Group models by provider for cross-provider parallelism
  const providerGroups = groupByProvider(MODELS);
  const providerNames = [...providerGroups.keys()];
  console.log(`\n  🔀 Parallel execution: ${providerNames.length} provider group(s) — ${providerNames.join(', ')}`);

  // For each density: run all provider groups in parallel
  for (const dk of densityKeys) {
    console.log(`\n  📝 ${densityLabelsFull[dk]}...`);

    const providerPromises = [...providerGroups.entries()].map(
      ([_provider, models]) => runDensityForProviderGroup(models, dk, contexts[dk]),
    );

    // Parallel across providers, sequential within each provider
    const settled = await Promise.allSettled(providerPromises);

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        for (const mdr of result.value) {
          densityTotals[dk].correct += mdr.result.correct;
          densityTotals[dk].total += mdr.result.total;

          const accuracy = mdr.result.total > 0
            ? Math.round((mdr.result.correct / mdr.result.total) * 100)
            : 0;
          console.log(`    🧠 ${mdr.model.name}: ${mdr.result.correct}/${mdr.result.total} (${accuracy}%)`);

          // Add per-question tests
          tests.push(...mdr.result.perQuestion);

          // Add per-model-density aggregate
          tests.push({
            id: `horizon-${dk}-${mdr.model.providerKey}-agg`,
            name: `${densityLabelsFull[dk]} [${mdr.model.name}] — Aggregate`,
            passed: true,
            type: 'comparative',
            metric: { name: `${dk}_accuracy`, value: accuracy, unit: '%' },
            secondaryMetrics: [
              { name: 'correct', value: mdr.result.correct, unit: `/${mdr.result.total}` },
              { name: 'tokens', value: tokenCounts[dk], unit: 'approx' },
              { name: 'model', value: 0, unit: mdr.model.name },
            ],
            detail: `${mdr.model.name} × ${densityLabelsFull[dk]}: ${mdr.result.correct}/${mdr.result.total} (${accuracy}%) @ ~${tokenCounts[dk]} tokens`,
          });
        }
      } else {
        // Entire provider group failed — record graceful error
        console.warn(`  ⚠ Provider group failed: ${result.reason}`);
        tests.push({
          id: `horizon-${dk}-provider-fail`,
          name: `${densityLabelsFull[dk]} — Provider Group Failure`,
          passed: false,
          type: 'comparative',
          metric: { name: 'provider_error', value: 0, unit: 'error' },
          detail: `Provider group failed: ${String(result.reason).slice(0, 120)}`,
        });
      }
    }
  }

  // --- Aggregate tests per density ---
  const mdAccuracy = densityTotals.markdown.total > 0
    ? densityTotals.markdown.correct / densityTotals.markdown.total : 0;
  const canonAccuracy = densityTotals.yon_canon.total > 0
    ? densityTotals.yon_canon.correct / densityTotals.yon_canon.total : 0;
  const minAccuracy = densityTotals.yon_min.total > 0
    ? densityTotals.yon_min.correct / densityTotals.yon_min.total : 0;

  for (const dk of densityKeys) {
    const { correct, total } = densityTotals[dk];
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    tests.push({
      id: `horizon-${dk}-overall`,
      name: `Cognitive Horizon Aggregate: ${densityLabelsFull[dk]}`,
      passed: true,
      type: 'comparative',
      metric: { name: `${dk}_avg_accuracy`, value: accuracy, unit: '%' },
      secondaryMetrics: [
        { name: 'correct', value: correct, unit: `/${total}` },
        { name: 'models', value: MODELS.length, unit: 'models' },
        { name: 'tokens', value: tokenCounts[dk], unit: 'approx' },
      ],
      detail: `Aggregate across ${MODELS.length} models: ${correct}/${total} (${accuracy}%) @ ~${tokenCounts[dk]} tokens`,
    });
  }

  // --- Density advantage test ---
  const densityAdvantage = Math.round((minAccuracy - mdAccuracy) * 100);

  tests.push({
    id: 'horizon-density-advantage',
    name: 'Cognitive Horizon: Density Advantage (min vs markdown)',
    passed: true,
    type: 'comparative',
    metric: { name: 'density_advantage', value: densityAdvantage, unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_min_accuracy', value: Math.round(minAccuracy * 100), unit: '%' },
      { name: 'markdown_accuracy', value: Math.round(mdAccuracy * 100), unit: '%' },
      { name: 'token_savings', value: Math.round((1 - tokenCounts.yon_min / tokenCounts.markdown) * 100), unit: '%' },
    ],
    detail: `YON min: ${Math.round(minAccuracy * 100)}% | MD: ${Math.round(mdAccuracy * 100)}% | Δ: ${densityAdvantage >= 0 ? '+' : ''}${densityAdvantage}pp | Savings: ${Math.round((1 - tokenCounts.yon_min / tokenCounts.markdown) * 100)}%`,
  });

  // --- Token efficiency test ---
  const mdEfficiency = tokenCounts.markdown > 0 ? (mdAccuracy * 100) / (tokenCounts.markdown / 1000) : 0;
  const canonEfficiency = tokenCounts.yon_canon > 0 ? (canonAccuracy * 100) / (tokenCounts.yon_canon / 1000) : 0;
  const minEfficiency = tokenCounts.yon_min > 0 ? (minAccuracy * 100) / (tokenCounts.yon_min / 1000) : 0;

  tests.push({
    id: 'horizon-token-efficiency',
    name: 'Cognitive Horizon: Token Efficiency',
    passed: true,
    type: 'measurement',
    metric: { name: 'yon_min_efficiency', value: Math.round(minEfficiency * 100) / 100, unit: 'acc%/1k-tok' },
    secondaryMetrics: [
      { name: 'markdown_efficiency', value: Math.round(mdEfficiency * 100) / 100, unit: 'acc%/1k-tok' },
      { name: 'yon_canon_efficiency', value: Math.round(canonEfficiency * 100) / 100, unit: 'acc%/1k-tok' },
    ],
    detail: `MD: ${mdEfficiency.toFixed(2)} | Canon: ${canonEfficiency.toFixed(2)} | Min: ${minEfficiency.toFixed(2)} acc%/1k-tok`,
  });

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'cognitive-horizon',
    suiteName: 'Cognitive Horizon (Extended Mind)',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runCognitiveHorizon };
