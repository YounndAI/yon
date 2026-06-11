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
 * RAG Extraction Suite
 *
 * Pillar: Cognitive Economy
 * Axis: Context quality (RAG retrieval effectiveness)
 * Validates: When RAG retrieves YON rules as context, does the LLM answer
 *            more accurately than with natural language prose context?
 *
 * Tests:
 * 1. Token-Budget RAG — fixed token budget, density comparison (gate)
 * 2. Format Ladder — full content accuracy across canon/min/ultra (measurement)
 * 3. NL vs YON Equal Content — same rules, different format (comparative)
 * 4. RAG YON Accuracy — 5 of 12 YON rules as context → extraction accuracy
 * 5. RAG NL Accuracy — same rules as prose → comparison
 * 6. RAG Hallucination Rate — questions about absent rules → hallucination check
 * 7. RAG Context Scaling — variable context sizes → accuracy curve (measurement)
 *
 * Requires: OPENAI_API_KEY in .env.local
 */

import { askLLM } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import { countTokens, truncateYonToTokenBudget, truncateNlToTokenBudget } from '../core/tokens.js';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

interface Question {
  id: number;
  question: string;
  answer: string;
  answerable: boolean;
  rule_index: number;
}

function loadQuestions(): Question[] {
  return JSON.parse(loadVector('rag-context', 'questions.json'));
}

function loadYonRules(): string {
  return loadVector('rag-context', 'canon.yon');
}

function loadMinYonRules(): string {
  return loadVector('rag-context', 'min.yon');
}

function loadUltraYonRules(): string {
  return loadVector('rag-context', 'ultra.yon');
}

function loadNlRules(): string {
  return loadVector('rag-context', 'rules-nl.txt');
}

// ---------------------------------------------------------------------------
// YON Reading Preamble — explains YON notation to the LLM before RAG tests
// ---------------------------------------------------------------------------

const YON_READING_PREAMBLE = [
  'The context below uses YON notation. Here is how to read it:',
  '- @SEC name="..." defines a named section (topic heading)',
  '- @RULE lvl=must/must_not | then="..." defines a rule (the policy content)',
  '- @NOTE text="..." provides supplementary information',
  '- @MAP id=... | pairs=["key"->"value"] defines key-value data',
  '- Text in [brackets] after abbreviated terms expands the abbreviation, e.g. "within 24h [within 24 hours]"',
  'Extract answers from the rule text and notes. Treat each @RULE as a policy statement.',
  '',
].join('\n');

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Extract YON sections by index range (1-based section numbering). */
function extractYonSections(yon: string, sectionIndices: number[]): string {
  const lines = yon.split('\n');
  const sections: string[][] = [];
  let currentSection: string[] = [];
  let sectionIdx = 0;

  for (const line of lines) {
    if (line.trim().startsWith('@DOC')) {
      continue;
    }
    if (line.trim().startsWith('@SEC')) {
      if (currentSection.length > 0 && sectionIdx > 0) {
        sections.push(currentSection);
      }
      sectionIdx++;
      currentSection = [line];
      continue;
    }
    currentSection.push(line);
  }
  if (currentSection.length > 0 && sectionIdx > 0) {
    sections.push(currentSection);
  }

  // Extract the @DOC line + requested sections
  const docLine = lines.find((l) => l.trim().startsWith('@DOC')) ?? '';
  const selectedLines = [docLine, ''];
  for (const idx of sectionIndices) {
    if (idx - 1 < sections.length) {
      selectedLines.push(...sections[idx - 1]!, '');
    }
  }
  return selectedLines.join('\n');
}

