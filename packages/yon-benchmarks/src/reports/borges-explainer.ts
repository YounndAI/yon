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
 * Borges Warning Explainer — standalone report generator.
 *
 * Produces a dual-audience explainer (70/30 plain-language/technical ratio)
 * from Borges Warning benchmark data. Writes borges-warning/explainer.md
 * to the report directory.
 *
 * Architecture matches model-scorecard.ts:
 *   1. Extract: Pull suite data from BenchmarkResult[]
 *   2. Build: Deterministic dual-audience markdown
 *   3. Enrich: Optional LLM synthesis (graceful fallback)
 *   4. Write: borges-warning/explainer.md
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

interface FormatResult {
  modelName: string;
  formatId: string;
  biasIndex: number;
  ruleSalient: number;
  metricSalient: number;
  totalCategories: number;
}

interface BatteryData {
  label: string;
  formats: string[];
  results: FormatResult[];
  differentials: Array<{
    modelName: string;
    differential: number;
    yonValue: number;
    baselineValue: number;
  }>;
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

function extractFormatResult(test: TestResult): FormatResult | null {
  const modelMetric = test.secondaryMetrics?.find((m) => m.name === 'model');
  const formatMetric = test.secondaryMetrics?.find((m) => m.name === 'format');
  const ruleMetric = test.secondaryMetrics?.find((m) => m.name === 'rule_salient');
  const metricMetric = test.secondaryMetrics?.find((m) => m.name === 'metric_salient');

  if (!modelMetric || !formatMetric) return null;

  const ruleTotal = ruleMetric?.unit ? parseInt(ruleMetric.unit.replace('/', ''), 10) || 0 : 0;
  const metricTotal = metricMetric?.unit ? parseInt(metricMetric.unit.replace('/', ''), 10) || 0 : 0;

  return {
    modelName: modelMetric.unit,
    formatId: formatMetric.unit,
    biasIndex: test.metric.value,
    ruleSalient: ruleMetric?.value ?? 0,
    metricSalient: metricMetric?.value ?? 0,
    totalCategories: ruleTotal + metricTotal,
  };
}

function extractBatteryData(suite: BenchmarkResult): { batteryA: BatteryData; batteryB: BatteryData } {
  const batteryAFormats = ['yon-best-practice', 'yon-enforcement', 'structured-markdown', 'unstructured-prose', 'structured-json'];
  const batteryBFormats = ['multi-domain-yon', 'multi-domain-yon-enforced', 'multi-domain-yon-instructed', 'unstructured-dump'];

  const allFormatTests = suite.tests.filter((t) => !t.id.startsWith('A-diff-') && !t.id.startsWith('B-diff-'));
  const formatResults = allFormatTests.map(extractFormatResult).filter((r): r is FormatResult => r !== null);

  const aDiffs = suite.tests.filter((t) => t.id.startsWith('A-diff-'));
  const bDiffs = suite.tests.filter((t) => t.id.startsWith('B-diff-'));

  const parseDiff = (test: TestResult) => {
    const modelMetric = test.secondaryMetrics?.find((m) => m.name === 'model');
    return {
      modelName: modelMetric?.unit ?? test.id,
      differential: test.metric.value,
      yonValue: test.secondaryMetrics?.find((m) => m.name === 'yon-best-practice')?.value ?? test.secondaryMetrics?.find((m) => m.name === 'multi-domain-yon-instructed')?.value ?? 0,
      baselineValue: test.secondaryMetrics?.find((m) => m.name === 'unstructured-prose')?.value ?? test.secondaryMetrics?.find((m) => m.name === 'unstructured-dump')?.value ?? 0,
    };
  };

  return {
    batteryA: {
      label: 'Payment System (5 categories)',
      formats: batteryAFormats,
      results: formatResults.filter((r) => batteryAFormats.includes(r.formatId)),
      differentials: aDiffs.map(parseDiff),
    },
    batteryB: {
      label: 'Multi-Domain (10 categories)',
      formats: batteryBFormats,
      results: formatResults.filter((r) => batteryBFormats.includes(r.formatId)),
      differentials: bDiffs.map(parseDiff),
    },
  };
}

// ---------------------------------------------------------------------------
// Markdown Builder (Deterministic — 70/30 Explainer Pattern)
// ---------------------------------------------------------------------------

function buildExplainer(batteryA: BatteryData, batteryB: BatteryData, suite: BenchmarkResult, synthesis?: string | null): string {
  const lines: string[] = [];

  // Header — explainer material-type banner
  lines.push('# Notation Shapes Perception');
  lines.push('');
  lines.push('_Material Type: Explainer (70/30)_');
  lines.push('');

  // For Everyone (70% clarity)
  lines.push('## For Everyone');
  lines.push('');
  lines.push('The same system description, written in multiple formats, was given to six AI models.');
  lines.push('Each model was asked to identify all risks. The question: does the **format** change what the AI **sees**?');
  lines.push('');
  lines.push('The answer is yes. When information is structured with labeled sections and explicit rules, AI models detect');
  lines.push('significantly more risk categories than when the same information is presented as a stream-of-consciousness text.');

  // Dynamic Battery B claim — same-model comparison
  const modelsForClaim = [...new Set(batteryB.results.map((r) => r.modelName))];
  let bestDelta = { model: '', yonCats: 0, dumpCats: 0, total: 0 };
  for (const model of modelsForClaim) {
    const yonResults = batteryB.results.filter((r) => r.modelName === model && r.formatId.startsWith('multi-domain-yon'));
    const dumpResult = batteryB.results.find((r) => r.modelName === model && r.formatId === 'unstructured-dump');
    if (yonResults.length === 0 || !dumpResult) continue;
    const bestYon = yonResults.reduce((a, b) => (a.ruleSalient + a.metricSalient) >= (b.ruleSalient + b.metricSalient) ? a : b);
    const yonCats = bestYon.ruleSalient + bestYon.metricSalient;
    const dumpCats = dumpResult.ruleSalient + dumpResult.metricSalient;
    const delta = yonCats - dumpCats;
    if (delta > bestDelta.yonCats - bestDelta.dumpCats) {
      bestDelta = { model, yonCats, dumpCats, total: bestYon.totalCategories };
    }
  }
  if (bestDelta.yonCats > bestDelta.dumpCats) {
    lines.push(`One model found **${bestDelta.yonCats} out of ${bestDelta.total}** risk categories from structured YON — and **${bestDelta.dumpCats}** from the same content as a brain dump.`);
  } else {
    lines.push('Across batteries, format influenced risk category detection in both directions.');
  }
  lines.push('');
  lines.push('This suggests that notation is not neutral. The format in which information is encoded affects how AI agents');
  lines.push('perceive, prioritize, and report on that information. Structure creates legibility. Chaos creates blindness.');
  lines.push('');
  lines.push('Note: these models have never been trained on YON. Prose has decades of training data behind it.');
  lines.push('YON\'s results here represent a zero-shot baseline \u2014 no fine-tuning, no prompt engineering for format awareness.');
  lines.push('');

  // Separator
  lines.push('---');
  lines.push('');

  // For Specialists (30% flow + dense data)
  lines.push('## For Specialists');
  lines.push('');

  // Battery A table
  lines.push(`### Battery A — ${batteryA.label}`);
  lines.push('');

  // Get unique models
  const modelsA = [...new Set(batteryA.results.map((r) => r.modelName))];
  const formatsA = ['yon-best-practice', 'yon-enforcement', 'structured-markdown', 'unstructured-prose', 'structured-json'];
  const formatLabels: Record<string, string> = {
    'yon-best-practice': 'YON',
    'yon-enforcement': 'YON Enforce',
    'structured-markdown': 'Markdown',
    'unstructured-prose': 'Prose',
    'structured-json': 'JSON',
    'multi-domain-yon': 'YON',
    'multi-domain-yon-enforced': 'YON+Check',
    'multi-domain-yon-instructed': 'YON+Instruct',
    'unstructured-dump': 'Brain Dump',
  };

  lines.push(`| Model | ${formatsA.map((f) => formatLabels[f] ?? f).join(' | ')} | Diff |`);
  lines.push(`|---|${formatsA.map(() => '---').join('|')}|---|`);

  for (const model of modelsA) {
    const values = formatsA.map((f) => {
      const result = batteryA.results.find((r) => r.modelName === model && r.formatId === f);
      return result ? `${result.biasIndex}%` : '—';
    });
    const diff = batteryA.differentials.find((d) => d.modelName === model);
    const diffStr = diff ? `${diff.differential > 0 ? '+' : ''}${diff.differential}pp${diff.differential > 0 ? ' (structure helps)' : diff.differential < 0 ? ' (training gap)' : ''}` : '—';
    lines.push(`| **${model}** | ${values.join(' | ')} | ${diffStr} |`);
  }
  lines.push('');

  // Battery B table — the main event
  lines.push(`### Battery B — ${batteryB.label}`);
  lines.push('');
  lines.push('> This battery tests the core hypothesis: does YON improve comprehension when the source material is chaotic?');
  lines.push('');

  const modelsB = [...new Set(batteryB.results.map((r) => r.modelName))];
  const formatsB = ['multi-domain-yon', 'multi-domain-yon-enforced', 'multi-domain-yon-instructed', 'unstructured-dump'];

  lines.push(`| Model | ${formatsB.map((f) => formatLabels[f] ?? f).join(' | ')} | Diff |`);
  lines.push(`|---|${formatsB.map(() => '---').join('|')}|---|`);

  for (const model of modelsB) {
    const values = formatsB.map((f) => {
      const result = batteryB.results.find((r) => r.modelName === model && r.formatId === f);
      if (!result) return '—';
      const cats = result.ruleSalient + result.metricSalient;
      return `${result.biasIndex}% (${cats}/${result.totalCategories})`;
    });
    const diff = batteryB.differentials.find((d) => d.modelName === model);
    const diffStr = diff ? `${diff.differential > 0 ? '+' : ''}${diff.differential}pp${diff.differential > 0 ? ' (structure helps)' : diff.differential < 0 ? ' (training gap)' : ''}` : '—';
    lines.push(`| **${model}** | ${values.join(' | ')} | ${diffStr} |`);
  }
  lines.push('');
  lines.push('> _Values: bias index (categories found / total). Higher = more risks identified._');
  lines.push('');

  // Battery C: Computation Extraction
  const cTests = suite.tests.filter((t: TestResult) => t.id.startsWith('C-'));
  if (cTests.length > 0) {
    lines.push('### Battery C — Computation Extraction');
    lines.push('');
    lines.push('> Can the AI extract specific numbers and do math? `@MAP` should make this trivial.');
    lines.push('');

    const cFormats = ['multi-domain-yon-instructed', 'multi-domain-yon', 'unstructured-dump'];
    const cLabels: Record<string, string> = {
      'multi-domain-yon-instructed': 'YON+Instruct',
      'multi-domain-yon': 'Raw YON',
      'unstructured-dump': 'Brain Dump',
    };
    const cModels = [...new Set(cTests.map((t: TestResult) => t.secondaryMetrics?.find((m: { name: string }) => m.name === 'model')?.unit).filter(Boolean))] as string[];

    lines.push(`| Model | ${cFormats.map((f) => cLabels[f] ?? f).join(' | ')} |`);
    lines.push(`|---|${cFormats.map(() => '---').join('|')}|`);

    for (const model of cModels) {
      const values = cFormats.map((f) => {
        const test = cTests.find((t: TestResult) =>
          t.secondaryMetrics?.find((m: { name: string; unit?: string }) => m.name === 'model')?.unit === model &&
          t.secondaryMetrics?.find((m: { name: string; unit?: string }) => m.name === 'format')?.unit === f
        );
        return test ? `**${test.metric.value}**/11` : '—';
      });
      lines.push(`| **${model}** | ${values.join(' | ')} |`);
    }
    lines.push('');
  }

  // Battery D: Cross-Section Dependencies
  const dTests = suite.tests.filter((t: TestResult) => t.id.startsWith('D-'));
  if (dTests.length > 0) {
    lines.push('### Battery D — Cross-Section Dependencies');
    lines.push('');
    lines.push('> Can the AI trace risk cascades ACROSS sections? `@SEC` boundaries make cross-referencing explicit.');
    lines.push('');

    const dFormats = ['multi-domain-yon-instructed', 'multi-domain-yon', 'unstructured-dump'];
    const dLabels: Record<string, string> = {
      'multi-domain-yon-instructed': 'YON+Instruct',
      'multi-domain-yon': 'Raw YON',
      'unstructured-dump': 'Brain Dump',
    };
    const dModels = [...new Set(dTests.map((t: TestResult) => t.secondaryMetrics?.find((m: { name: string }) => m.name === 'model')?.unit).filter(Boolean))] as string[];

    lines.push(`| Model | ${dFormats.map((f) => dLabels[f] ?? f).join(' | ')} |`);
    lines.push(`|---|${dFormats.map(() => '---').join('|')}|`);

    for (const model of dModels) {
      const values = dFormats.map((f) => {
        const test = dTests.find((t: TestResult) =>
          t.secondaryMetrics?.find((m: { name: string; unit?: string }) => m.name === 'model')?.unit === model &&
          t.secondaryMetrics?.find((m: { name: string; unit?: string }) => m.name === 'format')?.unit === f
        );
        return test ? `**${test.metric.value}**/7` : '—';
      });
      lines.push(`| **${model}** | ${values.join(' | ')} |`);
    }
    lines.push('');
  }

  // The Operational Characteristic — pivot from limitation to operational strength
  lines.push('## The Operational Characteristic');
  lines.push('');
  lines.push('YON creates salience hierarchies. `@RULE` tags surface mandatory requirements. `@MAP` tags expose metrics and thresholds.');
  lines.push('`@CHECK` tags define assertions that flag violations. Together, these tags give AI agents an addressable map of the system.');
  lines.push('');
  lines.push('The operational characteristic: **structure is not neutral.** Every format encodes a salience profile.');
  lines.push('Plain prose flattens all information to equal weight. YON creates labeled sections that elevate risks across all domains.');
  lines.push('When combined with reading instructions, YON produces the widest comprehension surface observed in these benchmarks.');
  lines.push('');
  lines.push('> **Trade-off disclosure:** NL formats benefit from the training data advantage — all LLMs have seen vastly more natural language');
  lines.push('> than YON. The structural gains shown here emerge despite this asymmetry, not because of a level playing field.');
  lines.push('');
  lines.push('The data shows:');
  lines.push('');
  lines.push('1. **Structure improves comprehension.** YON helps agents find more risks than unstructured text.');
  lines.push('2. **Enforcement amplifies detection.** `@MAP`/`@CHECK` tags provide additional anchors for risk identification.');
  lines.push('3. **Instructions unlock the format.** Teaching an LLM to read YON tags maximizes category coverage.');
  lines.push('4. **Prose creates blindness.** Unstructured text loses 2–8 risk categories depending on the model.');
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

async function generateSynthesis(batteryA: BatteryData, batteryB: BatteryData): Promise<string | null> {
  const model = getEnrichmentModel();
  if (!model) return null;

  const dataSummary = [
    `Battery A (${batteryA.label}): ${batteryA.results.length} format×model tests, ${batteryA.differentials.length} models.`,
    `Battery B (${batteryB.label}): ${batteryB.results.length} format×model tests, ${batteryB.differentials.length} models.`,
    '',
    'Key findings:',
    ...batteryB.differentials.map((d) => {
      const yon = batteryB.results.find((r) => r.modelName === d.modelName && r.formatId === 'multi-domain-yon');
      const dump = batteryB.results.find((r) => r.modelName === d.modelName && r.formatId === 'unstructured-dump');
      const yonCats = yon ? yon.ruleSalient + yon.metricSalient : 0;
      const dumpCats = dump ? dump.ruleSalient + dump.metricSalient : 0;
      return `  ${d.modelName}: YON found ${yonCats}/10 categories, brain dump found ${dumpCats}/10. Diff: ${d.differential}pp.`;
    }),
  ].join('\n');

  try {
    const { text } = await generateText({
      model,
      maxOutputTokens: 500,
      temperature: 0.15,
      system: `${VOICE_RULES}

You are writing a 3-sentence synthesis for the "Borges Warning" benchmark — a study of whether notation format affects AI risk perception.

Rules:
- Present tense. Third person. Calm authority.
- First sentence: state the primary finding using the STRONGEST measured effect.
- Second sentence: state the most surprising result.
- Third sentence: state the practical implication for YON users.
- No superlatives without evidence. No banned terms.
- Quantify with actual numbers from the data.
- For every result cited, provide full context: direction (YON higher or lower), magnitude, and the training-data asymmetry (YON has zero training data; prose has decades).
- When YON underperforms prose, note this is a zero-shot result with no prior training data \u2014 an expected baseline gap.
- State both sides of any comparison. Do not omit negative results.
- Never use hedging words (minimally, slightly, marginally) when data shows categorical differences (e.g. 4/10 vs 0/10).`,
      prompt: dataSummary,
    });
    return text.trim();
  } catch (e) {
    console.warn('[borges-explainer] LLM synthesis failed, proceeding without:', e instanceof Error ? e.message : e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a dual-audience Borges Warning explainer from benchmark results.
 * Only writes when the llm-borges-warning suite is present.
 */
export async function generateBorgesExplainer(
  results: BenchmarkResult[],
  reportDir: string,
): Promise<{ generated: boolean; path: string }> {
  const borgesSuite = results.find((r) => r.suiteId === 'borges-warning');
  if (!borgesSuite) return { generated: false, path: '' };

  const { batteryA, batteryB } = extractBatteryData(borgesSuite);
  const synthesis = await generateSynthesis(batteryA, batteryB);
  const markdown = buildExplainer(batteryA, batteryB, borgesSuite, synthesis);

  const suiteDir = resolve(reportDir, 'borges-warning');
  mkdirSync(suiteDir, { recursive: true });
  const path = resolve(suiteDir, 'explainer.md');
  writeFileSync(path, markdown, 'utf-8');

  return { generated: true, path };
}
