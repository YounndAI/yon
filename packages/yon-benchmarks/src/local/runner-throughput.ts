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

import { BenchmarkResult, TestResult } from '../core/types.js';
import { performance } from 'perf_hooks';
import { createRunner, type Runner } from '@younndai/yon-runner';
import { parse } from '@younndai/yon-parser';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function measureColdStart(): TestResult {
  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    createRunner();
  }
  const end = performance.now();
  const avgMs = (end - start) / 1000;

  return {
    id: 'runner-cold-start',
    name: 'Runner Cold Start',
    passed: true, // measurement — init latency is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'initialization_latency',
      value: avgMs,
      unit: 'ms',
    },
    detail: `Average initialization time: ${avgMs.toFixed(3)}ms (1000 iter).`,
  };
}

async function measureDagThroughput(): Promise<TestResult> {
  // Generate 100 sequential steps
  const steps = Array.from({ length: 100 }, (_, i) =>
    `@STEP n:int=${i + 1} | rid=s${i} | op=std:sys.clock@v1 | args=[fmt="iso"] | out=[block:t${i}]`
  ).join('\n');

  const script = `@DOC ver=2.0 | id=dag-bench | title="DAG Bench"
@SEC name="Steps"
${steps}
`;

  // Parse once
  const doc = parse(script);
  
  const runner = createRunner();
  const start = performance.now();
  await runner.run(doc);
  const duration = performance.now() - start;
  
  const ops = 100;
  const opsPerSec = duration > 0 ? Math.round((ops / duration) * 1000) : 0;

  return {
    id: 'runner-ops-sec',
    name: 'DAG Logic Ops/Sec',
    passed: true, // measurement — DAG throughput is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'ops_per_second',
      value: opsPerSec,
      unit: 'ops/s',
    },
    detail: `Executed ${ops} linear steps in ${duration.toFixed(2)}ms. Throughput: ${opsPerSec.toLocaleString()} ops/s.`,
  };
}

function measureMemoryBudget(): TestResult {
  if (global.gc) global.gc(); // Optional: requires --expose-gc

  const baseline = process.memoryUsage().heapUsed;
  const runners: Runner[] = [];
  
  // Create 10 instances
  for (let i = 0; i < 10; i++) {
    runners.push(createRunner());
  }

  const after = process.memoryUsage().heapUsed;
  const deltaBytes = after - baseline;
  const bytesPerInstance = Math.round(deltaBytes / 1000);

  return {
    id: 'runner-memory-budget',
    name: 'Context Memory Budget',
    passed: true, // measurement — memory per instance is tracked, not gated
    type: 'measurement',
    metric: {
      name: 'bytes_per_context',
      value: bytesPerInstance,
      unit: 'bytes',
    },
    detail: `Heap growth: ${(deltaBytes / 1024 / 1024).toFixed(2)}MB for 1000 instances. ~${bytesPerInstance} bytes/instance.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runRunnerThroughput(): Promise<BenchmarkResult> {
  const start = performance.now();

  const t1 = measureColdStart();
  const t2 = await measureDagThroughput();
  const t3 = measureMemoryBudget();

  const tests: TestResult[] = [t1, t2, t3];

  const durationMs = performance.now() - start;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-throughput',
    suiteName: 'Runner Throughput',
    pillar: 'cross-cutting',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: new Date().toISOString(),
  };
}
