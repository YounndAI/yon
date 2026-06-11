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
 * CSV → YON Converter
 * 
 * Converts CSV data to YON format.
 */

import type { JsonToYonOptions } from '../types.js';
import { jsonToYon } from '../json/to-yon.js';

/**
 * CSV parsing options.
 */
export interface CsvToYonOptions extends JsonToYonOptions {
  /** Field delimiter (default: ',') */
  delimiter?: string;
  /** Whether first row is headers (default: true) */
  headers?: boolean;
  /** Quote character (default: '"') */
  quote?: string;
}

/**
 * Parse CSV string to array of objects.
 */
function parseCsv(
  input: string,
  options: { delimiter?: string; headers?: boolean; quote?: string } = {}
): Record<string, string>[] | string[][] {
  const { delimiter = ',', headers = true, quote = '"' } = options;
  
  const lines: string[] = [];
  let current = '';
  let inQuote = false;
  
  // Parse lines handling quoted newlines
  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;
    const next = input[i + 1];
    
    if (char === quote) {
      if (inQuote && next === quote) {
        // Escaped quote
        current += quote;
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if ((char === '\n' || (char === '\r' && next === '\n')) && !inQuote) {
      if (current.trim()) {
        lines.push(current);
      }
      current = '';
      if (char === '\r') i++;
    } else if (char !== '\r') {
      current += char;
    }
  }
  
  if (current.trim()) {
    lines.push(current);
  }
  
  if (lines.length === 0) {
    return [];
  }
  
  // Parse each line into fields
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]!;
      const next = line[i + 1];
      
      if (char === quote) {
        if (inQuote && next === quote) {
          field += quote;
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === delimiter && !inQuote) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    
    fields.push(field.trim());
    return fields;
  };
  
  const rows = lines.map(parseRow);
  
  if (!headers) {
    return rows;
  }
  
  // Use first row as headers
  const headerRow = rows[0]!;
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headerRow.forEach((header, i) => {
      obj[header] = row[i] ?? '';
    });
    return obj;
  });
}

/**
 * Convert CSV input to YON format.
 * 
 * @param input - CSV string
 * @param options - Conversion options
 * @returns YON string
 */
export function csvToYon(
  input: string,
  options: CsvToYonOptions = {}
): string {
  const { delimiter, headers, quote, ...jsonOptions } = options;
  const data = parseCsv(input, { delimiter, headers, quote });
  
  // Wrap in a records key
  const wrapped = { records: data };
  
  return jsonToYon(wrapped, {
    ...jsonOptions,
    kind: jsonOptions.kind ?? 'data',
  });
}
