#!/usr/bin/env node
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
 * Domain Registry Codegen for @younndai/domains
 *
 * Reads all official yai.* domain JSON schemas from this package
 * and generates src/bundled.generated.ts with typed DomainSchema objects.
 *
 * Run: npm run sync:domains
 * Auto-runs: prebuild hook (npm run build)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOMAINS_DIR = process.env.YAI_DOMAINS_SYNC_SOURCE_DIR
  ? resolve(process.env.YAI_DOMAINS_SYNC_SOURCE_DIR)
  : resolve(__dirname, '../domains/yai');
const OUTPUT_FILE = process.env.YAI_DOMAINS_SYNC_OUTPUT_FILE
  ? resolve(process.env.YAI_DOMAINS_SYNC_OUTPUT_FILE)
  : resolve(__dirname, '../src/bundled.generated.ts');

// ─────────────────────────────────────────────────────────────────────────────
// Discover all domain JSON schemas
// ─────────────────────────────────────────────────────────────────────────────

function discoverSchemas() {
  if (!existsSync(DOMAINS_DIR)) {
    console.error(`❌ domains directory not found: ${DOMAINS_DIR}`);
    console.error('   Package-owned domain schemas are required input for sync:domains.');
    process.exit(1);
  }

  if (!statSync(DOMAINS_DIR).isDirectory()) {
    console.error(`❌ domains path is not a directory: ${DOMAINS_DIR}`);
    process.exit(1);
  }

  const schemas = [];

  for (const entry of readdirSync(DOMAINS_DIR)) {
    const domainDir = resolve(DOMAINS_DIR, entry);
    if (!statSync(domainDir).isDirectory()) continue;

    const schemaPath = resolve(domainDir, '1.0.json');
    if (!existsSync(schemaPath)) continue;

    const json = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    schemas.push(json);
  }

  schemas.sort((a, b) => a.domain.localeCompare(b.domain));

  if (schemas.length === 0) {
    console.error(`❌ no domain schemas found under ${DOMAINS_DIR}`);
    console.error('   Expected package-owned schemas at domains/yai/<domain>/1.0.json.');
    process.exit(1);
  }

  return schemas;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate TypeScript for a single domain
// ─────────────────────────────────────────────────────────────────────────────

function generateDomainConst(schema) {
  const varName = 'DOMAIN_' + schema.domain.replace('yai.', '').toUpperCase();
  const lines = [];

  lines.push(`const ${varName}: DomainSchema = {`);
  lines.push(`  domain: ${JSON.stringify(schema.domain)},`);
  lines.push(`  version: ${JSON.stringify(schema.version)},`);
  lines.push(`  status: ${JSON.stringify(schema.status || 'active')},`);
  lines.push(`  tier: ${JSON.stringify(schema.tier || 'community')},`);
  lines.push(`  verified: ${schema.verified ?? false},`);
  lines.push(`  score: ${schema.score ?? 0},`);
  lines.push(`  notice: ${schema.notice ? JSON.stringify(schema.notice) : 'null'},`);
  lines.push(`  description: ${JSON.stringify(schema.description)},`);

  // Domain defaults
  if (schema.defaultMode) lines.push(`  defaultMode: ${JSON.stringify(schema.defaultMode)},`);
  if (schema.defaultProfile) lines.push(`  defaultProfile: ${JSON.stringify(schema.defaultProfile)},`);
  if (schema.defaultFormat) lines.push(`  defaultFormat: ${JSON.stringify(schema.defaultFormat)},`);
  if (schema.schemaHash) lines.push(`  schemaHash: ${JSON.stringify(schema.schemaHash)},`);

  lines.push('  records: {');

  for (const rec of schema.records) {
    lines.push(`    ${rec.tag}: {`);
    lines.push(`      description: ${JSON.stringify(rec.description)},`);

    if (rec.fields && rec.fields.length > 0) {
      const required = rec.fields.filter(f => f.required).map(f => f.name);
      const optional = rec.fields.filter(f => !f.required).map(f => f.name);
      const typed = rec.fields.filter(f => f.type && f.type !== 'string');

      if (required.length > 0) {
        lines.push(`      requiredFields: [${required.map(f => JSON.stringify(f)).join(', ')}],`);
      }
      if (optional.length > 0) {
        lines.push(`      optionalFields: [${optional.map(f => JSON.stringify(f)).join(', ')}],`);
      }
      if (typed.length > 0) {
        const entries = typed.map(f => `${JSON.stringify(f.name)}: ${JSON.stringify(f.type)}`).join(', ');
        lines.push(`      typedFields: { ${entries} },`);
      }

      // Emit per-field FieldConstraint map for validation
      lines.push(`      fields: {`);
      for (const field of rec.fields) {
        const parts = [`type: ${JSON.stringify(field.type || 'string')}`, `required: ${field.required ?? false}`];
        if (field.range) parts.push(`range: [${field.range[0]}, ${field.range[1]}]`);
        if (field.enum) parts.push(`enum: [${field.enum.map(v => JSON.stringify(v)).join(', ')}]`);
        if (field.pattern) parts.push(`pattern: ${JSON.stringify(field.pattern)}`);
        if (field.description) parts.push(`description: ${JSON.stringify(field.description)}`);
        if (field.unit) parts.push(`unit: ${JSON.stringify(field.unit)}`);
        if (field.example) parts.push(`example: ${JSON.stringify(field.example)}`);
        lines.push(`        ${JSON.stringify(field.name)}: { ${parts.join(', ')} },`);
      }
      lines.push(`      },`);
    }

    lines.push('    },');
  }

  lines.push('  },');
  lines.push('};');

  return { varName, code: lines.join('\n') };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate the full output file
// ─────────────────────────────────────────────────────────────────────────────

function generate(schemas) {
  const header = [
    // Apache header emitted by the generator itself (gate:d4, D-19) — a
    // post-emit codemod can't cover this file: prebuild regenerates it on
    // every build, including prepublishOnly in the public repo.
    '/*',
    ' * Copyright 2026 MARLINK TRADING SRL (YounndAI)',
    ' *',
    ' * Licensed under the Apache License, Version 2.0 (the "License");',
    ' * you may not use this file except in compliance with the License.',
    ' * You may obtain a copy of the License at',
    ' *',
    ' *     http://www.apache.org/licenses/LICENSE-2.0',
    ' *',
    ' * Unless required by applicable law or agreed to in writing, software',
    ' * distributed under the License is distributed on an "AS IS" BASIS,',
    ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
    ' * See the License for the specific language governing permissions and',
    ' * limitations under the License.',
    ' */',
    '',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// AUTO-GENERATED — do not edit manually.',
    `// Source: domains/yai/*/1.0.json (${schemas.length} domains)`,
    '// Run: npm run sync:domains',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    "import type { DomainSchema } from './types.js';",
    '',
  ];

  const domainBlocks = schemas.map(s => generateDomainConst(s));

  const registryExport = [
    '',
    '// ─────────────────────────────────────────────────────────────────────────────',
    '// Aggregated registry — all official yai.* domains',
    '// ─────────────────────────────────────────────────────────────────────────────',
    '',
    'export const BUNDLED_DOMAINS: Record<string, DomainSchema> = {',
    ...domainBlocks.map(d => `  [${d.varName}.domain]: ${d.varName},`),
    '};',
    '',
  ];

  return [
    ...header,
    ...domainBlocks.map(d => d.code + '\n'),
    ...registryExport,
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const schemas = discoverSchemas();
console.log(`📦 Found ${schemas.length} official yai.* domain schemas`);

const output = generate(schemas);
writeFileSync(OUTPUT_FILE, output, 'utf-8');
console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`   Domains: ${schemas.map(s => s.domain).join(', ')}`);
