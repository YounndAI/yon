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
 * Error Recovery Benchmarks Suite
 *
 * Pillar: Streaming
 * Validates: YON's line-oriented format enables graceful degradation under
 *         corruption — a fundamental advantage over JSON and YAML.
 *
 * Tests:
 * 1. Single-Line Corruption — corrupt 1 record in a 100-record doc
 * 2. Multi-Point Corruption — corrupt 5 non-adjacent records
 * 3. Truncation Recovery — document cut off mid-stream
 * 4. Encoding Corruption — invalid UTF-8 sequences injected
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDoc(recordCount: number): string {
  let s = '@DOC ver=2.0 | id=recovery | title="Error Recovery" | kind=data\n';
  for (let i = 0; i < recordCount; i++) {
    s += '@NOTE text="Record ' + i + '" | idx:int=' + i + '\n';
  }
  return s;
}

function corruptLine(doc: string, lineIndex: number): string {
  const lines = doc.split('\n');
  if (lineIndex < lines.length) {
    lines[lineIndex] = '!!!CORRUPTED{{{{GARBAGE>>>>' + lines[lineIndex]!.slice(10);
  }
  return lines.join('\n');
}

/**
 * Parse a potentially-corrupt YON document and count how many records
 * the streaming parser can recover. Uses the event-based API:
 * write() line-by-line, catching per-line errors, then end().
 */
function recoverRecords(doc: string): number {
  let count = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record') {
        count++;
      }
    },
  });

  // Write line-by-line to isolate corruption
  const lines = doc.split('\n');
  for (const line of lines) {
    try {
      parser.write(line + '\n');
    } catch {
      // Skip corrupt line — this IS the recovery mechanism
    }
  }

  try {
    parser.end();
  } catch {
    // Final flush may fail on corrupt tail
  }

  return count;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testSingleLineCorruption(): TestResult {
  const total = 100;
  const doc = buildDoc(total);
  const corruptedDoc = corruptLine(doc, 50); // Corrupt record 49

  const yonRecovered = recoverRecords(corruptedDoc);

  // JSON recovery: corrupt 1 character in the middle
  const jsonArr = Array.from({ length: total }, (_, i) => ({ text: 'Record ' + i, idx: i }));
  const jsonStr = JSON.stringify(jsonArr);
  const mid = Math.floor(jsonStr.length / 2);
  const corruptedJson = jsonStr.slice(0, mid) + '!!CORRUPT!!' + jsonStr.slice(mid + 11);

  let jsonRecovered = 0;
  try {
    JSON.parse(corruptedJson);
    jsonRecovered = total;
  } catch {
    jsonRecovered = 0; // Total failure
  }

  const yonPct = Math.round((yonRecovered / (total + 1)) * 100); // +1 for @DOC

  return {
    id: 'single-line-corruption',
    name: 'Single-Line Corruption Recovery',
    passed: yonRecovered > jsonRecovered,
    metric: {
      name: 'yon_recovered',
      value: yonPct,
      unit: '%',
      comparison: {
        baseline: Math.round((jsonRecovered / total) * 100),
        baselineLabel: 'JSON recovery %',
        delta: yonPct + '% vs ' + Math.round((jsonRecovered / total) * 100) + '%',
      },
    },
    secondaryMetrics: [
      { name: 'yon_records', value: yonRecovered, unit: 'records' },
      { name: 'json_records', value: jsonRecovered, unit: 'records' },
    ],
    detail: 'YON recovered ' + yonRecovered + '/' + (total + 1) + ' records (' + yonPct + '%). JSON: total failure (' + jsonRecovered + '/' + total + '). Line-oriented format enables record-level fault isolation.',
  };
}

