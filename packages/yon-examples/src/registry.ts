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
 * @younndai/yon-examples
 *
 * Example registry. Discovers and indexes all .yon files in the examples directory.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const EXAMPLES_DIR = join(__dirname, '..', 'examples');

export interface ExampleEntry {
  /** Example ID (filename without extension) */
  id: string;
  /** Category (directory name) */
  category: string;
  /** Full path to the .yon file */
  path: string;
  /** Relative path from examples root */
  relativePath: string;
}

/**
 * Discover all .yon example files.
 */
export function discoverExamples(): ExampleEntry[] {
  const entries: ExampleEntry[] = [];

  const categories = readdirSync(EXAMPLES_DIR).filter(d => {
    const full = join(EXAMPLES_DIR, d);
    return statSync(full).isDirectory();
  });

  for (const category of categories.sort()) {
    const categoryPath = join(EXAMPLES_DIR, category);
    const files = readdirSync(categoryPath).filter(f => extname(f) === '.yon');

    for (const file of files.sort()) {
      entries.push({
        id: basename(file, '.yon'),
        category,
        path: join(categoryPath, file),
        relativePath: relative(EXAMPLES_DIR, join(categoryPath, file)),
      });
    }
  }

  return entries;
}

/**
 * Read the contents of an example file.
 */
export function readExample(entry: ExampleEntry): string {
  return readFileSync(entry.path, 'utf-8');
}

/**
 * Find an example by ID.
 */
export function findExample(id: string): ExampleEntry | undefined {
  return discoverExamples().find(e => e.id === id);
}

/**
 * Get all category names.
 */
export function getCategories(): string[] {
  return [...new Set(discoverExamples().map(e => e.category))];
}
