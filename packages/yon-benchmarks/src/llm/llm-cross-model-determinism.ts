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
 * Cross-Model Determinism Suite
 *
 * Pillar: Emitter Faithfulness
 * Axis: Structural consistency across models
 * Validates: Do different LLMs produce structurally compatible YON from
 *            the same brief? Tests whether YON's explicit structure acts
 *            as a convergence anchor.
 *
 * Tests:
 * 1. Structural Consistency — same brief → multiple models → Jaccard similarity
 * 2. Parse Validity Consistency — all outputs must parse
 * 3. Semantic Equivalence — LLM-as-judge rates equivalence (measurement)
 *
 * ⚠️ NOTE: Provider guard: requires ≥2 active providers. Skips with message if only 1.
 *
 * Requires: ≥2 of OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY
 */

import { parse } from '@younndai/yon-parser';
import { askLLM, loadYonGuide } from '../core/ask-llm.js';
import { getActiveModels, askModel, type ModelConfig } from '../core/models.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

function loadBrief(): string {
  return loadVector('cross-model', 'brief.txt');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Extract record IDs/names from YON text for Jaccard comparison. */
function extractStructuralKeys(yon: string): Set<string> {
  const keys = new Set<string>();

  for (const line of yon.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('@DOC')) continue;

    // Extract tag type
    const tagMatch = trimmed.match(/^@(\w+)/);
    if (tagMatch) keys.add(tagMatch[1]!.toUpperCase());

    // Extract id= or name= values
    const idMatch = trimmed.match(/\bid\s*=\s*["']?([^"'|\s]+)/);
    if (idMatch) keys.add(`id:${idMatch[1]!.toLowerCase()}`);

    const nameMatch = trimmed.match(/\bname\s*=\s*"([^"]+)"/);
    if (nameMatch) keys.add(`name:${nameMatch[1]!.toLowerCase()}`);

    // Extract table/column names for this schema domain
    const tableMatch = trimmed.match(/\b(patients|providers|appointments|patient_id|provider_id|appointment_id)\b/i);
    if (tableMatch) keys.add(`entity:${tableMatch[1]!.toLowerCase()}`);
  }

  return keys;
}

/** Jaccard similarity: |A ∩ B| / |A ∪ B|. */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testStructuralConsistency(models: ModelConfig[]): Promise<TestResult> {
  const brief = loadBrief();
  const elapsed = startTimer();

  // Generate YON from each model
  const guide = loadYonGuide();
  const prompt = [
    'Convert this database schema brief into a valid YON v2.0 document.',
    'Output ONLY valid YON.',
    '',
    brief,
  ].join('\n');



  // Fire all models in parallel
  const settled = await Promise.allSettled(
    models.map(async (model) => {
      const yon = await askModel(model, prompt, 3000, guide);
      return { model: model.name, yon, keys: extractStructuralKeys(yon) };
    }),
  );
  const outputs = settled
    .filter((r): r is PromiseFulfilledResult<{ model: string; yon: string; keys: Set<string> }> => r.status === 'fulfilled')
    .map((r) => r.value);

  const durationMs = elapsed();

  // Compute pairwise Jaccard similarities
  const pairs: Array<{ a: string; b: string; similarity: number }> = [];
  for (let i = 0; i < outputs.length; i++) {
    for (let j = i + 1; j < outputs.length; j++) {
      const sim = jaccardSimilarity(outputs[i]!.keys, outputs[j]!.keys);
      pairs.push({ a: outputs[i]!.model, b: outputs[j]!.model, similarity: Math.round(sim * 100) });
    }
  }

  const avgSimilarity = pairs.length > 0
    ? Math.round(pairs.reduce((acc, p) => acc + p.similarity, 0) / pairs.length)
    : 0;

  const pairDetails = pairs.map((p) => `${p.a}↔${p.b}: ${p.similarity}%`);

  return {
    id: 'structural-consistency',
    name: 'Structural Consistency (Jaccard similarity)',
    passed: avgSimilarity >= 30,
    type: 'gate',
    metric: { name: 'avg_jaccard', value: avgSimilarity, unit: '%' },
    secondaryMetrics: [
      { name: 'model_count', value: models.length, unit: 'models' },
      { name: 'pair_count', value: pairs.length, unit: 'pairs' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `${models.length} models, avg Jaccard ${avgSimilarity}%. ${pairDetails.join(', ')}`,
  };
}

async function testParseValidityConsistency(models: ModelConfig[]): Promise<TestResult> {
  const brief = loadBrief();
  const elapsed = startTimer();

  const guide = loadYonGuide();
  const prompt = [
    'Convert this database schema brief into a valid YON v2.0 document.',
    'Output ONLY valid YON.',
    '',
    brief,
  ].join('\n');

  let valid = 0;
  const details: string[] = [];

  // Fire all models in parallel
  const settled = await Promise.allSettled(
    models.map(async (model) => {
      const yon = await askModel(model, prompt, 3000, guide);
      try {
        const doc = parse(yon);
        return { name: model.name, valid: true, detail: `${model.name}: ✓ (${doc.records.length} records)` };
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 60) : String(e).slice(0, 60);
        return { name: model.name, valid: false, detail: `${model.name}: ✗ (${msg})` };
      }
    }),
  );
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      if (r.value.valid) valid++;
      details.push(r.value.detail);
    }
  }

  const durationMs = elapsed();
  const validityRate = Math.round((valid / models.length) * 100);

  return {
    id: 'parse-validity-consistency',
    name: 'Parse Validity Consistency',
    passed: validityRate >= 50,
    type: 'gate',
    metric: { name: 'validity_rate', value: validityRate, unit: '%' },
    secondaryMetrics: [
      { name: 'valid', value: valid, unit: `/${models.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `${valid}/${models.length} models produced parseable YON (${validityRate}%). ${details.join(', ')}`,
  };
}

async function testSemanticEquivalence(models: ModelConfig[]): Promise<TestResult> {
  const brief = loadBrief();
  const elapsed = startTimer();

  // Generate YON from first two models
  const prompt = [
    'Convert this database schema brief into a YON v2.0 document.',
    'Line 1 MUST be: @DOC ver=2.0 | id=<id> | title="<title>"',
    'Use @SEC, @MAP, @RULE. Output ONLY valid YON.',
    '',
    brief,
  ].join('\n');

  const yon1 = await askModel(models[0]!, prompt, 3000);
  const yon2 = await askModel(models[1]!, prompt, 3000);

  // LLM-as-judge: rate semantic equivalence 1-10
  const judgePrompt = [
    'You are comparing two YON documents that were generated from the same brief by different AI models.',
    'Rate their semantic equivalence on a scale of 1-10:',
    '- 1 = completely different content',
    '- 5 = same topic, different structure',
    '- 10 = semantically identical',
    '',
    'Answer with ONLY a number (1-10).',
    '',
    '--- Document A ---',
    yon1,
    '',
    '--- Document B ---',
    yon2,
  ].join('\n');

  const rating = await askLLM(judgePrompt, 100);
  const durationMs = elapsed();

  const ratingNum = parseInt(rating.trim().match(/\d+/)?.[0] ?? '0', 10);
  const clampedRating = Math.max(1, Math.min(10, ratingNum));

  return {
    id: 'semantic-equivalence',
    name: 'Semantic Equivalence (LLM judge)',
    passed: true, // measurement — always passes
    type: 'measurement',
    metric: { name: 'equivalence_rating', value: clampedRating, unit: '/10' },
    secondaryMetrics: [
      { name: 'model_a', value: 0, unit: models[0]!.name },
      { name: 'model_b', value: 0, unit: models[1]!.name },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `${models[0]!.name} vs ${models[1]!.name}: rated ${clampedRating}/10 semantic equivalence.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const models = getActiveModels();

  // Provider guard: requires ≥2 models
  if (models.length < 2) {
    const durationMs = elapsed();
    return {
      suiteId: 'llm-cross-model-determinism',
      suiteName: 'LLM Cross-Model Determinism',
      pillar: 'emitter-faithfulness',
      tests: [{
        id: 'provider-guard',
        name: 'Provider Guard',
        passed: true,
        type: 'gate',
        metric: { name: 'available_models', value: models.length, unit: 'models' },
        detail: `Skipped: requires ≥2 providers but only ${models.length} available. Add more API keys to .env.local.`,
      }],
      summary: { total: 1, passed: 1, failed: 0, durationMs },
      timestamp: localTimestamp(),
    };
  }

  const tests: TestResult[] = [];
  tests.push(await testStructuralConsistency(models));
  tests.push(await testParseValidityConsistency(models));
  tests.push(await testSemanticEquivalence(models));

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'llm-cross-model-determinism',
    suiteName: 'LLM Cross-Model Determinism',
    pillar: 'emitter-faithfulness',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runCrossModelDeterminism };
