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
 * YON → YAML Reverse Converter
 * 
 * Converts YON documents to YAML format.
 */

import YAML from 'yaml';
import type { YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { YonToJsonOptions } from '../types.js';

/**
 * Options for YON to YAML conversion.
 */
export interface YonToYamlOptions extends YonToJsonOptions {
  /** Use block style for objects/arrays */
  blockStyle?: boolean;
  /** Line width for wrapping (0 = no wrap) */
  lineWidth?: number;
}

/**
 * Convert a YON document to YAML string.
 * 
 * @param document - Parsed YON document
 * @param options - Conversion options
 * @returns YAML string
 */
export function yonToYaml(
  document: YonDocument,
  options: YonToYamlOptions = {}
): string {
  const { 
    indent = 2, 
    includeMeta = false, 
    refHandling = 'ignore',
    blockStyle = true,
    lineWidth = 80,
  } = options;
  
  // Walk the document to extract data
  const data = walkDocument(document, {
    includeMeta,
    refHandling,
  });
  
  // Convert to YAML
  return YAML.stringify(data, {
    indent,
    lineWidth: lineWidth === 0 ? undefined : lineWidth,
    defaultStringType: blockStyle ? 'BLOCK_LITERAL' : 'QUOTE_DOUBLE',
  });
}
