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
 * YON 2.0 Profile & Tag Validation Tests
 *
 * Tests profile resolution, feature cascading, and tag
 * acceptance/rejection for the 3 new profiles and 11 new features.
 */

import { describe, it, expect } from 'vitest';
import { parse, validate } from '../src/index.js';
import { PROFILE_PRESETS, FEATURE_TAGS, type YonProfile, type YonFeature } from '../src/types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function doc(profile: string, body: string): string {
  return `@DOC ver=2.0 | id=test | title="Test" | profile=${profile} | fmt=min\n${body}`;
}

function validateStrict(src: string) {
  return validate(parse(src), { strict: true });
}

function validateLenient(src: string) {
  return validate(parse(src), { strict: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Presets
// ─────────────────────────────────────────────────────────────────────────────

describe('Profile Presets (2.0)', () => {
  it('cognitive includes exec features + Layer 3', () => {
    const features = PROFILE_PRESETS.cognitive;
    // Must include exec base
    expect(features).toContain('payload');
    expect(features).toContain('logic');
    expect(features).toContain('workflow');
    expect(features).toContain('refs');
    expect(features).toContain('delta');
    // Must include Layer 3
    expect(features).toContain('cognition');
    expect(features).toContain('perception');
    expect(features).toContain('goals');
    expect(features).toContain('memory');
    expect(features).toContain('affect');
    // Must NOT include provenance or Layer 4
    expect(features).not.toContain('provenance');
    expect(features).not.toContain('temporal');
    expect(features).not.toContain('signaling');
  });

  it('agent includes cognitive + Layer 4 + signaling', () => {
    const features = PROFILE_PRESETS.agent;
    // Must include cognitive base
    expect(features).toContain('cognition');
    expect(features).toContain('memory');
    // Must include Layer 4
    expect(features).toContain('temporal');
    expect(features).toContain('affect');
    expect(features).toContain('collaboration');
    expect(features).toContain('composition');
    expect(features).toContain('governance');
    expect(features).toContain('reactive');
    expect(features).toContain('signaling');
    // Must NOT include provenance
    expect(features).not.toContain('provenance');
  });

  it('full includes every feature including provenance', () => {
    const features = PROFILE_PRESETS.full;
    const allFeatures = Object.keys(FEATURE_TAGS) as YonFeature[];
    for (const feature of allFeatures) {
      expect(features).toContain(feature);
    }
  });

  it('all profiles are defined', () => {
    const profiles: YonProfile[] = ['core', 'decl', 'exec', 'audit', 'cognitive', 'agent', 'full'];
    for (const p of profiles) {
      expect(PROFILE_PRESETS[p]).toBeDefined();
      expect(PROFILE_PRESETS[p].length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tag Acceptance — cognitive profile
// ─────────────────────────────────────────────────────────────────────────────

describe('Tag Acceptance: cognitive profile', () => {
  it('accepts @THOUGHT', () => {
    const r = validateStrict(doc('cognitive', '@THOUGHT rid=t:1 | type=deliberation | content="test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @HYPOTHESIS', () => {
    const r = validateStrict(doc('cognitive', '@HYPOTHESIS rid=h:1 | claim="test" | confidence:float=0.8'));
    expect(r.valid).toBe(true);
  });

  it('accepts @OBSERVATION', () => {
    const r = validateStrict(doc('cognitive', '@OBSERVATION rid=o:1 | note="test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @REFLECTION', () => {
    const r = validateStrict(doc('cognitive', '@REFLECTION rid=r:1 | because="test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @DECISION', () => {
    const r = validateStrict(doc('cognitive', '@DECISION rid=d:1 | selected="option_a"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @PRUNE', () => {
    const r = validateStrict(doc('cognitive', '@PRUNE target=rid:t:1 | mode=soft'));
    expect(r.valid).toBe(true);
  });

  it('accepts @INTROSPECT', () => {
    const r = validateStrict(doc('cognitive', '@INTROSPECT rid=i:1 | query="status?"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @ESSENCE', () => {
    const r = validateStrict(doc('cognitive', '@ESSENCE rid=e:1 | trait="analytical"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @PERCEPT', () => {
    const r = validateStrict(doc('cognitive', '@PERCEPT rid=p:1 | type=text'));
    expect(r.valid).toBe(true);
  });

  it('accepts @FOCUS', () => {
    const r = validateStrict(doc('cognitive', '@FOCUS targets=[rid:t:1] | reason="key signal"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @GOAL', () => {
    const r = validateStrict(doc('cognitive', '@GOAL rid=g:1 | name="test" | status=active'));
    expect(r.valid).toBe(true);
  });

  it('accepts @MEMORY', () => {
    const r = validateStrict(doc('cognitive', '@MEMORY rid=m:1 | type=semantic | content="test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @LEARN', () => {
    const r = validateStrict(doc('cognitive', '@LEARN rid=l:1 | prior="old" | posterior="new"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @PULSE', () => {
    const r = validateStrict(doc('cognitive', '@PULSE rid=p:1 | src=agent:monitor | type=signal'));
    expect(r.valid).toBe(true);
  });

  it('accepts @IMPRINT', () => {
    const r = validateStrict(doc('cognitive', '@IMPRINT rid=i:1 | trust:float=0.9'));
    expect(r.valid).toBe(true);
  });

  it('accepts @SHARD', () => {
    const r = validateStrict(doc('cognitive', '@SHARD rid=s:1 | sources=[rid:m:1]'));
    expect(r.valid).toBe(true);
  });

  it('accepts @MARK', () => {
    const r = validateStrict(doc('cognitive', '@MARK rid=mk:1 | refs=[rid:m:1] | title="test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @AFFECT (Layer 3 — Cognition Spec)', () => {
    const r = validateStrict(doc('cognitive', '@AFFECT urgency:float=0.8'));
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tag Acceptance — agent profile
// ─────────────────────────────────────────────────────────────────────────────

describe('Tag Acceptance: agent profile', () => {
  it('accepts @TIMELINE', () => {
    const r = validateStrict(doc('agent', '@TIMELINE rid=tl:1 | span="3 days"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @EVENT', () => {
    const r = validateStrict(doc('agent', '@EVENT rid=e:1 | at="09:00"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @AFFECT (inherited from cognitive)', () => {
    const r = validateStrict(doc('agent', '@AFFECT urgency:float=0.8'));
    expect(r.valid).toBe(true);
  });

  it('accepts @WORKSPACE', () => {
    const r = validateStrict(doc('agent', '@WORKSPACE rid=ws:1 | agents=[agent:a]'));
    expect(r.valid).toBe(true);
  });

  it('accepts @EDIT', () => {
    const r = validateStrict(doc('agent', '@EDIT rid=ed:1 | by=agent:a'));
    expect(r.valid).toBe(true);
  });

  it('accepts @CALL', () => {
    const r = validateStrict(doc('agent', '@CALL rid=call:1 | ref=file:test.yon'));
    expect(r.valid).toBe(true);
  });

  it('accepts @TENET', () => {
    const r = validateStrict(doc('agent', '@TENET rid=t:1 | level=L1 | content="rule"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @ESCALATE', () => {
    const r = validateStrict(doc('agent', '@ESCALATE rid=esc:1 | reason="risk"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @HALT', () => {
    const r = validateStrict(doc('agent', '@HALT rid=h:1 | reason="runaway"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @DEREGISTER', () => {
    const r = validateStrict(doc('agent', '@DEREGISTER agent=agent:a | reason="done"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @ON', () => {
    const r = validateStrict(doc('agent', '@ON rid=on:1 | event=fs:change'));
    expect(r.valid).toBe(true);
  });

  it('accepts @EMIT', () => {
    const r = validateStrict(doc('agent', '@EMIT rid=em:1 | event=status:done'));
    expect(r.valid).toBe(true);
  });

  it('accepts @LOOP', () => {
    const r = validateStrict(doc('agent', '@LOOP rid=l:1 | while="ref:x < 3"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @AGENT', () => {
    const r = validateStrict(doc('agent', '@AGENT rid=agent:a | name="Test"'));
    expect(r.valid).toBe(true);
  });

  it('accepts @CAPS', () => {
    const r = validateStrict(doc('agent', '@CAPS rid=caps:a | agent=agent:a'));
    expect(r.valid).toBe(true);
  });

  it('accepts @SUBSCRIBE', () => {
    const r = validateStrict(doc('agent', '@SUBSCRIBE agent=agent:a | topics=[task:*]'));
    expect(r.valid).toBe(true);
  });

  it('accepts @ROUTE', () => {
    const r = validateStrict(doc('agent', '@ROUTE rid=r:1 | group=workers'));
    expect(r.valid).toBe(true);
  });

  it('accepts @SIGNAL', () => {
    const r = validateStrict(doc('agent', '@SIGNAL from=agent:a | type=heartbeat'));
    expect(r.valid).toBe(true);
  });

  it('accepts @THROTTLE', () => {
    const r = validateStrict(doc('agent', '@THROTTLE from=agent:a | to=agent:b'));
    expect(r.valid).toBe(true);
  });

  it('accepts @MERGE', () => {
    const r = validateStrict(doc('agent', '@MERGE rid=m:1 | streams=[agent:a,agent:b]'));
    expect(r.valid).toBe(true);
  });

  it('accepts @STREAM', () => {
    const r = validateStrict(doc('agent', '@STREAM rid=st:1 | type=incremental'));
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tag Rejection — profile boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe('Tag Rejection: profile boundaries', () => {
  it('core rejects @THOUGHT (strict=error)', () => {
    const r = validateStrict(doc('core', '@THOUGHT rid=t:1 | content="test"'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('THOUGHT'))).toBe(true);
  });

  it('core rejects @THOUGHT (lenient=warn)', () => {
    const r = validateLenient(doc('core', '@THOUGHT rid=t:1 | content="test"'));
    expect(r.valid).toBe(true);
    expect(r.warnings.some(w => w.message.includes('THOUGHT'))).toBe(true);
  });

  it('core rejects @TIMELINE (strict=error)', () => {
    const r = validateStrict(doc('core', '@TIMELINE rid=tl:1 | span="1d"'));
    expect(r.valid).toBe(false);
  });

  it('cognitive rejects @TIMELINE (strict=error)', () => {
    const r = validateStrict(doc('cognitive', '@TIMELINE rid=tl:1 | span="1d"'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('TIMELINE'))).toBe(true);
  });

  it('cognitive rejects @AGENT (strict=error)', () => {
    const r = validateStrict(doc('cognitive', '@AGENT rid=agent:a | name="Test"'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('AGENT'))).toBe(true);
  });

  it('exec rejects @MEMORY (strict=error)', () => {
    const r = validateStrict(doc('exec', '@MEMORY rid=m:1 | content="test"'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('MEMORY'))).toBe(true);
  });

  it('decl rejects @STEP (strict=error)', () => {
    const r = validateStrict(doc('decl', '@STEP rid=s:1 | n:int=1 | op=std:noop@v1'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('STEP'))).toBe(true);
  });

  // F1: @STAMP is a STRUCTURAL_TAG — always allowed regardless of provenance feature.
  // The provenance feature only REQUIRES @STAMP when enabled (audit/full); it never prevents it.
  it('agent accepts @STAMP (structural tag, always allowed)', () => {
    const r = validateStrict(doc('agent', '@STAMP rid=stamp:1 | agent=validator | ts:ts=2026-02-10T14:00:00Z'));
    expect(r.valid).toBe(true);
  });

  // F2: full includes provenance — @STAMP must be accepted
  it('full accepts @STAMP (has provenance)', () => {
    const r = validateStrict(doc('full', '@STAMP rid=stamp:1 | agent=validator | ts:ts=2026-02-10T14:00:00Z'));
    expect(r.valid).toBe(true);
  });

  // F3: cognitive includes exec features — @STEP must be accepted
  it('cognitive accepts @STEP (inherits exec)', () => {
    const r = validateStrict(doc('cognitive', '@STEP rid=s:1 | n:int=1 | op=std:sys.info@v1'));
    expect(r.valid).toBe(true);
  });

  // F4: @STREAM requires signaling feature (agent+)
  it('core rejects @STREAM (strict=error)', () => {
    const r = validateStrict(doc('core', '@STREAM rid=st:1 | type=incremental'));
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('STREAM'))).toBe(true);
  });

  // F5: New structural tags — always accepted in all profiles
  it('core accepts @REDACTION (structural)', () => {
    const r = validateStrict(doc('core', '@REDACTION target="pii" | method=mask'));
    expect(r.valid).toBe(true);
  });

  it('core accepts @CONSENT (structural)', () => {
    const r = validateStrict(doc('core', '@CONSENT purpose="data-processing" | granted:bool=true'));
    expect(r.valid).toBe(true);
  });

  it('core accepts @IDENTITY (structural)', () => {
    const r = validateStrict(doc('core', '@IDENTITY agent="system" | role=operator'));
    expect(r.valid).toBe(true);
  });

  it('core accepts @LOCATION (structural)', () => {
    const r = validateStrict(doc('core', '@LOCATION jurisdiction="EU" | region=DE'));
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature overrides with with= / without=
// ─────────────────────────────────────────────────────────────────────────────

describe('Feature overrides (with=/without=)', () => {
  it('core + with=[cognition] accepts @THOUGHT', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test" | profile=core | with=[cognition] | fmt=min\n@THOUGHT rid=t:1 | content="test"';
    const r = validateStrict(src);
    expect(r.valid).toBe(true);
  });

  it('agent + without=[governance] rejects @TENET', () => {
    const src = '@DOC ver=2.0 | id=test | title="Test" | profile=agent | without=[governance] | fmt=min\n@TENET rid=t:1 | level=L1 | content="rule"';
    const r = validateStrict(src);
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.message.includes('TENET'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Version acceptance
// ─────────────────────────────────────────────────────────────────────────────

describe('Version 2.0 acceptance', () => {
  it('ver=2.0 passes strict validation', () => {
    const r = validateStrict(doc('exec', '@INTENT text="test"'));
    expect(r.valid).toBe(true);
  });

  it('ver=1.5 still passes strict validation', () => {
    const src = '@DOC ver=1.5 | id=test | title="Test" | profile=exec | fmt=min\n@INTENT text="test"';
    const r = validateStrict(src);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Duplicate block ID
// ─────────────────────────────────────────────────────────────────────────────

describe('Duplicate block ID detection', () => {
  it('throws on duplicate block id', () => {
    const src = [
      '@DOC ver=2.0 | id=test | title="Test" | profile=exec | fmt=min',
      '@BEGIN CODE | id="dup" | mime=text/plain | boundary=bnd_dup_1',
      'first',
      '@END CODE | boundary=bnd_dup_1',
      '@BEGIN CODE | id="dup" | mime=text/plain | boundary=bnd_dup_2',
      'second',
      '@END CODE | boundary=bnd_dup_2',
    ].join('\n');
    expect(() => parse(src)).toThrow(/[Dd]uplicate block/);
  });
});
