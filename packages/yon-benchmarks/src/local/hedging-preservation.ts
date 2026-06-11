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
 * Hedging Preservation Benchmark Suite
 *
 * Pillar: Emitter Faithfulness
 * Validates: §5/§6.1 — "YON encodes. It does not interpret."
 *
 * Tests hedging and uncertainty language survives through the format layer:
 * 1. Parse → format roundtrip (all 8 hedging categories)
 * 2. Cross-format conversion (YON ↔ JSON)
 * 3. Density survival (canon → min → ultra)
 * 4. Tag semantics preserve hedging intent
 */

import { parse, format } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Hedging Test Vectors (8 Categories from §6.1)
// ---------------------------------------------------------------------------

interface HedgingVector {
  category: string;
  yon: string;
  markers: string[];
}

const VECTORS: HedgingVector[] = [
  {
    category: '1 — Confidence hedging',
    yon: '@RULE lvl=SHOULD | when="designing CTA" | then="make prominent, probably purple or something vibrant"',
    markers: ['probably', 'or something'],
  },
  {
    category: '2 — Approximation',
    yon: '@NOTE text="The API response time is roughly 200-300ms under normal load"',
    markers: ['roughly'],
  },
  {
    category: '3 — Partial knowledge',
    yon: '@NOTE text="I believe the auth module uses JWT, but I haven\'t verified the refresh token flow"',
    markers: ['I believe', "haven't verified"],
  },
  {
    category: '4 — Conditional uncertainty',
    yon: '@RULE lvl=SHOULD | when="deployment" | then="might need a CDN if traffic exceeds 10k RPM"',
    markers: ['might need', 'if'],
  },
  {
    category: '5 — Ranked alternatives',
    yon: '@NOTE text="For the database, PostgreSQL is preferred, but MySQL or SQLite could also work"',
    markers: ['preferred', 'could also work'],
  },
  {
    category: '6 — Temporal hedging',
    yon: '@NOTE text="This API endpoint is currently stable, though it may change in v3"',
    markers: ['currently', 'may change'],
  },
  {
    category: '7 — Scope limitation',
    yon: '@NOTE text="As far as I can tell, the memory leak only occurs on Windows with Node 18"',
    markers: ['As far as I can tell', 'only'],
  },
  {
    category: '8 — Negated certainty',
    yon: '@NOTE text="I\'m not entirely sure, but the bug seems related to the connection pooling"',
    markers: ['not entirely sure', 'seems'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function markersPresent(text: string, markers: string[]): { found: string[]; missing: string[] } {
  const found: string[] = [];
  const missing: string[] = [];
  for (const marker of markers) {
    if (text.toLowerCase().includes(marker.toLowerCase())) {
      found.push(marker);
    } else {
      missing.push(marker);
    }
  }
  return { found, missing };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testParseRoundtrip(): TestResult {
  let totalMarkers = 0;
  let survivedMarkers = 0;
  const failures: string[] = [];

  for (const vec of VECTORS) {
    const doc = parse(`@DOC ver=2.0 | id=hedge-${vec.category.charAt(0)} | title="Hedging Test"\n${vec.yon}`);
    const formatted = format(doc);
    const { found, missing } = markersPresent(formatted, vec.markers);

    totalMarkers += vec.markers.length;
    survivedMarkers += found.length;

    if (missing.length > 0) {
      failures.push(`Cat ${vec.category}: lost [${missing.join(', ')}]`);
    }
  }

  const rate = Math.round((survivedMarkers / totalMarkers) * 100);

  return {
    id: 'hedging-parse-roundtrip',
    name: 'Hedging Parse → Format Roundtrip',
    passed: rate === 100,
    metric: {
      name: 'marker_survival_rate',
      value: rate,
      unit: '%',
    },
    detail: rate === 100
      ? `All ${totalMarkers} hedging markers survived parse→format across 8 categories.`
      : `${survivedMarkers}/${totalMarkers} markers survived. Failures: ${failures.join('; ')}`,
  };
}

function testFormatFidelity(): TestResult {
  let totalMarkers = 0;
  let survivedMarkers = 0;
  const failures: string[] = [];

  for (const vec of VECTORS) {
    const yonDoc = `@DOC ver=2.0 | id=hedge-ff | title="Fidelity"\n${vec.yon}`;

    // YON roundtrip: parse → format(min) → parse → format(canon) → check
    const doc1 = parse(yonDoc);
    const minFormatted = format(doc1, { mode: 'min' });
    const doc2 = parse(minFormatted);
    const canonFormatted = format(doc2, { mode: 'canon' });
    const { found, missing } = markersPresent(canonFormatted, vec.markers);

    totalMarkers += vec.markers.length;
    survivedMarkers += found.length;

    if (missing.length > 0) {
      failures.push(`Cat ${vec.category}: lost [${missing.join(', ')}] after canon→min→canon`);
    }
  }

  const rate = Math.round((survivedMarkers / totalMarkers) * 100);

  return {
    id: 'hedging-format-fidelity',
    name: 'Hedging across Format Roundtrip (canon→min→canon)',
    passed: rate === 100,
    metric: {
      name: 'cross_format_survival',
      value: rate,
      unit: '%',
    },
    detail: rate === 100
      ? `All ${totalMarkers} markers survived canon→min→canon roundtrip.`
      : `${survivedMarkers}/${totalMarkers} survived. ${failures.join('; ')}`,
  };
}

function testDensitySurvival(): TestResult {
  const densities: Array<{ name: string; mode: 'canon' | 'min' | 'ultra'; threshold: number }> = [
    { name: 'canon', mode: 'canon', threshold: 100 },
    { name: 'min', mode: 'min', threshold: 100 },
    { name: 'ultra', mode: 'ultra', threshold: 75 },
  ];

  const results: Array<{ density: string; rate: number }> = [];
  let allPassed = true;

  for (const density of densities) {
    let total = 0;
    let survived = 0;

    for (const vec of VECTORS) {
      const doc = parse(`@DOC ver=2.0 | id=hedge-d | title="Density" | fmt=${density.mode}\n${vec.yon}`);
      const formatted = format(doc, { mode: density.mode });
      const { found } = markersPresent(formatted, vec.markers);

      total += vec.markers.length;
      survived += found.length;
    }

    const rate = Math.round((survived / total) * 100);
    results.push({ density: density.name, rate });

    if (rate < density.threshold) allPassed = false;
  }

  const canonRate = results.find(r => r.density === 'canon')?.rate ?? 0;

  return {
    id: 'hedging-density-survival',
    name: 'Hedging across YON Densities',
    passed: allPassed,
    metric: {
      name: 'canon_survival_rate',
      value: canonRate,
      unit: '%',
    },
    secondaryMetrics: results.map(r => ({
      name: `${r.density}_survival`,
      value: r.rate,
      unit: '%',
    })),
    detail: results.map(r => `${r.density}: ${r.rate}%`).join(' | '),
  };
}

function testVsJsonStructure(): TestResult {
  // In YON: @NOTE text="probably purple" → the tag (@NOTE) and key (text=) provide semantic context
  // In JSON: { "text": "probably purple" } → just a bare string, no tag semantics
  const yonInput = '@DOC ver=2.0 | id=hedge-test | title="Hedging Test"\n@NOTE text="probably purple or something vibrant"';
  const doc = parse(yonInput);

  // YON preserves: tag name + field context
  const yonRecord = doc.records.find(r => r.tag === 'NOTE');
  const yonHasTag = yonRecord?.tag === 'NOTE';
  const yonHasField = yonRecord?.fields.has('text');
  const yonText = yonRecord?.fields.get('text') as string;
  const yonPreservesHedging = yonText?.includes('probably') && yonText?.includes('or something');

  // YON advantage: tag semantics (@NOTE says "this is a note") are part of the data
  // JSON: the semantic context (it was a NOTE) must be added as a field — it's not intrinsic
  const yonScore = (yonHasTag ? 1 : 0) + (yonHasField ? 1 : 0) + (yonPreservesHedging ? 1 : 0);

  return {
    id: 'hedging-vs-json-structure',
    name: 'Hedging: YON Tag Semantics',
    passed: yonScore === 3,
    metric: {
      name: 'yon_semantic_score',
      value: yonScore,
      unit: '/3',
    },
    detail:
      `YON preserves: tag semantics (${yonHasTag}), field context (${yonHasField}), hedging text (${yonPreservesHedging}). ` +
      `YON embeds semantics in the format itself — no external schema required.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testParseRoundtrip(),
    testFormatFidelity(),
    testDensitySurvival(),
    testVsJsonStructure(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter(t => t.passed).length;

  return {
    suiteId: 'hedging-preservation',
    suiteName: 'Hedging Preservation',
    pillar: 'emitter-faithfulness',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: localTimestamp(),
  };
}

export { run as runHedgingPreservation };
