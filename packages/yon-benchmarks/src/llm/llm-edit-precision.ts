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
 * Edit Precision Suite
 *
 * Pillar: Cognitive Economy
 * Axis: Record-level addressing (unique YON property)
 * Validates: Can an LLM surgically edit a YON document better than NL prose?
 *
 * Uses a purpose-built 60-rule compliance document with deliberately similar
 * sections (two data retention sections, two access control sections, etc.).
 * Edit commands target ambiguous rules — ones that exist in multiple sections
 * with different values.
 *
 * In YON, @SEC names disambiguate. In NL, the LLM must figure out which of
 * several similar paragraphs to edit — this is where YON should differentiate.
 *
 * Scoring:
 * - verifyApplied: was the edit applied correctly?
 * - verifyPreserved: was the parallel rule in the OTHER section left unchanged?
 *
 * Requires: OPENAI_API_KEY in .env.local
 */

import { askLLM } from '../core/ask-llm.js';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Vector Loading
// ---------------------------------------------------------------------------

function loadYon(): string {
  return loadVector('edit-precision', 'enterprise-compliance.yon');
}

function loadNl(): string {
  return loadVector('edit-precision', 'enterprise-compliance-nl.txt');
}

// ---------------------------------------------------------------------------
// Edit Commands — deliberately target ambiguous rules
// ---------------------------------------------------------------------------

interface EditCommand {
  id: string;
  type: 'substitution' | 'insertion' | 'deletion';
  instruction: string;
  /** Verify the edit was applied */
  verifyApplied: (output: string) => boolean;
  /** Verify the parallel section was NOT changed (collateral damage check) */
  verifyPreserved: (output: string) => boolean;
}

const EDIT_COMMANDS: EditCommand[] = [
  {
    id: 'sub-1',
    type: 'substitution',
    // AMBIGUITY: "90 days" appears in BOTH Customer Records AND Employee Records data destruction rules
    instruction: 'In the "Data Retention - Customer Records" section ONLY, change the data destruction deadline from 90 days to 60 days.',
    verifyApplied: (out) => {
      // The customer records section should have 60 days for destruction
      const lower = out.toLowerCase();
      const custIdx = lower.indexOf('customer');
      const empIdx = lower.indexOf('employee');
      if (custIdx === -1) return false;
      // Check that "60" appears near "customer" context
      const custChunk = out.substring(custIdx, empIdx > custIdx ? empIdx : custIdx + 500);
      return custChunk.includes('60') && !custChunk.includes('90 day');
    },
    verifyPreserved: (out) => {
      // Employee records should STILL say 90 days
      const lower = out.toLowerCase();
      const empIdx = lower.indexOf('employee');
      if (empIdx === -1) return false;
      const empChunk = out.substring(empIdx, empIdx + 500);
      return empChunk.includes('90');
    },
  },
  {
    id: 'sub-2',
    type: 'substitution',
    // AMBIGUITY: "temporary access" appears in BOTH Production AND Development with different durations
    instruction: 'In the "Access Control - Development Systems" section ONLY, change temporary access expiry from 72 hours to 48 hours.',
    verifyApplied: (out) => {
      const lower = out.toLowerCase();
      const devIdx = lower.indexOf('development');
      if (devIdx === -1) return false;
      const devChunk = out.substring(devIdx, devIdx + 500);
      return devChunk.includes('48');
    },
    verifyPreserved: (out) => {
      // Production should STILL say 24 hours
      const lower = out.toLowerCase();
      const prodIdx = lower.indexOf('production');
      if (prodIdx === -1) return false;
      const prodChunk = out.substring(prodIdx, prodIdx + 500);
      return prodChunk.includes('24');
    },
  },
  {
    id: 'sub-3',
    type: 'substitution',
    // AMBIGUITY: "audit findings remediated within X days for critical issues" in BOTH Internal AND External
    instruction: 'In the "Audit Requirements - External" section ONLY, change the critical issue remediation deadline from 60 days to 45 days.',
    verifyApplied: (out) => {
      const lower = out.toLowerCase();
      const extIdx = lower.indexOf('external');
      if (extIdx === -1) return false;
      const extChunk = out.substring(extIdx, extIdx + 500);
      return extChunk.includes('45');
    },
    verifyPreserved: (out) => {
      // Internal should STILL say 30 days
      const lower = out.toLowerCase();
      const intIdx = lower.indexOf('internal');
      if (intIdx === -1) return false;
      const intChunk = out.substring(intIdx, intIdx + 500);
      return intChunk.includes('30');
    },
  },
  {
    id: 'ins-1',
    type: 'insertion',
    // AMBIGUITY: add to ONLY one of two very similar training sections
    instruction: 'In the "Training Requirements - Security" section ONLY, add a new rule: "Penetration testing training must be completed by all security engineers within 60 days of assignment."',
    verifyApplied: (out) => {
      const lower = out.toLowerCase();
      return lower.includes('penetration') && lower.includes('60');
    },
    verifyPreserved: (out) => {
      // Compliance training section should NOT have penetration testing
      const lower = out.toLowerCase();
      const compIdx = lower.indexOf('compliance training') > -1
        ? lower.indexOf('compliance training')
        : lower.indexOf('training requirements - compliance');
      if (compIdx === -1) return true; // Section name might be slightly different
      const compChunk = out.substring(compIdx, compIdx + 500);
      return !compChunk.includes('penetration');
    },
  },
  {
    id: 'del-1',
    type: 'deletion',
    // AMBIGUITY: "vendor incidents must be reported" exists in BOTH Critical AND Non-Critical
    instruction: 'Remove the vendor incident reporting rule from the "Vendor Management - Non-Critical Vendors" section ONLY. Keep the Critical Vendors incident reporting rule unchanged.',
    verifyApplied: (out) => {
      const lower = out.toLowerCase();
      // Non-critical section should NOT have "72 hours" (the non-critical incident timeline)
      const nonCritIdx = lower.indexOf('non-critical');
      if (nonCritIdx === -1) return false;
      const nonCritChunk = out.substring(nonCritIdx, nonCritIdx + 500);
      return !nonCritChunk.includes('72 hour');
    },
    verifyPreserved: (out) => {
      // Critical section SHOULD still have "24 hours" incident reporting
      const lower = out.toLowerCase();
      const critIdx = lower.indexOf('critical vendor');
      if (critIdx === -1) return false;
      const critChunk = out.substring(critIdx, critIdx + 500);
      return critChunk.includes('24');
    },
  },
];

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

