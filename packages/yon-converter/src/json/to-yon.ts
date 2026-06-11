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
 * JSON → YON Code Converter
 * 
 * Deterministic conversion from JSON to YON without AI.
 * Uses heuristics to map JSON structures to appropriate YON records.
 */

import type { JsonToYonOptions, YonFormat } from '../types.js';
import type { YonProfile } from '@younndai/yon-parser';

/**
 * Mapping rules for JSON to YON conversion.
 */
interface MappingRule {
  /** Key patterns to match (regex) */
  pattern: RegExp;
  /** Target YON tag */
  tag: string;
  /** Field mappings: JSON key → YON field */
  fieldMap?: Record<string, string>;
}

/**
 * Default mapping rules for JSON → YON conversion.
 */
const DEFAULT_RULES: MappingRule[] = [
  // Rules with level/when/then
  {
    pattern: /^rules?$/i,
    tag: 'RULE',
    fieldMap: { level: 'lvl', condition: 'when', action: 'then', reason: 'because' },
  },
  // Steps with operation/n
  {
    pattern: /^steps?$/i,
    tag: 'STEP',
    fieldMap: { step: 'n', operation: 'op', input: 'in', output: 'out' },
  },
  // Config/settings
  {
    pattern: /^(config|settings|cfg)$/i,
    tag: 'CFG',
  },
  // Schema definitions
  {
    pattern: /^(schema|type|definition)$/i,
    tag: 'SCHEMA',
    fieldMap: { options: 'opts', defaultValue: 'default' },
  },
  // Maps/dictionaries
  {
    pattern: /^(map|mapping|dictionary)$/i,
    tag: 'MAP',
  },
];

/**
 * Required fields per tag, per spec §7.1 and §7.4.
 * If data lacks these, the converter falls back to @MAP.
 */
const REQUIRED_FIELDS: Record<string, string[]> = {
  RULE: ['lvl', 'when', 'then'],
  STEP: ['rid', 'n', 'op'],
  SCHEMA: [],
  CFG: [],
  MAP: [],
};

/**
 * Ensure a boundary string meets §6.2: [A-Za-z0-9_-]{8,}
 * Also scans content for collision if provided (§6.2: MUST NOT appear within block content).
 */
function ensureBoundary(raw: string, content?: string): string {
  let clean = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (clean.length < 8) clean = clean.padEnd(8, '_');
  
  // §6.2: Scan content for boundary collision
  if (content) {
    let candidate = clean;
    let counter = 0;
    while (content.includes(candidate)) {
      counter++;
      candidate = `${clean}_${counter}`;
    }
    return candidate;
  }
  
  return clean;
}

/**
 * Rename keys using a field map (e.g. level → lvl, condition → when).
 */
function applyFieldMap(
  obj: Record<string, unknown>,
  fieldMap?: Record<string, string>
): Record<string, unknown> {
  if (!fieldMap) return { ...obj };
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    mapped[fieldMap[key] ?? key] = value;
  }
  return mapped;
}

/**
 * Convert JSON input to YON format.
 * 
 * @param input - JSON string or object
 * @param options - Conversion options
 * @returns YON string
 * @throws Error if circular reference detected
 */
