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
 * Runner Sessions Benchmark Suite
 *
 * Pillar: Cross-Cutting
 * Validates: SessionManager API — create, checkpoint, recover, TTL expiry.
 *
 * Tests:
 * 1. Session create + isActive
 * 2. Checkpoint + recover roundtrip
 * 3. TTL expiry rejects operations
 * 4. Selective includes in checkpoint
 */

import { SessionManager, InMemoryBlockRegistry } from '@younndai/yon-runner';
import type { CheckpointConfig, RecoverConfig } from '@younndai/yon-runner';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testSessionCreateActive(): TestResult {
  const elapsed = startTimer();

  const mgr = new SessionManager();
  const before = mgr.isActive();

  mgr.create({ rid: 'ses:1', durability: 'ephemeral', ttl: 0 });
  const after = mgr.isActive();
  const config = mgr.getConfig();

  const durationMs = elapsed();
  const passed = !before && after && config?.rid === 'ses:1';

  return {
    id: 'session-create-active',
    name: 'Session Create + isActive',
    passed,
    metric: { name: 'session_active', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'before_active', value: before ? 1 : 0, unit: 'bool' },
      { name: 'after_active', value: after ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'SessionManager inactive before create(), active after. Config verified.'
      : `Before: ${before}, After: ${after}, Config: ${config?.rid}`,
  };
}

function testCheckpointRecover(): TestResult {
  const elapsed = startTimer();

  const mgr = new SessionManager();
  mgr.create({ rid: 'ses:2', durability: 'ephemeral', ttl: 0 });

  const blocks = new InMemoryBlockRegistry();
  blocks.set('blk:config', { key: 'value' });
  blocks.set('blk:state', { count: 42 });

  const stepResults = [{ rid: 'step:1', op: 'test', success: true, durationMs: 1 }];

  mgr.checkpoint(
    { rid: 'cp:1', label: 'after-init' } as CheckpointConfig,
    blocks as any,
    stepResults as any,
  );

  const labels = mgr.getCheckpointLabels();
  const recovered = mgr.recover({ rid: 'rec:1', from: 'after-init' } as RecoverConfig);

  const durationMs = elapsed();
  const hasLabel = labels.includes('after-init');
  const recoveredOk = recovered !== null && recovered.label === 'after-init';
  const blocksSnapshottedOk = recovered?.blocks.size === 2;
  const passed = hasLabel && recoveredOk && blocksSnapshottedOk;

  return {
    id: 'session-checkpoint-recover',
    name: 'Checkpoint + Recover',
    passed,
    metric: { name: 'roundtrip_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'has_label', value: hasLabel ? 1 : 0, unit: 'bool' },
      { name: 'recovered', value: recoveredOk ? 1 : 0, unit: 'bool' },
      { name: 'blocks_count', value: recovered?.blocks.size ?? 0, unit: 'blocks' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'checkpoint("after-init") → recover("after-init"). 2 blocks snaphotted. Roundtrip verified.'
      : `Label: ${hasLabel}, Recovered: ${recoveredOk}, Blocks: ${recovered?.blocks.size}`,
  };
}

function testTTLExpiry(): TestResult {
  const elapsed = startTimer();

  const mgr = new SessionManager();
  // Create session with 1ms TTL — will expire instantly
  mgr.create({ rid: 'ses:3', durability: 'ephemeral', ttl: 1 });

  // Wait for TTL to expire (synchronous busy-wait for 5ms)
  const start = Date.now();
  while (Date.now() - start < 5) { /* spin */ }

  const isActive = mgr.isActive();
  const recovered = mgr.recover({ rid: 'rec:1', from: 'nonexistent' } as RecoverConfig);

  const durationMs = elapsed();
  const passed = !isActive && recovered === null;

  return {
    id: 'session-ttl-expiry',
    name: 'TTL Expiry Rejects',
    passed,
    metric: { name: 'expired_rejected', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'is_active', value: isActive ? 1 : 0, unit: 'bool' },
      { name: 'recover_null', value: recovered === null ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Session with TTL=1ms expires. isActive()=false, recover()=null. Safety verified.'
      : `isActive: ${isActive}, recover: ${recovered}`,
  };
}

function testSelectiveIncludes(): TestResult {
  const elapsed = startTimer();

  const mgr = new SessionManager();
  mgr.create({ rid: 'ses:4', durability: 'ephemeral', ttl: 0 });

  const blocks = new InMemoryBlockRegistry();
  blocks.set('blk:config', { key: 'value' });
  blocks.set('blk:state', { count: 42 });
  blocks.set('blk:temp', { scratch: true });

  mgr.checkpoint(
    { rid: 'cp:2', label: 'selective', includes: ['blk:config', 'blk:state'] } as CheckpointConfig,
    blocks as any,
    [],
  );

  const recovered = mgr.recover({ rid: 'rec:2', from: 'selective' } as RecoverConfig);

  const durationMs = elapsed();
  const snapshotSize = recovered?.blocks.size ?? 0;
  const hasConfig = recovered?.blocks.has('blk:config') ?? false;
  const hasState = recovered?.blocks.has('blk:state') ?? false;
  const hasNoTemp = !(recovered?.blocks.has('blk:temp') ?? false);
  const passed = snapshotSize === 2 && hasConfig && hasState && hasNoTemp;

  return {
    id: 'session-selective-includes',
    name: 'Selective Includes',
    passed,
    metric: { name: 'selective_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'snapshot_size', value: snapshotSize, unit: 'blocks' },
      { name: 'has_config', value: hasConfig ? 1 : 0, unit: 'bool' },
      { name: 'has_temp', value: hasNoTemp ? 0 : 1, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'includes=["blk:config","blk:state"] → 2 blocks (blk:temp excluded). Selective checkpoint verified.'
      : `Size: ${snapshotSize}, config: ${hasConfig}, state: ${hasState}, temp excluded: ${hasNoTemp}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testSessionCreateActive(),
    testCheckpointRecover(),
    testTTLExpiry(),
    testSelectiveIncludes(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'runner-sessions',
    suiteName: 'Runner Sessions',
    pillar: 'cross-cutting',
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

export { run as runRunnerSessions };
