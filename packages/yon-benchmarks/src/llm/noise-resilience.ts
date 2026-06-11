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
 * Noise Resilience Suite — Messy Document Extraction
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Extraction accuracy from real-world, noisy documents
 *
 * Hypothesis: YON's structural tags (@RULE lvl=, @SEC name=) maintain
 * extraction accuracy even when source content is informal, messy, or
 * multi-source — whereas NL baselines degrade with noise.
 *
 * Tests: Same real-world content (email threads, meeting notes) encoded
 * in YON, JSON, and NL — measures extraction accuracy across all three.
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

type FormatKey = 'yon' | 'json' | 'nl';

interface NoiseScenario {
  id: string;
  name: string;
  question: string;
  /** Keywords indicating correct extraction */
  correctKeywords: string[];
  /** Minimum keyword matches to score correct */
  minMatches: number;
  vectors: Record<FormatKey, string>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMATS: { key: FormatKey; label: string }[] = [
  { key: 'yon', label: 'YON' },
  { key: 'json', label: 'JSON' },
  { key: 'nl', label: 'Natural Language' },
];

const SYSTEM_PROMPT =
  'You are a project manager reviewing documents for action items and decisions. Extract specific facts and constraints. Be precise and direct.';

// ---------------------------------------------------------------------------
// Noise Scenarios — real-world content in 3 formats
// ---------------------------------------------------------------------------

const SCENARIOS: NoiseScenario[] = [
  {
    id: 'email-decisions',
    name: 'Email Thread Decisions',
    question: 'List all mandatory (MUST) technical decisions from this document. For each one, state: what must be done, when it must happen, and any specific prohibition. Are there any items that were deferred?',
    correctKeywords: [
      'jwt', 'session token', 'sprint 14', 'postgresql', '14', '16',
      'march 15', 'must not', 'simultaneously', 'deferred', 'caching',
      'sprint 15',
    ],
    minMatches: 5,
    vectors: {
      yon: loadVector('noise-resilience', 'email-decisions.yon'),
      json: loadVector('noise-resilience', 'email-decisions.json'),
      nl: loadVector('noise-resilience', 'email-decisions.nl.txt'),
    },
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes Extraction',
    question: 'Extract all action items from this document. For each one, state: the team (Backend/Frontend/DevOps), the priority level, what needs to be done, and any deadline. Are there any hard prohibitions (things that must NOT be done)?',
    correctKeywords: [
      'n+1', 'query', 'wednesday', 'redis', 'caching', 'session',
      'z-index', 'safari', 'ios', 'visual regression', 'ssl',
      'certificate', 'april', 'must not', 'merge',
    ],
    minMatches: 6,
    vectors: {
      yon: loadVector('noise-resilience', 'meeting-notes.yon'),
      json: loadVector('noise-resilience', 'meeting-notes.json'),
      nl: loadVector('noise-resilience', 'meeting-notes.nl.txt'),
    },
  },
  {
    id: 'multi-source',
    name: 'Multi-Source Compilation',
    question: 'This document compiles rules from multiple sources. For each section, list: all mandatory requirements, any prohibitions, and the specific numeric limits mentioned. Which finding from the security audit is referenced?',
    correctKeywords: [
      'oauth', 'bearer', 'issuer', 'audience', 'expiry',
      '1000', '5000', 'rfc 7807', 'problem details',
      'stack trace', 'sa-2026-03', '12%', 'api key',
      'deprecation', '6 month', 'versioning',
    ],
    minMatches: 6,
    vectors: {
      yon: loadVector('noise-resilience', 'multi-source.yon'),
      json: loadVector('noise-resilience', 'multi-source.json'),
      nl: loadVector('noise-resilience', 'multi-source.nl.txt'),
    },
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreExtraction(response: string, scenario: NoiseScenario): boolean {
  const lower = response.toLowerCase();
  let matches = 0;
  for (const kw of scenario.correctKeywords) {
    if (lower.includes(kw.toLowerCase())) matches++;
  }
  return matches >= scenario.minMatches;
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
      suiteId: 'noise-resilience',
      suiteName: 'Noise Resilience',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  console.log(`\n  Noise Resilience: ${models.length} models × ${SCENARIOS.length} scenarios × ${FORMATS.length} formats\n`);

  // Run all model × scenario × format combinations
  interface ExtractionResult {
    modelId: string;
    modelName: string;
    scenario: string;
    format: FormatKey;
    correct: boolean;
  }
  const results: ExtractionResult[] = [];

  const tasks = models.flatMap((model) =>
    SCENARIOS.flatMap((scenario) =>
      FORMATS.map((fmt) => ({
        model,
        scenario,
        fmt,
        run: async (): Promise<ExtractionResult> => {
          const prompt = `Here is a document:\n\n${scenario.vectors[fmt.key]}\n\n${scenario.question}`;
          const response = await askModel(model, prompt, 1500, SYSTEM_PROMPT);
          const correct = scoreExtraction(response, scenario);
          return { modelId: model.id, modelName: model.name, scenario: scenario.id, format: fmt.key, correct };
        },
      })),
    ),
  );

  const settled = await Promise.allSettled(
    tasks.map(async (task) => {
      try {
        const result = await task.run();
        console.log(`  ${result.correct ? '✓' : '○'} ${task.model.name} × ${task.fmt.label} × ${task.scenario.name}`);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`  ✗ ${task.model.name} × ${task.fmt.label} × ${task.scenario.name}: ${msg.slice(0, 80)}`);
        return { modelId: task.model.id, modelName: task.model.name, scenario: task.scenario.id, format: task.fmt.key, correct: false };
      }
    }),
  );

  for (const r of settled) {
    if (r.status === 'fulfilled') results.push(r.value);
  }

  // Aggregate by format
  function accuracy(fmt: FormatKey): number {
    const fmtResults = results.filter((r) => r.format === fmt);
    if (fmtResults.length === 0) return 0;
    return Math.round((fmtResults.filter((r) => r.correct).length / fmtResults.length) * 100);
  }

  const yonAcc = accuracy('yon');
  const jsonAcc = accuracy('json');
  const nlAcc = accuracy('nl');

  // Emit format-level test results
  for (const fmt of FORMATS) {
    const acc = accuracy(fmt.key);
    const perModelResults = models.map((m) => {
      const mr = results.filter((r) => r.modelId === m.id && r.format === fmt.key);
      const mAcc = mr.length > 0 ? Math.round((mr.filter((r) => r.correct).length / mr.length) * 100) : 0;
      return { name: `${m.name}_accuracy`, value: mAcc, unit: '%' as const };
    });

    tests.push({
      id: `noise-${fmt.key}`,
      name: `Noise Extraction: ${fmt.label}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'accuracy', value: acc, unit: '%' },
      secondaryMetrics: perModelResults,
      detail: `${fmt.label}: ${acc}% avg across ${models.length} models`,
    });
  }

  // Cross-format comparison
  tests.push({
    id: 'noise-format-comparison',
    name: 'Noise Resilience Format Comparison',
    passed: true,
    type: 'comparative',
    outcome: yonAcc > nlAcc + 5 ? 'advantage' : yonAcc < nlAcc - 5 ? 'disadvantage' : 'tied',
    metric: {
      name: 'yon_accuracy',
      value: yonAcc,
      unit: '%',
      comparison: { baseline: nlAcc, baselineLabel: 'Natural Language', delta: `${yonAcc - nlAcc}pp` },
    },
    secondaryMetrics: [
      { name: 'json_accuracy', value: jsonAcc, unit: '%' },
      { name: 'nl_accuracy', value: nlAcc, unit: '%' },
    ],
    detail: `Noisy content extraction: YON=${yonAcc}% JSON=${jsonAcc}% NL=${nlAcc}%. Delta vs NL: ${yonAcc - nlAcc}pp`,
  });

  const durationMs = elapsed();
  const total = tests.length;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'noise-resilience',
    suiteName: 'Noise Resilience',
    pillar: 'sapir-whorf',
    tests,
    summary: { total, passed, failed: total - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function runNoiseResilience(): Promise<BenchmarkResult> {
  return run();
}