export function jsonToYon(
  input: string | Record<string, unknown>,
  options: JsonToYonOptions = {}
): string {
  const {
    profile = 'exec',
    format = 'canon',
    kind = 'doc',
    id = 'generated',
    title = 'Generated Document',
    mode,
    scenario,
    domain,
    features,
    with: withFeatures,
    without,
  } = options;

  // Parse JSON if string
  const data = typeof input === 'string' ? JSON.parse(input) as Record<string, unknown> : input;

  // Track seen objects to detect circular references
  const seen = new WeakSet<object>();

  // Track block ids to deduplicate (@BEGIN ids must be unique per §6.1)
  const blockIds = new Map<string, number>();

  const lines: string[] = [];
  
  // Generate @DOC header
  lines.push(formatDocHeader(profile, format, kind, id, title, {
    mode, scenario, domain, features, with: withFeatures, without,
  }));
  
  // Check if the entire input is a simple map (all values are primitives)
  if (isSimpleMap(data)) {
    // Simple map - use @MAP with sentinel prefix for ambiguous strings
    const pairs = Object.entries(data)
      .map(([k, v]) => `"${escapeQuotes(k)}"->${formatTypedValue(v)}`)
      .join(',');
    lines.push(`@MAP name="data" | pairs=[${pairs}]`);
  } else {
    // Separate primitives from complex values
    const primitives: [string, unknown][] = [];
    const complex: [string, unknown][] = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) || isPlainObject(value)) {
        complex.push([key, value]);
      } else {
        primitives.push([key, value]);
      }
    }
    
    // Emit all primitives as a single @MAP if any exist
    if (primitives.length > 0) {
      const pairs = primitives
        .map(([k, v]) => `"${escapeQuotes(k)}"->${formatTypedValue(v)}`)
        .join(',');
      lines.push(`@MAP name="data" | pairs=[${pairs}]`);
    }
    
    // Process complex values individually
    for (const [key, value] of complex) {
      const generated = convertValue(key, value, profile, format, seen, blockIds);
      lines.push(...generated);
    }
  }
  
  return lines.join('\n');
}

/**
 * Format the @DOC header line per §16.1.
 */
function formatDocHeader(
  profile: YonProfile,
  format: YonFormat,
  kind: string,
  id: string,
  title: string,
  extra?: {
    mode?: string;
    scenario?: string;
    domain?: string;
    features?: string[];
    with?: string[];
    without?: string[];
  }
): string {
  // Canonical field order per tag-registry §3: ver → id → title → kind → domain → mode → profile → fmt → (rest alphabetically)
  // domain precedes mode/profile/fmt because domain MAY set defaults for those.
  const fields: string[] = [
    'ver=2.0',
    `id=${id}`,
    `title="${escapeQuotes(title)}"`,
  ];
  
  // Append optional fields — only when non-default, in canonical order
  if (kind !== 'doc') {
    fields.push(`kind=${kind}`);
  }
  if (extra?.domain) {
    fields.push(`domain=${extra.domain}`);
  }
  if (extra?.mode) {
    fields.push(`mode=${extra.mode}`);
  }
  if (profile !== 'exec') {
    fields.push(`profile=${profile}`);
  }
  if (format !== 'canon') {
    fields.push(`fmt=${format}`);
  }
  
  // Remaining fields alphabetically
  if (extra?.features && extra.features.length > 0) {
    fields.push(`features=[${extra.features.join(',')}]`);
  }
  if (extra?.scenario) {
    fields.push(`scenario="${escapeQuotes(extra.scenario)}"`);
  }
  if (extra?.with && extra.with.length > 0) {
    fields.push(`with=[${extra.with.join(',')}]`);
  }
  if (extra?.without && extra.without.length > 0) {
    fields.push(`without=[${extra.without.join(',')}]`);
  }
  
  return `@DOC ${fields.join(' | ')}`;
}
/**
 * Convert a JSON value to YON lines.
 */
function convertValue(
  key: string,
  value: unknown,
  profile: YonProfile,
  format: YonFormat,
  seen: WeakSet<object>,
  blockIds: Map<string, number> = new Map()
): string[] {
  const lines: string[] = [];
  
  // Find matching rule
  const rule = DEFAULT_RULES.find(r => r.pattern.test(key));
  
  if (Array.isArray(value)) {
    // Check for circular reference
    if (seen.has(value)) {
      throw new Error(`Circular reference detected at key: ${key}`);
    }
    seen.add(value);
    // Handle arrays
    lines.push(...convertArray(key, value, rule, profile, format, seen, blockIds));
  } else if (isPlainObject(value)) {
    // Check for circular reference
    if (seen.has(value)) {
      throw new Error(`Circular reference detected at key: ${key}`);
    }
    seen.add(value);
    // Handle objects
    lines.push(...convertObject(key, value, rule, profile, format, seen, 0, blockIds));
  } else {
    // Handle primitives - use @MAP with typed pairs for round-trip fidelity
    lines.push(`@MAP name="${escapeQuotes(key)}" | pairs=["${escapeQuotes(key)}"->${formatTypedValue(value)}]`);
  }
  
  return lines;
}

