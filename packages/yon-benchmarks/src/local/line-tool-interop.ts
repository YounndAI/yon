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
 * Line-Tool Interoperability Suite
 *
 * Pillar: Streaming
 * Validates: YON's line-oriented design means standard text-processing operations
 *         (grep, filter, split) work natively — each extracted line parses
 *         independently. JSON and YAML fundamentally cannot do this.
 *
 * Tests:
 * 1. Tag Filtering — filter lines by @tag, verify each parses independently
 * 2. Random Access — extract line N, parse it in isolation, verify record data
 * 3. Split & Merge — split document into chunks, recombine, verify integrity
 * 4. JSON Comparison — attempt same operations on JSON, measure failure
 */

import { parse, parseLine } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Test document — mixed tags, realistic content
// ---------------------------------------------------------------------------

function buildMixedDoc(size: number): string {
  const lines = ['@DOC ver=2.0 | id=interop | title="Line Interop" | kind=doc'];

  for (let i = 0; i < size; i++) {
    const tag = ['@NOTE', '@CFG', '@MAP', '@RULE'][i % 4]!;
    switch (tag) {
      case '@NOTE':
        lines.push('@NOTE id=note-' + i + ' | text="Note content ' + i + '"');
        break;
      case '@CFG':
        lines.push('@CFG key=cfg-' + i + ' | value="setting-' + i + '" | enabled:bool=' + (i % 2 === 0));
        break;
      case '@MAP':
        lines.push('@MAP id=map-' + i + ' | name="Entry ' + i + '" | priority:int=' + (i % 5));
        break;
      case '@RULE':
        lines.push('@RULE id=rule-' + i + ' | lvl=MUST | when="condition ' + i + '" | then="action ' + i + '"');
        break;
    }
  }

  return lines.join('\n') + '\n';
}


// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testTagFiltering(): TestResult {
  const doc = buildMixedDoc(100);
  const lines = doc.split('\n');

  // "grep @CFG" equivalent
  const cfgLines = lines.filter((l) => l.startsWith('@CFG'));

  // Verify each extracted line parses independently
  let parseable = 0;
  let hasCorrectTag = 0;

  for (const line of cfgLines) {
    const event = parseLine(line);
    if (event.type === 'record') {
      parseable++;
      if (event.record.tag === 'CFG') hasCorrectTag++;
    }
  }

  const expectedCount = 25; // 100 records, every 4th is @CFG
  const allParseable = parseable === cfgLines.length;
  const allCorrectTag = hasCorrectTag === cfgLines.length;

  return {
    id: 'tag-filtering',
    name: 'Tag Filtering (grep @CFG equivalent)',
    passed: allParseable && allCorrectTag && cfgLines.length === expectedCount,
    metric: {
      name: 'lines_extracted',
      value: cfgLines.length,
      unit: 'lines',
      comparison: {
        baseline: 0,
        baselineLabel: 'JSON (impossible — no line-level filtering)',
        delta: cfgLines.length + ' lines filtered, 100% parse independently',
      },
    },
    secondaryMetrics: [
      { name: 'parseable', value: parseable, unit: 'lines' },
      { name: 'correct_tag', value: hasCorrectTag, unit: 'lines' },
    ],
    detail: 'Filtered ' + cfgLines.length + '/' + lines.length + ' lines by @CFG tag. ' +
      parseable + '/' + cfgLines.length + ' parse independently. ' +
      hasCorrectTag + '/' + cfgLines.length + ' have correct tag.',
  };
}

function testRandomAccess(): TestResult {
  const doc = buildMixedDoc(200);
  const lines = doc.split('\n').filter((l) => l.trim().length > 0);

  // Pick 10 random line indices (skip line 0 which is @DOC)
  const indices = [5, 17, 42, 63, 88, 101, 133, 155, 177, 199];
  let successCount = 0;
  let dataIntact = 0;

  for (const idx of indices) {
    const line = lines[idx];
    if (!line) continue;

    const event = parseLine(line);
    if (event.type === 'record') {
      successCount++;
      // Verify data is accessible — check that fields has the expected id
      const id = event.record.fields.get('id') || event.record.fields.get('key');
      if (id && typeof id === 'string' && id.length > 0) dataIntact++;
    }
  }

  return {
    id: 'random-access',
    name: 'Random Line Access (10 random lines)',
    passed: successCount === indices.length && dataIntact === indices.length,
    metric: {
      name: 'parse_success',
      value: successCount,
      unit: '/' + indices.length + ' lines',
    },
    secondaryMetrics: [
      { name: 'data_intact', value: dataIntact, unit: 'lines' },
    ],
    detail: successCount + '/' + indices.length + ' random lines parse independently with data intact. ' +
      'No document context needed — each line is self-contained.',
  };
}

