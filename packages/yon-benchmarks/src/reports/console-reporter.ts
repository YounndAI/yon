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
 * Vitest-Style Console Reporter for YON Benchmarks
 *
 * Renders benchmark results as a tree with:
 * - Pillar grouping with section headers
 * - Per-test expansion with icons (✓ gate, ◇ comparative, ◦ measurement)
 * - Outcome indicators (▲ advantage, ═ tied, ▼ disadvantage)
 * - Inline metric formatting
 * - Comparison delta display
 * - Failed detail lines
 * - Color with NO_COLOR/CI/non-TTY detection
 */

import { formatDuration } from '@younndai/ai-relay';
import type { BenchmarkResult, BenchmarkSuite, Pillar, TestResult, TestOutcome } from '../core/types.js';

// ---------------------------------------------------------------------------
// Color Helpers
// ---------------------------------------------------------------------------

const useColor =
  !process.env['NO_COLOR'] &&
  !process.env['CI'] &&
  process.stdout.isTTY !== false;

const c = {
  green: (s: string) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s: string) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s: string) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  dim: (s: string) => (useColor ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s: string) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
  cyan: (s: string) => (useColor ? `\x1b[36m${s}\x1b[0m` : s),
};

// ---------------------------------------------------------------------------
// Pillar Ordering & Grouping
// ---------------------------------------------------------------------------

/** Display order for pillars. */
const PILLAR_ORDER: Pillar[] = [
  'cross-cutting',
  'lossless',
  'emitter-faithfulness',
  'streaming',
  'cognitive-economy',
  'sapir-whorf',
];

const PILLAR_LABELS: Record<Pillar, string> = {
  'cross-cutting': 'Cross-Cutting',
  lossless: 'Lossless',
  'emitter-faithfulness': 'Emitter Faithfulness',
  streaming: 'Streaming',
  'cognitive-economy': 'Cognitive Economy',
  'sapir-whorf': 'Sapir-Whorf',
};

/** Group suites by pillar in display order. */
export function groupByPillar(suites: BenchmarkSuite[]): Map<Pillar, BenchmarkSuite[]> {
  const groups = new Map<Pillar, BenchmarkSuite[]>();
  for (const pillar of PILLAR_ORDER) {
    const matching = suites.filter((s) => s.pillar === pillar);
    if (matching.length > 0) {
      groups.set(pillar, matching);
    }
  }
  return groups;
}

/** Sort suites by pillar order (for execution). */
export function sortByPillar<T extends { pillar: Pillar }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => PILLAR_ORDER.indexOf(a.pillar) - PILLAR_ORDER.indexOf(b.pillar),
  );
}

// ---------------------------------------------------------------------------
// Metric Formatting
// ---------------------------------------------------------------------------

function formatMetric(value: number, unit: string): string {
  if (unit === 'bool') return value ? '✓' : '✗';
  if (unit === '%') return `${value}%`;
  if (unit === 'ms') return `${value}ms`;
  if (unit === 'ratio') return `${value}x`;
  if (unit === 'ops/sec') return `${value.toLocaleString()} ops/sec`;

  // Units starting with / already have context (e.g., "/4 blocks")
  if (unit.startsWith('/')) return `${value}${unit}`;

  // Default: value + space + unit
  return `${value} ${unit}`;
}

function formatComparisonDelta(test: TestResult): string {
  const comp = test.metric.comparison;
  if (!comp) return '';
  return ` ${c.dim(`vs ${comp.baselineLabel}`)}`;
}

// ---------------------------------------------------------------------------
// Test Icons & Outcome
// ---------------------------------------------------------------------------

function testIcon(test: TestResult): string {
  const type = test.type ?? 'gate';

  if (type === 'comparative') {
    const outcome = outcomeIndicator(test.outcome);
    return outcome ? `${c.cyan('◇')} ${outcome}` : c.cyan('◇');
  }

  if (type === 'measurement') {
    return c.dim('◦');
  }

  // Gate test
  return test.passed ? c.green('✓') : c.red('✗');
}

function outcomeIndicator(outcome?: TestOutcome): string {
  if (!outcome) return '';
  switch (outcome) {
    case 'advantage':
      return c.green('▲');
    case 'tied':
      return c.dim('═');
    case 'disadvantage':
      return c.yellow('▼');
  }
}

function suiteIcon(result: BenchmarkResult): string {
  return result.summary.failed === 0 ? c.green('✓') : c.red('✗');
}

// ---------------------------------------------------------------------------
// Printing Functions
// ---------------------------------------------------------------------------

/** Print a pillar section header. */
export function printPillarHeader(pillar: Pillar, count: number, isLLM = false): void {
  const label = isLLM ? `LLM: ${PILLAR_LABELS[pillar]}` : PILLAR_LABELS[pillar];
  const header = ` ── ${label} (${count} ${count === 1 ? 'suite' : 'suites'}) `;
  const line = header + '─'.repeat(Math.max(0, 56 - header.length));
  console.log('');
  console.log(c.bold(line));
  console.log('');
}

