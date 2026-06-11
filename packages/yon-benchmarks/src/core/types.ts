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
 * Core types for the YON benchmark suite.
 *
 * Every benchmark maps to one of YON's four pillars:
 * Streaming, Lossless, Cognitive Economy, Emitter Faithfulness.
 */

// ---------------------------------------------------------------------------
// Pillar & Category
// ---------------------------------------------------------------------------

/** YON's four architectural pillars + cross-cutting + Sapir-Whorf thesis suites. */
export type Pillar =
  | 'streaming'
  | 'lossless'
  | 'cognitive-economy'
  | 'emitter-faithfulness'
  | 'cross-cutting'
  | 'sapir-whorf';

/** Whether a suite runs locally or requires LLM API access. */
export type SuiteCategory = 'local' | 'llm';

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/** A single measured value with optional comparative baseline. */
export interface MetricValue {
  /** Human-readable metric name, e.g. 'generation_success_rate'. */
  name: string;
  /** Measured value. */
  value: number;
  /** Unit of measurement, e.g. '%', 'ms', 'records', 'ratio'. */
  unit: string;
  /** Optional comparison to a baseline format. */
  comparison?: {
    baseline: number;
    baselineLabel: string;
    /** Human-readable delta, e.g. '+45%', '−12 ms'. */
    delta: string;
  };
}

// ---------------------------------------------------------------------------
// Test Results
// ---------------------------------------------------------------------------

/** Comparative outcome for tests that compare YON against other formats. */
export type TestOutcome = 'advantage' | 'tied' | 'disadvantage';

/** Classification of test purpose for honest reporting. */
export type TestType = 'gate' | 'comparative' | 'measurement';

/** Result of a single test within a suite. */
export interface TestResult {
  /** Machine-readable test ID, e.g. 'partial-corruption-survival'. */
  id: string;
  /** Human-readable test name. */
  name: string;
  /** Whether the test executed successfully (execution health, not comparative). */
  passed: boolean;
  /**
   * Test classification for reporting:
   * - **gate:** Has a real pass/fail threshold. Counted in pass rate.
   * - **comparative:** Always passes. Shows data. Excluded from pass rate.
   * - **measurement:** Captures data without assertion. Excluded from pass rate.
   * Defaults to 'gate' if omitted (backward compatible).
   */
  type?: TestType;
  /**
   * Comparative outcome vs baseline format.
   * Only set for tests that compare YON against another format.
   * Uses ±5% threshold: |delta| ≤ 5% → 'tied'.
   */
  outcome?: TestOutcome;
  /** Primary metric for this test. */
  metric: MetricValue;
  /** Additional metrics (multi-dimensional tests). */
  secondaryMetrics?: MetricValue[];
  /** Diagnostic detail or failure explanation. */
  detail?: string;
}

/** Aggregate summary for a suite run. */
export interface SuiteSummary {
  /** Total tests executed. */
  total: number;
  /** Tests that passed. */
  passed: number;
  /** Tests that failed. */
  failed: number;
  /** Wall-clock execution time in milliseconds. */
  durationMs: number;
}

/** Complete result of running one benchmark suite. */
export interface BenchmarkResult {
  /** Suite identifier matching the suite registration. */
  suiteId: string;
  /** Human-readable suite name. */
  suiteName: string;
  /** Which pillar this suite validates. */
  pillar: Pillar;
  /** Individual test results. */
  tests: TestResult[];
  /** Aggregate summary. */
  summary: SuiteSummary;
  /** ISO 8601 local timestamp of execution. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Suite Registration
// ---------------------------------------------------------------------------

/** A registered benchmark suite. */
export interface BenchmarkSuite {
  /** Machine-readable suite ID, e.g. 'structural-reliability'. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Whether this suite requires LLM API keys. */
  category: SuiteCategory;
  /** Which YON pillar this suite validates. */
  pillar: Pillar;
  /** Execute the suite and return results. */
  run: () => Promise<BenchmarkResult>;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/** Full benchmark report containing all suite results. */
export interface BenchmarkReport {
  /** Package version from package.json. */
  version: string;
  /** ISO 8601 local timestamp of report generation. */
  timestamp: string;
  /** Environment info. */
  environment: {
    nodeVersion: string;
    platform: string;
    llmAccess: boolean;
  };
  /** Results from all executed suites. */
  results: BenchmarkResult[];
  /** AI-generated enrichment (when LLM access available). */
  enrichment?: ReportEnrichment;
}

/** Narrative enrichment for a report. capabilityAnalysis is deterministic; synthesis requires LLM. */
export interface ReportEnrichment {
  /** Capability analysis: audience tables, value amplifier, scorecard (deterministic markdown). */
  capabilityAnalysis: string;
  /** Cross-suite synthesis: key findings, known boundaries, value amplifiers (LLM-generated). */
  synthesis?: string;
}
