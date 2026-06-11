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
 * Model Scorecard Generator
 *
 * Aggregates per-model data from LLM benchmark suites into
 * a comprehensive scorecard report: one section per model.
 *
 * Data sources:
 * - Comprehension: pliability suite (YON/JSON/NL scores /10)
 * - Trap Resistance: format-traps suite (scores /12)
 * - Generation: multi-model-generation suite (valid/invalid)
 * - Value Amplifier: value-amplifier suite (NL vs YON accuracy deltas)
 * - Pricing: MODEL_REGISTRY (static)
 *
 * Only renders fields with real backing data. Never renders N/A.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { MODEL_REGISTRY, type ModelEntry } from '@younndai/ai-relay';
import { getActiveProviders } from '../core/env.js';
import type { BenchmarkResult } from '../core/types.js';
import { VOICE_RULES } from './voice.js';

/** Get the best available model for enrichment. */
function getEnrichmentModel() {
  const active = getActiveProviders();
  if (active.length === 0) return null;
  if (active.includes('openai')) return openai('gpt-4o');
  if (active.includes('anthropic')) return anthropic('claude-haiku-4-5');
  if (active.includes('google')) return google('gemini-2.5-flash');
  return null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelScorecard {
  /** Model display name */
  name: string;
  /** Provider */
  provider: string;
  /** Registry entry */
  registryEntry?: ModelEntry;
  /** YON comprehension (/10) — from pliability */
  yonComprehension: number | null;
  /** JSON comprehension (/10) — from pliability */
  jsonComprehension: number | null;
  /** Trap resistance (/12) — from format-traps */
  trapScore: number | null;
  /** Generation valid — from multi-model-generation */
  generationValid: boolean | null;
  /** NL accuracy (%) — from value-amplifier */
  nlAccuracy: number | null;
  /** YON accuracy (%) — from value-amplifier */
  yonAccuracy: number | null;
  /** Value delta (pp) — from value-amplifier */
  valueDelta: number | null;
  /** Cost per 1M tokens */
  costPer1M: { input: number; output: number } | null;
  /** Number of suites this model appeared in */
  suitesPresent: number;
  /** Raw metrics collected */
  rawMetrics: Array<{ suite: string; metric: string; value: number; unit: string }>;
  /** LLM-generated narrative insight for this model */
  insight?: string;
}

/** Run-level metadata displayed at the top of scorecards. */
export interface RunMetadata {
  durationMs: number;
  suiteCount: number;
  testCount: number;
  passRate: number;
}

// ---------------------------------------------------------------------------
// Metric Extraction
// ---------------------------------------------------------------------------

/** Normalize model name for matching. */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s_-]+/g, '');
}

/** Guard: reject if a LONGER model name from MODEL_KEYS also matches this metric. */
function isPartialModelMatch(
  normMetricName: string,
  normModelName: string,
  allModelNames: string[],
): boolean {
  const allNorms = allModelNames.map(normalize);
  return allNorms.some(
    longer => longer !== normModelName
      && longer.includes(normModelName)
      && normMetricName.includes(longer),
  );
}

/**
 * Model metric name mappings for each suite.
 * Maps display name → metric name patterns across suites.
 */
const MODEL_KEYS: Record<string, {
  comprehension: string;
  traps: string;
  generation: string;
  costPrefix: string;
}> = {
  'GPT-4o-mini':           { comprehension: 'GPT-4o-mini (standard)_score',           traps: 'gpt4o-mini_score',     generation: 'gpt-4o-mini_valid',      costPrefix: 'gpt4o-mini(standard)' },
  'Claude Haiku 4.5':      { comprehension: 'Claude Haiku 4.5 (standard)_score',     traps: 'claude-haiku_score',   generation: 'claude_haiku_4.5_valid', costPrefix: 'claude-haiku(standard)' },
  'Gemini 2.5 Flash':      { comprehension: 'Gemini 2.5 Flash (standard)_score',     traps: 'gemini-flash_score',   generation: 'gemini_2.5_flash_valid', costPrefix: 'gemini-flash(standard)' },
  'GPT-5-nano':            { comprehension: 'GPT-5-nano (budget)_score',              traps: '',                     generation: '',                       costPrefix: '' },
  'Gemini 2.5 Flash-Lite': { comprehension: 'Gemini 2.5 Flash-Lite (budget)_score',   traps: '',                     generation: '',                       costPrefix: '' },
};

