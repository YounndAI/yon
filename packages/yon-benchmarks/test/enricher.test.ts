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
 * Enricher unit tests — guards the remediation contracts:
 * 1. fmt() null-safety
 * 2. extractMetrics with empty report → all metrics null
 * 3. validateEnrichment hard-fail + LLM-only filter
 * 4. replacePlaceholders null → '—'
 * 5. Honest Scorecard derivation (0/0/0 edge case via enrichReport)
 */

import { describe, it, expect } from 'vitest';
import { fmt, extractMetrics, validateEnrichment, replacePlaceholders, enrichReport } from '../src/reports/enricher.js';
import type { BenchmarkReport } from '../src/core/types.js';

function makeEmptyReport(): BenchmarkReport {
  return {
    version: '0.1.0-test',
    timestamp: '2026-01-01T00:00:00.000Z',
    environment: {
      platform: 'test',
      nodeVersion: '22.0.0',
      llmAccess: false,
    },
    results: [],
  };
}

describe('fmt()', () => {
  it('returns null when value is null', () => {
    expect(fmt(null, '%')).toBeNull();
  });

  it('returns null when value is undefined', () => {
    expect(fmt(undefined, '%')).toBeNull();
  });

  it('formats number with suffix', () => {
    expect(fmt(99, '%')).toBe('99%');
  });

  it('applies transform before formatting', () => {
    expect(fmt(99.7, '%', Math.round)).toBe('100%');
  });

  it('handles zero correctly (not treated as null)', () => {
    expect(fmt(0, '%')).toBe('0%');
  });
});

describe('extractMetrics()', () => {
  it('returns metrics with null values for empty report', () => {
    const metrics = extractMetrics(makeEmptyReport());

    // Core counts should be derived (zeroes, not null)
    expect(metrics.SUITE_COUNT).toBe('0');
    expect(metrics.TEST_COUNT).toBe('0');
    expect(metrics.PASS_RATE).toBe('0%');

    // Outcome counts should be zero strings
    expect(metrics.OUTCOME_ADVANTAGES).toBe('0');
    expect(metrics.OUTCOME_TIED).toBe('0');
    expect(metrics.OUTCOME_DISADVANTAGES).toBe('0');
  });

  it('returns null for metrics derived from missing suites', () => {
    const metrics = extractMetrics(makeEmptyReport());

    // These derive from specific suites that don't exist in empty report
    expect(metrics.RECOVERY_RATE).toBeNull();
    expect(metrics.TTFR).toBeNull();
    expect(metrics.COMPREHENSION_ACCURACY).toBeNull();
  });
});

describe('replacePlaceholders()', () => {
  it('replaces known placeholders', () => {
    const { result } = replacePlaceholders('Score: {{SCORE}}', { SCORE: '99%' });
    expect(result).toBe('Score: 99%');
  });

  it('renders null values as —', () => {
    const { result } = replacePlaceholders('Score: {{SCORE}}', { SCORE: null });
    expect(result).toBe('Score: —');
  });

  it('tracks unreplaced placeholders and replaces them with —', () => {
    const { result, unreplaced } = replacePlaceholders('{{KNOWN}} and {{UNKNOWN}}', { KNOWN: 'yes' });
    expect(unreplaced).toContain('UNKNOWN');
    expect(unreplaced).not.toContain('KNOWN');
    expect(result).toBe('yes and —');
    expect(result).not.toContain('{{');
  });
});

describe('Regression: template hygiene', () => {
  it('Composition system omits placeholder syntax entirely', async () => {
    // composeCapabilityAnalysis embeds values directly — no {{...}} tokens
    const report = await enrichReport(makeEmptyReport());
    expect(report.capabilityAnalysis).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(report.capabilityAnalysis).not.toContain('%%');
  });

  it('Value Amplifier section omitted when no VALUE_AMP data exists', async () => {
    const report = await enrichReport(makeEmptyReport());
    // Empty report has no value-amplifier suite → section should not render
    expect(report.capabilityAnalysis).not.toContain('Model Value Amplifier');
    // But always-present sections should still be there
    expect(report.capabilityAnalysis).toContain('What YON Is');
    expect(report.capabilityAnalysis).toContain('Scope');
  });
});

describe('validateEnrichment()', () => {
  it('throws on unexpected unresolved placeholders', () => {
    expect(() => {
      validateEnrichment('text', ['FAKE_METRIC'], ['REAL_METRIC'], {});
    }).toThrow(/FATAL.*FAKE_METRIC/);
  });

  it('passes on LLM-only placeholders (VALUE_AMP_*)', () => {
    expect(() => {
      validateEnrichment('text', ['VALUE_AMP_GPT4O_MINI_NL_ACC'], ['REAL_METRIC'], {});
    }).not.toThrow();
  });

  it('passes on LLM-only placeholders (LLM_*)', () => {
    expect(() => {
      validateEnrichment('text', ['LLM_SOMETHING'], ['REAL_METRIC'], {});
    }).not.toThrow();
  });

  it('passes when no unresolved placeholders exist', () => {
    expect(() => {
      validateEnrichment('text', [], ['REAL_METRIC'], {});
    }).not.toThrow();
  });
});

describe('Honest Scorecard (0/0/0 edge case)', () => {
  it('contains "No comparative tests" for empty report', async () => {
    const result = await enrichReport(makeEmptyReport());
    expect(result.capabilityAnalysis).toContain('No comparative tests in this run');
  });
});
