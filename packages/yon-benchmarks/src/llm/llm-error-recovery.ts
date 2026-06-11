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
 * Error Recovery Suite
 *
 * Pillar: Streaming
 * Axis: Fault isolation (record-level independence)
 * Spec: §5 (Line Independence) — every YON line is independently parseable
 *
 * ⚠️ NOTE: This is a YON-ONLY capability test, NOT a format comparison.
 *    JSON doesn't have partial delivery — it's all-or-nothing.
 *    YON's line-independence is a unique property: when records are
 *    corrupted or missing, the surviving records remain valid.
 *    This suite tests whether LLMs can exploit that property.
 *
 * Tests:
 * 1. Fault Isolation — damage 3 records, measure extraction from surviving records
 * 2. Corruption Boundary Detection — can LLM identify WHICH records are bad?
 * 3. Graceful Degradation — corrupt 25% of RAG context, extract from survivors
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
  return loadVector('error-recovery', 'canon.yon');
}

function loadGroundTruth(): Array<{ id: number; question: string; answer: string }> {
  return JSON.parse(loadVector('error-recovery', 'ground-truth.json'));
}

// ---------------------------------------------------------------------------
// Corruption Utilities
// ---------------------------------------------------------------------------

/**
 * Corrupt specific YON records by index (0-based) — replace line with
 * genuinely broken syntax (unparseable garbage, broken tags, random chars).
 */
function corruptYonRecords(yon: string, indices: number[]): string {
  const GARBAGE_LINES = [
    '@@BROKEN|||unclosed quote="missing end | ╬╬╬ garbled',
    '§§§ this line is corrupted binary data ░░░ 0xDEADBEEF ███',
    '@MAP id=??? | <<< TRUNCATED MID-TRANSM',
  ];
  const lines = yon.split('\n');
  let recordIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.startsWith('@') && !line.startsWith('@DOC')) {
      if (indices.includes(recordIdx)) {
        lines[i] = GARBAGE_LINES[indices.indexOf(recordIdx) % GARBAGE_LINES.length]!;
      }
      recordIdx++;
    }
  }
  return lines.join('\n');
}

/**
 * Questions whose answers survive the corruption of records 4, 7, 11.
 * - Record 4 = case studies MAP → Q4-Q7, Q14 lost
 * - Record 7 = about section → Q8, Q9, Q10 lost
 * - Record 11 = first testimonial → Q11 lost
 * Surviving: Q1, Q2, Q3, Q12, Q13, Q15 (6 questions)
 */
const SURVIVING_QUESTION_IDS = new Set([1, 2, 3, 12, 13, 15]);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/**
 * Test 1: Fault Isolation — YON-only capability.
 * Damage 3 records with genuinely broken syntax. Measure whether the LLM
 * can still extract facts from the 12 surviving records.
 * This property is unique to YON's line-independent design.
 */
