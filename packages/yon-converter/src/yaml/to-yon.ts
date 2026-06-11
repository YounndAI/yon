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
 * YAML → YON Code Converter
 * 
 * Deterministic conversion from YAML to YON without AI.
 * Uses YAML library to parse, then delegates to JSON converter.
 */

import YAML from 'yaml';
import { jsonToYon } from '../json/to-yon.js';
import type { JsonToYonOptions } from '../types.js';

/**
 * Options for YAML to YON conversion.
 */
export interface YamlToYonOptions extends JsonToYonOptions {
  /** Preserve YAML comments as @NOTE records */
  preserveComments?: boolean;
}

/**
 * Convert YAML input to YON format.
 * 
 * @param input - YAML string
 * @param options - Conversion options
 * @returns YON string
 */
export function yamlToYon(
  input: string,
  options: YamlToYonOptions = {}
): string {
  const { preserveComments = false, ...jsonOptions } = options;
  
  // Parse YAML to JavaScript object
  const doc = YAML.parseDocument(input);
  
  // If we want to preserve comments, handle specially
  if (preserveComments && doc.commentBefore) {
    // For now, we just parse without comments
    // TODO: Implement comment preservation in future
  }
  
  const data = doc.toJS() as Record<string, unknown>;
  
  // Delegate to JSON converter
  return jsonToYon(data, jsonOptions);
}
