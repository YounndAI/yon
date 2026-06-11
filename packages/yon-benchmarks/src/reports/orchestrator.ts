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
 * Benchmark Orchestrator — main entry point for running suites.
 *
 * Auto-detects environment:
 * - Always runs local suites (unless --llm)
 * - Runs LLM suites when API keys are available
 * - Enriches reports with AI when possible
 * - Respects --provider filter for LLM provider selection
 */

import { resolve, dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  hasLLMAccess,
  getAvailableProviders,
  setActiveProviders,
  PROVIDER_ENV_KEYS,
  type ProviderName,
} from '../core/env.js';
import { setTierMode, getTierMode } from '../core/models.js';
import { getAllSuites, getSuitesByCategory } from '../core/registry.js';
import { localTimestamp, startTimer } from '@younndai/ai-relay';
import { enrichReport } from './enricher.js';
import { renderReport } from './renderer.js';
import { generateModelScorecards } from './model-scorecard.js';
import { generateBorgesExplainer } from './borges-explainer.js';
import { generateHorizonExplainer } from './horizon-explainer.js';
import { generateSuiteEnrichment } from './suite-report-generator.js';
import { validateReportDirectory } from './report-validator.js';
import type { SuiteEnrichment } from './suite-report-generator.js';
import type { BenchmarkReport, BenchmarkResult } from '../core/types.js';
import { groupByPillar, sortByPillar, printPillarHeader, printSuiteResult, printSuiteRunning, printSuiteError, printSummary } from './console-reporter.js';
import {
  getTotalCalls,
  getTotalCost,
  getTotalInputTokens,
  getTotalOutputTokens,
} from '@younndai/ai-relay';

// Import all suites to trigger registration
import '../local/structural-reliability.js';
import '../local/streaming-properties.js';
import '../local/format-fidelity.js';
import '../local/hallucination-resistance.js';
import '../local/converter-resilience.js';
import '../local/token-efficiency.js';
import '../local/concurrency-stress.js';
import '../local/diagnostic-quality.js';
import '../local/low-level-hardening.js';
import '../local/migration-fidelity.js';
import '../local/security-and-economy.js';
import '../local/parser-conformance.js';
import '../local/generator-validity.js';



// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface OrchestratorOptions {
  /** Run only local suites (no LLM). */
  localOnly?: boolean;
  /** Run only LLM suites (skip local). */
  llmOnly?: boolean;
  /** Generate full report with AI enrichment. */
  report?: boolean;
  /** Custom report output directory. */
  reportDir?: string;
  /** Run only suites matching this string (case-insensitive). */
  filter?: string;
  /** Restrict LLM suites to specific providers. */
  providers?: ProviderName[];
  /** Tier mode: 'target' = budget+standard, 'all' = all tiers, or single tier. */
  tier?: 'all' | 'target' | 'budget' | 'standard' | 'premium';
}

