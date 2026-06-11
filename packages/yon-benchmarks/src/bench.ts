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
 * YON Benchmarks CLI entry point.
 *
 * Usage:
 *   npx tsx src/bench.ts                        # Full run (local + LLM if keys available)
 *   npx tsx src/bench.ts --local                # Local suites only
 *   npx tsx src/bench.ts --llm                  # LLM suites only (all available providers)
 *   npx tsx src/bench.ts --provider openai      # LLM suites with specific provider
 *   npx tsx src/bench.ts --provider openai,google  # Multiple providers
 *   npx tsx src/bench.ts --filter "compression" # Run suites matching name
 *   npx tsx src/bench.ts --filter compression --quick # 1 scenario only (dev)
 *   npx tsx src/bench.ts --tier target              # Budget+standard only (recommended)
 *   npx tsx src/bench.ts --tier budget               # Budget tier only
 */

import 'dotenv/config'; // For standard .env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // For local overrides

// Suppress AI SDK warnings ("seed not supported" etc.) — noise in benchmark output
(globalThis as Record<string, unknown>).AI_SDK_LOG_WARNINGS = false;

import { runBenchmarks } from './reports/orchestrator.js';
import type { ProviderName } from './core/env.js';

const args = process.argv.slice(2);
const localOnly = args.includes('--local');
const llmOnly = args.includes('--llm');
const report = args.includes('--report') || !localOnly;

const filterIndex = args.indexOf('--filter');
const filter = filterIndex !== -1 ? args[filterIndex + 1] : undefined;

// Parse --provider flag (comma-separated list)
const providerIndex = args.indexOf('--provider');
let providers: ProviderName[] | undefined;
if (providerIndex !== -1 && args[providerIndex + 1]) {
  const raw = args[providerIndex + 1]!.toLowerCase().split(',');
  const valid: ProviderName[] = ['openai', 'anthropic', 'google'];
  providers = raw.filter((p): p is ProviderName => valid.includes(p as ProviderName));

  const invalid = raw.filter((p) => !valid.includes(p as ProviderName));
  if (invalid.length > 0) {
    console.warn(`⚠ Unknown provider(s): ${invalid.join(', ')}. Valid: openai, anthropic, google`);
  }

  if (providers.length === 0) {
    console.error('❌ No valid providers specified. Valid: openai, anthropic, google');
    process.exit(1);
  }
}

// Parse --tier flag (target = budget+standard, where YON adds value)
const tierIndex = args.indexOf('--tier');
const tierMode = tierIndex !== -1 ? args[tierIndex + 1] : undefined;
const validTierModes = ['all', 'target', 'budget', 'standard', 'premium'] as const;
if (tierMode && !validTierModes.includes(tierMode as typeof validTierModes[number])) {
  console.error(`❌ Unknown tier mode: ${tierMode}. Valid: ${validTierModes.join(', ')}`);
  process.exit(1);
}

// If --provider is specified, imply --llm (skip local)
const effectiveLlmOnly = llmOnly || !!providers;

await runBenchmarks({
  localOnly,
  llmOnly: effectiveLlmOnly,
  report,
  filter,
  providers,
  tier: tierMode as 'all' | 'target' | 'budget' | 'standard' | 'premium' | undefined,
});