/**
 * Format a value for @MAP pairs.
 * 
 * All values must be quoted for parser compatibility.
 * 
 * For ambiguous strings (that look like booleans/numbers/null),
 * we add a __str__ sentinel prefix so coerceValue preserves the string type.
 * 
 * Example: string "true" → "__str__true" → coerceValue → "true"
 */
function formatTypedValue(value: unknown): string {
  // Handle null explicitly
  if (value === null) {
    return '"null"';
  }
  
  // For strings, check if they could be confused with other types
  if (typeof value === 'string') {
    // Boolean-like strings
    if (value === 'true' || value === 'false') {
      return `"__str__${escapeQuotes(value)}"`;
    }
    
    // Null-like string
    if (value === 'null') {
      return `"__str__${escapeQuotes(value)}"`;
    }
    
    // Numeric strings (but not empty)
    if (value.trim() !== '' && !isNaN(Number(value))) {
      return `"__str__${escapeQuotes(value)}"`;
    }
  }
  
  // All other values are quoted directly
  return `"${escapeQuotes(String(value))}"`;
}

/**
 * Deduplicate a block id. If the id has been seen before, suffix with _N.
 * Mutates the blockIds map.
 */
function uniqueBlockId(id: string, blockIds: Map<string, number>): string {
  const count = blockIds.get(id) ?? 0;
  blockIds.set(id, count + 1);
  return count === 0 ? id : `${id}_${count}`;
}

/**
 * Convert an array to YON lines.
 */
function convertArray(
  key: string,
  arr: unknown[],
  _rule: MappingRule | undefined,
  _profile: YonProfile,
  _format: YonFormat,
  seen: WeakSet<object>,
  blockIds: Map<string, number> = new Map()
): string[] {
  const lines: string[] = [];
  
  if (arr.length === 0) {
    // Empty array - use @BEGIN JSON block
    const content = '[]';
    const uid = uniqueBlockId(key, blockIds);
    const boundary = ensureBoundary(`bnd_${uid.replace(/[^a-zA-Z0-9]/g, '_')}_empty`, content);
    lines.push(`@BEGIN JSON | id="${escapeQuotes(uid)}" | mime=application/json | boundary=${boundary}`);
    lines.push(content);
    lines.push(`@END JSON | boundary=${boundary}`);
    return lines;
  }
  
  // Check if all items are primitives
  const allPrimitives = arr.every(item => 
    typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null
  );
  
  if (allPrimitives) {
    // Use @BEGIN JSON block for primitive arrays to preserve data
    const content = JSON.stringify(arr);
    const uid = uniqueBlockId(key, blockIds);
    const boundary = ensureBoundary(`bnd_${uid.replace(/[^a-zA-Z0-9]/g, '_')}_arr`, content);
    lines.push(`@BEGIN JSON | id="${escapeQuotes(uid)}" | mime=application/json | boundary=${boundary}`);
    lines.push(content);
    lines.push(`@END JSON | boundary=${boundary}`);
  } else {
    // Check if all objects are simple maps (for @MAP conversion)
    const allSimpleMaps = arr.every(item => isPlainObject(item) && isSimpleMap(item as Record<string, unknown>));
    
    if (allSimpleMaps && arr.length > 0) {
      // Add section header for array of maps
      lines.push(`@SEC name="${escapeQuotes(key)}"`);
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i] as Record<string, unknown>;
        if (seen.has(item)) {
          throw new Error(`Circular reference detected in array at index ${i}`);
        }
        seen.add(item);
        const pairs = Object.entries(item)
          .map(([k, v]) => `"${escapeQuotes(k)}"->${formatTypedValue(v)}`)
          .join(',');
        lines.push(`@MAP name="${key}_${i}" | pairs=[${pairs}]`);
      }
    } else {
      // Complex nested data - use @BEGIN JSON block to preserve structure
      const content = JSON.stringify(arr, null, 2);
      const uid = uniqueBlockId(key, blockIds);
      const boundary = ensureBoundary(`bnd_${uid.replace(/[^a-zA-Z0-9]/g, '_')}_data`, content);
      lines.push(`@BEGIN JSON | id="${escapeQuotes(uid)}" | mime=application/json | boundary=${boundary}`);
      lines.push(content);
      lines.push(`@END JSON | boundary=${boundary}`);
    }
  }
  
  return lines;
}