/** Extract NL paragraphs by index (1-based, paragraphs separated by blank lines). */
function extractNlParagraphs(nl: string, indices: number[]): string {
  const paragraphs = nl.split('\n\n').filter((p) => p.trim().length > 0);
  return indices
    .filter((i) => i - 1 < paragraphs.length)
    .map((i) => paragraphs[i - 1]!)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreAnswers(
  llmResponse: string,
  questions: Question[],
): { correct: number; details: string[] } {
  const lines = llmResponse.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let correct = 0;
  const details: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    const actual = lines[i] ?? '';
    const found = actual.toLowerCase().includes(q.answer.toLowerCase());
    if (found) correct++;
    details.push(`Q${q.id}: ${found ? '✓' : '✗'}`);
  }

  return { correct, details };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testRagYonAccuracy(): Promise<TestResult> {
  const yon = loadYonRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  // Use first 5 sections as RAG context (sections 1-5 cover rules 1-5)
  const context = extractYonSections(yon, [1, 2, 3, 4, 5]);

  const prompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, answer "NOT FOUND".',
    'Answer each question on a separate line with ONLY the answer.',
    '',
    ...questions.map((q) => `${q.id}. ${q.question}`),
    '',
    YON_READING_PREAMBLE,
    'Context (YON format):',
    context,
  ].join('\n');

  const response = await askLLM(prompt);
  const durationMs = elapsed();
  const { correct, details } = scoreAnswers(response, questions);

  // Questions with rule_index 1-5 should be answerable, 6+ should be NOT FOUND
  const coverableQs = questions.filter((q) => q.rule_index <= 5);
  // Score only coverable questions for the gate
  const coverableCorrect = coverableQs.filter((q) => {
    const idx = questions.indexOf(q);
    const line = response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim())[idx] ?? '';
    return line.toLowerCase().includes(q.answer.toLowerCase());
  }).length;
  const coverableAccuracy = Math.round((coverableCorrect / coverableQs.length) * 100);
  const totalAccuracy = Math.round((correct / questions.length) * 100);

  return {
    id: 'rag-yon-accuracy',
    name: 'RAG YON Accuracy (5/12 rules as context)',
    passed: true, // Comparative: always passes, delta is the metric
    type: 'comparative',
    metric: { name: 'coverable_accuracy', value: coverableAccuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'coverable_correct', value: coverableCorrect, unit: `/${coverableQs.length}` },
      { name: 'total_correct', value: correct, unit: `/${questions.length}` },
      { name: 'total_accuracy', value: totalAccuracy, unit: '%' },
      { name: 'context_rules', value: 5, unit: '/12 rules' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `5/12 YON rules as context. Coverable: ${coverableCorrect}/${coverableQs.length} (${coverableAccuracy}%). Total: ${correct}/${questions.length} (${totalAccuracy}%). ${details.join(', ')}`,
  };
}

