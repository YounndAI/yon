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
 * Shared memory measurement helpers for streaming benchmark suites.
 * Used by: memory-efficiency, memory-stability, backpressure-safety, streaming-throughput.
 */

// ---------------------------------------------------------------------------
// GC & Heap
// ---------------------------------------------------------------------------

export function forceGC(): void {
  if (global.gc) {
    global.gc();
  }
}

export function getHeapMB(): number {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
}

// ---------------------------------------------------------------------------
// YON Stream Generation
// ---------------------------------------------------------------------------

export function generateYonStream(recordCount: number): string {
  let doc = '@DOC ver=2.0 | id=mem-bench | title="Memory" | kind=data\n';
  for (let i = 0; i < recordCount; i++) {
    doc += '@MAP id=rec-' + i + ' | name="Record ' + i + '" | value:int=' + i + ' | active:bool=true\n';
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Measurement Types
// ---------------------------------------------------------------------------

export interface MemoryMeasurement {
  before: number;
  after: number;
  peak: number;
  delta: number;
}
