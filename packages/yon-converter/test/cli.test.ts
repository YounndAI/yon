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
 * CLI Tests — @younndai/yon-converter
 *
 * Tests for the command-line interface: argument parsing, conversion dispatch,
 * and error handling. The CLI is the public entry point — it must be reliable.
 */

import { describe, it, expect } from 'vitest';
import { parseArgs, convertToYon } from '../src/cli.js';
import type { CliArgs } from '../src/cli.js';

// ═══════════════════════════════════════════════════════════════════════════
// parseArgs
// ═══════════════════════════════════════════════════════════════════════════

describe('parseArgs', () => {
  it('parses --to flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon']);
    expect(args.to).toBe('yon');
    expect(args.input).toBe('input.json');
  });

  it('parses --to json', () => {
    const args = parseArgs(['input.yon', '--to', 'json']);
    expect(args.to).toBe('json');
  });

  it('parses all target formats', () => {
    for (const fmt of ['yon', 'json', 'yaml', 'toml', 'csv', 'xml', 'ini']) {
      const args = parseArgs(['input.txt', '--to', fmt]);
      expect(args.to).toBe(fmt);
    }
  });

  it('parses --output / -o flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--output', 'out.yon']);
    expect(args.output).toBe('out.yon');

    const args2 = parseArgs(['input.json', '--to', 'yon', '-o', 'out.yon']);
    expect(args2.output).toBe('out.yon');
  });

  it('parses --profile flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--profile', 'core']);
    expect(args.profile).toBe('core');
  });

  it('parses v2.0 profiles (cognitive, agent, full)', () => {
    for (const profile of ['cognitive', 'agent', 'full']) {
      const args = parseArgs(['input.json', '--to', 'yon', '--profile', profile]);
      expect(args.profile).toBe(profile);
    }
  });

  it('parses --format flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--format', 'min']);
    expect(args.format).toBe('min');
  });

  it('parses --domain flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--domain', 'yai.health']);
    expect(args.domain).toBe('yai.health');
  });

  it('parses --mode flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--mode', 'struct']);
    expect(args.mode).toBe('struct');
  });

  it('parses --scenario flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--scenario', 'config']);
    expect(args.scenario).toBe('config');
  });

  it('parses --id and --title flags', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '--id', 'my-doc', '--title', 'My Doc']);
    expect(args.id).toBe('my-doc');
    expect(args.title).toBe('My Doc');
  });

  it('parses --quiet / -q flag', () => {
    const args = parseArgs(['input.json', '--to', 'yon', '-q']);
    expect(args.quiet).toBe(true);
  });

  it('parses --help / -h flag', () => {
    const args = parseArgs(['--help']);
    expect(args.help).toBe(true);

    const args2 = parseArgs(['-h']);
    expect(args2.help).toBe(true);
  });

  it('parses --version flag', () => {
    const args = parseArgs(['--version']);
    expect(args.version).toBe(true);
  });

  it('parses all flags together', () => {
    const args = parseArgs([
      'input.json', '--to', 'yon',
      '--profile', 'decl', '--format', 'min',
      '--domain', 'yai.legal', '--mode', 'struct',
      '--scenario', 'contract', '--id', 'doc-1', '--title', 'Contract',
      '-o', 'output.yon', '-q',
    ]);
    expect(args.input).toBe('input.json');
    expect(args.to).toBe('yon');
    expect(args.profile).toBe('decl');
    expect(args.format).toBe('min');
    expect(args.domain).toBe('yai.legal');
    expect(args.mode).toBe('struct');
    expect(args.scenario).toBe('contract');
    expect(args.id).toBe('doc-1');
    expect(args.title).toBe('Contract');
    expect(args.output).toBe('output.yon');
    expect(args.quiet).toBe(true);
  });

  // Error cases
  it('throws on invalid --to value', () => {
    expect(() => parseArgs(['input.json', '--to', 'pdf'])).toThrow('--to requires');
  });

  it('throws on invalid --profile value', () => {
    expect(() => parseArgs(['input.json', '--to', 'yon', '--profile', 'invalid'])).toThrow('--profile requires');
  });

  it('throws on invalid --format value', () => {
    expect(() => parseArgs(['input.json', '--to', 'yon', '--format', 'invalid'])).toThrow('--format requires');
  });

  it('throws when --to is missing (non-help/version)', () => {
    expect(() => parseArgs(['input.json'])).toThrow('--to is required');
  });

  it('does not throw when --to is missing for --help', () => {
    expect(() => parseArgs(['--help'])).not.toThrow();
  });

  it('does not throw when --to is missing for --version', () => {
    expect(() => parseArgs(['--version'])).not.toThrow();
  });

  it('throws when --domain has no value', () => {
    expect(() => parseArgs(['input.json', '--to', 'yon', '--domain'])).toThrow('--domain requires');
  });

  it('throws when --output has no value', () => {
    expect(() => parseArgs(['input.json', '--to', 'yon', '--output', '--quiet'])).toThrow('--output requires');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// convertToYon
// ═══════════════════════════════════════════════════════════════════════════

describe('convertToYon', () => {
  const opts = { id: 'test', title: 'Test' };

  it('converts JSON to YON', () => {
    const result = convertToYon('{"key": "value"}', 'json', opts);
    expect(result).toContain('@DOC');
    expect(result).toContain('key');
  });

  it('converts YAML to YON', () => {
    const result = convertToYon('key: value', 'yaml', opts);
    expect(result).toContain('@DOC');
  });

  it('converts TOML to YON', () => {
    const result = convertToYon('key = "value"', 'toml', opts);
    expect(result).toContain('@DOC');
  });

  it('converts CSV to YON', () => {
    const result = convertToYon('name,age\nAlice,30', 'csv', opts);
    expect(result).toContain('@DOC');
  });

  it('converts XML to YON', () => {
    const result = convertToYon('<root><item>value</item></root>', 'xml', opts);
    expect(result).toContain('@DOC');
  });

  it('converts INI to YON', () => {
    const result = convertToYon('[section]\nkey=value', 'ini', opts);
    expect(result).toContain('@DOC');
  });

  it('handles YON passthrough', () => {
    const yon = '@DOC ver=2.0 | id=test | title="Test"\n@NOTE text="hello"';
    const result = convertToYon(yon, 'yon', opts);
    expect(result).toContain('@DOC');
    expect(result).toContain('@NOTE');
  });

  it('wraps unknown format in @NOTE', () => {
    const result = convertToYon('just some plain text', 'unknown', opts);
    expect(result).toContain('@DOC');
    expect(result).toContain('@NOTE');
    expect(result).toContain('just some plain text');
  });

  it('passes extended options to converter', () => {
    const result = convertToYon('{"a": 1}', 'json', {
      id: 'test',
      title: 'Test',
      domain: 'yai.health',
      profile: 'decl',
    });
    expect(result).toContain('domain=yai.health');
    expect(result).toContain('profile=decl');
  });

  it('throws on unsupported format', () => {
    expect(() => convertToYon('data', 'pdf', opts)).toThrow('Unsupported source format');
  });
});