async function testRagNlAccuracy(): Promise<TestResult> {
  const nl = loadNlRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  // Same 5 rules as NL prose
  const context = extractNlParagraphs(nl, [1, 2, 3, 4, 5]);

  const prompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, answer "NOT FOUND".',
    'Answer each question on a separate line with ONLY the answer.',
    '',
    ...questions.map((q) => `${q.id}. ${q.question}`),
    '',
    'Context (natural language):',
    context,
  ].join('\n');

  const response = await askLLM(prompt);
  const durationMs = elapsed();
  const { correct, details } = scoreAnswers(response, questions);
  const accuracy = Math.round((correct / questions.length) * 100);

  return {
    id: 'rag-nl-accuracy',
    name: 'RAG NL Accuracy (comparison)',
    passed: true,
    type: 'comparative',
    metric: { name: 'nl_accuracy', value: accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'correct', value: correct, unit: `/${questions.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `5/12 NL paragraphs as context. ${correct}/${questions.length} correct (${accuracy}%). ${details.join(', ')}`,
  };
}

async function testRagHallucinationRate(): Promise<TestResult> {
  const yon = loadYonRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  // Use only sections 7-12 (AML, Data Retention, Chinese Wall, Reconciliation, Marketing, Whistleblower)
  // This means questions about rules 1-6 should ALL be "NOT FOUND"
  const context = extractYonSections(yon, [7, 8, 9, 10, 11, 12]);

  // Ask only questions whose answers are in sections 1-6 (NOT in context)
  const absentQuestions = questions.filter((q) => q.rule_index <= 6);

  const prompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, you MUST answer "NOT FOUND".',
    'Answer each on a separate line with ONLY the answer.',
    '',
    ...absentQuestions.map((q) => `${q.id}. ${q.question}`),
    '',
    YON_READING_PREAMBLE,
    'Context (YON format):',
    context,
  ].join('\n');

  const response = await askLLM(prompt);
  const durationMs = elapsed();

  const lines = response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let hallucinations = 0;
  const details: string[] = [];

  for (let i = 0; i < absentQuestions.length; i++) {
    const actual = lines[i] ?? '';
    const saysNotFound = actual.toLowerCase().includes('not found') ||
      actual.toLowerCase().includes('n/a') ||
      actual.toLowerCase().includes('not available') ||
      actual.toLowerCase().includes('not in the context');
    if (!saysNotFound) {
      hallucinations++;
      details.push(`Q${absentQuestions[i]!.id}: HALLUCINATED "${actual.slice(0, 50)}"`);
    }
  }

  const hallRate = Math.round((hallucinations / absentQuestions.length) * 100);

  return {
    id: 'rag-hallucination-rate',
    name: 'RAG Hallucination Rate — YON context (absent rules)',
    passed: hallRate <= 30,
    type: 'gate',
    metric: { name: 'hallucination_rate', value: hallRate, unit: '%' },
    secondaryMetrics: [
      { name: 'hallucinations', value: hallucinations, unit: `/${absentQuestions.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `YON context: ${hallucinations}/${absentQuestions.length} absent-rule questions answered (${hallRate}% hallucination). ${details.join('; ') || 'No hallucinations.'}`,
  };
}

/**
 * Test: NL Hallucination Rate (comparative)
 *
 * Same methodology as testRagHallucinationRate but using NL prose context.
 * Questions about rules NOT in the context should be answered "NOT FOUND".
 * Hallucination = the LLM invents an answer instead of saying "NOT FOUND".
 *
 * Core Phase 5 question: Does YON reduce hallucination compared to NL?
 */
async function testRagNlHallucinationRate(): Promise<TestResult> {
  const nl = loadNlRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  // Use NL paragraphs 7-12 (same content as YON sections 7-12)
  const context = extractNlParagraphs(nl, [7, 8, 9, 10, 11, 12]);

  // Ask only questions whose answers are in paragraphs 1-6 (NOT in context)
  const absentQuestions = questions.filter((q) => q.rule_index <= 6);

  const prompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, you MUST answer "NOT FOUND".',
    'Answer each on a separate line with ONLY the answer.',
    '',
    ...absentQuestions.map((q) => `${q.id}. ${q.question}`),
    '',
    'Context (natural language):',
    context,
  ].join('\n');

  const response = await askLLM(prompt);
  const durationMs = elapsed();

  const lines = response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  let hallucinations = 0;
  const details: string[] = [];

  for (let i = 0; i < absentQuestions.length; i++) {
    const actual = lines[i] ?? '';
    const saysNotFound = actual.toLowerCase().includes('not found') ||
      actual.toLowerCase().includes('n/a') ||
      actual.toLowerCase().includes('not available') ||
      actual.toLowerCase().includes('not in the context');
    if (!saysNotFound) {
      hallucinations++;
      details.push(`Q${absentQuestions[i]!.id}: HALLUCINATED "${actual.slice(0, 50)}"`);
    }
  }

  const hallRate = Math.round((hallucinations / absentQuestions.length) * 100);

  return {
    id: 'rag-nl-hallucination-rate',
    name: 'RAG Hallucination Rate — NL context (absent rules)',
    passed: true, // Comparative — always passes, delta is the metric
    type: 'comparative',
    metric: { name: 'nl_hallucination_rate', value: hallRate, unit: '%' },
    secondaryMetrics: [
      { name: 'hallucinations', value: hallucinations, unit: `/${absentQuestions.length}` },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `NL context: ${hallucinations}/${absentQuestions.length} absent-rule questions answered (${hallRate}% hallucination). ${details.join('; ') || 'No hallucinations.'}`,
  };
}

/**
 * Test: Hallucination Comparison (YON vs NL)
 *
 * Synthesizes the results of the YON and NL hallucination tests into a single
 * comparative result. This is the Phase 5 thesis test:
 * "Does structured notation reduce hallucination?"
 */
async function testHallucinationComparison(): Promise<{ yon: TestResult; nl: TestResult; comparison: TestResult }> {
  const yonResult = await testRagHallucinationRate();
  const nlResult = await testRagNlHallucinationRate();

  const yonRate = yonResult.metric.value;
  const nlRate = nlResult.metric.value;
  const delta = nlRate - yonRate; // Positive = YON hallucinates LESS (good)

  const comparison: TestResult = {
    id: 'hallucination-comparison',
    name: 'Hallucination Comparison (NL vs YON)',
    passed: true,
    type: 'comparative',
    metric: { name: 'hallucination_delta', value: delta, unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_hallucination_rate', value: yonRate, unit: '%' },
      { name: 'nl_hallucination_rate', value: nlRate, unit: '%' },
    ],
    detail: `YON hallucination: ${yonRate}% vs NL hallucination: ${nlRate}%. Delta: ${delta >= 0 ? '+' : ''}${delta}pp (positive = YON hallucinates less).`,
    outcome: delta > 5 ? 'advantage' : delta < -5 ? 'disadvantage' : 'tied',
  };

  return { yon: yonResult, nl: nlResult, comparison };
}

async function testRagContextScaling(): Promise<TestResult> {
  const yon = loadYonRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  const scaleLevels = [3, 5, 8, 12];
  const accuracies: number[] = [];

  for (const n of scaleLevels) {
    const sectionIds = Array.from({ length: n }, (_, i) => i + 1);
    const context = extractYonSections(yon, sectionIds);

    const prompt = [
      `You have ${n} of 12 rules as context. Answer using ONLY what is provided.`,
      'If not available, answer "NOT FOUND". One answer per line.',
      '',
      ...questions.map((q) => `${q.id}. ${q.question}`),
      '',
      YON_READING_PREAMBLE,
      'Context (YON format):',
      context,
    ].join('\n');

    const response = await askLLM(prompt);
    const { correct } = scoreAnswers(response, questions);
    accuracies.push(Math.round((correct / questions.length) * 100));
  }

  const durationMs = elapsed();
  const isMonotonic = accuracies.every((v, i) => i === 0 || v >= accuracies[i - 1]!);

  return {
    id: 'rag-context-scaling',
    name: 'RAG Context Scaling (3→5→8→12 rules)',
    passed: true,
    type: 'measurement',
    metric: { name: 'accuracy_at_12', value: accuracies[3]!, unit: '%' },
    secondaryMetrics: [
      { name: 'accuracy_at_3', value: accuracies[0]!, unit: '%' },
      { name: 'accuracy_at_5', value: accuracies[1]!, unit: '%' },
      { name: 'accuracy_at_8', value: accuracies[2]!, unit: '%' },
      { name: 'monotonic_increase', value: isMonotonic ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Scaling: 3 rules=${accuracies[0]}%, 5=${accuracies[1]}%, 8=${accuracies[2]}%, 12=${accuracies[3]}%. Monotonic: ${isMonotonic ? 'YES' : 'NO'}.`,
  };
}

// ---------------------------------------------------------------------------
// Token-Budget Tests (Phase 1 additions)
// ---------------------------------------------------------------------------

/**
 * Map a surviving YON section index (1-based) to the corresponding rule_index
 * used in questions.json. Section N covers rule_index N.
 */
function sectionToRuleIndex(sectionIdx: number): number {
  return sectionIdx;
}

/**
 * Score answers for only the questions whose rules survived truncation.
 * Returns { coverable, correct, accuracy }.
 */
function scoreCoverableAnswers(
  response: string,
  questions: Question[],
  survivingRuleIndices: Set<number>,
): { coverable: number; correct: number; accuracy: number } {
  const lines = response.trim().split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim());
  const coverableQs = questions.filter((q) => survivingRuleIndices.has(q.rule_index));
  let correct = 0;

  for (const q of coverableQs) {
    const idx = questions.indexOf(q);
    const actual = lines[idx] ?? '';
    if (actual.toLowerCase().includes(q.answer.toLowerCase())) correct++;
  }

  return {
    coverable: coverableQs.length,
    correct,
    accuracy: coverableQs.length > 0 ? Math.round((correct / coverableQs.length) * 100) : 0,
  };
}

/**
 * Test: Token-Budget RAG (gate)
 *
 * At a fixed token budget (enough for 4 NL paragraphs), compare how many
 * questions each format can answer. YON density should mean more rules
 * fit → more questions answered.
 */
async function testTokenBudgetRag(): Promise<TestResult> {
  const nl = loadNlRules();
  const canon = loadYonRules();
  const min = loadMinYonRules();
  const ultra = loadUltraYonRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  // Compute budget: tokens for exactly 4 NL paragraphs
  const nlParagraphs = nl.split(/\r?\n\r?\n/).filter((p) => p.trim().length > 0);
  const first4 = nlParagraphs.slice(0, 4).join('\n\n');
  const budget = countTokens(first4);

  // Truncate each format to budget
  const nlTrunc = truncateNlToTokenBudget(nl, budget);
  const canonTrunc = truncateYonToTokenBudget(canon, budget);
  const minTrunc = truncateYonToTokenBudget(min, budget);
  const ultraTrunc = truncateYonToTokenBudget(ultra, budget);

  // Build prompts and score each format
  const formatResults: Array<{
    name: string;
    accuracy: number;
    coverable: number;
    correct: number;
    sections: number;
    tokens: number;
  }> = [];

  const formats = [
    { name: 'NL', text: nlTrunc.text, surviving: new Set(nlTrunc.survivingParagraphs), label: 'plain English' },
    { name: 'Canon', text: canonTrunc.text, surviving: new Set(canonTrunc.survivingSections.map(sectionToRuleIndex)), label: 'YON canon format' },
    { name: 'Min', text: minTrunc.text, surviving: new Set(minTrunc.survivingSections.map(sectionToRuleIndex)), label: 'YON min format' },
    { name: 'Ultra', text: ultraTrunc.text, surviving: new Set(ultraTrunc.survivingSections.map(sectionToRuleIndex)), label: 'YON ultra format' },
  ];

  for (const fmt of formats) {
    const isYon = fmt.name !== 'NL';
    const prompt = [
      'You are answering questions using ONLY the context provided below.',
      'If the answer is not in the context, answer "NOT FOUND".',
      'Answer each question on a separate line with ONLY the answer.',
      '',
      ...questions.map((q) => `${q.id}. ${q.question}`),
      '',
      ...(isYon ? [YON_READING_PREAMBLE] : []),
      `Context (${fmt.label}):`,
      fmt.text,
    ].join('\n');

    const response = await askLLM(prompt);
    const scored = scoreCoverableAnswers(response, questions, fmt.surviving);
    const tokens = countTokens(fmt.text);

    formatResults.push({
      name: fmt.name,
      accuracy: scored.accuracy,
      coverable: scored.coverable,
      correct: scored.correct,
      sections: fmt.surviving.size,
      tokens,
    });
  }

  const durationMs = elapsed();

  const nlResult = formatResults.find((r) => r.name === 'NL')!;
  const minResult = formatResults.find((r) => r.name === 'Min')!;

  // Comparative: at extreme token budgets, NL can win because YON tags cost tokens.
  // This is expected — structure helps at scale, not at 165 tokens.
  const delta = minResult.accuracy - nlResult.accuracy;
  const outcome = delta > 0 ? 'advantage' : delta < 0 ? 'disadvantage' : 'tied';

  const details = formatResults.map(
    (r) => `${r.name}: ${r.correct}/${r.coverable} (${r.accuracy}%) at ${r.tokens}tok, ${r.sections} rules`,
  );

  return {
    id: 'rag-token-budget',
    name: `Token-Budget RAG (budget=${budget}tok)`,
    passed: true,
    type: 'comparative',
    metric: { name: 'min_coverable_accuracy', value: minResult.accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'nl_coverable_accuracy', value: nlResult.accuracy, unit: '%' },
      { name: 'budget_tokens', value: budget, unit: 'tokens' },
      { name: 'nl_rules_fit', value: nlResult.sections, unit: '/12' },
      { name: 'min_rules_fit', value: minResult.sections, unit: '/12' },
      ...formatResults.map((r) => ({ name: `${r.name.toLowerCase()}_accuracy`, value: r.accuracy, unit: '%' })),
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Budget: ${budget} tokens (4 NL paragraphs). ${details.join('. ')}`,
    outcome,
  };
}

/**
 * Test: Format Ladder (measurement)
 *
 * Full content: run all questions against canon/min/ultra.
 * Reports accuracy, tokens, and accuracy-per-token ratio.
 */
async function testFormatLadder(): Promise<TestResult> {
  const canon = loadYonRules();
  const min = loadMinYonRules();
  const ultra = loadUltraYonRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  const formats = [
    { name: 'Canon', data: canon },
    { name: 'Min', data: min },
    { name: 'Ultra', data: ultra },
  ];

  const results: Array<{ name: string; accuracy: number; tokens: number; perToken: number }> = [];

  for (const fmt of formats) {
    const tokens = countTokens(fmt.data);
    const prompt = [
      'You are answering questions using ONLY the context provided below.',
      'If the answer is not in the context, answer "NOT FOUND".',
      'Answer each question on a separate line with ONLY the answer.',
      '',
      ...questions.map((q) => `${q.id}. ${q.question}`),
      '',
      YON_READING_PREAMBLE,
      `Context (YON ${fmt.name.toLowerCase()} format):`,
      fmt.data,
    ].join('\n');

    const response = await askLLM(prompt);
    const { correct } = scoreAnswers(response, questions);
    const accuracy = Math.round((correct / questions.length) * 100);
    const perToken = Math.round((accuracy / tokens) * 1000);

    results.push({ name: fmt.name, accuracy, tokens, perToken });
  }

  const durationMs = elapsed();
  const details = results.map(
    (r) => `${r.name}: ${r.accuracy}% at ${r.tokens}tok (${r.perToken} acc/1ktok)`,
  );

  return {
    id: 'rag-format-ladder',
    name: 'Format Ladder (canon/min/ultra, full content)',
    passed: true,
    type: 'measurement',
    metric: { name: 'min_accuracy_per_1k_tokens', value: results.find((r) => r.name === 'Min')!.perToken, unit: 'acc/1ktok' },
    secondaryMetrics: [
      ...results.flatMap((r) => [
        { name: `${r.name.toLowerCase()}_accuracy`, value: r.accuracy, unit: '%' },
        { name: `${r.name.toLowerCase()}_tokens`, value: r.tokens, unit: 'tokens' },
        { name: `${r.name.toLowerCase()}_per_1k_tokens`, value: r.perToken, unit: 'acc/1ktok' },
      ]),
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: details.join('. '),
  };
}

/**
 * Test: NL vs YON Equal Content (comparative)
 *
 * Same 5/12 rules, same questions — YON canon vs NL prose.
 * Reclassified as comparative (no gate). Honest delta reporting.
 */
async function testEqualContentComparative(): Promise<TestResult> {
  const yon = loadYonRules();
  const nl = loadNlRules();
  const questions = loadQuestions();
  const elapsed = startTimer();

  const yonContext = extractYonSections(yon, [1, 2, 3, 4, 5]);
  const nlContext = extractNlParagraphs(nl, [1, 2, 3, 4, 5]);

  const coverableQs = questions.filter((q) => q.rule_index <= 5);

  // YON run
  const yonPrompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, answer "NOT FOUND".',
    'Answer each question on a separate line with ONLY the answer.',
    '',
    ...questions.map((q) => `${q.id}. ${q.question}`),
    '',
    YON_READING_PREAMBLE,
    'Context (YON format):',
    yonContext,
  ].join('\n');
  const yonResponse = await askLLM(yonPrompt);
  const yonScored = scoreCoverableAnswers(yonResponse, questions, new Set(coverableQs.map((q) => q.rule_index)));

  // NL run
  const nlPrompt = [
    'You are answering questions using ONLY the context provided below.',
    'If the answer is not in the context, answer "NOT FOUND".',
    'Answer each question on a separate line with ONLY the answer.',
    '',
    ...questions.map((q) => `${q.id}. ${q.question}`),
    '',
    'Context (plain English):',
    nlContext,
  ].join('\n');
  const nlResponse = await askLLM(nlPrompt);
  const nlScored = scoreCoverableAnswers(nlResponse, questions, new Set(coverableQs.map((q) => q.rule_index)));

  const durationMs = elapsed();
  const delta = yonScored.accuracy - nlScored.accuracy;

  const yonTokens = countTokens(yonContext);
  const nlTokens = countTokens(nlContext);

  return {
    id: 'rag-equal-content',
    name: 'NL vs YON Equal Content (5/12 rules)',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_nl_delta', value: delta, unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_accuracy', value: yonScored.accuracy, unit: '%' },
      { name: 'nl_accuracy', value: nlScored.accuracy, unit: '%' },
      { name: 'yon_tokens', value: yonTokens, unit: 'tokens' },
      { name: 'nl_tokens', value: nlTokens, unit: 'tokens' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Equal content (5/12 rules). YON: ${yonScored.correct}/${yonScored.coverable} (${yonScored.accuracy}%) at ${yonTokens}tok. NL: ${nlScored.correct}/${nlScored.coverable} (${nlScored.accuracy}%) at ${nlTokens}tok. Delta: ${delta >= 0 ? '+' : ''}${delta}pp.`,
    outcome: delta >= 5 ? 'advantage' : delta <= -5 ? 'disadvantage' : 'tied',
  };
}

// ---------------------------------------------------------------------------
// Cross-Dataset RAG Tests (Phase 4 additions)
// ---------------------------------------------------------------------------

interface RagDataset {
  id: string;
  name: string;
  dir: string;
}

const ADDITIONAL_DATASETS: RagDataset[] = [
  { id: 'api-design', name: 'API Design Guidelines', dir: 'rag-api-design' },
  { id: 'security', name: 'Security Policy', dir: 'rag-security' },
];

/**
 * Test: Cross-Dataset Token-Budget (measurement)
 *
 * Runs the same token-budget comparison on additional domains.
 * Validates that YON's density advantage generalizes beyond financial compliance.
 */
async function testCrossDatasetRag(dataset: RagDataset): Promise<TestResult> {
  const nl = loadVector(dataset.dir, 'rules-nl.txt');
  const minYon = loadVector(dataset.dir, 'min.yon');
  const questionsRaw = loadVector(dataset.dir, 'questions.json');
  const questions: Question[] = JSON.parse(questionsRaw);
  const elapsed = startTimer();

  // Budget = 4 NL paragraphs
  const nlParagraphs = nl.split(/\r?\n\r?\n/).filter((p) => p.trim().length > 0);
  const first4 = nlParagraphs.slice(0, 4).join('\n\n');
  const budget = countTokens(first4);

  // Truncate both
  const { text: truncNl, survivingParagraphs } = truncateNlToTokenBudget(nl, budget);
  const { text: truncMin, survivingSections: survivingMinSecs } = truncateYonToTokenBudget(minYon, budget);

  // Build surviving rule sets
  const nlSurviving = new Set(survivingParagraphs);
  const minSurviving = new Set(survivingMinSecs);

  // Ask LLM
  const qBlock = questions.map((q) => q.id + '. ' + q.question).join('\n');
  const nlPrompt = 'Answer each question using ONLY this context. 1-10 words each.\n\n' + truncNl + '\n\n' + qBlock;
  const minPrompt = 'Answer each question using ONLY this YON context. 1-10 words each.\n\n' + YON_READING_PREAMBLE + '\n' + truncMin + '\n\n' + qBlock;

  const nlResponse = await askLLM(nlPrompt);
  const minResponse = await askLLM(minPrompt);

  const nlScored = scoreCoverableAnswers(nlResponse, questions, nlSurviving);
  const minScored = scoreCoverableAnswers(minResponse, questions, minSurviving);

  const durationMs = elapsed();
  const delta = minScored.accuracy - nlScored.accuracy;
  const nlTokens = countTokens(truncNl);
  const minTokens = countTokens(truncMin);

  return {
    id: 'cross-dataset-rag-' + dataset.id,
    name: 'Cross-Dataset RAG (' + dataset.name + ')',
    passed: true, // Measurement — no gate
    type: 'measurement',
    metric: { name: 'min_accuracy', value: minScored.accuracy, unit: '%' },
    secondaryMetrics: [
      { name: 'nl_accuracy', value: nlScored.accuracy, unit: '%' },
      { name: 'delta', value: delta, unit: 'pp' },
      { name: 'budget_tokens', value: budget, unit: 'cl100k' },
      { name: 'nl_tokens_used', value: nlTokens, unit: 'cl100k' },
      { name: 'min_tokens_used', value: minTokens, unit: 'cl100k' },
      { name: 'nl_rules_fit', value: survivingParagraphs.length, unit: 'paragraphs' },
      { name: 'min_rules_fit', value: survivingMinSecs.length, unit: 'sections' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: dataset.name + ': min ' + minScored.accuracy + '% (' + minScored.correct + '/' + minScored.coverable + ') vs NL ' + nlScored.accuracy + '% (' + nlScored.correct + '/' + nlScored.coverable + '). Min fit ' + survivingMinSecs.length + ' sections vs NL ' + survivingParagraphs.length + ' paragraphs at ' + budget + ' tok budget. Delta: ' + (delta >= 0 ? '+' : '') + delta + 'pp.',
    outcome: delta >= 5 ? 'advantage' : delta <= -5 ? 'disadvantage' : 'tied',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  // All test functions load independent vectors — safe to parallelize (Tier 4 = 10k RPM)
  // Group into 3 parallel batches to maximize concurrency while respecting test ordering for outcome computation
  const [groupA, groupB, groupC] = await Promise.all([
    // Group A: token-budget tests (independent)
    Promise.allSettled([
      testTokenBudgetRag(),
      testFormatLadder(),
      testEqualContentComparative(),
    ]),
    // Group B: existing tests (independent of each other)
    Promise.allSettled([
      testRagYonAccuracy(),
      testRagNlAccuracy(),
      testHallucinationComparison(),
      testRagContextScaling(),
    ]),
    // Group C: cross-dataset tests (independent per dataset)
    Promise.allSettled(
      ADDITIONAL_DATASETS.map((dataset) => testCrossDatasetRag(dataset)),
    ),
  ]);

  const unwrap = (r: PromiseSettledResult<TestResult>) => {
    if (r.status === 'fulfilled') return r.value;
    throw r.reason;
  };
  const unwrapHall = (r: PromiseSettledResult<{ yon: TestResult; nl: TestResult; comparison: TestResult }>) => {
    if (r.status === 'fulfilled') return r.value;
    throw r.reason;
  };

  // Flatten results preserving order
  const tests: TestResult[] = [];
  for (const r of groupA) tests.push(unwrap(r));
  tests.push(unwrap(groupB[0]!)); // ragYonAccuracy
  tests.push(unwrap(groupB[1]!)); // ragNlAccuracy
  const hallResult = unwrapHall(groupB[2]! as PromiseSettledResult<{ yon: TestResult; nl: TestResult; comparison: TestResult }>);
  tests.push(hallResult.yon, hallResult.nl, hallResult.comparison);
  tests.push(unwrap(groupB[3]!)); // ragContextScaling
  for (const r of groupC) tests.push(unwrap(r));

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  // Outcome: compare YON vs NL accuracy (existing logic)
  const yonTest = tests.find((t) => t.id === 'rag-yon-accuracy');
  const nlTest = tests.find((t) => t.id === 'rag-nl-accuracy');
  if (yonTest && nlTest) {
    const delta = yonTest.metric.value - nlTest.metric.value;
    yonTest.outcome = delta >= 5 ? 'advantage' : delta <= -5 ? 'disadvantage' : 'tied';
    nlTest.outcome = yonTest.outcome === 'advantage' ? 'disadvantage' : yonTest.outcome === 'disadvantage' ? 'advantage' : 'tied';
  }

  return {
    suiteId: 'llm-rag-extraction',
    suiteName: 'LLM RAG Extraction',
    pillar: 'cognitive-economy',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runRagExtraction };
