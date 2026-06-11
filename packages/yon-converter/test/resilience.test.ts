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
 * @younndai/yon-converter — Resilience Tests
 *
 * Does the converter survive chaos?
 * Tests scale, pathological strings, adversarial keys, real-world fixtures,
 * streaming under pressure, and edge cases for every format.
 */

import { describe, it, expect } from 'vitest';
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { xmlToYon } from '../src/xml/index.js';
import { iniToYon } from '../src/ini/index.js';
import { reverseConvert } from '../src/reverse.js';
import {
  streamToJson,
  streamToYaml,
  collectStream,
} from '../src/streaming.js';

// ═══════════════════════════════════════════════════════════════════════════
// Scale
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: scale', () => {
  it('100-key wide object survives round-trip', () => {
    const input: Record<string, unknown> = {};
    for (let i = 0; i < 100; i++) {
      input[`field_${i}`] = `value_${i}`;
    }
    const yon = jsonToYon(input, { id: 'wide', title: 'Wide' });
    expect(yon).toContain('@DOC');
    expect(yon).toContain('field_0');
    expect(yon).toContain('field_99');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('value_0');
    expect(jsonStr).toContain('value_99');
  });

  it('50-record array survives round-trip', () => {
    const records = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: `user_${i}`,
      email: `user_${i}@example.com`,
      active: i % 2 === 0,
    }));
    const input = { users: records };
    const yon = jsonToYon(input, { id: 'tall', title: 'Tall' });
    expect(yon).toContain('user_0');
    expect(yon).toContain('user_49');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const jsonStr = JSON.stringify(JSON.parse(json));
    expect(jsonStr).toContain('user_0');
    expect(jsonStr).toContain('user_49');
  });

  it('100KB+ JSON payload', () => {
    const input: Record<string, unknown> = {};
    for (let i = 0; i < 200; i++) {
      input[`key_${i}`] = 'x'.repeat(600);
    }
    const yon = jsonToYon(input, { id: 'big', title: 'Big' });
    expect(yon.length).toBeGreaterThan(100_000);

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const parsed = JSON.parse(json);
    expect(typeof parsed).toBe('object');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Pathological strings
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: pathological strings', () => {
  it('control characters (tab, CR, null-like)', () => {
    const input = {
      withTab: 'before\tafter',
      withCR: 'line1\rline2',
      withFormFeed: 'a\fb',
    };
    const yon = jsonToYon(input, { id: 'ctrl', title: 'Ctrl' });
    expect(yon).toContain('@DOC');
  });

  it('zero-width joiners and invisible characters', () => {
    const input = {
      zwj: 'a\u200Db',
      zws: 'a\u200Bb',
      bom: '\uFEFFcontent',
      rtl: '\u200Fright-to-left',
      ltr: '\u200Eleft-to-right',
    };
    const yon = jsonToYon(input, { id: 'invis', title: 'Invisible' });
    expect(yon).toContain('@DOC');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    expect(typeof JSON.parse(json)).toBe('object');
  });

  it('emoji sequences and multi-byte', () => {
    const input = {
      family: '👨‍👩‍👧‍👦',
      flag: '🇺🇸',
      skin: '👋🏽',
      combo: '☀️🌙⭐🌈',
      math: '∑∏∫∂√∞',
    };
    const yon = jsonToYon(input, { id: 'emoji', title: 'Emoji' });
    expect(yon).toContain('👨‍👩‍👧‍👦');
    expect(yon).toContain('🇺🇸');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.family).toBe('👨‍👩‍👧‍👦');
    expect(result.flag).toBe('🇺🇸');
  });

  it('strings that look like code', () => {
    const input = {
      sql: "SELECT * FROM users WHERE name = 'admin'; DROP TABLE users;--",
      js: 'function() { return eval("alert(1)"); }',
      html: '<script>alert("xss")</script>',
      regex: '^(?:(?:25[0-5]|2[0-4][0-9])\\.){3}(?:25[0-5]|2[0-4][0-9])$',
      path: 'C:\\Users\\Admin\\Documents\\..\\..\\secret.txt',
    };
    const yon = jsonToYon(input, { id: 'code', title: 'Code' });
    expect(yon).toContain('@DOC');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.sql).toContain('DROP TABLE');
    expect(result.html).toContain('<script>');
  });

  it('multi-line strings with mixed line endings', () => {
    const input = {
      unix: 'line1\nline2\nline3',
      windows: 'line1\r\nline2\r\nline3',
      mac: 'line1\rline2\rline3',
      mixed: 'line1\nline2\r\nline3\rline4',
    };
    const yon = jsonToYon(input, { id: 'newlines', title: 'Newlines' });
    expect(yon).toContain('@DOC');
  });

  it('strings with YON-significant characters', () => {
    const input = {
      pipe: 'value | with | pipes',
      arrow: 'key->value',
      at: '@DOC ver=fake',
      quotes: '"double" and \'single\'',
      brackets: '[array] and (parens)',
      equals: 'key=value pairs',
      hash: '# comment-like',
    };
    const yon = jsonToYon(input, { id: 'yon-chars', title: 'YON Chars' });
    expect(yon).toContain('@DOC');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.pipe).toContain('|');
    expect(result.arrow).toContain('->');
    expect(result.at).toContain('@DOC');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Adversarial keys
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: adversarial keys', () => {
  it('dots, brackets, and nesting characters in keys', () => {
    const input = {
      'server.host': 'localhost',
      'db[0].name': 'primary',
      'config->setting': 'value',
      'key with spaces and (parens)': 'data',
    };
    const yon = jsonToYon(input, { id: 'dotkeys', title: 'DotKeys' });
    expect(yon).toContain('localhost');
    expect(yon).toContain('primary');
  });

  it('empty string key', () => {
    const input = { '': 'empty-key-value' };
    const yon = jsonToYon(input, { id: 'emptykey', title: 'EmptyKey' });
    expect(yon).toContain('empty-key-value');
  });

  it('keys that clash with YON syntax', () => {
    const input = {
      name: 'safe',
      id: 'safe-id',
      pairs: 'not-pairs',
      tag: 'not-a-tag',
      RULE: 'not-a-rule',
    };
    const yon = jsonToYon(input, { id: 'clash', title: 'Clash' });
    expect(yon).toContain('safe');
    expect(yon).toContain('not-pairs');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Real-world JSON fixtures
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: real-world JSON patterns', () => {
  it('package.json-shaped data', () => {
    const pkg = {
      name: '@younndai/yon-converter',
      version: '1.5.0',
      description: 'Universal format converter for YON',
      main: './dist/index.js',
      types: './dist/index.d.ts',
      scripts: {
        build: 'tsup src/index.ts --format esm,cjs --dts',
        test: 'vitest run',
        lint: 'eslint src/',
        dev: 'vitest --watch',
      },
      dependencies: {
        '@younndai/yon-parser': '^1.5.0',
        yaml: '^2.7.0',
        'smol-toml': '^1.3.1',
        'fast-xml-parser': '^5.0.0',
      },
      devDependencies: {
        vitest: '^3.2.4',
        typescript: '^5.7.0',
        tsup: '^8.0.0',
      },
      keywords: ['yon', 'converter', 'json', 'yaml', 'toml'],
      license: 'SEE LICENSE IN LICENSE',
      repository: {
        type: 'git',
        url: 'https://github.com/younndai/yon-converter',
      },
    };
    const yon = jsonToYon(pkg, { id: 'pkg', title: 'Package' });
    expect(yon).toContain('@DOC');
    expect(yon).toContain('yon-converter');
    expect(yon).toContain('vitest');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('@younndai/yon-converter');
    expect(jsonStr).toContain('1.5.0');
  });

  it('tsconfig.json-shaped data', () => {
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'Node16',
        moduleResolution: 'Node16',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        outDir: './dist',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        lib: ['ES2022'],
        types: ['node', 'vitest/globals'],
      },
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist', 'test'],
    };
    const yon = jsonToYon(tsconfig, { id: 'tsconfig', title: 'TSConfig' });
    expect(yon).toContain('ES2022');
    expect(yon).toContain('Node16');
  });

  it('GitHub API response-shaped data', () => {
    const ghResponse = {
      id: 123456789,
      node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NTY3ODk=',
      name: 'yon-converter',
      full_name: 'younndai/yon-converter',
      private: false,
      owner: {
        login: 'younndai',
        id: 987654,
        avatar_url: 'https://avatars.githubusercontent.com/u/987654?v=4',
        type: 'Organization',
      },
      html_url: 'https://github.com/younndai/yon-converter',
      description: 'Universal format converter for YON',
      fork: false,
      url: 'https://api.github.com/repos/younndai/yon-converter',
      created_at: '2026-01-15T10:30:00Z',
      updated_at: '2026-02-10T00:00:00Z',
      pushed_at: '2026-02-09T23:00:00Z',
      stargazers_count: 42,
      watchers_count: 42,
      language: 'TypeScript',
      has_issues: true,
      has_projects: false,
      has_wiki: false,
      topics: ['yon', 'converter', 'data-format', 'interoperability'],
      default_branch: 'main',
      license: {
        key: 'custom',
        name: 'YON Commercial License',
        spdx_id: 'NOASSERTION',
        url: null,
      },
    };
    const yon = jsonToYon(ghResponse, { id: 'gh', title: 'GitHub' });
    expect(yon).toContain('younndai');
    expect(yon).toContain('yon-converter');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('younndai');
    expect(jsonStr).toContain('TypeScript');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Streaming under pressure
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: streaming', () => {
  it('tiny chunkSize (8 bytes) on large doc', async () => {
    const input: Record<string, unknown> = {};
    for (let i = 0; i < 50; i++) {
      input[`field_${i}`] = `value_${i}_data`;
    }
    const yon = jsonToYon(input, { id: 'chunked', title: 'Chunked' });

    const stream = streamToJson(yon, { chunkSize: 8 });
    const result = await collectStream(stream);
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).toContain('field_0');
    expect(jsonStr).toContain('field_49');
  });

  it('single-byte chunkSize produces many chunks', async () => {
    const yon = `@DOC ver=2.0 | id=micro | title="Micro"
@MAP name="data" | pairs=["a"->"1","b"->"2"]`;
    const stream = streamToJson(yon, { chunkSize: 1 });
    let chunkCount = 0;
    for await (const chunk of stream) {
      chunkCount++;
      expect(chunk.content.length).toBeLessThanOrEqual(1);
    }
    expect(chunkCount).toBeGreaterThan(10);
  });

  it('concurrent streaming (3 parallel streams)', async () => {
    const yon1 = `@DOC ver=2.0 | id=s1 | title="S1"\n@MAP name="data" | pairs=["x"->"1"]`;
    const yon2 = `@DOC ver=2.0 | id=s2 | title="S2"\n@MAP name="data" | pairs=["y"->"2"]`;
    const yon3 = `@DOC ver=2.0 | id=s3 | title="S3"\n@MAP name="data" | pairs=["z"->"3"]`;

    const [r1, r2, r3] = await Promise.all([
      collectStream(streamToJson(yon1)),
      collectStream(streamToYaml(yon2)),
      collectStream(streamToJson(yon3)),
    ]);

    expect(JSON.parse(r1)).toBeDefined();
    expect(r2).toContain('2');
    expect(JSON.parse(r3)).toBeDefined();
  });

  it('streaming large YAML output', async () => {
    const bigYon = Array.from({ length: 20 }, (_, i) =>
      `@MAP name="item_${i}" | pairs=["name"->"item_${i}","value"->"${i}","desc"->"Description for item ${i}"]`
    ).join('\n');
    const yon = `@DOC ver=2.0 | id=bigyaml | title="Big YAML"\n${bigYon}`;

    const result = await collectStream(streamToYaml(yon, { chunkSize: 64 }));
    expect(result).toContain('item_0');
    expect(result).toContain('item_19');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CSV edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: CSV edge cases', () => {
  it('CSV with inconsistent columns', () => {
    const csv = 'name,age,city\nAlice,30\nBob,25,LA,extra\nCarol';
    const yon = csvToYon(csv);
    expect(yon).toContain('@DOC');
  });

  it('CSV with all-quoted fields', () => {
    const csv = '"name","age","city"\n"Alice","30","New York"\n"Bob","25","Los Angeles"';
    const yon = csvToYon(csv);
    expect(yon).toContain('Alice');
    expect(yon).toContain('New York');
  });

  it('CSV with embedded newlines in quoted fields', () => {
    const csv = 'name,bio\nAlice,"Line 1\nLine 2\nLine 3"\nBob,"Simple"';
    const yon = csvToYon(csv);
    expect(yon).toContain('Alice');
  });

  it('TSV (tab-separated values)', () => {
    const tsv = 'name\tage\tcity\nAlice\t30\tNYC\nBob\t25\tLA';
    const yon = csvToYon(tsv, { delimiter: '\t' });
    expect(yon).toContain('Alice');
    expect(yon).toContain('NYC');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// XML edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: XML edge cases', () => {
  it('deeply nested XML (10 levels)', () => {
    let xml = '<?xml version="1.0"?>';
    const tags: string[] = [];
    for (let i = 0; i < 10; i++) {
      const tag = `level${i}`;
      tags.push(tag);
      xml += `<${tag}>`;
    }
    xml += 'deep-value';
    for (let i = tags.length - 1; i >= 0; i--) {
      xml += `</${tags[i]}>`;
    }
    const yon = xmlToYon(xml);
    expect(yon).toContain('deep-value');
  });

  it('XML with CDATA-like content', () => {
    const xml = '<?xml version="1.0"?><root><code>if (x &lt; 10 &amp;&amp; y &gt; 5)</code></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('@DOC');
  });

  it('XML with mixed content (text + elements)', () => {
    const xml = '<?xml version="1.0"?><root><p>Hello <b>world</b> today</p></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('world');
  });

  it('XML with namespaced elements', () => {
    const xml = '<?xml version="1.0"?><ns:root xmlns:ns="http://example.com"><ns:item>value</ns:item></ns:root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('value');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INI edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: INI edge cases', () => {
  it('INI with comments and blank lines', () => {
    const ini = `; This is a comment
[database]
host = localhost
; port is optional
port = 5432

[cache]
enabled = true
`;
    const yon = iniToYon(ini);
    expect(yon).toContain('localhost');
    expect(yon).toContain('5432');
  });

  it('INI with duplicate keys in different sections', () => {
    const ini = `[dev]
host = dev.example.com
port = 3000

[prod]
host = prod.example.com
port = 443
`;
    const yon = iniToYon(ini);
    expect(yon).toContain('dev.example.com');
    expect(yon).toContain('prod.example.com');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// YAML real-world
// ═══════════════════════════════════════════════════════════════════════════

describe('Resilience: YAML real-world', () => {
  it('Docker Compose-shaped YAML', () => {
    const yaml = `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      NODE_ENV: production
      DEBUG: "false"
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret123
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
`;
    const yon = yamlToYon(yaml, { id: 'docker', title: 'Docker' });
    expect(yon).toContain('nginx');
    expect(yon).toContain('postgres');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('nginx:alpine');
    expect(jsonStr).toContain('postgres:15');
  });

  it('GitHub Actions-shaped YAML', () => {
    const yaml = `name: CI
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
`;
    const yon = yamlToYon(yaml, { id: 'gha', title: 'GH Actions' });
    expect(yon).toContain('checkout');
    expect(yon).toContain('ubuntu-latest');
  });
});
