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
 * Quality-Adjusted Cost Suite
 *
 * Pillar: Cognitive Economy (cross-cutting)
 *
 * Measures cost per SUCCESSFUL outcome using pre-generated
 * YON vectors at 7 scale tiers (10–1000 lines) × 3 density modes
 * (canon, min, ultra) × 3 prose variants (verbose, clean, mixed).
 *
 * Architecture: Two-phase design for reproducibility and transparency.
 * - Phase A: generate-scale-vectors.ts runs encoder → saves .yon files to vectors/
 * - Phase B: This suite reads saved files, counts tokens, computes economics
 *
 * Primary comparison: YON vs natural language prose (same semantic content)
 * Formula: cost_per_outcome = tokens × price_per_token × (1 / success_rate)
 *
 * Tests:
 * 1. Scale Sweep — baseline curve from 10 to 1000 lines × 3 modes × 3 variants
 * 2. Retry Cost Amplification — break-even analysis at enterprise scale
 * 3. Multi-Turn Context Cost — compound savings over N conversation turns
 */

import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { get_encoding, type TiktokenEncoding } from 'tiktoken';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Pricing & Comprehension Data
// ---------------------------------------------------------------------------

interface ModelProfile {
  name: string;
  encoding: TiktokenEncoding;
  inputPer1M: number; // $ per 1M input tokens
}

const MODELS: ModelProfile[] = [
  { name: 'GPT-4o', encoding: 'o200k_base', inputPer1M: 2.5 },
  { name: 'GPT-4o-mini', encoding: 'o200k_base', inputPer1M: 0.15 },
  { name: 'Claude 3.5', encoding: 'cl100k_base', inputPer1M: 3.0 },
  { name: 'Gemini 2.0', encoding: 'cl100k_base', inputPer1M: 0.075 },
];

// Comprehension rates from benchmark evidence (pliability suite)
const COMPREHENSION_RATES = {
  yon: 0.87, // 87% comprehension accuracy (measured across 3 models)
  prose: 0.7, // NL prose comprehension baseline (from cognitive-load/density data)
};

// ---------------------------------------------------------------------------
// Token counter
// ---------------------------------------------------------------------------

function countTokens(text: string, encoding: TiktokenEncoding): number {
  const enc = get_encoding(encoding);
  const tokens = enc.encode(text);
  const count = tokens.length;
  enc.free();
  return count;
}

// ---------------------------------------------------------------------------
// Scale tiers & variants
// ---------------------------------------------------------------------------

interface ScaleTier {
  id: string;
  name: string;
  targetLines: number;
}

const SCALE_TIERS: ScaleTier[] = [
  { id: 'scale-chat', name: 'Chat', targetLines: 10 },
  { id: 'scale-snippet', name: 'Snippet', targetLines: 25 },
  { id: 'scale-prompt', name: 'Prompt', targetLines: 50 },
  { id: 'scale-system', name: 'System', targetLines: 100 },
  { id: 'scale-enterprise', name: 'Enterprise', targetLines: 200 },
  { id: 'scale-platform', name: 'Platform', targetLines: 500 },
  { id: 'scale-knowledge', name: 'Knowledge', targetLines: 1000 },
];

type DensityMode = 'canon' | 'min' | 'ultra';

type ProseVariant = 'verbose' | 'clean' | 'mixed';
const PROSE_VARIANTS: ProseVariant[] = ['verbose', 'clean', 'mixed'];

// ---------------------------------------------------------------------------
// Vector loader — reads pre-generated files from vectors/ directory
// Supports both old (flat) and new (multi-variant) directory structures
// ---------------------------------------------------------------------------

interface VariantVectors {
  variant: ProseVariant;
  prose: string;
  yon: Record<DensityMode, string>;
  available: boolean;
}

interface TierVectors {
  tier: ScaleTier;
  variants: VariantVectors[];
  available: boolean;
}

function loadVariant(tier: ScaleTier, variant: ProseVariant): VariantVectors {
  const vectorsDir = join(process.cwd(), 'vectors', tier.id, `v-${variant}`);

  const result: VariantVectors = {
    variant,
    prose: '',
    yon: { canon: '', min: '', ultra: '' },
    available: false,
  };

  const proseFile = join(vectorsDir, 'source.txt');
  if (!existsSync(proseFile)) return result;

  const canonFile = join(vectorsDir, 'canon.yon');
  const minFile = join(vectorsDir, 'min.yon');
  const ultraFile = join(vectorsDir, 'ultra.yon');

  if (!existsSync(canonFile) || !existsSync(minFile) || !existsSync(ultraFile)) return result;

  result.prose = readFileSync(proseFile, 'utf-8');
  result.yon.canon = readFileSync(canonFile, 'utf-8');
  result.yon.min = readFileSync(minFile, 'utf-8');
  result.yon.ultra = readFileSync(ultraFile, 'utf-8');
  result.available = true;

  return result;
}

