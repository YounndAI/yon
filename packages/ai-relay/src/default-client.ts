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
 * @younndai/ai-relay — Default Client
 *
 * The module-level default relay client that every free top-level function
 * delegates to. This is the "axios default + axios.create()" pattern: import
 * `generate` and it just works (zero config); call `createRelay()` for an
 * independent, isolated client.
 *
 * The default client's cost sink mirrors every recorded call into the
 * process-global cost-tracker (recordUsage), so the legacy global cost
 * functions (`getTotalCost`, `getProviderBreakdown`, …) keep reflecting the
 * default client's activity — exactly as before this refactor.
 *
 * @license Apache-2.0
 */

import { createRelay, type Relay } from './relay.js';
import { recordUsage } from './cost-tracker.js';
import type { CostEntry, CostSink } from './relay-config.js';

/**
 * A cost sink that forwards each recorded call to the process-global
 * cost-tracker. Preserves the historical single-app behavior where the global
 * cost functions reflect all default-client traffic.
 */
class GlobalMirrorSink implements CostSink {
  record(entry: CostEntry): void {
    recordUsage(entry.provider, entry.inputTokens, entry.outputTokens);
  }
}

/** The shared default client backing all free top-level functions. */
export const defaultClient: Relay = createRelay({
  costSink: new GlobalMirrorSink(),
  // The default client preserves the legacy silent-OpenAI fallback so existing
  // consumers that pass odd model strings don't suddenly throw. New clients
  // default to strict routing (see createRelay).
  strictModelRouting: false,
});
