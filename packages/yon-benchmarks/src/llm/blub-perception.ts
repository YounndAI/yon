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
 * Blub Perception Suite — Scope Resolution at Escalating Depth
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Hierarchical visibility vs syntactic nesting
 *
 * Hypothesis: YON's @SEC + @RULE hierarchy makes scope resolution
 * visible at depth. JSON's nested arrays bury it.
 *
 * Tests scope resolution accuracy at 3 depths (3, 5, 7 levels)
 * across YON, JSON, YAML, and Markdown formats. Each scenario has
 * a counter-intuitive correct answer requiring full scope chain traversal.
 *
 * Scoring: Binary (correct/incorrect) + override rule citation.
 * Secondary metric: token count per format per depth.
 *
 * Requires: At least one LLM API key in .env.local
 */

import { createFullTierModels, getActiveModels, askModel } from '../core/models.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { loadVector } from '../core/vectors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormatKey = 'yon' | 'json' | 'yaml' | 'markdown';

interface DepthScenario {
  depth: number;
  question: string;
  /** Expected correct answer: true = action allowed, false = action blocked */
  expectedAnswer: boolean;
  /** The name of the override rule that determines the correct answer */
  expectedRule: string;
  vectors: Record<FormatKey, string>;
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = [
  'You are a compliance analyst. Given a set of rules with scoped overrides,',
  'determine whether a specific action is allowed or blocked.',
  '',
  'IMPORTANT: Structure your response EXACTLY as follows:',
  'Answer: YES or NO',
  'Rule: [the specific rule name or ID that determines the answer]',
  'Reasoning: [your explanation of the scope chain]',
].join('\n');

// ---------------------------------------------------------------------------
// Vectors — 3 Depths × 2 Formats — loaded from vectors/blub-perception/
// ---------------------------------------------------------------------------

const SCENARIOS: DepthScenario[] = [
  // Depth 3: Global → Module → Exception
  {
    depth: 3,
    question:
      'A developer wants to use console.log in the telemetry module for debug tracing. Is this allowed?',
    expectedAnswer: true,
    expectedRule: 'telemetry-debug-override',
    vectors: {
      yon: loadVector('blub-perception', 'depth-3.yon'),
      json: loadVector('blub-perception', 'depth-3.json'),
      yaml: loadVector('blub-perception', 'depth-3.yaml'),
      markdown: loadVector('blub-perception', 'depth-3.md'),
    },
  },

  // Depth 5: Global → Domain → Service → Version → Exception
  {
    depth: 5,
    question:
      'The payments-v2 service needs to call an external credit-check API synchronously during checkout. Is this allowed?',
    expectedAnswer: true,
    expectedRule: 'payments-v2-sync-exception',
    vectors: {
      yon: loadVector('blub-perception', 'depth-5.yon'),
      json: loadVector('blub-perception', 'depth-5.json'),
      yaml: loadVector('blub-perception', 'depth-5.yaml'),
      markdown: loadVector('blub-perception', 'depth-5.md'),
    },
  },

  // Depth 7: Global → Platform → Domain → Service → Version → Region → Exception
  {
    depth: 7,
    question:
      'The EU deployment of auth-v3 needs to store user session tokens in a Redis cluster without encryption-at-rest. Is this allowed?',
    expectedAnswer: true,
    expectedRule: 'eu-auth-v3-redis-exception',
    vectors: {
      yon: loadVector('blub-perception', 'depth-7.yon'),
      json: loadVector('blub-perception', 'depth-7.json'),
      yaml: loadVector('blub-perception', 'depth-7.yaml'),
      markdown: loadVector('blub-perception', 'depth-7.md'),
    },
  },
];



// ---------------------------------------------------------------------------
// Answer Extraction
// ---------------------------------------------------------------------------

function extractAnswer(response: string): { answer: boolean | null; citedRule: string | null } {
  const lower = response.toLowerCase();

  // Try structured extraction first: "Answer: YES" or "Answer: NO"
  const answerMatch = lower.match(/answer:\s*(yes|no)\b/);
  let answer: boolean | null = null;
  if (answerMatch) {
    answer = answerMatch[1] === 'yes';
  } else {
    // Fallback: scan first 100 chars for yes/no
    const head = lower.slice(0, 100);
    if (/\byes\b/.test(head)) answer = true;
    else if (/\bno\b/.test(head)) answer = false;
    else if (/\ballowed\b/.test(head)) answer = true;
    else if (/\bblocked\b/.test(head) || /\bnot allowed\b/.test(head)) answer = false;
  }

  // Extract cited rule
  const ruleMatch = response.match(/Rule:\s*(.+?)(?:\n|$)/i);
  const citedRule = ruleMatch ? ruleMatch[1]!.trim() : null;

  return { answer, citedRule };
}

// ---------------------------------------------------------------------------
// Token Count (approximate)
// ---------------------------------------------------------------------------

function approxTokens(text: string): number {
  // Rough estimation: ~4 chars per token for English/code
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  // Model setup with fallback
  let models = createFullTierModels();
  if (models.length === 0) models = getActiveModels(true);

  if (models.length === 0) {
    return {
      suiteId: 'blub-perception',
      suiteName: 'Blub Perception',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  const FORMAT_KEYS: FormatKey[] = ['yon', 'json', 'yaml', 'markdown'];
  const FORMAT_LABELS: Record<FormatKey, string> = { yon: 'YON', json: 'JSON', yaml: 'YAML', markdown: 'Markdown' };

  console.log(`\n  Blub Perception: ${models.length} models × ${SCENARIOS.length} depths × ${FORMAT_KEYS.length} formats\n`);

  // ---------------------------------------------------------------------------
  // Group models by provider for cross-provider parallelism
  // ---------------------------------------------------------------------------
  const providerGroups = new Map<string, typeof models>();
  for (const model of models) {
    const group = providerGroups.get(model.providerKey) ?? [];
    group.push(model);
    providerGroups.set(model.providerKey, group);
  }

  // Results accumulator
  interface RunResult {
    modelId: string;
    modelName: string;
    depth: number;
    format: FormatKey;
    correct: boolean;
    citedCorrectRule: boolean;
    tokenCount: number;
  }
  const allResults: RunResult[] = [];

  // Run provider groups in parallel, models within each group sequentially
  const groupEntries = [...providerGroups.entries()];
  const settled = await Promise.allSettled(
    groupEntries.map(async ([providerKey, providerModels]) => {
      const groupResults: RunResult[] = [];
      for (const model of providerModels) {
        for (const scenario of SCENARIOS) {
          for (const formatKey of FORMAT_KEYS) {
            try {
              const vector = scenario.vectors[formatKey];
              const formatDesc = formatKey === 'yon' ? 'YON specification'
                : formatKey === 'json' ? 'JSON configuration'
                : formatKey === 'yaml' ? 'YAML configuration'
                : 'Markdown document';
              const prompt = [
                `The following ${formatDesc} defines a hierarchical rule system with scoped overrides:\n`,
                vector,
                '\n---\n',
                `Question: ${scenario.question}`,
              ].join('\n');

              const response = await askModel(model, prompt, 800, SYSTEM_PROMPT);
              const { answer, citedRule } = extractAnswer(response);

              const correct = answer === scenario.expectedAnswer;
              const citedCorrectRule = citedRule
                ? citedRule.toLowerCase().includes(scenario.expectedRule.toLowerCase())
                : false;

              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                depth: scenario.depth,
                format: formatKey,
                correct,
                citedCorrectRule,
                tokenCount: approxTokens(vector),
              });

              console.log(
                `  ${correct ? '✓' : '✗'} ${model.name} × ${FORMAT_LABELS[formatKey]} × depth-${scenario.depth}: ${correct ? 'correct' : 'wrong'}${citedCorrectRule ? ' (cited rule)' : ''}`,
              );
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`  ✗ ${model.name} × ${formatKey} × depth-${scenario.depth}: ${msg.slice(0, 80)}`);
              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                depth: scenario.depth,
                format: formatKey,
                correct: false,
                citedCorrectRule: false,
                tokenCount: approxTokens(scenario.vectors[formatKey]),
              });
            }
          }
        }
      }
      console.log(`  ▸ Provider ${providerKey}: ${groupResults.length} results collected`);
      return groupResults;
    }),
  );

  // Flatten results
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    }
  }

  // ---------------------------------------------------------------------------
  // Aggregation Helpers
  // ---------------------------------------------------------------------------

  function accuracy(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  }

  function citationRate(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round((results.filter((r) => r.citedCorrectRule).length / results.length) * 100);
  }

  function avgTokens(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((s, r) => s + r.tokenCount, 0) / results.length);
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  // Test 1–3: Per-depth accuracy by format
  for (const scenario of SCENARIOS) {
    const depthResults = allResults.filter((r) => r.depth === scenario.depth);
    const yonResults = depthResults.filter((r) => r.format === 'yon');
    const jsonResults = depthResults.filter((r) => r.format === 'json');
    const yamlResults = depthResults.filter((r) => r.format === 'yaml');
    const mdResults = depthResults.filter((r) => r.format === 'markdown');

    const yonAcc = accuracy(yonResults);
    const jsonAcc = accuracy(jsonResults);
    const yamlAcc = accuracy(yamlResults);
    const mdAcc = accuracy(mdResults);
    const delta = yonAcc - jsonAcc;

    tests.push({
      id: `depth-${scenario.depth}-accuracy`,
      name: `Depth ${scenario.depth}: Scope Resolution Accuracy`,
      passed: true,
      type: 'comparative',
      metric: { name: 'yon_vs_json_delta', value: delta, unit: 'pp' },
      secondaryMetrics: [
        { name: 'yon_accuracy', value: yonAcc, unit: '%' },
        { name: 'json_accuracy', value: jsonAcc, unit: '%' },
        { name: 'yaml_accuracy', value: yamlAcc, unit: '%' },
        { name: 'md_accuracy', value: mdAcc, unit: '%' },
        { name: 'yon_citation_rate', value: citationRate(yonResults), unit: '%' },
        { name: 'json_citation_rate', value: citationRate(jsonResults), unit: '%' },
        { name: 'yon_tokens', value: avgTokens(yonResults), unit: 'tokens' },
        { name: 'json_tokens', value: avgTokens(jsonResults), unit: 'tokens' },
      ],
      detail: `Depth ${scenario.depth}: YON=${yonAcc}% vs JSON=${jsonAcc}% vs YAML=${yamlAcc}% vs MD=${mdAcc}% (Δyon-json ${delta > 0 ? '+' : ''}${delta}pp)`,
    });
  }

  // Test 4: Breakpoint detection — at which depth does JSON accuracy collapse?
  const yonByDepth = SCENARIOS.map((s) => accuracy(allResults.filter((r) => r.depth === s.depth && r.format === 'yon')));
  const jsonByDepth = SCENARIOS.map((s) => accuracy(allResults.filter((r) => r.depth === s.depth && r.format === 'json')));
  const deltaByDepth = yonByDepth.map((y, i) => y - (jsonByDepth[i] ?? 0));

  // Breakpoint = first depth where delta exceeds 20pp
  const breakpointIdx = deltaByDepth.findIndex((d) => d > 20);
  const breakpointDepth = breakpointIdx >= 0 ? SCENARIOS[breakpointIdx]!.depth : -1;

  tests.push({
    id: 'breakpoint-detection',
    name: 'Breakpoint Detection: Depth Where JSON Advantage Collapses',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'breakpoint_depth',
      value: breakpointDepth,
      unit: 'levels',
    },
    secondaryMetrics: SCENARIOS.map((s, i) => ({
      name: `delta_depth_${s.depth}`,
      value: deltaByDepth[i] ?? 0,
      unit: 'pp',
    })),
    detail: breakpointDepth > 0
      ? `JSON accuracy drops significantly at depth ${breakpointDepth}. Deltas: ${SCENARIOS.map((s, i) => `d${s.depth}=${deltaByDepth[i]}pp`).join(', ')}`
      : `No breakpoint detected. Deltas: ${SCENARIOS.map((s, i) => `d${s.depth}=${deltaByDepth[i]}pp`).join(', ')}`,
  });

  // Test 5: Overall format effect
  const yonAll = allResults.filter((r) => r.format === 'yon');
  const jsonAll = allResults.filter((r) => r.format === 'json');
  const yamlAll = allResults.filter((r) => r.format === 'yaml');
  const mdAll = allResults.filter((r) => r.format === 'markdown');

  tests.push({
    id: 'overall-format-effect',
    name: 'Overall: 4-Way Scope Resolution Comparison',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_vs_json_overall', value: accuracy(yonAll) - accuracy(jsonAll), unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_overall_accuracy', value: accuracy(yonAll), unit: '%' },
      { name: 'json_overall_accuracy', value: accuracy(jsonAll), unit: '%' },
      { name: 'yaml_overall_accuracy', value: accuracy(yamlAll), unit: '%' },
      { name: 'md_overall_accuracy', value: accuracy(mdAll), unit: '%' },
      { name: 'yon_overall_citation', value: citationRate(yonAll), unit: '%' },
      { name: 'json_overall_citation', value: citationRate(jsonAll), unit: '%' },
    ],
    detail: `Overall: YON=${accuracy(yonAll)}% vs JSON=${accuracy(jsonAll)}% vs YAML=${accuracy(yamlAll)}% vs MD=${accuracy(mdAll)}%`,
  });

  // Test 6: Per-model breakdown
  for (const model of models) {
    const modelResults = allResults.filter((r) => r.modelId === model.id);
    const modelYon = accuracy(modelResults.filter((r) => r.format === 'yon'));
    const modelJson = accuracy(modelResults.filter((r) => r.format === 'json'));
    const modelYaml = accuracy(modelResults.filter((r) => r.format === 'yaml'));
    const modelMd = accuracy(modelResults.filter((r) => r.format === 'markdown'));

    tests.push({
      id: `per-model-${model.id}`,
      name: `Per-Model: ${model.name}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'yon_vs_json', value: modelYon - modelJson, unit: 'pp' },
      secondaryMetrics: [
        { name: 'yon_accuracy', value: modelYon, unit: '%' },
        { name: 'json_accuracy', value: modelJson, unit: '%' },
        { name: 'yaml_accuracy', value: modelYaml, unit: '%' },
        { name: 'md_accuracy', value: modelMd, unit: '%' },
      ],
      detail: `${model.name}: YON=${modelYon}% vs JSON=${modelJson}% vs YAML=${modelYaml}% vs MD=${modelMd}%`,
    });
  }

  // Test 7: Token density comparison
  tests.push({
    id: 'token-density',
    name: 'Token Density: All Formats',
    passed: true,
    type: 'measurement',
    metric: {
      name: 'json_to_yon_ratio',
      value: Math.round((avgTokens(jsonAll) / Math.max(avgTokens(yonAll), 1)) * 100),
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'yon_avg_tokens', value: avgTokens(yonAll), unit: 'tokens' },
      { name: 'json_avg_tokens', value: avgTokens(jsonAll), unit: 'tokens' },
      { name: 'yaml_avg_tokens', value: avgTokens(yamlAll), unit: 'tokens' },
      { name: 'md_avg_tokens', value: avgTokens(mdAll), unit: 'tokens' },
    ],
    detail: `Avg tokens: YON=${avgTokens(yonAll)} JSON=${avgTokens(jsonAll)} YAML=${avgTokens(yamlAll)} MD=${avgTokens(mdAll)}`,
  });

  // ---------------------------------------------------------------------------
  // Battery B — Structural Feature Tests (4 new question types)
  // ---------------------------------------------------------------------------

  interface FeatureScenario {
    id: string;
    name: string;
    question: string;
    /** Keywords that must appear in a correct answer (case-insensitive, any-match) */
    expectedKeywords: string[];
    /** Minimum keywords that must match for 'correct' */
    minMatches: number;
    vectors: Record<FormatKey, string>;
  }

  const FEATURE_SCENARIOS: FeatureScenario[] = [
    // Q1: Type Extraction — Can the LLM identify explicit types?
    {
      id: 'type-extraction',
      name: 'Type Extraction: Explicit vs Implicit Types',
      question: 'What is the data type of the "max_requests" field in the Free Tier config? Is "burst_allowed" a boolean or a string? What is the exact data type of "cooldown_factor"?',
      expectedKeywords: ['int', 'integer', 'boolean', 'bool', 'float', 'decimal', 'number'],
      minMatches: 2,
      vectors: {
        yon: loadVector('blub-perception', 'type-extraction.yon'),
        json: loadVector('blub-perception', 'type-extraction.json'),
        yaml: loadVector('blub-perception', 'type-extraction.yaml'),
        markdown: loadVector('blub-perception', 'type-extraction.md'),
      },
    },
    // Q2: Rule Severity Ranking — Can the LLM rank rules by enforcement level?
    {
      id: 'severity-ranking',
      name: 'Rule Severity: Priority Ordering',
      question: 'Rank all 8 rules from highest to lowest severity. Which rules are mandatory (must be followed), which are recommended, and which are optional? List the 2 rules that MUST NOT be violated.',
      expectedKeywords: ['validate-types', 'sanitize-html', 'escape-json', 'must_not', 'must not'],
      minMatches: 2,
      vectors: {
        yon: loadVector('blub-perception', 'severity-ranking.yon'),
        json: loadVector('blub-perception', 'severity-ranking.json'),
        yaml: loadVector('blub-perception', 'severity-ranking.yaml'),
        markdown: loadVector('blub-perception', 'severity-ranking.md'),
      },
    },
    // Q3: Cross-Section Dependency — Can the LLM trace inter-section dependencies?
    {
      id: 'cross-section',
      name: 'Cross-Section: Inter-Stage Dependencies',
      question: 'Which stages does the Deploy Stage depend on? If the Build Stage fails, which other stages are affected and why? List all cross-stage data flows.',
      expectedKeywords: ['build', 'test', 'checksum', 'coverage', 'artifact'],
      minMatches: 3,
      vectors: {
        yon: loadVector('blub-perception', 'cross-section.yon'),
        json: loadVector('blub-perception', 'cross-section.json'),
        yaml: loadVector('blub-perception', 'cross-section.yaml'),
        markdown: loadVector('blub-perception', 'cross-section.md'),
      },
    },
    // Q4: Reference Resolution — Can the LLM trace rid: references? (Most likely YON differentiator)
    {
      id: 'ref-resolution',
      name: 'Reference Resolution: Cross-Reference Chain Tracing',
      question: 'For the compliance check that runs weekly with automated method — which specific rule does it verify? What is that rule\'s exact enforcement requirement? Trace the full reference chain from the check to the rule.',
      expectedKeywords: ['password-policy', 'password', '12 characters', 'uppercase', 'lowercase'],
      minMatches: 2,
      vectors: {
        yon: loadVector('blub-perception', 'ref-resolution.yon'),
        json: loadVector('blub-perception', 'ref-resolution.json'),
        yaml: loadVector('blub-perception', 'ref-resolution.yaml'),
        markdown: loadVector('blub-perception', 'ref-resolution.md'),
      },
    },
  ];

  // Run Battery B across all models × 4 formats
  console.log(`\n  Battery B: ${FEATURE_SCENARIOS.length} question types × ${FORMAT_KEYS.length} formats × ${models.length} models\n`);

  interface FeatureResult {
    modelId: string;
    modelName: string;
    scenarioId: string;
    format: FormatKey;
    score: number;       // keyword matches
    maxScore: number;    // minMatches target
    correct: boolean;    // score >= minMatches
  }
  const featureResults: FeatureResult[] = [];

  // Parallel: all scenario × format × model combinations
  const featureCombos = FEATURE_SCENARIOS.flatMap((scenario) =>
    FORMAT_KEYS.flatMap((fmt) =>
      models.map((model) => ({ scenario, fmt, model })),
    ),
  );

  const featureSettled = await Promise.allSettled(
    featureCombos.map(async ({ scenario, fmt, model }) => {
      const vector = scenario.vectors[fmt];
      const formatDesc = FORMAT_LABELS[fmt];
      const prompt = [
        `The following ${formatDesc} document defines a configuration or policy:\n`,
        vector,
        '\n---\n',
        `Question: ${scenario.question}`,
        '\nProvide a detailed answer based ONLY on the document above.',
      ].join('\n');

      const response = await askModel(model, prompt, 800, SYSTEM_PROMPT);
      const lower = response.toLowerCase();

      // Score: count keyword matches
      let matches = 0;
      for (const kw of scenario.expectedKeywords) {
        if (lower.includes(kw.toLowerCase())) matches++;
      }
      const correct = matches >= scenario.minMatches;

      console.log(
        `  ${correct ? '✓' : '✗'} ${model.name} × ${formatDesc} × ${scenario.id}: ${matches}/${scenario.minMatches} keywords`,
      );

      return {
        modelId: model.id,
        modelName: model.name,
        scenarioId: scenario.id,
        format: fmt,
        score: matches,
        maxScore: scenario.minMatches,
        correct,
      } satisfies FeatureResult;
    }),
  );

  for (const r of featureSettled) {
    if (r.status === 'fulfilled') featureResults.push(r.value);
  }

  // Battery B aggregation — per question type, 4-way format comparison
  for (const scenario of FEATURE_SCENARIOS) {
    const sResults = featureResults.filter((r) => r.scenarioId === scenario.id);

    const accByFormat = Object.fromEntries(
      FORMAT_KEYS.map((fmt) => {
        const fmtResults = sResults.filter((r) => r.format === fmt);
        const acc = fmtResults.length > 0
          ? Math.round((fmtResults.filter((r) => r.correct).length / fmtResults.length) * 100)
          : 0;
        return [fmt, acc];
      }),
    ) as Record<FormatKey, number>;

    const yonVsJson = accByFormat.yon - accByFormat.json;

    tests.push({
      id: `feature-${scenario.id}`,
      name: `Feature: ${scenario.name}`,
      passed: true,
      type: 'comparative',
      metric: { name: 'yon_vs_json_delta', value: yonVsJson, unit: 'pp' },
      secondaryMetrics: FORMAT_KEYS.map((fmt) => ({
        name: `${fmt}_accuracy`,
        value: accByFormat[fmt],
        unit: '%',
      })),
      detail: `${scenario.name}: YON=${accByFormat.yon}% JSON=${accByFormat.json}% YAML=${accByFormat.yaml}% MD=${accByFormat.markdown}%`,
    });
  }

  // Battery B summary — overall feature test accuracy by format
  const featureAccByFormat = Object.fromEntries(
    FORMAT_KEYS.map((fmt) => {
      const fmtResults = featureResults.filter((r) => r.format === fmt);
      const acc = fmtResults.length > 0
        ? Math.round((fmtResults.filter((r) => r.correct).length / fmtResults.length) * 100)
        : 0;
      return [fmt, acc];
    }),
  ) as Record<FormatKey, number>;

  tests.push({
    id: 'feature-battery-summary',
    name: 'Battery B: Structural Feature Tests Summary',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_vs_json_features', value: featureAccByFormat.yon - featureAccByFormat.json, unit: 'pp' },
    secondaryMetrics: FORMAT_KEYS.map((fmt) => ({
      name: `${fmt}_feature_accuracy`,
      value: featureAccByFormat[fmt],
      unit: '%',
    })),
    detail: `Battery B overall: YON=${featureAccByFormat.yon}% JSON=${featureAccByFormat.json}% YAML=${featureAccByFormat.yaml}% MD=${featureAccByFormat.markdown}%`,
  });

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'blub-perception',
    suiteName: 'Blub Perception',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runBlubPerception };
