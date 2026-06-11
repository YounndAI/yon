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
 * Integrity Verification Benchmark Suite
 *
 * Pillar: Lossless
 * Validates: SHA-256 integrity verification for YON blocks.
 *
 * Tests:
 * 1. Block integrity pass (correct hash)
 * 2. Block integrity fail (tampered content)
 * 3. No hash → null (graceful skip)
 * 4. Document-level integrity (multi-block)
 */

import { verifyBlockIntegrity, verifyDocumentIntegrity } from '@younndai/yon-parser';
import type { YonBlock, YonDocument } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helper: compute SHA-256 for test data
// ---------------------------------------------------------------------------

async function sha256(content: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const data = new TextEncoder().encode(content);
    const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testBlockIntegrityPass(): Promise<TestResult> {
  const elapsed = startTimer();

  const content = '{"key": "value", "count": 42}';
  const hash = await sha256(content);

  const block: YonBlock = {
    id: 'blk:valid',
    mime: 'application/json',
    content,
    sha256: hash,
    startLine: 1,
    endLine: 3,
  };

  const result = await verifyBlockIntegrity(block);

  const durationMs = elapsed();
  const passed = result === true;

  return {
    id: 'integrity-block-pass',
    name: 'Block Integrity Pass',
    passed,
    metric: { name: 'integrity_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'result', value: result === true ? 1 : result === false ? 0 : -1, unit: 'state' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Valid SHA-256 hash → verifyBlockIntegrity() returns true. Integrity verified.'
      : `Expected true, got ${result}`,
  };
}

async function testBlockIntegrityFail(): Promise<TestResult> {
  const elapsed = startTimer();

  const block: YonBlock = {
    id: 'blk:tampered',
    mime: 'text/plain',
    content: 'This content was tampered with',
    sha256: 'aaaa' + 'bbbb'.repeat(15), // Fake hash
    startLine: 1,
    endLine: 1,
  };

  const result = await verifyBlockIntegrity(block);

  const durationMs = elapsed();
  const passed = result === false;

  return {
    id: 'integrity-block-fail',
    name: 'Block Integrity Fail',
    passed,
    metric: { name: 'tamper_detected', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'result', value: result === false ? 1 : 0, unit: 'state' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Tampered content with wrong hash → returns false. Tamper detection verified.'
      : `Expected false, got ${result}`,
  };
}

async function testNoHashNull(): Promise<TestResult> {
  const elapsed = startTimer();

  const block: YonBlock = {
    id: 'blk:nohash',
    mime: 'text/plain',
    content: 'No hash declared for this block',
    startLine: 1,
    endLine: 1,
  };

  const result = await verifyBlockIntegrity(block);

  const durationMs = elapsed();
  const passed = result === null;

  return {
    id: 'integrity-no-hash',
    name: 'No Hash → null',
    passed,
    metric: { name: 'skip_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'result_null', value: result === null ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? 'Block without sha256 field → returns null (graceful skip). No false positives.'
      : `Expected null, got ${result}`,
  };
}

async function testDocumentIntegrity(): Promise<TestResult> {
  const elapsed = startTimer();

  const validContent = 'Valid block content here';
  const validHash = await sha256(validContent);

  const doc: YonDocument = {
    version: '2.0',
    kind: 'doc',
    id: 'integrity-test',
    title: 'Integrity Test',
    records: [],
    blocks: new Map([
      ['blk:valid', {
        id: 'blk:valid',
        mime: 'text/plain',
        content: validContent,
        sha256: validHash,
        startLine: 1,
        endLine: 1,
      }],
      ['blk:nohash', {
        id: 'blk:nohash',
        mime: 'text/plain',
        content: 'No hash here',
        startLine: 2,
        endLine: 2,
      }],
      ['blk:tampered', {
        id: 'blk:tampered',
        mime: 'text/plain',
        content: 'Tampered',
        sha256: 'deadbeef'.repeat(8),
        startLine: 3,
        endLine: 3,
      }],
    ]),
    nodes: [],
  };

  const results = await verifyDocumentIntegrity(doc);

  const durationMs = elapsed();
  const totalChecked = results.size;
  const validPass = results.get('blk:valid') === true;
  const tamperedFail = results.get('blk:tampered') === false;
  const noHashSkipped = !results.has('blk:nohash');
  const passed = totalChecked === 2 && validPass && tamperedFail && noHashSkipped;

  return {
    id: 'integrity-document',
    name: 'Document Integrity',
    passed,
    metric: { name: 'document_ok', value: passed ? 1 : 0, unit: 'bool' },
    secondaryMetrics: [
      { name: 'checked_count', value: totalChecked, unit: 'blocks' },
      { name: 'valid_pass', value: validPass ? 1 : 0, unit: 'bool' },
      { name: 'tampered_fail', value: tamperedFail ? 1 : 0, unit: 'bool' },
      { name: 'nohash_skipped', value: noHashSkipped ? 1 : 0, unit: 'bool' },
      { name: 'duration', value: Math.round(durationMs * 100) / 100, unit: 'ms' },
    ],
    detail: passed
      ? '3 blocks: valid (true), tampered (false), no-hash (skipped). Document integrity verified.'
      : `Checked: ${totalChecked}, Valid: ${validPass}, Tampered: ${tamperedFail}, Skipped: ${noHashSkipped}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    await testBlockIntegrityPass(),
    await testBlockIntegrityFail(),
    await testNoHashNull(),
    await testDocumentIntegrity(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'integrity-verification',
    suiteName: 'Integrity Verification',
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

export { run as runIntegrityVerification };
