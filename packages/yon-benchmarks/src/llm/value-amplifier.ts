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
 * Value Amplifier Suite — Multi-Tier, Multi-Model
 *
 * Pillar: Sapir-Whorf (Thesis P0)
 * Axis: Real-world cost savings
 *
 * The CTO question: "When does YON pay for itself?"
 *
 * Full document comparison: NL vs Canon vs Canon+Card vs Min vs Ultra vs Cold (no preamble)
 * across all available models (budget/standard/premium).
 *
 * Tier-grouped reporting shows the Value Amplifier hypothesis:
 * weaker (cheaper) models benefit MORE from structured input.
 *
 * Pricing sourced from @younndai/ai-relay model registry.
 *
 * Requires: At least one LLM API key in .env.local
 */

import { getActiveModels, createFullTierModels, askModel, type ModelConfig } from '../core/models.js';
import { loadVector } from '../core/vectors.js';
import { countTokens } from '../core/tokens.js';
import { startTimer, localTimestamp, calculateCost } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

const EST_OUTPUT_TOKENS = 100;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Dataset {
  id: string;
  name: string;
  dir: string;
  nlFile: string;
  canonFile: string;
  minFile: string;
  ultraFile: string;
  questionsFile: string;
}

interface Question {
  id: number;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATASETS: Dataset[] = [
  { id: 'financial', name: 'Financial Compliance', dir: 'rag-context', nlFile: 'rules-nl.txt', canonFile: 'canon.yon', minFile: 'min.yon', ultraFile: 'ultra.yon', questionsFile: 'questions.json' },
  { id: 'api-design', name: 'API Design', dir: 'rag-api-design', nlFile: 'rules-nl.txt', canonFile: 'canon.yon', minFile: 'min.yon', ultraFile: 'ultra.yon', questionsFile: 'questions.json' },
  { id: 'security', name: 'Security Policy', dir: 'rag-security', nlFile: 'rules-nl.txt', canonFile: 'canon.yon', minFile: 'min.yon', ultraFile: 'ultra.yon', questionsFile: 'questions.json' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreAnswers(response: string, questions: Question[]): number {
  const lines = response.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  let correct = 0;
  for (const q of questions) {
    // Match by question ID prefix (e.g. "1." or "1:") — robust to formatting
    const prefix = String(q.id);
    const match = lines.find((l) =>
      l.startsWith(prefix + '.') || l.startsWith(prefix + ':') || l.startsWith(prefix + ')'),
    );
    if (match && match.toLowerCase().includes(q.answer.toLowerCase())) correct++;
  }
  return correct;
}



/** Calculate cost using ai-relay registry pricing (per-1M handled internally). */
function modelCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
  // Strip tier suffix (e.g. "(budget)") from model ID for registry lookup
  const registryId = model.id.replace(/\s*\(.*\)$/, '');
  return calculateCost(registryId, inputTokens, outputTokens);
}

/**
 * YON reading instructions — teaches the LLM how to read YON notation.
 * This is the "winning combo" preamble from the Borges Warning suite,
 * tailored for the cost-comparison datasets (rules/compliance).
 */
const YON_READING_PREAMBLE = [
  'The following document uses YON notation.',
  '@SEC defines sections. @RULE defines requirements (lvl=MUST/MUST_NOT/MAY, then=requirement text).',
  '@NOTE provides additional context. Read the document and answer the questions below.',
].join(' ');

/**
 * Full READ Card — teaches models all 27 L1-L2 YON tags.
 * Simulates `guide=` URL resolution from @DOC spec (document.md L66).
 */
const READ_CARD = loadVector('cards', 'read-card.txt');

// ---------------------------------------------------------------------------
// Test: Full document comparison (NL vs Canon vs Min vs Ultra vs Cold)
// ---------------------------------------------------------------------------

async function testFullDocument(models: ModelConfig[]): Promise<TestResult> {
  const elapsed = startTimer();

  // 6 formats: NL baseline + 4 instructed YON levels + 1 cold (no preamble)
  // canon_card = Canon YON + full READ Card as system prompt (simulates guide= URL resolution)
  // min_cold = "training data gap" — measures native LLM readability without instructions.
  // As YON enters training corpora, the min_cold→min delta should shrink.
  type FormatKey = 'nl' | 'canon' | 'canon_card' | 'min' | 'ultra' | 'min_cold';
  const FORMAT_ORDER: FormatKey[] = ['nl', 'canon', 'canon_card', 'min', 'ultra', 'min_cold'];

  const totals: Record<FormatKey, number> = { nl: 0, canon: 0, canon_card: 0, min: 0, ultra: 0, min_cold: 0 };
  let totalQuestions = 0;
  const modelDetails: string[] = [];

  type FormatStats = { correct: number; total: number; tokens: number; cost: number };
  const perModel: Record<string, Record<FormatKey, FormatStats>> = {};

  // Run all models in parallel — they are independent
  type ModelResult = {
    model: ModelConfig;
    scores: Record<FormatKey, number>;
    mTotal: number;
    tokens: Record<FormatKey, number>;
  };

  const modelPromises = models.map(async (model): Promise<ModelResult | null> => {
    console.log(`    \u25b8 Full tier: ${model.name}...`);
    try {
      const scores: Record<FormatKey, number> = { nl: 0, canon: 0, canon_card: 0, min: 0, ultra: 0, min_cold: 0 };
      const tokens: Record<FormatKey, number> = { nl: 0, canon: 0, canon_card: 0, min: 0, ultra: 0, min_cold: 0 };
      let mTotal = 0;

      for (const ds of DATASETS) {
        const nl = loadVector(ds.dir, ds.nlFile);
        const canon = loadVector(ds.dir, ds.canonFile);
        const min = loadVector(ds.dir, ds.minFile);
        const ultra = loadVector(ds.dir, ds.ultraFile);
        const questions: Question[] = JSON.parse(loadVector(ds.dir, ds.questionsFile));

        // Each format at its full, natural size — real-world usage
        const contents: Record<FormatKey, string> = {
          nl,
          canon,
          canon_card: canon,
          min,
          ultra,
          min_cold: min,
        };

        const qBlock = questions.map((q) => q.id + '. ' + q.question).join('\n');

        // NL prompt (no special preamble)
        const nlPrompt = 'Answer using ONLY this context. If unknown, say "NOT FOUND". 1-10 words each.\n\n' + contents.nl + '\n\n' + qBlock;

        // YON prompts (with mini reading instructions)
        const makeYonPrompt = (content: string) =>
          YON_READING_PREAMBLE + '\n\n' + content + '\n\n' + qBlock +
          '\nAnswer 1-10 words each. If unknown, say "NOT FOUND".';

        // Canon+Card prompt — full READ Card as preamble (simulates guide= URL)
        const makeCardPrompt = (content: string) =>
          READ_CARD + '\n\n---\n\nUsing the YON notation rules above, read the following document and answer the questions.\n\n' +
          content + '\n\n' + qBlock +
          '\nAnswer 1-10 words each. If unknown, say "NOT FOUND".';

        // Cold prompt — no YON preamble, same generic instruction as NL
        const coldPrompt = 'Answer using ONLY this context. If unknown, say "NOT FOUND". 1-10 words each.\n\n' + contents.min + '\n\n' + qBlock;

        // Fire all 5 format calls in parallel per dataset
        const [nlResp, canonResp, canonCardResp, minResp, ultraResp, coldResp] = await Promise.all([
          askModel(model, nlPrompt),
          askModel(model, makeYonPrompt(contents.canon)),
          askModel(model, makeCardPrompt(contents.canon_card)),
          askModel(model, makeYonPrompt(contents.min)),
          askModel(model, makeYonPrompt(contents.ultra)),
          askModel(model, coldPrompt),
        ]);

        scores.nl += scoreAnswers(nlResp, questions);
        scores.canon += scoreAnswers(canonResp, questions);
        scores.canon_card += scoreAnswers(canonCardResp, questions);
        scores.min += scoreAnswers(minResp, questions);
        scores.ultra += scoreAnswers(ultraResp, questions);
        scores.min_cold += scoreAnswers(coldResp, questions);
        mTotal += questions.length;

        tokens.nl += countTokens(contents.nl);
        tokens.canon += countTokens(contents.canon);
        tokens.canon_card += countTokens(contents.canon_card) + countTokens(READ_CARD);
        tokens.min += countTokens(contents.min);
        tokens.ultra += countTokens(contents.ultra);
        tokens.min_cold += countTokens(contents.min);
      }

      const pcts = Object.fromEntries(
        FORMAT_ORDER.map((k) => [k, mTotal > 0 ? Math.round((scores[k] / mTotal) * 100) : 0]),
      ) as Record<FormatKey, number>;
      const bestYon = Math.max(pcts.canon, pcts.canon_card, pcts.min, pcts.ultra);
      const bestDelta = bestYon - pcts.nl;
      const coldGap = pcts.min - pcts.min_cold;
      const cardUplift = pcts.canon_card - pcts.canon;
      console.log(`      \u2713 ${model.name}: NL ${pcts.nl}% | Canon ${pcts.canon}% | Canon+Card ${pcts.canon_card}% | Min ${pcts.min}% | Ultra ${pcts.ultra}% | Cold ${pcts.min_cold}% (\u0394best ${bestDelta >= 0 ? '+' : ''}${bestDelta}pp, card-uplift ${cardUplift >= 0 ? '+' : ''}${cardUplift}pp, training-gap ${coldGap}pp)`);

      return { model, scores, mTotal, tokens };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`      \u2717 ${model.name} SKIPPED: ${msg.slice(0, 100)}`);
      modelDetails.push(`${model.name}: SKIPPED (${msg.slice(0, 60)})`);
      return null;
    }
  });

  const results = await Promise.allSettled(modelPromises);

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { model, scores, mTotal, tokens: mTokens } = result.value;

    const fmtStats: Record<FormatKey, FormatStats> = {} as any;
    for (const fmt of FORMAT_ORDER) {
      fmtStats[fmt] = {
        correct: scores[fmt],
        total: mTotal,
        tokens: mTokens[fmt],
        cost: modelCost(model, mTokens[fmt], EST_OUTPUT_TOKENS * DATASETS.length),
      };
      totals[fmt] += scores[fmt];
    }
    perModel[model.id] = fmtStats;
    totalQuestions += mTotal;

    const pcts = Object.fromEntries(
      FORMAT_ORDER.map((k) => [k, Math.round((scores[k] / mTotal) * 100)]),
    ) as Record<FormatKey, number>;
    modelDetails.push(
      `${model.name}: NL ${pcts.nl}% | Canon ${pcts.canon}% | Canon+Card ${pcts.canon_card}% | Min ${pcts.min}% | Ultra ${pcts.ultra}% | Cold ${pcts.min_cold}%`,
    );
  }

