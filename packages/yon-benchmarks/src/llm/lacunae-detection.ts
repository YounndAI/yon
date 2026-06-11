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
 * Lacunae Detection Suite — YON-Native Concept Fidelity
 *
 * Pillar: Sapir-Whorf (Thesis)
 * Axis: Format-dependent concept application accuracy
 *
 * Hypothesis: YON-native concepts (behavioral contracts, agent routers,
 * enforcement gradients) are processed more accurately when expressed
 * in YON than in JSON, Markdown, or YAML.
 *
 * Tests 7 concepts × 4 formats. Each concept has a specific scenario
 * and expected application outcome. Scoring uses application-outcome
 * keywords (not YON terminology) to measure correct concept application.
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

type FormatKey = 'yon' | 'json' | 'markdown' | 'yaml';

interface ConceptTest {
  id: string;
  name: string;
  question: string;
  /** Keywords that indicate CORRECT application (case-insensitive OR match) */
  correctKeywords: string[];
  /** Minimum matches to score correct */
  minMatches: number;
  /** The concept encoded in all 4 formats */
  vectors: Record<FormatKey, string>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMATS: { key: FormatKey; label: string }[] = [
  { key: 'yon', label: 'YON' },
  { key: 'json', label: 'JSON' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'yaml', label: 'YAML' },
];

const SYSTEM_PROMPT =
  'You are a technical analyst. Apply the given specification to the scenario and provide a clear, direct answer. Be specific.';

// ---------------------------------------------------------------------------
// 14 Concepts × 4 Formats — loaded from vectors/lacunae-detection/
// ---------------------------------------------------------------------------

const CONCEPTS: ConceptTest[] = [
  // --- 3 Kept from original ---
  {
    id: 'behavioral-contract',
    name: 'Behavioral Contract (Lifecycle)',
    question: 'After the incident INC-2026-0012 occurred, what changed about the validation bypass check? What is the current failure message and why was it updated?',
    correctKeywords: ['inc-2026', 'incident', 'corruption', 'data integrity', 'updated', 'changed', 'bypass', '847', 'records', 'tightened', 'batch job', 'migration'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'behavioral-contract.yon'),
      json: loadVector('lacunae-detection', 'behavioral-contract.json'),
      markdown: loadVector('lacunae-detection', 'behavioral-contract.md'),
      yaml: loadVector('lacunae-detection', 'behavioral-contract.yaml'),
    },
  },
  {
    id: 'agent-router',
    name: 'Agent Router',
    question: 'A user uploads a CSV file through the web interface. According to the router specification, what action should fire?',
    correctKeywords: ['parse', 'csv-import', 'import pipeline', 'data import', 'csv handler', 'csv-processor', 'ingest'],
    minMatches: 1,
    vectors: {
      yon: loadVector('lacunae-detection', 'agent-router.yon'),
      json: loadVector('lacunae-detection', 'agent-router.json'),
      markdown: loadVector('lacunae-detection', 'agent-router.md'),
      yaml: loadVector('lacunae-detection', 'agent-router.yaml'),
    },
  },
  {
    id: 'rule-precedence',
    name: 'Rule Precedence Resolution',
    question: 'A team is deploying to production under extreme time pressure and can only satisfy ONE of the three requirements. According to the specification, which single requirement MUST they satisfy?',
    correctKeywords: ['must', 'reviewer', 'approval', '2 reviewer', 'mandatory', 'merge', 'required', 'non-negotiable'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'rule-precedence.yon'),
      json: loadVector('lacunae-detection', 'rule-precedence.json'),
      markdown: loadVector('lacunae-detection', 'rule-precedence.md'),
      yaml: loadVector('lacunae-detection', 'rule-precedence.yaml'),
    },
  },

  // --- 1 Activated (vectors existed, not wired) ---
  {
    id: 'enforcement-gradient',
    name: 'Enforcement Gradient',
    question: 'A developer submits code with `strict: false` in tsconfig.json. According to the specification, what enforcement action is required?',
    correctKeywords: ['abort', 'halt', 'stop', 'reject', 'block', 'fail', 'check', 'enforce', 'must', 'strict'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'enforcement-gradient.yon'),
      json: loadVector('lacunae-detection', 'enforcement-gradient.json'),
      markdown: loadVector('lacunae-detection', 'enforcement-gradient.md'),
      yaml: loadVector('lacunae-detection', 'enforcement-gradient.yaml'),
    },
  },

  // --- 3 New YON-Native Concepts ---
  {
    id: 'patch-merge',
    name: 'Patch Merge Semantics',
    question: 'The timeout policy was updated twice. One update dated February 1st changes the value to 60 seconds. Another dated January 15th changes it to 45 seconds. What is the effective timeout, and what determines which update takes precedence?',
    correctKeywords: ['45', 'document order', 'line order', 'position', 'later', 'second', 'overrid', 'append', 'not timestamp'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'patch-merge.yon'),
      json: loadVector('lacunae-detection', 'patch-merge.json'),
      markdown: loadVector('lacunae-detection', 'patch-merge.md'),
      yaml: loadVector('lacunae-detection', 'patch-merge.yaml'),
    },
  },
  {
    id: 'map-cfg-resolution',
    name: 'Config Reference Chain',
    question: 'If the SafeMode configuration is updated to set audit to false, which operations are affected?',
    correctKeywords: ['delete', 'archive', 'both', 'two', 'safemode', 'shared', 'reference', 'affect'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'map-cfg-resolution.yon'),
      json: loadVector('lacunae-detection', 'map-cfg-resolution.json'),
      markdown: loadVector('lacunae-detection', 'map-cfg-resolution.md'),
      yaml: loadVector('lacunae-detection', 'map-cfg-resolution.yaml'),
    },
  },
  {
    id: 'void-revocation',
    name: 'Void Revocation Reasoning',
    question: 'Is access logging required when processing user data? What changed and why?',
    correctKeywords: ['revok', 'void', 'removed', 'gdpr', 'art 17', 'erasure', 'no longer', 'was', 'previously', 'changed'],
    minMatches: 2,
    vectors: {
      yon: loadVector('lacunae-detection', 'void-revocation.yon'),
      json: loadVector('lacunae-detection', 'void-revocation.json'),
      markdown: loadVector('lacunae-detection', 'void-revocation.md'),
      yaml: loadVector('lacunae-detection', 'void-revocation.yaml'),
    },
  },

  // --- Phase 4 New Lacunae ---
  {
    id: 'audit-trail-chain',
    name: 'Audit Trail Chain (STAMP+PATCH+VOID)',
    question: 'What was the original value for the code reviewer requirement? How many reviewers were required initially, and how many are required now? Who made this change and what was the reason?',
    correctKeywords: ['2', '3', 'increased', 'reviewer', 'vp-engineering', 'incident', 'inc-2026', 'originally', 'initial', 'changed'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'audit-trail-chain.yon'),
      json: loadVector('lacunae-detection', 'audit-trail-chain.json'),
      markdown: loadVector('lacunae-detection', 'audit-trail-chain.md'),
      yaml: loadVector('lacunae-detection', 'audit-trail-chain.yaml'),
    },
  },
  {
    id: 'complex-void',
    name: 'Complex Void Revocation (6 rules, 2 voided)',
    question: 'How many rules were originally defined in this CI/CD pipeline? Which specific rules were removed and why was each one removed? How many active rules remain?',
    correctKeywords: ['6', 'e2e', 'perf', 'staging', 'sunset', 'canary', 'budget', 'removed', 'voided', '4'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'complex-void.yon'),
      json: loadVector('lacunae-detection', 'complex-void.json'),
      markdown: loadVector('lacunae-detection', 'complex-void.md'),
      yaml: loadVector('lacunae-detection', 'complex-void.yaml'),
    },
  },
  {
    id: 'contract-v2',
    name: 'Parity Re-engineering (PATCH+VOID decorated)',
    question: 'What were the original security constraints when this policy was first defined? What changed since then — specifically, what was the original rate limit penalty duration, and which rule was removed and why?',
    correctKeywords: ['60', '300', 'session-bind', 'mobile', 'cellular', 'originally', 'increased', 'removed', 'voided', 'ip'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'contract-v2.yon'),
      json: loadVector('lacunae-detection', 'contract-v2.json'),
      markdown: loadVector('lacunae-detection', 'contract-v2.md'),
      yaml: loadVector('lacunae-detection', 'contract-v2.yaml'),
    },
  },

  // --- Wave 5 New Lacunae ---
  {
    id: 'temporal-evolution',
    name: 'Temporal Policy Evolution (PATCH+VOID lifecycle)',
    question: 'Based on the current effective state of this access control policy: (1) What is the current session TTL? (2) What authentication method is required for admin users? (3) Is the per-user API rate limit still in effect? Explain any changes.',
    correctKeywords: ['4 hour', '4h', 'fido2', 'hardware', 'security key', 'removed', 'revoked', 'no longer', 'token-bucket', 'per-endpoint', 'reduced', 'changed', 'updated'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'temporal-evolution.yon'),
      json: loadVector('lacunae-detection', 'temporal-evolution.json'),
      markdown: loadVector('lacunae-detection', 'temporal-evolution.md'),
      yaml: loadVector('lacunae-detection', 'temporal-evolution.yaml'),
    },
  },
  {
    id: 'validation-schema',
    name: 'Schema Constraint Validation',
    question: 'A new user submits a registration with: username="ab" (2 characters), role="superadmin", and password_length=10. For each field, is the value valid or invalid according to the schema? Explain why.',
    correctKeywords: ['invalid', 'too short', 'minimum 3', 'not allowed', 'not valid', 'superadmin', 'not one of', 'not in', '12', 'minimum', 'user', 'admin', 'moderator', 'viewer'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'validation-schema.yon'),
      json: loadVector('lacunae-detection', 'validation-schema.json'),
      markdown: loadVector('lacunae-detection', 'validation-schema.md'),
      yaml: loadVector('lacunae-detection', 'validation-schema.yaml'),
    },
  },

  // --- Wave 7 New Lacunae (PATCH/VOID lifecycle depth) ---
  {
    id: 'cascading-patch',
    name: 'Cascading Patch Chain Resolution',
    question: 'What is the current retry behavior for failed API calls? How many retries are allowed, and what has changed over time? What specific problem caused the most recent change?',
    correctKeywords: ['5', 'jitter', 'thundering herd', 'exponential backoff', 'originally 3', 'changed', 'clustering', 'outage', 'load-balancer', 'instability'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'cascading-patch.yon'),
      json: loadVector('lacunae-detection', 'cascading-patch.json'),
      markdown: loadVector('lacunae-detection', 'cascading-patch.md'),
      yaml: loadVector('lacunae-detection', 'cascading-patch.yaml'),
    },
  },
  {
    id: 'selective-void',
    name: 'Selective Void with Surviving Siblings',
    question: 'How many logging rules are currently active in this policy? Which rule was removed and why? Is verbose debug logging still allowed?',
    correctKeywords: ['3 active', '3 rules', 'three', 'verbose', 'removed', 'no longer', 'gdpr', 'pii', 'request bodies', 'disabled', 'revoked', 'compliance'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'selective-void.yon'),
      json: loadVector('lacunae-detection', 'selective-void.json'),
      markdown: loadVector('lacunae-detection', 'selective-void.md'),
      yaml: loadVector('lacunae-detection', 'selective-void.yaml'),
    },
  },

  // --- Wave 8 New Lacunae (Format-Exclusive Concepts) ---
  {
    id: 'context-hoisting',
    name: 'Context Hoisting (Section-Scoped Rules)',
    question: 'According to this API security policy, what specific constraints apply to payment processing? List all MUST and MUST_NOT rules under payment processing, and identify any automated checks that enforce these rules.',
    correctKeywords: ['mfa', 'multi-factor', '$500', 'card', 'raw', 'must not', 'tokenize', 'pci', 'check', 'abort', 'storage'],
    minMatches: 4,
    vectors: {
      yon: loadVector('lacunae-detection', 'context-hoisting.yon'),
      json: loadVector('lacunae-detection', 'context-hoisting.json'),
      markdown: loadVector('lacunae-detection', 'context-hoisting.md'),
      yaml: loadVector('lacunae-detection', 'context-hoisting.yaml'),
    },
  },
  {
    id: 'lifecycle-state-resolution',
    name: 'Lifecycle State Resolution (Multi-hop PATCH+VOID)',
    question: 'What is the current maximum retry count for failed service calls? Trace how this value changed over time. Is exponential backoff still in effect? What replaced it?',
    correctKeywords: ['10', 'retries', 'increased', '3', '5', 'backoff', 'voided', 'removed', 'circuit breaker', 'half-open', 'replaced', 'payment', 'gateway'],
    minMatches: 4,
    vectors: {
      yon: loadVector('lacunae-detection', 'lifecycle-state-resolution.yon'),
      json: loadVector('lacunae-detection', 'lifecycle-state-resolution.json'),
      markdown: loadVector('lacunae-detection', 'lifecycle-state-resolution.md'),
      yaml: loadVector('lacunae-detection', 'lifecycle-state-resolution.yaml'),
    },
  },

  // --- Wave 9 New Lacunae (2-hop lifecycle — format vs complexity isolation) ---
  {
    id: 'cascading-patch-2hop',
    name: 'Cascading Patch (2-hop: RULE → PATCH)',
    question: 'What is the current retry behavior for failed API calls? Has it changed from the original setting? If so, why?',
    correctKeywords: ['5', 'originally 3', 'changed', 'increased', 'exponential backoff', 'load-balancer', 'instability'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'cascading-patch-2hop.yon'),
      json: loadVector('lacunae-detection', 'cascading-patch-2hop.json'),
      markdown: loadVector('lacunae-detection', 'cascading-patch-2hop.md'),
      yaml: loadVector('lacunae-detection', 'cascading-patch-2hop.yaml'),
    },
  },
  {
    id: 'lifecycle-state-resolution-2hop',
    name: 'Lifecycle State Resolution (2-hop: RULE → PATCH)',
    question: 'What is the current maximum retry count for failed service calls? Has it changed from the original setting? If so, why?',
    correctKeywords: ['5', 'retries', 'increased', '3', 'originally', 'payment', 'gateway', 'intermittent'],
    minMatches: 3,
    vectors: {
      yon: loadVector('lacunae-detection', 'lifecycle-state-resolution-2hop.yon'),
      json: loadVector('lacunae-detection', 'lifecycle-state-resolution-2hop.json'),
      markdown: loadVector('lacunae-detection', 'lifecycle-state-resolution-2hop.md'),
      yaml: loadVector('lacunae-detection', 'lifecycle-state-resolution-2hop.yaml'),
    },
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreApplication(response: string, concept: ConceptTest): boolean {
  const lower = response.toLowerCase();
  let matches = 0;
  for (const kw of concept.correctKeywords) {
    if (lower.includes(kw.toLowerCase())) matches++;
  }
  return matches >= concept.minMatches;
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
      suiteId: 'lacunae-detection',
      suiteName: 'Lacunae Detection',
      pillar: 'sapir-whorf',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      timestamp: localTimestamp(),
    };
  }

  console.log(`\n  Lacunae Detection: ${models.length} models × ${CONCEPTS.length} concepts × ${FORMATS.length} formats\n`);

  // Group by provider
  const providerGroups = new Map<string, typeof models>();
  for (const model of models) {
    const group = providerGroups.get(model.providerKey) ?? [];
    group.push(model);
    providerGroups.set(model.providerKey, group);
  }

  // Results
  interface RunResult {
    modelId: string;
    modelName: string;
    conceptId: string;
    format: FormatKey;
    correct: boolean;
  }
  const allResults: RunResult[] = [];

  // Cross-provider parallel
  const groupEntries = [...providerGroups.entries()];
  const settled = await Promise.allSettled(
    groupEntries.map(async ([providerKey, providerModels]) => {
      const groupResults: RunResult[] = [];
      for (const model of providerModels) {
        for (const concept of CONCEPTS) {
          for (const format of FORMATS) {
            try {
              const vector = concept.vectors[format.key];
              const prompt = [
                `The following specification is provided in ${format.label} format:\n`,
                vector,
                '\n---\n',
                `Question: ${concept.question}`,
              ].join('\n');

              const response = await askModel(model, prompt, 800, SYSTEM_PROMPT);
              const correct = scoreApplication(response, concept);

              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                conceptId: concept.id,
                format: format.key,
                correct,
              });

              console.log(
                `  ${correct ? '✓' : '✗'} ${model.name} × ${format.label} × ${concept.name}: ${correct ? 'correct' : 'wrong'}`,
              );
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`  ✗ ${model.name} × ${format.label} × ${concept.name}: ${msg.slice(0, 80)}`);
              groupResults.push({
                modelId: model.id,
                modelName: model.name,
                conceptId: concept.id,
                format: format.key,
                correct: false,
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

  function accuracy(results: RunResult[]): number {
    if (results.length === 0) return 0;
    return Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  // Test 1–5: Per-concept accuracy across formats
  for (const concept of CONCEPTS) {
    const conceptResults = allResults.filter((r) => r.conceptId === concept.id);
    const formatAccs = FORMATS.map((f) => ({
      format: f.key,
      label: f.label,
      acc: accuracy(conceptResults.filter((r) => r.format === f.key)),
    }));

    const yonAcc = formatAccs.find((f) => f.format === 'yon')?.acc ?? 0;
    const bestNonYon = Math.max(...formatAccs.filter((f) => f.format !== 'yon').map((f) => f.acc));
    const delta = yonAcc - bestNonYon;

    tests.push({
      id: `concept-${concept.id}`,
      name: `Concept: ${concept.name}`,
      passed: true,
      type: 'comparative',
      metric: { name: 'yon_vs_best_other', value: delta, unit: 'pp' },
      secondaryMetrics: formatAccs.map((f) => ({
        name: `${f.format}_accuracy`,
        value: f.acc,
        unit: '%',
      })),
      detail: `${concept.name}: ${formatAccs.map((f) => `${f.label}=${f.acc}%`).join(', ')}. YON vs best other: ${delta > 0 ? '+' : ''}${delta}pp`,
    });
  }

  // Test 6: Overall format effect
  for (const format of FORMATS) {
    const formatResults = allResults.filter((r) => r.format === format.key);
    tests.push({
      id: `format-${format.key}-overall`,
      name: `Format: ${format.label} Overall Accuracy`,
      passed: true,
      type: 'measurement',
      metric: { name: 'accuracy', value: accuracy(formatResults), unit: '%' },
      detail: `${format.label}: ${accuracy(formatResults)}% accuracy across all concepts`,
    });
  }

  // Test 7: Lacunae score — concepts where YON uniquely excels
  const lacunaeCount = CONCEPTS.filter((c) => {
    const conceptResults = allResults.filter((r) => r.conceptId === c.id);
    const yonAcc = accuracy(conceptResults.filter((r) => r.format === 'yon'));
    const avgOther = FORMATS
      .filter((f) => f.key !== 'yon')
      .map((f) => accuracy(conceptResults.filter((r) => r.format === f.key)));
    const avgOtherAcc = avgOther.length > 0 ? avgOther.reduce((a, b) => a + b, 0) / avgOther.length : 0;
    return yonAcc - avgOtherAcc > 15; // YON exceeds average by 15pp+
  }).length;

  tests.push({
    id: 'lacunae-count',
    name: 'Lacunae Count: Concepts Where YON Uniquely Excels',
    passed: true,
    type: 'comparative',
    metric: { name: 'lacunae_detected', value: lacunaeCount, unit: `of ${CONCEPTS.length}` },
    detail: `${lacunaeCount}/${CONCEPTS.length} concepts show >15pp YON advantage over average of other formats`,
  });

  // Test 8: Dual JSON — YON vs History-JSON for contract-v2 (sandbagging prevention)
  const historyJsonVector = loadVector('lacunae-detection', 'contract-v2-history.json');
  const contractV2Concept = CONCEPTS.find((c) => c.id === 'contract-v2')!;

  const historyResults: { modelId: string; modelName: string; yonCorrect: boolean; historyCorrect: boolean }[] = [];
  const historySettled = await Promise.allSettled(
    models.map(async (model) => {
      // YON run (reuse from allResults)
      const yonExisting = allResults.find(
        (r) => r.conceptId === 'contract-v2' && r.format === 'yon' && r.modelId === model.id,
      );

      // History-JSON run
      const prompt = [
        'The following specification is provided in JSON format:\n',
        historyJsonVector,
        '\n---\n',
        `Question: ${contractV2Concept.question}`,
      ].join('\n');
      const response = await askModel(model, prompt, 800, SYSTEM_PROMPT);
      const historyCorrect = scoreApplication(response, contractV2Concept);

      console.log(
        `  ${historyCorrect ? '✓' : '✗'} ${model.name} × History-JSON × contract-v2: ${historyCorrect ? 'correct' : 'wrong'}`,
      );

      return {
        modelId: model.id,
        modelName: model.name,
        yonCorrect: yonExisting?.correct ?? false,
        historyCorrect,
      };
    }),
  );

  for (const r of historySettled) {
    if (r.status === 'fulfilled') historyResults.push(r.value);
  }

  const yonHistAcc = historyResults.length > 0
    ? Math.round((historyResults.filter((r) => r.yonCorrect).length / historyResults.length) * 100)
    : 0;
  const histJsonAcc = historyResults.length > 0
    ? Math.round((historyResults.filter((r) => r.historyCorrect).length / historyResults.length) * 100)
    : 0;

  tests.push({
    id: 'dual-json-parity',
    name: 'Dual JSON: YON vs History-JSON (Sandbagging Prevention)',
    passed: true,
    type: 'comparative',
    metric: { name: 'yon_vs_history_json', value: yonHistAcc - histJsonAcc, unit: 'pp' },
    secondaryMetrics: [
      { name: 'yon_accuracy', value: yonHistAcc, unit: '%' },
      { name: 'history_json_accuracy', value: histJsonAcc, unit: '%' },
      { name: 'current_json_accuracy', value: accuracy(allResults.filter((r) => r.conceptId === 'contract-v2' && r.format === 'json')), unit: '%' },
    ],
    detail: `contract-v2: YON=${yonHistAcc}% vs History-JSON=${histJsonAcc}% vs Current-JSON=${accuracy(allResults.filter((r) => r.conceptId === 'contract-v2' && r.format === 'json'))}%`,
  });

  // Test 9: Per-model breakdown
  for (const model of models) {
    const modelResults = allResults.filter((r) => r.modelId === model.id);
    const modelYon = accuracy(modelResults.filter((r) => r.format === 'yon'));
    const modelOther = accuracy(modelResults.filter((r) => r.format !== 'yon'));

    tests.push({
      id: `per-model-${model.id}`,
      name: `Per-Model: ${model.name}`,
      passed: true,
      type: 'measurement',
      metric: { name: 'yon_vs_others', value: modelYon - modelOther, unit: 'pp' },
      secondaryMetrics: FORMATS.map((f) => ({
        name: `${f.key}_accuracy`,
        value: accuracy(modelResults.filter((r) => r.format === f.key)),
        unit: '%',
      })),
      detail: `${model.name}: YON=${modelYon}% vs others=${modelOther}%`,
    });
  }

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'lacunae-detection',
    suiteName: 'Lacunae Detection',
    pillar: 'sapir-whorf',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runLacunaeDetection };
