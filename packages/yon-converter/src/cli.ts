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
 * @younndai/yon-converter CLI
 *
 * Command-line interface for YON conversion.
 * Deterministic. Code-only. No AI.
 *
 * Usage:
 *   npx yon-convert input.json --to yon
 *   npx yon-convert input.yaml --to yon --profile exec --domain yai.health
 *   npx yon-convert input.yon --to json
 *   npx yon-convert input.yon --to yon   # passthrough: parse → format
 *   cat input.json | npx yon-convert --to yon
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import { detectFormat } from './detect-format.js';
import { jsonToYon } from './json/index.js';
import { yamlToYon } from './yaml/index.js';
import { tomlToYon } from './toml/index.js';
import { iniToYon } from './ini/index.js';
import { csvToYon } from './csv/index.js';
import { xmlToYon } from './xml/index.js';
import { reverseConvert } from './reverse.js';
import type { ReverseConvertOptions } from './reverse.js';
import type { JsonToYonOptions, YonProfile } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CliArgs {
  input?: string;
  output?: string;
  to: 'yon' | 'json' | 'yaml' | 'toml' | 'csv' | 'xml' | 'ini';
  profile?: YonProfile;
  format?: 'canon' | 'min' | 'ultra';
  domain?: string;
  mode?: string;
  scenario?: string;
  id?: string;
  title?: string;
  help?: boolean;
  version?: boolean;
  quiet?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Help
// ─────────────────────────────────────────────────────────────────────────────

const HELP = `
yon-convert - YON Format Converter

USAGE:
  yon-convert <input> --to <format> [options]
  cat file | yon-convert --to <format> [options]

ARGUMENTS:
  <input>        Input file path (or use stdin)

OPTIONS:
  --to           Target format: yon, json, yaml, toml, csv, xml, ini (required)
  --output, -o   Output file path (default: stdout)
  --profile      YON profile: core, decl, exec, audit, cognitive, agent, full (default: exec)
  --format       YON format: canon, min, ultra (default: canon)
  --domain       YON domain (e.g., yai.health, yai.devops)
  --mode         Processing mode (struct, chat, text, hybrid)
  --scenario     Scenario preset
  --id           Document ID (default: derived from filename)
  --title        Document title (default: derived from filename)
  --quiet, -q    Suppress status messages
  --help, -h     Show this help
  --version      Show version

EXAMPLES:
  yon-convert config.json --to yon
  yon-convert rules.yaml --to yon --profile exec --domain yai.devops
  yon-convert document.yon --to json -o output.json
  yon-convert input.yon --to yon          # passthrough: parse → format
  cat data.toml | yon-convert --to yon
`;

// ─────────────────────────────────────────────────────────────────────────────
// Argument Parser
// ─────────────────────────────────────────────────────────────────────────────

const VALID_TARGETS = ['yon', 'json', 'yaml', 'toml', 'csv', 'xml', 'ini'] as const;
const VALID_PROFILES = ['core', 'decl', 'exec', 'audit', 'cognitive', 'agent', 'full'] as const;
const VALID_FORMATS = ['canon', 'min', 'ultra'] as const;

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = { to: 'yon' };
  let toWasSet = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];
    
    switch (arg) {
      case '--to':
        if (next && (VALID_TARGETS as readonly string[]).includes(next)) {
          result.to = next as CliArgs['to'];
          toWasSet = true;
          i++;
        } else {
          throw new Error(`--to requires one of: ${VALID_TARGETS.join(', ')}`);
        }
        break;
        
      case '--output':
      case '-o':
        if (!next || next.startsWith('-')) throw new Error('--output requires a file path');
        result.output = next;
        i++;
        break;
        
      case '--profile':
        if (next && (VALID_PROFILES as readonly string[]).includes(next)) {
          result.profile = next as CliArgs['profile'];
          i++;
        } else {
          throw new Error(`--profile requires one of: ${VALID_PROFILES.join(', ')}`);
        }
        break;
        
      case '--format':
        if (next && (VALID_FORMATS as readonly string[]).includes(next)) {
          result.format = next as CliArgs['format'];
          i++;
        } else {
          throw new Error(`--format requires one of: ${VALID_FORMATS.join(', ')}`);
        }
        break;

      case '--domain':
        if (!next || next.startsWith('-')) throw new Error('--domain requires a value');
        result.domain = next;
        i++;
        break;

      case '--mode':
        if (!next || next.startsWith('-')) throw new Error('--mode requires a value');
        result.mode = next;
        i++;
        break;

      case '--scenario':
        if (!next || next.startsWith('-')) throw new Error('--scenario requires a value');
        result.scenario = next;
        i++;
        break;

      case '--id':
        if (!next || next.startsWith('-')) throw new Error('--id requires a value');
        result.id = next;
        i++;
        break;

      case '--title':
        if (!next || next.startsWith('-')) throw new Error('--title requires a value');
        result.title = next;
        i++;
        break;
        
      case '--quiet':
      case '-q':
        result.quiet = true;
        break;
        
      case '--help':
      case '-h':
        result.help = true;
        break;
        
      case '--version':
        result.version = true;
        break;
        
      default:
        if (!arg.startsWith('-') && !result.input) {
          result.input = arg;
        }
    }
  }
  
  // Validate --to was explicitly provided (unless help/version)
  if (!result.help && !result.version && !toWasSet) {
    throw new Error('--to is required. Use --help for usage.');
  }
  
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// I/O
// ─────────────────────────────────────────────────────────────────────────────