  const durationMs = elapsed();
  const pctTotals = Object.fromEntries(
    FORMAT_ORDER.map((k) => [k, totalQuestions > 0 ? Math.round((totals[k] / totalQuestions) * 100) : 0]),
  ) as Record<FormatKey, number>;
  const bestYonAcc = Math.max(pctTotals.canon, pctTotals.canon_card, pctTotals.min, pctTotals.ultra);
  const bestDelta = bestYonAcc - pctTotals.nl;

  const secondaryMetrics = [
    ...FORMAT_ORDER.map((k) => ({ name: `${k}_accuracy`, value: pctTotals[k], unit: '%' })),
    { name: 'canon_delta', value: pctTotals.canon - pctTotals.nl, unit: 'pp' },
    { name: 'canon_card_delta', value: pctTotals.canon_card - pctTotals.nl, unit: 'pp' },
    { name: 'card_uplift', value: pctTotals.canon_card - pctTotals.canon, unit: 'pp' },
    { name: 'min_delta', value: pctTotals.min - pctTotals.nl, unit: 'pp' },
    { name: 'ultra_delta', value: pctTotals.ultra - pctTotals.nl, unit: 'pp' },
    { name: 'training_data_gap', value: pctTotals.min - pctTotals.min_cold, unit: 'pp' },
    { name: 'models_tested', value: models.length, unit: 'models' },
    { name: 'budget_ratio', value: 100, unit: '%' },
    { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
  ];

  // Per-model metrics
  for (const model of models) {
    const data = perModel[model.id];
    if (!data) continue;
    for (const fmt of FORMAT_ORDER) {
      const acc = Math.round((data[fmt].correct / data[fmt].total) * 100);
      secondaryMetrics.push(
        { name: `${model.id}_${fmt}_acc`, value: acc, unit: '%' },
        { name: `${model.id}_${fmt}_cost`, value: Math.round(data[fmt].cost * 100000) / 100, unit: '$/100K' },
      );
    }
  }

  return {
    id: 'cost-tier-full',
    name: `Full Document Cost (${models.length} models, 3 domains, 6 formats)`,
    passed: true,
    type: 'measurement',
    metric: { name: 'best_yon_delta', value: bestDelta, unit: 'pp' },
    secondaryMetrics,
    detail: `Full: NL ${pctTotals.nl}% | Canon ${pctTotals.canon}% | Canon+Card ${pctTotals.canon_card}% | Min ${pctTotals.min}% | Ultra ${pctTotals.ultra}% | Cold ${pctTotals.min_cold}%. Best YON \u0394${bestDelta >= 0 ? '+' : ''}${bestDelta}pp. Card uplift: ${pctTotals.canon_card - pctTotals.canon}pp. Training gap: ${pctTotals.min - pctTotals.min_cold}pp. ${modelDetails.join('. ')}`,
    outcome: bestDelta > 5 ? 'advantage' : bestDelta < -5 ? 'disadvantage' : 'tied',
  };
}


// ---------------------------------------------------------------------------
// Test: Compression Value — canon vs min vs ultra vs NL (accuracy per token)
// ---------------------------------------------------------------------------

/**
 * Compression value test comparing token-reduced format variants to prose.
 *
 * YON's format modes (canon → min → ultra) apply token reduction techniques
 * (§4 T1–T7) to progressively increase density. For each variant, measures:
 * - Token count (input size)
 * - Accuracy (questions answered correctly)
 * - Accuracy per 1K tokens (the efficiency metric)
 *
 * If min.yon achieves equal accuracy at fewer tokens, that is an instant
 * cost savings — every LLM call is cheaper. This is the CTO metric.
 */
async function testCompressionValue(models: ModelConfig[]): Promise<TestResult> {
  const elapsed = startTimer();

  interface FormatResult {
    format: string;
    tokens: number;
    correct: number;
    total: number;
    accuracy: number;
    accPerKTok: number;
  }

  const formatFiles: Array<{ format: string; file: keyof Dataset; preamble?: string }> = [
    { format: 'NL Prose', file: 'nlFile' },
    { format: 'YON Canon', file: 'canonFile' },
    { format: 'YON Min', file: 'minFile' },
    { format: 'YON Min+Card', file: 'minFile', preamble: READ_CARD },
    { format: 'YON Ultra', file: 'ultraFile' },
  ];

  // Iterate ALL datasets (3 domains × 8 questions = 24 total)
  const formatResults: FormatResult[] = [];
  const perModelLines: string[] = [];

  for (const { format, file, preamble } of formatFiles) {
    let totalTokens = 0;
    let totalCorrect = 0;
    let totalQ = 0;
    let modelRuns = 0;

    for (const ds of DATASETS) {
      const content = loadVector(ds.dir, ds[file]);
      const tokens = countTokens(content);
      const isYon = ds[file].endsWith('.yon');
      const preambleText = preamble ?? (isYon ? YON_READING_PREAMBLE : '');
      const effectiveTokens = preambleText ? tokens + countTokens(preambleText) : tokens;
      const questions: Question[] = JSON.parse(loadVector(ds.dir, ds.questionsFile));

      totalTokens += effectiveTokens;
      totalQ += questions.length;

      // Fire all models in parallel per format × dataset
      const settled = await Promise.allSettled(
        models.map(async (model) => {
          const qBlock = questions.map((q) => q.id + '. ' + q.question).join('\n');
          const prefix = preambleText ? preambleText + '\n\n' : '';
          const prompt = prefix + 'Answer using ONLY this context. If unknown, say "NOT FOUND". 1-10 words each.\n\n' + content + '\n\n' + qBlock;
          const response = await askModel(model, prompt);
          return scoreAnswers(response, questions);
        }),
      );
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          totalCorrect += r.value;
          modelRuns++;
        }
      }
    }

