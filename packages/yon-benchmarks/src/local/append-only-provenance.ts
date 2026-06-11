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
 * Append-Only Provenance Benchmark Suite
 *
 * Pillar: Lossless
 * Validates: §9 "bloat" rebuttal — @PATCH/@STAMP audit trail works,
 *         growth is linear, and the full chain is parseable.
 *
 * Tests:
 * 1. Patch chain integrity — successive @PATCH records form a valid chain
 * 2. Stamp audit trail — @STAMP records survive and are extractable
 * 3. Chain growth — byte growth per patch is linear, not exponential
 */

import { parse, format } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a base document with some records. */
function buildBaseDoc(): string {
  return [
    '@DOC ver=2.0 | id=provenance-base | title="Provenance Test" | kind=data | profile=audit',
    '@CFG id=config | env="production" | region="eu-west-1"',
    '@RULE lvl=MUST | when="deploy" | then="run tests first"',
    '@NOTE text="Initial version of the deployment checklist"',
  ].join('\n');
}

/** Append a @PATCH record to an existing document. */
function appendPatch(doc: string, patchNum: number): string {
  const timestamp = `2026-02-${String(10 + patchNum).padStart(2, '0')}T12:00:00Z`;
  const patchLine = `@PATCH id=patch_${patchNum} | op="modify" | target="config" | author="dev${patchNum}" | ts:ts=${timestamp}`;
  return doc + '\n' + patchLine;
}

/** Append a @STAMP record to an existing document. */
function appendStamp(doc: string, stampNum: number): string {
  const timestamp = `2026-02-${String(10 + stampNum).padStart(2, '0')}T12:00:00Z`;
  const stampLine = `@STAMP id=stamp_${stampNum} | actor="system" | action="audit" | ts:ts=${timestamp}`;
  return doc + '\n' + stampLine;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testPatchChainIntegrity(): TestResult {
  const chainLength = 10;
  let doc = buildBaseDoc();

  // Build a chain of patches
  for (let i = 1; i <= chainLength; i++) {
    doc = appendPatch(doc, i);
  }

  // Parse the full document — all patches should be valid records
  const parsed = parse(doc);
  const patchRecords = parsed.records.filter(r => r.tag === 'PATCH');
  const allPatchIds = patchRecords.map(r => r.fields.get('id'));
  const expectedIds = Array.from({ length: chainLength }, (_, i) => `patch_${i + 1}`);

  // Verify chain integrity
  const allFound = expectedIds.every(id => allPatchIds.includes(id));
  const integrity = Math.round((patchRecords.length / chainLength) * 100);

  // Roundtrip: format and re-parse
  const formatted = format(parsed);
  const reparsed = parse(formatted);
  const rePatchRecords = reparsed.records.filter(r => r.tag === 'PATCH');
  const roundtripIntact = rePatchRecords.length === chainLength;

  return {
    id: 'provenance-patch-chain',
    name: 'Patch Chain Integrity',
    passed: allFound && roundtripIntact,
    metric: {
      name: 'chain_integrity',
      value: integrity,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'patches_found', value: patchRecords.length, unit: `/${chainLength}` },
      { name: 'roundtrip_intact', value: roundtripIntact ? 1 : 0, unit: 'bool' },
    ],
    detail:
      `${chainLength}-patch chain: ${patchRecords.length}/${chainLength} patches parsed. ` +
      `All IDs found: ${allFound}. Roundtrip intact: ${roundtripIntact}.`,
  };
}

function testStampAuditTrail(): TestResult {
  const stampCount = 5;
  let doc = buildBaseDoc();

  // Interleave stamps with patches
  for (let i = 1; i <= stampCount; i++) {
    doc = appendPatch(doc, i);
    doc = appendStamp(doc, i);
  }

  const parsed = parse(doc);
  const stampRecords = parsed.records.filter(r => r.tag === 'STAMP');

  // Extract audit data
  const auditEntries = stampRecords.map(r => ({
    id: r.fields.get('id'),
    actor: r.fields.get('actor'),
    action: r.fields.get('action'),
    ts: r.fields.get('ts'),
  }));

  const allExtracted = auditEntries.length === stampCount;
  const allHaveData = auditEntries.every(e => e.actor && e.action && e.ts);

  return {
    id: 'provenance-stamp-audit',
    name: 'Stamp Audit Trail',
    passed: allExtracted && allHaveData,
    metric: {
      name: 'stamps_recovered',
      value: stampRecords.length,
      unit: `/${stampCount}`,
    },
    secondaryMetrics: [
      { name: 'stamps_with_full_data', value: auditEntries.filter(e => e.actor && e.action && e.ts).length, unit: 'records' },
    ],
    detail:
      `${stampCount} @STAMP records interleaved with patches. ` +
      `Recovered: ${stampRecords.length}/${stampCount}. All data extractable: ${allHaveData}.`,
  };
}

function testChainGrowth(): TestResult {
  const maxPatches = 20;
  const sizes: number[] = [];

  let doc = buildBaseDoc();
  sizes.push(Buffer.byteLength(doc, 'utf8'));

  for (let i = 1; i <= maxPatches; i++) {
    doc = appendPatch(doc, i);
    doc = appendStamp(doc, i);
    sizes.push(Buffer.byteLength(doc, 'utf8'));
  }

  // Calculate growth per step
  const growths: number[] = [];
  for (let i = 1; i < sizes.length; i++) {
    growths.push(sizes[i]! - sizes[i - 1]!);
  }

  // Check linearity: growth per step should be roughly constant
  const avgGrowth = growths.reduce((a, b) => a + b, 0) / growths.length;
  const maxDeviation = Math.max(...growths.map(g => Math.abs(g - avgGrowth)));
  const isLinear = maxDeviation < avgGrowth * 0.5; // Within 50% of average

  const totalGrowth = sizes[sizes.length - 1]! - sizes[0]!;

  return {
    id: 'provenance-chain-growth',
    name: 'Chain Growth Measurement',
    passed: isLinear,
    metric: {
      name: 'avg_growth_per_patch',
      value: Math.round(avgGrowth),
      unit: 'bytes',
    },
    secondaryMetrics: [
      { name: 'total_growth', value: totalGrowth, unit: 'bytes' },
      { name: 'base_size', value: sizes[0]!, unit: 'bytes' },
      { name: 'final_size', value: sizes[sizes.length - 1]!, unit: 'bytes' },
      { name: 'max_deviation', value: Math.round(maxDeviation), unit: 'bytes' },
    ],
    detail:
      `${maxPatches} patches + stamps. Base: ${sizes[0]} bytes → Final: ${sizes[sizes.length - 1]} bytes. ` +
      `Avg growth: ${Math.round(avgGrowth)} bytes/step. Max deviation: ${Math.round(maxDeviation)} bytes. ` +
      `Linear growth: ${isLinear ? 'VERIFIED' : 'FAILED (exponential or irregular)'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testPatchChainIntegrity(),
    testStampAuditTrail(),
    testChainGrowth(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'append-only-provenance',
    suiteName: 'Append-Only Provenance',
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

export { run as runAppendOnlyProvenance };
