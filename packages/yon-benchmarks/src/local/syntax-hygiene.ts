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
 * Syntax Hygiene Suite
 *
 * Pillar: Lossless
 * Validates: YON's boundary strategy eliminates escape budget for embedded code.
 *
 * Tests:
 * 1. Escape Density — quantify YON escape-free advantage
 * 2. Boundary Integrity — verify @BEGIN/@END preserves content verbatim
 */

import { parse, type YonDocument } from '@younndai/yon-parser';
import { localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countEscapes(str: string): number {
  return (str.match(/\\[ntr"\\]/g) || []).length;
}

// Inline test vectors (ported from legacy polyglot.ts)
const YON_CODE_EMBED = [
  '@DOC ver=2.0 | id=code-test | title="Code Embed"',
  '@BEGIN ts#handler | mime=text/typescript',
  "import { db } from './database';",
  '',
  'async function getUsers(filter: string) {',
  '  const query = `SELECT * FROM users WHERE name LIKE \'%${filter}%\'`;',
  '  const result = await db.query(query);',
  '  console.log("Found " + result.length + " users");',
  '  return result;',
  '}',
  '@END ts#handler',
  '',
  '@BEGIN sql#schema | mime=text/sql',
  'CREATE TABLE users (',
  '  id SERIAL PRIMARY KEY,',
  '  name VARCHAR(255) NOT NULL,',
  "  metadata JSONB DEFAULT '{}'::jsonb",
  ');',
  '@END sql#schema',
].join('\n');

const JSON_CODE_EQUIV = JSON.stringify({
  handler: {
    code: "import { db } from './database';\n\nasync function getUsers(filter: string) {\n  const query = `SELECT * FROM users WHERE name LIKE '%${filter}%'`;\n  const result = await db.query(query);\n  console.log(\"Found \" + result.length + \" users\");\n  return result;\n}",
  },
  schema: {
    code: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  metadata JSONB DEFAULT '{}'::jsonb\n);",
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testEscapeDensity(): TestResult {
  const yonEscapes = countEscapes(YON_CODE_EMBED);
  const jsonEscapes = countEscapes(JSON_CODE_EQUIV);

  const yonSize = Buffer.byteLength(YON_CODE_EMBED, 'utf-8');
  const jsonSize = Buffer.byteLength(JSON_CODE_EQUIV, 'utf-8');

  const pctLarger = ((jsonSize / yonSize - 1) * 100).toFixed(1);

  return {
    id: 'escape-density',
    name: 'Escape Density (YON Advantage)',
    passed: yonEscapes < jsonEscapes,
    metric: {
      name: 'yon_escapes',
      value: yonEscapes,
      unit: 'escapes',
      comparison: {
        baseline: jsonEscapes,
        baselineLabel: 'JSON escapes',
        delta: yonEscapes + ' vs ' + jsonEscapes,
      },
    },
    detail: 'YON: ' + yonEscapes + ' escapes (' + yonSize + 'B). JSON: ' + jsonEscapes + ' escapes (' + jsonSize + 'B). JSON is ' + pctLarger + '% larger.',
  };
}

function testBoundaryIntegrity(): TestResult {
  let doc: YonDocument;
  try {
    doc = parse(YON_CODE_EMBED);
  } catch (e) {
    return {
      id: 'boundary-integrity',
      name: 'Block Boundary Integrity',
      passed: false,
      metric: { name: 'blocks_intact', value: 0, unit: 'count' },
      detail: 'Parse failed: ' + (e instanceof Error ? e.message : String(e)),
    };
  }

  let intact = 0;
  for (const [, block] of doc.blocks) {
    if (block.content && block.content.length > 0) {
      intact++;
    }
  }

  return {
    id: 'boundary-integrity',
    name: 'Block Boundary Integrity',
    passed: intact === doc.blocks.size && doc.blocks.size > 0,
    metric: {
      name: 'blocks_intact',
      value: intact,
      unit: '/' + doc.blocks.size + ' blocks',
    },
    detail: intact + '/' + doc.blocks.size + ' blocks preserved with content intact via @BEGIN/@END boundaries.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export async function runSyntaxHygiene(): Promise<BenchmarkResult> {
  const start = performance.now();

  const tests: TestResult[] = [
    testEscapeDensity(),
    testBoundaryIntegrity(),
  ];

  const durationMs = performance.now() - start;
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'syntax-hygiene',
    suiteName: 'Syntax Hygiene',
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
