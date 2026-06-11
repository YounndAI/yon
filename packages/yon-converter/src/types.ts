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
 * Core types for YON format conversion.
 * 
 * "Types define contracts. Interfaces must be precise to be useful."
 */

import type { YonDocument, YonProfile, YonFormat } from '@younndai/yon-parser';

// Re-export for convenience
export type { YonProfile, YonFormat };

/**
 * Detected input format.
 * 
 * `unknown` — Format could not be determined. Simple enveloping conversion is applied.
 * For full YON-to-YON conversion (reformat, profile change), see the YON-IR-based transformer tooling (separate project).
 */
export type InputFormat = 'json' | 'yaml' | 'toml' | 'ini' | 'csv' | 'xml' | 'unknown' | 'yon';

/**
 * Options for AST walker.
 */
export interface WalkOptions {
  /** Include metadata records in output (default: false) */
  includeMeta?: boolean;
  /** How to handle unresolved references */
  refHandling?: 'error' | 'placeholder' | 'ignore';
}

/**
 * Options for direct JSON converter.
 */
export interface JsonToYonOptions {
  /** YON profile */
  profile?: YonProfile;
  /** YON format */
  format?: YonFormat;
  /** Document kind */
  kind?: string;
  /** Document ID */
  id?: string;
  /** Document title */
  title?: string;
  /** Processing mode (struct|chat|text|hybrid) — §16.1 */
  mode?: string;
  /** Scenario preset — §16.1 */
  scenario?: string;
  /** Domain name (e.g., 'yai.health') — §16.1 */
  domain?: string;
  /** Explicitly enabled features — §16.1 */
  features?: string[];
  /** Additional features to enable — §16.1 */
  with?: string[];
  /** Features to disable — §16.1 */
  without?: string[];
}

/**
 * Options for direct YON to JSON converter.
 */
export interface YonToJsonOptions extends WalkOptions {
  /** Indentation for pretty printing */
  indent?: number;
}

// Re-export YonDocument for transformer package
export type { YonDocument };
