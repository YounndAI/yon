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
 * @younndai/yon-converter — Forward Conversion Tests
 *
 * Does X → YON produce valid YON?
 * Tests every input format, parser branch, and conversion option.
 */

import { describe, it, expect } from 'vitest';
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { tomlToYon } from '../src/toml/to-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { xmlToYon } from '../src/xml/index.js';
import { iniToYon } from '../src/ini/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// JSON → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('JSON → YON', () => {
  it('converts simple object to YON with @MAP for primitives', () => {
    const input = { name: 'Test', value: 42 };
    const result = jsonToYon(input, { id: 'test-doc', title: 'Test Document' });

    expect(result).toContain('@DOC ver=2.0');
    expect(result).toContain('id=test-doc');
    expect(result).toContain('title="Test Document"');
    expect(result).toContain('@MAP name="data"');
    expect(result).toContain('"name"->"Test"');
    expect(result).toContain('"value"->"42"');
  });

  it('converts array of objects to @MAP records', () => {
    const input = {
      rules: [
        { lvl: 'MUST', when: 'testing', then: 'pass' },
        { lvl: 'SHOULD', when: 'building', then: 'compile' },
      ],
    };
    const result = jsonToYon(input);

    expect(result).toContain('@SEC name="rules"');
    expect(result).toContain('@MAP name="rules_0"');
    expect(result).toContain('"lvl"->"MUST"');
    expect(result).toContain('"when"->"testing"');
  });

  it('converts nested objects to sections', () => {
    const input = { config: { debug: true, level: 3 } };
    const result = jsonToYon(input);

    expect(result).toContain('@DOC');
    expect(result).toContain('@MAP name="config"');
  });

  it('escapes special characters in values', () => {
    const input = { message: 'Hello "World"' };
    const result = jsonToYon(input);
    expect(result).toContain('Hello \\"World\\"');
  });

  it('parses JSON string input', () => {
    const input = JSON.stringify({ settings: { mode: 'test' } });
    const result = jsonToYon(input);

    expect(result).toContain('@DOC');
    expect(result).toContain('@MAP name="settings"');
    expect(result).toContain('mode');
  });

  it('throws on circular reference', () => {
    const obj: Record<string, unknown> = { name: 'test' };
    obj.self = obj;
    expect(() => jsonToYon(obj)).toThrow('Circular reference');
  });

  it('escapes newlines in strings', () => {
    const input = { message: 'Line 1\nLine 2' };
    const result = jsonToYon(input);
    expect(result).toContain('Line 1\\nLine 2');
  });

  it('accepts plain JSON string', () => {
    const jsonStr = '{"name":"Alice","age":30}';
    const yon = jsonToYon(jsonStr, { id: 'str', title: 'StringInput' });
    expect(yon).toContain('Alice');
    expect(yon).toContain('30');
  });

  it('accepts pretty-printed JSON string', () => {
    const jsonStr = `{
  "name": "Alice",
  "age": 30,
  "active": true
}`;
    const yon = jsonToYon(jsonStr, { id: 'pretty', title: 'Pretty' });
    expect(yon).toContain('Alice');
  });

  it('matrix data (2D array) uses @BEGIN JSON', () => {
    const input = { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] };
    const yon = jsonToYon(input, { id: 'matrix', title: 'Matrix' });
    expect(yon).toContain('@BEGIN JSON');
  });

  it('array of mixed types', () => {
    const input = { items: ['string', 42, true, null, { nested: 'obj' }] };
    const yon = jsonToYon(input, { id: 'mixarr', title: 'MixArray' });
    expect(yon).toContain('@DOC');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// YAML → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('YAML → YON', () => {
  it('converts simple YAML to YON', () => {
    const input = `
name: Test
version: 1
enabled: true
`;
    const result = yamlToYon(input, { id: 'yaml-test', title: 'YAML Test' });

    expect(result).toContain('@DOC ver=2.0');
    expect(result).toContain('id=yaml-test');
    expect(result).toContain('title="YAML Test"');
  });

  it('converts nested YAML to YON sections', () => {
    const input = `
config:
  debug: true
  level: 3
`;
    const result = yamlToYon(input);
    expect(result).toContain('@MAP name="config"');
  });

  it('converts YAML arrays to @MAP records', () => {
    const input = `
rules:
  - lvl: MUST
    when: testing
  - lvl: SHOULD
    when: building
`;
    const result = yamlToYon(input);

    expect(result).toContain('@SEC name="rules"');
    expect(result).toContain('@MAP name="rules_0"');
    expect(result).toContain('"lvl"->"MUST"');
  });

  it('handles YAML with special characters', () => {
    const input = `
message: "Hello \\"World\\""
path: /usr/local/bin
`;
    const result = yamlToYon(input);
    expect(result).toContain('Hello');
    expect(result).toContain('/usr/local/bin');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TOML → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('TOML → YON', () => {
  it('converts simple TOML to YON', () => {
    const input = `
name = "Test"
version = 1
enabled = true
`;
    const result = tomlToYon(input, { id: 'toml-test', title: 'TOML Test' });

    expect(result).toContain('@DOC ver=2.0');
    expect(result).toContain('id=toml-test');
    expect(result).toContain('title="TOML Test"');
  });

  it('converts TOML tables to YON sections', () => {
    const input = `
[config]
debug = true
level = 3
`;
    const result = tomlToYon(input);
    expect(result).toContain('@MAP name="config"');
  });

  it('converts TOML array of tables to @MAP records', () => {
    const input = `
[[rules]]
lvl = "MUST"
when = "testing"

[[rules]]
lvl = "SHOULD"
when = "building"
`;
    const result = tomlToYon(input);

    expect(result).toContain('@SEC name="rules"');
    expect(result).toContain('@MAP name="rules_0"');
    expect(result).toContain('"lvl"->"MUST"');
  });

  it('handles TOML with special values', () => {
    const input = `
message = "Hello World"
count = 42
ratio = 3.14
`;
    const result = tomlToYon(input);
    expect(result).toContain('Hello World');
    expect(result).toContain('42');
    expect(result).toContain('3.14');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CSV → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('CSV → YON', () => {
  it('converts CSV with headers to YON', () => {
    const csv = `name,age,city
Alice,30,NYC
Bob,25,LA`;
    const result = csvToYon(csv);

    expect(result).toContain('@DOC');
    expect(result).toContain('records');
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
  });

  it('handles quoted fields', () => {
    const csv = `name,description
Test,"A ""quoted"" value"`;
    const result = csvToYon(csv);
    expect(result).toContain('quoted');
  });

  it('headers=false returns array-based data', () => {
    const csv = 'Alice,30,NYC\nBob,25,LA';
    const yon = csvToYon(csv, { headers: false });
    expect(yon).toContain('@DOC');
    expect(yon).toContain('Alice');
    expect(yon).toContain('Bob');
  });

  it('custom quote character (single quote)', () => {
    const csv = "name,city\n'Alice','New York'\n'Bob','LA'";
    const yon = csvToYon(csv, { quote: "'" });
    expect(yon).toContain('Alice');
    expect(yon).toContain('New York');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// XML → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('XML → YON', () => {
  it('converts simple XML to YON', () => {
    const xml = `<?xml version="1.0"?>
<config>
  <database host="localhost" port="5432"/>
</config>`;
    const result = xmlToYon(xml);

    expect(result).toContain('@DOC');
    expect(result).toContain('database');
    expect(result).toContain('localhost');
  });

  it('handles text content', () => {
    const xml = `<message>Hello World</message>`;
    const result = xmlToYon(xml);
    expect(result).toContain('Hello');
  });

  it('skips XML comments', () => {
    const xml = '<?xml version="1.0"?><root><!-- This is a comment --><item>value</item></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('value');
    expect(yon).not.toContain('This is a comment');
  });

  it('handles CDATA sections', () => {
    const xml = '<?xml version="1.0"?><root><code><![CDATA[if (x < 10 && y > 5) { return true; }]]></code></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('return true');
  });

  it('skips DOCTYPE declarations', () => {
    const xml = '<!DOCTYPE html><root><item>value</item></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('value');
  });

  it('decodes numeric character references (decimal)', () => {
    const xml = '<?xml version="1.0"?><root><msg>Hello&#33;</msg></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('Hello!');
  });

  it('decodes numeric character references (hex)', () => {
    const xml = '<?xml version="1.0"?><root><msg>Hello&#x21;</msg></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('Hello!');
  });

  it('handles all 5 standard XML entities', () => {
    const xml = '<?xml version="1.0"?><root><data>&lt;tag&gt; &amp; &apos;quoted&apos; &quot;double&quot;</data></root>';
    const yon = xmlToYon(xml);
    expect(yon).toContain('<tag>');
    expect(yon).toContain('&');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INI → YON
// ═══════════════════════════════════════════════════════════════════════════

describe('INI → YON', () => {
  it('converts simple INI to YON', () => {
    const ini = `
[database]
host = localhost
port = 5432

[cache]
enabled = true
    `;
    const result = iniToYon(ini);

    expect(result).toContain('@DOC');
    expect(result).toContain('database');
    expect(result).toContain('host');
    expect(result).toContain('localhost');
  });

  it('handles key-value without section', () => {
    const ini = `
name = test
value = 123
    `;
    const result = iniToYon(ini);
    expect(result).toContain('@DOC');
    expect(result).toContain('default');
  });

  it('double-quoted values', () => {
    const ini = '[section]\npath = "C:\\Program Files\\App"\nname = "value with spaces"\n';
    const yon = iniToYon(ini);
    expect(yon).toContain('C:\\\\Program Files\\\\App');
    expect(yon).toContain('value with spaces');
  });

  it('single-quoted values', () => {
    const ini = "[section]\npath = 'some value'\n";
    const yon = iniToYon(ini);
    expect(yon).toContain('some value');
  });
});