/** Find a specific metric value from a suite's tests. Uses normalized matching to handle case differences. */
function findMetric(suite: BenchmarkResult | undefined, metricName: string, testIndex?: number): number | null {
  if (!suite || !metricName) return null;
  const normTarget = normalize(metricName);

  const tests = testIndex !== undefined ? [suite.tests[testIndex]].filter(Boolean) : suite.tests;
  for (const test of tests) {
    if (!test) continue;
    if (test.secondaryMetrics) {
      for (const m of test.secondaryMetrics) {
        if (normalize(m.name) === normTarget) return m.value;
      }
    }
  }
  return null;
}

/** Find all per-model secondary metrics matching a model name. */
function findModelMetrics(
  results: BenchmarkResult[],
  modelName: string,
): Array<{ suiteId: string; metricName: string; value: number; unit: string }> {
  const norm = normalize(modelName);
  const found: Array<{ suiteId: string; metricName: string; value: number; unit: string }> = [];

  for (const result of results) {
    for (const test of result.tests) {
      if (test.secondaryMetrics) {
        for (const m of test.secondaryMetrics) {
          if (normalize(m.name).includes(norm) && !isPartialModelMatch(normalize(m.name), norm, Object.keys(MODEL_KEYS))) {
            found.push({ suiteId: result.suiteId, metricName: m.name, value: m.value, unit: m.unit });
          }
        }
      }
    }
  }
  return found;
}

/** Find registry entry for a model. Prioritizes exact match, then startsWith. */
export function findRegistryEntry(modelName: string): ModelEntry | undefined {
  const norm = normalize(modelName);
  // 1. Exact match
  const exact = MODEL_REGISTRY.find(m => normalize(m.name) === norm);
  if (exact) return exact;
  // 2. startsWith (but not includes, to avoid 'Flash' matching 'Flash-Lite')
  return MODEL_REGISTRY.find(m => normalize(m.name).startsWith(norm) || norm.startsWith(normalize(m.name)));
}

// ---------------------------------------------------------------------------
// Scorecard Builder
// ---------------------------------------------------------------------------

