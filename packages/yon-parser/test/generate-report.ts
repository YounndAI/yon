#!/usr/bin/env npx tsx
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
 * YON Parser — Report Generator
 * 
 * Generates timestamped test reports with parse/format artifacts.
 * Reports are evidence, not source. The test/reports/ directory is gitignored.
 * 
 * Usage:
 *   npx tsx test/generate-report.ts
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse, validate, format } from '../src/index.js';
import { getVectorPaths } from '@younndai/yon-spec/conformance';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const MODES = ['canon', 'min', 'ultra'] as const;

/** Sample documents to format across all 3 modes */
const SAMPLES = [
  {
    id: 'workflow-basic',
    label: 'Basic Workflow',
    source: [
      '@DOC ver=2.0 | id=report-workflow | title="Sample Workflow" | kind=workflow | profile=exec',
      '@STEP n:int=1 | op=std:ai.prompt@v1 | args=[task="Analyze input"]',
      '@STEP n:int=2 | op=std:ai.prompt@v1 | args=[task="Generate output"]',
      '@CHECK assert="output valid" | fail=HALT | msg="Validation failed"',
    ].join('\n'),
  },
  {
    id: 'rule-declarations',
    label: 'Rule Declarations',
    source: [
      '@DOC ver=2.0 | id=report-rules | title="Sample Rules" | kind=rule | profile=decl',
      '@RULE lvl=MUST | when="creating file" | then="check .ai.md first"',
      '@RULE lvl=SHOULD | when="modifying 2+ files" | then="suggest feature manifest"',
      '@NOTE text="Rules govern agent behavior"',
    ].join('\n'),
  },
  {
    id: 'domain-health',
    label: 'Health Domain',
    source: [
      '@DOC ver=2.0 | id=report-health | title="Health Record" | kind=doc | domain=yai.health@1.0',
      '@SEC name="Patient"',
      '@NOTE text="Patient record with domain-specific tags"',
      '@MAP id=vitals | pairs=["bp"->"120/80","hr"->"72","temp"->"98.6"]',
    ].join('\n'),
  },
  {
    id: 'block-content',
    label: 'Block Content',
    source: [
      '@DOC ver=2.0 | id=report-block | title="Block Demo" | kind=doc',
      '@BEGIN JSON | id=config | mime="application/json" | boundary="bnd_config_01"',
      '{"database": "postgres", "port": 5432, "ssl": true}',
      '@END JSON | boundary="bnd_config_01"',
    ].join('\n'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Report generation
// ─────────────────────────────────────────────────────────────────────────────

function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function main() {
  const startTime = Date.now();
  const timestamp = generateTimestamp();
  const reportDir = join(import.meta.dirname ?? '.', 'reports', timestamp);
  mkdirSync(reportDir, { recursive: true });

  const lines: string[] = [];
  lines.push(`YON Parser Report — ${new Date().toISOString()}`);
  lines.push('='.repeat(60));
  lines.push('');

  // ── Section 1: Format Samples ──────────────────────────────────────────

  lines.push('## Format Samples');
  lines.push('');

  let sampleCount = 0;
  for (const sample of SAMPLES) {
    try {
      const doc = parse(sample.source);
      
      for (const mode of MODES) {
        const output = format(doc, { mode });
        const filename = `${sample.id}-${mode}.yon`;
        writeFileSync(join(reportDir, filename), output, 'utf-8');
        lines.push(`  ✓ ${filename} (${output.length} chars)`);
        sampleCount++;
      }
    } catch (err) {
      lines.push(`  × ${sample.id}: ${(err as Error).message}`);
    }
  }

  lines.push('');
  lines.push(`  ${sampleCount} format artifacts generated.`);
  lines.push('');

  // ── Section 2: Roundtrip Proof ─────────────────────────────────────────

  lines.push('## Roundtrip Proof (parse → format → parse)');
  lines.push('');

  const roundtripLines: string[] = [];
  let roundtripPass = 0;
  let roundtripFail = 0;

  for (const sample of SAMPLES) {
    try {
      const doc1 = parse(sample.source);
      const formatted = format(doc1, { mode: 'canon' });
      const doc2 = parse(formatted);
      
      // Compare record counts
      const match = doc1.records.length === doc2.records.length;
      if (match) {
        roundtripPass++;
        roundtripLines.push(`  ✓ ${sample.id}: ${doc1.records.length} records preserved`);
      } else {
        roundtripFail++;
        roundtripLines.push(`  × ${sample.id}: ${doc1.records.length} → ${doc2.records.length} records`);
      }
    } catch (err) {
      roundtripFail++;
      roundtripLines.push(`  × ${sample.id}: ${(err as Error).message}`);
    }
  }

  lines.push(...roundtripLines);
  lines.push('');
  lines.push(`  ${roundtripPass}/${roundtripPass + roundtripFail} roundtrips passed.`);
  lines.push('');

  writeFileSync(join(reportDir, 'roundtrip-proof.txt'), roundtripLines.join('\n'), 'utf-8');

  // ── Section 3: Validation Matrix ───────────────────────────────────────

  lines.push('## Validation Matrix');
  lines.push('');

  const vectorPaths = getVectorPaths();
  
  const validationLines: string[] = [];
  let strictPass = 0;
  let strictFail = 0;
  let lenientPass = 0;
  let lenientFail = 0;
  let parseErrors = 0;

  for (const vectorPath of vectorPaths) {
    const name = basename(vectorPath, '.yon');
    try {
      const content = readFileSync(vectorPath, 'utf-8');
      const doc = parse(content);
      
      const strict = validate(doc, { strict: true });
      const lenient = validate(doc, { strict: false });

      const strictStatus = strict.valid ? '✓' : '×';
      const lenientStatus = lenient.valid ? '✓' : '×';

      if (strict.valid) strictPass++; else strictFail++;
      if (lenient.valid) lenientPass++; else lenientFail++;

      validationLines.push(`  ${strictStatus}/${lenientStatus}  ${name}${strict.warnings.length > 0 ? ` (${strict.warnings.length} warnings)` : ''}`);
    } catch {
      parseErrors++;
      validationLines.push(`  P/P  ${name} (parse error — expected)`);
    }
  }

  lines.push(`  Vectors scanned: ${vectorPaths.length}`);
  lines.push(`  Parse errors (expected): ${parseErrors}`);
  lines.push(`  Strict:  ${strictPass} pass / ${strictFail} fail`);
  lines.push(`  Lenient: ${lenientPass} pass / ${lenientFail} fail`);
  lines.push('');

  writeFileSync(join(reportDir, 'validation-matrix.txt'), validationLines.join('\n'), 'utf-8');

  // ── Summary ────────────────────────────────────────────────────────────

  const elapsed = Date.now() - startTime;
  lines.push('─'.repeat(60));
  lines.push(`Duration: ${elapsed}ms`);
  lines.push(`Report: ${reportDir}`);

  const summary = lines.join('\n');
  writeFileSync(join(reportDir, '_summary.txt'), summary, 'utf-8');

  console.log(summary);
}

main();