    // Average tokens across datasets for per-entry metric
    const avgTokens = DATASETS.length > 0 ? Math.round(totalTokens / DATASETS.length) : 0;
    // Normalize totalCorrect to per-model average: totalCorrect sums across all models,
    // totalQ only counts questions per dataset. Divide by modelRuns/DATASETS.length to get
    // the effective model count, producing a per-model-average accuracy.
    const effectiveModelCount = DATASETS.length > 0 ? modelRuns / DATASETS.length : 1;
    const normalizedCorrect = effectiveModelCount > 0 ? totalCorrect / effectiveModelCount : 0;
    const accuracy = totalQ > 0 ? Math.round((normalizedCorrect / totalQ) * 100) : 0;
    const accPerKTok = avgTokens > 0 ? Math.round((accuracy / avgTokens) * 1000 * 100) / 100 : 0;
    formatResults.push({ format, tokens: avgTokens, correct: Math.round(normalizedCorrect), total: totalQ, accuracy, accPerKTok });
    perModelLines.push(`${format}: ${accuracy}% @ ${avgTokens}tok (${accPerKTok} acc/1Ktok)`);
  }

  const durationMs = elapsed();

  // Find the best efficiency (accuracy per 1K tokens)
  const sorted = [...formatResults].sort((a, b) => b.accPerKTok - a.accPerKTok);
  const best = sorted[0]!;
  const nlResult = formatResults.find(f => f.format === 'NL Prose')!;

  const secondaryMetrics = formatResults.flatMap(f => [
    { name: f.format.toLowerCase().replace(/\s+/g, '_').replace(/\+/g, '_') + '_tokens', value: f.tokens, unit: 'tokens' },
    { name: f.format.toLowerCase().replace(/\s+/g, '_').replace(/\+/g, '_') + '_accuracy_avg', value: f.accuracy, unit: '%' },
    { name: f.format.toLowerCase().replace(/\s+/g, '_').replace(/\+/g, '_') + '_efficiency', value: f.accPerKTok, unit: 'acc/1Ktok' },
  ]);
  secondaryMetrics.push(
    { name: 'models_tested', value: models.length, unit: 'models' },
    { name: 'datasets_tested', value: DATASETS.length, unit: 'datasets' },
    { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
  );

  // Token savings of best YON variant vs NL
  const bestYon = sorted.find(f => f.format.startsWith('YON'))!;
  const tokenSavingPct = nlResult.tokens > 0 ? Math.round((1 - bestYon.tokens / nlResult.tokens) * 100) : 0;

  // Scaled cost projections — at higher budgets, card overhead amortizes
  const minCardResult = formatResults.find(f => f.format === 'YON Min+Card');
  if (minCardResult && nlResult.accuracy > 0) {
    const cardOverhead = countTokens(READ_CARD);
    for (const budgetK of [10, 100]) {
      const budgetTokens = budgetK * 1000;
      // NL: budget / nlTokensPerDoc entries
      const nlEntries = nlResult.tokens > 0 ? Math.floor(budgetTokens / nlResult.tokens) : 0;
      // Min+Card: card once + budget / minTokensPerDoc entries
      const minBase = formatResults.find(f => f.format === 'YON Min')!;
      const minEntries = minBase.tokens > 0 ? Math.floor((budgetTokens - cardOverhead) / minBase.tokens) : 0;
      secondaryMetrics.push(
        { name: `nl_entries_at_${budgetK}k`, value: nlEntries, unit: 'docs' },
        { name: `min_card_entries_at_${budgetK}k`, value: minEntries, unit: 'docs' },
      );
    }
  }

  const summary = formatResults.map(f =>
    `${f.format}: ${f.accuracy}% @ ${f.tokens}tok (${f.accPerKTok} acc/1Ktok)`
  ).join(' | ');

  return {
    id: 'compression-value',
    name: `Compression Value Analysis (${models.length} models, ${DATASETS.length} datasets, 5 formats)`,
    passed: true,
    type: 'measurement',
    metric: { name: 'best_efficiency', value: best.accPerKTok, unit: 'acc/1Ktok' },
    secondaryMetrics,
    detail: `Best efficiency: ${best.format} (${best.accPerKTok} acc/1Ktok). ` +
      `Token savings: ${bestYon.format} uses ${tokenSavingPct}% fewer tokens than NL. ` +
      summary,
    outcome: bestYon.accPerKTok > nlResult.accPerKTok ? 'advantage' : bestYon.accPerKTok < nlResult.accPerKTok ? 'disadvantage' : 'tied',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  let models = createFullTierModels();
  // Fall back to standard models if no tier-based models available
  if (models.length === 0) models = getActiveModels(true);
  if (models.length === 0) {
    return {
      suiteId: 'value-amplifier',
      suiteName: 'Value Amplifier (Multi-Tier, Multi-Model)',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  // Full document comparison — the only real-world test condition
  tests.push(await testFullDocument(models));

  // Tier-grouped analysis — Value Amplifier hypothesis
  const tierGroups: Array<{ tier: 'budget' | 'standard' | 'premium'; label: string }> = [
    { tier: 'budget', label: 'Budget' },
    { tier: 'standard', label: 'Standard' },
    { tier: 'premium', label: 'Premium' },
  ];

  const tierDeltas: Array<{ tier: string; delta: number }> = [];

  for (const { tier, label } of tierGroups) {
    const tierModels = models.filter((m) => m.id.includes(`(${tier})`));
    if (tierModels.length === 0) continue;

    // Run full doc only for tier analysis (budgetRatio 1.0)
    let totalNl = 0;
    let totalYon = 0;
    let totalQ = 0;

    // Parallelize models within tier
    const tierResults = await Promise.allSettled(tierModels.map(async (model) => {
      console.log(`    ▸ Tier amplifier (${label}): ${model.name}...`);
      let mNl = 0, mYon = 0, mQ = 0;
      for (const ds of DATASETS) {
        const nl = loadVector(ds.dir, ds.nlFile);
        const yon = loadVector(ds.dir, ds.canonFile);
        const questions: Question[] = JSON.parse(loadVector(ds.dir, ds.questionsFile));

        const qBlock = questions.map((q) => q.id + '. ' + q.question).join('\n');
        const nlResponse = await askModel(model, 'Answer using ONLY this context. If unknown, say "NOT FOUND". 1-10 words each.\n\n' + nl + '\n\n' + qBlock);
        const yonResponse = await askModel(model, YON_READING_PREAMBLE + '\n\n' + yon + '\n\n' + qBlock + '\nAnswer 1-10 words each. If unknown, say "NOT FOUND".');

        mNl += scoreAnswers(nlResponse, questions);
        mYon += scoreAnswers(yonResponse, questions);
        mQ += questions.length;
      }
      return { mNl, mYon, mQ };
    }));

    for (const r of tierResults) {
      if (r.status === 'fulfilled') {
        totalNl += r.value.mNl;
        totalYon += r.value.mYon;
        totalQ += r.value.mQ;
      } else {
        console.warn(`      ✗ Tier amplifier (${label}) model SKIPPED: ${String(r.reason).slice(0, 100)}`);
      }
    }

    const nlAcc = totalQ > 0 ? Math.round((totalNl / totalQ) * 100) : 0;
    const yonAcc = totalQ > 0 ? Math.round((totalYon / totalQ) * 100) : 0;
    const delta = yonAcc - nlAcc;
    tierDeltas.push({ tier: label, delta });

    tests.push({
      id: `tier-amplifier-${tier}`,
      name: `${label} Tier Amplifier (${tierModels.length} models)`,
      passed: true,
      type: 'measurement',
      metric: { name: `${tier}_tier_delta`, value: delta, unit: 'pp' },
      secondaryMetrics: [
        { name: 'nl_accuracy', value: nlAcc, unit: '%' },
        { name: 'yon_accuracy', value: yonAcc, unit: '%' },
        { name: 'models_in_tier', value: tierModels.length, unit: 'models' },
      ],
      detail: `${label}: YON ${yonAcc}% vs NL ${nlAcc}% (Δ${delta > 0 ? '+' : ''}${delta}pp, ${tierModels.length} models)`,
      outcome: delta > 5 ? 'advantage' : delta < -5 ? 'disadvantage' : 'tied',
    });
  }

  // Gradient test — does budget Δ > standard Δ > premium Δ?
  if (tierDeltas.length >= 2) {
    const gradientCorrect = tierDeltas.every((td, i) =>
      i === 0 || td.delta <= tierDeltas[i - 1]!.delta,
    );
    tests.push({
      id: 'value-amplifier-gradient',
      name: 'Value Amplifier Gradient (budget > standard > premium)',
      passed: true,
      type: 'measurement',
      metric: { name: 'gradient_holds', value: gradientCorrect ? 1 : 0, unit: 'bool' },
      secondaryMetrics: tierDeltas.map((td) => ({
        name: `${td.tier.toLowerCase()}_delta`, value: td.delta, unit: 'pp',
      })),
      detail: `Gradient: ${tierDeltas.map((td) => `${td.tier}=${td.delta}pp`).join(' > ')}. ${gradientCorrect ? 'Hypothesis HOLDS' : 'Hypothesis FAILS'}`,
    });
  }

  // Compression value test (canon vs min vs ultra vs NL)
  tests.push(await testCompressionValue(models));

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'value-amplifier',
    suiteName: 'Value Amplifier (Multi-Tier, Multi-Model)',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runValueAmplifier };