function buildScorecards(results: BenchmarkResult[]): ModelScorecard[] {
  const fc = results.find(r => r.suiteId === 'pliability');
  const ft = results.find(r => r.suiteId === 'format-traps');
  const mg = results.find(r => r.suiteId === 'multi-model-generation');
  const cc = results.find(r => r.suiteId === 'value-amplifier');

  // Filter to LLM results for raw metric collection
  // Use category field when available, with ID fallback for suites without category
  const LLM_SUITE_IDS = new Set([
    'pliability', 'format-traps', 'prompt-compression',
    'llm-error-recovery', 'llm-multi-hop-pipeline', 'llm-rag-extraction',
    'value-amplifier', 'borges-warning', 'cognitive-horizon',
    'blub-perception', 'notation-alignment', 'lacunae-detection',
  ]);
  const llmResults = results.filter(r =>
    (r as any).category === 'llm' || LLM_SUITE_IDS.has(r.suiteId),
  );

  const scorecards: ModelScorecard[] = [];

  for (const [name, keys] of Object.entries(MODEL_KEYS)) {
    const entry = findRegistryEntry(name);
    const rawMetrics = findModelMetrics(llmResults, name);

    // Comprehension: test[0]=YON, test[1]=JSON in pliability
    // Budget models use test[4]=YON Budget, test[5]=NL Budget
    const isBudget = !keys.traps; // budget models don't have trap/generation/cost
    const yonTestIndex = isBudget ? 4 : 0;
    const jsonTestIndex = isBudget ? undefined : 1;

    const yonComp = fc ? findMetric({ ...fc, tests: [fc.tests[yonTestIndex]!] } as BenchmarkResult, keys.comprehension) : null;
    const jsonComp = jsonTestIndex !== undefined && fc ? findMetric({ ...fc, tests: [fc.tests[jsonTestIndex]!] } as BenchmarkResult, keys.comprehension) : null;

    // Trap resistance
    const trapScore = ft && keys.traps ? findMetric({ ...ft, tests: [ft.tests[0]!] } as BenchmarkResult, keys.traps) : null;

    // Generation
    let generationValid: boolean | null = null;
    if (mg && keys.generation) {
      const v = findMetric(mg, keys.generation);
      if (v !== null) generationValid = v === 1;
    }

    // Cost comparison — find first occurrence of model-specific metrics (normalized matching)
    let nlAccuracy: number | null = null;
    let yonAccuracy: number | null = null;
    let valueDelta: number | null = null;
    if (cc && keys.costPrefix) {
      const normNlAcc = normalize(`${keys.costPrefix}_nl_acc`);
      const normYonAcc = normalize(`${keys.costPrefix}_yon_acc`);
      const normDelta = normalize(`${keys.costPrefix}_delta`);
      for (const t of cc.tests) {
        if (!t.secondaryMetrics) continue;
        for (const m of t.secondaryMetrics) {
          const normName = normalize(m.name);
          if (normName === normNlAcc && nlAccuracy === null) nlAccuracy = m.value;
          if (normName === normYonAcc && yonAccuracy === null) yonAccuracy = m.value;
          if (normName === normDelta && valueDelta === null) valueDelta = m.value;
        }
      }
    }

    // Cost from registry
    let costPer1M: { input: number; output: number } | null = null;
    if (entry) {
      costPer1M = { input: entry.pricing.input, output: entry.pricing.output };
    }

    const suitesPresent = new Set(rawMetrics.map(m => m.suiteId)).size;

    scorecards.push({
      name, provider: entry?.provider ?? 'Unknown', registryEntry: entry,
      yonComprehension: yonComp, jsonComprehension: jsonComp,
      trapScore, generationValid,
      nlAccuracy, yonAccuracy, valueDelta,
      costPer1M, suitesPresent,
      rawMetrics: (() => {
        const seen = new Set<string>();
        return rawMetrics
          .map(m => ({ suite: m.suiteId, metric: m.metricName, value: m.value, unit: m.unit }))
          .filter(m => { const key = `${m.suite}:${m.metric}`; if (seen.has(key)) return false; seen.add(key); return true; });
      })(),
    });
  }

  // Sort: models with more data first
  return scorecards.sort((a, b) => b.suitesPresent - a.suitesPresent);
}

// ---------------------------------------------------------------------------
// LLM Enrichment — generates per-model narrative
// ---------------------------------------------------------------------------