function loadTierVectors(tier: ScaleTier): TierVectors {
  // Try new multi-variant structure first
  const variants = PROSE_VARIANTS.map(v => loadVariant(tier, v));
  const available = variants.filter(v => v.available);

  if (available.length > 0) {
    return { tier, variants: available, available: true };
  }

  // Fallback: old flat structure (vectors/scale-{tier}/source.txt)
  const flatDir = join(process.cwd(), 'vectors', tier.id);
  const proseFile = join(flatDir, 'source.txt');
  if (existsSync(proseFile) && existsSync(join(flatDir, 'canon.yon'))) {
    const fallback: VariantVectors = {
      variant: 'mixed',
      prose: readFileSync(proseFile, 'utf-8'),
      yon: {
        canon: readFileSync(join(flatDir, 'canon.yon'), 'utf-8'),
        min: readFileSync(join(flatDir, 'min.yon'), 'utf-8'),
        ultra: readFileSync(join(flatDir, 'ultra.yon'), 'utf-8'),
      },
      available: true,
    };
    return { tier, variants: [fallback], available: true };
  }

  return { tier, variants: [], available: false };
}

// ---------------------------------------------------------------------------
// Test 1: Scale Sweep — baseline curve across tiers × modes × variants
// ---------------------------------------------------------------------------

interface VariantPoint {
  variant: ProseVariant;
  proseLines: number;
  proseTokens: number;
  yonCanonTokens: number;
  yonMinTokens: number;
  yonUltraTokens: number;
  baselineCanon: number;
  baselineMin: number;
  baselineUltra: number;
}

interface ScalePoint {
  tier: string;
  targetLines: number;
  variantCount: number;
  // Per-variant data
  variants: VariantPoint[];
  // Aggregated across variants (avg of baseline)
  avgBaselineCanon: number;
  avgBaselineMin: number;
  avgBaselineUltra: number;
  // Range (shows variance from prose quality)
  rangeBaselineMin: [number, number]; // [best, worst]
  // Cost per successful outcome (using avg min tokens)
  avgMinTokens: number;
  avgProseTokens: number;
  bestModeCostPer1M: number;
  proseCostPer1M: number;
  yonWinsVsProse: boolean;
}