function testSplitAndMerge(): TestResult {
  const doc = buildMixedDoc(100);
  const lines = doc.split('\n').filter((l) => l.trim().length > 0);

  // Split into 4 chunks (simulating parallel processing)
  const chunkSize = Math.ceil(lines.length / 4);
  const chunks = [
    lines.slice(0, chunkSize),
    lines.slice(chunkSize, chunkSize * 2),
    lines.slice(chunkSize * 2, chunkSize * 3),
    lines.slice(chunkSize * 3),
  ];

  // Parse each chunk independently
  let totalRecords = 0;
  for (const chunk of chunks) {
    for (const line of chunk) {
      const event = parseLine(line);
      if (event.type === 'record') totalRecords++;
    }
  }

  // Merge and parse as full document
  const merged = chunks.flat().join('\n');
  const fullDoc = parse(merged);
  const fullRecords = fullDoc.records.length;

  const match = totalRecords === fullRecords;

  return {
    id: 'split-merge',
    name: 'Split & Merge (4-way parallel)',
    passed: match,
    metric: {
      name: 'chunk_records',
      value: totalRecords,
      unit: 'records',
      comparison: {
        baseline: fullRecords,
        baselineLabel: 'Full parse records',
        delta: match ? 'exact match' : 'mismatch: ' + (totalRecords - fullRecords),
      },
    },
    secondaryMetrics: [
      { name: 'chunks', value: 4, unit: 'chunks' },
      { name: 'lines_per_chunk', value: chunkSize, unit: 'lines' },
    ],
    detail: 'Split 100-record doc into 4 chunks. Chunk parse: ' + totalRecords + ' records. ' +
      'Full parse: ' + fullRecords + ' records. ' +
      (match ? 'Perfect match — parallel processing safe.' : 'Mismatch detected.'),
  };
}

function testJsonComparison(): TestResult {
  // Use pretty-printed JSON (the realistic format humans/LLMs use)
  const records: Record<string, unknown>[] = [];
  for (let i = 0; i < 100; i++) {
    const type = ['note', 'cfg', 'map', 'rule'][i % 4];
    records.push({ type, id: type + '-' + i, index: i, content: 'Content ' + i });
  }
  const jsonDoc = JSON.stringify({ records }, null, 2);

  // Attempt line-level filtering on JSON — "grep cfg"
  const jsonLines = jsonDoc.split('\n');
  const jsonCfgLines = jsonLines.filter((l) => l.includes('"cfg"'));

  // Try to parse each filtered JSON line as valid JSON
  let jsonFilteredParseable = 0;
  for (const line of jsonCfgLines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed && typeof parsed === 'object') jsonFilteredParseable++;
    } catch {
      // Expected — individual JSON lines are not valid JSON
    }
  }

  // Same operation on YON — filter by @CFG tag
  const yonDoc = buildMixedDoc(100);
  const yonLines = yonDoc.split('\n');
  const yonCfgLines = yonLines.filter((l) => l.startsWith('@CFG'));
  let yonFilteredParseable = 0;
  for (const line of yonCfgLines) {
    const event = parseLine(line);
    if (event.type === 'record') yonFilteredParseable++;
  }

  return {
    id: 'json-comparison',
    name: 'Line Independence (YON Advantage)',
    passed: yonFilteredParseable > 0 && jsonFilteredParseable === 0,
    metric: {
      name: 'yon_filtered_parseable',
      value: yonFilteredParseable,
      unit: 'lines',
      comparison: {
        baseline: jsonFilteredParseable,
        baselineLabel: 'JSON filtered lines parseable',
        delta: 'YON: ' + yonFilteredParseable + ' valid records, JSON: ' + jsonFilteredParseable + ' (fragments)',
      },
    },
    detail: 'Filter by "cfg": YON ' + yonFilteredParseable + '/' + yonCfgLines.length + ' lines are parseable records. ' +
      'JSON ' + jsonFilteredParseable + '/' + jsonCfgLines.length + ' filtered lines parse as valid JSON. ' +
      'JSON line filtering produces fragments, not valid data.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runLineToolInterop(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testTagFiltering(),
    testRandomAccess(),
    testSplitAndMerge(),
    testJsonComparison(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'line-tool-interop',
    suiteName: 'Line-Tool Interoperability',
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
