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
 * Generator L4 Agent Suite
 *
 * Pillar: Emitter Faithfulness
 * Validates: @younndai/yon-generator builder API produces valid YON for all
 * L4 Agent records — lifecycle, comms, workspace, safety, reactive, temporal.
 *
 * Tests:
 * 1. Agent Lifecycle: @AGENT, @CAPS, @DEREGISTER
 * 2. Inter-Agent Comms: @SIGNAL, @THROTTLE, @SUBSCRIBE, @ROUTE, @MERGE, @STREAM
 * 3. Workspace & Composition: @WORKSPACE, @EDIT, @CALL
 * 4. Safety & Governance: @TENET, @ESCALATE, @HALT
 * 5. Reactive Execution: @ON, @EMIT, @LOOP
 * 6. Temporal Context: @TIMELINE, @EVENT
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

function makeResult(id: string, name: string, elapsed: () => number, result: ReturnType<typeof buildAndValidate>, successDetail: string): TestResult {
  const durationMs = elapsed();
  const passed = result.parseOk && result.validateOk;
  return {
    id,
    name,
    passed,
    metric: { name: 'valid', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'parse_ok', value: result.parseOk ? 1 : 0, unit: 'bool' },
      { name: 'validate_ok', value: result.validateOk ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed ? successDetail : result.detail,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testAgentLifecycle(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-lifecycle')
      .title('L4 Agent Lifecycle')
      .profile('core')
      .agent({ rid: 'a:analyst', name: 'DataAnalyst', type: 'specialist', model: 'claude-4', caps: ['data-query', 'chart-gen', 'export'], streams: ['s:metrics', 's:alerts'], version: '2.1' })
      .caps({ rid: 'cap:analyst', agent: 'a:analyst', ops: ['std:query.sql', 'std:chart.render', 'std:export.csv'] })
      .deregister({ agent: 'a:analyst', reason: 'Session ended' })
      .toString(),
  );
  return makeResult('l4-agent-lifecycle', 'L4 Agent Lifecycle', elapsed, result,
    '@AGENT(caps[], streams[]) → @CAPS(ops[]) → @DEREGISTER. Array fields validated.');
}

function testInterAgentComms(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-comms')
      .title('L4 Inter-Agent Communication')
      .profile('core')
      .signal({ from: 'a:analyst', type: 'ready', target: 'a:orchestrator', msg: 'Analysis pipeline ready', ts: '2026-03-01T03:00:00Z' })
      .throttle({ from: 'a:analyst', to: 'a:ingester', reason: 'Processing backlog', recommended_delay_ms: 5000, severity: 'warning' })
      .stream({ rid: 's:metrics', owner: 'a:analyst', type: 'timeseries', description: 'Real-time metric stream', ttl: '24h' })
      .subscribe({ agent: 'a:orchestrator', streams: ['s:metrics', 's:alerts'], topics: ['anomaly', 'threshold-breach'], filter: 'severity >= warning' })
      .route({ rid: 'r:fanout', group: 'analysts', strategy: 'round-robin' })
      .merge({ rid: 'mg:1', streams: ['s:metrics', 's:alerts'], strategy: 'interleave', conflict: 'latest-wins' })
      .toString(),
  );
  return makeResult('l4-inter-agent-comms', 'L4 Inter-Agent Comms', elapsed, result,
    '@SIGNAL → @THROTTLE(recommended_delay_ms:int) → @STREAM → @SUBSCRIBE(streams[], topics[]) → @ROUTE → @MERGE(streams[]). Numeric suffix and array fields verified.');
}

function testWorkspaceComposition(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-workspace')
      .title('L4 Workspace & Composition')
      .profile('core')
      .workspace({ rid: 'ws:main', agents: ['a:analyst', 'a:writer', 'a:reviewer'], artifact: 'doc:report' })
      .edit({ rid: 'ed:1', workspace: 'ws:main', by: 'a:analyst', patch: 'append: Section 3: Analysis Results' })
      .call({ rid: 'c:1', ref: 'workflow:text-generation', args: 'source=ed:1', out: 'blk:draft' })
      .toString(),
  );
  return makeResult('l4-workspace-composition', 'L4 Workspace & Composition', elapsed, result,
    '@WORKSPACE(agents[]) → @EDIT → @CALL. Collaboration records validated.');
}

function testSafetyGovernance(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-safety')
      .title('L4 Safety & Governance')
      .profile('core')
      .tenet({ rid: 'tn:no-pii', level: 'L0', content: 'Never emit personally identifiable information', precedence: '100' })
      .tenet({ rid: 'tn:cite-sources', level: 'L2', content: 'Always cite data sources in analysis', precedence: '50', decay: '0.1' })
      .escalate({ rid: 'esc:1', reason: 'Detected potential PII in dataset', severity: 'critical', harm_class: 'privacy', context: 'Dataset analysis phase' })
      .halt({ rid: 'halt:1', scope: 'workflow', reason: 'PII detection triggered safety stop' })
      .toString(),
  );
  return makeResult('l4-safety-governance', 'L4 Safety & Governance', elapsed, result,
    '@TENET(L0 + L2, precedence, decay) → @ESCALATE → @HALT. Governance chain validated.');
}

function testReactiveExecution(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-reactive')
      .title('L4 Reactive Execution')
      .profile('core')
      .on_({ rid: 'on:1', event: 'threshold-breach', do: 'std:alert.send', match: 'value > 95' })
      .emit_({ event: 'analysis-complete', payload: 'report:42' })
      .loop({ rid: 'lp:poll', while: 'signal:stop == false', do: 'std:sensor.read', max_iterations: 1000 })
      .toString(),
  );
  return makeResult('l4-reactive-execution', 'L4 Reactive Execution', elapsed, result,
    '@ON → @EMIT → @LOOP(interval_ms:int). Reactive event system validated.');
}

function testTemporalContext(): TestResult {
  const elapsed = startTimer();
  const result = buildAndValidate(() =>
    yon('config')
      .id('bench-l4-temporal')
      .title('L4 Temporal Context')
      .profile('core')
      .timeline({ rid: 'tl:investigation', span: '6h', start: '2026-03-01T00:00:00Z', granularity: '15m' })
      .event({ rid: 'ev:1', timeline: 'tl:investigation', at: '2026-03-01T01:30:00Z', activity: 'Anomaly first detected' })
      .event({ rid: 'ev:2', timeline: 'tl:investigation', at: '2026-03-01T03:00:00Z', activity: 'Root cause identified', duration: '45m' })
      .toString(),
  );
  return makeResult('l4-temporal-context', 'L4 Temporal Context', elapsed, result,
    '@TIMELINE → @EVENT × 2. Temporal tracking validated.');
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testAgentLifecycle(),
    testInterAgentComms(),
    testWorkspaceComposition(),
    testSafetyGovernance(),
    testReactiveExecution(),
    testTemporalContext(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'generator-l4-agent',
    suiteName: 'Generator L4 Agent',
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

export { run as runGeneratorL4Agent };
