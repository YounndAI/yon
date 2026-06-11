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
 * YON → JSON Reverse Converter
 * 
 * Converts YON documents back to JSON format.
 */

import type { YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { YonToJsonOptions } from '../types.js';

/**
 * Convert a YON document to JSON string.
 * 
 * @param document - Parsed YON document
 * @param options - Conversion options
 * @returns JSON string
 */
export function yonToJson(
  document: YonDocument,
  options: YonToJsonOptions = {}
): string {
  const { indent = 2, includeMeta = false, refHandling = 'ignore' } = options;
  
  // Walk the document to extract data
  let data = walkDocument(document, {
    includeMeta,
    refHandling,
  });
  
  // Handle @MAP name="data" wrapping for JSON round-trip
  // If result has a 'data' key containing an object, merge it with any siblings
  if (typeof data.data === 'object' && data.data !== null && !Array.isArray(data.data)) {
    const keys = Object.keys(data);
    if (keys.length === 1) {
      // Only data key - unwrap completely
      data = data.data as Record<string, unknown>;
    } else {
      // Merge data contents with sibling keys
      const { data: primitives, ...rest } = data;
      data = { ...(primitives as Record<string, unknown>), ...rest };
    }
  }
  
  return JSON.stringify(data, null, indent);
}

/**
 * Convert a YON document to a JavaScript object.
 * 
 * @param document - Parsed YON document
 * @param options - Conversion options
 * @returns Plain JavaScript object
 */
export function yonToObject(
  document: YonDocument,
  options: YonToJsonOptions = {}
): Record<string, unknown> {
  const { includeMeta = false, refHandling = 'ignore' } = options;
  
  return walkDocument(document, {
    includeMeta,
    refHandling,
  });
}
