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
 * @younndai/yon-benchmarks
 *
 * YON benchmark suite — structural reliability, cognitive economy,
 * and streaming properties.
 *
 * Structure before scale. Clarity above all.
 */

// Core types
export type {
  BenchmarkSuite,
  BenchmarkResult,
  BenchmarkReport,
  TestResult,
  MetricValue,
  SuiteSummary,
  ReportEnrichment,
  Pillar,
  SuiteCategory,
} from './core/types.js';

// Registry
export {
  getAllSuites,
  getSuitesByCategory,
  getSuite,
} from './core/registry.js';

// Environment
export { hasLLMAccess, getProviderSummary } from './core/env.js';

// Vectors
export { loadVector, hasVector } from './core/vectors.js';

// Orchestrator
export { runBenchmarks, type OrchestratorOptions } from './reports/orchestrator.js';
