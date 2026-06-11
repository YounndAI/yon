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
 * INI → YON Converter
 * 
 * Converts INI configuration files to YON format.
 */

import type { JsonToYonOptions } from '../types.js';
import { jsonToYon } from '../json/to-yon.js';

/**
 * Parse INI string to object.
 */
function parseIni(input: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let currentSection = 'default';
  
  const lines = input.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
      continue;
    }
    
    // Check for section header
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1]!;
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }
    
    // Parse key=value
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      result[currentSection]![key] = value;
    }
  }
  
  return result;
}

/**
 * Convert INI input to YON format.
 * 
 * @param input - INI string
 * @param options - Conversion options
 * @returns YON string
 */
export function iniToYon(
  input: string,
  options: JsonToYonOptions = {}
): string {
  const data = parseIni(input);
  return jsonToYon(data, {
    ...options,
    kind: options.kind ?? 'config',
  });
}
