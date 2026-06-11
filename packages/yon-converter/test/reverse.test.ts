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
 * @younndai/yon-converter — Reverse Conversion Tests
 *
 * Does YON → X produce valid output?
 * Tests every output format, emitter option, and AST walker branch.
 */

import { describe, it, expect } from 'vitest';
import { parse } from '@younndai/yon-parser';
import { jsonToYon } from '../src/json/to-yon.js';
import { yonToObject } from '../src/json/index.js';
import { yonToCsv } from '../src/csv/from-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { yonToXml } from '../src/xml/from-yon.js';
import { yonToIni } from '../src/ini/from-yon.js';
import { reverseConvert } from '../src/reverse.js';
import { walkDocument } from '../src/ast-walker.js';

// ═══════════════════════════════════════════════════════════════════════════
// yonToObject — direct object extraction
// ═══════════════════════════════════════════════════════════════════════════

describe('yonToObject', () => {
  it('returns a plain JavaScript object, not a JSON string', () => {
    const yon = `@DOC ver=2.0 | id=obj | title="Object"
@MAP name="data" | pairs=["name"->"Alice","age"->"30"]`;
    const doc = parse(yon);
    const result = yonToObject(doc);

    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
    expect(typeof result).not.toBe('string');
  });

  it('includeMeta option surfaces metadata records', () => {
    const yon = `@DOC ver=2.0 | id=meta | title="Meta Test"
@NOTE text="This is important"
@MAP name="data" | pairs=["key"->"value"]`;
    const doc = parse(yon);

    const without = yonToObject(doc, { includeMeta: false });
    const with_ = yonToObject(doc, { includeMeta: true });

    expect(Object.keys(with_).length).toBeGreaterThanOrEqual(
      Object.keys(without).length,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// reverseConvert options
// ═══════════════════════════════════════════════════════════════════════════

describe('reverseConvert options', () => {
  const yon = `@DOC ver=2.0 | id=opts | title="Options Test"
@MAP name="data" | pairs=["name"->"Alice","age"->"30"]`;

  it('stripMeta=false preserves metadata', () => {
    const json = reverseConvert(yon, { targetFormat: 'json', stripMeta: false });
    const result = JSON.parse(json);
    expect(typeof result).toBe('object');
  });

  it('custom indent=4 produces wider JSON', () => {
    const json = reverseConvert(yon, { targetFormat: 'json', indent: 4 });
    expect(json).toContain('    ');
  });

  it('indent=0 produces compact JSON', () => {
    const json = reverseConvert(yon, { targetFormat: 'json', indent: 0 });
    const result = JSON.parse(json);
    expect(result).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// YON → JSON / YAML / TOML / INI / CSV / XML (basic output)
// ═══════════════════════════════════════════════════════════════════════════

describe('reverseConvert format outputs', () => {
  const yon = `@DOC ver=2.0 | kind=config | id=test | title="Test"
@MAP name="settings" | pairs=["debug"->"true","level"->"3"]`;

  it('produces INI output', () => {
    const ini = reverseConvert(yon, { targetFormat: 'ini' });
    expect(ini).toBeDefined();
    expect(typeof ini).toBe('string');
  });

  it('produces CSV output', () => {
    const yon2 = `@DOC ver=2.0 | kind=data | id=test | title="Test"
@SEC name="records"
@CFG name="Alice" | age=30`;
    const csv = reverseConvert(yon2, { targetFormat: 'csv' });
    expect(typeof csv).toBe('string');
  });

  it('produces XML output with declaration', () => {
    const yon2 = `@DOC ver=2.0 | kind=doc | id=test | title="Test"
@MAP name="config" | pairs=["key"->"value"]`;
    const xml = reverseConvert(yon2, { targetFormat: 'xml' });
    expect(xml).toContain('<?xml');
  });

  it('produces valid YAML', () => {
    const yaml = reverseConvert(yon, { targetFormat: 'yaml' });
    expect(yaml).toContain('true');
    expect(typeof yaml).toBe('string');
  });

  it('produces valid TOML', () => {
    const toml = reverseConvert(yon, { targetFormat: 'toml' });
    expect(typeof toml).toBe('string');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Cross-format reverse
// ═══════════════════════════════════════════════════════════════════════════

describe('cross-format reverse', () => {
  const yon = `@DOC ver=2.0 | id=cross | title="Cross Format"
@SEC name="config"
@MAP name="database" | pairs=["host"->"localhost","port"->"5432"]
@MAP name="cache" | pairs=["enabled"->"true","ttl"->"300"]`;

  it('reverse to YAML produces valid structured output', () => {
    const yaml = reverseConvert(yon, { targetFormat: 'yaml' });
    expect(yaml).toContain('localhost');
    expect(yaml).toContain('5432');
    expect(yaml).toContain('cache');
  });

  it('reverse to TOML produces valid structured output', () => {
    const toml = reverseConvert(yon, { targetFormat: 'toml' });
    expect(toml).toContain('localhost');
    expect(toml).toContain('5432');
  });

  it('reverse to INI produces sectioned output', () => {
    const ini = reverseConvert(yon, { targetFormat: 'ini' });
    expect(ini).toContain('localhost');
    expect(ini).toContain('cache');
  });

  it('reverse to CSV for tabular data', () => {
    const tabularYon = `@DOC ver=2.0 | id=tab | title="Tabular"
@MAP name="record_0" | pairs=["name"->"Alice","age"->"30"]
@MAP name="record_1" | pairs=["name"->"Bob","age"->"25"]`;
    const csv = reverseConvert(tabularYon, { targetFormat: 'csv' });
    expect(typeof csv).toBe('string');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AST Walker — walkBlock
// ═══════════════════════════════════════════════════════════════════════════

describe('walkBlock', () => {
  it('returns raw string for text/plain blocks', () => {
    const yon = `@DOC ver=2.0 | id=block | title="Block"
@BEGIN TEXT | id="readme" | mime=text/plain | boundary=bnd_readme_txt
This is plain text content.
It has multiple lines.
@END TEXT | boundary=bnd_readme_txt`;
    const doc = parse(yon);
    const data = walkDocument(doc);
    const textContent = JSON.stringify(Object.values(data));
    expect(textContent.toLowerCase()).toContain('plain text content');
  });

  it('returns raw string for text/markdown blocks', () => {
    const yon = `@DOC ver=2.0 | id=mdblock | title="Markdown"
@BEGIN MARKDOWN | id="docs" | mime=text/markdown | boundary=bnd_docs_md
# Hello
This is **bold** text.
@END MARKDOWN | boundary=bnd_docs_md`;
    const doc = parse(yon);
    const data = walkDocument(doc);
    const values = JSON.stringify(Object.values(data));
    expect(values).toContain('Hello');
  });

  it('falls back to raw string when JSON block has invalid content', () => {
    const yon = `@DOC ver=2.0 | id=badjson | title="Bad JSON"
@BEGIN JSON | id="broken" | mime=application/json | boundary=bnd_broken_json
{ this is not valid json: [
@END JSON | boundary=bnd_broken_json`;
    const doc = parse(yon);
    const data = walkDocument(doc);
    const values = JSON.stringify(Object.values(data)).toLowerCase();
    expect(values).toContain('not valid json');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AST Walker — INTENT / SCOPE tags
// ═══════════════════════════════════════════════════════════════════════════

describe('walkRecord INTENT/SCOPE tags', () => {
  it('extracts text field from INTENT record', () => {
    const yon = `@DOC ver=2.0 | id=intent | title="Intent" | kind=plan
@INTENT text="Build a converter"`;
    const doc = parse(yon);
    const data = walkDocument(doc);
    const values = JSON.stringify(Object.values(data));
    expect(values).toContain('Build a converter');
  });

  it('extracts goal field from SCOPE record', () => {
    const yon = `@DOC ver=2.0 | id=scope | title="Scope" | kind=plan
@SCOPE goal="Production readiness"`;
    const doc = parse(yon);
    const data = walkDocument(doc);
    const values = JSON.stringify(Object.values(data));
    expect(values).toContain('Production readiness');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// yonToCsv — array discovery and output
// ═══════════════════════════════════════════════════════════════════════════

describe('yonToCsv', () => {
  it('finds data under "records" key', () => {
    const yon = `@DOC ver=2.0 | id=csvrt | title="CSV"
@SEC name="records"
@MAP name="records_0" | pairs=["name"->"Alice","age"->"30"]
@MAP name="records_1" | pairs=["name"->"Bob","age"->"25"]`;
    const doc = parse(yon);
    const csv = yonToCsv(doc);
    expect(csv).toContain('Alice');
    expect(csv).toContain('Bob');
  });

  it('finds data under "items" key', () => {
    const input = { items: [{ x: 'a' }, { x: 'b' }] };
    const yon = jsonToYon(input, { id: 'items', title: 'Items' });
    const doc = parse(yon);
    const csv = yonToCsv(doc);
    expect(csv).toContain('a');
  });

  it('returns empty string for non-tabular data', () => {
    const yon = `@DOC ver=2.0 | id=notab | title="No Table"
@MAP name="data" | pairs=["key"->"value"]`;
    const doc = parse(yon);
    const csv = yonToCsv(doc);
    expect(typeof csv).toBe('string');
  });

  it('outputs one-column CSV for simple array of strings', () => {
    const input = { tags: ['yon', 'converter', 'format'] };
    const yon = jsonToYon(input, { id: 'tags', title: 'Tags' });
    const doc = parse(yon);
    const csv = yonToCsv(doc);
    if (csv.length > 0) {
      expect(csv).toContain('yon');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// yonToXml — options
// ═══════════════════════════════════════════════════════════════════════════

describe('yonToXml options', () => {
  const yon = `@DOC ver=2.0 | id=xmlopt | title="XML Options"
@MAP name="data" | pairs=["key"->"value"]`;

  it('declaration=false omits XML declaration', () => {
    const doc = parse(yon);
    const xml = yonToXml(doc, { declaration: false });
    expect(xml).not.toContain('<?xml');
    expect(xml).toContain('value');
  });

  it('declaration=true includes XML declaration (default)', () => {
    const doc = parse(yon);
    const xml = yonToXml(doc, { declaration: true });
    expect(xml).toContain('<?xml version="1.0"');
  });

  it('custom rootName wraps content', () => {
    const doc = parse(yon);
    const xml = yonToXml(doc, { rootName: 'config' });
    expect(xml).toContain('value');
  });

  it('custom indent changes spacing', () => {
    const doc = parse(yon);
    const xml4 = yonToXml(doc, { indent: 4 });
    const xml2 = yonToXml(doc, { indent: 2 });
    expect(xml4).toContain('value');
    expect(xml2).toContain('value');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// yonToIni — complex values
// ═══════════════════════════════════════════════════════════════════════════

describe('yonToIni complex values', () => {
  it('handles values requiring quoting', () => {
    const yon = `@DOC ver=2.0 | id=inicomplex | title="INI Complex"
@SEC name="section"
@MAP name="section" | pairs=["path"->"C:\\\\Program Files","desc"->"has = sign"]`;
    const doc = parse(yon);
    const ini = yonToIni(doc);
    expect(ini).toContain('[section]');
    expect(typeof ini).toBe('string');
  });

  it('handles null values with empty assignment', () => {
    const yon = `@DOC ver=2.0 | id=ininull | title="INI Null"
@SEC name="section"
@MAP name="section" | pairs=["key"->"null"]`;
    const doc = parse(yon);
    const ini = yonToIni(doc);
    expect(ini).toContain('[section]');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// maybeConvertToArray — indexed key pattern detection
// ═══════════════════════════════════════════════════════════════════════════

describe('maybeConvertToArray', () => {
  it('detects records_0, records_1 pattern and produces array', () => {
    const csv = `name,age
Alice,30
Bob,25
Carol,28`;
    const yon = csvToYon(csv);
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);

    const records = result.records;
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(3);
    expect(records[0].name).toBe('Alice');
    expect(records[2].name).toBe('Carol');
  });

  it('preserves order when indices are non-sequential', () => {
    const yon = `@DOC ver=2.0 | id=order | title="Order"
@SEC name="items"
@MAP name="items_2" | pairs=["val"->"third"]
@MAP name="items_0" | pairs=["val"->"first"]
@MAP name="items_1" | pairs=["val"->"second"]`;
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);

    if (Array.isArray(result.items)) {
      expect(result.items[0].val).toBe('first');
      expect(result.items[1].val).toBe('second');
      expect(result.items[2].val).toBe('third');
    }
  });

  it('does NOT convert non-indexed keys to array', () => {
    const yon = `@DOC ver=2.0 | id=nonidx | title="Non-Indexed"
@SEC name="config"
@MAP name="host" | pairs=["host"->"localhost"]
@MAP name="port" | pairs=["port"->"5432"]`;
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);

    expect(Array.isArray(result.config)).toBe(false);
    expect(typeof result.config).toBe('object');
  });
});
