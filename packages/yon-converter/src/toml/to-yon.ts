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
 * TOML → YON Code Converter
 * 
 * Deterministic conversion from TOML to YON without AI.
 * Uses smol-toml to parse, then delegates to JSON converter.
 */

import * as TOML from 'smol-toml';
import { jsonToYon } from '../json/to-yon.js';
import type { JsonToYonOptions } from '../types.js';

/**
 * Options for TOML to YON conversion.
 */
export type TomlToYonOptions = JsonToYonOptions;

/**
 * Convert TOML input to YON format.
 * 
 * @param input - TOML string
 * @param options - Conversion options
 * @returns YON string
 */
export function tomlToYon(
  input: string,
  options: TomlToYonOptions = {}
): string {
  // Parse TOML to JavaScript object
  const data = TOML.parse(input);
  
  // Delegate to JSON converter
  return jsonToYon(data as Record<string, unknown>, options);
}