/**
 * Convert an object to YON lines.
 */
function convertObject(
  key: string,
  obj: Record<string, unknown>,
  rule: MappingRule | undefined,
  profile: YonProfile,
  format: YonFormat,
  seen: WeakSet<object>,
  depth: number = 0,
  blockIds: Map<string, number> = new Map()
): string[] {
  const lines: string[] = [];
  
  // For deeply nested objects (depth > 1), use @BEGIN JSON to preserve structure
  if (depth > 1) {
    const content = JSON.stringify(obj, null, 2);
    const uid = uniqueBlockId(key, blockIds);
    const boundary = ensureBoundary(`bnd_${uid.replace(/[^a-zA-Z0-9]/g, '_')}_obj`, content);
    lines.push(`@BEGIN JSON | id="${escapeQuotes(uid)}" | mime=application/json | boundary=${boundary}`);
    lines.push(JSON.stringify(obj, null, 2));
    lines.push(`@END JSON | boundary=${boundary}`);
    return lines;
  }
  
  // Check if this is a simple map (all values are primitives)
  if (isSimpleMap(obj)) {
    const pairs = Object.entries(obj)
      .map(([k, v]) => `"${escapeQuotes(k)}"->${formatTypedValue(v)}`)
      .join(',');
    lines.push(`@MAP name="${escapeQuotes(key)}" | pairs=[${pairs}]`);
  } else if (rule) {
    // Use matched rule — but only if data has required fields (§7.1, §7.4)
    const mapped = applyFieldMap(obj, rule.fieldMap);
    const required = REQUIRED_FIELDS[rule.tag] ?? [];
    const hasAll = required.every(f => f in mapped);
    if (hasAll) {
      lines.push(formatRecord(rule.tag, mapped, undefined, format));
    } else {
      // Fall back to @MAP — data doesn't match required shape
      const pairs = Object.entries(obj)
        .map(([k, v]) => `"${escapeQuotes(k)}"->${formatTypedValue(v)}`)
        .join(',');
      lines.push(`@MAP name="${escapeQuotes(key)}" | pairs=[${pairs}]`);
    }
  } else {
    // Default: create a section with nested records
    lines.push(`@SEC name="${escapeQuotes(key)}"`);
    for (const [subKey, subValue] of Object.entries(obj)) {
      lines.push(...convertValueWithDepth(subKey, subValue, profile, format, seen, depth + 1, blockIds));
    }
  }
  
  return lines;
}

/**
 * Convert value with depth tracking for proper nesting.
 */