async function readInput(inputPath?: string): Promise<string> {
  if (inputPath) {
    const resolved = resolve(process.cwd(), inputPath);
    if (!existsSync(resolved)) {
      throw new Error(`File not found: ${inputPath}`);
    }
    return readFileSync(resolved, 'utf-8');
  }
  
  // Read from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function writeOutput(content: string, outputPath?: string): void {
  if (outputPath) {
    const resolved = resolve(process.cwd(), outputPath);
    writeFileSync(resolved, content, 'utf-8');
  } else {
    process.stdout.write(content);
    if (!content.endsWith('\n')) {
      process.stdout.write('\n');
    }
  }
}

function log(message: string, quiet?: boolean): void {
  if (!quiet) {
    console.error(message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert input to YON using the appropriate format converter.
 */
export function convertToYon(
  input: string,
  format: string,
  options: JsonToYonOptions
): string {
  switch (format) {
    case 'json':
      return jsonToYon(input, options);
    case 'yaml':
      return yamlToYon(input, options);
    case 'toml':
      return tomlToYon(input, options);
    case 'ini':
      return iniToYon(input, options);
    case 'csv':
      return csvToYon(input, options);
    case 'xml':
      return xmlToYon(input, options);
    case 'yon':
      // YON-to-YON: use reverseConvert passthrough
      return reverseConvert(input, { targetFormat: 'yon' });
    case 'unknown':
      // Wrap unrecognized input in a @NOTE block
      const escaped = input.replace(/"/g, '\\"');
      return `@DOC ver=2.0 | id=${options.id ?? 'raw'} | title="${options.title ?? 'Raw Input'}" | kind=note\n@NOTE text="${escaped}"`;
    default:
      throw new Error(`Unsupported source format: ${format}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }
  
  if (args.version) {
    // Read version from package.json at runtime
    try {
      const pkgPath = resolve(import.meta.dirname ?? '.', '..', 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      console.log(`yon-convert ${pkg.version}`);
    } catch {
      console.log('yon-convert 0.1.0');
    }
    process.exit(0);
  }
  
  try {
    const input = await readInput(args.input);
    
    if (!input.trim()) {
      throw new Error('Empty input');
    }
    
    let output: string;
    
    if (args.to === 'yon') {
      // Detect input format
      const sourceFormat = detectFormat(input);
      
      // Build converter options with extended header fields
      const converterOptions: JsonToYonOptions = {
        profile: args.profile,
        format: args.format,
        domain: args.domain,
        mode: args.mode,
        scenario: args.scenario,
        id: args.id,
        title: args.title,
      };
      
      // Derive id/title from filename if not explicitly set
      if (args.input && !converterOptions.id) {
        const name = basename(args.input, extname(args.input));
        converterOptions.id = name;
        if (!converterOptions.title) {
          converterOptions.title = name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
      }
      
      log(`Converting ${sourceFormat.toUpperCase()} → YON (profile: ${args.profile ?? 'exec'})...`, args.quiet);
      
      output = convertToYon(input, sourceFormat, converterOptions);
      
      log(`✓ Converted from ${sourceFormat}`, args.quiet);
    } else {
      // YON → target format
      const options: ReverseConvertOptions = {
        targetFormat: args.to,
        indent: 2,
      };
      
      log(`Converting YON → ${args.to.toUpperCase()}...`, args.quiet);
      
      output = reverseConvert(input, options);
      
      log(`✓ Converted to ${args.to}`, args.quiet);
    }
    
    writeOutput(output, args.output);
    
    if (args.output) {
      log(`✓ Written to ${args.output}`, args.quiet);
    }
    
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

// Only run main() when invoked as CLI entry point, not when imported for testing
if (process.argv[1]?.endsWith('cli.js') || process.argv[1]?.endsWith('cli.ts') || process.argv[1]?.endsWith('yon-convert')) {
  main();
}
