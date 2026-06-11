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
 * Information Preservation Suite
 *
 * Pillar: Lossless
 * Axis: Payload (content-level)
 * Spec: §5 (Encoding Principle)
 * Validates: YON → LLM extraction pipeline preserves facts and hedging.
 *
 * Uses pre-generated golden YON vectors (AOT using standard encoding techniques).
 * NO encoder runtime dependency — Apache 2.0 compatible.
 *
 * Tests:
 * 1. Fact Survival — prose facts survive the YON → LLM roundtrip
 * 2. Hedging Preservation — hedged claims survive the pipeline
 *
 * Requires: OPENAI_API_KEY in .env.local
 */

import { askLLM } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

/** 10 prose sentences with verifiable facts. */
const SOURCE_PROSE = [
  'Meridian Analytics was founded in 2019 by Dr. Eva Chen.',
  'The company is headquartered in Amsterdam, Netherlands.',
  'They have 342 employees across 5 offices worldwide.',
  'Annual revenue reached €28.5 million in fiscal year 2025.',
  'Their flagship product DataForge handles real-time data pipeline orchestration.',
  'The platform processes approximately 45 million events per day.',
  'Uptime SLA is guaranteed at 99.97% for enterprise customers.',
  'Average API latency is 12.4 milliseconds under normal load.',
  'CTO Marcus Okonkwo leads the engineering team of 120 developers.',
  'The company serves 1,247 active customers in 38 countries.',
];

/** Extractable facts from each sentence. */
const EXPECTED_FACTS = [
  { key: 'founded', value: '2019' },
  { key: 'headquarters', value: 'Amsterdam' },
  { key: 'employees', value: '342' },
  { key: 'revenue', value: '28.5' },
  { key: 'product', value: 'DataForge' },
  { key: 'daily_events', value: '45 million' },
  { key: 'uptime', value: '99.97' },
  { key: 'latency', value: '12.4' },
  { key: 'cto', value: 'Marcus Okonkwo' },
  { key: 'customers', value: '1,247' },
];

/** Hedging markers that must survive the pipeline. */
const HEDGE_MARKERS = ['might', 'approximately', 'potentially', 'suggest', 'roughly'];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testFactSurvival(): Promise<TestResult> {
  const proseInput = SOURCE_PROSE.join(' ');

  // Load pre-generated golden YON vector (AOT from encoder)
  const elapsed = startTimer();
  const yonOutput = loadVector('information-preservation', 'fact-survival.yon');

  // YON → LLM extract facts
  const extractPrompt = [
    'Given this YON document, extract the following facts. Answer with ONLY the value, one per line:',
    ...EXPECTED_FACTS.map((f) => `- ${f.key}`),
    '',
    'Document:',
    yonOutput,
  ].join('\n');

  const llmAnswers = await askLLM(extractPrompt);
  const durationMs = elapsed();

  // Score: check each fact
  const lines = llmAnswers.trim().split('\n').map((l) => l.trim().replace(/^[-•]\s*/, ''));
  let preserved = 0;
  const factDetails: string[] = [];

  for (let i = 0; i < EXPECTED_FACTS.length; i++) {
    const expected = EXPECTED_FACTS[i]!;
    const actual = lines[i] ?? '';
    const found = actual.toLowerCase().includes(expected.value.toLowerCase());
    if (found) preserved++;
    factDetails.push(`${expected.key}: ${found ? '✓' : '✗'} (expected "${expected.value}", got "${actual}")`);
  }

  return {
    id: 'fact-survival',
    name: 'Fact Survival (§5 YON→LLM roundtrip)',
    passed: preserved >= 8, // Allow 2 misses for LLM extraction noise
    metric: {
      name: 'facts_preserved',
      value: preserved,
      unit: '/10 facts',
    },
    secondaryMetrics: [
      { name: 'yon_bytes', value: Buffer.byteLength(yonOutput), unit: 'bytes' },
      { name: 'prose_bytes', value: Buffer.byteLength(proseInput), unit: 'bytes' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Golden YON → LLM extraction. ${preserved}/10 facts survived. ${factDetails.join('; ')}`,
  };
}

async function testHedgingPreservation(): Promise<TestResult> {
  // Load pre-generated golden YON vector (AOT from encoder)
  const elapsed = startTimer();
  const yonOutput = loadVector('information-preservation', 'hedge-survival.yon');

  // Check if hedging markers survived in the YON output itself
  let hedgesInYon = 0;
  const hedgeDetails: string[] = [];
  for (const marker of HEDGE_MARKERS) {
    const found = yonOutput.toLowerCase().includes(marker);
    if (found) hedgesInYon++;
    hedgeDetails.push(`"${marker}": ${found ? '✓' : '✗'}`);
  }

  // Also verify LLM can extract the uncertain nature
  const verifyPrompt = [
    'Given this YON document, list any statements that express uncertainty, estimation, or hedging.',
    'For each, quote the hedging word used (e.g., "might", "approximately").',
    'Answer one per line.',
    '',
    'Document:',
    yonOutput,
  ].join('\n');

  const llmResponse = await askLLM(verifyPrompt);
  const durationMs = elapsed();

  // Count how many hedging markers the LLM identified
  let llmDetected = 0;
  for (const marker of HEDGE_MARKERS) {
    if (llmResponse.toLowerCase().includes(marker)) llmDetected++;
  }

  return {
    id: 'hedging-survival',
    name: 'Hedging Survival (§5 uncertainty)',
    passed: hedgesInYon >= 4, // Allow 1 miss
    metric: {
      name: 'hedges_in_yon',
      value: hedgesInYon,
      unit: `/5 markers`,
    },
    secondaryMetrics: [
      { name: 'llm_detected', value: llmDetected, unit: '/5 markers' },
      { name: 'yon_bytes', value: Buffer.byteLength(yonOutput), unit: 'bytes' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: `Golden YON preserved ${hedgesInYon}/5 hedging markers. LLM detected ${llmDetected}/5 from YON. ${hedgeDetails.join(', ')}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [];
  tests.push(await testFactSurvival());
  tests.push(await testHedgingPreservation());

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'information-preservation',
    suiteName: 'Information Preservation',
    pillar: 'lossless',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: localTimestamp(),
  };
}

export { run as runInformationPreservation };
