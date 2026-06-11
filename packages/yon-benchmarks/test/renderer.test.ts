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
 * Renderer unit tests — verify report output structure
 */

import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderReport } from '../src/reports/renderer.js';
import type { BenchmarkReport } from '../src/core/types.js';

const TEMP_DIR = join(import.meta.dirname, '../.test-reports');

function makeMockReport(): BenchmarkReport {
  return {
    version: '0.1.0-test',
    timestamp: '2026-01-01T00:00:00.000Z',
    environment: {
      platform: 'test',
      nodeVersion: '22.0.0',
      llmAccess: false,
    },
    results: [
      {
        suiteId: 'test-suite',
        suiteName: 'Test Suite',
        pillar: 'cross-cutting',
        tests: [
          {
            id: 'test-1',
            name: 'Test One',
            passed: true,
            metric: { name: 'score', value: 100, unit: '%' },
            detail: 'All good.',
          },
        ],
        summary: { total: 1, passed: 1, failed: 0, durationMs: 5 },
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    ],
  };
}

describe('Report Renderer', () => {
  afterEach(() => {
    if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true });
  });

  it('creates report directory with expected files', () => {
    const report = makeMockReport();
    const dir = renderReport(report, TEMP_DIR);

    expect(existsSync(join(dir, 'README.md'))).toBe(true);
    expect(existsSync(join(dir, 'scorecard.md'))).toBe(true);
    expect(existsSync(join(dir, 'analysis.md'))).toBe(true);
    expect(existsSync(join(dir, 'report.json'))).toBe(true);
    expect(existsSync(join(dir, 'test-suite', 'result.md'))).toBe(true);
    expect(existsSync(join(dir, 'test-suite', 'result.json'))).toBe(true);
  });

  it('result.md contains back-to-report link', () => {
    const report = makeMockReport();
    const dir = renderReport(report, TEMP_DIR);
    const md = readFileSync(join(dir, 'test-suite', 'result.md'), 'utf-8');

    expect(md).toContain('[← Back to Report](../README.md)');
  });

  it('README.md contains suite links', () => {
    const report = makeMockReport();
    const dir = renderReport(report, TEMP_DIR);
    const md = readFileSync(join(dir, 'README.md'), 'utf-8');

    expect(md).toContain('scorecard.md');
    expect(md).toContain('analysis.md');
  });

  it('report.json is valid JSON', () => {
    const report = makeMockReport();
    const dir = renderReport(report, TEMP_DIR);
    const raw = readFileSync(join(dir, 'report.json'), 'utf-8');
    const parsed = JSON.parse(raw);

    expect(parsed.version).toBe('0.1.0-test');
    expect(parsed.results).toHaveLength(1);
  });
});
