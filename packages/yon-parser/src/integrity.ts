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
 * YON SHA-256 Integrity Helpers
 *
 * Per blocks.md §6.2: "Runners SHOULD verify sha256 when present."
 * The parser provides these helpers so runners don't need to re-implement.
 * Verification is async (Web Crypto API / Node crypto).
 */

import type { YonDocument, YonBlock } from './types.js';

/**
 * Compute SHA-256 hash of content.
 * Uses Web Crypto API (browser) or Node.js crypto module.
 */
async function sha256(content: string): Promise<string> {
  // Try Web Crypto API first (works in browser and modern Node)
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: Node.js crypto
  try {
    const crypto = await import('node:crypto');
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  } catch {
    throw new Error('SHA-256 not available: neither Web Crypto nor Node.js crypto found');
  }
}

/**
 * Verify SHA-256 integrity of a single block.
 *
 * @param block - The YonBlock to verify
 * @returns null if no sha256 declared, true if match, false if mismatch
 */
export async function verifyBlockIntegrity(block: YonBlock): Promise<boolean | null> {
  if (!block.sha256) return null;
  if (!block.content) return null;

  const computed = await sha256(block.content);
  return computed === block.sha256;
}

/**
 * Verify all blocks in a document.
 * Only checks blocks that declare a sha256 hash.
 *
 * @param doc - The YonDocument to verify
 * @returns Map of blockId → true (pass) | false (fail). Empty if no hashes declared.
 */
export async function verifyDocumentIntegrity(doc: YonDocument): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  for (const [id, block] of doc.blocks) {
    const result = await verifyBlockIntegrity(block);
    if (result !== null) {
      results.set(id, result);
    }
  }

  return results;
}
