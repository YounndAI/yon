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
 * Partial Document Suite
 *
 * Pillar: Streaming
 * Axis: Prefix validity (every prefix is a valid document)
 * Spec: §5 (Streaming — line-level independence)
 * Validates: LLMs can reason about a truncated YON document as if it were
 *            complete. Truncated JSON is syntactically invalid.
 *
 * Tests:
 * 1. Prefix Extraction — truncate to first 12 of 20 records, measure accuracy
 * 2. Prefix vs Broken JSON — same with truncated JSON (invalid syntax)
 * 3. Progressive Reveal — 2-stage reveal, does accuracy monotonically increase?
 *
 * Requires: OPENAI_API_KEY in .env.local
 */

import { askLLM } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

function loadYon(): string {
  return loadVector('partial-document', 'canon.yon');
}

function loadJson(): string {
  return loadVector('partial-document', 'reference.json');
}

function loadGroundTruth(): Array<{ id: number; question: string; answer: string; present_at_12?: boolean }> {
  const raw = loadVector('partial-document', 'ground-truth.json');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Truncation Utilities
// ---------------------------------------------------------------------------

/** Truncate YON to the first N records (by line). Records start with @. */
function truncateYon(yon: string, maxRecords: number): string {
  const lines = yon.split('\n');
  const result: string[] = [];
  let recordCount = 0;

  for (const line of lines) {
    if (line.trim().startsWith('@') && !line.trim().startsWith('@DOC')) {
      recordCount++;
      if (recordCount > maxRecords) break;
    }
    result.push(line);
  }
  return result.join('\n');
}

/** Truncate JSON to roughly the same proportion. */
function truncateJson(json: string, fraction: number): string {
  return json.slice(0, Math.floor(json.length * fraction));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testPrefixExtraction(): Promise<TestResult> {
  const yon = loadYon();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  // Truncate to first 12 records (out of ~20)
  const prefixYon = truncateYon(yon, 12);

  const prompt = [
    'This is a PARTIAL YON document (first part only). Answer these questions using ONLY what is present.',
    'If the information is not in the document, answer "NOT FOUND".',
    'Answer each on a separate line with ONLY the answer.',
    '',
    ...gt.map((q) => `${q.id}. ${q.question}`),
    '',
    'Document:',
    prefixYon,
  ].join('\n');

  const llmResponse = await askLLM(prompt);
  const durationMs = elapsed();

  const lines = llmResponse.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let presentCorrect = 0;
  let absentCorrect = 0;
  let presentTotal = 0;
  let absentTotal = 0;

  for (let i = 0; i < gt.length; i++) {
    const q = gt[i]!;
    const actual = lines[i] ?? '';
    const isPresent = q.present_at_12 !== false; // Default true if not specified

    if (isPresent) {
      presentTotal++;
      if (actual.toLowerCase().includes(q.answer.toLowerCase())) presentCorrect++;
    } else {
      absentTotal++;
      const saysNotFound = actual.toLowerCase().includes('not found') || actual.toLowerCase().includes('n/a') || actual.toLowerCase().includes('not available');
      if (saysNotFound) absentCorrect++;
    }
  }

  const presentAccuracy = presentTotal > 0 ? Math.round((presentCorrect / presentTotal) * 100) : 0;
  const absentAccuracy = absentTotal > 0 ? Math.round((absentCorrect / absentTotal) * 100) : 0;

  return {
    id: 'prefix-extraction',
    name: 'YON Prefix Extraction (12/20 records)',
    passed: presentAccuracy >= 40,
    type: 'gate',
    metric: { name: 'present_accuracy', value: presentAccuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'present_correct', value: presentCorrect, unit: `/${presentTotal}` },
      { name: 'absent_correct', value: absentCorrect, unit: `/${absentTotal}` },
      { name: 'absent_accuracy', value: absentAccuracy, unit: '%' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Prefix (12/20). Present data: ${presentCorrect}/${presentTotal} (${presentAccuracy}%). Absent data correctly identified: ${absentCorrect}/${absentTotal} (${absentAccuracy}%).`,
  };
}

async function testPrefixVsBrokenJson(): Promise<TestResult> {
  const json = loadJson();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  // Truncate JSON at 60% — creates invalid syntax (missing closing brackets)
  const truncatedJson = truncateJson(json, 0.6);

  const prompt = [
    'This JSON document is TRUNCATED (incomplete). Extract as much information as possible.',
    'If the information is not available, answer "NOT FOUND".',
    'Answer each on a separate line with ONLY the answer.',
    '',
    ...gt.map((q) => `${q.id}. ${q.question}`),
    '',
    'Document:',
    truncatedJson,
  ].join('\n');

  const llmResponse = await askLLM(prompt);
  const durationMs = elapsed();

  const lines = llmResponse.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let correct = 0;

  for (let i = 0; i < gt.length; i++) {
    const q = gt[i]!;
    const actual = lines[i] ?? '';
    if (actual.toLowerCase().includes(q.answer.toLowerCase())) correct++;
  }

  const accuracy = Math.round((correct / gt.length) * 100);

  return {
    id: 'prefix-vs-broken-json',
    name: 'Truncated JSON Extraction (comparison)',
    passed: true,
    type: 'comparative',
    metric: { name: 'json_prefix_accuracy', value: accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'correct_answers', value: correct, unit: `/${gt.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Truncated JSON (60%). LLM extracted ${correct}/${gt.length} facts (${accuracy}%).`,
  };
}

async function testProgressiveReveal(): Promise<TestResult> {
  const yon = loadYon();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  // Select 10 questions: 5 from early records, 5 from late records
  const earlyQuestions = gt.filter((q) => q.present_at_12 !== false).slice(0, 5);
  const lateQuestions = gt.filter((q) => q.present_at_12 === false).slice(0, 5);
  const selectedQuestions = [...earlyQuestions, ...lateQuestions];

  if (selectedQuestions.length < 10) {
    // Pad with remaining questions if needed
    const remaining = gt.filter((q) => !selectedQuestions.includes(q));
    selectedQuestions.push(...remaining.slice(0, 10 - selectedQuestions.length));
  }

  // Stage 1: first 10 records
  const stage1Yon = truncateYon(yon, 10);
  const stage1Prompt = [
    'This is a PARTIAL YON document. Answer these questions using ONLY what is present.',
    'Answer "NOT FOUND" if the information is missing. Answer each on a separate line.',
    '',
    ...selectedQuestions.map((q, i) => `${i + 1}. ${q.question}`),
    '',
    'Document:',
    stage1Yon,
  ].join('\n');

  const stage1Response = await askLLM(stage1Prompt);
  const stage1Lines = stage1Response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let stage1Correct = 0;
  for (let i = 0; i < selectedQuestions.length; i++) {
    const q = selectedQuestions[i]!;
    const actual = stage1Lines[i] ?? '';
    if (actual.toLowerCase().includes(q.answer.toLowerCase())) stage1Correct++;
  }

  // Stage 2: all 20 records
  const stage2Prompt = [
    'This is a COMPLETE YON document. Answer these questions.',
    'Answer "NOT FOUND" if the information is missing. Answer each on a separate line.',
    '',
    ...selectedQuestions.map((q, i) => `${i + 1}. ${q.question}`),
    '',
    'Document:',
    yon,
  ].join('\n');

  const stage2Response = await askLLM(stage2Prompt);
  const durationMs = elapsed();

  const stage2Lines = stage2Response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let stage2Correct = 0;
  for (let i = 0; i < selectedQuestions.length; i++) {
    const q = selectedQuestions[i]!;
    const actual = stage2Lines[i] ?? '';
    if (actual.toLowerCase().includes(q.answer.toLowerCase())) stage2Correct++;
  }

  const monotonic = stage2Correct >= stage1Correct;
  const delta = stage2Correct - stage1Correct;

  return {
    id: 'progressive-reveal',
    name: 'Progressive Reveal (additive comprehension)',
    passed: monotonic,
    type: 'gate',
    metric: { name: 'accuracy_delta', value: delta, unit: 'questions' },
    secondaryMetrics: [
      { name: 'stage1_correct', value: stage1Correct, unit: `/${selectedQuestions.length}` },
      { name: 'stage2_correct', value: stage2Correct, unit: `/${selectedQuestions.length}` },
      { name: 'monotonic', value: monotonic ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Stage 1 (10 records): ${stage1Correct}/${selectedQuestions.length}. Stage 2 (20 records): ${stage2Correct}/${selectedQuestions.length}. Delta: +${delta}. Monotonic: ${monotonic ? 'YES' : 'NO'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  // All 3 tests load independent vectors — safe to parallelize (Tier 4 = 10k RPM)
  const results = await Promise.allSettled([
    testPrefixExtraction(),
    testPrefixVsBrokenJson(),
    testProgressiveReveal(),
  ]);

  const tests: TestResult[] = results.map((r) => {
    if (r.status === 'fulfilled') return r.value;
    throw r.reason;
  });

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  // Compute outcome: compare YON prefix vs JSON prefix
  const yonTest = tests.find((t) => t.id === 'prefix-extraction');
  const jsonTest = tests.find((t) => t.id === 'prefix-vs-broken-json');
  if (yonTest && jsonTest) {
    const delta = yonTest.metric.value - jsonTest.metric.value;
    yonTest.outcome = delta >= 5 ? 'advantage' : delta <= -5 ? 'disadvantage' : 'tied';
    jsonTest.outcome = yonTest.outcome === 'advantage' ? 'disadvantage' : yonTest.outcome === 'disadvantage' ? 'advantage' : 'tied';
  }

  return {
    suiteId: 'llm-partial-document',
    suiteName: 'LLM Partial Document',
    pillar: 'streaming',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runPartialDocument };
