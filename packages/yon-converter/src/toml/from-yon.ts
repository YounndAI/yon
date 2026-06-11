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
 * YON → TOML Reverse Converter
 * 
 * Converts YON documents to TOML format.
 */

import * as TOML from 'smol-toml';
import type { YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { YonToJsonOptions } from '../types.js';

/**
 * Options for YON to TOML conversion.
 */
export type YonToTomlOptions = YonToJsonOptions;

/**
 * Convert a YON document to TOML string.
 * 
 * @param document - Parsed YON document
 * @param options - Conversion options
 * @returns TOML string
 */
export function yonToToml(
  document: YonDocument,
  options: YonToTomlOptions = {}
): string {
  const { 
    includeMeta = false, 
    refHandling = 'ignore',
  } = options;
  
  // Walk the document to extract data
  const data = walkDocument(document, {
    includeMeta,
    refHandling,
  });
  
  // Convert to TOML
  // smol-toml requires the data to be a proper object
  return TOML.stringify(data as Record<string, unknown>);
}
