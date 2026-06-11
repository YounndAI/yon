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
 * AST Walker - Traverses YonDocument and extracts data as JavaScript objects.
 * Used for reverse conversion (YON → JSON/YAML/TOML).
 * 
 * "Structure becomes data. AST traversal bridges syntax and meaning."
 */

import type { 
  YonDocument, 
  YonRecord, 
  YonBlock, 
  YonValue, 
  YonList, 
  YonMapPair,
  YonField,
} from '@younndai/yon-parser';
import type { WalkOptions } from './types.js';

/** Tags that are considered metadata (skipped when stripMeta is true) */
const META_TAGS = new Set(['DOC', 'META', 'NOTE', 'STAMP', 'REF', 'DEF']);

/** Tags that create sections/groupings */
const SECTION_TAGS = new Set(['SEC']);

// Note: DATA_TAGS reserved for future use

/**
 * Walk a YonDocument and extract its data as a plain JavaScript object.
 * 
 * Extract essence from structure. Recurses through the document tree.
 * 
 * @param document - The YON document to walk
 * @param options - Walk options
 * @returns Extracted data as a JavaScript object
 */
export function walkDocument(
  document: YonDocument,
  options: WalkOptions = {}
): Record<string, unknown> {
  const { includeMeta = false } = options;
  const result: Record<string, unknown> = {};
  
  // Track current section for grouping
  let currentSection: string | null = null;
  let sectionData: Record<string, unknown> = {};
  
  for (const record of document.records) {
    // Skip metadata if not including it
    if (!includeMeta && META_TAGS.has(record.tag)) {
      continue;
    }
    
    // Handle sections
    if (SECTION_TAGS.has(record.tag)) {
      // Save previous section if exists
      if (currentSection && Object.keys(sectionData).length > 0) {
        result[currentSection] = maybeConvertToArray(currentSection, sectionData);
      }
      
      // Start new section
      currentSection = getFieldValue(record, 'name') as string ?? 
                       getFieldValue(record, 'id') as string ?? 
                       `section_${record.line}`;
      sectionData = {};
      continue;
    }
    
    // Handle data structures
    const extracted = walkRecord(record, options);
    if (extracted !== undefined) {
      const key = getRecordKey(record);
      if (currentSection) {
        sectionData[key] = extracted;
      } else {
        result[key] = extracted;
      }
    }
  }
  
  // Save final section
  if (currentSection && Object.keys(sectionData).length > 0) {
    result[currentSection] = maybeConvertToArray(currentSection, sectionData);
  }
  
  // Walk blocks
  for (const [id, block] of document.blocks) {
    const extracted = walkBlock(block, options);
    if (extracted !== undefined) {
      result[id] = extracted;
    }
  }
  
  return result;
}

/**
 * Detect indexed key pattern (e.g., users_0, users_1) and convert to array.
 * If keys follow sectionName_N pattern, return array of values ordered by index.
 * 
 * Pattern recognition. Indexed keys imply order.
 */
function maybeConvertToArray(sectionName: string, data: Record<string, unknown>): unknown {
  const keys = Object.keys(data);
  if (keys.length === 0) return data;
  
  // Check if all keys match pattern: sectionName_N
  const pattern = new RegExp(`^${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_\\d+$`);
  const allMatch = keys.every(k => pattern.test(k));
  
  if (!allMatch) return data;
  
  // Extract indices and sort
  const indexed = keys.map(k => {
    const match = k.match(/_(\d+)$/);
    return { index: match?.[1] ? parseInt(match[1], 10) : 0, value: data[k] };
  }).sort((a, b) => a.index - b.index);
  
  return indexed.map(i => i.value);
}

/**
 * Walk a single record and extract its data.
 * 
 * @param record - The record to walk
 * @param options - Walk options
 * @returns Extracted value, or undefined if the record should be skipped
 */
