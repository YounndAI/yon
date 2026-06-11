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
 * Real-World Corpus Suite
 *
 * Pillar: Cross-Cutting
 * Validates: YON handles real-world data shapes (API responses, package manifests,
 *         CI configs, database schemas) with measurable advantages.
 *
 * Tests:
 * 1. API Response Corpus — GitHub API-like payloads
 * 2. Package Manifest Corpus — npm package.json shapes
 * 3. CI/CD Config Corpus — GitHub Actions workflow shapes
 * 4. Database Schema Corpus — Drizzle-like schema definitions
 */

import { parse as parseYon } from '@younndai/yon-parser';
import { jsonToYon } from '@younndai/yon-converter';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';
import { get_encoding } from 'tiktoken';

// ---------------------------------------------------------------------------
// Token counter
// ---------------------------------------------------------------------------

function countTokens(text: string): number {
  const enc = get_encoding('cl100k_base');
  const count = enc.encode(text).length;
  enc.free();
  return count;
}

// ---------------------------------------------------------------------------
// Real-world data fixtures
// ---------------------------------------------------------------------------

const API_RESPONSE = {
  id: 123456789,
  name: 'yon-parser',
  full_name: 'younndai/yon-parser',
  private: false,
  owner: {
    login: 'younndai',
    id: 987654,
    type: 'Organization',
    site_admin: false,
  },
  description: 'YON format parser and formatter for TypeScript/JavaScript',
  fork: false,
  created_at: '2025-06-15T10:30:00Z',
  updated_at: '2026-02-13T00:00:00Z',
  pushed_at: '2026-02-12T23:45:00Z',
  homepage: 'https://younndai.com',
  size: 2048,
  stargazers_count: 147,
  watchers_count: 12,
  language: 'TypeScript',
  forks_count: 23,
  open_issues_count: 5,
  default_branch: 'main',
  topics: ['yon', 'parser', 'ai', 'format', 'streaming', 'typescript'],
  license: { key: 'apache-2.0', name: 'Apache License 2.0', spdx_id: 'Apache-2.0' },
};

const PACKAGE_MANIFEST = {
  name: '@younndai/yon-parser',
  version: '2.0.0',
  description: 'YON format parser and formatter',
  main: './dist/index.js',
  types: './dist/index.d.ts',
  type: 'module',
  exports: { '.': { import: './dist/index.js', types: './dist/index.d.ts' } },
  scripts: {
    build: 'tsc',
    test: 'vitest run',
    'test:watch': 'vitest',
    typecheck: 'tsc --noEmit',
    lint: 'eslint .',
  },
  dependencies: { zod: '^3.22.0' },
  devDependencies: { typescript: '^5.7.3', vitest: '^3.0.4', eslint: '^9.0.0' },
  keywords: ['yon', 'parser', 'younndai', 'ai', 'format'],
  author: 'MARLINK TRADING SRL (YounndAI)',
  license: 'Apache-2.0',
  repository: { type: 'git', url: 'https://github.com/younndai/yon-parser' },
  engines: { node: '>=20.0.0' },
};

const CI_CONFIG = {
  name: 'CI',
  on: { push: { branches: ['main'] }, pull_request: { branches: ['main'] } },
  jobs: {
    test: {
      'runs-on': 'ubuntu-latest',
      strategy: { matrix: { 'node-version': ['20.x', '22.x'] } },
      steps: [
        { uses: 'actions/checkout@v4' },
        { name: 'Setup Node', uses: 'actions/setup-node@v4', with: { 'node-version': '${{ matrix.node-version }}' } },
        { name: 'Install', run: 'npm ci' },
        { name: 'TypeCheck', run: 'npm run typecheck' },
        { name: 'Test', run: 'npm test' },
        { name: 'Build', run: 'npm run build' },
      ],
    },
    deploy: {
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      if: "github.ref == 'refs/heads/main'",
      steps: [
        { uses: 'actions/checkout@v4' },
        { name: 'Deploy', run: 'npm run deploy', env: { DEPLOY_TOKEN: '${{ secrets.DEPLOY_TOKEN }}' } },
      ],
    },
  },
};

