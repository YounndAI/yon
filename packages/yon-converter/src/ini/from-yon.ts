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
 * YON → INI Converter
 * 
 * Converts YON documents to INI configuration format.
 */

import { parse, type YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { WalkOptions } from '../types.js';

/**
 * Stringify object to INI format.
 */
function stringifyIni(data: Record<string, unknown>): string {
  const lines: string[] = [];
  
  for (const [section, values] of Object.entries(data)) {
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      // Section with nested values
      lines.push(`[${section}]`);
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        lines.push(formatIniValue(key, value));
      }
      lines.push(''); // Empty line after section
    } else {
      // Top-level value goes in default section
      lines.push(formatIniValue(section, values));
    }
  }
  
  return lines.join('\n');
}

/**
 * Format a single INI key=value line.
 */
function formatIniValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return `${key} = `;
  }
  
  if (typeof value === 'string') {
    // Quote if contains special characters
    if (value.includes(' ') || value.includes('=') || value.includes(';')) {
      return `${key} = "${value}"`;
    }
    return `${key} = ${value}`;
  }
  
  if (typeof value === 'boolean' || typeof value === 'number') {
    return `${key} = ${value}`;
  }
  
  if (Array.isArray(value)) {
    return `${key} = ${value.join(',')}`;
  }
  
  // Objects become comma-separated
  if (typeof value === 'object') {
    return `${key} = ${JSON.stringify(value)}`;
  }
  
  return `${key} = ${String(value)}`;
}

/**
 * Options for INI output.
 */
export interface YonToIniOptions extends WalkOptions {
  // No additional options for now
}

/**
 * Convert YON to INI format.
 * 
 * @param input - YON string or document
 * @param options - Conversion options
 * @returns INI string
 */
export function yonToIni(
  input: string | YonDocument,
  options: YonToIniOptions = {}
): string {
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, options);
  return stringifyIni(data);
}
