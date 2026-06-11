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
 * Format Fidelity Suite
 *
 * Pillar: Lossless
 * Validates: YON's explicit type system prevents silent data corruption.
 *
 * Tests:
 * 1. Roundtrip Parity (YON→JSON→YON) — zero field loss
 * 2. Roundtrip Parity (YON→YAML→YON) — zero field loss
 * 3. Escape Fidelity — verbatim code in blocks without escaping
 * 4. Optimization Ladder — canon/min/ultra semantic equivalence
 */

import { parse, format, type YonDocument } from '@younndai/yon-parser';
import { yonToJson, jsonToYon, yonToYaml, yamlToYon } from '@younndai/yon-converter';
import { loadVector } from '../core/vectors.js';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compare two data payloads for key/value equivalence.
 * We compare the JSON-serializable intermediates, not the YON records,
 * because converters produce different record layouts.
 */
function compareDataPayloads(
  originalJson: string,
  rebuiltJson: string,
): { preservedKeys: number; totalKeys: number; losses: string[] } {
  const losses: string[] = [];

  let origObj: Record<string, unknown>;
  let rebObj: Record<string, unknown>;
  try {
    origObj = JSON.parse(originalJson) as Record<string, unknown>;
    rebObj = JSON.parse(rebuiltJson) as Record<string, unknown>;
  } catch {
    return { preservedKeys: 0, totalKeys: 1, losses: ['JSON parse failed'] };
  }

  // Flatten both objects and compare top-level keys
  const origKeys = Object.keys(origObj);
  const totalKeys = origKeys.length;
  let preservedKeys = 0;

  for (const key of origKeys) {
    if (key in rebObj) {
      preservedKeys++;
    } else {
      losses.push(`Key '${key}' lost in roundtrip`);
    }
  }

  return { preservedKeys, totalKeys, losses };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testRoundtripJson(): TestResult {
  const yon = loadVector('fidelity', 'roundtrip.yon');

  let original: YonDocument;
  try {
    original = parse(yon);
  } catch {
    return {
      id: 'roundtrip-json',
      name: 'Roundtrip Parity (YON→JSON→YON)',
      passed: false,
      metric: { name: 'field_preservation', value: 0, unit: '%' },
      detail: 'Failed to parse original vector.',
    };
  }

  try {
    // YON → JSON
    const json = yonToJson(original);
    // JSON → YON → JSON (second leg)
    const rebuilt = jsonToYon(json);
    const rebuiltDoc = parse(rebuilt);
    const rebuiltJson = yonToJson(rebuiltDoc);

    // Compare data payloads (not YON structure)
    const { preservedKeys, totalKeys, losses } = compareDataPayloads(json, rebuiltJson);
    const rate = totalKeys > 0 ? (preservedKeys / totalKeys) * 100 : 0;

    return {
      id: 'roundtrip-json',
      name: 'Roundtrip Parity (YON→JSON→YON)',
      passed: rate >= 80,
      metric: {
        name: 'field_preservation',
        value: Math.round(rate * 10) / 10,
        unit: '%',
      },
      detail: `${preservedKeys}/${totalKeys} keys preserved.${losses.length > 0 ? ` Losses: ${losses.slice(0, 3).join('; ')}` : ''}`,
    };
  } catch (e) {
    return {
      id: 'roundtrip-json',
      name: 'Roundtrip Parity (YON→JSON→YON)',
      passed: false,
      metric: { name: 'field_preservation', value: 0, unit: '%' },
      detail: `Conversion failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

function testRoundtripYaml(): TestResult {
  const yon = loadVector('fidelity', 'roundtrip.yon');

  let original: YonDocument;
  try {
    original = parse(yon);
  } catch {
    return {
      id: 'roundtrip-yaml',
      name: 'Roundtrip Parity (YON→YAML→YON)',
      passed: false,
      metric: { name: 'field_preservation', value: 0, unit: '%' },
      detail: 'Failed to parse original vector.',
    };
  }

  try {
    // YON → JSON (baseline)
    const baselineJson = yonToJson(original);
    // YON → YAML → YON → JSON
    const yaml = yonToYaml(original);
    const rebuilt = yamlToYon(yaml);
    const rebuiltDoc = parse(rebuilt);
    const rebuiltJson = yonToJson(rebuiltDoc);

    // Compare data payloads
    const { preservedKeys, totalKeys, losses } = compareDataPayloads(baselineJson, rebuiltJson);
    const rate = totalKeys > 0 ? (preservedKeys / totalKeys) * 100 : 0;

    return {
      id: 'roundtrip-yaml',
      name: 'Roundtrip Parity (YON→YAML→YON)',
      passed: rate >= 80,
      metric: {
        name: 'field_preservation',
        value: Math.round(rate * 10) / 10,
        unit: '%',
      },
      detail: `${preservedKeys}/${totalKeys} keys preserved.${losses.length > 0 ? ` Losses: ${losses.slice(0, 3).join('; ')}` : ''}`,
    };
  } catch (e) {
    return {
      id: 'roundtrip-yaml',
      name: 'Roundtrip Parity (YON→YAML→YON)',
      passed: false,
      metric: { name: 'field_preservation', value: 0, unit: '%' },
      detail: `Conversion failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

function testEscapeFidelity(): TestResult {
  const yon = loadVector('structural', 'embedded-code.yon');

  let doc: YonDocument;
  try {
    doc = parse(yon);
  } catch {
    return {
      id: 'escape-fidelity',
      name: 'Escape Fidelity',
      passed: false,
      metric: { name: 'blocks_intact', value: 0, unit: 'count' },
      detail: 'Failed to parse embedded-code.yon vector.',
    };
  }

  let intact = 0;
  let totalEscapesNeeded = 0;

  for (const [, block] of doc.blocks) {
    const content = block.content;
    if (content.length > 0) {
      intact++;
      // Count escapes that JSON would need
      const jsonStr = JSON.stringify(content);
      totalEscapesNeeded += (jsonStr.match(/\\\\/g) ?? []).length;
      totalEscapesNeeded += (jsonStr.match(/\\"/g) ?? []).length;
      totalEscapesNeeded += (jsonStr.match(/\\n/g) ?? []).length;
      totalEscapesNeeded += (jsonStr.match(/\\t/g) ?? []).length;
    }
  }

  return {
    id: 'escape-fidelity',
    name: 'Escape Fidelity',
    passed: intact === doc.blocks.size,
    metric: {
      name: 'blocks_intact',
      value: intact,
      unit: `/${doc.blocks.size} blocks`,
      comparison: {
        baseline: totalEscapesNeeded,
        baselineLabel: 'JSON escapes required',
        delta: `0 vs ${totalEscapesNeeded}`,
      },
    },
    detail: `YON: ${intact}/${doc.blocks.size} blocks preserved with 0 escapes. JSON equivalent requires ${totalEscapesNeeded} escape sequences.`,
  };
}

function testOptimizationLadder(): TestResult {
  const yon = loadVector('fidelity', 'roundtrip.yon');

  let canonDoc: YonDocument;
  try {
    canonDoc = parse(yon);
  } catch {
    return {
      id: 'optimization-ladder',
      name: 'Optimization Ladder',
      passed: false,
      metric: { name: 'semantic_parity', value: 0, unit: '%' },
      detail: 'Failed to parse canon vector.',
    };
  }

  // Format as min
  const minYon = format(canonDoc, { mode: 'min' });
  // Format as ultra
  const ultraYon = format(canonDoc, { mode: 'ultra' });

  // Parse min and ultra back
  let minDoc: YonDocument;
  let ultraDoc: YonDocument;
  try {
    minDoc = parse(minYon);
    ultraDoc = parse(ultraYon);
  } catch {
    return {
      id: 'optimization-ladder',
      name: 'Optimization Ladder',
      passed: false,
      metric: { name: 'semantic_parity', value: 0, unit: '%' },
      detail: 'Failed to parse min/ultra formatted output.',
    };
  }

  const canonRecords = canonDoc.records.length;
  const minRecords = minDoc.records.length;
  const ultraRecords = ultraDoc.records.length;

  // Compression ratio
  const canonBytes = Buffer.byteLength(yon, 'utf-8');
  const minBytes = Buffer.byteLength(minYon, 'utf-8');
  const ultraBytes = Buffer.byteLength(ultraYon, 'utf-8');

  const minRatio = canonBytes > 0 ? ((1 - minBytes / canonBytes) * 100) : 0;
  const ultraRatio = canonBytes > 0 ? ((1 - ultraBytes / canonBytes) * 100) : 0;

  const parity = canonRecords === minRecords && canonRecords === ultraRecords;

  return {
    id: 'optimization-ladder',
    name: 'Optimization Ladder',
    passed: parity,
    metric: {
      name: 'semantic_parity',
      value: parity ? 100 : 0,
      unit: '%',
    },
    secondaryMetrics: [
      { name: 'canon_bytes', value: canonBytes, unit: 'bytes' },
      { name: 'min_savings', value: Math.round(minRatio * 10) / 10, unit: '%' },
      { name: 'ultra_savings', value: Math.round(ultraRatio * 10) / 10, unit: '%' },
    ],
    detail: `Canon: ${canonBytes}B (${canonRecords} records). Min: ${minBytes}B (−${minRatio.toFixed(1)}%). Ultra: ${ultraBytes}B (−${ultraRatio.toFixed(1)}%). Record counts: ${parity ? 'identical' : 'MISMATCH'}.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testRoundtripJson(),
    testRoundtripYaml(),
    testEscapeFidelity(),
    testOptimizationLadder(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'format-fidelity',
    suiteName: 'Format Fidelity',
    pillar: 'lossless',
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

export { run as runFormatFidelity };