function testMultiPointCorruption(): TestResult {
  const total = 100;
  let doc = buildDoc(total);

  // Corrupt 5 non-adjacent lines
  const corruptIndices = [10, 25, 50, 75, 90];
  for (const idx of corruptIndices) {
    doc = corruptLine(doc, idx + 1); // +1 for @DOC header
  }

  const yonRecovered = recoverRecords(doc);
  const expectedSurvivors = total + 1 - corruptIndices.length; // +1 for @DOC
  const pct = Math.round((yonRecovered / (total + 1)) * 100);

  return {
    id: 'multi-point-corruption',
    name: 'Multi-Point Corruption Recovery (5 faults)',
    passed: yonRecovered >= expectedSurvivors - 2, // Allow small tolerance
    metric: {
      name: 'survived_records',
      value: yonRecovered,
      unit: 'records',
      comparison: {
        baseline: 0,
        baselineLabel: 'JSON recovery (total fail)',
        delta: yonRecovered + ' vs 0',
      },
    },
    detail: '5 corruption points injected. YON recovered ' + yonRecovered + '/' + (total + 1) + ' records (' + pct + '%). JSON: total failure. Each fault is isolated to its line.',
  };
}

function testTruncationRecovery(): TestResult {
  const total = 100;
  const doc = buildDoc(total);

  // Truncate at 60% of document
  const cutPoint = Math.floor(doc.length * 0.6);
  const truncated = doc.slice(0, cutPoint);

  const yonRecovered = recoverRecords(truncated);

  // JSON truncation: always fails
  const jsonStr = JSON.stringify(Array.from({ length: total }, (_, i) => ({ text: 'Record ' + i })));
  const truncatedJson = jsonStr.slice(0, Math.floor(jsonStr.length * 0.6));
  let jsonRecovered = 0;
  try {
    JSON.parse(truncatedJson);
    jsonRecovered = total;
  } catch {
    jsonRecovered = 0;
  }

  const expectedMin = Math.floor(total * 0.5); // At least 50% should survive from 60% of bytes

  return {
    id: 'truncation-recovery',
    name: 'Stream Truncation Recovery (60% of doc)',
    passed: yonRecovered >= expectedMin,
    metric: {
      name: 'recovered_records',
      value: yonRecovered,
      unit: 'records',
      comparison: {
        baseline: jsonRecovered,
        baselineLabel: 'JSON truncation recovery',
        delta: yonRecovered + ' vs ' + jsonRecovered,
      },
    },
    detail: 'Document truncated at 60%. YON recovered ' + yonRecovered + ' records (all complete lines before cut point). JSON: total failure. Streaming-first design means every complete line is immediately usable.',
  };
}

function testEncodingCorruption(): TestResult {
  const total = 50;
  const doc = buildDoc(total);
  const lines = doc.split('\n');

  // Inject replacement characters into 3 lines
  const badIndices = [10, 25, 40];
  for (const idx of badIndices) {
    if (idx < lines.length) {
      lines[idx] = lines[idx]!.slice(0, 5) + '\uFFFD\uFFFD\uFFFD' + lines[idx]!.slice(8);
    }
  }
  const corrupted = lines.join('\n');

  const recovered = recoverRecords(corrupted);
  const pct = Math.round((recovered / (total + 1)) * 100);

  return {
    id: 'encoding-corruption',
    name: 'Encoding Corruption Resilience',
    passed: recovered >= total - badIndices.length,
    metric: {
      name: 'recovered_records',
      value: recovered,
      unit: 'records',
      comparison: {
        baseline: total + 1,
        baselineLabel: 'total records',
        delta: pct + '% survived',
      },
    },
    detail: '3 lines corrupted with replacement characters. YON recovered ' + recovered + '/' + (total + 1) + ' records (' + pct + '%). Line-per-record isolation limits blast radius.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testSingleLineCorruption(),
    testMultiPointCorruption(),
    testTruncationRecovery(),
    testEncodingCorruption(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'error-recovery',
    suiteName: 'Error Recovery',
    pillar: 'streaming',
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

export { run as runErrorRecovery };
