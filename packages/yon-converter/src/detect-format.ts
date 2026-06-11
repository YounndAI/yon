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
 * @younndai/yon-converter
 *
 * Format Detection — Detect input format from content.
 * 
 * "Detection is deterministic inference. Pattern matching, not guessing."
 */

import type { InputFormat } from './types.js';

// Re-export for convenience
export type { InputFormat };

/**
 * Detect input format from content.
 * 
 * The input declares its own nature through structure, not just extensions.
 * 
 * @param input - Raw input string
 * @returns Detected format
 */
export function detectFormat(input: string): InputFormat {
  const trimmed = input.trim();
  
  // Check for YON first. The standard takes precedence.
  if (trimmed.startsWith('@DOC') || /^@[A-Z]+\s/.test(trimmed)) {
    return 'yon';
  }
  
  // Check for JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for XML
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    if (/<\w+[^>]*>/.test(trimmed)) {
      return 'xml';
    }
  }
  
  // Check for CSV (multiple lines with consistent comma-separated columns)
  const lines = trimmed.split('\n').filter(l => l.trim());
  if (lines.length > 1) {
    const firstLineCommas = (lines[0]!.match(/,/g) || []).length;
    if (firstLineCommas > 0) {
      const allSameCommas = lines.slice(0, 5).every(line => {
        const commas = (line.match(/,/g) || []).length;
        return commas === firstLineCommas;
      });
      if (allSameCommas) {
        return 'csv';
      }
    }
  }
  
  // Check for INI (sections with [brackets] and key=value pairs)
  if (/^\s*\[[\w\s]+\]\s*$/m.test(trimmed) && /^\s*\w+\s*=\s*.+$/m.test(trimmed)) {
    return 'ini';
  }
  
  // Check for TOML (has = assignments, may have [sections])
  if (/^\s*\[.*\]\s*$/m.test(trimmed) || /^\s*\w+\s*=\s*/.test(trimmed)) {
    // Distinguish from INI by checking for TOML-specific features
    if (/("""|\[\[|\d{4}-\d{2}-\d{2})/.test(trimmed)) {
      return 'toml';
    }
    // Simple key=value could be either, default to ini if simple
    if (/^\s*\[[\w\s]+\]\s*$/m.test(trimmed)) {
      return 'ini';
    }
    return 'toml';
  }
  
  // Check for YAML (has : colons with proper indentation)
  if (/^\s*[\w-]+\s*:\s*/m.test(trimmed)) {
    return 'yaml';
  }
  
  // Could not identify a structured format — simple enveloping conversion will be applied
  return 'unknown';
}
