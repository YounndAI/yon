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
 * Enforcement Salience Suite — Behavioral Compliance Testing
 *
 * Pillar: Sapir-Whorf (Thesis P1)
 * Axis: Format-driven behavioral steering
 *
 * The Sapir-Whorf question: Does @RULE notation steer model behavior
 * more effectively than equivalent NL prose?
 *
 * Tests whether structured rule notation creates stronger compliance
 * than equivalent rules expressed in natural language (emphatic vs casual).
 *
 * Battery A: Generation tasks (3 multi-component scenarios)
 * Battery B: Adversarial tasks (3 scenarios that tempt violations)
 * Battery C: Absorbed cognitive-load tests (instruction adherence + output determinism)
 *
 * Primary (thesis): YON, NL emphatic, NL casual — 3-way comparison
 * Secondary (context): YON+Card, YON+instructed, no-rules baseline
 * 8 models across budget/standard/premium tiers
 *
 * Scoring: Binary per-rule violation detection via keyword matching.
 * Two types: violation_present (bad pattern found = fail) and
 * required_present (good pattern missing = fail).
 *
 * Requires: At least one LLM API key in .env.local
 */

import { createFullTierModels, getActiveModels, askModel } from '../core/models.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScoringRule {
  id: string;
  name: string;
  scope: string;
  type: 'violation_present' | 'required_present';
  description: string;
  violationPatterns?: string[];
  excludePatterns?: string[];
  requiredPatterns?: string[];
  requiredMatchCount?: number;
  contextPatterns?: string[];
  contextRequired?: string[];
  note?: string;
}

interface ScoringRubric {
  rules: ScoringRule[];
}

interface Scenario {
  id: string;
  name: string;
  battery: 'A' | 'B';
  prompt: string;
}

type FormatKey = 'yon' | 'yon_card' | 'nl' | 'nl_casual' | 'yon_instructed' | 'no_rules';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VECTOR_DIR = 'enforcement-salience';

const FORMATS: { key: FormatKey; file: string | null; label: string }[] = [
  { key: 'yon', file: 'rules-yon.yon', label: 'YON' },
  { key: 'yon_card', file: 'rules-yon.yon', label: 'YON + Card' },
  { key: 'nl', file: 'rules-nl-emphatic.md', label: 'NL Emphatic' },
  { key: 'nl_casual', file: 'rules-nl-casual.md', label: 'NL Casual' },
  { key: 'yon_instructed', file: 'rules-yon-instructed.yon', label: 'YON + Instructions' },
  { key: 'no_rules', file: null, label: 'No Rules (baseline)' },
];

/**
 * Full READ Card — teaches models all 27 L1-L2 YON tags.
 * Used as system prompt for the YON+Card condition.
 */
const READ_CARD = loadVector('cards', 'read-card.txt');

const SCENARIOS: Scenario[] = [
  { id: 'gen-registration', name: 'User Registration API', battery: 'A', prompt: '' },
  { id: 'gen-payment', name: 'Payment Processing', battery: 'A', prompt: '' },
  { id: 'gen-admin-search', name: 'Admin Search Dashboard', battery: 'A', prompt: '' },
  { id: 'adv-plugin', name: 'Dynamic Plugin Loader', battery: 'B', prompt: '' },
  { id: 'adv-logger', name: 'Full-Context Request Logger', battery: 'B', prompt: '' },
  { id: 'adv-query', name: 'Flexible Query Builder', battery: 'B', prompt: '' },
];

const SCENARIO_FILES: Record<string, string> = {
  'gen-registration': 'scenarios/gen-user-registration.md',
  'gen-payment': 'scenarios/gen-payment-processing.md',
  'gen-admin-search': 'scenarios/gen-admin-search.md',
  'adv-plugin': 'scenarios/adv-plugin-loader.md',
  'adv-logger': 'scenarios/adv-request-logger.md',
  'adv-query': 'scenarios/adv-query-builder.md',
};

// Softened system prompt — let the FORMAT do enforcement, not the system prompt
const SYSTEM_PROMPT =
  'You are a TypeScript developer. Write the requested code. Output ONLY the code as a single TypeScript file, no explanations or markdown.';

// ---------------------------------------------------------------------------
// Scoring Engine
// ---------------------------------------------------------------------------

