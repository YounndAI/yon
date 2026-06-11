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
 * Multi-Hop Pipeline Suite
 *
 * Pillar: Cross-Cutting
 * Axis: Information survival across relay hops
 * Validates: When LLMs relay data through YON (Model A→B→C), facts survive.
 *            JSON relay tests the same pipeline for comparison.
 *
 * Tests:
 * 1. Three-Hop YON Relay — NL→YON→modify→extract via 3 hops
 * 2. Three-Hop JSON Relay — same pipeline but via JSON
 * 3. Intermediate Parse Validity — is the YON output at each hop parseable?
 *
 * Requires: OPENAI_API_KEY in .env.local
 */

import { parse } from '@younndai/yon-parser';
import { askLLM, loadYonGuide } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

function loadBrief(): string {
  return loadVector('multi-hop', 'brief.txt');
}

function loadGroundTruth(): Array<{ id: number; question: string; answer: string }> {
  const raw = loadVector('multi-hop', 'ground-truth.json');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testThreeHopYonRelay(): Promise<TestResult> {
  const brief = loadBrief();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  // Hop 1: NL → YON
  const guide = loadYonGuide();
  const hop1Prompt = [
    'Convert this natural language brief into a valid YON v2.0 document.',
    'Preserve ALL specific details (names, colors, numbers, text).',
    'Output ONLY valid YON.',
    '',
    'Brief:',
    brief,
  ].join('\n');

  const hop1Output = await askLLM(hop1Prompt, 3000, guide);

  // Hop 2: Receive YON, add 2 records + modify 1
  const hop2Prompt = [
    'You receive this YON document. Make these 3 changes:',
    '1. ADD a new section "Testimonials" with a @NOTE about a client quote from "Marina Design Co" saying "Kai transformed our brand completely"',
    '2. ADD a @RULE saying the navbar must be sticky/floating on scroll',
    '3. MODIFY the CTA — change "Let\'s Create Together" to "Start Your Project"',
    '',
    'Output the COMPLETE updated YON document (all original content + changes).',
    '',
    'Input YON:',
    hop1Output,
  ].join('\n');

  const hop2Output = await askLLM(hop2Prompt, 4000, guide);

  // Hop 3: Extract facts from the final YON
  const hop3Questions = [
    ...gt.map((q) => `${q.id}. ${q.question}`),
    '9. What client testimonial is mentioned?',
    '10. What is the navbar behavior requirement?',
  ];

  const hop3Prompt = [
    'Extract facts from this YON document. Answer each question on a separate line with ONLY the answer.',
    '',
    ...hop3Questions,
    '',
    'Document:',
    hop2Output,
  ].join('\n');

  const hop3Response = await askLLM(hop3Prompt);
  const durationMs = elapsed();

  // Score original 8 ground-truth questions
  const lines = hop3Response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let correct = 0;
  const details: string[] = [];

  for (let i = 0; i < gt.length; i++) {
    const expected = gt[i]!;
    const actual = lines[i] ?? '';

    // Special case: Q6 CTA was modified in hop 2
    if (expected.id === 6) {
      const found = actual.toLowerCase().includes('start your project');
      if (found) correct++;
      details.push(`Q${expected.id}: ${found ? '✓ (modified)' : '✗'}`);
    } else {
      const found = actual.toLowerCase().includes(expected.answer.toLowerCase());
      if (found) correct++;
      details.push(`Q${expected.id}: ${found ? '✓' : '✗'}`);
    }
  }

  // Check hop 2 additions (Q9 and Q10)
  const q9 = lines[8] ?? '';
  const q10 = lines[9] ?? '';
  const addedCorrect =
    (q9.toLowerCase().includes('marina') || q9.toLowerCase().includes('transformed') ? 1 : 0) +
    (q10.toLowerCase().includes('sticky') || q10.toLowerCase().includes('floating') ? 1 : 0);

  const totalQuestions = gt.length + 2;
  const totalCorrect = correct + addedCorrect;
  const accuracy = Math.round((totalCorrect / totalQuestions) * 100);

  return {
    id: 'three-hop-yon-relay',
    name: 'Three-Hop YON Relay (cross-model)',
    passed: accuracy >= 60,
    type: 'gate',
    metric: { name: 'yon_relay_accuracy', value: accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'original_facts', value: correct, unit: `/${gt.length}` },
      { name: 'added_facts', value: addedCorrect, unit: '/2' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `3-hop relay. Original facts: ${correct}/${gt.length}. Added facts: ${addedCorrect}/2. Total: ${totalCorrect}/${totalQuestions} (${accuracy}%). ${details.join(', ')}`,
  };
}

async function testThreeHopJsonRelay(): Promise<TestResult> {
  const brief = loadBrief();
  const gt = loadGroundTruth();
  const elapsed = startTimer();

  // Hop 1: NL → JSON
  const hop1Prompt = [
    'Convert this natural language brief into a structured JSON object.',
    'Use descriptive keys. Preserve ALL specific details (names, colors, numbers, text).',
    'Output ONLY valid JSON.',
    '',
    'Brief:',
    brief,
  ].join('\n');

  const hop1Output = await askLLM(hop1Prompt, 3000);

  // Hop 2: Receive JSON, add + modify
  const hop2Prompt = [
    'You receive this JSON document. Make these 3 changes:',
    '1. ADD a "testimonials" section with a client quote from "Marina Design Co"',
    '2. ADD a navbar requirement: sticky/floating on scroll',
    '3. MODIFY the CTA text from "Let\'s Create Together" to "Start Your Project"',
    '',
    'Output the COMPLETE updated JSON (all original content + changes). Output ONLY valid JSON.',
    '',
    'Input JSON:',
    hop1Output,
  ].join('\n');

  const hop2Output = await askLLM(hop2Prompt, 4000);

  // Hop 3: Extract facts
  const hop3Prompt = [
    'Extract facts from this JSON document. Answer each question on a separate line with ONLY the answer.',
    '',
    ...gt.map((q) => `${q.id}. ${q.question}`),
    '',
    'Document:',
    hop2Output,
  ].join('\n');

  const hop3Response = await askLLM(hop3Prompt);
  const durationMs = elapsed();

  const lines = hop3Response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let correct = 0;

  for (let i = 0; i < gt.length; i++) {
    const expected = gt[i]!;
    const actual = lines[i] ?? '';
    if (expected.id === 6) {
      if (actual.toLowerCase().includes('start your project')) correct++;
    } else {
      if (actual.toLowerCase().includes(expected.answer.toLowerCase())) correct++;
    }
  }

  const accuracy = Math.round((correct / gt.length) * 100);

  return {
    id: 'three-hop-json-relay',
    name: 'Three-Hop JSON Relay (comparison)',
    passed: true,
    type: 'comparative',
    metric: { name: 'json_relay_accuracy', value: accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'correct_answers', value: correct, unit: `/${gt.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `3-hop JSON relay. Facts at hop 3: ${correct}/${gt.length} (${accuracy}%).`,
  };
}

async function testIntermediateParseValidity(): Promise<TestResult> {
  const brief = loadBrief();
  const elapsed = startTimer();

  // Generate YON from brief
  const genPrompt = [
    'Convert this brief into a YON v2.0 document.',
    'Line 1 MUST be: @DOC ver=2.0 | id=<id> | title="<title>"',
    'Use @SEC, @NOTE, @MAP, @RULE tags.',
    'Each record is exactly ONE line. Do NOT put newlines inside quoted strings.',
    'Output ONLY valid YON.',
    '',
    brief,
  ].join('\n');

  const guide = loadYonGuide();
  const yonOutput = await askLLM(genPrompt, 3000, guide);
  const durationMs = elapsed();

  // Try to parse the generated YON
  let parseSuccess = false;
  let recordCount = 0;
  let parseError = '';

  try {
    const doc = parse(yonOutput);
    parseSuccess = true;
    recordCount = doc.records.length;
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }

  return {
    id: 'intermediate-parse-validity',
    name: 'Intermediate YON Parse Validity (§3 compliance)',
    passed: parseSuccess,
    type: 'gate',
    metric: { name: 'parse_valid', value: parseSuccess ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'record_count', value: recordCount, unit: 'records' },
      { name: 'yon_bytes', value: Buffer.byteLength(yonOutput), unit: 'bytes' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: parseSuccess
      ? `LLM-generated YON parses successfully: ${recordCount} records.`
      : `Parse failed: ${parseError}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [];
  tests.push(await testThreeHopYonRelay());
  tests.push(await testThreeHopJsonRelay());
  tests.push(await testIntermediateParseValidity());

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  // Compute outcome
  const yonTest = tests.find((t) => t.id === 'three-hop-yon-relay');
  const jsonTest = tests.find((t) => t.id === 'three-hop-json-relay');
  if (yonTest && jsonTest) {
    const delta = yonTest.metric.value - jsonTest.metric.value;
    yonTest.outcome = delta >= 5 ? 'advantage' : delta <= -5 ? 'disadvantage' : 'tied';
    jsonTest.outcome = yonTest.outcome === 'advantage' ? 'disadvantage' : yonTest.outcome === 'disadvantage' ? 'advantage' : 'tied';
  }

  return {
    suiteId: 'llm-multi-hop-pipeline',
    suiteName: 'LLM Multi-Hop Pipeline',
    pillar: 'cross-cutting',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runMultiHopPipeline };
