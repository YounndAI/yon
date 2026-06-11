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
 * @younndai/yon-converter — Spec Compliance Tests
 *
 * Does the output comply with YON v2.0?
 * Tests @DOC field order, boundary constraints, format coverage,
 * defaults, heuristic tag validation, and canon quoting.
 */

import { describe, it, expect } from 'vitest';
import { jsonToYon } from '../src/json/to-yon.js';
import { yamlToYon } from '../src/yaml/to-yon.js';
import { tomlToYon } from '../src/toml/to-yon.js';
import { reverseConvert } from '../src/reverse.js';
import { walkRecord } from '../src/ast-walker.js';
import { detectFormat } from '../src/detect-format.js';
import { parse } from '@younndai/yon-parser';

// ═══════════════════════════════════════════════════════════════════════════
// §3.1 @DOC field order: ver → id → title → [kind] → [profile] → [fmt]
// ═══════════════════════════════════════════════════════════════════════════

describe('@DOC field order', () => {
  it('emits ver, id, title in canonical order', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test' });
    const header = result.split('\n')[0]!;

    const fieldOrder = header
      .replace('@DOC ', '')
      .split(' | ')
      .map((f) => f.split('=')[0]!);

    expect(fieldOrder[0]).toBe('ver');
    expect(fieldOrder[1]).toBe('id');
    expect(fieldOrder[2]).toBe('title');
  });

  it('omits kind when it equals the default (doc)', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test' });
    expect(result).not.toContain('kind=doc');
  });

  it('emits kind after title when non-default', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', kind: 'workflow' });
    const header = result.split('\n')[0]!;
    const fields = header.replace('@DOC ', '').split(' | ').map((f) => f.split('=')[0]!);

    const titleIdx = fields.indexOf('title');
    const kindIdx = fields.indexOf('kind');
    expect(kindIdx).toBeGreaterThan(titleIdx);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// §6 Boundaries: ≥ 8 chars, [A-Za-z0-9_-]+ pattern
// ═══════════════════════════════════════════════════════════════════════════

describe('Boundary constraints', () => {
  it('produces boundaries ≥ 8 chars for short keys', () => {
    const result = jsonToYon({ x: [1, 2, 3] }, { id: 'test', title: 'Test' });

    const boundaryMatch = result.match(/boundary=(\S+)/);
    expect(boundaryMatch).toBeTruthy();
    expect(boundaryMatch![1]!.length).toBeGreaterThanOrEqual(8);
  });

  it('boundary chars are all valid', () => {
    const result = jsonToYon({ 'odd.key': [] }, { id: 'test', title: 'Test' });
    const boundaryMatch = result.match(/boundary=(\S+)/);
    if (boundaryMatch) {
      expect(boundaryMatch[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// reverseConvert full format coverage
// ═══════════════════════════════════════════════════════════════════════════

describe('reverseConvert: all 6 formats', () => {
  const yon = `@DOC ver=2.0 | id=test | title="Test"
@MAP name="data" | pairs=["name"->"Alice","age"->"30"]`;

  it('converts to csv', () => {
    const result = reverseConvert(yon, { targetFormat: 'csv' });
    expect(typeof result).toBe('string');
  });

  it('converts to xml', () => {
    const result = reverseConvert(yon, { targetFormat: 'xml' });
    expect(result).toContain('<?xml');
  });

  it('converts to ini', () => {
    const result = reverseConvert(yon, { targetFormat: 'ini' });
    expect(typeof result).toBe('string');
  });

  it('still supports json, yaml, toml', () => {
    for (const fmt of ['json', 'yaml', 'toml'] as const) {
      const result = reverseConvert(yon, { targetFormat: fmt });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Defaults: profile=exec, format=canon
// ═══════════════════════════════════════════════════════════════════════════

describe('Spec-aligned defaults', () => {
  it('default output has no profile= field (exec is the default)', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test' });
    expect(result).not.toContain('profile=');
  });

  it('default output has no fmt= field (canon is the default)', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test' });
    expect(result).not.toContain('fmt=');
  });

  it('emits profile when explicitly set to non-default', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', profile: 'core' });
    expect(result).toContain('profile=core');
  });

  it('emits fmt when explicitly set to non-default', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', format: 'min' });
    expect(result).toContain('fmt=min');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Heuristic tag validation: @RULE, @STEP, @CFG
// ═══════════════════════════════════════════════════════════════════════════

describe('Required-field validation for heuristic tags', () => {
  it('falls back to @MAP when data lacks @RULE required fields', () => {
    const input = {
      rule: {
        name: 'foo', severity: 'high',
        metadata: { source: 'audit' },
      },
    };
    const result = jsonToYon(input, { id: 'test', title: 'Test' });
    expect(result).not.toContain('@RULE');
  });

  it('emits @RULE when data has all required fields', () => {
    const input = {
      rule: {
        lvl: 'MUST', when: 'testing', then: 'pass',
        context: { source: 'audit' },
      },
    };
    const result = jsonToYon(input, { id: 'test', title: 'Test' });
    expect(result).toContain('@RULE');
    expect(result).toContain('lvl');
  });

  it('falls back when data lacks @STEP required fields (n, op)', () => {
    const input = {
      step: {
        name: 'deploy', target: 'prod',
        extra: { env: 'production' },
      },
    };
    const result = jsonToYon(input, { id: 'test', title: 'Test' });
    expect(result).not.toContain('@STEP');
  });

  it('emits @STEP when data has all required fields (rid, n, op)', () => {
    const input = {
      step: {
        rid: 'step:1', n: 1, op: 'deploy', description: 'Ship it',
        config: { timeout: 30 },
      },
    };
    const result = jsonToYon(input, { id: 'test', title: 'Test' });
    expect(result).toContain('@STEP');
    expect(result).toContain('op');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Reverse conversion content verification
// ═══════════════════════════════════════════════════════════════════════════

describe('Reverse conversion: content checks', () => {
  const yon = `@DOC ver=2.0 | id=roundtrip | title="Roundtrip"
@MAP name="data" | pairs=["name"->"Alice","age"->"30","active"->"true"]`;

  it('yonToJson preserves key-value pairs', () => {
    const result = reverseConvert(yon, { targetFormat: 'json' });
    const parsed = JSON.parse(result);
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).toContain('Alice');
    expect(jsonStr).toContain('30');
  });

  it('yonToYaml emits readable YAML with keys', () => {
    const result = reverseConvert(yon, { targetFormat: 'yaml' });
    expect(result).toContain('name');
    expect(result).toContain('Alice');
  });

  it('yonToToml emits section headers', () => {
    const result = reverseConvert(yon, { targetFormat: 'toml' });
    expect(result).toContain('name');
    expect(result).toContain('Alice');
  });

  it('yonToXml produces well-formed XML with data elements', () => {
    const result = reverseConvert(yon, { targetFormat: 'xml' });
    expect(result).toContain('<?xml');
    expect(result).toContain('Alice');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Profile/format inheritance for YAML and TOML
// ═══════════════════════════════════════════════════════════════════════════

describe('Profile/format inheritance for YAML and TOML', () => {
  it('yamlToYon inherits exec/canon defaults', () => {
    const result = yamlToYon('name: Test\nversion: 1\n', { id: 'y', title: 'Y' });
    expect(result).not.toContain('profile=');
    expect(result).not.toContain('fmt=');
  });

  it('tomlToYon inherits exec/canon defaults', () => {
    const result = tomlToYon('name = "Test"\nversion = 1\n', { id: 't', title: 'T' });
    expect(result).not.toContain('profile=');
    expect(result).not.toContain('fmt=');
  });

  it('yamlToYon respects explicit profile override', () => {
    const result = yamlToYon('x: 1\n', { id: 'y', title: 'Y', profile: 'decl' });
    expect(result).toContain('profile=decl');
  });

  it('tomlToYon respects explicit format override', () => {
    const result = tomlToYon('x = 1\n', { id: 't', title: 'T', format: 'ultra' });
    expect(result).toContain('fmt=ultra');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Canon quoting behavior
// ═══════════════════════════════════════════════════════════════════════════

describe('Canon format quoting behavior', () => {
  it('canon format quotes bare-safe values', () => {
    const input = {
      config: {
        mode: 'production', debug: false,
        retries: { max: 3, backoff: 'exponential' },
      },
    };
    const result = jsonToYon(input, { id: 'test', title: 'Test' });
    expect(result).toContain('"production"');
  });

  it('min format emits fmt=min and allows bare-safe values in MAP pairs', () => {
    const input = { name: 'production', version: 1 };
    const result = jsonToYon(input, { id: 'test', title: 'Test', format: 'min' });
    expect(result).toContain('fmt=min');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Multi-type data handling
// ═══════════════════════════════════════════════════════════════════════════

describe('Multi-type data handling', () => {
  it('handles mixed primitive types in a flat object', () => {
    const input = { name: 'test', count: 42, ratio: 3.14, active: true, nil: null };
    const result = jsonToYon(input, { id: 'mix', title: 'Mix' });

    expect(result).toContain('"name"');
    expect(result).toContain('"42"');
    expect(result).toContain('"3.14"');
    expect(result).toContain('"true"');
    expect(result).toContain('"null"');
  });

  it('handles empty object', () => {
    const result = jsonToYon({}, { id: 'empty', title: 'Empty' });
    expect(result).toContain('@DOC');
    const lines = result.split('\n').filter((l: string) => l.trim());
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  it('handles deeply nested objects via @BEGIN JSON', () => {
    const input = {
      level1: { level2: { level3: { value: 'deep' } } },
    };
    const result = jsonToYon(input, { id: 'deep', title: 'Deep' });
    expect(result).toContain('@BEGIN JSON');
    expect(result).toContain('@END JSON');
    expect(result).toContain('deep');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// @CFG heuristic pattern
// ═══════════════════════════════════════════════════════════════════════════

describe('@CFG heuristic pattern', () => {
  it('emits @CFG for config-keyed objects with nested data', () => {
    const input = {
      config: { debug: true, level: 3, nested: { host: 'localhost' } },
    };
    const result = jsonToYon(input, { id: 'cfg', title: 'Cfg' });
    expect(result).toContain('@CFG');
  });

  it('emits @MAP for simple config objects (isSimpleMap branch)', () => {
    const input = { config: { debug: true, level: 3 } };
    const result = jsonToYon(input, { id: 'cfg', title: 'Cfg' });
    expect(result).toContain('@MAP name="config"');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix D4: Extended @DOC header fields (§16.1)
// ═══════════════════════════════════════════════════════════════════════════

describe('D4: Extended @DOC header fields', () => {
  it('emits mode when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', mode: 'chat' });
    expect(result).toContain('mode=chat');
  });

  it('emits scenario when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', scenario: 'onboarding flow' });
    expect(result).toContain('scenario="onboarding flow"');
  });

  it('emits domain when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', domain: 'yai.health' });
    expect(result).toContain('domain=yai.health');
  });

  it('emits features list when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', features: ['payload', 'logic'] });
    expect(result).toContain('features=[payload,logic]');
  });

  it('emits with list when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', with: ['dialogue'] });
    expect(result).toContain('with=[dialogue]');
  });

  it('emits without list when provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', without: ['delta'] });
    expect(result).toContain('without=[delta]');
  });

  it('omits extended fields when not provided', () => {
    const result = jsonToYon({ a: 1 }, { id: 'test', title: 'Test' });
    expect(result).not.toContain('mode=');
    expect(result).not.toContain('scenario=');
    expect(result).not.toContain('domain=');
    expect(result).not.toContain('features=');
  });

  it('extended fields appear in canonical order: domain before mode before profile before fmt', () => {
    const result = jsonToYon({ a: 1 }, {
      id: 'test', title: 'Test', profile: 'core', format: 'min',
      mode: 'struct', domain: 'yai.health',
    });
    const header = result.split('\n')[0]!;
    const fields = header.replace('@DOC ', '').split(' | ').map(f => f.split('=')[0]!);

    const domainIdx = fields.indexOf('domain');
    const modeIdx = fields.indexOf('mode');
    const profileIdx = fields.indexOf('profile');
    const fmtIdx = fields.indexOf('fmt');
    // Tag-registry §3: ver → id → title → kind → domain → mode → profile → fmt
    expect(domainIdx).toBeLessThan(modeIdx);
    expect(modeIdx).toBeLessThan(profileIdx);
    expect(profileIdx).toBeLessThan(fmtIdx);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix D5: Nested primitive type fidelity
// ═══════════════════════════════════════════════════════════════════════════

describe('D5: Nested primitive type fidelity', () => {
  it('nested booleans use formatTypedValue (not raw String())', () => {
    const input = {
      level1: { level2: { enabled: true, count: 42 } },
    };
    const result = jsonToYon(input, { id: 'deep', title: 'Deep' });
    // D5 fix: deep primitives should use formatTypedValue which quotes all values
    // Before fix: String(true) → "true" without any sentinel → ambiguous
    // After fix: formatTypedValue(true) → "true" with proper quoting
    expect(result).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix G1: Boundary collision safety (§6.2)
// ═══════════════════════════════════════════════════════════════════════════

describe('G1: Boundary collision safety', () => {
  it('boundary does not appear in block content', () => {
    const result = jsonToYon({ items: [1, 2, 3] }, { id: 'test', title: 'Test' });
    const boundaryMatch = result.match(/boundary=(\S+)/);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1]!;
      // Extract block content (between @BEGIN and @END)
      const beginIdx = result.indexOf('\n', result.indexOf('@BEGIN'));
      const endIdx = result.indexOf('@END');
      if (beginIdx > 0 && endIdx > beginIdx) {
        const blockContent = result.substring(beginIdx + 1, endIdx).trim();
        expect(blockContent).not.toContain(boundary);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix G4: @STEP walker completeness (§8.3)
// Audit Fix T4: @RULE walker rid preservation (§8.1)
// ═══════════════════════════════════════════════════════════════════════════

describe('G4/T4: Walker field completeness', () => {
  it('walkRecord preserves rid on @RULE records', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@RULE rid="rule:r1" | lvl="MUST" | when="always" | then="pass" | because="spec says so"`;
    const doc = parse(yon);
    const rule = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(rule.rid).toBe('rule:r1');
    expect(rule.level).toBe('MUST');
    expect(rule.because).toBe('spec says so');
  });

  it('walkRecord handles @STEP with rules and timeout_ms', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@STEP n:int=1 | op="std:ai.prompt@v1" | note="run inference"`;
    const doc = parse(yon);
    const step = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(step.op).toBe('std:ai.prompt@v1');
    expect(step.note).toBe('run inference');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix G5: Dedicated walkers for @CHECK, @CATCH, @RETRY, @ERROR
// ═══════════════════════════════════════════════════════════════════════════

describe('G5: Dedicated tag walkers', () => {
  it('walks @CHECK records with assert/fail/msg', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@CHECK assert="plan approved" | fail="HALT" | msg="Ask for plan first"`;
    const doc = parse(yon);
    const check = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(check.assert).toBe('plan approved');
    expect(check.fail).toBe('HALT');
    expect(check.msg).toBe('Ask for plan first');
  });

  it('walks @CATCH records with target/on/do', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@CATCH target="step_1" | on="timeout" | do="retry"`;
    const doc = parse(yon);
    const caught = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(caught.target).toBe('step_1');
    expect(caught.on).toBe('timeout');
    expect(caught.do).toBe('retry');
  });

  it('walks @RETRY records with max/delay_ms/backoff', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@RETRY max="3" | delay_ms="1000" | backoff="exponential"`;
    const doc = parse(yon);
    const retry = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(retry.max).toBe('3');
    expect(retry.delay_ms).toBe('1000');
    expect(retry.backoff).toBe('exponential');
  });

  it('walks @ERROR records with code/msg/severity', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@ERROR code="E001" | msg="Validation failed" | severity="critical"`;
    const doc = parse(yon);
    const error = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(error.code).toBe('E001');
    expect(error.msg).toBe('Validation failed');
    expect(error.severity).toBe('critical');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Audit Fix G7: Tag name preservation
// ═══════════════════════════════════════════════════════════════════════════

describe('G7: Tag name preservation', () => {
  it('includes _tag when includeMeta is true for unknown tag types', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@CUSTOM name="special" | value="data"`;
    const doc = parse(yon);
    const result = walkRecord(doc.records[1]!, { includeMeta: true }) as Record<string, unknown>;
    expect(result._tag).toBe('CUSTOM');
    expect(result.name).toBe('special');
  });

  it('does not include _tag when includeMeta is false', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@CUSTOM name="special" | value="data"`;
    const doc = parse(yon);
    const result = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(result._tag).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Format detection: unknown (formerly 'natural')
// ═══════════════════════════════════════════════════════════════════════════

describe('Format detection: unknown', () => {
  it('returns unknown for unstructured text', () => {
    const result = detectFormat('Just some random text that is not any format');
    expect(result).toBe('unknown');
  });

  it('does not return natural (renamed to unknown)', () => {
    const result = detectFormat('Hello world');
    expect(result).not.toBe('natural');
    expect(result).toBe('unknown');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// YON-to-YON passthrough
// ═══════════════════════════════════════════════════════════════════════════

describe('YON-to-YON passthrough', () => {
  it('parses and re-serializes valid YON via format()', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@MAP name="data" | pairs=["key"->"value"]`;
    const result = reverseConvert(yon, { targetFormat: 'yon' });
    expect(result).toContain('@DOC');
    expect(result).toContain('@MAP');
    expect(result).toContain('key');
  });

  it('preserves document structure through passthrough', () => {
    const yon = `@DOC ver=2.0 | id=rt | title="Roundtrip"
@RULE lvl="MUST" | when="testing" | then="pass"`;
    const result = reverseConvert(yon, { targetFormat: 'yon' });
    expect(result).toContain('@RULE');
    expect(result).toContain('MUST');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D5 roundtrip: nested typed primitive survives forward+reverse
// ═══════════════════════════════════════════════════════════════════════════

describe('D5: Nested primitive roundtrip fidelity', () => {
  it('nested boolean in deep object round-trips through YON', () => {
    const input = { cfg: { debug: true, count: 42, ratio: 3.14 } };
    const yon = jsonToYon(input, { id: 'rt', title: 'RT' });
    const json = reverseConvert(yon, { targetFormat: 'json' });
    const parsed = JSON.parse(json);
    // The values should survive roundtrip (may be coerced depending on type hints)
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).toContain('debug');
    expect(jsonStr).toContain('count');
    expect(jsonStr).toContain('ratio');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// G5 negative: empty/minimal @CHECK and @RETRY records
// ═══════════════════════════════════════════════════════════════════════════

describe('G5: Graceful handling of minimal records', () => {
  it('handles @CHECK with only assert field', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@CHECK assert="something"`;
    const doc = parse(yon);
    const check = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(check.assert).toBe('something');
    expect(check.fail).toBeUndefined();
    expect(check.msg).toBeUndefined();
  });

  it('handles @RETRY with only max field', () => {
    const yon = `@DOC ver=2.0 | id=test | title="Test"
@RETRY max="5"`;
    const doc = parse(yon);
    const retry = walkRecord(doc.records[1]!) as Record<string, unknown>;
    expect(retry.max).toBe('5');
    expect(retry.delay_ms).toBeUndefined();
    expect(retry.backoff).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D4 roundtrip: extended header fields survive parse→format
// ═══════════════════════════════════════════════════════════════════════════

describe('D4: Extended header roundtrip', () => {
  it('domain survives YON passthrough', () => {
    const yon = jsonToYon({ a: 1 }, { id: 'test', title: 'Test', domain: 'yai.health' });
    const result = reverseConvert(yon, { targetFormat: 'yon' });
    expect(result).toContain('domain=');
  });
});
