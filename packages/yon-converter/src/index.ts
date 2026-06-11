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
 * Deterministic YON format converters. Code-only. No AI.
 */

// Types
export type {
  InputFormat,
  WalkOptions,
  JsonToYonOptions,
  YonToJsonOptions,
  YonProfile,
  YonFormat,
} from './types.js';

// Format detection
export { detectFormat } from './detect-format.js';

// AST Walker
export { walkDocument, walkRecord, walkBlock } from './ast-walker.js';

// JSON Converters
export { jsonToYon, yonToJson, yonToObject } from './json/index.js';

// YAML Converters
export { 
  yamlToYon, 
  yonToYaml,
  type YamlToYonOptions,
  type YonToYamlOptions,
} from './yaml/index.js';

// TOML Converters
export { 
  tomlToYon, 
  yonToToml,
  type TomlToYonOptions,
  type YonToTomlOptions,
} from './toml/index.js';

// INI Converters
export {
  iniToYon,
  yonToIni,
  type YonToIniOptions,
} from './ini/index.js';

// CSV Converters
export {
  csvToYon,
  yonToCsv,
  type CsvToYonOptions,
  type YonToCsvOptions,
} from './csv/index.js';

// XML Converters
export {
  xmlToYon,
  yonToXml,
  type YonToXmlOptions,
} from './xml/index.js';

// Direct reverse converter (code-only)
export { reverseConvert, type ReverseConvertOptions } from './reverse.js';


// Streaming
export {
  streamToJson,
  streamToYaml,
  streamToToml,
  streamReverse,
  streamRecords,
  collectStream,
  type StreamOptions,
  type StreamChunk,
} from './streaming.js';