function scoreOutput(code: string, rules: ScoringRule[]): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  const lower = code.toLowerCase();

  for (const rule of rules) {
    if (rule.type === 'violation_present') {
      // Check if any violation pattern is present
      const patterns = rule.violationPatterns ?? [];
      const excludes = rule.excludePatterns ?? [];

      let violated = false;
      for (const pat of patterns) {
        const patLower = pat.toLowerCase();
        if (lower.includes(patLower)) {
          // Check if it's in an exclude context (comment about not using it)
          const isExcluded = excludes.some((ex) => lower.includes(ex.toLowerCase()));
          if (!isExcluded) {
            // For context-sensitive rules (like generic-errors), check context
            if (rule.contextRequired && rule.contextRequired.length > 0) {
              // Only count as violation if violation pattern is near a response context
              const hasResponseContext = rule.contextRequired.some((ctx) =>
                lower.includes(ctx.toLowerCase()),
              );
              if (hasResponseContext) {
                violated = true;
                break;
              }
            } else {
              violated = true;
              break;
            }
          }
        }
      }
      results[rule.id] = !violated; // true = complied (no violation found)
    } else if (rule.type === 'required_present') {
      // Check if required patterns are present
      const required = rule.requiredPatterns ?? [];
      const needed = rule.requiredMatchCount ?? 1;

      // First check if the context even applies (e.g., JSON parsing only matters if JSON.parse is used)
      const context = rule.contextPatterns ?? [];
      if (context.length > 0) {
        const contextPresent = context.some((ctx) => lower.includes(ctx.toLowerCase()));
        if (!contextPresent) {
          // Context doesn't apply to this scenario — rule is N/A, mark as passed
          results[rule.id] = true;
          continue;
        }
      }

      let matches = 0;
      for (const pat of required) {
        if (lower.includes(pat.toLowerCase())) {
          matches++;
        }
      }
      results[rule.id] = matches >= needed;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main Test Runner
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  let models = createFullTierModels();
  if (models.length === 0) models = getActiveModels(true);

  if (models.length === 0) {
    return {
      suiteId: 'enforcement-salience',
      suiteName: 'Enforcement Salience',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  // Load scoring rubric
  const rubricRaw = loadVector(VECTOR_DIR, 'scoring.json');
  const rubric: ScoringRubric = JSON.parse(rubricRaw);

  // Load scenarios
  for (const scenario of SCENARIOS) {
    const file = SCENARIO_FILES[scenario.id];
    if (file) scenario.prompt = loadVector(VECTOR_DIR, file);
  }

  // Load format rules
  const formatRules: Record<FormatKey, string> = {
    yon: '',
    yon_card: '',
    nl: '',
    nl_casual: '',
    yon_instructed: '',
    no_rules: '',
  };
  for (const fmt of FORMATS) {
    if (fmt.file) formatRules[fmt.key] = loadVector(VECTOR_DIR, fmt.file);
  }

  // ---------------------------------------------------------------------------
  // Run all combinations: model × format × scenario
  // ---------------------------------------------------------------------------

  interface RunResult {
    modelId: string;
    modelName: string;
    format: FormatKey;
    formatLabel: string;
    scenarioId: string;
    scenarioName: string;
    battery: 'A' | 'B';
    ruleResults: Record<string, boolean>;
    complianceRate: number;
  }


  // Parallel strategy: fire ALL format × scenario × model combinations concurrently (Tier 4 = 10k RPM)
  // Each combination already parallelizes across models internally.
  const combinations = FORMATS.flatMap((fmt) =>
    SCENARIOS.map((scenario) => ({ fmt, scenario })),
  );

  const settled = await Promise.allSettled(
    combinations.map(async ({ fmt, scenario }) => {
      // Build prompt once per format × scenario
      let prompt = '';
      if (fmt.key !== 'no_rules') {
        prompt += `## Rules\n\n${formatRules[fmt.key]}\n\n## Task\n\n`;
      }
      prompt += scenario.prompt;

      // For YON+Card, prepend the READ Card to the system prompt
      const sysPrompt = fmt.key === 'yon_card'
        ? READ_CARD + '\n\n---\n\n' + SYSTEM_PROMPT
        : SYSTEM_PROMPT;

      // Fire all models in parallel
      const modelSettled = await Promise.allSettled(
        models.map(async (model) => {
          const code = await askModel(model, prompt, 2500, sysPrompt);
          return { model, code };
        }),
      );

      // Collect results
      const results: RunResult[] = [];
      for (let i = 0; i < models.length; i++) {
        const model = models[i]!;
        const result = modelSettled[i]!;

        if (result.status === 'fulfilled') {
          const { code } = result.value;
          const ruleResults = scoreOutput(code, rubric.rules);

          const passed = Object.values(ruleResults).filter(Boolean).length;
          const total = Object.keys(ruleResults).length;
          const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;

          results.push({
            modelId: model.id,
            modelName: model.name,
            format: fmt.key,
            formatLabel: fmt.label,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            battery: scenario.battery,
            ruleResults,
            complianceRate,
          });

          console.log(
            `  ✓ ${model.name} × ${fmt.label} × ${scenario.name}: ${complianceRate}% (${passed}/${total})`,
          );
        } else {
          const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          console.warn(`  ✗ ${model.name} × ${fmt.label} × ${scenario.name}: ${msg.slice(0, 100)}`);

          // Record as 0% compliance on failure
          const failResults: Record<string, boolean> = {};
          for (const rule of rubric.rules) failResults[rule.id] = false;

          results.push({
            modelId: model.id,
            modelName: model.name,
            format: fmt.key,
            formatLabel: fmt.label,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            battery: scenario.battery,
            ruleResults: failResults,
            complianceRate: 0,
          });
        }
      }
      return results;
    }),
  );

  // Flatten all results
  const allResults: RunResult[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') allResults.push(...r.value);
    else throw r.reason;
  }

  // ---------------------------------------------------------------------------
  // Aggregate Results
  // ---------------------------------------------------------------------------

  function avgCompliance(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((s, r) => s + r.complianceRate, 0) / results.length);
  }

  function perRuleCompliance(results: RunResult[]): Record<string, number> {
    const ruleAcc: Record<string, { passed: number; total: number }> = {};
    for (const r of results) {
      for (const [ruleId, passed] of Object.entries(r.ruleResults)) {
        if (!ruleAcc[ruleId]) ruleAcc[ruleId] = { passed: 0, total: 0 };
        ruleAcc[ruleId]!.total++;
        if (passed) ruleAcc[ruleId]!.passed++;
      }
    }
    const result: Record<string, number> = {};
    for (const [ruleId, acc] of Object.entries(ruleAcc)) {
      result[ruleId] = acc.total > 0 ? Math.round((acc.passed / acc.total) * 100) : 0;
    }
    return result;
  }

  // Per-format averages
  const formatAvgs: Record<FormatKey, number> = {} as Record<FormatKey, number>;
  for (const fmt of FORMATS) {
    const fmtResults = allResults.filter((r) => r.format === fmt.key);
    formatAvgs[fmt.key] = avgCompliance(fmtResults);
  }

  // Per-battery averages
  const batteryA = allResults.filter((r) => r.battery === 'A');
  const batteryB = allResults.filter((r) => r.battery === 'B');

  const batteryAByFormat: Record<FormatKey, number> = {} as Record<FormatKey, number>;
  const batteryBByFormat: Record<FormatKey, number> = {} as Record<FormatKey, number>;
  for (const fmt of FORMATS) {
    batteryAByFormat[fmt.key] = avgCompliance(batteryA.filter((r) => r.format === fmt.key));
    batteryBByFormat[fmt.key] = avgCompliance(batteryB.filter((r) => r.format === fmt.key));
  }

  // YON vs NL delta (primary thesis comparison)
  const yonAvg = formatAvgs.yon ?? 0;
  const nlAvg = formatAvgs.nl ?? 0;
  const nlCasualAvg = formatAvgs.nl_casual ?? 0;
  const yonInstructedAvg = formatAvgs.yon_instructed ?? 0;
  const noRulesAvg = formatAvgs.no_rules ?? 0;
  const yonVsNl = yonAvg - nlAvg;
  const yonVsNlCasual = yonAvg - nlCasualAvg;

  // ---------------------------------------------------------------------------
  // Build Tests
  // ---------------------------------------------------------------------------

  const tests: TestResult[] = [];

  // Test 1: Battery A — Generation compliance
  tests.push({
    id: 'battery-a-compliance',
    name: 'Battery A: Generation Task Compliance',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_vs_nl_delta',
      value: avgCompliance(batteryA.filter((r) => r.format === 'yon')) -
             avgCompliance(batteryA.filter((r) => r.format === 'nl')),
      unit: 'pp',
    },
    secondaryMetrics: FORMATS.map((fmt) => ({
      name: `${fmt.key}_compliance`,
      value: batteryAByFormat[fmt.key] ?? 0,
      unit: '%',
    })),
    detail: `Battery A (generation): ${FORMATS.map((f) => `${f.label}=${batteryAByFormat[f.key]}%`).join(', ')}`,
  });

  // Test 2: Battery B — Adversarial compliance
  tests.push({
    id: 'battery-b-adversarial',
    name: 'Battery B: Adversarial Task Compliance',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'yon_vs_nl_delta',
      value: avgCompliance(batteryB.filter((r) => r.format === 'yon')) -
             avgCompliance(batteryB.filter((r) => r.format === 'nl')),
      unit: 'pp',
    },
    secondaryMetrics: FORMATS.map((fmt) => ({
      name: `${fmt.key}_compliance`,
      value: batteryBByFormat[fmt.key] ?? 0,
      unit: '%',
    })),
    detail: `Battery B (adversarial): ${FORMATS.map((f) => `${f.label}=${batteryBByFormat[f.key]}%`).join(', ')}`,
  });

  // Test 3: Overall format effect (3-way thesis comparison)
  tests.push({
    id: 'format-effect',
    name: 'Format Effect: 3-Way Thesis Comparison',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_vs_nl_overall', value: yonVsNl, unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_compliance', value: yonAvg, unit: '%' },
      { name: 'nl_emphatic_compliance', value: nlAvg, unit: '%' },
      { name: 'nl_casual_compliance', value: nlCasualAvg, unit: '%' },
      { name: 'yon_instructed_compliance', value: yonInstructedAvg, unit: '%' },
      { name: 'no_rules_compliance', value: noRulesAvg, unit: '%' },
      { name: 'format_induced_yon', value: yonAvg - noRulesAvg, unit: 'pp' },
      { name: 'format_induced_nl', value: nlAvg - noRulesAvg, unit: 'pp' },
      { name: 'format_induced_nl_casual', value: nlCasualAvg - noRulesAvg, unit: 'pp' },
    ],
    detail: `Overall: YON=${yonAvg}%, NL Emphatic=${nlAvg}%, NL Casual=${nlCasualAvg}%, YON+Inst=${yonInstructedAvg}%, NoRules=${noRulesAvg}%. YON vs NL: ${yonVsNl > 0 ? '+' : ''}${yonVsNl}pp`,
  });

  // Test 4: NL Emphatic vs NL Casual (wording strength gradient)
  tests.push({
    id: 'nl-wording-gradient',
    name: 'NL Wording Gradient: Emphatic vs Casual',
    passed: true,
    type: 'comparative',
    metric: { name: 'emphatic_vs_casual', value: nlAvg - nlCasualAvg, unit: 'pp' },
    secondaryMetrics: [
      { name: 'nl_emphatic', value: nlAvg, unit: '%' },
      { name: 'nl_casual', value: nlCasualAvg, unit: '%' },
      { name: 'yon_vs_casual', value: yonVsNlCasual, unit: 'pp' },
    ],
    detail: `NL Emphatic=${nlAvg}% vs NL Casual=${nlCasualAvg}% (Δ${nlAvg - nlCasualAvg > 0 ? '+' : ''}${nlAvg - nlCasualAvg}pp). YON vs Casual: ${yonVsNlCasual > 0 ? '+' : ''}${yonVsNlCasual}pp`,
    outcome: nlAvg - nlCasualAvg > 5 ? 'advantage' : nlAvg - nlCasualAvg < -5 ? 'disadvantage' : 'tied',
  });

  // Test 5: Per-model breakdown
  for (const model of models) {
    const modelResults = allResults.filter((r) => r.modelId === model.id);
    const modelFormatAvgs: Record<FormatKey, number> = {} as Record<FormatKey, number>;
    for (const fmt of FORMATS) {
      modelFormatAvgs[fmt.key] = avgCompliance(modelResults.filter((r) => r.format === fmt.key));
    }
    const modelYonVsNl = (modelFormatAvgs.yon ?? 0) - (modelFormatAvgs.nl ?? 0);

    tests.push({
      id: `per-model-${model.id}`,
      name: `Per-Model: ${model.name}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'yon_vs_nl', value: modelYonVsNl, unit: 'pp' },
      secondaryMetrics: FORMATS.map((fmt) => ({
        name: fmt.key,
        value: modelFormatAvgs[fmt.key] ?? 0,
        unit: '%',
      })),
      detail: `${model.name}: ${FORMATS.map((f) => `${f.label}=${modelFormatAvgs[f.key]}%`).join(', ')}`,
    });
  }

  // Test 6: Per-rule compliance across formats
  const perRuleYon = perRuleCompliance(allResults.filter((r) => r.format === 'yon'));
  const perRuleNl = perRuleCompliance(allResults.filter((r) => r.format === 'nl'));
  const perRuleNlCasual = perRuleCompliance(allResults.filter((r) => r.format === 'nl_casual'));

  tests.push({
    id: 'per-rule-breakdown',
    name: 'Per-Rule Compliance Breakdown',
    passed: true,
    type: 'measurement',
    metric: { name: 'rules_tested', value: rubric.rules.length, unit: 'count' },
    secondaryMetrics: rubric.rules.flatMap((rule) => [
      { name: `${rule.id}_yon`, value: perRuleYon[rule.id] ?? 0, unit: '%' },
      { name: `${rule.id}_nl_emphatic`, value: perRuleNl[rule.id] ?? 0, unit: '%' },
      { name: `${rule.id}_nl_casual`, value: perRuleNlCasual[rule.id] ?? 0, unit: '%' },
    ]),
    detail: rubric.rules
      .map(
        (r) =>
          `${r.id}: YON=${perRuleYon[r.id]}% NL=${perRuleNl[r.id]}% NL-Casual=${perRuleNlCasual[r.id]}%`,
      )
      .join('; '),
  });

  // ---------------------------------------------------------------------------
  // Battery C — Absorbed Cognitive Load Tests
  // ---------------------------------------------------------------------------

  // C1: Instruction Adherence (adapted from cognitive-load test 1)
  // Tests whether YON @RULE notation steers code generation better than NL rules.
  {
    const yonRules = loadVector('cognitive', 'rules-5.yon');
    const nlRules = formatRules.nl; // emphatic NL from enforcement-salience vectors
    const nlCasualRulesC = formatRules.nl_casual; // casual NL

    const task = 'Write a TypeScript function that processes a user signup. Follow ALL rules exactly.';
    const suffix = 'Output ONLY the TypeScript code, no explanation.';

    const adherenceRules = [
      { name: 'strict_types', check: (code: string) => !code.includes(': any') && !code.includes(':any') },
      { name: 'try_catch', check: (code: string) => code.includes('try') && code.includes('catch') },
      { name: 'no_console_log', check: (code: string) => !code.includes('console.log') },
      { name: 'return_success', check: (code: string) => code.includes('success') },
    ];

    // Run across all models × 3 formats
    const cFormats = [
      { key: 'yon', rules: yonRules },
      { key: 'nl_emphatic', rules: nlRules },
      { key: 'nl_casual', rules: nlCasualRulesC },
    ] as const;

    const cResults: { format: string; scores: number[] }[] = [];

    for (const cf of cFormats) {
      const prompt = `You are given the following specification. ${task}\n\n${cf.rules}\n\n${suffix}`;
      const settled = await Promise.allSettled(
        models.map(async (model) => {
          const code = await askModel(model, prompt, 2500, SYSTEM_PROMPT);
          let score = 0;
          for (const rule of adherenceRules) {
            if (rule.check(code)) score++;
          }
          return score;
        }),
      );
      const scores = settled
        .filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled')
        .map((r) => r.value);
      cResults.push({ format: cf.key, scores });
    }

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100 / adherenceRules.length) : 0;
    const yonAdh = avg(cResults[0]?.scores ?? []);
    const nlAdh = avg(cResults[1]?.scores ?? []);
    const nlCasAdh = avg(cResults[2]?.scores ?? []);

    tests.push({
      id: 'battery-c-instruction-adherence',
      name: 'Battery C: Instruction Adherence (absorbed from cognitive-load)',
      passed: true,
      type: 'comparative',
      metric: { name: 'yon_vs_nl_adherence', value: yonAdh - nlAdh, unit: 'pp' },
      secondaryMetrics: [
        { name: 'yon_adherence', value: yonAdh, unit: '%' },
        { name: 'nl_emphatic_adherence', value: nlAdh, unit: '%' },
        { name: 'nl_casual_adherence', value: nlCasAdh, unit: '%' },
      ],
      detail: `Instruction adherence: YON=${yonAdh}%, NL Emphatic=${nlAdh}%, NL Casual=${nlCasAdh}%`,
    });
  }

  // C2: Output Determinism (adapted from cognitive-load test 4)
  // Measures output variance across 3 generations — higher Jaccard similarity = more deterministic.
  {
    const yonRules = loadVector('cognitive', 'rules-5.yon');
    const nlRules = formatRules.nl;
    const ambiguousTask = 'Write a function to handle user authentication';

    const yonPrompt = `${yonRules}\n\nGiven the rules above, ${ambiguousTask}. Output ONLY the TypeScript function.`;
    const nlPrompt = `Rules:\n${nlRules}\n\nTask: ${ambiguousTask}. Output ONLY the TypeScript function.`;

    // Use first model only for determinism test (variance between generations, not models)
    const model = models[0]!;

    const settled = await Promise.allSettled([
      askModel(model, yonPrompt, 2500, SYSTEM_PROMPT),
      askModel(model, yonPrompt, 2500, SYSTEM_PROMPT),
      askModel(model, yonPrompt, 2500, SYSTEM_PROMPT),
      askModel(model, nlPrompt, 2500, SYSTEM_PROMPT),
      askModel(model, nlPrompt, 2500, SYSTEM_PROMPT),
      askModel(model, nlPrompt, 2500, SYSTEM_PROMPT),
    ]);

    function tokenize(code: string): Set<string> {
      return new Set(code.split(/\s+/).filter((t) => t.length > 0));
    }
    function jaccard(a: Set<string>, b: Set<string>): number {
      const intersection = new Set([...a].filter((x) => b.has(x)));
      const union = new Set([...a, ...b]);
      return union.size > 0 ? intersection.size / union.size : 1;
    }

    const outputs = settled.map((r) => r.status === 'fulfilled' ? r.value : '');
    const yonTokens = [tokenize(outputs[0]!), tokenize(outputs[1]!), tokenize(outputs[2]!)];
    const nlTokens = [tokenize(outputs[3]!), tokenize(outputs[4]!), tokenize(outputs[5]!)];

    const yonSim = (
      jaccard(yonTokens[0]!, yonTokens[1]!) +
      jaccard(yonTokens[0]!, yonTokens[2]!) +
      jaccard(yonTokens[1]!, yonTokens[2]!)
    ) / 3;

    const nlSim = (
      jaccard(nlTokens[0]!, nlTokens[1]!) +
      jaccard(nlTokens[0]!, nlTokens[2]!) +
      jaccard(nlTokens[1]!, nlTokens[2]!)
    ) / 3;

    tests.push({
      id: 'battery-c-output-determinism',
      name: 'Battery C: Output Determinism (absorbed from cognitive-load)',
      passed: true,
      type: 'comparative',
      outcome: 'tied',
      metric: {
        name: 'output_determinism',
        value: Math.round(yonSim * 100),
        unit: '%',
        comparison: {
          baseline: Math.round(nlSim * 100),
          baselineLabel: 'NL determinism',
          delta: `${Math.round((yonSim - nlSim) * 100)}%`,
        },
      },
      detail: `Output determinism (${model.name}): YON ${(yonSim * 100).toFixed(1)}% vs NL ${(nlSim * 100).toFixed(1)}%. Measures consistency across 3 generations via Jaccard similarity.`,
    });
  }

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'enforcement-salience',
    suiteName: 'Enforcement Salience',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runEnforcementSalience };