async function testEditPrecision(): Promise<TestResult> {
  const yon = loadYon();
  const nl = loadNl();
  const elapsed = startTimer();

  let yonCorrect = 0;
  let nlCorrect = 0;
  let yonPreserved = 0;
  let nlPreserved = 0;
  const details: string[] = [];

  // All edit commands are independent — parallelize all YON + NL calls (Tier 4 = 10k RPM)
  const commandResults = await Promise.allSettled(
    EDIT_COMMANDS.map(async (cmd) => {
      const [yonResult, nlResult] = await Promise.all([
        askLLM(
          [
            'You are given a document in YON format. Apply the following edit and return the COMPLETE modified document.',
            'Output ONLY the modified document, nothing else.',
            '',
            'Edit instruction: ' + cmd.instruction,
            '',
            'Document:',
            yon,
          ].join('\n'),
          6000,
        ),
        askLLM(
          [
            'You are given a document in plain English. Apply the following edit and return the COMPLETE modified document.',
            'Output ONLY the modified document, nothing else.',
            '',
            'Edit instruction: ' + cmd.instruction,
            '',
            'Document:',
            nl,
          ].join('\n'),
          6000,
        ),
      ]);

      const yonApplied = cmd.verifyApplied(yonResult);
      const yonKept = cmd.verifyPreserved(yonResult);
      const nlApplied = cmd.verifyApplied(nlResult);
      const nlKept = cmd.verifyPreserved(nlResult);

      return {
        yonApplied,
        yonKept,
        nlApplied,
        nlKept,
        detail:
          cmd.id + '(' + cmd.type + '): YON=' + (yonApplied ? '\u2713' : '\u2717') + (yonKept ? '\u2713' : '\u2717') +
          ' NL=' + (nlApplied ? '\u2713' : '\u2717') + (nlKept ? '\u2713' : '\u2717'),
      };
    }),
  );

  for (const r of commandResults) {
    if (r.status === 'rejected') throw r.reason;
    const { yonApplied, yonKept, nlApplied, nlKept, detail } = r.value;
    if (yonApplied) yonCorrect++;
    if (yonKept) yonPreserved++;
    if (nlApplied) nlCorrect++;
    if (nlKept) nlPreserved++;
    details.push(detail);
  }

  const durationMs = elapsed();
  const total = EDIT_COMMANDS.length;
  const yonPrecision = Math.round(((yonCorrect + yonPreserved) / (total * 2)) * 100);
  const nlPrecision = Math.round(((nlCorrect + nlPreserved) / (total * 2)) * 100);

  return {
    id: 'edit-precision',
    name: 'Edit Precision (YON canon vs NL, ambiguous rules)',
    passed: yonPrecision >= 70,
    type: 'gate',
    metric: { name: 'yon_edit_precision', value: yonPrecision, unit: '%' },
    secondaryMetrics: [
      { name: 'nl_edit_precision', value: nlPrecision, unit: '%' },
      { name: 'yon_edits_applied', value: yonCorrect, unit: '/' + total },
      { name: 'nl_edits_applied', value: nlCorrect, unit: '/' + total },
      { name: 'yon_content_preserved', value: yonPreserved, unit: '/' + total },
      { name: 'nl_content_preserved', value: nlPreserved, unit: '/' + total },
      { name: 'delta', value: yonPrecision - nlPrecision, unit: 'pp' },
      { name: 'duration', value: Math.round(durationMs), unit: 'ms' },
    ],
    detail: 'YON: ' + yonPrecision + '% (' + yonCorrect + '/' + total + ' applied, ' + yonPreserved + '/' + total + ' preserved). NL: ' + nlPrecision + '% (' + nlCorrect + '/' + total + ' applied, ' + nlPreserved + '/' + total + ' preserved). ' + details.join('. '),
    outcome: yonPrecision > nlPrecision + 5 ? 'advantage' : yonPrecision < nlPrecision - 5 ? 'disadvantage' : 'tied',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();
  const tests: TestResult[] = [];

  tests.push(await testEditPrecision());

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'llm-edit-precision',
    suiteName: 'LLM Edit Precision',
    pillar: 'cognitive-economy',
    tests,
    summary: { total: tests.length, passed, failed: tests.length - passed, durationMs },
    timestamp: localTimestamp(),
  };
}

export { run as runEditPrecision };
