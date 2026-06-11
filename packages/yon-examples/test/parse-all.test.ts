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
 * @younndai/yon-examples — Parse All Test
 *
 * Every .yon example must parse without errors.
 * This test discovers all examples and validates each one.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@younndai/yon-parser';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const EXAMPLES_DIR = join(__dirname, '..', 'examples');

/**
 * Recursively find all .yon files in a directory.
 */
function findYonFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findYonFiles(full));
    } else if (extname(full) === '.yon') {
      results.push(full);
    }
  }

  return results;
}

describe('All examples parse without errors', () => {
  const files = findYonFiles(EXAMPLES_DIR);

  it('discovers at least 10 examples', () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  for (const file of files) {
    const relPath = file.replace(EXAMPLES_DIR, '').replace(/^[/\\]/, '');

    it(`parses: ${relPath}`, () => {
      const source = readFileSync(file, 'utf-8');
      const doc = parse(source);

      expect(doc).toBeDefined();
      expect(doc.version).toBe('2.0');
      expect(doc.id).toBeTruthy();
      expect(doc.title).toBeTruthy();
    });
  }
});
