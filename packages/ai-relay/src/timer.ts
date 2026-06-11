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
 * @younndai/ai-relay — Timer Utilities
 *
 * High-resolution timing for LLM calls, benchmarks, and profiling.
 *
 * @license Apache-2.0
 */

import { performance } from 'node:perf_hooks';

/** Start a timer. Returns a function that, when called, returns elapsed ms. */
export function startTimer(): () => number {
  const start = performance.now();
  return () => performance.now() - start;
}

/** Run a function and measure its execution time in milliseconds. */
export async function measure<T>(
  fn: () => T | Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const elapsed = startTimer();
  const result = await fn();
  return { result, durationMs: elapsed() };
}

/** Get a local ISO 8601 timestamp string. */
export function localTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a duration in milliseconds to human-readable string.
 *
 * < 1000ms → "42ms"
 * < 60s    → "12.3s"
 * < 60m    → "2m 36s (156s)"
 * >= 60m   → "1h 5m (3900s)"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds}s (${Math.round(totalSeconds)}s)`;
  }
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m (${Math.round(totalSeconds)}s)`;
}
