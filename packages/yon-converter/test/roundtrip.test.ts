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
 * @younndai/yon-converter — Round-Trip Fidelity Tests
 *
 * Does X → YON → X preserve semantics?
 * Tests every format's round-trip path, type fidelity via __str__ sentinels,
 * and industrial precision for financial, date, and edge-case data.
 */

import { describe, it, expect } from 'vitest';
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { tomlToYon } from '../src/toml/to-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { xmlToYon } from '../src/xml/index.js';
import { iniToYon } from '../src/ini/index.js';
import { reverseConvert } from '../src/reverse.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRoundTrip(input: Record<string, unknown>, label: string) {
  const yon = jsonToYon(input, { id: `rt-${label}`, title: `RT ${label}` });
  const json = reverseConvert(yon, { targetFormat: 'json' });
  return JSON.parse(json);
}

// ═══════════════════════════════════════════════════════════════════════════
// JSON ↔ YON
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: JSON', () => {
  it('flat object with string and number', () => {
    const input = { name: 'Alice', age: 30 };
    const result = jsonRoundTrip(input, 'flat');
    expect(result.name).toBe('Alice');
    expect(Number(result.age)).toBe(30);
  });

  it('nested object (2 levels)', () => {
    const input = { server: { host: 'localhost', port: 5432 } };
    const result = jsonRoundTrip(input, 'nested');
    expect(result.server).toBeDefined();
    expect(result.server.host).toBe('localhost');
    expect(Number(result.server.port)).toBe(5432);
  });

  it('array of simple objects', () => {
    const input = {
      users: [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' },
      ],
    };
    const result = jsonRoundTrip(input, 'array');
    expect(result.users).toBeDefined();
    const users = Array.isArray(result.users) ? result.users : Object.values(result.users);
    expect(users.length).toBe(2);
  });

  it('mixed primitive types', () => {
    const input = { str: 'hello', num: 42, float: 3.14, bool: true, nil: null };
    const result = jsonRoundTrip(input, 'mixed');

    expect(result.str).toBe('hello');
    expect(String(result.num)).toBe('42');
    expect(String(result.float)).toBe('3.14');
    expect(String(result.bool)).toBe('true');
    expect(String(result.nil)).toBe('null');
  });

  it('empty object produces valid YON', () => {
    const yon = jsonToYon({}, { id: 'empty', title: 'Empty' });
    expect(yon).toContain('@DOC');
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(typeof result).toBe('object');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// YAML → YON → JSON
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: YAML → YON → JSON', () => {
  it('flat YAML', () => {
    const yaml = 'name: Alice\nage: 30\nactive: true\n';
    const yon = yamlToYon(yaml, { id: 'yaml-rt', title: 'YAML RT' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.name).toBe('Alice');
    expect(Number(result.age)).toBe(30);
  });

  it('nested YAML', () => {
    const yaml = 'database:\n  host: localhost\n  port: 5432\n';
    const yon = yamlToYon(yaml, { id: 'yaml-nested', title: 'YAML Nested' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.database).toBeDefined();
    expect(result.database.host).toBe('localhost');
  });

  it('YAML arrays', () => {
    const yaml = 'items:\n  - foo\n  - bar\n  - baz\n';
    const yon = yamlToYon(yaml, { id: 'yaml-arr', title: 'YAML Array' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('foo');
    expect(jsonStr).toContain('bar');
    expect(jsonStr).toContain('baz');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TOML → YON → JSON
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: TOML → YON → JSON', () => {
  it('simple key/value', () => {
    const toml = 'name = "Alice"\nage = 30\n';
    const yon = tomlToYon(toml, { id: 'toml-rt', title: 'TOML RT' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.name).toBe('Alice');
    expect(Number(result.age)).toBe(30);
  });

  it('TOML tables', () => {
    const toml = '[database]\nhost = "localhost"\nport = 5432\n';
    const yon = tomlToYon(toml, { id: 'toml-tbl', title: 'TOML Table' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.database).toBeDefined();
    expect(result.database.host).toBe('localhost');
  });

  it('TOML array of tables', () => {
    const toml = '[[servers]]\nname = "alpha"\ndc = "us-east"\n\n[[servers]]\nname = "beta"\ndc = "eu-west"\n';
    const yon = tomlToYon(toml, { id: 'toml-aot', title: 'TOML AOT' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    const jsonStr = JSON.stringify(result);
    expect(jsonStr).toContain('alpha');
    expect(jsonStr).toContain('beta');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CSV → YON → JSON
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: CSV', () => {
  it('headers and rows survive round-trip', () => {
    const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const yon = csvToYon(csv);
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const jsonStr = JSON.stringify(JSON.parse(json));
    expect(jsonStr).toContain('Alice');
    expect(jsonStr).toContain('Bob');
    expect(jsonStr).toContain('NYC');
  });

  it('quoted fields with commas', () => {
    const csv = 'name,address\nAlice,"123 Main St, Apt 4"\nBob,"456 Elm Dr"';
    const yon = csvToYon(csv);
    expect(yon).toContain('Alice');
    expect(yon).toContain('Bob');
    const json = reverseConvert(yon, { targetFormat: 'json' });
    expect(JSON.stringify(JSON.parse(json))).toContain('Alice');
  });

  it('single column data', () => {
    const csv = 'value\n10\n20\n30';
    const yon = csvToYon(csv);
    expect(yon).toContain('@DOC');
    expect(yon).toContain('10');
    expect(yon).toContain('30');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// XML → YON → XML
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: XML', () => {
  it('elements survive round-trip', () => {
    const xml = '<?xml version="1.0"?><config><host>localhost</host><port>5432</port></config>';
    const yon = xmlToYon(xml);
    const xmlOut = reverseConvert(yon, { targetFormat: 'xml' });
    expect(xmlOut).toContain('<?xml');
    expect(xmlOut).toContain('localhost');
    expect(xmlOut).toContain('5432');
  });

  it('attributes survive round-trip', () => {
    const xml = '<?xml version="1.0"?><server name="alpha" dc="us-east"/>';
    const yon = xmlToYon(xml);
    const xmlOut = reverseConvert(yon, { targetFormat: 'xml' });
    expect(xmlOut).toContain('alpha');
    expect(xmlOut).toContain('us-east');
  });

  it('nested elements', () => {
    const xml = '<?xml version="1.0"?><root><parent><child>value</child></parent></root>';
    const yon = xmlToYon(xml);
    const xmlOut = reverseConvert(yon, { targetFormat: 'xml' });
    expect(xmlOut).toContain('value');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INI → YON → INI
// ═══════════════════════════════════════════════════════════════════════════

describe('Round-trip: INI', () => {
  it('sections with key/value survive round-trip', () => {
    const ini = '[database]\nhost = localhost\nport = 5432\n\n[cache]\nenabled = true\n';
    const yon = iniToYon(ini);
    const iniOut = reverseConvert(yon, { targetFormat: 'ini' });
    expect(iniOut).toContain('database');
    expect(iniOut).toContain('localhost');
    expect(iniOut).toContain('5432');
    expect(iniOut).toContain('cache');
  });

  it('sectionless key/value', () => {
    const ini = 'name = test\nversion = 1\n';
    const yon = iniToYon(ini);
    const iniOut = reverseConvert(yon, { targetFormat: 'ini' });
    expect(iniOut).toContain('test');
  });

  it('boolean and numeric values', () => {
    const ini = '[settings]\ndebug = true\ntimeout = 30\nratio = 3.14\n';
    const yon = iniToYon(ini);
    const iniOut = reverseConvert(yon, { targetFormat: 'ini' });
    expect(iniOut).toContain('true');
    expect(iniOut).toContain('30');
    expect(iniOut).toContain('3.14');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Type Fidelity — coerceValue + __str__ sentinel
// ═══════════════════════════════════════════════════════════════════════════

describe('Type fidelity', () => {
  it('__str__ prefix preserves strings that look like booleans', () => {
    const input = { is_true: 'true', is_false: 'false' };
    const yon = jsonToYon(input, { id: 'coerce', title: 'Coerce' });
    expect(yon).toContain('__str__true');
    expect(yon).toContain('__str__false');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.is_true).toBe('true');
    expect(result.is_false).toBe('false');
    expect(typeof result.is_true).toBe('string');
    expect(typeof result.is_false).toBe('string');
  });

  it('__str__ prefix preserves strings that look like numbers', () => {
    const input = { zip: '00100', phone: '0612345678', code: '007' };
    const yon = jsonToYon(input, { id: 'numstr', title: 'NumStr' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);

    expect(result.zip).toBe('00100');
    expect(result.phone).toBe('0612345678');
    expect(result.code).toBe('007');
    expect(typeof result.zip).toBe('string');
  });

  it('__str__ prefix preserves "null" string', () => {
    const input = { val: 'null' };
    const yon = jsonToYon(input, { id: 'strnull', title: 'StrNull' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.val).toBe('null');
    expect(typeof result.val).toBe('string');
  });

  it('actual null coerces to null', () => {
    const input = { nothing: null };
    const yon = jsonToYon(input, { id: 'realnull', title: 'RealNull' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.nothing).toBeNull();
  });

  it('actual booleans coerce back to booleans', () => {
    const input = { yes: true, no: false };
    const yon = jsonToYon(input, { id: 'bools', title: 'Bools' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.yes).toBe(true);
    expect(result.no).toBe(false);
    expect(typeof result.yes).toBe('boolean');
    expect(typeof result.no).toBe('boolean');
  });

  it('numeric strings coerce to numbers', () => {
    const input = { count: 42, rate: 3.14 };
    const yon = jsonToYon(input, { id: 'nums', title: 'Nums' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.count).toBe(42);
    expect(result.rate).toBe(3.14);
    expect(typeof result.count).toBe('number');
  });

  it('empty string stays empty string', () => {
    const input = { blank: '' };
    const yon = jsonToYon(input, { id: 'empty', title: 'Empty' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.blank).toBe('');
    expect(typeof result.blank).toBe('string');
  });

  it('mixed type object preserves all types through round-trip', () => {
    const input = {
      str: 'hello', num: 42, float: 3.14,
      bool_t: true, bool_f: false, nil: null,
      str_true: 'true', str_false: 'false', str_null: 'null',
      str_num: '42', str_zero: '0', empty: '',
    };
    const yon = jsonToYon(input, { id: 'mixed', title: 'Mixed' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);

    expect(result.str).toBe('hello');
    expect(typeof result.str).toBe('string');
    expect(result.num).toBe(42);
    expect(typeof result.num).toBe('number');
    expect(result.float).toBe(3.14);
    expect(result.bool_t).toBe(true);
    expect(typeof result.bool_t).toBe('boolean');
    expect(result.bool_f).toBe(false);
    expect(result.nil).toBeNull();
    expect(result.str_true).toBe('true');
    expect(typeof result.str_true).toBe('string');
    expect(result.str_false).toBe('false');
    expect(typeof result.str_false).toBe('string');
    expect(result.str_null).toBe('null');
    expect(typeof result.str_null).toBe('string');
    expect(result.str_num).toBe('42');
    expect(typeof result.str_num).toBe('string');
    expect(result.str_zero).toBe('0');
    expect(typeof result.str_zero).toBe('string');
    expect(result.empty).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Industrial Precision — Financial & Date Data
// ═══════════════════════════════════════════════════════════════════════════

describe('Industrial precision', () => {
  it('currency values survive round-trip', () => {
    const input = { prices: { item_a: 49.99, item_b: 1299.00, tax_rate: 0.0825, total: 1460.1675 } };
    const yon = jsonToYon(input, { id: 'fin', title: 'Financial' });
    expect(yon).toContain('49.99');
    expect(yon).toContain('0.0825');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const jsonStr = JSON.stringify(JSON.parse(json));
    expect(jsonStr).toContain('49.99');
    expect(jsonStr).toContain('0.0825');
  });

  it('very large and very small numbers', () => {
    const input = { large: 999999999999, small: 0.000001, negative: -42.5, zero: 0 };
    const yon = jsonToYon(input, { id: 'nums', title: 'Numbers' });
    expect(yon).toContain('999999999999');
    expect(yon).toContain('0.000001');
    expect(yon).toContain('-42.5');
  });

  it('ISO 8601 dates survive round-trip', () => {
    const input = {
      created: '2026-02-10T01:03:15Z',
      updated: '2026-02-09T23:00:00+02:00',
      date_only: '2026-02-10',
    };
    const yon = jsonToYon(input, { id: 'dates', title: 'Dates' });
    expect(yon).toContain('2026-02-10T01:03:15Z');
    expect(yon).toContain('2026-02-09T23:00:00+02:00');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.created).toBe('2026-02-10T01:03:15Z');
  });

  it('Unix timestamps and epoch', () => {
    const input = { unix: 1739145795, epoch_ms: 1739145795000 };
    const yon = jsonToYon(input, { id: 'epoch', title: 'Epoch' });
    expect(yon).toContain('1739145795');
  });

  it('boolean values in different string representations', () => {
    const input = {
      bool_true: true, bool_false: false,
      str_true: 'true', str_false: 'false',
      str_yes: 'yes', str_no: 'no',
    };
    const yon = jsonToYon(input, { id: 'bools', title: 'Booleans' });
    expect(yon).toContain('__str__true');
    expect(yon).toContain('__str__false');
  });

  it('null and undefined handling', () => {
    const input = { explicit_null: null, empty_str: '', zero: 0, false_val: false };
    const yon = jsonToYon(input, { id: 'nulls', title: 'Nulls' });
    expect(yon).toContain('@DOC');
    expect(yon).toContain('null');
  });

  it('very long keys (256 chars)', () => {
    const longKey = 'k'.repeat(256);
    const input = { [longKey]: 'value' };
    const yon = jsonToYon(input, { id: 'longkey', title: 'LongKey' });
    expect(yon).toContain('value');
  });

  it('empty string values', () => {
    const input = { name: '', label: '', desc: '' };
    const yon = jsonToYon(input, { id: 'emptyval', title: 'EmptyVal' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(typeof result).toBe('object');
  });

  it('whitespace-only values', () => {
    const input = { spaces: '   ', tabs: '\t\t', mixed: ' \t \n ' };
    const yon = jsonToYon(input, { id: 'ws', title: 'Whitespace' });
    expect(yon).toContain('@DOC');
  });

  it('values that look like numbers but are strings', () => {
    const input = { phone: '0612345678', zip: '00100', code: '007', ssn: '123-45-6789' };
    const yon = jsonToYon(input, { id: 'numstr', title: 'NumString' });
    expect(yon).toContain('__str__0612345678');
    expect(yon).toContain('__str__00100');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.phone).toBe('0612345678');
    expect(result.zip).toBe('00100');
    expect(result.code).toBe('007');
  });

  it('IEEE 754 edge cases', () => {
    const input = {
      infinity: 'Infinity', neg_infinity: '-Infinity', nan: 'NaN',
      max_safe: Number.MAX_SAFE_INTEGER, min_safe: Number.MIN_SAFE_INTEGER,
    };
    const yon = jsonToYon(input, { id: 'ieee', title: 'IEEE' });
    expect(yon).toContain('@DOC');
    expect(yon).toContain('9007199254740991');
  });

  it('matrix data survives round-trip', () => {
    const input = { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] };
    const yon = jsonToYon(input, { id: 'matrix', title: 'Matrix' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const jsonStr = JSON.stringify(JSON.parse(json));
    expect(jsonStr).toContain('1');
    expect(jsonStr).toContain('9');
  });

  it('array of mixed types survives round-trip', () => {
    const input = { items: ['string', 42, true, null, { nested: 'obj' }] };
    const yon = jsonToYon(input, { id: 'mixarr', title: 'MixArray' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const jsonStr = JSON.stringify(JSON.parse(json));
    expect(jsonStr).toContain('string');
    expect(jsonStr).toContain('42');
  });
});