/** Print a single suite result with its full test tree. */
export function printSuiteResult(result: BenchmarkResult): void {
  // Clear the "running" line
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
  const icon = suiteIcon(result);
  const duration = c.dim(formatDuration(result.summary.durationMs));

  // Suite header line
  console.log(` ${icon} ${result.suiteName}  ${duration}`);

  // Individual tests
  for (const test of result.tests) {
    const icon = testIcon(test);
    const metric = c.dim(`(${formatMetric(test.metric.value, test.metric.unit)})`);
    const delta = formatComparisonDelta(test);

    console.log(`   ${icon} ${test.name} ${metric}${delta}`);

    // Failed gate tests: show detail
    const type = test.type ?? 'gate';
    if (type === 'gate' && !test.passed && test.detail) {
      console.log(`     ${c.red('└─')} ${c.dim(test.detail)}`);
    }
  }
}

/** Print a suite-level crash error. */
export function printSuiteError(suiteName: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  // Clear the "running" line first
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
  console.log(` ${c.red('✗')} ${suiteName}  ${c.red('ERROR')}`);
  console.log(`   ${c.red('└─')} ${c.dim(msg.slice(0, 200))}`);
}

/** Print an in-progress indicator before a suite starts running. */
export function printSuiteRunning(suiteName: string): void {
  console.log(` ${c.dim('❯')} ${c.dim(suiteName)}${c.dim('...')}`);
}

/** Print the final summary block. */
export function printSummary(opts: {
  results: BenchmarkResult[];
  totalDurationMs: number;
  totalSuites: number;
  skippedCategory?: string;
  skippedCount?: number;
  filtered?: { shown: number; total: number };
  llmCost?: { cost: number; calls: number; inputTokens: number; outputTokens: number };
}): void {
  const { results, totalDurationMs } = opts;

  const suitesPassed = results.filter((r) => r.summary.failed === 0).length;
  const suitesFailed = results.filter((r) => r.summary.failed > 0).length;
  const suitesErrored = opts.totalSuites - results.length;

  const allTests = results.flatMap((r) => r.tests);
  const gateTests = allTests.filter((t) => !t.type || t.type === 'gate');
  const gatePassed = gateTests.filter((t) => t.passed).length;
  const gateFailed = gateTests.filter((t) => !t.passed).length;
  const comparativeCount = allTests.filter((t) => t.type === 'comparative').length;
  const measurementCount = allTests.filter((t) => t.type === 'measurement').length;

  console.log('');
  console.log(c.bold(' ── Summary ──────────────────────────────────────────'));
  console.log('');

  // Suites line
  const suiteParts: string[] = [];
  if (suitesPassed > 0) suiteParts.push(c.green(`${suitesPassed} passed`));
  if (suitesFailed > 0) suiteParts.push(c.red(`${suitesFailed} failed`));
  if (suitesErrored > 0) suiteParts.push(c.red(`${suitesErrored} errored`));
  if (opts.skippedCount && opts.skippedCategory) {
    suiteParts.push(c.dim(`${opts.skippedCount} skipped (${opts.skippedCategory})`));
  }
  const suiteTotal = opts.totalSuites + (opts.skippedCount ?? 0);
  const filterNote = opts.filtered ? c.dim(` (filtered: ${opts.filtered.shown}/${opts.filtered.total})`) : '';
  console.log(`  ${c.bold('Suites')}  ${suiteParts.join(c.dim(' | '))} ${c.dim(`(${suiteTotal})`)}${filterNote}`);

  // Tests line
  const testParts: string[] = [];
  if (gatePassed > 0) testParts.push(c.green(`${gatePassed} passed`));
  if (gateFailed > 0) testParts.push(c.red(`${gateFailed} failed`));
  if (comparativeCount > 0) testParts.push(c.cyan(`${comparativeCount} comparative`));
  if (measurementCount > 0) testParts.push(c.dim(`${measurementCount} measurement`));
  console.log(`   ${c.bold('Tests')}  ${testParts.join(c.dim(' | '))} ${c.dim(`(${allTests.length})`)}`);

  // Cost line (only if LLM calls were made)
  if (opts.llmCost && opts.llmCost.calls > 0) {
    const { cost, calls, inputTokens, outputTokens } = opts.llmCost;
    console.log(`    ${c.bold('Cost')}  $${cost.toFixed(4)} ${c.dim(`(${calls} calls, ${inputTokens.toLocaleString()} in + ${outputTokens.toLocaleString()} out)`)}`);
  }

  // Start time
  const now = new Date();
  const startTime = new Date(now.getTime() - totalDurationMs);
  const startStr = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  console.log(`   ${c.bold('Start')}  ${startStr}`);

  // Duration
  console.log(`${c.bold('Duration')}  ${formatDuration(totalDurationMs)}`);

  console.log('');
}