function testScaleSweep(): TestResult {
  const model = MODELS[0]!; // GPT-4o

  const allTiers = SCALE_TIERS.map(loadTierVectors);
  const available = allTiers.filter(t => t.available);

  if (available.length === 0) {
    return {
      id: 'scale-sweep',
      name: 'Scale Sweep (Structural Baseline Curve)',
      passed: false,
      metric: { name: 'available_tiers', value: 0, unit: 'tiers' },
      detail: 'No scale vectors found. Run: npx tsx src/scripts/generate-scale-vectors.ts',
    };
  }

  const points: ScalePoint[] = [];

  for (const t of available) {
    const variantPoints: VariantPoint[] = [];

    for (const v of t.variants) {
      const proseLines = v.prose.split('\n').filter(l => l.trim().length > 0).length;
      const proseTokens = countTokens(v.prose, model.encoding);
      const yonCanonTokens = countTokens(v.yon.canon, model.encoding);
      const yonMinTokens = countTokens(v.yon.min, model.encoding);
      const yonUltraTokens = countTokens(v.yon.ultra, model.encoding);

      variantPoints.push({
        variant: v.variant,
        proseLines,
        proseTokens,
        yonCanonTokens,
        yonMinTokens,
        yonUltraTokens,
        baselineCanon: Math.round(((yonCanonTokens - proseTokens) / proseTokens) * 100),
        baselineMin: Math.round(((yonMinTokens - proseTokens) / proseTokens) * 100),
        baselineUltra: Math.round(((yonUltraTokens - proseTokens) / proseTokens) * 100),
      });
    }

    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const avgBaselineCanon = avg(variantPoints.map(v => v.baselineCanon));
    const avgBaselineMin = avg(variantPoints.map(v => v.baselineMin));
    const avgBaselineUltra = avg(variantPoints.map(v => v.baselineUltra));

    const minBaselineMin = Math.min(...variantPoints.map(v => v.baselineMin));
    const maxBaselineMin = Math.max(...variantPoints.map(v => v.baselineMin));

    const avgMinTokens = avg(variantPoints.map(v => v.yonMinTokens));
    const avgProseTokens = avg(variantPoints.map(v => v.proseTokens));

    const bestModeCost = ((avgMinTokens / 1_000_000) * model.inputPer1M) / COMPREHENSION_RATES.yon;
    const proseCost = ((avgProseTokens / 1_000_000) * model.inputPer1M) / COMPREHENSION_RATES.prose;

    points.push({
      tier: t.tier.name,
      targetLines: t.tier.targetLines,
      variantCount: variantPoints.length,
      variants: variantPoints,
      avgBaselineCanon,
      avgBaselineMin,
      avgBaselineUltra,
      rangeBaselineMin: [minBaselineMin, maxBaselineMin],
      avgMinTokens,
      avgProseTokens,
      bestModeCostPer1M: Math.round(bestModeCost * 1_000_000 * 100) / 100,
      proseCostPer1M: Math.round(proseCost * 1_000_000 * 100) / 100,
      yonWinsVsProse: bestModeCost < proseCost,
    });
  }

  // Crossover point
  const crossover = points.find(p => p.yonWinsVsProse);
  const crossoverMsg = crossover
    ? `YON wins at ${crossover.tier} tier (avg ${crossover.variantCount} variants, min mode)`
    : 'YON does not achieve cost parity at any tested scale';

  const wins = points.filter(p => p.yonWinsVsProse).length;

  // Summary lines with variance ranges
  const curveLines = points.map(p => {
    const rangeStr = p.variantCount > 1
      ? ` [${p.rangeBaselineMin[0]}% to ${p.rangeBaselineMin[1]}%]`
      : '';
    return `${p.tier}: C=${p.avgBaselineCanon >= 0 ? '+' : ''}${p.avgBaselineCanon}% M=${p.avgBaselineMin >= 0 ? '+' : ''}${p.avgBaselineMin}%${rangeStr} U=${p.avgBaselineUltra >= 0 ? '+' : ''}${p.avgBaselineUltra}% ${p.yonWinsVsProse ? 'PASS' : 'FAIL'}`;
  });

  const enterprise = points.find(p => p.tier === 'Enterprise');
  const totalVariants = points.reduce((sum, p) => sum + p.variantCount, 0);

  return {
    id: 'scale-sweep',
    name: `Scale Sweep (${available.length} tiers × ${totalVariants} total variants, pre-generated)`,
    passed: true,
    type: 'comparative',
    metric: {
      name: 'avg_baseline_min_enterprise',
      value: enterprise?.avgBaselineMin ?? 0,
      unit: '% vs prose (avg min, Enterprise)',
      comparison: {
        baseline: points[0]?.avgBaselineMin ?? 0,
        baselineLabel: '% avg baseline at smallest tier (min)',
        delta: crossoverMsg,
      },
    },
    secondaryMetrics: [
      // Per-tier averages
      ...points.flatMap(p => [
        { name: `avg_prose_tok_${p.tier.toLowerCase()}`, value: p.avgProseTokens, unit: 'tokens (avg)' },
        { name: `avg_min_tok_${p.tier.toLowerCase()}`, value: p.avgMinTokens, unit: 'tokens (avg)' },
        { name: `avg_baseline_canon_${p.tier.toLowerCase()}`, value: p.avgBaselineCanon, unit: '% vs prose (avg)' },
        { name: `avg_baseline_min_${p.tier.toLowerCase()}`, value: p.avgBaselineMin, unit: '% vs prose (avg)' },
        { name: `avg_baseline_ultra_${p.tier.toLowerCase()}`, value: p.avgBaselineUltra, unit: '% vs prose (avg)' },
      ]),
      // Per-variant detail (for tiers with variants)
      ...points.flatMap(p =>
        p.variants.map(v => ({
          name: `${v.variant}_baseline_min_${p.tier.toLowerCase()}`,
          value: v.baselineMin,
          unit: `% vs prose (${v.variant})`,
        })),
      ),
      // Variance ranges (min mode)
      ...points.filter(p => p.variantCount > 1).map(p => ({
        name: `range_min_${p.tier.toLowerCase()}`,
        value: p.rangeBaselineMin[1] - p.rangeBaselineMin[0],
        unit: `% spread (${p.rangeBaselineMin[0]}% to ${p.rangeBaselineMin[1]}%)`,
      })),
      // Cost savings
      ...points.map(p => ({
        name: `cost_savings_${p.tier.toLowerCase()}`,
        value: Math.round(((p.proseCostPer1M - p.bestModeCostPer1M) / p.proseCostPer1M) * 100),
        unit: '% (positive = YON cheaper)',
      })),
      // Summary
      { name: 'tiers_evaluated', value: available.length, unit: 'tiers' },
      { name: 'total_variants', value: totalVariants, unit: 'variants' },
      { name: 'tiers_yon_wins', value: wins, unit: 'tiers' },
    ],
    detail: `${crossoverMsg}. ${curveLines.join(' | ')}`,
  };
}

