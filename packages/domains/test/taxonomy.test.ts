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
 * Taxonomy engine tests — classification functions.
 */
import { describe, it, expect } from 'vitest';
import {
  resolveSetType,
  resolveConformanceLevel,
  resolveTrustLevel,
  getFreshnessLabel,
  isInstitutional,
  SET_TYPES,
  CONFORMANCE_LEVELS,
  TRUST_LEVELS,
  DOMAIN_STATES,
  VERIFICATION,
} from '../src/taxonomy.js';

// ── resolveSetType ────────────────────────────────────────────────────────────

describe('resolveSetType', () => {
  it('resolves official for official tier', () => {
    expect(resolveSetType('yai.health', 'official')).toBe('official');
  });

  it('resolves community for community tier', () => {
    expect(resolveSetType('acme.custom', 'community')).toBe('community');
  });

  it('DB tier takes precedence over path prefix', () => {
    // edu.* prefix would normally suggest institutional, but DB says official
    expect(resolveSetType('edu.school', 'official')).toBe('official');
  });

  it('path prefix fallback for unknown tier', () => {
    expect(resolveSetType('edu.school.courses', 'unknown-tier')).toBe('institutional');
  });

  it('gov prefix falls back to institutional', () => {
    expect(resolveSetType('gov.agency.records', 'unknown')).toBe('institutional');
  });

  it('yai prefix falls back to official', () => {
    expect(resolveSetType('yai.health', 'unknown')).toBe('official');
  });

  it('com prefix falls back to community', () => {
    expect(resolveSetType('com.company', 'unknown')).toBe('community');
  });

  it('unknown prefix defaults to partner', () => {
    expect(resolveSetType('acme.shipping', 'unknown')).toBe('partner');
  });
});

// ── isInstitutional ───────────────────────────────────────────────────────────

describe('isInstitutional', () => {
  it('returns true for edu.*', () => {
    expect(isInstitutional('edu.stanford.ml')).toBe(true);
  });

  it('returns true for gov.*', () => {
    expect(isInstitutional('gov.us.treasury')).toBe(true);
  });

  it('returns true for org.*', () => {
    expect(isInstitutional('org.who.health')).toBe(true);
  });

  it('returns false for yai.*', () => {
    expect(isInstitutional('yai.health')).toBe(false);
  });
});

// ── resolveConformanceLevel ───────────────────────────────────────────────────

describe('resolveConformanceLevel', () => {
  it('score 1.0 → platinum', () => {
    expect(resolveConformanceLevel(1.0).key).toBe('platinum');
  });

  it('score 0.9 → gold (0.9 < platinum threshold 1.0, but >= gold threshold 0.9)', () => {
    expect(resolveConformanceLevel(0.9).key).toBe('gold');
  });

  it('score 0.89 → silver (0.89 < gold threshold 0.9)', () => {
    expect(resolveConformanceLevel(0.89).key).toBe('silver');
  });

  it('score 0.7 → gold (threshold >=0.9 fails, >=0.7 does not apply — gold is >=0.9? No, gold threshold IS 0.9)', () => {
    // gold threshold = 0.9, so 0.7 < 0.9 → not gold
    // silver threshold = 0.7, so 0.7 >= 0.7 → silver? Let me check...
    // Actually: iteration is platinum(1.0), gold(0.9), silver(0.7), bronze(0.5), below(0)
    // 0.7 >= 1.0? no. 0.7 >= 0.9? no. 0.7 >= 0.7? yes → silver
    expect(resolveConformanceLevel(0.7).key).toBe('silver');
  });

  it('score 0.69 → bronze', () => {
    // 0.69 < 0.7 → not silver. 0.69 >= 0.5? yes → bronze
    expect(resolveConformanceLevel(0.69).key).toBe('bronze');
  });

  it('score 0.5 → bronze (at boundary)', () => {
    expect(resolveConformanceLevel(0.5).key).toBe('bronze');
  });

  it('score 0.49 → below', () => {
    expect(resolveConformanceLevel(0.49).key).toBe('below');
  });

  it('score 0.0 → below', () => {
    expect(resolveConformanceLevel(0.0).key).toBe('below');
  });

  it('includes percentage', () => {
    expect(resolveConformanceLevel(0.85).percentage).toBe(85);
  });

  it('includes label and colorKey from config', () => {
    const result = resolveConformanceLevel(0.95);
    expect(result.label).toBe('Gold');
    expect(result.colorKey).toBe('conformance-gold');
  });
});

// ── resolveTrustLevel ─────────────────────────────────────────────────────────

describe('resolveTrustLevel', () => {
  it('verified + official + high score → trusted', () => {
    expect(resolveTrustLevel(true, 0.95, 'official')).toBe('trusted');
  });

  it('verified + institutional + high score → trusted', () => {
    expect(resolveTrustLevel(true, 0.95, 'institutional')).toBe('trusted');
  });

  it('verified + community + high score → reviewed (not trusted)', () => {
    // community doesn't qualify for trusted even with high score
    expect(resolveTrustLevel(true, 0.95, 'community')).toBe('reviewed');
  });

  it('verified + official + moderate score → reviewed (below 0.9)', () => {
    expect(resolveTrustLevel(true, 0.8, 'official')).toBe('reviewed');
  });

  it('verified + low score → unreviewed', () => {
    expect(resolveTrustLevel(true, 0.5, 'official')).toBe('unreviewed');
  });

  it('unverified → unreviewed regardless of score and setType', () => {
    expect(resolveTrustLevel(false, 1.0, 'official')).toBe('unreviewed');
    expect(resolveTrustLevel(false, 0.95, 'institutional')).toBe('unreviewed');
  });
});

// ── getFreshnessLabel ─────────────────────────────────────────────────────────

describe('getFreshnessLabel', () => {
  it('returns freshness-recent for today', () => {
    const result = getFreshnessLabel(new Date().toISOString());
    expect(result.colorKey).toBe('freshness-recent');
    expect(result.label).toContain('today');
  });

  it('returns freshness-recent for 2 days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = getFreshnessLabel(date);
    expect(result.colorKey).toBe('freshness-recent');
  });

  it('returns freshness-aging for 4 months ago', () => {
    const date = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const result = getFreshnessLabel(date);
    expect(result.colorKey).toBe('freshness-aging');
  });

  it('returns freshness-stale for over 1 year ago', () => {
    const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    const result = getFreshnessLabel(date);
    expect(result.colorKey).toBe('freshness-stale');
  });

  it('returns a human-readable label string', () => {
    const result = getFreshnessLabel(new Date().toISOString());
    expect(typeof result.label).toBe('string');
    expect(result.label.length).toBeGreaterThan(0);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe('taxonomy constants', () => {
  it('SET_TYPES has 4 entries', () => {
    expect(Object.keys(SET_TYPES)).toHaveLength(4);
  });

  it('CONFORMANCE_LEVELS has 5 entries', () => {
    expect(Object.keys(CONFORMANCE_LEVELS)).toHaveLength(5);
  });

  it('TRUST_LEVELS has 3 entries', () => {
    expect(Object.keys(TRUST_LEVELS)).toHaveLength(3);
  });

  it('DOMAIN_STATES has 5 entries', () => {
    expect(Object.keys(DOMAIN_STATES)).toHaveLength(5);
  });

  it('VERIFICATION has 2 entries', () => {
    expect(Object.keys(VERIFICATION)).toHaveLength(2);
  });
});
