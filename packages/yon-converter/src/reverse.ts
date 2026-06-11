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
 * Reverse Converter — Convert YON back to other formats.
 * 
 * "Reversibility is proof. What can be built can be deconstructed."
 */

import { parse, format } from '@younndai/yon-parser';
import { yonToJson } from './json/index.js';
import { yonToYaml } from './yaml/index.js';
import { yonToToml } from './toml/index.js';
import { yonToCsv } from './csv/index.js';
import { yonToXml } from './xml/index.js';
import { yonToIni } from './ini/index.js';

/**
 * Options for reverse conversion (YON → JSON/YAML/TOML/CSV/XML/INI/YON).
 */
export interface ReverseConvertOptions {
  /** Target format. 'yon' = passthrough (re-serialized via parser). For full YON transformation, use a YON-IR transformer (out-of-scope here). */
  targetFormat: 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini' | 'yon';
  /** Strip YON metadata (@DOC, @NOTE, etc.) from output. Default: true */
  stripMeta?: boolean;
  /** Indentation for pretty printing */
  indent?: number;
}

/**
 * Reverse convert YON to another format.
 * 
 * Transforms YON back to its origins. Lossless where structure permits.
 * 
 * For YON-to-YON, this performs a parse → re-serialize passthrough.
 * For structural transformation (reformat, re-profile, domain migration),
 * use a separate YON-IR transformer.
 * 
 * @param yonInput - YON string
 * @param options - Reverse conversion options
 * @returns Converted string in target format
 */
export function reverseConvert(
  yonInput: string,
  options: ReverseConvertOptions
): string {
  const { targetFormat, stripMeta = true, indent = 2 } = options;
  
  // Parse YON
  const document = parse(yonInput);
  
  const walkOptions = {
    includeMeta: !stripMeta,
    indent,
  };
  
  switch (targetFormat) {
    case 'json':
      return yonToJson(document, walkOptions);
    case 'yaml':
      return yonToYaml(document, walkOptions);
    case 'toml':
      return yonToToml(document, walkOptions);
    case 'csv':
      return yonToCsv(document, walkOptions);
    case 'xml':
      return yonToXml(document, walkOptions);
    case 'ini':
      return yonToIni(document, walkOptions);
    case 'yon':
      // Passthrough: parse → re-serialize via formatter.
      // This validates and normalizes the input but does NOT transform structure.
      // For structural changes, use a separate YON-IR transformer.
      return format(document);
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}