// ---------------------------------------------------------------------------
// Test 2: Retry Cost Amplification (enterprise scale, across variants)
// ---------------------------------------------------------------------------

function testRetryCostAmplification(): TestResult {
  const model = MODELS[0]!;
  const enterprise = loadTierVectors(
    SCALE_TIERS.find(t => t.id === 'scale-enterprise')!,
  );

  if (!enterprise.available || enterprise.variants.length === 0) {
    return {
      id: 'retry-cost-amplification',
      name: 'Retry Cost Amplification',
      passed: false,
      metric: { name: 'available', value: 0, unit: 'tiers' },
      detail: 'Enterprise vectors not found. Run generate-scale-vectors.ts first.',
    };
  }

  // Average across all available variants
  const variantResults = enterprise.variants.map(v => {
    const yonTokens = countTokens(v.yon.min, model.encoding);
    const proseTokens = countTokens(v.prose, model.encoding);
    return { variant: v.variant, yonTokens, proseTokens };
  });

  const avgYonTokens = Math.round(variantResults.reduce((s, v) => s + v.yonTokens, 0) / variantResults.length);
  const avgProseTokens = Math.round(variantResults.reduce((s, v) => s + v.proseTokens, 0) / variantResults.length);

  const yonBaseCost = (avgYonTokens / 1_000_000) * model.inputPer1M;
  const proseBaseCost = (avgProseTokens / 1_000_000) * model.inputPer1M;

  const yonRetries = 1 / COMPREHENSION_RATES.yon - 1;
  const proseRetries = 1 / COMPREHENSION_RATES.prose - 1;

  const yonTotalCost = yonBaseCost * (1 + yonRetries);
  const proseTotalCost = proseBaseCost * (1 + proseRetries);

  const breakEvenRetries = yonTotalCost / proseBaseCost - 1;
  const breakEvenRetryPct = Math.round(breakEvenRetries * 100);

  const savingsPct = Math.round(((proseTotalCost - yonTotalCost) / proseTotalCost) * 100);
  const tokenSavingsPct = Math.round(((avgProseTokens - avgYonTokens) / avgProseTokens) * 100);

  return {
    id: 'retry-cost-amplification',
    name: `Retry Cost Amplification (Enterprise, Min, ${variantResults.length} variants)`,
    passed: true,
    type: 'comparative',
    metric: {
      name: 'net_savings_with_retries',
      value: savingsPct,
      unit: '% savings (positive = YON cheaper)',
      comparison: {
        baseline: Math.round(proseRetries * 100),
        baselineLabel: 'Prose retry rate (%)',
        delta: `Prose retries ${Math.round(proseRetries * 100)}% vs break-even ${breakEvenRetryPct}%`,
      },
    },
    secondaryMetrics: [
      // Per-variant token counts
      ...variantResults.map(v => ({
        name: `${v.variant}_yon_min_tokens`,
        value: v.yonTokens,
        unit: 'tokens',
      })),
      ...variantResults.map(v => ({
        name: `${v.variant}_prose_tokens`,
        value: v.proseTokens,
        unit: 'tokens',
      })),
      // Averages
      { name: 'avg_yon_min_tokens', value: avgYonTokens, unit: 'tokens (avg)' },
      { name: 'avg_prose_tokens', value: avgProseTokens, unit: 'tokens (avg)' },
      { name: 'token_savings_pct', value: tokenSavingsPct, unit: '% savings vs prose (avg, positive = YON smaller)' },
      { name: 'variants_count', value: variantResults.length, unit: 'variants' },
      { name: 'yon_avg_retries', value: Math.round(yonRetries * 1000) / 1000, unit: 'retries/call' },
      { name: 'prose_avg_retries', value: Math.round(proseRetries * 1000) / 1000, unit: 'retries/call' },
      { name: 'yon_total_cost_1m', value: Math.round(yonTotalCost * 1_000_000 * 100) / 100, unit: '$/1M calls' },
      { name: 'prose_total_cost_1m', value: Math.round(proseTotalCost * 1_000_000 * 100) / 100, unit: '$/1M calls' },
      { name: 'break_even_retry_rate', value: breakEvenRetryPct, unit: '%' },
    ],
    detail: `Enterprise (avg ${variantResults.length} variants, min format). YON: ${avgYonTokens} tok, Prose: ${avgProseTokens} tok (${tokenSavingsPct}% savings). Net cost savings with retries: ${savingsPct}%. Break-even: prose needs ≥${breakEvenRetryPct}% retries.`,
  };
}

