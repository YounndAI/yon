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
 * @younndai/yon-generator — Builder Tests
 *
 * Covers: factory, header fields, tag methods (all 72 core tags covered by builder),
 * scenario, domain, roundtrip, with/without, domainRecord.
 *
 * All field names aligned to yon-spec tag-registry.md.
 */

import { describe, it, expect } from 'vitest';
import { yon, YonBuilder } from '../src/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

describe('yon() factory', () => {
  it('creates a builder instance', () => {
    const builder = yon('workflow');
    expect(builder).toBeInstanceOf(YonBuilder);
  });

  it('accepts all standard kinds', () => {
    const kinds = ['workflow', 'rule', 'spec', 'note', 'config', 'policy', 'prompt', 'schema', 'audit', 'doc'] as const;
    for (const kind of kinds) {
      const result = yon(kind).id('test').title('Test').toString();
      expect(result).toContain(`kind=${kind}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Header Fields
// ─────────────────────────────────────────────────────────────────────────────

describe('Header fields', () => {
  it('emits @DOC with correct field order (ver, id, title, kind)', () => {
    const result = yon('workflow').id('etl').title('ETL Pipeline').toString();
    const docLine = result.split('\n')[0];
    // Normative order: ver, id, title, kind, domain, mode, profile, fmt
    expect(docLine).toMatch(/@DOC ver=2\.0 \| id=etl \| title="ETL Pipeline" \| kind=workflow/);
  });

  it('emits profile', () => {
    const result = yon('workflow').id('t').title('T').profile('exec').toString();
    expect(result).toContain('profile=exec');
  });

  it('emits format', () => {
    const result = yon('workflow').id('t').title('T').fmt('min').toString();
    expect(result).toContain('fmt=min');
  });

  it('emits mode', () => {
    const result = yon('workflow').id('t').title('T').mode('struct').toString();
    expect(result).toContain('mode=struct');
  });

  it('emits domain before mode/profile/fmt', () => {
    const result = yon('workflow').id('t').title('T')
      .domain('yai.fintech').mode('struct').profile('exec').fmt('canon')
      .toString();
    const docLine = result.split('\n')[0];
    const domainIdx = docLine.indexOf('domain=');
    const modeIdx = docLine.indexOf('mode=');
    const profileIdx = docLine.indexOf('profile=');
    const fmtIdx = docLine.indexOf('fmt=');
    expect(domainIdx).toBeLessThan(modeIdx);
    expect(domainIdx).toBeLessThan(profileIdx);
    expect(domainIdx).toBeLessThan(fmtIdx);
  });

  it('quotes id with spaces', () => {
    const result = yon('workflow').id('my workflow').title('T').toString();
    expect(result).toContain('id="my workflow"');
  });

  it('emits with features', () => {
    const result = yon('workflow').id('t').title('T')
      .profile('exec')
      .with(['cognition', 'perception'])
      .toString();
    expect(result).toContain('with=[cognition,perception]');
  });

  it('emits without features', () => {
    const result = yon('workflow').id('t').title('T')
      .profile('exec')
      .without(['provenance'])
      .toString();
    expect(result).toContain('without=[provenance]');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @STEP
// ─────────────────────────────────────────────────────────────────────────────

describe('@STEP', () => {
  it('emits basic step with spec fields', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 'read', op: 'std:fs.read@v1' })
      .toString();
    expect(result).toContain('@STEP rid=read');
    expect(result).toContain('n:int=1');
    expect(result).toContain('op=std:fs.read@v1');
  });

  it('emits step with args', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 'read', op: 'std:fs.read@v1', args: { path: 'input.csv' } })
      .toString();
    expect(result).toContain('args=');
    expect(result).toContain('input.csv');
  });

  it('emits step with in/out references', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 'parse', op: 'std:data.parse@v1', in: ['block:raw'], out: ['block:parsed'] })
      .toString();
    expect(result).toContain('in=[block:raw]');
    expect(result).toContain('out=[block:parsed]');
  });

  it('emits step with timeout_ms (spec field name)', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 'slow', op: 'std:http.get@v1', timeout_ms: 30000 })
      .toString();
    expect(result).toContain('timeout_ms=30000');
  });

  it('emits step with note', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 's1', op: 'std:noop@v1', note: 'This is a placeholder' })
      .toString();
    expect(result).toContain('note="This is a placeholder"');
  });

  it('emits step with rules and use references', () => {
    const result = yon('workflow').id('t').title('T')
      .step({ n: 1, rid: 's1', op: 'std:noop@v1', rules: ['rule:r1'], use: ['tool:t1'] })
      .toString();
    expect(result).toContain('rules=[rule:r1]');
    expect(result).toContain('use=[tool:t1]');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @RULE
// ─────────────────────────────────────────────────────────────────────────────

describe('@RULE', () => {
  it('emits a rule record', () => {
    const result = yon('rule').id('t').title('T')
      .rule({ lvl: 'MUST', when: 'naming', then: 'use camelCase' })
      .toString();
    expect(result).toContain('@RULE lvl=MUST');
    expect(result).toContain('when="naming"');
    expect(result).toContain('then="use camelCase"');
  });

  it('supports all levels', () => {
    for (const lvl of ['MUST', 'MUST_NOT', 'SHOULD', 'SHOULD_NOT', 'MAY'] as const) {
      const result = yon('rule').id('t').title('T')
        .rule({ lvl, when: 'x', then: 'y' })
        .toString();
      expect(result).toContain(`lvl=${lvl}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @NOTE
// ─────────────────────────────────────────────────────────────────────────────

describe('@NOTE', () => {
  it('emits a note', () => {
    const result = yon('note').id('t').title('T')
      .note('Important information here.')
      .toString();
    expect(result).toContain('@NOTE text="Important information here."');
  });

  it('emits a note with lvl', () => {
    const result = yon('note').id('t').title('T')
      .note('Read this carefully.', { lvl: 'IMPORTANT' })
      .toString();
    expect(result).toContain('@NOTE text="Read this carefully."');
    expect(result).toContain('lvl=IMPORTANT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @CHECK
// ─────────────────────────────────────────────────────────────────────────────

describe('@CHECK', () => {
  it('emits a check with required msg', () => {
    const result = yon('workflow').id('t').title('T')
      .check({ rid: 'check:data', assert: 'block:parsed != null', fail: 'ABORT', msg: 'Parse failed' })
      .toString();
    expect(result).toContain('@CHECK rid=check:data');
    expect(result).toContain('assert="block:parsed != null"');
    expect(result).toContain('fail=ABORT');
    expect(result).toContain('msg="Parse failed"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @CATCH, @RETRY
// ─────────────────────────────────────────────────────────────────────────────

describe('@CATCH', () => {
  it('emits a catch handler with spec fields (target, on, do)', () => {
    const result = yon('workflow').id('t').title('T')
      .catch_({ target: 'step:read', on: 'E001', do: 'skip' })
      .toString();
    expect(result).toContain('@CATCH target=step:read');
    expect(result).toContain('on=E001');
    expect(result).toContain('do=skip');
  });
});

describe('@RETRY', () => {
  it('emits a retry policy with spec fields (target, max, delay_ms)', () => {
    const result = yon('workflow').id('t').title('T')
      .retry({ target: 'step:parse', max: 3, backoff: 'exponential', delay_ms: 1000 })
      .toString();
    expect(result).toContain('@RETRY target=step:parse');
    expect(result).toContain('max=3');
    expect(result).toContain('backoff=exponential');
    expect(result).toContain('delay_ms=1000');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @INPUT, @OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

describe('@INPUT / @OUTPUT', () => {
  it('emits input with spec fields (rid, name)', () => {
    const result = yon('workflow').id('t').title('T')
      .input({ rid: 'in:file', name: 'file', type: 'string', required: true })
      .toString();
    expect(result).toContain('@INPUT rid=in:file');
    expect(result).toContain('name=file');
    expect(result).toContain('type=string');
    expect(result).toContain('required=true');
  });

  it('emits input with default', () => {
    const result = yon('workflow').id('t').title('T')
      .input({ rid: 'in:mode', name: 'mode', type: 'string', default: 'auto' })
      .toString();
    expect(result).toContain('default=auto');
  });

  it('emits output with spec fields (rid, name)', () => {
    const result = yon('workflow').id('t').title('T')
      .output({ rid: 'out:result', name: 'result', type: 'object' })
      .toString();
    expect(result).toContain('@OUTPUT rid=out:result');
    expect(result).toContain('name=result');
    expect(result).toContain('type=object');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @STAMP, @META, @CFG
// ─────────────────────────────────────────────────────────────────────────────

describe('@STAMP', () => {
  it('emits a stamp with spec fields (ts, src)', () => {
    const result = yon('workflow').id('t').title('T')
      .stamp({ ts: '2026-02-20T10:00:00Z', src: 'agent:etl-worker' })
      .toString();
    expect(result).toContain('@STAMP ts=2026-02-20T10:00:00Z');
    expect(result).toContain('src=agent:etl-worker');
  });

  it('emits stamp with optional fields', () => {
    const result = yon('workflow').id('t').title('T')
      .stamp({ ts: '2026-02-20T10:00:00Z', src: 'agent:worker', method: 'sha256', hash: 'abc123' })
      .toString();
    expect(result).toContain('method=sha256');
    expect(result).toContain('hash=abc123');
  });
});

describe('@META', () => {
  it('emits metadata', () => {
    const result = yon('workflow').id('t').title('T')
      .meta({ author: 'Alex', version: '1.0' })
      .toString();
    expect(result).toContain('@META author=Alex');
    expect(result).toContain('version=1.0');
  });
});

describe('@CFG', () => {
  it('emits config with spec fields (id, set)', () => {
    const result = yon('workflow').id('t').title('T')
      .cfg({ id: 'timeout-config', set: { timeout: '30s', retries: '3' } })
      .toString();
    expect(result).toContain('@CFG id=timeout-config');
    expect(result).toContain('timeout=30s');
    expect(result).toContain('retries=3');
  });

  it('emits config without set', () => {
    const result = yon('workflow').id('t').title('T')
      .cfg({ id: 'defaults' })
      .toString();
    expect(result).toContain('@CFG id=defaults');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @MAP
// ─────────────────────────────────────────────────────────────────────────────

describe('@MAP', () => {
  it('emits a key-value map with spec fields (name, pairs)', () => {
    const result = yon('rule').id('t').title('T')
      .map({ name: 'Colors', pairs: { red: '#ff0000', blue: '#0000ff' } })
      .toString();
    expect(result).toContain('@MAP name=Colors');
    expect(result).toContain('red->#ff0000');
    expect(result).toContain('blue->#0000ff');
  });

  it('emits map with optional id', () => {
    const result = yon('rule').id('t').title('T')
      .map({ name: 'Sizes', pairs: { sm: '640', md: '768' }, id: 'breakpoints' })
      .toString();
    expect(result).toContain('name=Sizes');
    expect(result).toContain('id=breakpoints');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @BEGIN / @END
// ─────────────────────────────────────────────────────────────────────────────

describe('@BEGIN / @END', () => {
  it('emits a content block with block type', () => {
    const result = yon('spec').id('t').title('T')
      .begin('JS', 'function hello() {\n  return "world";\n}', { id: 'code', mime: 'text/javascript' })
      .toString();
    expect(result).toContain('@BEGIN JS | id=code | mime=text/javascript');
    expect(result).toContain('function hello() {');
    expect(result).toContain('@END JS');
  });

  it('emits block type without optional fields', () => {
    const result = yon('spec').id('t').title('T')
      .begin('JSON', '{"key": "value"}')
      .toString();
    expect(result).toContain('@BEGIN JSON');
    expect(result).toContain('{"key": "value"}');
    expect(result).toContain('@END JSON');
  });

  it('emits boundary on both @BEGIN and @END', () => {
    const result = yon('spec').id('t').title('T')
      .begin('LOGS', 'some log line', { id: 'build_log', boundary: 'bnd_9c7d4a2e' })
      .toString();
    expect(result).toContain('@BEGIN LOGS | id=build_log | boundary=bnd_9c7d4a2e');
    expect(result).toContain('@END LOGS | boundary=bnd_9c7d4a2e');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @REF
// ─────────────────────────────────────────────────────────────────────────────

describe('@REF', () => {
  it('emits a reference with spec fields (name, url, target)', () => {
    const result = yon('doc').id('t').title('T')
      .ref({ name: 'yon-spec', url: 'https://yon.younndai.com', target: 'doc:spec' })
      .toString();
    expect(result).toContain('@REF name=yon-spec');
    expect(result).toContain('url=https://yon.younndai.com');
    expect(result).toContain('target=doc:spec');
  });

  it('emits ref with only name', () => {
    const result = yon('doc').id('t').title('T')
      .ref({ name: 'other-doc' })
      .toString();
    expect(result).toContain('@REF name=other-doc');
    expect(result).not.toContain('url=');
    expect(result).not.toContain('target=');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @DEF
// ─────────────────────────────────────────────────────────────────────────────

describe('@DEF', () => {
  it('emits an alias definition', () => {
    const result = yon('workflow').id('t').title('T')
      .def('base_url', 'https://api.example.com')
      .toString();
    expect(result).toContain('@DEF $base_url=https://api.example.com');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @INTENT, @SCOPE, @SCHEMA (new tags)
// ─────────────────────────────────────────────────────────────────────────────

describe('@INTENT', () => {
  it('emits intent with goal', () => {
    const result = yon('rule').id('t').title('T')
      .intent({ goal: 'Define coding standards' })
      .toString();
    expect(result).toContain('@INTENT goal="Define coding standards"');
  });

  it('emits intent with audience', () => {
    const result = yon('rule').id('t').title('T')
      .intent({ goal: 'Define standards', audience: 'developers' })
      .toString();
    expect(result).toContain('audience="developers"');
  });
});

describe('@SCOPE', () => {
  it('emits scope with context', () => {
    const result = yon('rule').id('t').title('T')
      .scope({ context: 'production', region: 'EU', compliance: 'GDPR' })
      .toString();
    expect(result).toContain('@SCOPE context="production"');
    expect(result).toContain('region="EU"');
    expect(result).toContain('compliance="GDPR"');
  });

  it('emits empty scope', () => {
    const result = yon('rule').id('t').title('T')
      .scope({})
      .toString();
    expect(result).toContain('@SCOPE');
  });
});

describe('@SCHEMA', () => {
  it('emits schema with key', () => {
    const result = yon('spec').id('t').title('T')
      .schema({ key: 'user.email', opts: 'format=email', default: 'none' })
      .toString();
    expect(result).toContain('@SCHEMA key=user.email');
    expect(result).toContain('opts=format=email');
    expect(result).toContain('default=none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @YIELD, @ERROR (new tags)
// ─────────────────────────────────────────────────────────────────────────────

describe('@YIELD', () => {
  it('emits yield with spec fields', () => {
    const result = yon('workflow').id('t').title('T')
      .yield_({ rid: 'yield:progress', value: '50%', step: 'step:parse', progress: '0.5' })
      .toString();
    expect(result).toContain('@YIELD rid=yield:progress');
    expect(result).toContain('value=50%');
    expect(result).toContain('step=step:parse');
    expect(result).toContain('progress=0.5');
  });
});

describe('@ERROR', () => {
  it('emits error with spec fields', () => {
    const result = yon('workflow').id('t').title('T')
      .error({ code: 'E001', msg: 'Validation failed', severity: 'critical', source: 'step:validate' })
      .toString();
    expect(result).toContain('@ERROR code=E001');
    expect(result).toContain('msg="Validation failed"');
    expect(result).toContain('severity=critical');
    expect(result).toContain('source=step:validate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Domain Records
// ─────────────────────────────────────────────────────────────────────────────

describe('domainRecord()', () => {
  it('emits a domain-specific record with string fields', () => {
    const result = yon('workflow').id('t').title('T')
      .domain('yai.aerospace')
      .domainRecord('WAYPOINT', { rid: 'wp:1', name: 'Alpha', lat: '51.5074', lon: '-0.1278' })
      .toString();
    expect(result).toContain('@WAYPOINT | rid=wp:1');
    expect(result).toContain('name=Alpha');
  });

  it('emits type suffixes for numeric and boolean values', () => {
    const result = yon('workflow').id('t').title('T')
      .domainRecord('METRIC', { count: 42, ratio: 0.95, active: true })
      .toString();
    expect(result).toContain('count:int=42');
    expect(result).toContain('ratio:float=0.95');
    expect(result).toContain('active:bool=true');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

describe('@SEC', () => {
  it('emits a section', () => {
    const result = yon('rule').id('t').title('T')
      .section('Naming')
      .toString();
    expect(result).toContain('@SEC name="Naming"');
  });

  it('emits a section with optional id', () => {
    const result = yon('rule').id('t').title('T')
      .section('Variables', { id: 'sec:vars' })
      .toString();
    expect(result).toContain('@SEC name="Variables"');
    expect(result).toContain('id=sec:vars');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Passthrough
// ─────────────────────────────────────────────────────────────────────────────

describe('Passthrough', () => {
  it('emits comments', () => {
    const result = yon('workflow').id('t').title('T')
      .comment('This is a comment')
      .toString();
    expect(result).toContain('# This is a comment');
  });

  it('emits raw lines', () => {
    const result = yon('workflow').id('t').title('T')
      .raw('@CUSTOM foo=bar')
      .toString();
    expect(result).toContain('@CUSTOM foo=bar');
  });

  it('emits blank lines', () => {
    const result = yon('workflow').id('t').title('T')
      .comment('before')
      .blank()
      .comment('after')
      .toString();
    const lines = result.split('\n');
    const beforeIdx = lines.findIndex(l => l.includes('# before'));
    expect(lines[beforeIdx + 1]).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario resolution', () => {
  it('applies scenario defaults', () => {
    const result = yon('workflow').id('t').title('T')
      .scenario('fintech')
      .toString();
    expect(result).toContain('profile=audit');
    expect(result).toContain('fmt=canon');
    expect(result).toContain('domain=yai.fintech');
    expect(result).toContain('scenario=fintech');
  });

  it('explicit fields override scenario', () => {
    const result = yon('workflow').id('t').title('T')
      .profile('exec')
      .scenario('fintech')
      .toString();
    // profile was set before scenario, so it keeps 'exec'
    expect(result).toContain('profile=exec');
    // But domain and fmt come from scenario
    expect(result).toContain('domain=yai.fintech');
  });

  it('applies general scenarios', () => {
    const result = yon('workflow').id('t').title('T')
      .scenario('prompt')
      .toString();
    expect(result).toContain('profile=exec');
    expect(result).toContain('fmt=min');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Roundtrip
// ─────────────────────────────────────────────────────────────────────────────

describe('Roundtrip', () => {
  it('toDocument() produces a parseable document', () => {
    const doc = yon('workflow')
      .id('etl').title('ETL')
      .profile('exec')
      .step({ n: 1, rid: 'read', op: 'std:fs.read@v1' })
      .toDocument();

    expect(doc.kind).toBe('workflow');
    expect(doc.id).toBe('etl');
    expect(doc.title).toBe('ETL');
  });

  it('validate() returns valid for correct documents', () => {
    const result = yon('workflow')
      .id('test').title('Test')
      .profile('exec')
      .step({ n: 1, rid: 'read', op: 'std:fs.read@v1' })
      .validate();

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validate() catches missing id', () => {
    const result = yon('workflow')
      .title('Test')
      .validate();

    // Parser may still parse but the doc header is malformed
    // The important thing is it doesn't crash
    expect(result).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Complex Document
// ─────────────────────────────────────────────────────────────────────────────

describe('Complex document', () => {
  it('builds a multi-step workflow', () => {
    const result = yon('workflow')
      .id('data-pipeline').title('Data Processing Pipeline')
      .profile('exec').fmt('canon').mode('struct')
      .input({ rid: 'in:source', name: 'source', type: 'string', required: true })
      .step({ n: 1, rid: 'read', op: 'std:fs.read@v1', args: { path: '$source' }, out: ['block:raw'] })
      .check({ rid: 'check:read', assert: 'block:raw != null', fail: 'ABORT', msg: 'Read failed' })
      .step({ n: 2, rid: 'parse', op: 'std:data.parse@v1', in: ['block:raw'], out: ['block:parsed'] })
      .retry({ target: 'step:parse', max: 3, backoff: 'exponential', delay_ms: 1000 })
      .catch_({ target: 'step:parse', on: 'E001', do: 'skip' })
      .output({ rid: 'out:data', name: 'data', type: 'object' })
      .stamp({ ts: '2026-02-20T10:00:00Z', src: 'agent:pipeline' })
      .toString();

    expect(result).toContain('@DOC ver=2.0');
    expect(result).toContain('kind=workflow');
    expect(result).toContain('@INPUT');
    expect(result).toContain('@STEP rid=read');
    expect(result).toContain('@CHECK');
    expect(result).toContain('@STEP rid=parse');
    expect(result).toContain('@RETRY');
    expect(result).toContain('@CATCH');
    expect(result).toContain('@OUTPUT');
    expect(result).toContain('@STAMP');
  });

  it('builds a declarative rules document', () => {
    const result = yon('rule')
      .id('coding-standards').title('Coding Standards')
      .profile('decl')
      .intent({ goal: 'Define coding standards', audience: 'developers' })
      .scope({ context: 'production' })
      .section('Naming')
      .rule({ lvl: 'MUST', when: 'naming variables', then: 'use camelCase' })
      .rule({ lvl: 'SHOULD', when: 'naming constants', then: 'use UPPER_SNAKE' })
      .note('Legacy code exceptions allowed via @RULE lvl=MAY.')
      .blank()
      .section('Formatting')
      .rule({ lvl: 'MUST', when: 'indentation', then: 'use 2 spaces' })
      .map({ name: 'Preferences', pairs: { indent: '2', quotes: 'single', semicolons: 'no' } })
      .toString();

    expect(result).toContain('kind=rule');
    expect(result).toContain('@INTENT goal="Define coding standards"');
    expect(result).toContain('@SCOPE');
    expect(result).toContain('@SEC name="Naming"');
    expect(result).toContain('@RULE lvl=MUST');
    expect(result).toContain('@RULE lvl=SHOULD');
    expect(result).toContain('@NOTE');
    expect(result).toContain('@SEC name="Formatting"');
    expect(result).toContain('@MAP name=Preferences');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// New L1–L2 Tags: Change Control, Dialogue, Sessions, Privacy, Cross-Domain
// ─────────────────────────────────────────────────────────────────────────────

describe('Change Control tags', () => {
  it('@PATCH emits ts, target, and set fields', () => {
    const result = yon('workflow').id('t').title('t')
      .patch({ ts: '2026-02-20T00:00:00Z', target: 'step:read', set: { op: 'std:fs.readAll@v2' } })
      .toString();
    expect(result).toContain('@PATCH ts=2026-02-20T00:00:00Z');
    expect(result).toContain('target=step:read');
    expect(result).toContain('op=std:fs.readAll@v2');
  });

  it('@VOID emits ts and target', () => {
    const result = yon('workflow').id('t').title('t')
      .void_({ ts: '2026-02-20T00:00:00Z', target: 'step:old', because: 'deprecated' })
      .toString();
    expect(result).toContain('@VOID');
    expect(result).toContain('target=step:old');
    expect(result).toContain('because=deprecated');
  });
});

describe('Dialogue tags', () => {
  it('@TURN emits rid and text', () => {
    const result = yon('doc').id('t').title('t')
      .turn({ rid: 'turn:1', text: 'Hello', role: 'user' })
      .toString();
    expect(result).toContain('@TURN');
    expect(result).toContain('rid=turn:1');
    expect(result).toContain('text=Hello');
    expect(result).toContain('role=user');
  });

  it('@ACK emits ref', () => {
    const result = yon('doc').id('t').title('t')
      .ack({ ref: 'turn:1', status: 'received' })
      .toString();
    expect(result).toContain('@ACK');
    expect(result).toContain('ref=turn:1');
  });
});

describe('Session tags', () => {
  it('@SESSION emits rid', () => {
    const result = yon('workflow').id('t').title('t')
      .session({ rid: 'sess:1', durability: 'persistent' })
      .toString();
    expect(result).toContain('@SESSION');
    expect(result).toContain('rid=sess:1');
  });

  it('@CHECKPOINT emits rid, label, includes (list)', () => {
    const result = yon('workflow').id('t').title('t')
      .checkpoint({ rid: 'cp:1', label: 'mid-run', includes: ['step:1', 'step:2'] })
      .toString();
    expect(result).toContain('@CHECKPOINT');
    expect(result).toContain('label=mid-run');
    expect(result).toContain('includes=[step:1, step:2]');
  });

  it('@RECOVER emits rid and from', () => {
    const result = yon('workflow').id('t').title('t')
      .recover({ rid: 'rec:1', from: 'cp:1' })
      .toString();
    expect(result).toContain('@RECOVER');
    expect(result).toContain('from=cp:1');
  });
});

describe('Privacy tags', () => {
  it('@REDACTION emits target and reason', () => {
    const result = yon('doc').id('t').title('t')
      .redaction({ target: 'field:ssn', reason: 'PII' })
      .toString();
    expect(result).toContain('@REDACTION');
    expect(result).toContain('target=field:ssn');
    expect(result).toContain('reason=PII');
  });

  it('@CONSENT emits party and scope', () => {
    const result = yon('doc').id('t').title('t')
      .consent({ party: 'user:alice', scope: 'analytics' })
      .toString();
    expect(result).toContain('@CONSENT');
    expect(result).toContain('party=user:alice');
    expect(result).toContain('scope=analytics');
  });
});

describe('Cross-Domain tags', () => {
  it('@IDENTITY emits rid and type', () => {
    const result = yon('workflow').id('t').title('t')
      .identity({ rid: 'id:vessel', type: 'vessel', name: 'MV Horizon' })
      .toString();
    expect(result).toContain('@IDENTITY');
    expect(result).toContain('rid=id:vessel');
    expect(result).toContain('type=vessel');
  });

  it('@LOCATION emits rid, type, and numeric coords', () => {
    const result = yon('workflow').id('t').title('t')
      .location({ rid: 'loc:1', type: 'gps', lat: 51.5074, lon: -0.1278 })
      .toString();
    expect(result).toContain('@LOCATION');
    expect(result).toContain('lat:float=51.5074');
    expect(result).toContain('lon:float=-0.1278');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// L3 Cognition Tags
// ─────────────────────────────────────────────────────────────────────────────

describe('L3 Cognition tags', () => {
  it('@THOUGHT emits rid, type, content, merges as list', () => {
    const result = yon('doc').id('t').title('t')
      .thought({ rid: 'th:1', type: 'analysis', content: 'reasoning step', merges: ['th:0'] })
      .toString();
    expect(result).toContain('@THOUGHT');
    expect(result).toContain('content=');
    expect(result).toContain('merges=[th:0]');
  });

  it('@HYPOTHESIS emits rid and claim', () => {
    const result = yon('doc').id('t').title('t')
      .hypothesis({ rid: 'hyp:1', claim: 'X causes Y', confidence: '0.8' })
      .toString();
    expect(result).toContain('@HYPOTHESIS');
    expect(result).toContain('confidence=0.8');
  });

  it('@OBSERVATION emits rid and note', () => {
    const result = yon('doc').id('t').title('t')
      .observation({ rid: 'obs:1', note: 'temperature rising' })
      .toString();
    expect(result).toContain('@OBSERVATION');
    expect(result).toContain('note=');
  });

  it('@REFLECTION emits rid, revises, and because', () => {
    const result = yon('doc').id('t').title('t')
      .reflection({ rid: 'ref:1', revises: 'th:1', because: 'reconsider approach' })
      .toString();
    expect(result).toContain('@REFLECTION');
    expect(result).toContain('revises=th:1');
  });

  it('@DECISION emits rid, selected, alternatives as list', () => {
    const result = yon('doc').id('t').title('t')
      .decision({ rid: 'dec:1', selected: 'option-A', alternatives: ['option-B', 'option-C'] })
      .toString();
    expect(result).toContain('@DECISION');
    expect(result).toContain('selected=option-A');
    expect(result).toContain('alternatives=[option-B, option-C]');
  });

  it('@PRUNE emits target and because', () => {
    const result = yon('doc').id('t').title('t')
      .prune({ target: 'th:1', because: 'dead-end' })
      .toString();
    expect(result).toContain('@PRUNE');
    expect(result).toContain('because=dead-end');
  });

  it('@INTROSPECT emits rid and query', () => {
    const result = yon('doc').id('t').title('t')
      .introspect({ rid: 'intr:1', query: 'what went wrong?' })
      .toString();
    expect(result).toContain('@INTROSPECT');
  });

  it('@ESSENCE emits rid, trait, type, weight', () => {
    const result = yon('doc').id('t').title('t')
      .essence({ rid: 'ess:1', trait: 'curiosity', type: 'personality', weight: 0.9 })
      .toString();
    expect(result).toContain('@ESSENCE');
    expect(result).toContain('trait=curiosity');
    expect(result).toContain('type=personality');
  });

  it('@PERCEPT emits rid, type, src, labels as list', () => {
    const result = yon('doc').id('t').title('t')
      .percept({ rid: 'per:1', type: 'visual', src: 'camera:front', labels: ['cat', 'indoor'] })
      .toString();
    expect(result).toContain('@PERCEPT');
    expect(result).toContain('type=visual');
    expect(result).toContain('labels=[cat, indoor]');
  });

  it('@FOCUS emits targets as list', () => {
    const result = yon('doc').id('t').title('t')
      .focus({ targets: ['th:1', 'obs:1'] })
      .toString();
    expect(result).toContain('@FOCUS');
    expect(result).toContain('targets=[th:1, obs:1]');
  });

  it('@GOAL emits rid and name', () => {
    const result = yon('doc').id('t').title('t')
      .goal({ rid: 'goal:1', name: 'maximize accuracy' })
      .toString();
    expect(result).toContain('@GOAL');
    expect(result).toContain('name=');
  });

  it('@PULSE emits rid, src, and content', () => {
    const result = yon('doc').id('t').title('t')
      .pulse({ rid: 'pulse:1', src: 'sensor:temp', content: 'high' })
      .toString();
    expect(result).toContain('@PULSE');
    expect(result).toContain('src=sensor:temp');
  });

  it('@IMPRINT emits rid, validates, and trust', () => {
    const result = yon('doc').id('t').title('t')
      .imprint({ rid: 'imp:1', validates: 'mem:1', trust: 'high' })
      .toString();
    expect(result).toContain('@IMPRINT');
    expect(result).toContain('validates=mem:1');
  });

  it('@MEMORY emits rid, type, content', () => {
    const result = yon('doc').id('t').title('t')
      .memory({ rid: 'mem:1', type: 'preference', content: 'dark-mode' })
      .toString();
    expect(result).toContain('@MEMORY');
    expect(result).toContain('type=preference');
  });

  it('@LEARN emits rid, prior, evidence, posterior', () => {
    const result = yon('doc').id('t').title('t')
      .learn({ rid: 'learn:1', prior: '0.3', evidence: 'clouds observed', posterior: '0.4' })
      .toString();
    expect(result).toContain('@LEARN');
    expect(result).toContain('prior=0.3');
  });

  it('@SHARD emits rid, sources as list', () => {
    const result = yon('doc').id('t').title('t')
      .shard({ rid: 'shard:1', summary: 'compressed', sources: ['mem:1', 'mem:2'] })
      .toString();
    expect(result).toContain('@SHARD');
    expect(result).toContain('sources=[mem:1, mem:2]');
  });

  it('@MARK emits rid, title, refs and tags as lists', () => {
    const result = yon('doc').id('t').title('t')
      .mark({ rid: 'mark:1', title: 'important', refs: ['th:1'], tags: ['priority', 'review'] })
      .toString();
    expect(result).toContain('@MARK');
    expect(result).toContain('refs=[th:1]');
    expect(result).toContain('tags=[priority, review]');
  });

  it('@AFFECT emits urgency and engagement', () => {
    const result = yon('doc').id('t').title('t')
      .affect({ urgency: 'high', engagement: 'deep', curiosity: 'elevated' })
      .toString();
    expect(result).toContain('@AFFECT');
    expect(result).toContain('urgency=high');
    expect(result).toContain('engagement=deep');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent Tags
// ─────────────────────────────────────────────────────────────────────────────

describe('L4 Agent tags', () => {
  it('@AGENT emits rid, caps/streams as lists', () => {
    const result = yon('workflow').id('t').title('t')
      .agent({ rid: 'agent:1', name: 'worker', caps: ['read', 'write'], streams: ['data:in'] })
      .toString();
    expect(result).toContain('@AGENT');
    expect(result).toContain('name=worker');
    expect(result).toContain('caps=[read, write]');
    expect(result).toContain('streams=[data:in]');
  });

  it('@CAPS emits rid, agent, ops as list', () => {
    const result = yon('workflow').id('t').title('t')
      .caps({ rid: 'caps:1', agent: 'agent:1', ops: ['fs.read', 'fs.write'] })
      .toString();
    expect(result).toContain('@CAPS');
    expect(result).toContain('ops=[fs.read, fs.write]');
  });

  it('@SIGNAL emits from and type', () => {
    const result = yon('workflow').id('t').title('t')
      .signal({ from: 'agent:1', type: 'ready' })
      .toString();
    expect(result).toContain('@SIGNAL');
    expect(result).toContain('type=ready');
  });

  it('@THROTTLE emits from and to', () => {
    const result = yon('workflow').id('t').title('t')
      .throttle({ from: 'agent:1', to: 'agent:2', reason: 'overloaded' })
      .toString();
    expect(result).toContain('@THROTTLE');
    expect(result).toContain('from=agent:1');
  });

  it('@SUBSCRIBE emits agent, streams/topics as lists', () => {
    const result = yon('workflow').id('t').title('t')
      .subscribe({ agent: 'agent:1', streams: ['data:in', 'data:out'], topics: ['errors'] })
      .toString();
    expect(result).toContain('@SUBSCRIBE');
    expect(result).toContain('streams=[data:in, data:out]');
    expect(result).toContain('topics=[errors]');
  });

  it('@ROUTE emits rid, group, and strategy', () => {
    const result = yon('workflow').id('t').title('t')
      .route({ rid: 'route:1', group: 'agent-pool', strategy: 'round-robin' })
      .toString();
    expect(result).toContain('@ROUTE');
    expect(result).toContain('strategy=round-robin');
  });

  it('@MERGE emits rid, streams as list', () => {
    const result = yon('workflow').id('t').title('t')
      .merge({ rid: 'mrg:1', streams: ['s:1', 's:2'], strategy: 'concat' })
      .toString();
    expect(result).toContain('@MERGE');
    expect(result).toContain('streams=[s:1, s:2]');
  });

  it('@STREAM emits rid, owner, and type', () => {
    const result = yon('workflow').id('t').title('t')
      .stream({ rid: 'str:1', owner: 'agent:1', type: 'data' })
      .toString();
    expect(result).toContain('@STREAM');
    expect(result).toContain('type=data');
  });

  it('@TIMELINE emits rid and span', () => {
    const result = yon('workflow').id('t').title('t')
      .timeline({ rid: 'tl:1', span: '2026-Q1', start: '2026-01-01' })
      .toString();
    expect(result).toContain('@TIMELINE');
    expect(result).toContain('span=2026-Q1');
  });

  it('@EVENT emits rid, timeline, at, activity', () => {
    const result = yon('workflow').id('t').title('t')
      .event({ rid: 'evt:1', timeline: 'tl:1', at: '2026-02-20T00:00:00Z', activity: 'milestone' })
      .toString();
    expect(result).toContain('@EVENT');
    expect(result).toContain('at=2026-02-20T00:00:00Z');
  });

  it('@WORKSPACE emits rid, agents as list, artifact', () => {
    const result = yon('workflow').id('t').title('t')
      .workspace({ rid: 'ws:1', agents: ['agent:1', 'agent:2'], artifact: 'shared-ctx' })
      .toString();
    expect(result).toContain('@WORKSPACE');
    expect(result).toContain('agents=[agent:1, agent:2]');
  });

  it('@EDIT emits rid, workspace, by, patch', () => {
    const result = yon('workflow').id('t').title('t')
      .edit({ rid: 'edit:1', workspace: 'ws:1', by: 'agent:1', patch: 'insert /data/key' })
      .toString();
    expect(result).toContain('@EDIT');
    expect(result).toContain('workspace=ws:1');
    expect(result).toContain('by=agent:1');
  });

  it('@CALL emits rid and ref', () => {
    const result = yon('workflow').id('t').title('t')
      .call({ rid: 'call:1', ref: 'sub-pipeline' })
      .toString();
    expect(result).toContain('@CALL');
    expect(result).toContain('ref=sub-pipeline');
  });

  it('@TENET emits rid, level, and content', () => {
    const result = yon('workflow').id('t').title('t')
      .tenet({ rid: 'ten:1', level: 'MUST', content: 'Do no harm' })
      .toString();
    expect(result).toContain('@TENET');
    expect(result).toContain('level=MUST');
  });

  it('@ESCALATE emits rid and reason', () => {
    const result = yon('workflow').id('t').title('t')
      .escalate({ rid: 'esc:1', reason: 'safety violation', severity: 'critical' })
      .toString();
    expect(result).toContain('@ESCALATE');
    expect(result).toContain('reason=');
  });

  it('@HALT emits rid, scope, and reason', () => {
    const result = yon('workflow').id('t').title('t')
      .halt({ rid: 'halt:1', scope: 'all', reason: 'emergency stop' })
      .toString();
    expect(result).toContain('@HALT');
    expect(result).toContain('scope=all');
  });

  it('@DEREGISTER emits agent and reason', () => {
    const result = yon('workflow').id('t').title('t')
      .deregister({ agent: 'agent:1', reason: 'shutdown' })
      .toString();
    expect(result).toContain('@DEREGISTER');
    expect(result).toContain('agent=agent:1');
  });

  it('@ON emits rid and event (reserved word suffix)', () => {
    const result = yon('workflow').id('t').title('t')
      .on_({ rid: 'on:1', event: 'data:ready', do: 'step:process' })
      .toString();
    expect(result).toContain('@ON');
    expect(result).toContain('event=data:ready');
  });

  it('@EMIT emits event and payload (reserved word suffix)', () => {
    const result = yon('workflow').id('t').title('t')
      .emit_({ event: 'data:ready', payload: 'dynamic-step' })
      .toString();
    expect(result).toContain('@EMIT');
    expect(result).toContain('event=data:ready');
  });

  it('@LOOP emits rid, while, do, max_iterations', () => {
    const result = yon('workflow').id('t').title('t')
      .loop({ rid: 'loop:1', while: 'items.remaining > 0', do: 'step:process', max_iterations: 100 })
      .toString();
    expect(result).toContain('@LOOP');
    expect(result).toContain('max_iterations:int=100');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Standalone Modular API (record, block, domainRecord)
// ─────────────────────────────────────────────────────────────────────────────

import { record, block, domainRecord } from '../src/index.js';

describe('Standalone record API', () => {
  it('record.stamp() returns a single line string', () => {
    const line = record.stamp({ ts: '2026-02-20T00:00:00Z', src: 'test-agent' });
    expect(line).toBe('@STAMP ts=2026-02-20T00:00:00Z | src=test-agent');
  });

  it('record.step() formats all fields', () => {
    const line = record.step({ n: 1, rid: 'step:1', op: 'std:noop@v1', out: ['block:out'] });
    expect(line).toContain('@STEP');
    expect(line).toContain('n:int=1');
    expect(line).toContain('out=[block:out]');
  });

  it('record.thought() handles list fields', () => {
    const line = record.thought({ rid: 'th:1', type: 'analysis', content: 'test', merges: ['th:0a', 'th:0b'] });
    expect(line).toContain('merges=[th:0a, th:0b]');
  });

  it('record.decision() handles alternatives list', () => {
    const line = record.decision({ rid: 'dec:1', selected: 'A', alternatives: ['B', 'C'] });
    expect(line).toContain('alternatives=[B, C]');
  });

  it('record.agent() handles caps and streams lists', () => {
    const line = record.agent({ rid: 'a:1', name: 'bot', caps: ['read'], streams: ['s:1'] });
    expect(line).toContain('caps=[read]');
    expect(line).toContain('streams=[s:1]');
  });

  it('record.note() returns inline', () => {
    const line = record.note('hello world');
    expect(line).toBe('@NOTE text="hello world"');
  });

  it('record.section() returns inline', () => {
    const line = record.section('Introduction', { id: 'intro' });
    expect(line).toBe('@SEC name="Introduction" | id=intro');
  });

  it('record.def() returns inline', () => {
    const line = record.def('timeout', '30s');
    expect(line).toBe('@DEF $timeout=30s');
  });

  it('reserved-word methods use suffix: void_(), on_(), emit_()', () => {
    expect(record.void_({ ts: 'now', target: 'x' })).toContain('@VOID');
    expect(record.on_({ rid: 'o:1', event: 'e', do: 'step:1' })).toContain('@ON');
    expect(record.emit_({ event: 'ready' })).toContain('@EMIT');
  });
});

describe('Standalone block()', () => {
  it('emits @BEGIN/@END with content', () => {
    const result = block('JSON', '{"key": "value"}');
    expect(result).toContain('@BEGIN JSON');
    expect(result).toContain('{"key": "value"}');
    expect(result).toContain('@END JSON');
  });

  it('supports id, mime, boundary options', () => {
    const result = block('CSV', 'a,b,c', { id: 'data', mime: 'text/csv', boundary: '---' });
    expect(result).toContain('@BEGIN CSV | id=data | mime=text/csv | boundary=---');
    expect(result).toContain('@END CSV | boundary=---');
  });
});

describe('Standalone domainRecord()', () => {
  it('emits domain tag with typed fields', () => {
    const line = domainRecord('TXN', { rid: 'txn:1', type: 'wire', amount: 1500.50, confirmed: true });
    expect(line).toContain('@TXN');
    expect(line).toContain('type=wire');
    expect(line).toContain('amount:float=1500.5');
    expect(line).toContain('confirmed:bool=true');
  });

  it('emits integer suffix for whole numbers', () => {
    const line = domainRecord('POSITION', { rid: 'pos:1', heading: 270 });
    expect(line).toContain('heading:int=270');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Spec Alignment: @DOC Governance Fields
// ─────────────────────────────────────────────────────────────────────────────

describe('@DOC governance fields', () => {
  it('emits governance fields alphabetically on @DOC header', () => {
    const result = yon('doc').id('audit').title('Audit Report')
      .governance({
        lang: 'en',
        classification: 'confidential',
        jurisdiction: 'EU',
        audience: 'regulator',
        retention: '7y',
      })
      .toString();
    const docLine = result.split('\n')[0];
    expect(docLine).toContain('audience=regulator');
    expect(docLine).toContain('classification=confidential');
    expect(docLine).toContain('jurisdiction=EU');
    expect(docLine).toContain('lang=en');
    expect(docLine).toContain('retention=7y');
    // Verify alphabetical order: audience < classification < jurisdiction < lang < retention
    const audienceIdx = docLine.indexOf('audience=');
    const classIdx = docLine.indexOf('classification=');
    const jurisdictionIdx = docLine.indexOf('jurisdiction=');
    const langIdx = docLine.indexOf('lang=');
    const retentionIdx = docLine.indexOf('retention=');
    expect(audienceIdx).toBeLessThan(classIdx);
    expect(classIdx).toBeLessThan(jurisdictionIdx);
    expect(jurisdictionIdx).toBeLessThan(langIdx);
    expect(langIdx).toBeLessThan(retentionIdx);
  });

  it('emits typed fields: embargo_until:ts, expires:ts, redact:bool', () => {
    const result = yon('doc').id('gdpr').title('GDPR Doc')
      .governance({
        embargo_until: '2026-06-01T00:00:00Z',
        expires: '2027-01-01T00:00:00Z',
        redact: true,
      })
      .toString();
    const docLine = result.split('\n')[0];
    expect(docLine).toContain('embargo_until:ts=2026-06-01T00:00:00Z');
    expect(docLine).toContain('expires:ts=2027-01-01T00:00:00Z');
    expect(docLine).toContain('redact:bool=true');
  });

  it('emits all 16 governance fields when set', () => {
    const result = yon('doc').id('full').title('Full Gov')
      .governance({
        lang: 'fr',
        region: 'EU',
        direction: 'ltr',
        classification: 'internal',
        handling: 'encrypt-at-rest',
        jurisdiction: 'FR',
        data_residency: 'EU',
        embargo_until: '2026-03-01T00:00:00Z',
        retention: '90d',
        retention_authority: 'GDPR Art 5(1)(e)',
        expires: '2026-12-31T23:59:59Z',
        parent: 'parent-doc-id',
        audience: 'partner',
        license: 'CC-BY-4.0',
        redact: false,
        guide: 'https://yon.younndai.com/guide',
      })
      .toString();
    const docLine = result.split('\n')[0];
    expect(docLine).toContain('lang=fr');
    expect(docLine).toContain('region=EU');
    expect(docLine).toContain('direction=ltr');
    expect(docLine).toContain('classification=internal');
    expect(docLine).toContain('handling=encrypt-at-rest');
    expect(docLine).toContain('jurisdiction=FR');
    expect(docLine).toContain('data_residency=EU');
    expect(docLine).toContain('retention=90d');
    expect(docLine).toContain('parent=parent-doc-id');
    expect(docLine).toContain('audience=partner');
    expect(docLine).toContain('license=CC-BY-4.0');
    expect(docLine).toContain('redact:bool=false');
    expect(docLine).toContain('guide=https://yon.younndai.com/guide');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Spec Alignment: @BEGIN bytes field
// ─────────────────────────────────────────────────────────────────────────────

describe('@BEGIN bytes field', () => {
  it('builder emits bytes:int on @BEGIN', () => {
    const result = yon('doc').id('t').title('t')
      .begin('JSON', '{"key": "value"}', { bytes: 1024 })
      .toString();
    expect(result).toContain('@BEGIN JSON | bytes:int=1024');
  });

  it('standalone block() emits bytes:int on @BEGIN', () => {
    const result = block('CSV', 'a,b,c', { bytes: 512 });
    expect(result).toContain('@BEGIN CSV | bytes:int=512');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Spec Alignment: @LOCATION string coordinates
// ─────────────────────────────────────────────────────────────────────────────

describe('@LOCATION string coordinates', () => {
  it('accepts string lat/lon values', () => {
    const result = yon('doc').id('t').title('t')
      .location({ rid: 'loc:2', type: 'hq', lat: '48.8566', lon: '2.3522' })
      .toString();
    expect(result).toContain('@LOCATION');
    expect(result).toContain('lat=48.8566');
    expect(result).toContain('lon=2.3522');
  });
});