async function enrichScorecards(scorecards: ModelScorecard[]): Promise<string | null> {
  const model = getEnrichmentModel();
  if (!model || scorecards.length === 0) return null;

  let executiveSummary: string | null = null;

  // Build a data summary for the LLM
  const modelSummaries = scorecards.map(sc => {
    const parts = [`${sc.name} (${sc.provider}, ${sc.registryEntry?.tier ?? 'unknown'} tier)`];
    if (sc.yonComprehension !== null) parts.push(`YON comprehension: ${sc.yonComprehension}/10`);
    if (sc.jsonComprehension !== null) parts.push(`JSON comprehension: ${sc.jsonComprehension}/10`);
    if (sc.trapScore !== null) parts.push(`trap resistance: ${sc.trapScore}/12`);
    if (sc.generationValid !== null) parts.push(`YON generation: ${sc.generationValid ? 'valid' : 'invalid'}`);
    if (sc.nlAccuracy !== null) parts.push(`NL accuracy: ${sc.nlAccuracy}%`);
    if (sc.yonAccuracy !== null) parts.push(`YON accuracy: ${sc.yonAccuracy}%`);
    if (sc.valueDelta !== null) parts.push(`value delta: ${sc.valueDelta > 0 ? '+' : ''}${sc.valueDelta}pp`);
    if (sc.costPer1M) parts.push(`cost: $${sc.costPer1M.input}/1M in, $${sc.costPer1M.output}/1M out`);
    return parts.join(', ');
  }).join('\n');

  try {
    const { text } = await generateText({
      model,
      maxOutputTokens: 1500,
      system: `You are a benchmark analyst writing model scorecards for YON (an AI-optimized data format). 

${VOICE_RULES}

Write concise, actionable insights — 2-3 sentences per model. Focus on:
- This model's strengths and known boundaries in the context of YON
- Whether YON provides a value amplifier for this model (delta > 0 means YON helps)
- Practical recommendation (when to use this model with YON)
- For negative deltas: frame as a zero-shot baseline with no training data, expected to improve

Also write a 2-sentence executive summary comparing all models.

Format your response as:
EXECUTIVE: [2-sentence summary]
MODEL [exact model name]: [2-3 sentence insight]
MODEL [exact model name]: [2-3 sentence insight]
...`,
      prompt: `Here are the benchmark results for ${scorecards.length} models tested against YON format:\n\n${modelSummaries}\n\nWrite insights for each model and an executive summary.`,
    });

    // Parse response into per-model insights
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.startsWith('EXECUTIVE:')) {
        executiveSummary = line.replace('EXECUTIVE:', '').trim();
        continue;
      }
      const modelMatch = line.match(/^MODEL\s+(.+?):\s*(.+)$/i);
      if (modelMatch) {
        const [, modelName, insight] = modelMatch;
        const sc = scorecards.find(s => s.name === modelName!.trim());
        if (sc) {
          sc.insight = insight!.trim();
        }
      }
    }
  } catch (e) {
    console.warn('[scorecard] LLM enrichment failed, proceeding without insights:', e instanceof Error ? e.message : e);
  }

  return executiveSummary;
}

// ---------------------------------------------------------------------------
// Markdown Renderer — only shows backed data, never N/A
// ---------------------------------------------------------------------------

