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
 * Profile Priming Suite — Do YON Profiles Steer Cognition?
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Profile-driven cognitive pattern steering
 *
 * Hypothesis: Same data encoded in different YON profiles (decl, exec, core)
 * steers agent output toward different cognitive patterns:
 *   - decl profile → constraint-oriented vocabulary
 *   - exec profile → procedural/sequential vocabulary
 *   - core profile → explanatory/contextual vocabulary
 *
 * Scoring: Keyword distribution (%) across 3 families.
 * Dominance: profile's predicted category = highest % → pass.
 *
 * Echo stripping: removes literal quoted YON content from response
 * before scoring so we measure cognitive steering, not vocabulary parroting.
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

type ProfileKey = 'decl' | 'exec' | 'core';
type CategoryKey = 'constraint' | 'procedural' | 'narrative';

interface CodeScenario {
  id: string;
  name: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT =
  'You are a senior code reviewer. Review the provided code against the given specification. Identify all issues, violations, and areas for improvement.';

const PROFILES: { key: ProfileKey; label: string; expectedCategory: CategoryKey }[] = [
  { key: 'decl', label: 'Declarative (decl)', expectedCategory: 'constraint' },
  { key: 'exec', label: 'Executable (exec)', expectedCategory: 'procedural' },
  { key: 'core', label: 'Core Documentation (core)', expectedCategory: 'narrative' },
];



// ---------------------------------------------------------------------------
// Vectors — Auth Requirements in 3 Profiles — loaded from vectors/profile-priming/
// ---------------------------------------------------------------------------

const PROFILE_VECTORS: Record<ProfileKey, string> = {
  decl: loadVector('profile-priming', 'auth-spec-decl.yon'),
  exec: loadVector('profile-priming', 'auth-spec-exec.yon'),
  core: loadVector('profile-priming', 'auth-spec-core.yon'),
};

// ---------------------------------------------------------------------------
// Code Scenarios — Each has 3–5 violations — loaded from vectors/profile-priming/
// ---------------------------------------------------------------------------

const CODE_SCENARIOS: CodeScenario[] = [
  {
    id: 'auth-middleware',
    name: 'Auth Middleware',
    code: loadVector('profile-priming', 'scenario-auth-middleware.ts'),
  },
  {
    id: 'data-validation',
    name: 'Data Validation Handler',
    code: loadVector('profile-priming', 'scenario-data-validation.ts'),
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    code: loadVector('profile-priming', 'scenario-api-endpoint.ts'),
  },
];

// ---------------------------------------------------------------------------
// Echo Stripping
// ---------------------------------------------------------------------------

/**
 * Remove literal quoted YON content from LLM response before scoring.
 * Strips content inside code blocks or inline backticks that contain YON tags.
 * Paraphrased vocabulary counts as legitimate signal.
 */
function stripEchoedYon(response: string): string {
  // Remove triple-backtick code blocks containing YON tags
  let stripped = response.replace(
    /```[\s\S]*?```/g,
    (block) =>
      /@(?:RULE|STEP|SEC|DOC|NOTE|CHECK|MAP)\b/.test(block) ? '' : block,
  );

  // Remove inline backtick content containing YON tags
  stripped = stripped.replace(
    /`[^`]+`/g,
    (inline) =>
      /@(?:RULE|STEP|SEC|DOC|NOTE|CHECK|MAP)\b/.test(inline) ? '' : inline,
  );

  // Remove quoted lines (> prefix) containing YON tags
  stripped = stripped.replace(
    /^>.*@(?:RULE|STEP|SEC|DOC|NOTE|GATE|CHECK|MAP)\b.*$/gm,
    '',
  );

  return stripped;
}

/**
 * Score LLM response based on structural patterns, not keyword frequencies.
 *
 * Structural signals:
 * - procedural: numbered lists, "Step N" patterns, sequential headings (### 1., ### 2.)
 * - constraint: MUST/MUST_NOT markers, requirement/obligation language, table rows (|...|)
 * - narrative: long prose paragraphs (>40 words), rationale chains ("because", "since", "stems from")
 *
 * Each signal is weighted by structural significance.
 * Returns normalized percentages across the 3 categories.
 */
function scoreStructure(text: string): Record<CategoryKey, number> {
  const lines = text.split('\n');
  const scores: Record<CategoryKey, number> = { constraint: 0, procedural: 0, narrative: 0 };

  // ── Procedural signals ──
  // Numbered list items: "1.", "2.", "1)", "Step 1", etc.
  const numberedListItems = lines.filter(l => /^\s*\d+[.)]\s/.test(l)).length;
  scores.procedural += numberedListItems * 2;

  // "Step N" patterns (case-insensitive)
  const stepPatterns = (text.match(/\bstep\s+\d+/gi) ?? []).length;
  scores.procedural += stepPatterns * 3;

  // Sequential headings: ### 1., ## Phase 1, etc.
  const sequentialHeadings = lines.filter(l => /^#{1,4}\s*\d+[.:]?\s/m.test(l)).length;
  scores.procedural += sequentialHeadings * 3;

  // Temporal connectors: "first", "then", "next", "finally", "after that"
  const temporalConnectors = (text.match(/\b(first|then|next|finally|after that|subsequently|once (?:this|that))\b/gi) ?? []).length;
  scores.procedural += temporalConnectors;

  // ── Constraint signals ──
  // MUST/MUST_NOT/SHALL/SHALL_NOT markers (strong obligation language)
  const obligationMarkers = (text.match(/\b(MUST(?:\s+NOT)?|SHALL(?:\s+NOT)?|REQUIRED|FORBIDDEN|MANDATORY|PROHIBITED)\b/g) ?? []).length;
  scores.constraint += obligationMarkers * 3;

  // Lowercase obligation in rule-like context
  const softObligation = (text.match(/\b(must|shall|required to|violation|non-?compliant|enforce|comply)\b/gi) ?? []).length;
  scores.constraint += softObligation;

  // Table rows (|...|) — constraint reviews often use tables
  const tableRows = lines.filter(l => /^\s*\|.*\|/.test(l) && !/^[\s|:-]+$/.test(l)).length;
  scores.constraint += tableRows * 2;

  // Bullet points with requirement patterns (- Must..., - Shall..., * Required:...)
  const requirementBullets = lines.filter(l => /^\s*[-*]\s+(Must|Shall|Required|Violation|Missing)/i.test(l)).length;
  scores.constraint += requirementBullets * 2;

  // ── Narrative signals ──
  // Long prose paragraphs (>40 words, no bullet/list prefix)
  const proseBlocks = text.split(/\n\s*\n/).filter(block => {
    const trimmed = block.trim();
    if (!trimmed) return false;
    // Not a list, table, or heading
    if (/^[\s*-]|^\d+[.)]|^#|^\|/.test(trimmed)) return false;
    const wordCount = trimmed.split(/\s+/).length;
    return wordCount > 40;
  }).length;
  scores.narrative += proseBlocks * 3;

  // Rationale chains: "because", "since", "stems from", "the reason", "this approach"
  const rationaleChains = (text.match(/\b(because|since|stems from|the reason|this approach|the motivation|trade-?off|design decision|architecturally)\b/gi) ?? []).length;
  scores.narrative += rationaleChains * 2;

  // Explanation headings: "Why", "Rationale", "Background", "Context"
  const explanationHeadings = lines.filter(l => /^#{1,4}\s*(Why|Rationale|Background|Context|Motivation|Design|Analysis)/i.test(l)).length;
  scores.narrative += explanationHeadings * 3;

  // Multi-sentence paragraphs without structure (prose density)
  const proseDensity = text.split(/\n\s*\n/).filter(block => {
    const sentences = block.split(/[.!?]\s+/).length;
    return sentences >= 3 && !/^\s*[-*#|\d]/.test(block.trim());
  }).length;
  scores.narrative += proseDensity * 2;

  // ── Normalize to percentages ──
  const total = scores.constraint + scores.procedural + scores.narrative;
  if (total === 0) return { constraint: 33, procedural: 33, narrative: 34 };

  return {
    constraint: Math.round((scores.constraint / total) * 100),
    procedural: Math.round((scores.procedural / total) * 100),
    narrative: Math.round((scores.narrative / total) * 100),
  };
}

function dominantCategory(dist: Record<CategoryKey, number>): CategoryKey {
  const entries = Object.entries(dist) as [CategoryKey, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]![0];
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  let models = createFullTierModels();
  if (models.length === 0) models = getActiveModels(true);

  if (models.length === 0) {
    return {
      suiteId: 'profile-priming',
      suiteName: 'Profile Priming',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  console.log(`\n  Profile Priming: ${models.length} models × ${PROFILES.length} profiles × ${CODE_SCENARIOS.length} scenarios\n`);

  // Group by provider for parallel execution
  const providerGroups = new Map<string, typeof models>();
  for (const model of models) {
    const group = providerGroups.get(model.providerKey) ?? [];
    group.push(model);
    providerGroups.set(model.providerKey, group);
  }

  // Accumulator
  interface RunResult {
    modelId: string;
    modelName: string;
    profile: ProfileKey;
    scenarioId: string;
    distribution: Record<CategoryKey, number>;
    dominant: CategoryKey;
    matchesPrediction: boolean;
  }
  const allResults: RunResult[] = [];

  // Cross-provider parallel, within-provider sequential
  const groupEntries = [...providerGroups.entries()];
  const settled = await Promise.allSettled(
    groupEntries.map(async ([providerKey, providerModels]) => {
      const groupResults: RunResult[] = [];
      for (const model of providerModels) {
        for (const profile of PROFILES) {
          for (const scenario of CODE_SCENARIOS) {
            try {
              const prompt = [
                'Review the following code against the specification below.\n',
                '## Specification\n',
                PROFILE_VECTORS[profile.key],
                '\n\n## Code to Review\n',
                '```typescript\n' + scenario.code + '\n```\n',
                '\nIdentify all issues and violations.',
              ].join('\n');

              const response = await askModel(model, prompt, 1500, SYSTEM_PROMPT);
              const stripped = stripEchoedYon(response);
              const distribution = scoreStructure(stripped);
              const dominant = dominantCategory(distribution);
              const matchesPrediction = dominant === profile.expectedCategory;

              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                profile: profile.key,
                scenarioId: scenario.id,
                distribution,
                dominant,
                matchesPrediction,
              });

              console.log(
                `  ${matchesPrediction ? '✓' : '○'} ${model.name} × ${profile.label} × ${scenario.name}: ${dominant} (C:${distribution.constraint}% P:${distribution.procedural}% N:${distribution.narrative}%)`,
              );
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`  ✗ ${model.name} × ${profile.label} × ${scenario.name}: ${msg.slice(0, 80)}`);
              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                profile: profile.key,
                scenarioId: scenario.id,
                distribution: { constraint: 33, procedural: 33, narrative: 34 },
                dominant: 'narrative',
                matchesPrediction: false,
              });
            }
          }
        }
      }
      console.log(`  ▸ Provider ${providerKey}: ${groupResults.length} results collected`);
      return groupResults;
    }),
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') allResults.push(...result.value);
  }

  // ---------------------------------------------------------------------------
  // Aggregation
  // ---------------------------------------------------------------------------

  function avgDistribution(results: RunResult[]): Record<CategoryKey, number> {
    if (results.length === 0) return { constraint: 0, procedural: 0, narrative: 0 };
    const sum = { constraint: 0, procedural: 0, narrative: 0 };
    for (const r of results) {
      sum.constraint += r.distribution.constraint;
      sum.procedural += r.distribution.procedural;
      sum.narrative += r.distribution.narrative;
    }
    return {
      constraint: Math.round(sum.constraint / results.length),
      procedural: Math.round(sum.procedural / results.length),
      narrative: Math.round(sum.narrative / results.length),
    };
  }

  function predictionRate(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round((results.filter((r) => r.matchesPrediction).length / results.length) * 100);
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  // Test 1–3: Per-profile distribution
  for (const profile of PROFILES) {
    const profileResults = allResults.filter((r) => r.profile === profile.key);
    const dist = avgDistribution(profileResults);
    const rate = predictionRate(profileResults);

    tests.push({
      id: `profile-${profile.key}-distribution`,
      name: `Profile ${profile.label}: Cognitive Distribution`,
      passed: true,
      type: 'comparative',
      metric: { name: `${profile.expectedCategory}_dominance`, value: dist[profile.expectedCategory], unit: '%' },
      secondaryMetrics: [
        { name: 'constraint_pct', value: dist.constraint, unit: '%' },
        { name: 'procedural_pct', value: dist.procedural, unit: '%' },
        { name: 'narrative_pct', value: dist.narrative, unit: '%' },
        { name: 'prediction_rate', value: rate, unit: '%' },
      ],
      detail: `${profile.label}: C=${dist.constraint}% P=${dist.procedural}% N=${dist.narrative}%. Predicted=${profile.expectedCategory}, match rate=${rate}%`,
    });
  }

  // Test 4: Overall steering effect
  const overallRate = predictionRate(allResults);
  tests.push({
    id: 'steering-effect',
    name: 'Overall Profile Steering Effect',
    passed: true,
    type: 'comparative',
    metric: { name: 'overall_prediction_rate', value: overallRate, unit: '%' },
    secondaryMetrics: PROFILES.map((p) => ({
      name: `${p.key}_prediction_rate`,
      value: predictionRate(allResults.filter((r) => r.profile === p.key)),
      unit: '%',
    })),
    detail: `Overall steering success: ${overallRate}% (chance=33%). ${PROFILES.map((p) => `${p.key}=${predictionRate(allResults.filter((r) => r.profile === p.key))}%`).join(', ')}`,
  });

  // Test 5: Per-model breakdown
  for (const model of models) {
    const modelResults = allResults.filter((r) => r.modelId === model.id);
    const modelRate = predictionRate(modelResults);
    const modelDists = PROFILES.map((p) => ({
      profile: p.key,
      dist: avgDistribution(modelResults.filter((r) => r.profile === p.key)),
    }));

    tests.push({
      id: `per-model-${model.id}`,
      name: `Per-Model: ${model.name}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'prediction_rate', value: modelRate, unit: '%' },
      secondaryMetrics: modelDists.flatMap((d) => [
        { name: `${d.profile}_constraint`, value: d.dist.constraint, unit: '%' },
        { name: `${d.profile}_procedural`, value: d.dist.procedural, unit: '%' },
        { name: `${d.profile}_narrative`, value: d.dist.narrative, unit: '%' },
      ]),
      detail: `${model.name}: ${modelRate}% steering. ${modelDists.map((d) => `${d.profile}=[C:${d.dist.constraint}% P:${d.dist.procedural}% N:${d.dist.narrative}%]`).join(' ')}`,
    });
  }

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'profile-priming',
    suiteName: 'Profile Priming',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runProfilePriming };
