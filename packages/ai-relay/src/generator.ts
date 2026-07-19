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
 * @younndai/ai-relay — Generation (back-compat facade)
 *
 * Free top-level generation functions. Delegate to the DEFAULT relay client so
 * zero-config consumers keep working unchanged. All option/result types are
 * re-exported from `generator-core.ts` (single source of truth).
 *
 * New code should prefer `createRelay()` for isolated, BYOK-per-client config.
 *
 * @license Apache-2.0
 */

import { defaultClient } from './default-client.js';
import {
  runGenerate,
  runGenerateObject,
  runGenerateWithLogprobs,
  runStream,
} from './generator-core.js';
import type {
  GenerateOptions,
  GenerateResult,
  GenerateObjectOptions,
  GenerateObjectResult,
  LogprobOptions,
  LogprobResult,
  StreamChunk,
} from './generator-core.js';

export { GenerationTimeoutError } from './generator-core.js';

// Re-export the full public type surface unchanged.
export type {
  GenerateOptions,
  GenerateResult,
  GenerateObjectOptions,
  GenerateObjectResult,
  StreamChunk,
  ModelPreset,
  LogprobToken,
  LogprobResult,
  LogprobOptions,
  StreamErrorKind,
} from './generator-core.js';

const deps = {
  resolveModel: (m: string) => defaultClient.resolveModel(m),
  getPresetModel: defaultClient.getPresetModel.bind(defaultClient),
};

/** Generate text completion (default client). */
export function generate(options: GenerateOptions): Promise<GenerateResult> {
  return runGenerate(deps, options);
}

/** Generate text with per-token log probabilities (default client). */
export function generateWithLogprobs(options: LogprobOptions): Promise<LogprobResult> {
  return runGenerateWithLogprobs(deps, options);
}

/** Generate structured JSON validated by a Zod schema (default client). */
export function generateObject<T>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResult<T>> {
  return runGenerateObject(deps, options);
}

/** Stream text completion (default client). */
export function stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
  return runStream(deps, options);
}
