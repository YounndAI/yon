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
 * AI SDK Streaming Integration Suite
 *
 * Pillar: Cross-Cutting
 * Validates: YON parsing inside a simulated Vercel AI SDK streamText() pipeline.
 *
 * Uses a mock stream (no API key required) to measure:
 * 1. TTFR through the integration layer
 * 2. Record completeness from chunked delivery
 * 3. Error handling for mid-stream corruption
 */

import { StreamingYonParser } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Mock AI SDK Stream
// ---------------------------------------------------------------------------

const RECORD_COUNT = 100;

/** Simulate AI SDK text chunks — delivers YON line-by-line with random chunking */
function createMockAIStream(recordCount: number): string[] {
  const fullDoc: string[] = [];
  fullDoc.push('@DOC ver=2.0 | id=ai-sdk-test | title="AI SDK Stream" | kind=data');
  for (let i = 0; i < recordCount; i++) {
    fullDoc.push(`@MAP id=item-${i} | name:str="Product ${i}" | price:int=${(i + 1) * 10} | in_stock:bool=true`);
  }

  // Simulate chunked delivery (random split points like real AI SDK)
  const fullText = fullDoc.join('\n') + '\n';
  const chunks: string[] = [];
  let pos = 0;
  while (pos < fullText.length) {
    const chunkSize = 20 + Math.floor(Math.random() * 80); // 20-100 chars per chunk
    chunks.push(fullText.slice(pos, pos + chunkSize));
    pos += chunkSize;
  }
  return chunks;
}

function createCorruptedMockStream(recordCount: number): string[] {
  const fullDoc: string[] = [];
  fullDoc.push('@DOC ver=2.0 | id=ai-sdk-corrupt | title="AI SDK Corrupt" | kind=data');
  for (let i = 0; i < recordCount; i++) {
    if (i === Math.floor(recordCount / 2)) {
      fullDoc.push('!!!CORRUPT_CHUNK_MIDSTREAM!!!');
    } else {
      fullDoc.push(`@MAP id=item-${i} | name:str="Product ${i}" | price:int=${(i + 1) * 10}`);
    }
  }
  const fullText = fullDoc.join('\n') + '\n';
  const chunks: string[] = [];
  let pos = 0;
  while (pos < fullText.length) {
    const chunkSize = 30 + Math.floor(Math.random() * 70);
    chunks.push(fullText.slice(pos, pos + chunkSize));
    pos += chunkSize;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testIntegrationTTFR(): TestResult {
  const chunks = createMockAIStream(RECORD_COUNT);
  let firstRecordTime = 0;
  let records = 0;
  const startTime = performance.now();

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'record' && event.record.tag !== 'DOC') {
        records++;
        if (records === 1) {
          firstRecordTime = performance.now() - startTime;
        }
      }
    },
  });

  for (const chunk of chunks) {
    try { parser.write(chunk); } catch { /* skip */ }
  }
  try { parser.end(); } catch { /* ok */ }

  return {
    id: 'ai-sdk-ttfr',
    name: 'AI SDK Integration — Time to First Record',
    passed: firstRecordTime < 10, // Sub-10ms through integration
    metric: {
      name: 'integration_ttfr_ms',
      value: Math.round(firstRecordTime * 1000) / 1000,
      unit: 'ms',
    },
    secondaryMetrics: [
      { name: 'total_records', value: records, unit: 'records' },
      { name: 'total_chunks', value: chunks.length, unit: 'chunks' },
    ],
    detail:
      `Streamed ${RECORD_COUNT} records through ${chunks.length} simulated AI SDK chunks. ` +
      `TTFR: ${firstRecordTime.toFixed(3)}ms. Total records: ${records}.`,
  };
}

function testIntegrationCompleteness(): TestResult {
  const chunks = createMockAIStream(RECORD_COUNT);
  let records = 0;
  let errors = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'error') { errors++; return; }
      if (event.type === 'record' && event.record.tag !== 'DOC') records++;
    },
  });

  for (const chunk of chunks) {
    try { parser.write(chunk); } catch { errors++; }
  }
  try { parser.end(); } catch { /* ok */ }

  const completeness = Math.round((records / RECORD_COUNT) * 100);

  return {
    id: 'ai-sdk-completeness',
    name: 'AI SDK Integration — Record Completeness',
    passed: records === RECORD_COUNT,
    metric: {
      name: 'integration_completeness',
      value: completeness,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'records_received', value: records, unit: 'records' },
      { name: 'errors', value: errors, unit: 'errors' },
    ],
    detail:
      `${records}/${RECORD_COUNT} records received through chunked delivery (${completeness}%). ` +
      `Errors: ${errors}. YON's line-buffered parser handles arbitrary chunk boundaries.`,
  };
}

function testIntegrationErrorHandling(): TestResult {
  const chunks = createCorruptedMockStream(RECORD_COUNT);
  let records = 0;
  let errors = 0;

  const parser = new StreamingYonParser({
    onEvent: (event) => {
      if (event.type === 'error') { errors++; return; }
      if (event.type === 'record' && event.record.tag !== 'DOC') records++;
    },
  });

  for (const chunk of chunks) {
    try { parser.write(chunk); } catch { errors++; }
  }
  try { parser.end(); } catch { /* ok */ }

  const expectedMin = RECORD_COUNT - 2; // At most 1-2 records lost
  const recoveryPct = Math.round((records / RECORD_COUNT) * 100);

  return {
    id: 'ai-sdk-error-handling',
    name: 'AI SDK Integration — Mid-Stream Error Handling',
    passed: records >= expectedMin,
    metric: {
      name: 'integration_error_recovery',
      value: recoveryPct,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'records_recovered', value: records, unit: 'records' },
      { name: 'errors_handled', value: errors, unit: 'errors' },
    ],
    detail:
      `Injected corruption mid-stream. Recovered ${records}/${RECORD_COUNT} records (${recoveryPct}%). ` +
      `Errors handled: ${errors}. Parser continues after mid-stream corruption.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runAiSdkStreamingIntegration(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testIntegrationTTFR(),
    testIntegrationCompleteness(),
    testIntegrationErrorHandling(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'ai-sdk-streaming-integration',
    suiteName: 'AI SDK Streaming Integration',
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
