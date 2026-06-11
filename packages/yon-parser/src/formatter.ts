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
 * YON Formatter
 * 
 * Formats YON AST back to text with deterministic ordering per Standard §17.
 * Formatting is normalization. Different inputs, identical outputs when equivalent.
 */

import {
  type YonDocument,
  type YonRecord,
  type YonBlock,
  type YonValue,
  type YonList,
  type YonField,
  type YonMapPair,
  type YonFormat,
  DEFAULT_MIME_TYPES,
} from './types.js';

export interface FormatOptions {
  mode?: YonFormat;
}

/**
 * Normalize format to lowercase for internal use 
 */
function normalizeFormat(fmt: YonFormat | string): 'canon' | 'min' | 'ultra' {
  return fmt.toLowerCase() as 'canon' | 'min' | 'ultra';
}

// Field ordering priorities per Standard §17.1 (canonical order)
const PRIORITY_1 = ['ver', 'id', 'title', 'kind', 'domain', 'mode', 'profile', 'fmt', 'features', 'with', 'without'];
const PRIORITY_2 = ['rid', 'n', 'op', 'in', 'out', 'args', 'rules', 'use'];
const PRIORITY_3 = ['lvl', 'when', 'then', 'because', 'assert', 'fail', 'msg'];
const PRIORITY_4 = ['ts', 'src', 'event', 'target', 'name', 'key', 'type', 'opts', 'default', 'note'];

const ALL_PRIORITIES = [...PRIORITY_1, ...PRIORITY_2, ...PRIORITY_3, ...PRIORITY_4];

/**
 * Get sort priority for a field key
 */
function getFieldPriority(key: string): number {
  const baseKey = key.split(':')[0] ?? key; // Handle typed keys
  const idx = ALL_PRIORITIES.indexOf(baseKey);
  return idx >= 0 ? idx : ALL_PRIORITIES.length + 1;
}

/**
 * Sort fields per Standard §17.1.
 * Field order is deterministic. No surprises in diffs.
 */
export function sortFields(fields: Map<string, YonValue>): [string, YonValue][] {
  return Array.from(fields.entries()).sort((a, b) => {
    const priorityA = getFieldPriority(a[0]);
    const priorityB = getFieldPriority(b[0]);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Alphabetic fallback
    return a[0].localeCompare(b[0]);
  });
}

/**
 * Check if a value needs quoting
 */
