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
 * Pliability Suite — Format Comprehension & Generation Quality
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Format comprehension (reading) and generation fidelity (writing)
 *
 * Two batteries:
 *   A. Comprehension — Can LLMs extract facts from YON, JSON, YAML, NL?
 *      Tests: comprehension-yon, comprehension-json, comprehension-yaml, comprehension-natural-language
 *      These test IDs are consumed by enricher.ts and model-scorecard.ts.
 *
 *   B. Generation — Can LLMs produce structurally valid YON?
 *      Conditions: Cold (zero context), Trained (READ card), Instructed (WRITE card)
 *      Parallelized via Promise.allSettled() — OpenAI Tier 4 = 10K RPM.
 *
 * Scoring:
 *   Comprehension: question-answer accuracy (0–100%)
 *   Generation: structural validity checklist (0–100%)
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

type FormatKey = 'yon' | 'json' | 'yaml' | 'natural-language';
type ConditionKey = 'cold' | 'trained' | 'instructed' | 'few-shot';

interface ComprehensionVector {
  format: FormatKey;
  label: string;
  content: string;
  questions: { q: string; expected: string }[];
}

// ---------------------------------------------------------------------------
// Cards — loaded once
// ---------------------------------------------------------------------------

const READ_CARD = loadVector('cards', 'read-card.txt');
const WRITE_CARD = loadVector('cards', 'write-card.txt');
const FEW_SHOT_1 = loadVector('generation', 'example-1.yon');
const FEW_SHOT_2 = loadVector('generation', 'example-2.yon');

// ---------------------------------------------------------------------------
// Comprehension Vectors (Battery A)
// ---------------------------------------------------------------------------

// Same data encoded in 4 formats — tests whether format affects extraction accuracy
const COMPREHENSION_DATA = {
  appName: 'TaskFlow',
  version: '3.2.1',
  environment: 'production',
  rules: [
    { level: 'MUST', condition: 'user role is admin', action: 'allow all operations' },
    { level: 'MUST', condition: 'user role is viewer', action: 'allow read-only access' },
    { level: 'MUST_NOT', condition: 'user is unauthenticated', action: 'allow any API access' },
  ],
  settings: { timeout_ms: 5000, retries: 3, log_level: 'info' },
};

const QUESTIONS: { q: string; expected: string }[] = [
  { q: 'What is the application name?', expected: 'TaskFlow' },
  { q: 'What version is specified?', expected: '3.2.1' },
  { q: 'What environment is this configured for?', expected: 'production' },
  { q: 'How many rules are defined?', expected: '3' },
  { q: 'What must happen when a user is unauthenticated?', expected: 'not allow any API access' },
  { q: 'What is the timeout in milliseconds?', expected: '5000' },
  { q: 'What is the default log level?', expected: 'info' },
  { q: 'How many retries are configured?', expected: '3' },
  { q: 'What access does a viewer get?', expected: 'read-only' },
  { q: 'What access level does an admin have?', expected: 'all operations' },
];

const VECTORS: ComprehensionVector[] = [
  {
    format: 'yon',
    label: 'YON Canon',
    content: loadVector('generation', 'reference.yon'),
    questions: QUESTIONS,
  },
  {
    format: 'json',
    label: 'JSON',
    content: JSON.stringify({
      app_name: COMPREHENSION_DATA.appName,
      version: COMPREHENSION_DATA.version,
      environment: COMPREHENSION_DATA.environment,
      rules: COMPREHENSION_DATA.rules.map((r) => ({
        level: r.level,
        when: r.condition,
        then: r.action,
      })),
      settings: COMPREHENSION_DATA.settings,
    }, null, 2),
    questions: QUESTIONS,
  },
  {
    format: 'yaml',
    label: 'YAML',
    content: [
      'app_name: TaskFlow',
      'version: "3.2.1"',
      'environment: production',
      'rules:',
      '  - level: MUST',
      '    when: user role is admin',
      '    then: allow all operations',
      '  - level: MUST',
      '    when: user role is viewer',
      '    then: allow read-only access',
      '  - level: MUST_NOT',
      '    when: user is unauthenticated',
      '    then: allow any API access',
      'settings:',
      '  timeout_ms: 5000',
      '  retries: 3',
      '  log_level: info',
    ].join('\n'),
    questions: QUESTIONS,
  },
  {
    format: 'natural-language',
    label: 'Natural Language',
    content: [
      'TaskFlow Application Configuration (version 3.2.1)',
      '',
      'This configuration is for the production environment.',
      '',
      'Access Rules:',
      '1. Admin users MUST be allowed all operations.',
      '2. Viewer users MUST be allowed read-only access.',
      '3. Unauthenticated users MUST NOT be allowed any API access.',
      '',
      'Default Settings:',
      '- Timeout: 5000 milliseconds',
      '- Retries: 3',
      '- Log level: info',
    ].join('\n'),
    questions: QUESTIONS,
  },
];

