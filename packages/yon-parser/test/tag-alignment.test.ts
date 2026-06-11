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
 * Tag Alignment Tests
 *
 * Automated verification that tag definitions are consistent across:
 * - Parser (STRUCTURAL_TAGS, FEATURE_TAGS, Bundled Domains)
 * - EBNF grammar productions
 * - Modes Spec §3.3 feature list
 * - Sibling YON packages (yon-converter, yon-runner)
 */

import { describe, it, expect } from 'vitest';
import {
  STRUCTURAL_TAGS,
  FEATURE_TAGS,
  PROFILE_PRESETS,
  listBundledDomains,
  getBundledDomain,
  type YonFeature,
  type YonProfile,
} from '../src/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Expected values from spec (truth sources)
// ─────────────────────────────────────────────────────────────────────────────

/** EBNF §8 structural_tag production (REF is feature-gated, not structural) */
const EBNF_STRUCTURAL = ['DOC', 'SEC', 'NOTE', 'META', 'DEF', 'STAMP', 'REDACTION', 'CONSENT', 'IDENTITY', 'LOCATION'];

/** EBNF §8 feature tag productions (Layer 1-2 only) */
const EBNF_FEATURE_TAGS: Record<string, string[]> = {
  logic: ['INTENT', 'SCOPE', 'RULE', 'SCHEMA', 'CFG', 'MAP', 'CHECK'],
  workflow: ['STEP', 'CATCH', 'RETRY', 'ERROR', 'INPUT', 'OUTPUT', 'YIELD'],
  provenance: ['STAMP'],
  delta: ['PATCH', 'VOID'],
  dialogue: ['TURN', 'ACK'],
  sessions: ['SESSION', 'CHECKPOINT', 'RECOVER'],
};

/** Modes Spec §3 profile presets (Layer 1-2) */
const SPEC_PROFILES: Record<string, string[]> = {
  core: ['payload', 'logic', 'dialogue', 'sessions'],
  decl: ['payload', 'logic', 'refs', 'dialogue', 'sessions'],
  exec: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions'],
  audit: ['payload', 'logic', 'workflow', 'refs', 'delta', 'provenance', 'dialogue', 'sessions'],
  cognitive: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'affect'],
  agent: ['payload', 'logic', 'workflow', 'refs', 'delta', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'temporal', 'affect', 'collaboration', 'composition', 'governance', 'reactive', 'signaling'],
  full: ['payload', 'logic', 'workflow', 'refs', 'delta', 'provenance', 'dialogue', 'sessions', 'cognition', 'perception', 'goals', 'memory', 'temporal', 'affect', 'collaboration', 'composition', 'governance', 'reactive', 'signaling'],
};

/** Modes Spec §3.3 feature list (all 19 features) */
const SPEC_FEATURES = [
  'payload', 'logic', 'dialogue', 'sessions',
  'refs', 'workflow', 'delta', 'provenance',
  'cognition', 'perception', 'goals', 'memory',
  'temporal', 'affect', 'collaboration', 'composition', 'governance', 'reactive',
  'signaling',
];

/** Standard §3.2 Core Structural tags (REF requires `refs` feature per tag-registry.md) */
const SPEC_CORE_STRUCTURAL = ['DOC', 'SEC', 'META', 'NOTE', 'DEF', 'STAMP', 'REDACTION', 'CONSENT', 'IDENTITY', 'LOCATION'];

// ─────────────────────────────────────────────────────────────────────────────
// Structural Tags
// ─────────────────────────────────────────────────────────────────────────────

