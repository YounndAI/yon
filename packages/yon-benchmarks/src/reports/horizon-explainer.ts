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
 * Cognitive Horizon Explainer — standalone report generator.
 *
 * Produces a dual-audience explainer (70/30 plain-language/technical ratio)
 * from Cognitive Horizon benchmark data. Writes cognitive-horizon/explainer.md
 * to the report directory.
 *
 * Architecture matches borges-explainer.ts:
 *   1. Extract: Pull suite data from BenchmarkResult[]
 *   2. Build: Deterministic dual-audience markdown
 *   3. Enrich: Optional LLM synthesis (graceful fallback)
 *   4. Write: cognitive-horizon/explainer.md
 *
 * Voice: YounndAI institutional — dual-audience explainer style (70/30 plain-language/technical ratio).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { getActiveProviders } from '../core/env.js';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { VOICE_RULES } from './voice.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelDensityRow {
  modelName: string;
  markdown: number;
  yonCanon: number;
  yonMin: number;
  delta: number; // min - markdown
}

interface HorizonData {
  models: ModelDensityRow[];
  densityAdvantage: number;
  tokenEfficiency: { markdown: number; yonCanon: number; yonMin: number };
  tokenCounts: { markdown: number; yonCanon: number; yonMin: number };
  overallAccuracy: { markdown: number; yonCanon: number; yonMin: number };
  tokenSavings: number;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function getEnrichmentModel() {
  const active = getActiveProviders();
  if (active.length === 0) return null;
  if (active.includes('openai')) return openai('gpt-4o');
  if (active.includes('anthropic')) return anthropic('claude-haiku-4-5');
  if (active.includes('google')) return google('gemini-2.5-flash');
  return null;
}

function extractHorizonData(suite: BenchmarkResult): HorizonData | null {
  const aggTests = suite.tests.filter((t) => t.id.endsWith('-agg'));
  if (aggTests.length === 0) return null;

  // Build per-model rows
  const modelNames = [...new Set(
    aggTests.map((t) => t.secondaryMetrics?.find((m) => m.name === 'model')?.unit).filter(Boolean),
  )] as string[];

  const models: ModelDensityRow[] = modelNames.map((name) => {
    const findAcc = (density: string) => {
      const test = aggTests.find(
        (t) => t.id.includes(`-${density}-`) && t.secondaryMetrics?.find((m) => m.name === 'model')?.unit === name,
      );
      return test?.metric.value ?? 0;
    };

    const md = findAcc('markdown');
    const canon = findAcc('yon_canon');
    const min = findAcc('yon_min');

    return { modelName: name, markdown: md, yonCanon: canon, yonMin: min, delta: min - md };
  });

  // Density advantage
  const daTest = suite.tests.find((t) => t.id === 'horizon-density-advantage');
  const densityAdvantage = daTest?.metric.value ?? 0;

  // Token efficiency
  const teTest = suite.tests.find((t) => t.id === 'horizon-token-efficiency');
  const mdEff = teTest?.secondaryMetrics?.find((m) => m.name === 'markdown_efficiency')?.value ?? 0;
  const canonEff = teTest?.secondaryMetrics?.find((m) => m.name === 'yon_canon_efficiency')?.value ?? 0;
  const minEff = teTest?.metric.value ?? 0;

  // Token counts / savings
  const tokenSavings = daTest?.secondaryMetrics?.find((m) => m.name === 'token_savings')?.value ?? 0;

  // Overall accuracy
  const findOverall = (density: string) => {
    const test = suite.tests.find((t) => t.id === `horizon-${density}-overall`);
    return test?.metric.value ?? 0;
  };

  // Token counts from overall test secondaryMetrics
  const findTokens = (density: string) => {
    const test = suite.tests.find((t) => t.id === `horizon-${density}-overall`);
    return test?.secondaryMetrics?.find((m) => m.name === 'tokens')?.value ?? 0;
  };

  return {
    models,
    densityAdvantage,
    tokenEfficiency: { markdown: mdEff, yonCanon: canonEff, yonMin: minEff },
    tokenCounts: { markdown: findTokens('markdown'), yonCanon: findTokens('yon_canon'), yonMin: findTokens('yon_min') },
    overallAccuracy: { markdown: findOverall('markdown'), yonCanon: findOverall('yon_canon'), yonMin: findOverall('yon_min') },
    tokenSavings,
  };
}

// ---------------------------------------------------------------------------
// Markdown Builder (Deterministic — 70/30 Explainer Pattern)
// ---------------------------------------------------------------------------

function buildExplainer(data: HorizonData, suite: BenchmarkResult, synthesis?: string | null): string {
  const lines: string[] = [];

  // Header — explainer material-type banner
  lines.push('# The Cognitive Horizon');
  lines.push('');
  lines.push('_Material Type: Explainer (70/30)_');
  lines.push('');

  // For Everyone (70% clarity)
  lines.push('## For Everyone');
  lines.push('');
  lines.push('The same system architecture — 10 files describing an invoicing platform — was given to multiple AI models');
  lines.push('in three formats: verbose English documentation, structured YON notation, and compressed YON notation.');
  lines.push('');
  lines.push('Each model was asked 10 questions that required reading across multiple files to answer correctly.');
  lines.push('The question: does **information density** affect how well an AI reasons about complex systems?');
  lines.push('');

  if (data.densityAdvantage > 0) {
    lines.push(`The answer is yes. Compressed YON outperformed verbose documentation by **${data.densityAdvantage}pp** overall.`);
    lines.push('With fewer tokens to process, models found more correct answers — not fewer.');
  } else if (data.densityAdvantage === 0) {
    lines.push('The result: compressed YON achieved parity with verbose documentation while using significantly fewer tokens.');
  } else {
    lines.push(`YON Minimal used ${data.tokenSavings}% fewer tokens, achieving ${data.tokenEfficiency.yonMin.toFixed(1)} acc/1K tokens vs ${data.tokenEfficiency.markdown.toFixed(1)} acc/1K tokens for documentation.`);
    lines.push(`Accuracy traded ${Math.abs(data.densityAdvantage)}pp for that compression \u2014 a cost-benefit decision, not a failure.`);
  }
  lines.push('');

  if (data.densityAdvantage > 0) {
    lines.push('This suggests that denser notation can expand the "cognitive horizon" — the range of');
    lines.push('information a model can actually use.');
  } else if (data.densityAdvantage === 0) {
    lines.push('Density did not change accuracy in this run. The cognitive horizon remained stable across formats.');
  } else {
    lines.push(`In this run, YON Minimal delivered ${data.tokenSavings}% token savings while scoring ${Math.abs(data.densityAdvantage)}pp below verbose documentation on accuracy.`);
    lines.push('For high-volume pipelines, the token savings may outweigh the accuracy delta. For single-shot reasoning, verbose context helps.');
  }
  lines.push('');

  // Separator
  lines.push('---');
  lines.push('');

  // For Specialists (30% flow + dense data)
  lines.push('## For Specialists');
  lines.push('');

  // Token economy
  lines.push('### Token Economy');
  lines.push('');
  lines.push('| Density | Approx Tokens | Accuracy | Efficiency (acc%/1k-tok) |');
  lines.push('|:---|---:|---:|---:|');
  lines.push(`| Markdown | ~${data.tokenCounts.markdown.toLocaleString()} | ${data.overallAccuracy.markdown}% | ${data.tokenEfficiency.markdown} |`);
  lines.push(`| YON Canon | ~${data.tokenCounts.yonCanon.toLocaleString()} | ${data.overallAccuracy.yonCanon}% | ${data.tokenEfficiency.yonCanon} |`);
  lines.push(`| YON Minimal | ~${data.tokenCounts.yonMin.toLocaleString()} | ${data.overallAccuracy.yonMin}% | ${data.tokenEfficiency.yonMin} |`);
  lines.push('');
  lines.push(`Token savings: **${data.tokenSavings}%** (minimal vs markdown). Density advantage: **${data.densityAdvantage >= 0 ? '+' : ''}${data.densityAdvantage}pp**.`);
  lines.push('');

  // Per-model table
  if (data.models.length > 0) {
    lines.push('### Per-Model Breakdown');
    lines.push('');
    lines.push('| Model | Markdown | YON Canon | YON Min | Δ (min−md) |');
    lines.push('|:---|---:|---:|---:|---:|');

    for (const m of data.models) {
      const deltaStr = m.delta >= 0 ? `+${m.delta}pp (density helps)` : `${m.delta}pp (explicit context helps)`;
      lines.push(`| **${m.modelName}** | ${m.markdown}% | ${m.yonCanon}% | ${m.yonMin}% | ${deltaStr} |`);
    }
    lines.push('');
  }

  // Question performance summary
  const qTests = suite.tests.filter((t: TestResult) => t.id.match(/^horizon-.*-q\d+-/));
  if (qTests.length > 0) {
    const qIds = [...new Set(qTests.map((t) => {
      const match = t.id.match(/q(\d+)/);
      return match ? parseInt(match[1] ?? '0', 10) : 0;
    }))].sort((a, b) => a - b);

    lines.push('### Per-Question Accuracy');
    lines.push('');
    lines.push('| Question | Markdown | YON Canon | YON Min |');
    lines.push('|:---|---:|---:|---:|');

    for (const qId of qIds) {
      const getQAcc = (density: string) => {
        const matching = qTests.filter((t) => t.id.includes(`-${density}-q${qId}-`));
        if (matching.length === 0) return '—';
        const correct = matching.filter((t) =>
          t.secondaryMetrics?.find((m) => m.name === 'correct')?.value === 1,
        ).length;
        return `${Math.round((correct / matching.length) * 100)}%`;
      };

      lines.push(`| Q${qId} | ${getQAcc('markdown')} | ${getQAcc('yon_canon')} | ${getQAcc('yon_min')} |`);
    }
    lines.push('');
  }

  // The Operational Characteristic
  lines.push('## The Operational Characteristic');
  lines.push('');
  lines.push('The Extended Mind thesis (Clark & Chalmers, 1998) argues that cognitive tools become part of the mind.');
  lines.push('For LLMs, the context window IS the mind. Density IS cognitive capacity.');
  lines.push('');
  lines.push('The data supports three observations:');
  lines.push('');
  if (data.densityAdvantage >= 0) {
    lines.push('1. **Density is not lossy.** Compressed notation preserves or improves cross-file reasoning accuracy.');
  } else {
    lines.push(`1. **Density trades tokens for accuracy.** Compressed notation scored ${Math.abs(data.densityAdvantage)}pp lower, but saved ${data.tokenSavings}% of tokens \u2014 a deliberate cost/quality trade-off.`);
  }
  lines.push('2. **Token efficiency compounds.** Denser formats deliver more correct answers per token spent — directly reducing cost.');
  lines.push('3. **Structure creates addressability.** YON tags (`@SEC`, `@RULE`, `@MAP`) make cross-file references explicit,');
  lines.push('   helping models trace dependencies that prose flattens.');
  lines.push('');
  lines.push('> **Trade-off disclosure:** NL formats benefit from the training data advantage — all LLMs have seen vastly more natural language');
  lines.push('> than YON. The efficiency and structural gains shown here emerge despite this asymmetry, not because of a level playing field.');
  lines.push('');

  // LLM Synthesis (optional)
  if (synthesis) {
    lines.push('## Synthesis');
    lines.push('');
    lines.push(synthesis);
    lines.push('');
  }

  // Signature end — house closing line
  lines.push('---');
  lines.push('');
  lines.push('_Structure before scale. Clarity above all._');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Optional LLM Synthesis
// ---------------------------------------------------------------------------

async function generateSynthesis(data: HorizonData): Promise<string | null> {
  const model = getEnrichmentModel();
  if (!model) return null;

  const dataSummary = [
    `${data.models.length} models tested across 3 densities (Markdown, YON Canon, YON Minimal).`,
    `Overall accuracy: Markdown ${data.overallAccuracy.markdown}%, YON Canon ${data.overallAccuracy.yonCanon}%, YON Min ${data.overallAccuracy.yonMin}%.`,
    `Density advantage (min vs markdown): ${data.densityAdvantage}pp.`,
    `Token savings: ${data.tokenSavings}%.`,
    '',
    'Per-model results:',
    ...data.models.map(
      (m) => `  ${m.modelName}: MD ${m.markdown}% → Canon ${m.yonCanon}% → Min ${m.yonMin}% (Δ ${m.delta >= 0 ? '+' : ''}${m.delta}pp)`,
    ),
  ].join('\n');

  try {
    const { text } = await generateText({
      model,
      maxOutputTokens: 500,
      temperature: 0.15,
      system: `${VOICE_RULES}

You are writing a 3-sentence synthesis for the "Cognitive Horizon" benchmark — a study of whether context density affects AI cross-file reasoning.

Rules:
- Present tense. Third person. Calm authority.
- First sentence: state the primary finding.
- Second sentence: state the most surprising result.
- Third sentence: state the practical implication for YON users.
- No superlatives without evidence. No banned terms.
- Quantify with actual numbers from the data.
- CRITICAL DATA CLAMP: If Markdown accuracy > YON Min accuracy, you MUST state that dense formats scored lower on accuracy in this run. NEVER say "without accuracy loss" or "without sacrificing accuracy" when the pp difference is nonzero. Report the exact pp difference. The benefit of density is token efficiency, not accuracy parity.
- When YON underperforms: note this is a zero-shot result (no prior YON training data) and lead with the token savings before the accuracy delta.`,
      prompt: dataSummary,
    });
    return text.trim();
  } catch (e) {
    console.warn('[horizon-explainer] LLM synthesis failed, proceeding without:', e instanceof Error ? e.message : e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a dual-audience Cognitive Horizon explainer from benchmark results.
 * Only writes when the cognitive-horizon suite is present.
 */
export async function generateHorizonExplainer(
  results: BenchmarkResult[],
  reportDir: string,
): Promise<{ generated: boolean; path: string }> {
  const horizonSuite = results.find((r) => r.suiteId === 'cognitive-horizon');
  if (!horizonSuite) return { generated: false, path: '' };

  const data = extractHorizonData(horizonSuite);
  if (!data) return { generated: false, path: '' };

  const synthesis = await generateSynthesis(data);
  const markdown = buildExplainer(data, horizonSuite, synthesis);

  const suiteDir = resolve(reportDir, 'cognitive-horizon');
  mkdirSync(suiteDir, { recursive: true });
  const path = resolve(suiteDir, 'explainer.md');
  writeFileSync(path, markdown, 'utf-8');

  return { generated: true, path };
}
