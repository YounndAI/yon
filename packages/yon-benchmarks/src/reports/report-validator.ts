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
 * Report Validator — post-generation quality gate.
 *
 * Runs after ALL report files are written (renderer, scorecards, explainers).
 * Scans every .md and .json file in the report directory for:
 *   1. Unreplaced {{PLACEHOLDER}} tokens
 *   2. Banned terminology ("scope constraint" -> "known boundary")
 *   3. Emoji in report text (console emoji are fine; report emoji are not)
 *
 * Auto-fixes terminology issues in-place. Warns about unfixable issues.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Terms that should never appear in report output. Map: banned -> replacement. */
const BANNED_TERMS: Array<{ pattern: RegExp; replacement: string; titleReplacement: string; label: string }> = [
  { pattern: /[Ss]cope [Cc]onstraints/g, replacement: 'known boundaries', titleReplacement: 'Known Boundaries', label: 'scope constraints -> known boundaries' },
  { pattern: /[Ss]cope [Cc]onstraint/g, replacement: 'known boundary', titleReplacement: 'Known Boundary', label: 'scope constraint -> known boundary' },
  { pattern: /[Ss]cope [Ll]imitation/g, replacement: 'known boundary', titleReplacement: 'Known Boundary', label: 'scope limitation -> known boundary' },
];

/** Emoji that should not appear in report .md files. */
// eslint-disable-next-line no-misleading-character-class
const REPORT_EMOJI = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u2705\u274C\u26A0\uFE0F\u{1F4C4}\u{1F4CA}\u{1F4DD}\u{1F4D0}\u{1F4E6}\u{1F500}\u{1F9E0}]/gu;

/** Unreplaced placeholder pattern. */
const UNREPLACED_PLACEHOLDER = /\{\{[A-Z][A-Z0-9_]*\}\}/g;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  file: string;
  line: number;
  type: 'placeholder' | 'banned-term' | 'emoji';
  detail: string;
  autoFixed: boolean;
}

export interface ValidationResult {
  totalFiles: number;
  issuesFound: number;
  autoFixed: number;
  warnings: number;
  issues: ValidationIssue[];
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/** Recursively collect all .md and .json files in a directory. */
function collectReportFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectReportFiles(full));
    } else if (entry.endsWith('.md') || entry.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Validate and auto-fix all report files in the given directory.
 *
 * - Banned terms: auto-fixed in-place
 * - Emoji: auto-fixed (removed) in-place
 * - Unreplaced placeholders: warned only (cannot auto-fix, data is missing)
 */
export function validateReportDirectory(reportDir: string): ValidationResult {
  const files = collectReportFiles(reportDir);
  const issues: ValidationIssue[] = [];
  let autoFixed = 0;

  for (const filePath of files) {
    const rel = relative(reportDir, filePath);
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    const lines = content.split('\n');

    // --- Check 1: Banned terminology (auto-fix) ---
    for (const { pattern, replacement, titleReplacement, label } of BANNED_TERMS) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        pattern.lastIndex = 0;
        // Find which lines have the issue
        for (let i = 0; i < lines.length; i++) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i]!)) {
            issues.push({ file: rel, line: i + 1, type: 'banned-term', detail: label, autoFixed: true });
            autoFixed++;
          }
        }
        // Case-aware replacement: uppercase match → title case, lowercase → lowercase
        content = content.replace(pattern, (match) => match[0] === 'S' ? titleReplacement : replacement);
        modified = true;
      }
    }

    // --- Check 2: Emoji in .md files (auto-fix) ---
    if (filePath.endsWith('.md')) {
      REPORT_EMOJI.lastIndex = 0;
      if (REPORT_EMOJI.test(content)) {
        REPORT_EMOJI.lastIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          REPORT_EMOJI.lastIndex = 0;
          if (REPORT_EMOJI.test(lines[i]!)) {
            issues.push({ file: rel, line: i + 1, type: 'emoji', detail: 'emoji in report text', autoFixed: true });
            autoFixed++;
          }
        }
        content = content.replace(REPORT_EMOJI, '');
        modified = true;
      }
    }

    // --- Check 3: Unreplaced placeholders (auto-fix by removing lines) ---
    // These are LLM-hallucinated metric names that don't exist in the data.
    // The sentence is meaningless without the value, so strip the line.
    const updatedLines = content.split('\n');
    let placeholderFixed = false;
    for (let i = updatedLines.length - 1; i >= 0; i--) {
      UNREPLACED_PLACEHOLDER.lastIndex = 0;
      const matches = updatedLines[i]!.match(UNREPLACED_PLACEHOLDER);
      if (matches) {
        for (const m of matches) {
          issues.push({ file: rel, line: i + 1, type: 'placeholder', detail: `stripped line with: ${m}`, autoFixed: true });
          autoFixed++;
        }
        updatedLines.splice(i, 1);
        placeholderFixed = true;
      }
    }
    if (placeholderFixed) {
      content = updatedLines.join('\n');
      modified = true;
    }

    // Write back if modified
    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
    }
  }

  const warnings = issues.filter(i => !i.autoFixed).length;

  return {
    totalFiles: files.length,
    issuesFound: issues.length,
    autoFixed,
    warnings,
    issues,
  };
}