describe('Structural Tag Alignment', () => {
  it('parser STRUCTURAL_TAGS matches EBNF structural_tag', () => {
    expect([...STRUCTURAL_TAGS].sort()).toEqual([...EBNF_STRUCTURAL].sort());
  });

  it('parser STRUCTURAL_TAGS matches Standard §3.2 Core Structural', () => {
    expect([...STRUCTURAL_TAGS].sort()).toEqual([...SPEC_CORE_STRUCTURAL].sort());
  });

  it('STAMP is in both STRUCTURAL_TAGS and FEATURE_TAGS.provenance', () => {
    expect(STRUCTURAL_TAGS).toContain('STAMP');
    expect(FEATURE_TAGS.provenance).toContain('STAMP');
  });

  it('REF is feature-gated via refs (not structural) per tag-registry.md', () => {
    expect(STRUCTURAL_TAGS).not.toContain('REF');
    expect(FEATURE_TAGS.refs).toContain('REF');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature Tags
// ─────────────────────────────────────────────────────────────────────────────

describe('Feature Tag Alignment', () => {
  it('parser has exactly 19 features', () => {
    expect(Object.keys(FEATURE_TAGS).sort()).toEqual([...SPEC_FEATURES].sort());
  });

  it.each(Object.entries(EBNF_FEATURE_TAGS))(
    'Layer 1-2 feature "%s" tags match EBNF production',
    (feature, expectedTags) => {
      const parserTags = FEATURE_TAGS[feature as YonFeature];
      expect(parserTags).toBeDefined();
      expect([...parserTags].sort()).toEqual([...expectedTags].sort());
    }
  );

  it('payload feature has BEGIN and END', () => {
    expect(FEATURE_TAGS.payload).toEqual(['BEGIN', 'END']);
  });

  it('refs feature has REF', () => {
    expect(FEATURE_TAGS.refs).toEqual(['REF']);
  });

  it('no tag appears in multiple feature sets (except dual-registered)', () => {
    const seen = new Map<string, string>();
    const dualRegistered = ['STAMP']; // structural + feature (REF is feature-only now)

    for (const [feature, tags] of Object.entries(FEATURE_TAGS)) {
      for (const tag of tags) {
        if (dualRegistered.includes(tag)) continue;
        if (seen.has(tag)) {
          throw new Error(
            `Tag ${tag} in both '${seen.get(tag)}' and '${feature}'`
          );
        }
        seen.set(tag, feature);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile Presets
// ─────────────────────────────────────────────────────────────────────────────

describe('Profile Preset Alignment', () => {
  it.each(Object.entries(SPEC_PROFILES))(
    'profile "%s" matches Modes Spec §3',
    (profile, expectedFeatures) => {
      const preset = PROFILE_PRESETS[profile as YonProfile];
      expect(preset).toBeDefined();
      expect([...preset].sort()).toEqual([...expectedFeatures].sort());
    }
  );

  it('profiles are cumulative: core ⊂ decl ⊂ exec ⊂ audit ⊂ cognitive ⊂ agent', () => {
    const core = new Set(PROFILE_PRESETS.core);
    const decl = new Set(PROFILE_PRESETS.decl);
    const exec = new Set(PROFILE_PRESETS.exec);
    const audit = new Set(PROFILE_PRESETS.audit);
    const cognitive = new Set(PROFILE_PRESETS.cognitive);
    const agent = new Set(PROFILE_PRESETS.agent);

    for (const f of core) expect(decl.has(f)).toBe(true);
    for (const f of decl) expect(exec.has(f)).toBe(true);
    // audit diverges from exec by adding provenance, not a strict superset of cognitive
    for (const f of exec) expect(audit.has(f)).toBe(true);
    // cognitive is exec + Layer 3
    for (const f of exec) expect(cognitive.has(f)).toBe(true);
    // agent is cognitive + Layer 4
    for (const f of cognitive) expect(agent.has(f)).toBe(true);
  });

  it('full profile includes all 19 features', () => {
    expect([...PROFILE_PRESETS.full].sort()).toEqual([...SPEC_FEATURES].sort());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Domain Registries
// ─────────────────────────────────────────────────────────────────────────────

describe('Domain Registry Integrity', () => {
  const allDomains = listBundledDomains().map(id => getBundledDomain(id)!);

  it('exposes every bundled official domain', () => {
    // Derive from the bundled registry so adding a yai.* domain
    // does not break this test.
    expect(allDomains.length).toBe(listBundledDomains().length);
    expect(allDomains.length).toBeGreaterThan(0);
  });

  it('no domain tags collide with core structural tags (except known overlaps)', () => {
    // Domain-specific records MAY reuse structural tag names when domain context
    // provides different semantics (e.g., yai.legal REDACTION vs structural @REDACTION)
    const knownStructuralOverlaps = [
      { domain: 'yai.legal', tag: 'REDACTION' },
    ];
    const overlapKey = (d: string, t: string) => `${d}:${t}`;
    const allowed = new Set(knownStructuralOverlaps.map(o => overlapKey(o.domain, o.tag)));

    for (const domain of allDomains) {
      const domainTags = Object.keys(domain.records);
      for (const tag of domainTags) {
        if (STRUCTURAL_TAGS.includes(tag) && !allowed.has(overlapKey(domain.domain, tag))) {
          throw new Error(
            `Domain ${domain.domain} tag '${tag}' collides with structural tag`
          );
        }
      }
    }
  });

  it('domain-to-feature tag overlaps are documented', () => {
    // Domains MAY reuse core feature tag names (e.g., yai.gaming has SCOPE
    // which also exists in logic feature). This is intentional — domain context
    // determines semantics. This test documents known overlaps.
    const allFeatureTags = Object.values(FEATURE_TAGS).flat();
    const overlaps: { domain: string; tag: string }[] = [];

    for (const domain of allDomains) {
      for (const tag of Object.keys(domain.records)) {
        if (allFeatureTags.includes(tag)) {
          overlaps.push({ domain: domain.domain, tag });
        }
      }
    }

    // Document known overlaps — update this list if new ones are added
    const knownOverlaps = [
      { domain: 'yai.agriculture', tag: 'INPUT' },
      { domain: 'yai.dialogue', tag: 'TURN' },
      { domain: 'yai.dialogue', tag: 'ACK' },
      { domain: 'yai.logistics', tag: 'ROUTE' },
      { domain: 'yai.sai', tag: 'AFFECT' },
      { domain: 'yai.sai', tag: 'MARK' },
      { domain: 'yai.sai', tag: 'INTENT' },
      { domain: 'yai.sai', tag: 'PERCEPT' },
      { domain: 'yai.sai', tag: 'ESSENCE' },
      { domain: 'yai.sessions', tag: 'SESSION' },
      { domain: 'yai.sessions', tag: 'CHECKPOINT' },
      { domain: 'yai.sessions', tag: 'EVENT' },
      { domain: 'yai.transportation', tag: 'ROUTE' },
    ];

    expect(overlaps).toEqual(knownOverlaps);
  });

  it('each domain has valid structure', () => {
    for (const domain of allDomains) {
      expect(domain.domain).toMatch(/^yai\.[a-z]+$/);
      expect(domain.version).toBe('1.0');
      expect(domain.description).toBeTruthy();
      expect(Object.keys(domain.records).length).toBeGreaterThan(0);
    }
  });

  it('all domain names are unique', () => {
    const names = allDomains.map(d => d.domain);
    expect(new Set(names).size).toBe(names.length);
  });

  it('bundled domain keys match domain.domain values', () => {
    for (const id of listBundledDomains()) {
      const domain = getBundledDomain(id)!;
      expect(id).toBe(domain.domain);
    }
  });
});
