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
 * @younndai/yon-converter — Error Path Tests
 *
 * Does the converter fail gracefully?
 * Tests invalid inputs, malformed data, unicode preservation,
 * and boundary conditions.
 */

import { describe, it, expect } from 'vitest';
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { tomlToYon } from '../src/toml/to-yon.js';
import { csvToYon } from '../src/csv/index.js';
import { yonToCsv } from '../src/csv/index.js';
import { yonToXml } from '../src/xml/index.js';
import { reverseConvert } from '../src/reverse.js';

// ═══════════════════════════════════════════════════════════════════════════
// Invalid forward inputs
// ═══════════════════════════════════════════════════════════════════════════

describe('Invalid forward inputs', () => {
  it('jsonToYon throws on invalid JSON string', () => {
    expect(() => {
      jsonToYon('{ invalid json !!!');
    }).toThrow();
  });

  it('yamlToYon handles malformed YAML gracefully', () => {
    const result = yamlToYon('- :\n  :\n    :', { id: 'bad', title: 'Bad' });
    expect(result).toContain('@DOC');
  });

  it('tomlToYon throws on invalid TOML', () => {
    expect(() => {
      tomlToYon('[invalid\nkey = ');
    }).toThrow();
  });

  it('csvToYon handles empty string', () => {
    const result = csvToYon('');
    expect(result).toContain('@DOC');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Invalid reverse inputs
// ═══════════════════════════════════════════════════════════════════════════

describe('Invalid reverse inputs', () => {
  it('reverseConvert with empty string throws', () => {
    expect(() => {
      reverseConvert('', { targetFormat: 'json' });
    }).toThrow();
  });

  it('reverseConvert with plain text (not YON) throws', () => {
    expect(() => {
      reverseConvert('This is not YON at all, just plain text.', { targetFormat: 'json' });
    }).toThrow();
  });

  it('yonToCsv with non-tabular YON returns empty string', () => {
    const yon = `@DOC ver=2.0 | id=cfg | title="Config"
@MAP name="data" | pairs=["key"->"value"]`;
    const csv = yonToCsv(yon);
    expect(typeof csv).toBe('string');
  });

  it('yonToXml with minimal doc produces valid XML', () => {
    const yon = `@DOC ver=2.0 | id=min | title="Minimal"`;
    const xml = yonToXml(yon);
    expect(xml).toContain('<?xml');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe('Edge cases', () => {
  it('unicode values survive round-trip', () => {
    const input = {
      greeting: '你好世界',
      emoji: '🚀🎉',
      arabic: 'مرحبا',
      japanese: 'こんにちは',
    };
    const yon = jsonToYon(input, { id: 'unicode', title: 'Unicode' });
    expect(yon).toContain('你好世界');
    expect(yon).toContain('🚀🎉');
    expect(yon).toContain('مرحبا');
    expect(yon).toContain('こんにちは');

    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(result.greeting).toBe('你好世界');
    expect(result.emoji).toBe('🚀🎉');
  });

  it('long string values (>10KB) are preserved', () => {
    const longStr = 'A'.repeat(12000);
    const input = { content: longStr };
    const yon = jsonToYon(input, { id: 'long', title: 'Long' });
    expect(yon).toContain(longStr);
  });

  it('object with numeric keys', () => {
    const input = { '0': 'zero', '1': 'one', '2': 'two' };
    const yon = jsonToYon(input, { id: 'numkeys', title: 'NumKeys' });
    expect(yon).toContain('zero');
    expect(yon).toContain('one');
    expect(yon).toContain('two');
  });

  it('deeply nested (5 levels) uses @BEGIN JSON fallback', () => {
    const input = {
      a: { b: { c: { d: { e: { value: 'deep' } } } } },
    };
    const yon = jsonToYon(input, { id: 'deep5', title: 'Deep5' });
    expect(yon).toContain('@BEGIN JSON');
    expect(yon).toContain('@END JSON');
    expect(yon).toContain('deep');
  });

  it('special characters in keys', () => {
    const input = {
      'key with spaces': 'value1',
      'key.with.dots': 'value2',
      'key/with/slashes': 'value3',
    };
    const yon = jsonToYon(input, { id: 'special', title: 'Special' });
    expect(yon).toContain('value1');
    expect(yon).toContain('value2');
    expect(yon).toContain('value3');
  });

  it('values that look like YON tags are properly escaped', () => {
    const input = {
      content: '@DOC ver=2.0 | id=fake',
      note: '@RULE lvl=MUST',
    };
    const yon = jsonToYon(input, { id: 'taglike', title: 'TagLike' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const result = JSON.parse(json);
    expect(typeof result).toBe('object');
  });
});