function needsQuotes(value: string): boolean {
  if (!value) return true;
  // Per §3.1.3: bare values match [A-Za-z0-9_./:@+#-]+
  return !/^[A-Za-z0-9_./:@+#-]+$/.test(value);
}

/**
 * Escape a string value
 */
function escapeString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

/**
 * Format a single value.
 * Values encode to their simplest form. Quoting is minimal in MIN mode.
 */
function formatValue(value: YonValue, mode: 'canon' | 'min' | 'ultra'): string {
  // F2: All modes use bare values when safe per §3.1.3
  // Spec canon examples (§16.14 E/G) show bare values: ver=2.0, kind=workflow
  if (typeof value === 'string') {
    if (!needsQuotes(value)) {
      return value;
    }
    return `"${escapeString(value)}"`;
  }
  
  if (Array.isArray(value)) {
    // Map pairs array
    const pairs = value as YonMapPair[];
    const formatted = pairs.map(p => `"${escapeString(p.key)}"->"${escapeString(p.value)}"`);
    return `[${formatted.join(',')}]`;
  }
  
  if (typeof value === 'object' && 'kind' in value) {
    // YonList
    const list = value as YonList;
    const items = list.items.map(item => {
      if (typeof item === 'string') {
        if (!needsQuotes(item)) {
          return item;
        }
        return `"${escapeString(item)}"`;
      }
      if ('key' in item && 'value' in item && !('typeHint' in item)) {
        // MapPair
        const pair = item as YonMapPair;
        return `"${escapeString(pair.key)}"->"${escapeString(pair.value)}"`;
      }
      // Field
      const field = item as YonField;
      const key = field.typeHint ? `${field.key}:${field.typeHint}` : field.key;
      return `${key}=${formatValue(field.value, mode)}`;
    });
    return `[${items.join(',')}]`;
  }
  
  return String(value);
}

/**
 * Format a single record.
 * Uses typedFields when available to preserve typeHint on roundtrip (U5).
 */
export function formatRecord(record: YonRecord, mode: 'canon' | 'min' | 'ultra'): string {
  const tag = `@${record.tag}`;
  
  // D2: Ultra mode @DOC field omission per §16.12
  // Omit fields that match their defaults: profile=exec, kind=doc, fmt=ultra
  const isUltraDoc = mode === 'ultra' && record.tag === 'DOC';
  const ultraOmitKeys = new Set(['profile', 'kind', 'fmt']);
  const ultraOmitValues: Record<string, string> = { profile: 'exec', kind: 'doc', fmt: 'ultra' };
  
  // Prefer typedFields for typeHint preservation; fall back to fields
  if (record.typedFields && record.typedFields.size > 0) {
    const sorted = Array.from(record.typedFields.entries()).sort((a, b) => {
      const priorityA = getFieldPriority(a[0]);
      const priorityB = getFieldPriority(b[0]);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a[0].localeCompare(b[0]);
    });
    
    if (sorted.length === 0) return tag;    
    const fieldStrings = sorted
      .filter(([key, field]) => {
        // D2: Ultra mode omits @DOC fields that match defaults (§16.12)
        if (isUltraDoc && ultraOmitKeys.has(key)) {
          const strVal = typeof field.value === 'string' ? field.value : String(field.value);
          if (strVal === ultraOmitValues[key]) return false;
        }
        return true;
      })
      .map(([key, field]) => {
        const formattedKey = field.typeHint ? `${key}:${field.typeHint}` : key;
        return `${formattedKey}=${formatValue(field.value, mode)}`;
      });
    
    if (fieldStrings.length === 0) return tag;
    return `${tag} ${fieldStrings.join(' | ')}`;
  }
  
  // Fallback: use fields Map (typedFields empty)
  const sortedFields = sortFields(record.fields);
  
  if (sortedFields.length === 0) {
    return tag;
  }
  
  const fieldStrings = sortedFields
    .filter(([key, value]) => {
      // D2: Ultra mode omits @DOC fields that match defaults (§16.12)
      if (isUltraDoc && ultraOmitKeys.has(key)) {
        const strVal = typeof value === 'string' ? value : String(value);
        if (strVal === ultraOmitValues[key]) return false;
      }
      return true;
    })
    .map(([key, value]) => {
      return `${key}=${formatValue(value, mode)}`;
    });
  
  if (fieldStrings.length === 0) return tag;
  return `${tag} ${fieldStrings.join(' | ')}`;
}

/**
 * Find TAG for a given MIME type (reverse lookup)
 */
function findTagForMime(mime: string): string | undefined {
  for (const [tag, mimeType] of Object.entries(DEFAULT_MIME_TYPES)) {
    if (mimeType === mime) return tag;
  }
  return undefined;
}

/**
 * Format a block.
 * ULTRA mode uses shorthand. Full syntax is always valid.
 */
export function formatBlock(block: YonBlock, mode: 'canon' | 'min' | 'ultra'): string {
  // ULTRA mode: try shorthand syntax
  if (mode === 'ultra') {
    const tag = findTagForMime(block.mime);
    const canUseShorthand = tag 
      && block.id 
      && !block.bytes 
      && !block.encoding
      && !block.lang;
    
    if (canUseShorthand) {
      return `@BEGIN ${tag}#${block.id}\n${block.content}\n@END ${tag}#${block.id}`;
    }
  }
  
  // Full syntax
  const fields: string[] = [];
  
  fields.push(`id="${block.id}"`);
  fields.push(`mime="${block.mime}"`);
  
  if (block.boundary && mode !== 'ultra') {
    fields.push(`boundary="${block.boundary}"`);
  }
  if (block.bytes !== undefined) {
    fields.push(`bytes:bytes=${block.bytes}`);
  }
  if (block.encoding) {
    fields.push(`encoding="${block.encoding}"`);
  }
  if (block.mode) {
    fields.push(`mode="${block.mode}"`);
  }
  if (block.lang) {
    fields.push(`lang="${block.lang}"`);
  }
  
  // #4: Emit block TAG when present
  const tagPrefix = block.tag ? `${block.tag} | ` : '';
  const beginLine = `@BEGIN ${tagPrefix}${fields.join(' | ')}`;
  const endTag = block.tag ? ` ${block.tag}` : '';
  // F1: @END uses pipe separator per §6.1/§6.2 (spec lines 288, 304, 408, 441)
  const endLine = block.boundary 
    ? `@END${endTag} | boundary="${block.boundary}"` 
    : `@END${endTag}`;
  
  return `${beginLine}\n${block.content}\n${endLine}`;
}

/**
 * Format a YON document back to text.
 * Uses nodes[] for correct document ordering when available (#1).
 */
export function format(doc: YonDocument, options: FormatOptions = {}): string {
  const rawMode = options.mode ?? doc.fmt ?? 'canon';
  const mode = normalizeFormat(rawMode);
  const lines: string[] = [];
  
  // #1: Use nodes[] for document ordering when available
  if (doc.nodes && doc.nodes.length > 0) {
    for (const node of doc.nodes) {
      switch (node.type) {
        case 'record':
          lines.push(formatRecord(node.record, mode));
          break;
        case 'comment':
          lines.push(node.text);
          break;
        case 'block':
          lines.push('');
          lines.push(formatBlock(node.block, mode));
          break;
      }
    }
  } else {
    // Legacy fallback: records then blocks
    for (const record of doc.records) {
      lines.push(formatRecord(record, mode));
    }
    for (const block of doc.blocks.values()) {
      lines.push('');
      lines.push(formatBlock(block, mode));
    }
  }
  
  return lines.join('\n');
}
