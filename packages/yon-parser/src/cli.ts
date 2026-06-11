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
 * YON CLI
 * 
 * Command-line interface for YON parser and validator.
 * The CLI is the entry point. Parse, validate, format—all from the terminal.
 * 
 * @example
 * ```bash
 * # Validate a file
 * npx @younndai/yon-parser validate input.yon
 * 
 * # Format a file to CANON
 * npx @younndai/yon-parser format input.yon --mode CANON
 * 
 * # Parse and output AST as JSON
 * npx @younndai/yon-parser parse input.yon --json
 * ```
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse, validate, format, YonParseError, type YonFormat, type YonProfile } from './index.js';

function readPackageVersion(): string {
  try {
    const pkgPath = resolve(import.meta.dirname ?? '.', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

const VERSION = readPackageVersion();

interface CLIOptions {
  command: string;
  file?: string;
  profile?: string;
  mode?: YonFormat;
  strict?: boolean;
  json?: boolean;
  output?: string;
  help?: boolean;
  version?: boolean;
  check?: boolean;  // Prettier-like: check if formatted, exit 1 if not
}

const HELP = `
YON Parser CLI

Usage:
  yon <command> <file> [options]

Commands:
  validate  Validate a YON file against profile constraints
  format    Format a YON file with deterministic ordering
  parse     Parse a YON file and output AST

Options:
  --profile <name>   Profile to validate against (core|decl|exec|audit|cognitive|agent|full)
  --mode <mode>      Format mode (CANON|MIN|ULTRA)
  --strict           Enable strict validation (default: true)
  --lenient          Disable strict validation
  --check            Check if file is formatted (exit 1 if not)
  --json             Output as JSON
  --output <file>    Write output to file instead of stdout
  --help             Show this help message
  --version          Show version

Examples:
  yon validate document.yon --profile cognitive
  yon format document.yon --mode ULTRA --output formatted.yon
  yon format document.yon --check    # Like prettier --check
  yon parse document.yon --json
`;

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    command: '',
    strict: true,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i]!;

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--profile') {
      options.profile = args[++i];
    } else if (arg === '--mode') {
      const mode = args[++i]?.toLowerCase();
      if (mode === 'canon' || mode === 'min' || mode === 'ultra') {
        options.mode = mode as 'canon' | 'min' | 'ultra';
      }
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--lenient') {
      options.strict = false;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--check') {
      options.check = true;
    } else if (!arg.startsWith('-')) {
      if (!options.command) {
        options.command = arg;
      } else if (!options.file) {
        options.file = arg;
      }
    }

    i++;
  }

  return options;
}

/**
 * Format error output with line context
 */
function formatError(error: Error, source?: string): string {
  if (error instanceof YonParseError && source && error.line) {
    const lines = source.split('\n');
    const lineContent = lines[error.line - 1] ?? '';
    const lineNum = String(error.line).padStart(4);
    
    return [
      `Error: ${error.message}`,
      '',
      `  ${lineNum} | ${lineContent}`,
      `       | ${'~'.repeat(lineContent.length)}`,
    ].join('\n');
  }
  
  return `Error: ${error.message}`;
}

/**
 * Handle validate command.
 * Validation is binary. Pass or fail with clear reasons.
 */
function cmdValidate(options: CLIOptions): number {
  if (!options.file) {
    console.error('Error: No input file specified');
    return 1;
  }

  try {
    const source = readFileSync(options.file, 'utf-8');
    const doc = parse(source);
    const result = validate(doc, {
      profile: options.profile as YonProfile | undefined,
      strict: options.strict,
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return result.valid ? 0 : 1;
    }

    if (result.valid) {
      console.log(`✓ ${options.file}: Valid`);
      if (result.warnings.length > 0) {
        console.log(`  ${result.warnings.length} warning(s)`);
        for (const w of result.warnings) {
          console.log(`  ⚠ ${w.message}${w.line ? ` (line ${w.line})` : ''}`);
        }
      }
      return 0;
    } else {
      console.log(`✗ ${options.file}: Invalid`);
      console.log(`  ${result.errors.length} error(s)`);
      for (const e of result.errors) {
        console.log(`  ✗ ${e.message}${e.line ? ` (line ${e.line})` : ''}`);
      }
      return 1;
    }
  } catch (error) {
    const source = readFileSync(options.file, 'utf-8');
    console.error(formatError(error as Error, source));
    return 1;
  }
}

/**
 * Handle format command.
 * Formatting is idempotent. Run twice, get the same result.
 */
function cmdFormat(options: CLIOptions): number {
  if (!options.file) {
    console.error('Error: No input file specified');
    return 1;
  }

  try {
    const source = readFileSync(options.file, 'utf-8');
    const doc = parse(source);
    const mode = options.mode ?? doc.fmt ?? 'min';
    const output = format(doc, { mode });

    // Prettier-like --check mode
    if (options.check) {
      const normalized = source.trim();
      const formatted = output.trim();
      if (normalized !== formatted) {
        console.log(`✗ ${options.file}: Not formatted`);
        return 1;
      }
      console.log(`✓ ${options.file}: Formatted`);
      return 0;
    }

    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`✓ Formatted output written to ${options.output}`);
    } else {
      console.log(output);
    }
    return 0;
  } catch (error) {
    const source = readFileSync(options.file, 'utf-8');
    console.error(formatError(error as Error, source));
    return 1;
  }
}

/**
 * Handle parse command
 */
function cmdParse(options: CLIOptions): number {
  if (!options.file) {
    console.error('Error: No input file specified');
    return 1;
  }

  try {
    const source = readFileSync(options.file, 'utf-8');
    const doc = parse(source);

    if (options.json) {
      // Convert Maps to objects for JSON serialization
      const serializable = {
        ...doc,
        records: doc.records.map((r) => ({
          ...r,
          fields: Object.fromEntries(r.fields),
        })),
        blocks: Object.fromEntries(
          Array.from(doc.blocks.entries()).map(([k, v]) => [k, v])
        ),
      };
      console.log(JSON.stringify(serializable, null, 2));
    } else {
      console.log(`Document: ${doc.title || doc.id}`);
      console.log(`  Version: ${doc.version}`);
      console.log(`  Kind: ${doc.kind}`);
      console.log(`  Profile: ${doc.profile || 'default'}`);
      console.log(`  Records: ${doc.records.length}`);
      console.log(`  Blocks: ${doc.blocks.size}`);
    }
    return 0;
  } catch (error) {
    const source = readFileSync(options.file, 'utf-8');
    console.error(formatError(error as Error, source));
    return 1;
  }
}

/**
 * Main entry point
 */
function main(): number {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.version) {
    console.log(`yon v${VERSION}`);
    return 0;
  }

  if (options.help || !options.command) {
    console.log(HELP);
    return options.help ? 0 : 1;
  }

  switch (options.command) {
    case 'validate':
      return cmdValidate(options);
    case 'format':
      return cmdFormat(options);
    case 'parse':
      return cmdParse(options);
    default:
      console.error(`Unknown command: ${options.command}`);
      console.log(HELP);
      return 1;
  }
}

process.exit(main());
