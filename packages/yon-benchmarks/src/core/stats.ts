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
 * Statistical Harness — multi-run benchmarking with warm-up and percentiles.
 *
 * Provides `runN()` for statistically rigorous measurements and
 * `getEnvironmentInfo()` for reproducible environment metadata.
 */

import { cpus, totalmem, platform, arch, release } from 'node:os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RunNOptions {
  /** Number of measurement iterations (default: 30). */
  iterations?: number;
  /** Number of warm-up iterations to discard (default: 5). */
  warmup?: number;
}

export interface RunNResult {
  /** Arithmetic mean in ms. */
  mean: number;
  /** Standard deviation in ms. */
  stdev: number;
  /** Minimum value in ms. */
  min: number;
  /** Maximum value in ms. */
  max: number;
  /** 50th percentile (median) in ms. */
  p50: number;
  /** 95th percentile in ms. */
  p95: number;
  /** 99th percentile in ms. */
  p99: number;
  /** All raw measurements in ms (sorted). */
  raw: number[];
  /** Number of measurement iterations (excludes warm-up). */
  n: number;
}

export interface EnvironmentInfo {
  cpu: string;
  cores: number;
  ramGB: number;
  os: string;
  arch: string;
  nodeVersion: string;
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

/**
 * Run a synchronous function N times with warm-up and return statistical summary.
 *
 * @param fn The function to benchmark. Will be called with the current iteration index.
 * @param options Iteration and warm-up configuration.
 * @returns Statistical summary of execution times.
 */
export function runN(fn: (i: number) => void, options: RunNOptions = {}): RunNResult {
  const iterations = options.iterations ?? 30;
  const warmup = options.warmup ?? 5;

  // Warm-up phase (results discarded)
  for (let i = 0; i < warmup; i++) {
    fn(i);
  }

  // Measurement phase
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(i);
    times.push(performance.now() - start);
  }

  return computeStats(times);
}

/**
 * Run an async function N times with warm-up and return statistical summary.
 */
export async function runNAsync(
  fn: (i: number) => Promise<void>,
  options: RunNOptions = {},
): Promise<RunNResult> {
  const iterations = options.iterations ?? 30;
  const warmup = options.warmup ?? 5;

  // Warm-up phase
  for (let i = 0; i < warmup; i++) {
    await fn(i);
  }

  // Measurement phase
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn(i);
    times.push(performance.now() - start);
  }

  return computeStats(times);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeStats(times: number[]): RunNResult {
  const sorted = [...times].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = sorted.reduce((acc, t) => acc + (t - mean) ** 2, 0) / n;
  const stdev = Math.sqrt(variance);

  return {
    mean: round(mean),
    stdev: round(stdev),
    min: round(sorted[0]!),
    max: round(sorted[n - 1]!),
    p50: round(percentile(sorted, 50)),
    p95: round(percentile(sorted, 95)),
    p99: round(percentile(sorted, 99)),
    raw: sorted.map(round),
    n,
  };
}

function percentile(sorted: number[], pct: number): number {
  const idx = (pct / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower]!;
  const frac = idx - lower;
  return sorted[lower]! * (1 - frac) + sorted[upper]! * frac;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// Environment Info
// ---------------------------------------------------------------------------

export function getEnvironmentInfo(): EnvironmentInfo {
  const cpu = cpus()[0];
  return {
    cpu: cpu?.model?.trim() ?? 'Unknown',
    cores: cpus().length,
    ramGB: Math.round(totalmem() / 1024 / 1024 / 1024),
    os: platform() + ' ' + release(),
    arch: arch(),
    nodeVersion: process.version,
  };
}

/**
 * Format a RunNResult as a human-readable string.
 */
export function formatStats(result: RunNResult): string {
  return (
    result.mean.toFixed(3) + 'ms ± ' + result.stdev.toFixed(3) +
    'ms (P50=' + result.p50.toFixed(3) +
    ', P95=' + result.p95.toFixed(3) +
    ', P99=' + result.p99.toFixed(3) +
    ', n=' + result.n + ')'
  );
}
