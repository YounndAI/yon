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
 * Vector loader — reads pre-generated .yon files from the vectors/ directory.
 *
 * All vectors are AOT-generated using standard encoding techniques.
 * This module loads them at runtime from committed files.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Root directory of the vectors/ tree. */
const VECTORS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../vectors');

/**
 * Load a vector file by category and filename.
 * @example loadVector('structural', '50-records.yon')
 */
export function loadVector(category: string, filename: string): string {
  const filepath = join(VECTORS_ROOT, category, filename);
  if (!existsSync(filepath)) {
    throw new Error(
      `Vector not found: ${category}/${filename}. ` +
        `Run 'npm run vectors:generate' to create vectors.`,
    );
  }
  return readFileSync(filepath, 'utf-8');
}

/**
 * Load all vectors in a category directory.
 * Returns a map of filename → content.
 */
export function loadVectorCategory(category: string): Map<string, string> {
  const dir = join(VECTORS_ROOT, category);
  if (!existsSync(dir)) {
    throw new Error(`Vector category not found: ${category}`);
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.yon'));
  const result = new Map<string, string>();
  for (const file of files) {
    result.set(file, readFileSync(join(dir, file), 'utf-8'));
  }
  return result;
}

/** Check whether a specific vector exists. */
export function hasVector(category: string, filename: string): boolean {
  return existsSync(join(VECTORS_ROOT, category, filename));
}
