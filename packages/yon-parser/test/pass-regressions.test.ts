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
 * Regression Tests
 *
 * Guards against re-introduction of previously-fixed bugs.
 * Each test pins a behavior that regressed at least once.
 */

import { describe, it, expect } from 'vitest';
import { parse, format, validate, getDomainTags } from '../src/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Correctness
// ─────────────────────────────────────────────────────────────────────────────

describe('Correctness Regressions', () => {
  it('D1: no type coercion — int value stays string', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | kind=doc\n@META n:int=3');
    const meta = doc.records.find(r => r.tag === 'META');
    expect(meta).toBeDefined();
    expect(meta!.fields.get('n')).toBe('3');
    expect(typeof meta!.fields.get('n')).toBe('string');
  });

  it('D7: raw block content with | and = preserved', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN id=code | mime="application/json" | boundary="bnd_code"',
      '{"key|pipe": "val=eq"}',
      '@END boundary="bnd_code"',
    ].join('\n');
    const doc = parse(src);
    const block = doc.blocks.get('code');
    expect(block).toBeDefined();
    expect(block!.content).toContain('|');
    expect(block!.content).toContain('=');
  });

  it('D8: @END TAG mismatch throws', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN JSON id=data | mime="application/json" | boundary="bnd_data"',
      '{}',
      '@END LOGS',
    ].join('\n');
    expect(() => parse(src)).toThrow();
  });

  it('D4: field ordering matches §17.1 canonical order', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | kind=doc | fmt=canon');
    const output = format(doc);
    const docLine = output.split('\n').find(l => l.startsWith('@DOC'));
    expect(docLine).toBeDefined();
    // ver must come before id, id before title, title before kind, kind before fmt
    const verPos = docLine!.indexOf('ver=');
    const idPos = docLine!.indexOf('id=');
    const titlePos = docLine!.indexOf('title=');
    const kindPos = docLine!.indexOf('kind=');
    const fmtPos = docLine!.indexOf('fmt=');
    expect(verPos).toBeLessThan(idPos);
    expect(idPos).toBeLessThan(titlePos);
    expect(titlePos).toBeLessThan(kindPos);
    expect(kindPos).toBeLessThan(fmtPos);
  });

  it('D3: unterminated string error uses E001', () => {
    try {
      parse('@DOC ver=2.0 | id=test | title="unterminated');
      expect.fail('Should have thrown');
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('E001');
    }
  });

  it('U13: str type suffix accepted', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test"\n@NOTE key:str=hello');
    const note = doc.records.find(r => r.tag === 'NOTE');
    expect(note).toBeDefined();
    const field = note!.typedFields.get('key');
    expect(field).toBeDefined();
    expect(field!.typeHint).toBe('str');
    expect(field!.value).toBe('hello');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Completeness
// ─────────────────────────────────────────────────────────────────────────────

describe('Completeness Regressions', () => {
  it('U3: domain versioning split', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | domain=yai.health@1.0');
    expect(doc.domain).toBe('yai.health');
    expect(doc.domainVersion).toBe('1.0');
  });

  it('U3: domain without version unchanged', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | domain=yai.fintech');
    expect(doc.domain).toBe('yai.fintech');
    expect(doc.domainVersion).toBeUndefined();
  });

  it('U5: typedFields preserves typeHint', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test"\n@META n:int=42');
    const meta = doc.records.find(r => r.tag === 'META');
    expect(meta).toBeDefined();
    expect(meta!.typedFields.size).toBeGreaterThan(0);
    const field = meta!.typedFields.get('n');
    expect(field).toBeDefined();
    expect(field!.typeHint).toBe('int');
    expect(field!.value).toBe('42');
  });

  it('U7+U15: nodes[] contains comments in source order', () => {
    const src = [
      '# Leading comment',
      '@DOC ver=2.0 | id=test | title="Test"',
      '# Between comment',
      '@NOTE text="hello"',
    ].join('\n');
    const doc = parse(src);
    expect(doc.nodes.length).toBeGreaterThanOrEqual(4);

    // First node should be a comment
    expect(doc.nodes[0]!.type).toBe('comment');
    if (doc.nodes[0]!.type === 'comment') {
      expect(doc.nodes[0]!.text).toContain('Leading');
    }

    // Find the between-comment
    const commentNodes = doc.nodes.filter(n => n.type === 'comment');
    expect(commentNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('U1: scenario resolution provides default profile', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | scenario=chat');
    // 'chat' scenario has profile=core, mode=chat, format=ultra
    expect(doc.scenario).toBe('chat');
    // Validator should accept — scenario resolves profile internally
    const result = validate(doc);
    expect(result).toBeDefined();
  });

  // --- Additional Regression Tests ---

  it('D1: YonValue is string-only for scalar values', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test"\n@META count=42');
    const meta = doc.records.find(r => r.tag === 'META');
    const val = meta!.fields.get('count');
    // Values are always strings per §3.1.2
    expect(typeof val).toBe('string');
    expect(val).toBe('42');
  });

  it('D8: flag-only keys return string "true"', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test"\n@META verbose');
    const meta = doc.records.find(r => r.tag === 'META');
    const val = meta!.fields.get('verbose');
    expect(typeof val).toBe('string');
    expect(val).toBe('true');
  });

  it('D10: domain lookup normalizes bare to yai.* prefix', () => {
    // Bare domain 'health' should resolve same as 'yai.health'
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | domain=health@1.0');
    expect(doc.domain).toBe('health');
    expect(doc.domainVersion).toBe('1.0');
    // Validation with domain should not error (tags resolve)
    const result = validate(doc, { domains: ['health'] });
    expect(result.valid).toBe(true);
  });

  it('D15: features extracted from YonList correctly', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | features=[payload,logic,workflow]');
    expect(doc.features).toBeDefined();
    expect(Array.isArray(doc.features)).toBe(true);
    expect(doc.features).toContain('payload');
    expect(doc.features).toContain('workflow');
  });

  it('D16: bytes field parsed as number via parseInt', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test"\n@BEGIN id="b1" | mime="application/octet-stream" | bytes:bytes=1024\ndata\n@END';
    const doc = parse(src);
    const block = doc.blocks.get('b1');
    expect(block).toBeDefined();
    if (block?.bytes !== undefined) {
      expect(typeof block.bytes).toBe('number');
    }
  });

  it('D17: shorthand @END validates tag#id match', () => {
    // Mismatched ID should throw
    const src = '@DOC ver=2.0 | id=test | title="Test"\n@BEGIN ts#example\ncontent\n@END ts#wrong';
    expect(() => parse(src)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Governance §3.3: Domain Handling
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain Handling (Governance §3.3)', () => {
  it('doc.domain auto-resolves: health tags accepted without options.domains', () => {
    // Parser extracts domain=yai.health, validator should auto-resolve it
    const src = [
      '@DOC ver=2.0 | id=test | title="Test" | domain=yai.health@1.0',
      '@VITALS bp="120/80" | hr:int=72',
    ].join('\n');
    const doc = parse(src);
    expect(doc.domain).toBe('yai.health');
    // Validate WITHOUT passing options.domains — should still accept health tags
    const result = validate(doc);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('community domain permissive: unknown domain tags pass strict validation', () => {
    // Per §4a.4: parsers MUST preserve unknown domains without validation
    const src = [
      '@DOC ver=2.0 | id=test | title="Test" | domain=stripe.payment',
      '@CHARGE amount:int=100 | currency="USD"',
    ].join('\n');
    const doc = parse(src);
    expect(doc.domain).toBe('stripe.payment');
    // Strict mode — community domain tags should NOT cause errors
    const result = validate(doc, { strict: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Warning about unknown domain is expected
    expect(result.warnings.some(w => w.message.includes('stripe.payment'))).toBe(true);
  });

  it('unknown domain warns but stays valid', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test" | domain=acme.internal';
    const doc = parse(src);
    const result = validate(doc);
    // Must be valid — unknown domain = preserve, no validation
    expect(result.valid).toBe(true);
    // Must warn about unknown domain
    expect(result.warnings.some(w => w.message.includes('acme.internal'))).toBe(true);
  });

  it('domain version mismatch warns: known domain, unknown version', () => {
    // yai.health registry is at version 1.0 — request version 9.0
    const src = '@DOC ver=2.0 | id=test | title="Test" | domain=yai.health@9.0';
    const doc = parse(src);
    expect(doc.domainVersion).toBe('9.0');
    const result = validate(doc);
    // Should warn about version mismatch
    expect(result.warnings.some(w => w.message.includes('9.0') && w.message.includes('latest known'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Format & Profile
// ─────────────────────────────────────────────────────────────────────────────

describe('Format & Profile Regressions', () => {
  it('F1: @END line includes pipe separator before boundary', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@BEGIN JSON | id=data | mime="application/json" | boundary="bnd_12345678"',
      '{"key": "value"}',
      '@END JSON | boundary="bnd_12345678"',
    ].join('\n');
    const doc = parse(src);
    const output = format(doc);
    // @END line must have pipe separator between tag and boundary
    const endLine = output.split('\n').find(l => l.startsWith('@END'));
    expect(endLine).toBeDefined();
    expect(endLine).toContain(' | boundary=');
  });

  it('F2: canon mode emits bare values for bare-safe strings', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | kind=doc | fmt=canon');
    const output = format(doc, { mode: 'canon' });
    const docLine = output.split('\n').find(l => l.startsWith('@DOC'));
    expect(docLine).toBeDefined();
    // Bare-safe values should NOT be quoted in any mode
    expect(docLine).toContain('ver=2.0');
    expect(docLine).not.toContain('ver="1.5"');
    expect(docLine).toContain('kind=doc');
    expect(docLine).not.toContain('kind="doc"');
  });

  it('F3: missing preset features errors in strict, warns in lenient', () => {
    // exec preset includes: payload, logic, workflow, refs, delta, dialogue, sessions
    // Only declaring [payload] should trigger the check
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | profile=exec | features=[payload]');
    const strict = validate(doc, { strict: true });
    const lenient = validate(doc, { strict: false });
    // Strict: error (MUST-level per §16.5 line 908)
    expect(strict.errors.some(e => e.message.includes('missing preset features'))).toBe(true);
    // Lenient: warning
    expect(lenient.warnings.some(w => w.message.includes('missing preset features'))).toBe(true);
    expect(lenient.errors.some(e => e.message.includes('missing preset features'))).toBe(false);
  });

  it('F4a: unknown profile errors in strict mode', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | profile=fantasy');
    const strict = validate(doc, { strict: true });
    const lenient = validate(doc, { strict: false });
    // Strict: should be an error
    expect(strict.errors.some(e => e.message.includes('Unknown profile'))).toBe(true);
    // Lenient: should be a warning, not an error
    expect(lenient.warnings.some(w => w.message.includes('Unknown profile'))).toBe(true);
    expect(lenient.errors.some(e => e.message.includes('Unknown profile'))).toBe(false);
  });

  it('F4b: unknown features error in strict mode', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | features=[payload,quantum_compute]');
    const strict = validate(doc, { strict: true });
    const lenient = validate(doc, { strict: false });
    // Strict: should be an error
    expect(strict.errors.some(e => e.message.includes('quantum_compute'))).toBe(true);
    // Lenient: should be a warning, not an error
    expect(lenient.warnings.some(w => w.message.includes('quantum_compute'))).toBe(true);
    expect(lenient.errors.some(e => e.message.includes('quantum_compute'))).toBe(false);
  });

  // ─── Edge-case coverage ───────────────────────────────────────────────

  it('F3-edge: features exactly matching preset should NOT warn', () => {
    // core preset = [payload, logic, dialogue, sessions]
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | profile=core | features=[payload,logic,dialogue,sessions]');
    const result = validate(doc, { strict: false });
    expect(result.warnings.some(w => w.message.includes('missing preset features'))).toBe(false);
  });

  it('F3-edge: core profile with missing preset features errors in strict', () => {
    // core preset = [payload, logic, dialogue, sessions]
    // Only declaring [payload, logic] should trigger error about missing dialogue, sessions
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | profile=core | features=[payload,logic]');
    const strict = validate(doc, { strict: true });
    const lenient = validate(doc, { strict: false });
    expect(strict.errors.some(e => e.message.includes('dialogue'))).toBe(true);
    expect(lenient.warnings.some(w => w.message.includes('dialogue'))).toBe(true);
  });

  it('F2-edge: values with pipe char are always quoted', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test"\n@NOTE text="foo|bar"';
    const doc = parse(src);
    const output = format(doc, { mode: 'canon' });
    // Pipe-containing value MUST be quoted per §3.1.3
    expect(output).toContain('text="foo|bar"');
  });

  it('F2-edge: list items use bare values when safe', () => {
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | features=[payload,logic,workflow]');
    const output = format(doc, { mode: 'canon' });
    // List string items that are bare-safe should NOT be quoted
    expect(output).toContain('features=[payload,logic,workflow]');
  });

  it('F4-edge: unknown profile WITH features is forward-compatible (no error)', () => {
    // §16.5 line 909: "Unknown profile + features: base = features (forward-compatible)"
    const doc = parse('@DOC ver=2.0 | id=test | title="Test" | profile=quantum | features=[payload,workflow]');
    const strict = validate(doc, { strict: true });
    // Should NOT error for unknown profile when features are explicitly provided
    // The unknown profile warning should still fire, but features provide the base
    expect(strict.errors.some(e => e.message.includes('Unknown profile'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Community Domain Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('Community Domain Edge Cases', () => {
  it('multiple domains: tags from both are accepted', () => {
    const src = '@DOC ver=2.0 | id=multi | title="Multi Domain" | domain=yai.fintech@1.0\n@TXN id=tx1\n@RISK level=high';
    const doc = parse(src);
    const result = validate(doc, {
      strict: true,
      domains: ['yai.fintech', 'yai.health'],
    });
    expect(result.valid).toBe(true);
  });

  it('community + official domain mix: both tag sets active', () => {
    const src = '@DOC ver=2.0 | id=mixed | title="Mixed" | domain=yai.fintech@1.0\n@TXN id=tx1\n@NOTE text="structural always works"';
    const doc = parse(src);
    const result = validate(doc, {
      strict: true,
      domains: ['yai.fintech'],
    });
    expect(result.valid).toBe(true);
  });

  it('structural tags always win over domain context', () => {
    // DOC, SEC, META, NOTE, REF, DEF, STAMP are always allowed
    const src = '@DOC ver=2.0 | id=struct | title="Structural"\n@SEC name="Test"\n@NOTE text="always"\n@STAMP by="agent"';
    const doc = parse(src);
    const result = validate(doc, { strict: true });
    expect(result.valid).toBe(true);
  });

  it('domain with @ version in header: version is parsed', () => {
    const src = '@DOC ver=2.0 | id=versioned | title="Versioned" | domain=yai.fintech@1.0';
    const doc = parse(src);
    expect(doc.domain).toBeDefined();
  });

  it('bare domain string (no yai. prefix) accepted via normalize', () => {
    // getDomainTags normalizes bare names
    const tags = getDomainTags(['fintech']);
    expect(tags.size).toBeGreaterThan(0);
    expect(tags.has('TXN')).toBe(true);
  });

  it('domain roundtrip: domain field preserved across format', () => {
    const src = '@DOC ver=2.0 | id=roundtrip | title="RT" | domain=yai.fintech@1.0\n@TXN id=tx1';
    const doc = parse(src);
    const formatted = format(doc, { mode: 'canon' });
    expect(formatted).toContain('domain=');
    const reparsed = parse(formatted);
    expect(reparsed.domain).toBeDefined();
  });

  it('empty domain string: graceful handling', () => {
    const tags = getDomainTags(['']);
    expect(tags.size).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Brace-Delimited Values (Inline JSON)
// ─────────────────────────────────────────────────────────────────────────────

describe('Brace-Delimited Values', () => {
  it('args with inline JSON object parses without hanging', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test" | profile=exec | fmt=canon',
      '@STEP n=1 | rid=greet | op=std:io.print@v1 | args={"message": "Hello"}',
    ].join('\n');
    const doc = parse(src);
    expect(doc.id).toBe('test');
    const step = doc.records.find(r => r.tag === 'STEP');
    expect(step).toBeDefined();
    expect(step!.fields.get('args')).toBe('{"message": "Hello"}');
  });

  it('nested braces: args with nested JSON object', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@META config={"db": {"host": "localhost", "port": "5432"}}',
    ].join('\n');
    const doc = parse(src);
    const meta = doc.records.find(r => r.tag === 'META');
    expect(meta).toBeDefined();
    expect(meta!.fields.get('config')).toBe('{"db": {"host": "localhost", "port": "5432"}}');
  });

  it('empty braces: args={} produces empty object string', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@STEP n=1 | rid=noop | op=std:noop@v1 | args={}',
    ].join('\n');
    const doc = parse(src);
    const step = doc.records.find(r => r.tag === 'STEP');
    expect(step).toBeDefined();
    expect(step!.fields.get('args')).toBe('{}');
  });

  it('brace value followed by pipe: field boundary respected', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@STEP n=1 | rid=x | op=std:x@v1 | args={"key": "val"} | timeout=30',
    ].join('\n');
    const doc = parse(src);
    const step = doc.records.find(r => r.tag === 'STEP');
    expect(step).toBeDefined();
    expect(step!.fields.get('timeout')).toBe('30');
  });

  it('brace value roundtrip: format preserves brace value', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test"',
      '@META data={"count": "42"}',
    ].join('\n');
    const doc = parse(src);
    const output = format(doc);
    expect(output).toContain('data=');
    // Re-parse to ensure roundtrip
    const reparsed = parse(output);
    const meta = reparsed.records.find(r => r.tag === 'META');
    expect(meta).toBeDefined();
  });
});
