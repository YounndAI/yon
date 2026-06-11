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
 * Official-domain conformance vectors.
 *
 * @younndai/domains is the Source of Truth for the official YON domains
 * (yai.lyt, yai.yonpa, …) and their conformance vectors. These vectors live
 * under conformance/vectors/ and assert that real-world documents for each
 * official domain parse as well-formed YON via @younndai/yon-parser.
 *
 *   - yonpa/  — 6 @AUTOMATOR / @CLUSTER vectors, each a .yon + .expected.json
 *               pair (the `parse` field is asserted against the parser).
 *   - yai-lyt/ — 18 yai.lyt federation/arc/lane/ledger/mesh vectors (.yon only;
 *               parse-only — they ship no .expected.json).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@younndai/yon-parser';

const VECTORS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'conformance', 'vectors');

interface ExpectedResult {
  parse: 'ok' | 'error';
}

function listYon(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yon'))
    .map((f) => resolve(dir, f));
}

describe('Official-domain conformance vectors', () => {
  describe('yai.lyt vectors parse as well-formed YON', () => {
    const vectors = listYon(resolve(VECTORS_DIR, 'yai-lyt'));

    it('all 18 yai.lyt vectors are present', () => {
      expect(vectors).toHaveLength(18);
    });

    describe.each(vectors)('Vector: %s', (yonPath) => {
      const name = basename(yonPath, '.yon');
      it(`${name}: parses`, () => {
        const content = readFileSync(yonPath, 'utf-8');
        expect(() => parse(content)).not.toThrow();
      });
    });
  });

  describe('yai.yonpa vectors parse per their expected.json', () => {
    const vectors = listYon(resolve(VECTORS_DIR, 'yonpa'));

    it('all 6 yai.yonpa vectors are present', () => {
      expect(vectors).toHaveLength(6);
    });

    describe.each(vectors)('Vector: %s', (yonPath) => {
      const name = basename(yonPath, '.yon');
      const expected = JSON.parse(
        readFileSync(yonPath.replace(/\.yon$/, '.expected.json'), 'utf-8'),
      ) as ExpectedResult;

      it(`${name}: parse ${expected.parse}`, () => {
        const content = readFileSync(yonPath, 'utf-8');
        if (expected.parse === 'ok') {
          expect(() => parse(content)).not.toThrow();
        } else {
          expect(() => parse(content)).toThrow();
        }
      });
    });
  });
});