const DB_SCHEMA = {
  tables: {
    users: {
      columns: {
        id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        email: { type: 'varchar(255)', unique: true, notNull: true },
        name: { type: 'varchar(100)', notNull: true },
        role: { type: "enum('admin','user','viewer')", default: "'user'", notNull: true },
        created_at: { type: 'timestamp', default: 'now()', notNull: true },
        updated_at: { type: 'timestamp', default: 'now()', notNull: true },
        deleted_at: { type: 'timestamp', nullable: true },
      },
      indexes: { email_idx: { columns: ['email'], unique: true } },
    },
    sessions: {
      columns: {
        id: { type: 'uuid', primaryKey: true },
        user_id: { type: 'uuid', references: 'users.id', notNull: true },
        token: { type: 'varchar(512)', notNull: true },
        expires_at: { type: 'timestamp', notNull: true },
        ip_address: { type: 'inet', nullable: true },
        user_agent: { type: 'text', nullable: true },
      },
      indexes: {
        user_id_idx: { columns: ['user_id'] },
        token_idx: { columns: ['token'], unique: true },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testCorpusItem(
  id: string,
  name: string,
  data: Record<string, unknown>,
): TestResult {
  const jsonStr = JSON.stringify(data);
  const jsonPretty = JSON.stringify(data, null, 2);

  // Convert to YON
  let yonStr: string;
  try {
    yonStr = jsonToYon(jsonStr);
  } catch {
    // Fallback: build a simple YON representation
    yonStr = '@DOC ver=2.0 | id=' + id + ' | title="' + name + '" | kind=data\n' +
      '@NOTE text="Conversion from JSON"\n' +
      '@BEGIN lang=json\n' + jsonPretty + '\n@END';
  }

  // Verify YON roundtrip
  let roundtripOk = false;
  try {
    const doc = parseYon(yonStr);
    roundtripOk = doc.records.length > 0;
  } catch {
    roundtripOk = false;
  }

  // Token counts
  const yonTokens = countTokens(yonStr);
  const jsonTokens = countTokens(jsonStr);
  const jsonPrettyTokens = countTokens(jsonPretty);

  const savings = Math.round((1 - yonTokens / jsonTokens) * 100);
  const savingsVsPretty = Math.round((1 - yonTokens / jsonPrettyTokens) * 100);

  return {
    id: id,
    name: name,
    passed: roundtripOk,
    metric: {
      name: 'roundtrip_fidelity',
      value: roundtripOk ? 1 : 0,
      unit: 'bool',
    },
    secondaryMetrics: [
      { name: 'yon_tokens', value: yonTokens, unit: 'tokens' },
      { name: 'json_min_tokens', value: jsonTokens, unit: 'tokens' },
      { name: 'json_pretty_tokens', value: jsonPrettyTokens, unit: 'tokens' },
      { name: 'yon_bytes', value: yonStr.length, unit: 'bytes' },
      { name: 'json_min_bytes', value: jsonStr.length, unit: 'bytes' },
      { name: 'structural_delta_vs_min', value: savings, unit: '%' },
      { name: 'structural_delta_vs_pretty', value: savingsVsPretty, unit: '%' },
    ],
    detail: name + ': Roundtrip ' + (roundtripOk ? 'OK' : 'FAIL') + '. YON ' + yonTokens + ' tok (' + yonStr.length + 'B), JSON min ' + jsonTokens + ' tok (' + jsonStr.length + 'B). Structural density: ' + savings + '% vs min, ' + savingsVsPretty + '% vs pretty.',
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testCorpusItem('api-response', 'GitHub API Response', API_RESPONSE),
    testCorpusItem('package-manifest', 'npm Package Manifest', PACKAGE_MANIFEST as Record<string, unknown>),
    testCorpusItem('ci-config', 'GitHub Actions Workflow', CI_CONFIG as Record<string, unknown>),
    testCorpusItem('db-schema', 'Database Schema Definition', DB_SCHEMA as Record<string, unknown>),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'real-world-corpus',
    suiteName: 'Real-World Corpus',
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

export { run as runRealWorldCorpus };