function renderScorecards(scorecards: ModelScorecard[], timestamp: string, meta?: RunMetadata, executiveSummary?: string | null): string {
  const lines: string[] = [
    '# Model Scorecards',
    '',
    '> **Purpose:** Per-model buying guide — which model to use with YON and why.',
    '> Aggregates comprehension, generation quality, trap resistance, and value amplifier data across all LLM benchmark suites.',
    '',
    `> **Run:** ${timestamp}`,
  ];

  if (meta) {
    const durationStr = meta.durationMs > 60_000
      ? `${(meta.durationMs / 60_000).toFixed(1)} min`
      : `${(meta.durationMs / 1000).toFixed(1)}s`;
    lines.push(`> **Duration:** ${durationStr}`);
    lines.push(`> **Coverage:** ${meta.suiteCount} suites, ${meta.testCount} tests, ${meta.passRate}% gate pass rate`);
  }

  lines.push('', '---', '');

  if (scorecards.length === 0) {
    lines.push('No per-model data available. Run LLM benchmarks with `--llm` to generate scorecards.');
    return lines.join('\n');
  }

  // Executive summary from LLM enrichment
  if (executiveSummary) {
    lines.push('## Executive Summary');
    lines.push('');
    lines.push(executiveSummary);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Summary table with only backed columns
  const standardModels = scorecards.filter(s => !['GPT-5-nano', 'Gemini 2.5 Flash-Lite'].includes(s.name));
  const budgetModels = scorecards.filter(s => ['GPT-5-nano', 'Gemini 2.5 Flash-Lite'].includes(s.name));

  // Standard model summary
  lines.push('## Standard Tier');
  lines.push('');
  lines.push('| Model | Comprehension | Traps | Generation | Structured Delta | Cost (in/1M) |');
  lines.push('|-------|:------------:|:-----:|:----------:|:----------------:|:------------:|');
  for (const sc of standardModels) {
    const comp = sc.yonComprehension !== null ? `${sc.yonComprehension}%` : '—';
    const trap = sc.trapScore !== null ? `${sc.trapScore}/12` : '—';
    const gen = sc.generationValid !== null ? (sc.generationValid ? 'Valid' : 'Invalid') : '—';
    const value = sc.valueDelta !== null ? `${sc.valueDelta > 0 ? '+' : ''}${sc.valueDelta}pp` : '—';
    const cost = sc.costPer1M ? `$${sc.costPer1M.input.toFixed(2)}` : '—';
    lines.push(`| ${sc.name} | ${comp} | ${trap} | ${gen} | ${value} | ${cost} |`);
  }
  lines.push('');

  // Budget model summary
  if (budgetModels.length > 0) {
    lines.push('## Budget Tier');
    lines.push('');
    lines.push('| Model | Comprehension | Cost (in/1M) |');
    lines.push('|-------|:------------:|:------------:|');
    for (const sc of budgetModels) {
      const comp = sc.yonComprehension !== null ? `${sc.yonComprehension}% (zero-shot)` : '—';
      const cost = sc.costPer1M ? `$${sc.costPer1M.input.toFixed(2)}` : '—';
      lines.push(`| ${sc.name} | ${comp} | ${cost} |`);
    }
    lines.push('');
  }

  lines.push('---', '');

  // Per-model detail sections
  for (const sc of scorecards) {
    lines.push(`## ${sc.name}`);
    lines.push('');
    lines.push(`**Provider:** ${sc.provider}`);
    if (sc.registryEntry) {
      lines.push(`**Model ID:** \`${sc.registryEntry.modelId}\``);
      lines.push(`**Tier:** ${sc.registryEntry.tier}`);
    }
    lines.push('');

    // Deterministic "For Everyone" intro — plain English from data
    const introLines: string[] = [];
    if (sc.yonComprehension !== null) {
      const compLabel = sc.yonComprehension >= 80 ? 'shows strong zero-shot comprehension' : sc.yonComprehension >= 50 ? 'shows functional zero-shot comprehension' : 'shows emerging zero-shot comprehension';
      introLines.push(`This model ${compLabel} (${sc.yonComprehension}%).`);
    }
    if (sc.valueDelta !== null) {
      if (sc.valueDelta > 15) introLines.push(`YON significantly boosts this model's accuracy (+${sc.valueDelta}pp vs prose).`);
      else if (sc.valueDelta > 5) introLines.push(`YON improves this model's accuracy (+${sc.valueDelta}pp vs prose).`);
      else if (sc.valueDelta >= -5) introLines.push(`YON and prose perform similarly for this model (${sc.valueDelta > 0 ? '+' : ''}${sc.valueDelta}pp delta).`);
      else introLines.push(`From zero training data, this model achieves ${sc.yonAccuracy ?? 'N/A'}% on YON — a baseline expected to improve as models encounter more structured notation. NL has a training-data advantage at this tier (${sc.valueDelta}pp delta).`);
    }
    if (sc.generationValid !== null) {
      introLines.push(sc.generationValid ? 'Can generate valid YON output.' : 'Cannot yet generate valid YON output.');
    }
    if (sc.trapScore !== null) {
      const trapLabel = sc.trapScore >= 10 ? 'Highly resistant' : sc.trapScore >= 6 ? 'Moderately resistant' : 'Vulnerable';
      introLines.push(`${trapLabel} to format traps (${sc.trapScore}/12).`);
    }

    // Deterministic "When to use"
    if (sc.costPer1M && sc.valueDelta !== null) {
      const costLevel = sc.costPer1M.input < 0.5 ? 'budget' : sc.costPer1M.input < 3 ? 'mid-range' : 'premium';
      if (sc.valueDelta > 15 && costLevel === 'budget') {
        introLines.push(`**When to use:** Best value pick — ${costLevel} pricing with large accuracy gains from structured input.`);
      } else if (sc.valueDelta <= 5 && costLevel === 'premium') {
        introLines.push(`**When to use:** Premium model that handles any format well. YON reduces tokens and cost, but doesn't change accuracy much.`);
      } else if (sc.valueDelta > 5) {
        introLines.push(`**When to use:** Good pick for YON-based workflows — structured input meaningfully improves results.`);
      }
    }

    if (introLines.length > 0) {
      lines.push(introLines.join(' '));
      lines.push('');
    }

    // LLM insight — collapsible
    if (sc.insight) {
      lines.push('<details>');
      lines.push('<summary>LLM Analysis</summary>', '');
      lines.push(`> ${sc.insight}`);
      lines.push('');
      lines.push('</details>');
      lines.push('');
    }

    // Performance — only show fields with data
    const hasPerformance = sc.yonComprehension !== null || sc.trapScore !== null || sc.generationValid !== null;
    if (hasPerformance) {
      lines.push('### Performance');
      lines.push('');
      if (sc.yonComprehension !== null) {
        lines.push(`- **YON Comprehension:** ${sc.yonComprehension}%`);
      }
      if (sc.jsonComprehension !== null) {
        lines.push(`- **JSON Comprehension:** ${sc.jsonComprehension}%`);
      }
      if (sc.trapScore !== null) {
        lines.push(`- **Trap Resistance:** ${sc.trapScore}/12`);
      }
      if (sc.generationValid !== null) {
        lines.push(`- **YON Generation:** ${sc.generationValid ? 'Valid' : 'Invalid'}`);
      }
      lines.push('');
    }

    // Value amplifier — only if cost comparison data exists
    if (sc.nlAccuracy !== null && sc.yonAccuracy !== null) {
      lines.push('### Value Amplifier');
      lines.push('');
      lines.push('| Metric | Value |');
      lines.push('|--------|------:|');
      lines.push(`| NL Accuracy | ${sc.nlAccuracy}% |`);
      lines.push(`| YON Accuracy | ${sc.yonAccuracy}% |`);
      lines.push(`| Delta | ${sc.valueDelta! > 0 ? '+' : ''}${sc.valueDelta}pp |`);
      lines.push('');
    }

    // Cost
    if (sc.costPer1M) {
      lines.push('### Pricing');
      lines.push('');
      lines.push(`- **Input:** $${sc.costPer1M.input.toFixed(4)}/1M tokens`);
      lines.push(`- **Output:** $${sc.costPer1M.output.toFixed(4)}/1M tokens`);
      lines.push('');
    }

    // Raw metrics
    if (sc.rawMetrics.length > 0) {
      lines.push('<details>');
      lines.push('<summary>Raw Metrics</summary>');
      lines.push('');
      lines.push('| Suite | Metric | Value | Unit |');
      lines.push('|-------|--------|------:|------|');
      for (const m of sc.rawMetrics.slice(0, 20)) {
        lines.push(`| ${m.suite} | ${m.metric} | ${m.value} | ${m.unit} |`);
      }
      if (sc.rawMetrics.length > 20) {
        lines.push(`| ... | ... | ... | ... |`);
      }
      lines.push('');
      lines.push('</details>');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Closing tagline
  lines.push('---');
  lines.push('');
  lines.push('_Structure before scale. Clarity above all._');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate model scorecards from benchmark results.
 * Writes a markdown report to the specified directory.
 * Runs LLM enrichment for per-model narrative insights.
 */
export async function generateModelScorecards(
  results: BenchmarkResult[],
  reportDir: string,
  timestamp: string,
  meta?: RunMetadata,
): Promise<{ scorecards: ModelScorecard[]; path: string }> {
  const allScorecards = buildScorecards(results);

  // Filter to models with actual benchmark data
  const scorecards = allScorecards.filter(sc => sc.suitesPresent > 0);
  const dropped = allScorecards.length - scorecards.length;
  if (dropped > 0) {
    console.log(`[scorecard] Filtered ${dropped} models with no suite data`);
  }

  // Gate LLM enrichment on having at least one model with performance data
  const hasPerformanceData = scorecards.some(sc =>
    sc.yonComprehension !== null || sc.trapScore !== null ||
    sc.generationValid !== null || sc.valueDelta !== null,
  );
  const executiveSummary = hasPerformanceData
    ? await enrichScorecards(scorecards)
    : (() => { console.log('[scorecard] Skipped LLM enrichment (no performance data)'); return null; })();

  const markdown = renderScorecards(scorecards, timestamp, meta, executiveSummary);

  mkdirSync(reportDir, { recursive: true });
  const path = resolve(reportDir, 'model-scorecards.md');
  writeFileSync(path, markdown, 'utf-8');

  return { scorecards, path };
}

export type { ModelScorecard };
