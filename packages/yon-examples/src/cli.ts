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
 * @younndai/yon-examples CLI
 *
 * Commands:
 *   list              — List all examples
 *   show <id>         — Display an example
 *   list --category   — Filter by category
 */

import { discoverExamples, readExample, getCategories } from './registry.js';

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
yon-examples — YON Cookbook CLI

Commands:
  list                  List all examples
  list --category <cat> List examples in a category
  show <id>             Display example contents
  categories            List all categories

Options:
  --help                Show this help
`);
}

function cmdList(): void {
  const categoryFilter = args.indexOf('--category') !== -1
    ? args[args.indexOf('--category') + 1]
    : undefined;

  const examples = discoverExamples();
  const filtered = categoryFilter
    ? examples.filter(e => e.category === categoryFilter)
    : examples;

  if (filtered.length === 0) {
    console.log(categoryFilter
      ? `No examples found in category: ${categoryFilter}`
      : 'No examples found.');
    return;
  }

  let currentCategory = '';
  for (const ex of filtered) {
    if (ex.category !== currentCategory) {
      currentCategory = ex.category;
      console.log(`\n${currentCategory}/`);
    }
    console.log(`  ${ex.id}`);
  }
  console.log(`\n${filtered.length} examples total.`);
}

function cmdShow(): void {
  const id = args[1];
  if (!id) {
    console.error('Usage: yon-examples show <id>');
    process.exit(1);
  }

  const examples = discoverExamples();
  const match = examples.find(e => e.id === id);

  if (!match) {
    console.error(`Example not found: ${id}`);
    console.error(`Run 'yon-examples list' to see available examples.`);
    process.exit(1);
  }

  console.log(`# ${match.category}/${match.id}.yon\n`);
  console.log(readExample(match));
}

function cmdCategories(): void {
  const categories = getCategories();
  console.log('Categories:\n');
  for (const cat of categories) {
    console.log(`  ${cat}`);
  }
}

switch (command) {
  case 'list':
    cmdList();
    break;
  case 'show':
    cmdShow();
    break;
  case 'categories':
    cmdCategories();
    break;
  case '--help':
  case '-h':
  case undefined:
    printUsage();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
