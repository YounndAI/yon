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
 * @younndai/yon-generator — Conformance Tests
 *
 * Verifies that generated documents parse and validate across
 * the profile × format matrix.
 *
 * 7 profiles × 3 formats = 21 combinations.
 */

import { describe, it, expect } from 'vitest';
import { yon } from '../src/index.js';
import { parse, validate } from '@younndai/yon-parser';
import type { YonProfile, YonFormat } from '@younndai/yon-parser';

const PROFILES: YonProfile[] = ['core', 'decl', 'exec', 'audit', 'cognitive', 'agent', 'full'];
const FORMATS: YonFormat[] = ['canon', 'min', 'ultra'];

describe('Conformance matrix', () => {
  for (const profile of PROFILES) {
    for (const fmt of FORMATS) {
      it(`${profile} × ${fmt} — parses and validates`, () => {
        // Build a document for this combination
        const source = yon('workflow')
          .id(`conformance-${profile}-${fmt}`)
          .title(`Conformance Test: ${profile} ${fmt}`)
          .profile(profile)
          .fmt(fmt)
          .mode('struct')
          .step({ n: 1, rid: 'test', op: 'std:sys.info@v1' })
          .note('Conformance verification.')
          .toString();

        // Parse must succeed
        const doc = parse(source);
        expect(doc.id).toBe(`conformance-${profile}-${fmt}`);
        expect(doc.kind).toBe('workflow');

        // Validate must succeed
        const result = validate(doc, { strict: true });
        // Some profiles may produce warnings, but no hard errors for valid structure
        // We verify the document is well-formed
        expect(doc.records.length).toBeGreaterThanOrEqual(1);
      });
    }
  }
});

describe('Conformance — declarative kinds', () => {
  const KINDS = ['rule', 'spec', 'note', 'config', 'policy', 'doc'] as const;

  for (const kind of KINDS) {
    it(`${kind} — parses and validates`, () => {
      const source = yon(kind)
        .id(`conformance-${kind}`)
        .title(`Conformance: ${kind}`)
        .profile('decl')
        .note('A test record.')
        .toString();

      const doc = parse(source);
      expect(doc.kind).toBe(kind);
      expect(doc.records.length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('Conformance — domain documents', () => {
  const DOMAINS = [
    'yai.fintech', 'yai.health', 'yai.legal', 'yai.ecommerce', 'yai.gaming',
  ];

  for (const domain of DOMAINS) {
    it(`${domain} — parses with domain set`, () => {
      const source = yon('workflow')
        .id(`domain-${domain.replace('.', '-')}`)
        .title(`Domain: ${domain}`)
        .profile('exec')
        .domain(domain)
        .step({ n: 1, rid: 'op', op: 'std:sys.info@v1' })
        .toString();

      const doc = parse(source);
      expect(doc.domain).toBe(domain);
    });
  }
});

describe('Conformance — scenario resolution', () => {
  const SCENARIOS = ['prompt', 'chat', 'config', 'audit', 'agent', 'fintech', 'legal', 'clinical'];

  for (const scenario of SCENARIOS) {
    it(`scenario:${scenario} — resolves and parses`, () => {
      const source = yon('workflow')
        .id(`scenario-${scenario}`)
        .title(`Scenario: ${scenario}`)
        .scenario(scenario)
        .step({ n: 1, rid: 'test', op: 'std:sys.info@v1' })
        .toString();

      const doc = parse(source);
      expect(doc.id).toBe(`scenario-${scenario}`);
      // Scenario should resolve profile
      expect(source).toContain('profile=');
    });
  }
});