export async function runBenchmarks(
  options: OrchestratorOptions = {},
): Promise<BenchmarkReport> {
  const elapsed = startTimer();

  // Set active provider context before anything else
  if (options.providers) {
    setActiveProviders(options.providers);
  }

  // Set tier mode (default: 'all' for backward compat)
  if (options.tier) {
    setTierMode(options.tier);
  }

  const allRegistered = getAllSuites();
  let localSuites = sortByPillar(getSuitesByCategory('local'));
  let llmSuites = sortByPillar(getSuitesByCategory('llm'));

  if (options.filter) {
    const term = options.filter.toLowerCase();
    localSuites = localSuites.filter((s) => s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
    llmSuites = llmSuites.filter((s) => s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
  }

  const totalSuiteCount = allRegistered.length;
  const filteredSuiteCount = localSuites.length + llmSuites.length;

  const llmAvailable = !options.localOnly && hasLLMAccess();
  const runLocal = !options.llmOnly;
  const runLLM = !options.localOnly && llmAvailable;

  // Resolve mode label
  let modeLabel = 'Full';
  if (options.localOnly) modeLabel = 'Local only';
  else if (options.llmOnly) modeLabel = 'LLM only';
  if (options.providers) modeLabel += ` (${options.providers.join(', ')})`;
  const activeTierMode = getTierMode();
  if (activeTierMode !== 'all') modeLabel += ` [tier: ${activeTierMode}]`;

  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║    YON Benchmarks v0.1.0             ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  Suites:     ${getAllSuites().length} total (${localSuites.length} local, ${llmSuites.length} LLM)`);

  if (runLLM || options.llmOnly) {
    const available = getAvailableProviders();
    const active = options.providers
      ? options.providers.filter((p) => available.includes(p))
      : available;

    if (active.length > 0) {
      console.log(`  LLM Access: Yes (${active.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')})`);
    } else {
      console.log('  LLM Access: No keys found');
    }

    // Show missing keys
    if (options.providers) {
      for (const p of options.providers) {
        if (!available.includes(p)) {
          console.log(`  ⚠ ${p}: no ${PROVIDER_ENV_KEYS[p]} in .env.local — skipping`);
        }
      }
    }
  } else if (options.localOnly) {
    console.log('  LLM Access: Skipped (--local)');
  } else {
    console.log('  LLM Access: No keys found — running local only');
    console.log('');
    console.log('  To enable LLM benchmarks, create packages/yon-benchmarks/.env.local:');
    console.log('    OPENAI_API_KEY=sk-...');
    console.log('    ANTHROPIC_API_KEY=sk-ant-...');
    console.log('    GOOGLE_GENERATIVE_AI_API_KEY=AIza...');
  }

  console.log(`  Mode:       ${modeLabel}`);
  console.log('');

  // ---------------------------------------------------------------------------
  // Create report dir early (crash safety net — results written incrementally)
  // ---------------------------------------------------------------------------
  const runTimestamp = localTimestamp();
  const reportsBaseDir = options.reportDir ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../reports');
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const tsDate = new Date(runTimestamp);
  const reportDirName = `${tsDate.getFullYear()}-${pad2(tsDate.getMonth() + 1)}-${pad2(tsDate.getDate())}-${pad2(tsDate.getHours())}-${pad2(tsDate.getMinutes())}`;
  const reportDir = join(reportsBaseDir, reportDirName);
  mkdirSync(reportDir, { recursive: true });
  const totalExpected = (runLocal ? localSuites.length : 0) + (runLLM ? llmSuites.length : 0);

  /** Persist a suite result to disk immediately after execution (crash net). */
  function persistResult(result: BenchmarkResult, completedCount: number): void {
    const suiteDir = join(reportDir, result.suiteId);
    mkdirSync(suiteDir, { recursive: true });
    writeFileSync(join(suiteDir, 'result.json'), JSON.stringify(result, null, 2));
    writeFileSync(join(reportDir, 'progress.json'), JSON.stringify({
      status: 'running',
      completed: completedCount,
      total: totalExpected,
      lastSuite: result.suiteId,
      lastCompletedAt: new Date().toISOString(),
    }, null, 2));
  }

  // Run suites
  const results: BenchmarkResult[] = [];
  let totalSuitesAttempted = 0;

  // Local suites — grouped by pillar
  if (runLocal) {
    const pillarGroups = groupByPillar(localSuites);
    for (const [pillar, suites] of pillarGroups) {
      printPillarHeader(pillar, suites.length);
      for (const suite of suites) {
        totalSuitesAttempted++;
        printSuiteRunning(suite.name);
        try {
          const result = await suite.run();
          printSuiteResult(result);
          results.push(result);
          persistResult(result, results.length);
        } catch (e) {
          printSuiteError(suite.name, e);
        }
      }
    }
  }

  // LLM suites — grouped by pillar
  if (runLLM) {
    const active = getAvailableProviders();
    if (active.length === 0 && options.llmOnly) {
      console.log('');
      console.log('❌ No LLM API keys available. Cannot run LLM suites.');
      console.log('');
      console.log('Create packages/yon-benchmarks/.env.local with one or more:');
      console.log('  OPENAI_API_KEY=sk-...');
      console.log('  ANTHROPIC_API_KEY=sk-ant-...');
      console.log('  GOOGLE_GENERATIVE_AI_API_KEY=AIza...');
      console.log('');
    } else if (active.length > 0) {
      const pillarGroups = groupByPillar(llmSuites);
      for (const [pillar, suites] of pillarGroups) {
        printPillarHeader(pillar, suites.length, true);
        for (const suite of suites) {
          totalSuitesAttempted++;
          printSuiteRunning(suite.name);
          try {
            const result = await suite.run();
            printSuiteResult(result);
            results.push(result);
            persistResult(result, results.length);
          } catch (e) {
            printSuiteError(suite.name, e);
          }
        }
      }
    }
  }

  const totalDuration = elapsed();

  // Build report
  const report: BenchmarkReport = {
    version: '0.1.0',
    timestamp: runTimestamp,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      llmAccess: runLLM && getAvailableProviders().length > 0,
    },
    results,
  };

  // Enrich report (deterministic Pass A always runs; LLM Pass B when available)
  console.log('');
  process.stdout.write('  ▸ Enriching report...');
  try {
    report.enrichment = await enrichReport(report);
    console.log(' done');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(` skipped (${msg.slice(0, 80)})`);
  }

  // Generate per-suite enrichments (audience-segmented reports)
  console.log(`  ▸ Generating per-suite reports (${results.length} suites)...`);
  const suiteEnrichments = new Map<string, SuiteEnrichment>();
  let enrichIdx = 0;
  for (const result of results) {
    enrichIdx++;
    process.stdout.write(`    [${enrichIdx}/${results.length}] ${result.suiteId}...`);
    try {
      const enrichment = await generateSuiteEnrichment(result);
      if (enrichment) {
        suiteEnrichments.set(result.suiteId, enrichment);
      }
      console.log(' done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(` failed (${msg.slice(0, 60)})`);
    }
  }
  console.log(`    ${suiteEnrichments.size}/${results.length} suites enriched`);

  // Render report (always — this is the point)
  const dir = renderReport(report, reportsBaseDir, suiteEnrichments);
  writeFileSync(join(reportDir, 'progress.json'), JSON.stringify({
    status: 'complete',
    completed: results.length,
    total: totalExpected,
    completedAt: new Date().toISOString(),
  }, null, 2));
  console.log('');
  console.log(`  📄 Report written to: ${dir}`);

  // Generate model scorecards (only if LLM results present)
  const llmResultCount = results.filter(r => r.suiteId.startsWith('llm-') || r.suiteId.includes('format-') || r.suiteId.includes('model') || r.suiteId.includes('cognitive') || r.suiteId.includes('density') || r.suiteId.includes('cost')).length;
  if (llmResultCount > 0) {
    // Build run metadata from available data
    const allTests = results.flatMap(r => r.tests);
    const gateTests = allTests.filter(t => !t.type || t.type === 'gate');
    const gatePassed = gateTests.filter(t => t.passed).length;
    const runMeta = {
      durationMs: report.results.reduce((sum, r) => sum + (r.summary?.durationMs ?? 0), 0),
      suiteCount: results.length,
      testCount: allTests.length,
      passRate: gateTests.length > 0 ? Math.round((gatePassed / gateTests.length) * 100) : 100,
    };
    const { scorecards, path: scorecardPath } = await generateModelScorecards(results, dir, report.timestamp, runMeta);
    if (scorecards.length > 0) {
      console.log(`  📊 Model scorecards: ${scorecardPath} (${scorecards.length} models)`);
    }
  }

  // Generate explainers for Sapir-Whorf suites (only when suite data is present)
  const [borgesResult, horizonResult] = await Promise.allSettled([
    generateBorgesExplainer(results, dir),
    generateHorizonExplainer(results, dir),
  ]);
  if (borgesResult.status === 'fulfilled' && borgesResult.value.generated) {
    console.log(`  📝 Borges Warning explainer: ${borgesResult.value.path}`);
  }
  if (horizonResult.status === 'fulfilled' && horizonResult.value.generated) {
    console.log(`  📐 Cognitive Horizon explainer: ${horizonResult.value.path}`);
  }

  // Post-generation quality gate: validate all report files
  console.log('');
  process.stdout.write('  ▸ Validating report files...');
  const validation = validateReportDirectory(dir);
  if (validation.issuesFound === 0) {
    console.log(` clean (${validation.totalFiles} files)`);
  } else {
    console.log(` ${validation.autoFixed} auto-fixed, ${validation.warnings} warnings (${validation.totalFiles} files)`);
    if (validation.warnings > 0) {
      console.log('  ⚠ Unfixable issues:');
      for (const issue of validation.issues.filter(i => !i.autoFixed)) {
        console.log(`    ${issue.file}:${issue.line} — ${issue.detail}`);
      }
    }
  }

  // Summary
  const llmCalls = getTotalCalls();
  printSummary({
    results,
    totalDurationMs: totalDuration,
    totalSuites: totalSuitesAttempted,
    filtered: options.filter ? { shown: filteredSuiteCount, total: totalSuiteCount } : undefined,
    llmCost: llmCalls > 0
      ? {
          cost: getTotalCost(),
          calls: llmCalls,
          inputTokens: getTotalInputTokens(),
          outputTokens: getTotalOutputTokens(),
        }
      : undefined,
  });

  return report;
}