// ---------------------------------------------------------------------------
// Generation Reference (Battery B)
// ---------------------------------------------------------------------------

// Generation scored via structural checklist, not diff against reference

const GENERATION_PROMPT =
  'Generate a YON document that defines an application configuration with the following:' +
  '\n- App name: TaskFlow, version 3.2.1, environment: production' +
  '\n- Three access rules: admin gets all operations (MUST), viewer gets read-only (MUST), unauthenticated users must not get any API access (MUST_NOT)' +
  '\n- Settings: timeout_ms=5000, retries=3, log_level=info' +
  '\n\nOutput ONLY the YON document. No explanations.';

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Score comprehension: fuzzy match each answer against expected value.
 * Returns accuracy 0–100%.
 */
function scoreComprehension(response: string, questions: { q: string; expected: string }[]): number {
  let matched = 0;
  const lower = response.toLowerCase();
  for (const { expected } of questions) {
    // Fuzzy: check if expected value appears anywhere in the response
    if (lower.includes(expected.toLowerCase())) {
      matched++;
    }
  }
  return Math.round((matched / questions.length) * 100);
}

/**
 * Score generation: structural validity checklist.
 * Returns validity score 0–100%.
 */
function scoreGeneration(output: string): { score: number; checks: Record<string, boolean> } {
  const lines = output.trim().split('\n').filter((l) => l.trim().length > 0);
  const checks: Record<string, boolean> = {
    has_doc: false,
    doc_first: false,
    has_ver: false,
    has_id: false,
    has_title: false,
    has_sec: false,
    has_rule: false,
    has_lvl: false,
    uses_pipe: false,
    no_markdown: true, // inverted — starts true, set false if markdown found
  };

  // Check @DOC presence and position
  const docLine = lines.find((l) => l.startsWith('@DOC'));
  if (docLine) {
    checks.has_doc = true;
    // Check if @DOC is first non-comment line
    const firstNonComment = lines.find((l) => !l.startsWith('#'));
    checks.doc_first = firstNonComment === docLine;
    checks.has_ver = /\bver=/.test(docLine);
    checks.has_id = /\bid=/.test(docLine);
    checks.has_title = /\btitle=/.test(docLine);
  }

  // Check other structural elements
  checks.has_sec = lines.some((l) => l.startsWith('@SEC'));
  checks.has_rule = lines.some((l) => l.startsWith('@RULE'));
  checks.has_lvl = lines.some((l) => /\blvl=/.test(l));
  checks.uses_pipe = lines.some((l) => l.includes(' | '));

  // Check for markdown contamination
  if (lines.some((l) => l.startsWith('```') || l.startsWith('# ') || l.startsWith('## '))) {
    checks.no_markdown = false;
  }

  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  return { score: Math.round((passed / total) * 100), checks };
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
      suiteId: 'pliability',
      suiteName: 'Pliability (Format Comprehension)',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  console.log(`\n  Pliability: ${models.length} models × ${VECTORS.length} formats (comprehension) + ${models.length} × 4 conditions (generation)\n`);

  // =========================================================================
  // Battery A: Comprehension (all models × 4 formats)
  // =========================================================================

  const COMP_SYSTEM = 'You are a data analyst. Answer each question precisely using ONLY the data provided. Give short, direct answers.';

  // Build all comprehension tasks
  interface CompResult {
    modelId: string;
    modelName: string;
    format: FormatKey;
    score: number;
  }
  const compResults: CompResult[] = [];

  // Parallelize all comprehension calls via Promise.allSettled
  const compTasks = models.flatMap((model) =>
    VECTORS.map((vec) => ({
      model,
      vec,
      run: async (): Promise<CompResult> => {
        const prompt = [
          `Here is a document in ${vec.label} format:\n`,
          vec.content,
          '\n\nAnswer the following questions based ONLY on the document above. Give brief, precise answers.\n',
          ...vec.questions.map((q, i) => `${i + 1}. ${q.q}`),
        ].join('\n');

        const response = await askModel(model, prompt, 1500, COMP_SYSTEM);
        const score = scoreComprehension(response, vec.questions);
        return { modelId: model.id, modelName: model.name, format: vec.format, score };
      },
    })),
  );

  const compSettled = await Promise.allSettled(
    compTasks.map(async (task) => {
      try {
        const result = await task.run();
        console.log(`  ${result.score >= 70 ? '✓' : '○'} ${task.model.name} × ${task.vec.label}: ${result.score}%`);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`  ✗ ${task.model.name} × ${task.vec.label}: ${msg.slice(0, 80)}`);
        return { modelId: task.model.id, modelName: task.model.name, format: task.vec.format, score: 0 };
      }
    }),
  );

  for (const result of compSettled) {
    if (result.status === 'fulfilled') compResults.push(result.value);
  }

  // Aggregate comprehension by format
  function avgScore(results: CompResult[], format?: FormatKey): number {
    const filtered = format ? results.filter((r) => r.format === format) : results;
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length);
  }

  // Emit comprehension test results (these IDs consumed by enricher.ts)
  for (const vec of VECTORS) {
    const formatScore = avgScore(compResults, vec.format);
    const perModelScores = models.map((m) => {
      const r = compResults.find((cr) => cr.modelId === m.id && cr.format === vec.format);
      return { name: `${m.name}_score`, value: r?.score ?? 0, unit: '%' as const };
    });

    tests.push({
      id: `comprehension-${vec.format}`,
      name: `Comprehension: ${vec.label}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'accuracy', value: formatScore, unit: '%' },
      secondaryMetrics: perModelScores,
      detail: `${vec.label}: ${formatScore}% avg across ${models.length} models. ${perModelScores.map((s) => `${s.name.replace('_score', '')}=${s.value}%`).join(', ')}`,
    });
  }

  // Cross-format comparison test
  const yonScore = avgScore(compResults, 'yon');
  const jsonScore = avgScore(compResults, 'json');
  const yamlScore = avgScore(compResults, 'yaml');
  const nlScore = avgScore(compResults, 'natural-language');

  tests.push({
    id: 'comprehension-parity',
    name: 'Comprehension Format Parity',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_accuracy', value: yonScore, unit: '%', comparison: { baseline: nlScore, baselineLabel: 'Natural Language', delta: `${yonScore - nlScore}pp` } },
    secondaryMetrics: [
      { name: 'json_accuracy', value: jsonScore, unit: '%' },
      { name: 'yaml_accuracy', value: yamlScore, unit: '%' },
      { name: 'nl_accuracy', value: nlScore, unit: '%' },
    ],
    detail: `YON=${yonScore}% JSON=${jsonScore}% YAML=${yamlScore}% NL=${nlScore}%. Delta vs NL: ${yonScore - nlScore}pp`,
  });

  // =========================================================================
  // Battery B: Generation (all models × 3 conditions)
  // =========================================================================

  const CONDITIONS: { key: ConditionKey; label: string; systemPrompt: string }[] = [
    {
      key: 'cold',
      label: 'Cold Start (zero context)',
      systemPrompt: 'You are a helpful assistant.',
    },
    {
      key: 'trained',
      label: 'Trained (READ Card)',
      systemPrompt: `You are a helpful assistant. Here is a reference for the YON notation format:\n\n${READ_CARD}`,
    },
    {
      key: 'instructed',
      label: 'Instructed (WRITE Card)',
      systemPrompt: `You are a YON document generator. Follow these rules precisely:\n\n${WRITE_CARD}`,
    },
    {
      key: 'few-shot',
      label: 'Few-Shot (Grammar Examples)',
      systemPrompt: `You are a YON document generator. Learn the format from these examples:\n\nExample 1:\n${FEW_SHOT_1}\n\nExample 2:\n${FEW_SHOT_2}\n\nGenerate documents that follow the same structure: @DOC header first, @SEC sections, @RULE constraints, @MAP data. Use pipe | to separate fields. Use key=value pairs.`,
    },
  ];

  interface GenResult {
    modelId: string;
    modelName: string;
    condition: ConditionKey;
    score: number;
    checks: Record<string, boolean>;
  }
  const genResults: GenResult[] = [];

  // Parallelize all generation calls
  const genTasks = models.flatMap((model) =>
    CONDITIONS.map((cond) => ({
      model,
      cond,
      run: async (): Promise<GenResult> => {
        const response = await askModel(model, GENERATION_PROMPT, 1500, cond.systemPrompt);
        const { score, checks } = scoreGeneration(response);
        return { modelId: model.id, modelName: model.name, condition: cond.key, score, checks };
      },
    })),
  );

  const genSettled = await Promise.allSettled(
    genTasks.map(async (task) => {
      try {
        const result = await task.run();
        console.log(`  ${result.score >= 70 ? '✓' : '○'} ${task.model.name} × ${task.cond.label}: ${result.score}% [${Object.entries(result.checks).filter(([, v]) => v).length}/${Object.keys(result.checks).length} checks]`);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`  ✗ ${task.model.name} × ${task.cond.label}: ${msg.slice(0, 80)}`);
        return {
          modelId: task.model.id,
          modelName: task.model.name,
          condition: task.cond.key,
          score: 0,
          checks: {} as Record<string, boolean>,
        };
      }
    }),
  );

  for (const result of genSettled) {
    if (result.status === 'fulfilled') genResults.push(result.value);
  }

  // Aggregate generation by condition
  function avgGenScore(results: GenResult[], condition?: ConditionKey): number {
    const filtered = condition ? results.filter((r) => r.condition === condition) : results;
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length);
  }

  // Emit generation test results per condition
  for (const cond of CONDITIONS) {
    const condScore = avgGenScore(genResults, cond.key);
    const perModelScores = models.map((m) => {
      const r = genResults.find((gr) => gr.modelId === m.id && gr.condition === cond.key);
      return { name: `${m.name}_score`, value: r?.score ?? 0, unit: '%' as const };
    });

    tests.push({
      id: `generation-${cond.key}`,
      name: `Generation: ${cond.label}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'validity', value: condScore, unit: '%' },
      secondaryMetrics: perModelScores,
      detail: `${cond.label}: ${condScore}% avg. ${perModelScores.map((s) => `${s.name.replace('_score', '')}=${s.value}%`).join(', ')}`,
    });
  }

  // Card uplift test: how much does the WRITE card improve generation?
  const coldScore = avgGenScore(genResults, 'cold');
  const trainedScore = avgGenScore(genResults, 'trained');
  const instructedScore = avgGenScore(genResults, 'instructed');
  const cardUplift = instructedScore - coldScore;

  tests.push({
    id: 'generation-card-uplift',
    name: 'WRITE Card Uplift',
    passed: true,
    type: 'comparative',
    metric: {
      name: 'instructed_validity',
      value: instructedScore,
      unit: '%',
      comparison: { baseline: coldScore, baselineLabel: 'Cold Start', delta: `${cardUplift >= 0 ? '+' : ''}${cardUplift}pp` },
    },
    secondaryMetrics: [
      { name: 'cold_validity', value: coldScore, unit: '%' },
      { name: 'trained_validity', value: trainedScore, unit: '%' },
      { name: 'trained_uplift', value: trainedScore - coldScore, unit: 'pp' },
    ],
    detail: `Cold=${coldScore}% → Trained=${trainedScore}% (+${trainedScore - coldScore}pp) → Instructed=${instructedScore}% (+${cardUplift}pp). WRITE Card uplift: ${cardUplift}pp`,
  });

  // Per-model breakdown
  for (const model of models) {
    const modelComp = compResults.filter((r) => r.modelId === model.id);
    const modelGen = genResults.filter((r) => r.modelId === model.id);

    const modelYonComp = modelComp.find((r) => r.format === 'yon')?.score ?? 0;
    const modelJsonComp = modelComp.find((r) => r.format === 'json')?.score ?? 0;
    const modelCold = modelGen.find((r) => r.condition === 'cold')?.score ?? 0;
    const modelInstructed = modelGen.find((r) => r.condition === 'instructed')?.score ?? 0;

    tests.push({
      id: `per-model-${model.id}`,
      name: `Per-Model: ${model.name}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'yon_comprehension', value: modelYonComp, unit: '%' },
      secondaryMetrics: [
        { name: 'json_comprehension', value: modelJsonComp, unit: '%' },
        { name: 'cold_generation', value: modelCold, unit: '%' },
        { name: 'instructed_generation', value: modelInstructed, unit: '%' },
        { name: 'card_uplift', value: modelInstructed - modelCold, unit: 'pp' },
      ],
      detail: `${model.name}: Comp YON=${modelYonComp}% JSON=${modelJsonComp}% | Gen Cold=${modelCold}% Instructed=${modelInstructed}% (uplift: ${modelInstructed - modelCold}pp)`,
    });
  }

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'pliability',
    suiteName: 'Pliability (Format Comprehension)',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runPliability };