export function walkRecord(
  record: YonRecord,
  options: WalkOptions = {}
): unknown {
  const { includeMeta = false } = options;
  
  // Skip metadata records
  if (!includeMeta && META_TAGS.has(record.tag)) {
    return undefined;
  }
  
  // Handle specific record types
  switch (record.tag) {
    case 'MAP':
      return walkMapRecord(record);
    
    case 'CFG':
      return walkCfgRecord(record);
    
    case 'SCHEMA':
      return walkSchemaRecord(record);
    
    case 'RULE':
      return walkRuleRecord(record);
    
    case 'STEP':
      return walkStepRecord(record);
   
    case 'CHECK':
      return walkCheckRecord(record);
    
    case 'CATCH':
      return walkCatchRecord(record);
    
    case 'RETRY':
      return walkRetryRecord(record);
    
    case 'ERROR':
      return walkErrorRecord(record);
    
    case 'INTENT':
    case 'SCOPE':
      return getFieldValue(record, 'text') ?? 
             getFieldValue(record, 'goal') ?? 
             fieldsToObject(record);
    
    // v2.0 Workflow tags (§9.4–9.6)
    case 'INPUT':
      return walkInputRecord(record);
    
    case 'OUTPUT':
      return walkOutputRecord(record);
    
    case 'YIELD':
      return walkYieldRecord(record);
    
    // v2.0 Session tags (§9.7–9.8)
    case 'CHECKPOINT':
      return walkCheckpointRecord(record);
    
    case 'RECOVER':
      return walkRecoverRecord(record);
    
    // v2.0 Dialogue tags (§19.1–19.3)
    case 'TURN':
    case 'ACK':
    case 'SESSION':
      return fieldsToObject(record, ['rid'], includeMeta);
    
    default:
      // Generic: convert all fields to object, preserving tag name (G7)
      return fieldsToObject(record, ['rid'], includeMeta);
  }
}

/**
 * Walk a block and extract its content.
 * 
 * @param block - The block to walk
 * @param options - Walk options
 * @returns Extracted content (parsed if JSON, otherwise string)
 */
export function walkBlock(
  block: YonBlock,
  _options: WalkOptions = {}
): unknown {
  // Try to parse JSON blocks
  if (block.mime === 'application/json' || block.mime.includes('json')) {
    try {
      return JSON.parse(block.content);
    } catch {
      // Fall through to return raw content
    }
  }
  
  // Return raw content for other types
  return block.content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Record Type Handlers
// ─────────────────────────────────────────────────────────────────────────────

function walkMapRecord(record: YonRecord): Record<string, unknown> {
  const pairs = record.fields.get('pairs');
  
   // Helper to coerce typed values from parsed pair values
  // Coercion validates intent. 'true' is boolean, not string.
  const coerceValue = (val: unknown): unknown => {
    if (typeof val !== 'string') return val;
    
    // Handle __str__ sentinel prefix (explicit string, don't coerce)
    // This is used for ambiguous strings like "true", "123" that should remain strings
    if (val.startsWith('__str__')) {
      return val.slice(7); // Remove prefix, keep value as string
    }
    
    // Handle null keyword
    if (val === 'null') return null;
    
    // Try to parse as boolean
    if (val === 'true') return true;
    if (val === 'false') return false;
    
    // Try to parse as number
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '') return num;
    
    return val;
  };
  
  // Handle direct map pair array (legacy)
  if (isMapPairArray(pairs)) {
    return Object.fromEntries(pairs.map(p => [p.key, coerceValue(p.value)]));
  }
  
  // Handle parsed structure with kind: 'map-pairs' and items
  if (isYonList(pairs) && pairs.kind === 'map-pairs') {
    const mapPairs = pairs.items as YonMapPair[];
    return Object.fromEntries(mapPairs.map(p => [p.key, coerceValue(p.value)]));
  }
  
  return {};
}

function walkCfgRecord(record: YonRecord): Record<string, unknown> {
  const set = record.fields.get('set');
  if (isYonList(set) && set.kind === 'field-items') {
    return fieldItemsToObject(set.items as YonField[]);
  }
  return fieldsToObject(record, ['rid', 'id', 'set']);
}

function walkSchemaRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const key = getFieldValue(record, 'key');
  if (key) result.key = key;
  
  const opts = record.fields.get('opts');
  if (isYonList(opts)) {
    result.options = opts.items.filter((i): i is string => typeof i === 'string');
  }
  
  const defaultVal = getFieldValue(record, 'default');
  if (defaultVal !== undefined) result.default = defaultVal;
  
  return result;
}

function walkRuleRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {
    level: getFieldValue(record, 'lvl'),
    when: getFieldValue(record, 'when'),
    then: getFieldValue(record, 'then'),
  };
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  const because = getFieldValue(record, 'because');
  if (because) result.because = because;
  
  return result;
}

function walkStepRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {
    n: getFieldValue(record, 'n'),
    op: getFieldValue(record, 'op'),
  };
  
  // Extract list fields
  const inRefs = record.fields.get('in');
  if (isYonList(inRefs)) {
    result.in = inRefs.items.filter((i): i is string => typeof i === 'string');
  }
  
  const outRefs = record.fields.get('out');
  if (isYonList(outRefs)) {
    result.out = outRefs.items.filter((i): i is string => typeof i === 'string');
  }
  
  const args = record.fields.get('args');
  if (isYonList(args) && args.kind === 'field-items') {
    result.args = fieldItemsToObject(args.items as YonField[]);
  }
  
  const rules = record.fields.get('rules');
  if (isYonList(rules)) {
    result.rules = rules.items.filter((i): i is string => typeof i === 'string');
  }
  
  const use = record.fields.get('use');
  if (isYonList(use)) {
    result.use = use.items.filter((i): i is string => typeof i === 'string');
  }
  
  const note = getFieldValue(record, 'note');
  if (note) result.note = note;
  
  const timeoutMs = getFieldValue(record, 'timeout_ms');
  if (timeoutMs !== undefined) result.timeout_ms = timeoutMs;
  
  return result;
}

/**
 * Walk a @CHECK record (§7.5).
 */
function walkCheckRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const assert = getFieldValue(record, 'assert');
  if (assert) result.assert = assert;
  
  const fail = getFieldValue(record, 'fail');
  if (fail) result.fail = fail;
  
  const msg = getFieldValue(record, 'msg');
  if (msg) result.msg = msg;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk a @CATCH record (§9.3).
 */
function walkCatchRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const target = getFieldValue(record, 'target');
  if (target) result.target = target;
  
  const on = getFieldValue(record, 'on');
  if (on) result.on = on;
  
  const doAction = getFieldValue(record, 'do');
  if (doAction) result.do = doAction;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk a @RETRY record (§9.3).
 */
function walkRetryRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const max = getFieldValue(record, 'max');
  if (max !== undefined) result.max = max;
  
  const delayMs = getFieldValue(record, 'delay_ms');
  if (delayMs !== undefined) result.delay_ms = delayMs;
  
  const backoff = getFieldValue(record, 'backoff');
  if (backoff) result.backoff = backoff;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk an @ERROR record (§9.3).
 */
function walkErrorRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const code = getFieldValue(record, 'code');
  if (code) result.code = code;
  
  const msg = getFieldValue(record, 'msg');
  if (msg) result.msg = msg;
  
  const severity = getFieldValue(record, 'severity');
  if (severity) result.severity = severity;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk an @INPUT record (§9.4).
 */
function walkInputRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const name = getFieldValue(record, 'name');
  if (name) result.name = name;
  
  const type = getFieldValue(record, 'type');
  if (type) result.type = type;
  
  const required = getFieldValue(record, 'required');
  if (required !== undefined) result.required = required;
  
  const schema = getFieldValue(record, 'schema');
  if (schema) result.schema = schema;
  
  const defaultVal = getFieldValue(record, 'default');
  if (defaultVal !== undefined) result.default = defaultVal;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk an @OUTPUT record (§9.5).
 */
function walkOutputRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const name = getFieldValue(record, 'name');
  if (name) result.name = name;
  
  const type = getFieldValue(record, 'type');
  if (type) result.type = type;
  
  const schema = getFieldValue(record, 'schema');
  if (schema) result.schema = schema;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk a @YIELD record (§9.6).
 */
function walkYieldRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const step = getFieldValue(record, 'step');
  if (step) result.step = step;
  
  const value = getFieldValue(record, 'value');
  if (value !== undefined) result.value = value;
  
  const progress = getFieldValue(record, 'progress');
  if (progress !== undefined) result.progress = progress;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk a @CHECKPOINT record (§9.7).
 */
function walkCheckpointRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const session = getFieldValue(record, 'session');
  if (session) result.session = session;
  
  const label = getFieldValue(record, 'label');
  if (label) result.label = label;
  
  const includes = record.fields.get('includes');
  if (isYonList(includes)) {
    result.includes = includes.items.filter((i): i is string => typeof i === 'string');
  }
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

/**
 * Walk a @RECOVER record (§9.8).
 */
function walkRecoverRecord(record: YonRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  const from = getFieldValue(record, 'from');
  if (from) result.from = from;
  
  const reason = getFieldValue(record, 'reason');
  if (reason) result.reason = reason;
  
  const rid = getFieldValue(record, 'rid');
  if (rid) result.rid = rid;
  
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the key to use for a record in the output object.
 */
function getRecordKey(record: YonRecord): string {
  // Prefer rid, then id, then name, then tag_line
  const rid = getFieldValue(record, 'rid') as string | undefined;
  if (rid) return rid;
  
  const id = getFieldValue(record, 'id') as string | undefined;
  if (id) return id;
  
  const name = getFieldValue(record, 'name') as string | undefined;
  if (name) return name;
  
  return `${record.tag.toLowerCase()}_${record.line}`;
}

/**
 * Get a field value from a record.
 */
function getFieldValue(record: YonRecord, key: string): YonValue | undefined {
  return record.fields.get(key);
}

/**
 * Coerce a string value based on parser-provided typeHint.
 * Uses the parser's type system (§3.1.2) instead of blind inference.
 * Only coerces when an explicit typeHint exists; bare values stay as strings.
 */
function coerceByTypeHint(value: YonValue, typeHint?: string): unknown {
  if (typeof value !== 'string' || !typeHint) return valueToJs(value);
  
  switch (typeHint) {
    case 'int':    return parseInt(value, 10);
    case 'float':  return parseFloat(value);
    case 'bool':   return value === 'true';
    case 'null':   return null;
    default:       return value;
  }
}

/**
 * Convert record fields to a plain object.
 * Uses typedFields (parser v2.0+) when available for spec-compliant type coercion.
 * Falls back to record.fields when typedFields is not present.
 * When includeTag is true, adds _tag for tag identity preservation (G7).
 */
function fieldsToObject(
  record: YonRecord, 
  exclude: string[] = ['rid'],
  includeTag: boolean = false
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (includeTag) {
    result._tag = record.tag;
  }
  
  // Progressive enhancement: use typedFields when available (parser v2.0+)
  const typed = (record as unknown as Record<string, unknown>).typedFields as Map<string, YonField> | undefined;
  if (typed && typed instanceof Map) {
    for (const [key, field] of typed) {
      if (!exclude.includes(key)) {
        result[key] = coerceByTypeHint(field.value, field.typeHint);
      }
    }
  } else {
    // Fallback to simple fields access (no type hint coercion)
    for (const [key, value] of record.fields) {
      if (!exclude.includes(key)) {
        result[key] = valueToJs(value);
      }
    }
  }
  return result;
}

/**
 * Convert field items (from set=[] or args=[]) to object.
 */
function fieldItemsToObject(items: YonField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const item of items) {
    result[item.key] = valueToJs(item.value);
  }
  return result;
}

/**
 * Convert a YonValue to a JavaScript value.
 */
function valueToJs(value: YonValue): unknown {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  if (isMapPairArray(value)) {
    return Object.fromEntries(value.map(p => [p.key, p.value]));
  }
  
  if (isYonList(value)) {
    if (value.kind === 'field-items') {
      return fieldItemsToObject(value.items as YonField[]);
    }
    return value.items.filter((i): i is string => typeof i === 'string');
  }
  
  return value;
}

/**
 * Type guard for YonList.
 */
function isYonList(value: unknown): value is YonList {
  return typeof value === 'object' && 
         value !== null && 
         'kind' in value && 
         'items' in value;
}

/**
 * Type guard for YonMapPair[].
 */
function isMapPairArray(value: unknown): value is YonMapPair[] {
  return Array.isArray(value) && 
         value.length > 0 && 
         typeof value[0] === 'object' && 
         value[0] !== null &&
         'key' in value[0] && 
         'value' in value[0] &&
         !('kind' in value[0]);
}
