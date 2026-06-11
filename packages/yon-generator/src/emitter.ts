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
 * @younndai/yon-generator
 *
 * Deterministic emitter. Converts builder state → valid YON text.
 * The builder collects structure; the emitter produces syntax.
 */

import type { YonProfile, YonFormat, YonMode, YonKind } from '@younndai/yon-parser';

// ─────────────────────────────────────────────────────────────────────────────
// Internal state types (mirror builder's internal representation)
// ─────────────────────────────────────────────────────────────────────────────

export interface DocState {
  version: string;
  kind: YonKind;
  id: string;
  title: string;
  profile: YonProfile | null;
  mode: YonMode | null;
  fmt: YonFormat | null;
  domain: string | null;
  scenario: string | null;
  /** Feature modifiers: features to add */
  withFeatures: string[];
  /** Feature modifiers: features to remove */
  withoutFeatures: string[];
  // Governance & Lifecycle (document.md §"Governance and Lifecycle Fields")
  lang: string | null;
  region: string | null;
  direction: string | null;
  classification: string | null;
  handling: string | null;
  jurisdiction: string | null;
  data_residency: string | null;
  embargo_until: string | null;
  retention: string | null;
  retention_authority: string | null;
  expires: string | null;
  parent: string | null;
  audience: string | null;
  license: string | null;
  redact: boolean | null;
  guide: string | null;
}

export interface LineEntry {
  type: 'comment' | 'raw' | 'section' | 'step' | 'rule' | 'note' | 'check' |
        'catch' | 'retry' | 'input' | 'output' | 'stamp' | 'meta' |
        'cfg' | 'map' | 'begin' | 'end' | 'ref' | 'blank' |
        'intent' | 'scope' | 'schema' | 'def' | 'yield' | 'error' | 'domain-record' |
        // Change Control
        'patch' | 'void' |
        // Dialogue
        'turn' | 'ack' |
        // Sessions
        'session' | 'checkpoint' | 'recover' |
        // Privacy
        'redaction' | 'consent' |
        // Cross-Domain
        'identity' | 'location' |
        // L3 Cognition
        'thought' | 'hypothesis' | 'observation' | 'reflection' |
        'decision' | 'prune' | 'introspect' | 'essence' |
        'percept' | 'focus' | 'goal' |
        'pulse' | 'imprint' | 'memory' | 'learn' | 'shard' | 'mark' | 'affect' |
        // L4 Agent
        'agent' | 'caps' | 'signal' | 'throttle' |
        'subscribe' | 'route' | 'merge' | 'stream' |
        'timeline' | 'event' |
        'workspace' | 'edit' | 'call' |
        'tenet' | 'escalate' | 'halt' | 'deregister' |
        'on' | 'emit' | 'loop';
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Emit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a complete YON document from doc state and line entries.
 */
export function emit(doc: DocState, lines: LineEntry[]): string {
  const output: string[] = [];

  // @DOC header
  output.push(emitDocHeader(doc));
  output.push('');

  // Body lines
  for (const entry of lines) {
    output.push(entry.content);
  }

  // Ensure trailing newline
  return output.join('\n') + '\n';
}

/**
 * Emit @DOC header line.
 * Field order per tag-registry.md L28 (normative):
 *   ver, id, title, kind, domain, mode, profile, fmt, then remaining.
 */
function emitDocHeader(doc: DocState): string {
  const parts: string[] = [`@DOC ver=${doc.version}`];

  // Normative order: ver (already added), id, title, kind, domain, mode, profile, fmt
  parts.push(`id=${quoteIfNeeded(doc.id)}`);
  parts.push(`title=${quoteIfNeeded(doc.title)}`);
  parts.push(`kind=${doc.kind}`);

  if (doc.domain) parts.push(`domain=${doc.domain}`);
  if (doc.mode) parts.push(`mode=${doc.mode}`);
  if (doc.profile) parts.push(`profile=${doc.profile}`);
  if (doc.fmt) parts.push(`fmt=${doc.fmt}`);

  // Feature modifiers (after core @DOC fields)
  if (doc.withFeatures.length > 0) {
    parts.push(`with=[${doc.withFeatures.join(',')}]`);
  }
  if (doc.withoutFeatures.length > 0) {
    parts.push(`without=[${doc.withoutFeatures.join(',')}]`);
  }

  // Governance & lifecycle fields — alphabetical per tag-registry.md L28
  if (doc.audience) parts.push(`audience=${quoteIfNeeded(doc.audience)}`);
  if (doc.classification) parts.push(`classification=${doc.classification}`);
  if (doc.data_residency) parts.push(`data_residency=${doc.data_residency}`);
  if (doc.direction) parts.push(`direction=${doc.direction}`);
  if (doc.embargo_until) parts.push(`embargo_until:ts=${quoteIfNeeded(doc.embargo_until)}`);
  if (doc.expires) parts.push(`expires:ts=${quoteIfNeeded(doc.expires)}`);
  if (doc.guide) parts.push(`guide=${quoteIfNeeded(doc.guide)}`);
  if (doc.handling) parts.push(`handling=${quoteIfNeeded(doc.handling)}`);
  if (doc.jurisdiction) parts.push(`jurisdiction=${doc.jurisdiction}`);
  if (doc.lang) parts.push(`lang=${doc.lang}`);
  if (doc.license) parts.push(`license=${quoteIfNeeded(doc.license)}`);
  if (doc.parent) parts.push(`parent=${quoteIfNeeded(doc.parent)}`);
  if (doc.redact !== null && doc.redact !== undefined) parts.push(`redact:bool=${doc.redact}`);
  if (doc.region) parts.push(`region=${doc.region}`);
  if (doc.retention) parts.push(`retention=${quoteIfNeeded(doc.retention)}`);
  if (doc.retention_authority) parts.push(`retention_authority=${quoteIfNeeded(doc.retention_authority)}`);

  // Scenario is a builder convenience — emitted after all spec fields
  if (doc.scenario) parts.push(`scenario=${doc.scenario}`);

  return parts.join(' | ');
}

/**
 * Quote a value if it contains special characters.
 */
export function quoteIfNeeded(value: string): string {
  if (/[| \t"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/**
 * Format key-value pairs for inline attributes.
 */
export function formatAttrs(attrs: Record<string, unknown>): string {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const val = typeof v === 'string' ? quoteIfNeeded(v) : String(v);
      return `${k}=${val}`;
    })
    .join(' | ');
}

/**
 * Format a list of references (e.g., in=["block:raw", "block:parsed"]).
 */
export function formatRefList(refs: string[]): string {
  return `[${refs.map(r => quoteIfNeeded(r)).join(', ')}]`;
}

/**
 * Format a map pairs list (e.g., ["key"->"value", "key2"->"value2"]).
 */
export function formatMapPairs(pairs: Record<string, string>): string {
  const formatted = Object.entries(pairs)
    .map(([k, v]) => `${quoteIfNeeded(k)}->${quoteIfNeeded(v)}`)
    .join(', ');
  return `[${formatted}]`;
}
