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
 * YON → CSV Converter
 * 
 * Converts YON documents to CSV format.
 */

import { parse, type YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { WalkOptions } from '../types.js';

/**
 * CSV output options.
 */
export interface YonToCsvOptions extends WalkOptions {
  /** Field delimiter (default: ',') */
  delimiter?: string;
  /** Quote character (default: '"') */
  quote?: string;
  /** Whether to include headers (default: true) */
  headers?: boolean;
}

/**
 * Escape a CSV field value.
 */
function escapeField(
  value: unknown,
  delimiter: string,
  quote: string
): string {
  const str = value === null || value === undefined ? '' : String(value);
  
  // Check if quoting is needed
  const needsQuote = str.includes(delimiter) || 
                     str.includes(quote) || 
                     str.includes('\n') ||
                     str.includes('\r');
  
  if (needsQuote) {
    // Escape quotes by doubling them
    const escaped = str.replace(new RegExp(quote, 'g'), quote + quote);
    return `${quote}${escaped}${quote}`;
  }
  
  return str;
}

/**
 * Convert array of objects to CSV.
 */
function objectsToCsv(
  data: Record<string, unknown>[],
  options: { delimiter: string; quote: string; headers: boolean }
): string {
  const { delimiter, quote, headers } = options;
  
  if (data.length === 0) {
    return '';
  }
  
  // Get all unique keys
  const allKeys = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      allKeys.add(key);
    }
  }
  const keys = Array.from(allKeys);
  
  const lines: string[] = [];
  
  // Header row
  if (headers) {
    lines.push(keys.map(k => escapeField(k, delimiter, quote)).join(delimiter));
  }
  
  // Data rows
  for (const row of data) {
    const values = keys.map(k => escapeField(row[k], delimiter, quote));
    lines.push(values.join(delimiter));
  }
  
  return lines.join('\n');
}

/**
 * Convert 2D array to CSV.
 */
function arrayToCsv(
  data: unknown[][],
  options: { delimiter: string; quote: string }
): string {
  const { delimiter, quote } = options;
  
  return data
    .map(row => row.map(v => escapeField(v, delimiter, quote)).join(delimiter))
    .join('\n');
}

/**
 * Convert YON to CSV format.
 * 
 * @param input - YON string or document
 * @param options - Conversion options
 * @returns CSV string
 */
export function yonToCsv(
  input: string | YonDocument,
  options: YonToCsvOptions = {}
): string {
  const { delimiter = ',', quote = '"', headers = true, ...walkOptions } = options;
  
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, walkOptions);
  
  // Find array data to convert
  let arrayData: unknown[] | undefined;
  
  if (Array.isArray(data)) {
    arrayData = data;
  } else if (typeof data === 'object' && data !== null) {
    // Look for a records/items/data key
    for (const key of ['records', 'items', 'data', 'rows']) {
      if (Array.isArray((data as Record<string, unknown>)[key])) {
        arrayData = (data as Record<string, unknown>)[key] as unknown[];
        break;
      }
    }
    
    // Fallback: use first array found
    if (!arrayData) {
      for (const value of Object.values(data as Record<string, unknown>)) {
        if (Array.isArray(value)) {
          arrayData = value;
          break;
        }
      }
    }
  }
  
  if (!arrayData || arrayData.length === 0) {
    return '';
  }
  
  // Check if it's array of objects or array of arrays
  const first = arrayData[0];
  if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
    return objectsToCsv(arrayData as Record<string, unknown>[], { delimiter, quote, headers });
  }
  
  if (Array.isArray(first)) {
    return arrayToCsv(arrayData as unknown[][], { delimiter, quote });
  }
  
  // Simple array of primitives - one column
  return arrayData.map(v => escapeField(v, delimiter, quote)).join('\n');
}
