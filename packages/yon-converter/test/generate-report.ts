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
 * @younndai/yon-converter — Report Generator
 *
 * Runs all converter scenarios and writes a timestamped report directory
 * containing YON artifacts, reverse-conversion outputs, and a summary.
 *
 * Usage:  npx tsx test/generate-report.ts
 *
 * Output: test/reports/<timestamp>/
 *   ├── _summary.txt
 *   ├── json-flat.yon
 *   ├── json-flat.reverse.json
 *   ├── yaml-docker-compose.yon
 *   ├── yaml-docker-compose.reverse.json
 *   └── ...
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { tomlToYon } from '../src/toml/to-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { xmlToYon } from '../src/xml/index.js';
import { iniToYon } from '../src/ini/index.js';
import { reverseConvert } from '../src/reverse.js';
import { streamToJson, collectStream } from '../src/streaming.js';

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------
interface Scenario {
  id: string;
  label: string;
  sourceFormat: 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini';
  input: string | Record<string, unknown>;
  reverseFormat?: 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini';
}

const SCENARIOS: Scenario[] = [
  // ── JSON ──────────────────────────────────────────────────────────────
  {
    id: 'json-flat',
    label: 'JSON → YON (flat key/value)',
    sourceFormat: 'json',
    input: { name: 'Alice', age: 30, active: true, city: 'NYC' },
    reverseFormat: 'json',
  },
  {
    id: 'json-nested',
    label: 'JSON → YON (nested object)',
    sourceFormat: 'json',
    input: {
      database: { host: 'localhost', port: 5432, ssl: true },
      cache: { ttl: 300, maxSize: 1000 },
    },
    reverseFormat: 'json',
  },
  {
    id: 'json-package',
    label: 'JSON → YON (package.json shape)',
    sourceFormat: 'json',
    input: {
      name: '@younndai/yon-converter',
      version: '1.5.0',
      description: 'Universal format converter for YON',
      main: './dist/index.js',
      scripts: { build: 'tsup', test: 'vitest run', lint: 'eslint src/' },
      dependencies: { '@younndai/yon-parser': '^1.5.0', yaml: '^2.7.0' },
      keywords: ['yon', 'converter', 'json', 'yaml', 'toml'],
      license: 'SEE LICENSE IN LICENSE',
    },
    reverseFormat: 'json',
  },
  {
    id: 'json-github-api',
    label: 'JSON → YON (GitHub API response)',
    sourceFormat: 'json',
    input: {
      id: 123456789,
      name: 'yon-converter',
      full_name: 'younndai/yon-converter',
      private: false,
      owner: { login: 'younndai', id: 987654, type: 'Organization' },
      html_url: 'https://github.com/younndai/yon-converter',
      description: 'Universal format converter for YON',
      language: 'TypeScript',
      stargazers_count: 42,
      topics: ['yon', 'converter', 'data-format'],
      license: { key: 'custom', name: 'YON Commercial License', url: null },
    },
    reverseFormat: 'json',
  },
  {
    id: 'json-wide',
    label: 'JSON → YON (100 keys — stress)',
    sourceFormat: 'json',
    input: Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`field_${i}`, `value_${i}`]),
    ),
    reverseFormat: 'json',
  },
  {
    id: 'json-unicode',
    label: 'JSON → YON (unicode warfare)',
    sourceFormat: 'json',
    input: {
      chinese: '你好世界',
      emoji: '👨‍👩‍👧‍👦🚀🎉',
      arabic: 'مرحبا بالعالم',
      japanese: 'こんにちは世界',
      korean: '안녕하세요',
      math: '∑∏∫∂√∞',
    },
    reverseFormat: 'json',
  },

  // ── YAML ──────────────────────────────────────────────────────────────
  {
    id: 'yaml-docker-compose',
    label: 'YAML → YON (Docker Compose)',
    sourceFormat: 'yaml',
    input: `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    environment:
      NODE_ENV: production
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
volumes:
  pgdata:
`,
    reverseFormat: 'json',
  },
  {
    id: 'yaml-github-actions',
    label: 'YAML → YON (GitHub Actions)',
    sourceFormat: 'yaml',
    input: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
`,
    reverseFormat: 'json',
  },

  // ── TOML ──────────────────────────────────────────────────────────────
  {
    id: 'toml-cargo',
    label: 'TOML → YON (Cargo.toml shape)',
    sourceFormat: 'toml',
    input: `[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
criterion = "0.5"
`,
    reverseFormat: 'json',
  },

  // ── CSV ───────────────────────────────────────────────────────────────
  {
    id: 'csv-employees',
    label: 'CSV → YON (employee list)',
    sourceFormat: 'csv',
    input: `name,email,department,salary
Alice Smith,alice@corp.com,Engineering,120000
Bob Jones,bob@corp.com,Marketing,95000
Carol Lee,carol@corp.com,Engineering,115000
Dave Kim,dave@corp.com,Sales,105000`,
    reverseFormat: 'json',
  },
  {
    id: 'csv-quoted',
    label: 'CSV → YON (quoted fields with commas)',
    sourceFormat: 'csv',
    input: `name,address,notes
"Smith, Alice","123 Main St, Apt 4","Top performer; see review"
"Jones, Bob","456 Elm Dr","New hire, started Jan 2026"`,
  },

  // ── XML ───────────────────────────────────────────────────────────────
  {
    id: 'xml-config',
    label: 'XML → YON (app config)',
    sourceFormat: 'xml',
    input: `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <database host="localhost" port="5432">
    <credentials user="admin" password="secret"/>
  </database>
  <cache enabled="true" ttl="300"/>
  <logging level="info" file="/var/log/app.log"/>
</configuration>`,
    reverseFormat: 'xml',
  },

  // ── INI ───────────────────────────────────────────────────────────────
  {
    id: 'ini-gitconfig',
    label: 'INI → YON (.gitconfig shape)',
    sourceFormat: 'ini',
    input: `[user]
name = Alex Mares
email = alex@younndai.com

[core]
autocrlf = true
editor = code --wait

[alias]
co = checkout
br = branch
ci = commit
st = status

[pull]
rebase = true
`,
    reverseFormat: 'ini',
  },
];

// ---------------------------------------------------------------------------
// Converter dispatch
// ---------------------------------------------------------------------------
function convert(scenario: Scenario): string {
  const { sourceFormat, input } = scenario;
  const opts = { id: scenario.id, title: scenario.label };

  switch (sourceFormat) {
    case 'json':
      return jsonToYon(input as Record<string, unknown>, opts);
    case 'yaml':
      return yamlToYon(input as string, opts);
    case 'toml':
      return tomlToYon(input as string, opts);
    case 'csv':
      return csvToYon(input as string);
    case 'xml':
      return xmlToYon(input as string);
    case 'ini':
      return iniToYon(input as string);
    default:
      throw new Error(`Unknown format: ${sourceFormat}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const now = new Date();
  const ts = now.toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, '');
  const reportDir = path.join(__dirname, 'reports', ts);
  fs.mkdirSync(reportDir, { recursive: true });

  const summaryLines: string[] = [];
  summaryLines.push(`YON Converter — Test Report`);
  summaryLines.push(`Generated: ${now.toISOString()}`);
  summaryLines.push(`Scenarios: ${SCENARIOS.length}`);
  summaryLines.push(`${'─'.repeat(60)}`);
  summaryLines.push('');

  let pass = 0;
  let fail = 0;

  for (const scenario of SCENARIOS) {
    const { id, label, sourceFormat, reverseFormat } = scenario;
    const start = performance.now();

    try {
      // Forward: source → YON
      const yon = convert(scenario);
      const fwdMs = (performance.now() - start).toFixed(1);

      // Write YON artifact
      fs.writeFileSync(path.join(reportDir, `${id}.yon`), yon, 'utf-8');

      let revMs = '-';
      let revChars = 0;

      // Reverse: YON → target
      if (reverseFormat) {
        const revStart = performance.now();
        const reversed = reverseConvert(yon, { targetFormat: reverseFormat });
        revMs = (performance.now() - revStart).toFixed(1);
        revChars = reversed.length;

        // Write reverse artifact
        const ext = reverseFormat === 'json' ? 'json'
          : reverseFormat === 'yaml' ? 'yaml'
          : reverseFormat === 'toml' ? 'toml'
          : reverseFormat === 'xml' ? 'xml'
          : reverseFormat === 'ini' ? 'ini'
          : 'txt';
        fs.writeFileSync(
          path.join(reportDir, `${id}.reverse.${ext}`),
          reversed,
          'utf-8',
        );
      }

      summaryLines.push(`✅ ${label}`);
      summaryLines.push(`   ${sourceFormat} → yon: ${yon.length} chars, ${fwdMs}ms`);
      if (reverseFormat) {
        summaryLines.push(`   yon → ${reverseFormat}: ${revChars} chars, ${revMs}ms`);
      }
      summaryLines.push('');
      pass++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      summaryLines.push(`❌ ${label}`);
      summaryLines.push(`   ERROR: ${errMsg}`);
      summaryLines.push('');
      fail++;
    }
  }

  // Streaming check
  summaryLines.push(`${'─'.repeat(60)}`);
  summaryLines.push('Streaming Verification');
  summaryLines.push('');

  try {
    const streamYon = SCENARIOS[0]!;
    const yon = convert(streamYon);
    const streamResult = await collectStream(streamToJson(yon, { chunkSize: 64 }));
    const parsed = JSON.parse(streamResult);
    summaryLines.push(`✅ streamToJson + collectStream: valid JSON, ${streamResult.length} chars`);
    pass++;
  } catch (err) {
    summaryLines.push(`❌ streamToJson: ${err instanceof Error ? err.message : err}`);
    fail++;
  }

  // Final tally
  summaryLines.push('');
  summaryLines.push(`${'─'.repeat(60)}`);
  summaryLines.push(`TOTAL: ${pass + fail} scenarios | ${pass} pass | ${fail} fail`);
  summaryLines.push(`Status: ${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES DETECTED'}`);

  const summary = summaryLines.join('\n');
  fs.writeFileSync(path.join(reportDir, '_summary.txt'), summary, 'utf-8');

  console.log(summary);
  console.log(`\nReport saved to: ${reportDir}`);

  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Report generation failed:', err);
  process.exit(1);
});
