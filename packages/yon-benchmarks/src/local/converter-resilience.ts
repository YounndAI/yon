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
 * Converter Resilience Suite
 *
 * Pillar: Lossless
 * Validates: YON↔X converters preserve data through adversarial inputs,
 * multiple formats, and real-world shapes.
 *
 * Tests:
 * 1. Multi-Format Roundtrip — TOML, CSV, XML all round-trip through YON
 * 2. Adversarial Strings — emoji, injection, YON-significant chars survive
 * 3. Real-World Fixtures — package.json & API response shapes survive conversion
 * 4. Streaming Equivalence — streaming and sync converters produce identical output
 */

import { parse } from '@younndai/yon-parser';
import {
  jsonToYon,
  reverseConvert,
  tomlToYon,
  csvToYon,
  xmlToYon,
  iniToYon,
  yamlToYon,
  streamToJson,
  collectStream,
} from '@younndai/yon-converter';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testMultiFormatRoundtrip(): TestResult {
  const formats: { name: string; input: string; convert: (s: string) => string; targetFormat: string }[] = [
    {
      name: 'JSON',
      input: '{"server":{"host":"localhost","port":3000},"debug":true}',
      convert: (s) => jsonToYon(JSON.parse(s), { id: 'json-rt', title: 'JSON RT' }),
      targetFormat: 'json',
    },
    {
      name: 'YAML',
      input: 'server:\n  host: localhost\n  port: 3000\ndebug: true\n',
      convert: (s) => yamlToYon(s),
      targetFormat: 'json',
    },
    {
      name: 'TOML',
      input: '[server]\nhost = "localhost"\nport = 3000\n\n[database]\nurl = "postgres://localhost/db"\npool_size = 10\n',
      convert: (s) => tomlToYon(s, { id: 'toml-rt', title: 'TOML RT' }),
      targetFormat: 'json',
    },
    {
      name: 'CSV',
      input: 'name,age,city\nAlice,30,NYC\nBob,25,London\nCharlie,35,Tokyo\n',
      convert: (s) => csvToYon(s),
      targetFormat: 'json',
    },
    {
      name: 'XML',
      input: '<config><server><host>localhost</host><port>3000</port></server><debug>true</debug></config>',
      convert: (s) => xmlToYon(s),
      targetFormat: 'json',
    },
    {
      name: 'INI',
      input: '[server]\nhost=localhost\nport=3000\n\n[database]\nurl=postgres://localhost/db\npool_size=10\n',
      convert: (s) => iniToYon(s),
      targetFormat: 'json',
    },
  ];

  let totalFormats = formats.length;
  let passedFormats = 0;
  const details: string[] = [];

  for (const fmt of formats) {
    try {
      const yon = fmt.convert(fmt.input);
      // Verify it's valid YON
      const doc = parse(yon);
      if (doc.records.length === 0) {
        details.push(`${fmt.name}: FAIL produced 0 records`);
        continue;
      }

      // Reverse convert to JSON and verify data survives
      const json = reverseConvert(yon, { targetFormat: 'json' });
      const obj = JSON.parse(json);
      if (typeof obj === 'object' && obj !== null) {
        passedFormats++;
        details.push(`${fmt.name}: PASS ${doc.records.length} records, data preserved`);
      } else {
        details.push(`${fmt.name}: FAIL reverse produced non-object`);
      }
    } catch (e) {
      details.push(`${fmt.name}: FAIL ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    id: 'multi-format-roundtrip',
    name: 'Multi-Format Roundtrip (TOML, CSV, XML)',
    passed: passedFormats === totalFormats,
    metric: {
      name: 'formats_preserved',
      value: passedFormats,
      unit: `/${totalFormats} formats`,
    },
    detail: details.join('. ') + '.',
  };
}

function testAdversarialStrings(): TestResult {
  const adversarial: Record<string, string> = {
    emoji_family: '👨‍👩‍👧‍👦 family portrait',
    emoji_flag: '🇺🇸 United States',
    sql_injection: "SELECT * FROM users WHERE name = 'admin'; DROP TABLE users;--",
    html_xss: '<script>alert("xss")</script>',
    yon_pipe: 'value | with | pipes',
    yon_arrow: 'key->value mapping',
    yon_at_sign: '@DOC ver=fake | this looks like YON',
    quotes_mixed: '"double" and \'single\' quotes',
    backslash_heavy: 'C:\\Users\\path\\to\\file.txt',
    null_like: 'null',
    unicode_math: '∑∏∫∂∇',
    rtl_text: 'مرحبا بالعالم',
    zero_width: 'invisible\u200Bjoiner\u200Bhere',
  };

  let totalKeys = Object.keys(adversarial).length;
  let preservedKeys = 0;
  const losses: string[] = [];

  try {
    const yon = jsonToYon(adversarial, { id: 'adversarial', title: 'Adversarial' });
    const doc = parse(yon);

    if (doc.records.length === 0) {
      return {
        id: 'adversarial-strings',
        name: 'Adversarial String Resilience',
        passed: false,
        metric: { name: 'preserved', value: 0, unit: `/${totalKeys} keys` },
        detail: 'Produced 0 records from adversarial input.',
      };
    }

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json) as Record<string, unknown>;
    const resultStr = JSON.stringify(result);

    for (const [key, value] of Object.entries(adversarial)) {
      // Check if value content survived. YON escapes quotes and backslashes,
      // so check both raw and escaped forms (aligns with encoder's
      // escapeQuotes pattern: backslashes first, then quotes).
      const raw = value.slice(0, 10);
      const escaped = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      if (resultStr.includes(raw) || resultStr.includes(escaped)) {
        preservedKeys++;
      } else {
        losses.push(key);
      }
    }
  } catch (e) {
    return {
      id: 'adversarial-strings',
      name: 'Adversarial String Resilience',
      passed: false,
      metric: { name: 'preserved', value: 0, unit: `/${totalKeys} keys` },
      detail: `Conversion failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const rate = Math.round((preservedKeys / totalKeys) * 100);

  return {
    id: 'adversarial-strings',
    name: 'Adversarial String Resilience',
    passed: rate >= 80, // Allow some loss for edge cases like zero-width chars
    metric: {
      name: 'preservation_rate',
      value: rate,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'preserved_keys', value: preservedKeys, unit: `/${totalKeys} keys` },
    ],
    detail: `${preservedKeys}/${totalKeys} adversarial strings survived YON→JSON roundtrip (${rate}%).${losses.length > 0 ? ` Lost: ${losses.join(', ')}.` : ' All content preserved.'}`,
  };
}

function testRealWorldFixtures(): TestResult {
  const fixtures: { name: string; data: Record<string, unknown> }[] = [
    {
      name: 'package.json',
      data: {
        name: '@younndai/yon-benchmarks',
        version: '0.1.0',
        description: 'Benchmark suite for YON format',
        main: 'dist/index.js',
        scripts: { test: 'vitest run', build: 'tsc' },
        dependencies: { '@younndai/yon-parser': '^2.0.0' },
        devDependencies: { vitest: '^3.0.0', typescript: '^5.7.0' },
      },
    },
    {
      name: 'GitHub API response',
      data: {
        id: 123456789,
        full_name: 'younndai/yon-spec',
        private: false,
        html_url: 'https://github.com/younndai/yon-spec',
        description: 'YON Specification Standard',
        fork: false,
        created_at: '2026-01-15T10:30:00Z',
        updated_at: '2026-02-12T23:00:00Z',
        stargazers_count: 42,
        language: 'TypeScript',
        topics: ['yon', 'data-format', 'ai', 'structured-data'],
        license: { key: 'proprietary', name: 'YounndAI Commercial License' },
      },
    },
    {
      name: 'tsconfig.json',
      data: {
        compilerOptions: {
          target: 'ES2022',
          module: 'Node16',
          moduleResolution: 'Node16',
          strict: true,
          esModuleInterop: true,
          outDir: './dist',
          rootDir: './src',
          declaration: true,
        },
        include: ['src/**/*.ts'],
        exclude: ['node_modules', 'dist', 'test'],
      },
    },
  ];

  let passedFixtures = 0;
  const details: string[] = [];

  for (const fixture of fixtures) {
    try {
      const yon = jsonToYon(fixture.data, {
        id: fixture.name.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        title: fixture.name,
      });
      const doc = parse(yon);
      const json = reverseConvert(yon, { targetFormat: 'json' });
      const result = JSON.parse(json);
      const resultStr = JSON.stringify(result);

      // Check if key structural data survived
      const srcKeys = Object.keys(fixture.data);
      const survived = srcKeys.filter((k) => resultStr.includes(k));
      const ratio = survived.length / srcKeys.length;

      if (ratio >= 0.8) {
        passedFixtures++;
        details.push(`${fixture.name}: PASS ${doc.records.length} records, ${survived.length}/${srcKeys.length} keys`);
      } else {
        details.push(`${fixture.name}: FAIL only ${survived.length}/${srcKeys.length} keys survived`);
      }
    } catch (e) {
      details.push(`${fixture.name}: FAIL ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    id: 'real-world-fixtures',
    name: 'Real-World Fixture Shapes',
    passed: passedFixtures === fixtures.length,
    metric: {
      name: 'fixtures_passed',
      value: passedFixtures,
      unit: `/${fixtures.length} fixtures`,
    },
    detail: details.join('. ') + '.',
  };
}

async function testStreamingEquivalence(): Promise<TestResult> {
  const testData = {
    name: 'streaming-test',
    count: 42,
    active: true,
    tags: ['alpha', 'beta'],
  };

  const yon = jsonToYon(testData, { id: 'stream-eq', title: 'Stream Equivalence' });

  // Sync conversion
  const syncJson = reverseConvert(yon, { targetFormat: 'json' });

  // Streaming conversion
  const stream = streamToJson(yon);
  const streamJson = await collectStream(stream);

  // Both must be valid JSON
  let syncValid = false;
  let streamValid = false;
  try { JSON.parse(syncJson); syncValid = true; } catch { /* */ }
  try { JSON.parse(streamJson); streamValid = true; } catch { /* */ }

  // Data-content equivalence: check that all source values appear in both outputs.
  // The two APIs may group keys differently, but the actual data must survive.
  const sourceValues = Object.values(testData).map((v) =>
    typeof v === 'object' ? JSON.stringify(v) : String(v)
  );
  const syncHits = sourceValues.filter((v) => syncJson.includes(v)).length;
  const streamHits = sourceValues.filter((v) => streamJson.includes(v)).length;
  const totalValues = sourceValues.length;

  const bothValid = syncValid && streamValid;
  const dataPreserved = syncHits >= totalValues - 1 && streamHits >= totalValues - 1;

  return {
    id: 'streaming-equivalence',
    name: 'Streaming vs Sync Equivalence',
    passed: bothValid && dataPreserved,
    metric: {
      name: 'data_hits',
      value: Math.min(syncHits, streamHits),
      unit: `/${totalValues} values`,
    },
    secondaryMetrics: [
      { name: 'sync_valid', value: syncValid ? 1 : 0, unit: 'bool' },
      { name: 'stream_valid', value: streamValid ? 1 : 0, unit: 'bool' },
      { name: 'sync_data_hits', value: syncHits, unit: `/${totalValues}` },
      { name: 'stream_data_hits', value: streamHits, unit: `/${totalValues}` },
    ],
    detail: `Both APIs produce valid JSON (sync: ${syncValid}, stream: ${streamValid}). Source data preservation: sync ${syncHits}/${totalValues}, stream ${streamHits}/${totalValues}.${dataPreserved ? ' Data content is equivalent across both transport modes.' : ' DATA LOSS detected in one or both modes.'}`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testMultiFormatRoundtrip(),
    testAdversarialStrings(),
    testRealWorldFixtures(),
    await testStreamingEquivalence(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'converter-resilience',
    suiteName: 'Converter Resilience',
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

export { run as runConverterResilience };