// ---------------------------------------------------------------------------
// Test 3: Multi-Turn Context Cost (enterprise scale, across variants)
// ---------------------------------------------------------------------------

function testMultiTurnContextCost(): TestResult {
  const model = MODELS[0]!;
  const enterprise = loadTierVectors(
    SCALE_TIERS.find(t => t.id === 'scale-enterprise')!,
  );

  if (!enterprise.available || enterprise.variants.length === 0) {
    return {
      id: 'multi-turn-context-cost',
      name: 'Multi-Turn Context Cost',
      passed: false,
      metric: { name: 'available', value: 0, unit: 'tiers' },
      detail: 'Enterprise vectors not found. Run generate-scale-vectors.ts first.',
    };
  }

  // Average across variants
  const variantData = enterprise.variants.map(v => ({
    variant: v.variant,
    yonTokens: countTokens(v.yon.min, model.encoding),
    proseTokens: countTokens(v.prose, model.encoding),
  }));

  const avgYonTokens = Math.round(variantData.reduce((s, v) => s + v.yonTokens, 0) / variantData.length);
  const avgProseTokens = Math.round(variantData.reduce((s, v) => s + v.proseTokens, 0) / variantData.length);

  const turns = [1, 3, 5, 10];
  const historyPerTurn = 200;

  const projections = turns.map(n => {
    const yonTotal = n * avgYonTokens + (n * (n - 1) * historyPerTurn) / 2;
    const proseTotal = n * avgProseTokens + (n * (n - 1) * historyPerTurn) / 2;

    const yonCost = (yonTotal / 1_000_000) * model.inputPer1M * 1_000_000;
    const proseCost = (proseTotal / 1_000_000) * model.inputPer1M * 1_000_000;
    const savingsPct = Math.round(((proseCost - yonCost) / proseCost) * 100);

    return { turns: n, yonTotal, proseTotal, yonCost, proseCost, savingsPct };
  });

  const at5 = projections.find(p => p.turns === 5)!;
  const at10 = projections.find(p => p.turns === 10)!;

  return {
    id: 'multi-turn-context-cost',
    name: `Multi-Turn Context Cost (Enterprise, Min, ${variantData.length} variants avg)`,
    passed: true,
    type: 'comparative',
    metric: {
      name: 'savings_vs_prose_5_turn',
      value: at5.savingsPct,
      unit: '% savings at 5 turns (positive = YON cheaper)',
      comparison: {
        baseline: Math.round(at5.proseCost * 100) / 100,
        baselineLabel: 'Prose cost ($/1M 5-turn sessions)',
        delta: `${at5.savingsPct}% savings at 5 turns, ${at10.savingsPct}% at 10 turns`,
      },
    },
    secondaryMetrics: [
      // Per-variant base tokens
      ...variantData.map(v => ({
        name: `${v.variant}_yon_base_tokens`,
        value: v.yonTokens,
        unit: 'tokens/turn',
      })),
      ...variantData.map(v => ({
        name: `${v.variant}_prose_base_tokens`,
        value: v.proseTokens,
        unit: 'tokens/turn',
      })),
      // Turn projections
      ...projections.map(p => ({
        name: `savings_${p.turns}t`,
        value: p.savingsPct,
        unit: '% savings',
      })),
      { name: 'avg_base_token_savings', value: Math.round(((avgProseTokens - avgYonTokens) / avgProseTokens) * 100), unit: '% savings vs prose/turn' },
      { name: 'variants_count', value: variantData.length, unit: 'variants' },
    ],
    detail:
      projections
        .map(p => `${p.turns}T: YON=${p.yonTotal}tok Prose=${p.proseTotal}tok (${p.savingsPct}% savings)`)
        .join('. ') + '.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runQualityAdjustedCost(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testScaleSweep(),
    testRetryCostAmplification(),
    testMultiTurnContextCost(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'quality-adjusted-cost',
    suiteName: 'Quality-Adjusted Cost',
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
