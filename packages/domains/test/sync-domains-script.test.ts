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

import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function runSyncWithSource(sourceDir: string) {
  const tempDir = mkdtempSync(resolve(tmpdir(), 'yai-domains-sync-'));
  try {
    return spawnSync(process.execPath, ['scripts/sync-domains.mjs'], {
      cwd: PACKAGE_ROOT,
      encoding: 'utf-8',
      env: {
        ...process.env,
        YAI_DOMAINS_SYNC_SOURCE_DIR: sourceDir,
        YAI_DOMAINS_SYNC_OUTPUT_FILE: resolve(tempDir, 'bundled.generated.ts'),
      },
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

describe('sync-domains script input handling', () => {
  it('fails clearly when the source directory is missing', () => {
    const missingDir = resolve(tmpdir(), `yai-domains-missing-${process.pid}`);
    const result = runSyncWithSource(missingDir);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('domains directory not found');
    expect(result.stderr).toContain('Package-owned domain schemas are required input');
  });

  it('fails clearly when the source directory has zero schemas', () => {
    const emptyDir = mkdtempSync(resolve(tmpdir(), 'yai-domains-empty-'));
    try {
      mkdirSync(resolve(emptyDir, 'not-a-schema'));
      const result = runSyncWithSource(emptyDir);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('no domain schemas found');
      expect(result.stderr).toContain('Expected package-owned schemas');
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});
