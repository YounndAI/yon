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
 * Streaming — Async generators for large reverse conversions.
 * 
 * "Flow over state. Streaming handles the infinite with finite resources."
 */

import { parse, type YonDocument, type YonRecord } from '@younndai/yon-parser';
import { walkDocument } from './ast-walker.js';
import type { WalkOptions } from './types.js';

/**
 * Streaming options.
 */
export interface StreamOptions extends WalkOptions {
  /** Chunk size in characters (approximate) */
  chunkSize?: number;
  /** Target format */
  targetFormat: 'json' | 'yaml' | 'toml';
  /** Indentation for pretty printing */
  indent?: number;
}

/**
 * Stream chunk with metadata.
 */
export interface StreamChunk {
  /** Chunk content */
  content: string;
  /** Chunk index (0-based) */
  index: number;
  /** Whether this is the last chunk */
  isLast: boolean;
  /** Total bytes streamed so far */
  bytesSoFar: number;
}

/**
 * Stream YON to JSON chunks.
 * 
 * Yields data as it forms. Latency is the enemy.
 * 
 * Yields chunks of JSON output for large documents.
 */
export async function* streamToJson(
  input: string | YonDocument,
  options: Omit<StreamOptions, 'targetFormat'> = {}
): AsyncGenerator<StreamChunk> {
  const { chunkSize = 4096, indent = 2, includeMeta = false } = options;
  
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, { includeMeta });
  
  // Stringify and chunk
  const jsonStr = JSON.stringify(data, null, indent);
  
  yield* chunkString(jsonStr, chunkSize);
}

/**
 * Stream YON to YAML chunks.
 */
export async function* streamToYaml(
  input: string | YonDocument,
  options: Omit<StreamOptions, 'targetFormat'> = {}
): AsyncGenerator<StreamChunk> {
  const { chunkSize = 4096, indent = 2, includeMeta = false } = options;
  
  const { stringify } = await import('yaml');
  
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, { includeMeta });
  
  const yamlStr = stringify(data, { indent });
  
  yield* chunkString(yamlStr, chunkSize);
}

/**
 * Stream YON to TOML chunks.
 */
export async function* streamToToml(
  input: string | YonDocument,
  options: Omit<StreamOptions, 'targetFormat'> = {}
): AsyncGenerator<StreamChunk> {
  const { chunkSize = 4096, includeMeta = false } = options;
  
  const { stringify } = await import('smol-toml');
  
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, { includeMeta });
  
  // TOML stringify needs a plain object
  const tomlStr = stringify(data as Record<string, unknown>);
  
  yield* chunkString(tomlStr, chunkSize);
}

/**
 * Universal streaming reverse converter.
 */
export async function* streamReverse(
  input: string | YonDocument,
  options: StreamOptions
): AsyncGenerator<StreamChunk> {
  switch (options.targetFormat) {
    case 'json':
      yield* streamToJson(input, options);
      break;
    case 'yaml':
      yield* streamToYaml(input, options);
      break;
    case 'toml':
      yield* streamToToml(input, options);
      break;
    default:
      throw new Error(`Unsupported target format: ${options.targetFormat}`);
  }
}

/**
 * Chunk a string into StreamChunks.
 */
async function* chunkString(
  str: string,
  chunkSize: number
): AsyncGenerator<StreamChunk> {
  let index = 0;
  let bytesSoFar = 0;
  
  for (let i = 0; i < str.length; i += chunkSize) {
    const content = str.slice(i, i + chunkSize);
    bytesSoFar += Buffer.byteLength(content, 'utf-8');
    const isLast = i + chunkSize >= str.length;
    
    yield {
      content,
      index,
      isLast,
      bytesSoFar,
    };
    
    index++;
  }
  
  // Handle empty string case
  if (str.length === 0) {
    yield {
      content: '',
      index: 0,
      isLast: true,
      bytesSoFar: 0,
    };
  }
}

/**
 * Collect all chunks into a single string.
 * 
 * Utility for consuming streaming output.
 */
export async function collectStream(
  stream: AsyncGenerator<StreamChunk>
): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk.content);
  }
  return chunks.join('');
}

/**
 * Stream YON records one at a time.
 * 
 * For very large documents, yields individual records.
 */
export async function* streamRecords(
  input: string | YonDocument
): AsyncGenerator<{ record: YonRecord; index: number }> {
  const document = typeof input === 'string' ? parse(input) : input;
  
  let index = 0;
  for (const record of document.records) {
    yield { record, index };
    index++;
  }
}
