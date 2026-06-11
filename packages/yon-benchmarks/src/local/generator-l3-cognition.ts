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
 * Generator L3 Cognition Suite
 *
 * Pillar: Emitter Faithfulness
 * Validates: @younndai/yon-generator builder API produces valid YON for all
 * L3 Cognition records — reasoning, memory pipeline, perception, goals,
 * self-awareness, and affect.
 *
 * Tests:
 * 1. Reasoning chain: @THOUGHT → @HYPOTHESIS → @DECISION → @PRUNE
 * 2. Memory pipeline: @PULSE → @OBSERVATION → @IMPRINT → @MEMORY → @SHARD
 * 3. Perception & Goals: @PERCEPT, @FOCUS, @GOAL (incl. anonymous records)
 * 4. Self-Awareness: @REFLECTION, @INTROSPECT, @ESSENCE, @AFFECT, @LEARN, @MARK
 */

import { yon } from '@younndai/yon-generator';
import { parse, validate } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAndValidate(buildFn: () => string): { parseOk: boolean; validateOk: boolean; detail: string } {
  let parseOk = false;
  let validateOk = false;
  let detail = '';

  try {
    const text = buildFn();
    const parsed = parse(text);
    parseOk = true;

    const result = validate(parsed, { strict: false });
    validateOk = result.valid;
    if (!result.valid) {
      detail = `Validation errors: ${result.errors.map((e) => e.message).join('; ')}`;
    }
  } catch (err) {
    detail = `Parse error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return { parseOk, validateOk, detail };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testReasoningChain(): TestResult {
  const elapsed = startTimer();

  const { parseOk, validateOk, detail } = buildAndValidate(() =>
    yon('spec')
      .id('bench-l3-reasoning')
      .title('L3 Reasoning Chain')
      .profile('core')
      .thought({ rid: 't:1', type: 'analytical', content: 'Evaluating approach A vs B', merges: ['t:prev-1', 't:prev-2'], confidence: '0.8' })
      .hypothesis({ rid: 'h:1', claim: 'Approach A is 2x faster', confidence: '0.7', based_on: 't:1' })
      .hypothesis({ rid: 'h:2', claim: 'Approach B has better reliability', confidence: '0.6', based_on: 't:1' })
      .decision({ rid: 'd:1', selected: 'h:1', alternatives: ['h:2'], rationale: 'Speed is prioritized', trace: ['t:1', 'h:1', 'h:2'], confidence: '0.85' })
      .prune({ target: 'h:2', mode: 'soft', because: 'Superseded by decision d:1' })
      .toString(),
  );

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'l3-reasoning-chain',
    name: 'L3 Reasoning Chain',
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '@THOUGHT(merges[]) → @HYPOTHESIS × 2 → @DECISION(alternatives[], trace[]) → @PRUNE. Array fields validated.'
      : detail,
  };
}

function testMemoryPipeline(): TestResult {
  const elapsed = startTimer();

  const { parseOk, validateOk, detail } = buildAndValidate(() =>
    yon('spec')
      .id('bench-l3-memory')
      .title('L3 Memory Pipeline')
      .profile('core')
      .pulse({ rid: 'p:1', src: 'sensor:camera', content: 'Detected object at coordinates (42, 17)', type: 'visual', ts: '2026-03-01T03:00:00Z' })
      .observation({ rid: 'o:1', note: 'Object appears to be a structural anomaly', from: 'p:1' })
      .imprint({ rid: 'i:1', validates: 'o:1', trust: '0.9', confidence: '0.85', scope: 'local' })
      .memory({ rid: 'm:1', type: 'episodic', content: 'Structural anomaly detected at location 42,17', trust: '0.9', confidence: '0.85', scope: 'local', ttl: '30d' })
      .shard({ rid: 'sh:1', sources: ['m:1', 'o:1'], summary: 'Compressed: anomaly at 42,17', trust: '0.85', compression: '0.6' })
      .mark({ rid: 'mk:1', refs: ['m:1', 'sh:1'], title: 'Anomaly Evidence', tags: ['anomaly', 'structural', 'high-priority'] })
      .toString(),
  );

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'l3-memory-pipeline',
    name: 'L3 Memory Pipeline',
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '@PULSE → @OBSERVATION → @IMPRINT → @MEMORY → @SHARD(sources[]) → @MARK(refs[], tags[]). Full 5-stage pipeline validated.'
      : detail,
  };
}

function testPerceptionAndGoals(): TestResult {
  const elapsed = startTimer();

  const { parseOk, validateOk, detail } = buildAndValidate(() =>
    yon('spec')
      .id('bench-l3-perception')
      .title('L3 Perception & Goals')
      .profile('core')
      .percept({ rid: 'pc:1', type: 'visual', src: 'camera:front', confidence: '0.92', labels: ['object', 'anomaly', 'moving'] })
      .focus({ targets: ['pc:1', 'm:1'], reason: 'High-salience anomaly detected', salience: '0.95' })
      .goal({ rid: 'g:1', name: 'Investigate anomaly', parent: undefined, status: 'active', priority: 'high', deadline: '2026-03-02T00:00:00Z' })
      .goal({ rid: 'g:2', name: 'Classify object type', parent: 'g:1', status: 'pending', priority: 'medium' })
      .toString(),
  );

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'l3-perception-goals',
    name: 'L3 Perception & Goals',
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '@PERCEPT(labels[]) → @FOCUS(targets[], anonymous — no rid) → @GOAL with parent hierarchy. Anonymous records handled.'
      : detail,
  };
}

function testSelfAwareness(): TestResult {
  const elapsed = startTimer();

  const { parseOk, validateOk, detail } = buildAndValidate(() =>
    yon('spec')
      .id('bench-l3-self')
      .title('L3 Self-Awareness & Affect')
      .profile('core')
      .reflection({ rid: 'rf:1', revises: 'h:1', because: 'New evidence contradicts initial hypothesis', new_confidence: '0.3' })
      .introspect({ rid: 'in:1', query: 'What assumptions am I making?', scope: 'local', finding: 'Assuming sensor accuracy > 90%' })
      .essence({ rid: 'es:1', trait: 'cautious-reasoning', type: 'behavioral', weight: 7, affects: 'decision-making', source: 'training' })
      .affect({ urgency: '0.8', uncertainty: '0.4', engagement: '0.9', curiosity: '0.7', frustration: '0.1', satisfaction: '0.5', caution: '0.6' })
      .learn({ rid: 'lr:1', prior: '0.7', evidence: 'sensor-data-batch-42', posterior: '0.45' })
      .toString(),
  );

  const durationMs = elapsed();
  const passed = parseOk && validateOk;

  return {
    id: 'l3-self-awareness',
    name: 'L3 Self-Awareness & Affect',
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '@REFLECTION → @INTROSPECT → @ESSENCE(weight:int=7) → @AFFECT(anonymous) → @LEARN. Numeric suffix and anonymous record verified.'
      : detail,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testReasoningChain(),
    testMemoryPipeline(),
    testPerceptionAndGoals(),
    testSelfAwareness(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'generator-l3-cognition',
    suiteName: 'Generator L3 Cognition',
    pillar: 'emitter-faithfulness',
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

export { run as runGeneratorL3Cognition };