async function testFaultIsolation(): Promise<TestResult> {
  const yon = loadYon();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  const corruptedYon = corruptYonRecords(yon, [4, 7, 11]);

  const prompt = [
    'This YON document has some corrupted lines (broken syntax, garbled characters).',
    'YON is line-independent — each record stands alone. Ignore damaged lines.',
    'Answer each question using ONLY the valid records.',
    'Answer each question on a separate line with ONLY the answer. If the data is unavailable, say "NOT FOUND".',
    '',
    ...gt.map((q) => `${q.id}. ${q.question}`),
    '',
    'Document:',
    corruptedYon,
  ].join('\n');

  const llmResponse = await askLLM(prompt);
  const durationMs = elapsed();

  const lines = llmResponse.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let survivingCorrect = 0;
  let totalCorrect = 0;
  const details: string[] = [];

  for (let i = 0; i < gt.length; i++) {
    const expected = gt[i]!;
    const actual = lines[i] ?? '';
    const found = actual.toLowerCase().includes(expected.answer.toLowerCase());
    if (found) totalCorrect++;
    if (found && SURVIVING_QUESTION_IDS.has(expected.id)) survivingCorrect++;
    details.push(`Q${expected.id}: ${found ? '✓' : '✗'}`);
  }

  const survivingAccuracy = Math.round((survivingCorrect / SURVIVING_QUESTION_IDS.size) * 100);

  return {
    id: 'fault-isolation',
    name: 'Fault Isolation (§5 line independence)',
    passed: survivingAccuracy >= 60,
    type: 'gate',
    metric: { name: 'surviving_accuracy', value: survivingAccuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'surviving_correct', value: survivingCorrect, unit: `/${SURVIVING_QUESTION_IDS.size}` },
      { name: 'total_correct', value: totalCorrect, unit: `/${gt.length}` },
      { name: 'corrupted_records', value: 3, unit: 'records' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `3/15 records corrupted. Surviving: ${survivingCorrect}/${SURVIVING_QUESTION_IDS.size} (${survivingAccuracy}%). ${details.join(', ')}`,
  };
}

/**
 * Test 2: Corruption Boundary Detection — can the LLM identify which
 * records are damaged and which are valid? Uses different corruption
 * indices than test 1 to avoid memorization.
 */
async function testCorruptionBoundaryDetection(): Promise<TestResult> {
  const yon = loadYon();
  const elapsed = startTimer();

  const corruptedYon = corruptYonRecords(yon, [2, 6, 10]);

  const prompt = [
    'Examine this YON document. Some records have corrupted syntax (broken tags, garbled characters).',
    'For each non-DOC record, classify it as VALID or CORRUPTED.',
    'Answer one per line in the format: "Record N: VALID" or "Record N: CORRUPTED".',
    '',
    'Document:',
    corruptedYon,
  ].join('\n');

  const llmResponse = await askLLM(prompt);
  const durationMs = elapsed();

  const corruptedSet = new Set([2, 6, 10]);
  let correctDetections = 0;
  let totalRecords = 0;

  const responseLines = llmResponse.trim().split('\n');
  for (const line of responseLines) {
    const match = line.match(/record\s*(\d+)/i);
    if (match) {
      totalRecords++;
      const idx = parseInt(match[1]!, 10) - 1;
      const isCR = line.toLowerCase().includes('corrupted');
      const shouldBeCR = corruptedSet.has(idx);
      if (isCR === shouldBeCR) correctDetections++;
    }
  }

  const detectionRate = totalRecords > 0 ? Math.round((correctDetections / totalRecords) * 100) : 0;

  return {
    id: 'corruption-boundary-detection',
    name: 'Corruption Boundary Detection (§5 line independence)',
    passed: true, // Measurement — reports accuracy without gating
    type: 'measurement',
    metric: { name: 'detection_accuracy', value: detectionRate, unit: '%' },
    secondaryMetrics: [
      { name: 'correct_detections', value: correctDetections, unit: `/${totalRecords}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `LLM identified ${correctDetections}/${totalRecords} record states correctly (${detectionRate}%).`,
  };
}

// ---------------------------------------------------------------------------
// Graceful Degradation (Phase 3 addition)
// ---------------------------------------------------------------------------

/**
 * Test 3: Graceful Degradation — corrupt 25% of RAG context records,
 * verify LLM can still extract facts from survivors.
 * Uses deterministic corruption indices [2, 5, 9] for reproducibility.
 */
async function testGracefulDegradation(): Promise<TestResult> {
  // Load RAG vectors (financial compliance rules)
  const yon = loadVector('rag-context', 'canon.yon');
  const questionsRaw = loadVector('rag-context', 'questions.json');
  const questions: Array<{ id: number; question: string; answer: string; rule_index: number }> =
    JSON.parse(questionsRaw);
  const elapsed = startTimer();

  // Corrupt sections at indices [2, 5, 9] (~25% of 12 sections)
  const CORRUPT_INDICES = [2, 5, 9];
  const corruptedYon = corruptYonRecords(yon, CORRUPT_INDICES);

  // Determine surviving questions (those whose rule_index is NOT in corrupted set)
  const corruptedSections = new Set(CORRUPT_INDICES.map((i) => i + 1)); // 1-based
  const survivingQs = questions.filter((q) => !corruptedSections.has(q.rule_index));

  const prompt = [
    'This YON document has some corrupted lines (broken syntax, garbled characters).',
    'YON is line-independent — each record stands alone. Ignore damaged lines.',
    'Answer each question using ONLY the valid records.',
    'Answer each question on a separate line with ONLY the answer. If the data is unavailable, say "NOT FOUND".',
    '',
    ...questions.map((q) => q.id + '. ' + q.question),
    '',
    'Document:',
    corruptedYon,
  ].join('\n');

  const response = await askLLM(prompt);
  const durationMs = elapsed();

  // Score only surviving questions
  const lines = response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let correct = 0;
  for (const q of survivingQs) {
    const idx = questions.indexOf(q);
    const actual = lines[idx] ?? '';
    if (actual.toLowerCase().includes(q.answer.toLowerCase())) correct++;
  }

  const accuracy = survivingQs.length > 0 ? Math.round((correct / survivingQs.length) * 100) : 0;

  return {
    id: 'graceful-degradation',
    name: 'Graceful Degradation (25% corruption, surviving fact extraction)',
    passed: true, // Measurement — reports accuracy without gating
    type: 'measurement',
    metric: { name: 'surviving_fact_accuracy', value: accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'surviving_correct', value: correct, unit: '/' + survivingQs.length },
      { name: 'total_questions', value: questions.length, unit: 'questions' },
      { name: 'corrupted_sections', value: CORRUPT_INDICES.length, unit: '/12' },
      { name: 'surviving_questions', value: survivingQs.length, unit: 'questions' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: 'Corrupted sections [' + CORRUPT_INDICES.join(',') + ']. ' + correct + '/' + survivingQs.length + ' surviving facts extracted (' + accuracy + '%).',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  // All 3 tests use independent corruption indices/vectors — safe to parallelize (Tier 4 = 10k RPM)
  const results = await Promise.allSettled([
    testFaultIsolation(),
    testCorruptionBoundaryDetection(),
    testGracefulDegradation(),
  ]);

  const tests: TestResult[] = results.map((r) => {
    if (r.status === 'fulfilled') return r.value;
    throw r.reason; // Propagate unexpected failures
  });

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'llm-error-recovery',
    suiteName: 'LLM Error Recovery',
    pillar: 'streaming',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runLlmErrorRecovery };