function convertValueWithDepth(
  key: string,
  value: unknown,
  profile: YonProfile,
  format: YonFormat,
  seen: WeakSet<object>,
  depth: number,
  blockIds: Map<string, number> = new Map()
): string[] {
  const lines: string[] = [];
  
  // Find matching rule
  const rule = DEFAULT_RULES.find(r => r.pattern.test(key));
  
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new Error(`Circular reference detected at key: ${key}`);
    }
    seen.add(value);
    // For arrays in nested context, use JSON block
    if (depth > 1) {
      const content = JSON.stringify(value, null, 2);
      const uid = uniqueBlockId(key, blockIds);
      const boundary = ensureBoundary(`bnd_${uid.replace(/[^a-zA-Z0-9]/g, '_')}_nested`, content);
      lines.push(`@BEGIN JSON | id="${escapeQuotes(uid)}" | mime=application/json | boundary=${boundary}`);
      lines.push(content);
      lines.push(`@END JSON | boundary=${boundary}`);
    } else {
      lines.push(...convertArray(key, value, rule, profile, format, seen, blockIds));
    }
  } else if (isPlainObject(value)) {
    if (seen.has(value)) {
      throw new Error(`Circular reference detected at key: ${key}`);
    }
    seen.add(value);
    lines.push(...convertObject(key, value, rule, profile, format, seen, depth, blockIds));
  } else {
    // Handle primitives - use @MAP with pairs per YON v2.0 standard
    lines.push(`@MAP name="${escapeQuotes(key)}" | pairs=["${escapeQuotes(key)}"->${formatTypedValue(value)}]`);
  }
  
  return lines;
}

/**
 * Format a record line.
 */
function formatRecord(
  tag: string,
  data: Record<string, unknown>,
  fieldMap?: Record<string, string>,
  _format?: YonFormat
): string {
  // Special handling for @CFG per YON v2.0 spec: @CFG id=X | set=[k=v,k2=v2]
  if (tag === 'CFG') {
    const entries = Object.entries(data);
    const setItems = entries.map(([key, value]) => {
      const yonKey = fieldMap?.[key] ?? key;
      if (typeof value === 'boolean') {
        return `${yonKey}:bool=${value}`;
      } else if (typeof value === 'number') {
        return Number.isInteger(value) ? `${yonKey}:int=${value}` : `${yonKey}:float=${value}`;
      } else if (Array.isArray(value)) {
        // Nested array in config - use bare items
        const arrItems = value.map(v => String(v)).join(',');
        return `${yonKey}=[${arrItems}]`;
      } else if (isPlainObject(value)) {
        // Nested object - flatten to JSON string
        return `${yonKey}:json="${escapeQuotes(JSON.stringify(value))}"`;
      } else {
        return `${yonKey}="${escapeQuotes(String(value))}"`;
      }
    }).join(',');
    
    // Generate stable id from first key or 'config'
    const id = entries[0]?.[0] ?? 'config';
    return `@CFG id=${id} | set=[${setItems}]`;
  }
  
  // Default formatting for other tags
  const fields: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    // Apply field mapping if available
    const yonKey = fieldMap?.[key] ?? key;
    const formattedValue = formatFieldValue(value, _format);
    fields.push(`${yonKey}=${formattedValue}`);
  }
  
  return `@${tag} ${fields.join(' | ')}`;
}


/**
 * Format a field value for YON.
 */
function formatFieldValue(value: unknown, format?: YonFormat): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  if (typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'string') {
    // Use bare value if safe, quoted otherwise
    if (isBareValue(value) && format !== 'canon') {
      return value;
    }
    return `"${escapeQuotes(value)}"`;
  }
  
  if (Array.isArray(value)) {
    // Format as list
    const items = value.map(v => formatFieldValue(v, format)).join(',');
    return `[${items}]`;
  }
  
  if (isPlainObject(value)) {
    // Format as inline set
    const items = Object.entries(value)
      .map(([k, v]) => `${k}=${formatFieldValue(v, format)}`)
      .join(',');
    return `[${items}]`;
  }
  
  return `"${escapeQuotes(String(value))}"`;
}

/**
 * Check if a value can be a bare (unquoted) value.
 */
function isBareValue(str: string): boolean {
  return /^[A-Za-z0-9_./:@+#-]+$/.test(str);
}

/**
 * Escape special characters in a string for YON.
 */
function escapeQuotes(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Check if all values in an object are primitives.
 */
function isSimpleMap(obj: Record<string, unknown>): boolean {
  return Object.values(obj).every(v => 
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null
  );
}

/**
 * Type guard for plain objects.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && 
         value !== null && 
         !Array.isArray(value);
}
