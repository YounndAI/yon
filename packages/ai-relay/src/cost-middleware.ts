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
 * @younndai/ai-relay — Cost Middleware
 *
 * A LanguageModelMiddleware that attributes token usage + USD cost to a
 * per-client {@link CostSink} on every generate and stream completion.
 *
 * Wiring this via `wrapLanguageModel` / `createProviderRegistry`'s
 * `languageModelMiddleware` makes cost tracking automatic and CLIENT-SCOPED:
 * two relay clients with two sinks never collide, because the middleware
 * closes over the sink at construction time.
 *
 * @license Apache-2.0
 */

import type { LanguageModelMiddleware } from 'ai';
import { calculateCost } from './model-registry.js';
import type { CostSink } from './relay-config.js';

/**
 * Derive a registry-friendly provider key from a model's provider id.
 * AI SDK provider ids look like `openai.responses`, `anthropic.messages`,
 * `google.generative-ai` — the registry keys on the leading token.
 */
function providerKeyOf(providerId: string): string {
  const head = providerId.split('.')[0] ?? providerId;
  // Normalize known aliases.
  if (head === 'google-generative-ai' || head === 'google') return 'google';
  return head;
}

/**
 * Create a cost-attribution middleware bound to one sink.
 *
 * @param sink - Where to emit per-call {@link import('./relay-config.js').CostEntry} records.
 * @returns A LanguageModelMiddleware to pass to wrapLanguageModel / registry.
 */
export function createCostMiddleware(sink: CostSink): LanguageModelMiddleware {
  return {
    specificationVersion: 'v3',

    async wrapGenerate({ doGenerate, model }) {
      const result = await doGenerate();
      const input = result.usage.inputTokens.total ?? 0;
      const output = result.usage.outputTokens.total ?? 0;
      const provider = providerKeyOf(model.provider);
      const modelId = model.modelId;
      sink.record({
        provider,
        modelId,
        inputTokens: input,
        outputTokens: output,
        cost: calculateCost(modelId, input, output),
      });
      return result;
    },

    async wrapStream({ doStream, model }) {
      const { stream, ...rest } = await doStream();
      const provider = providerKeyOf(model.provider);
      const modelId = model.modelId;

      const tap = new TransformStream({
        transform(chunk, controller) {
          if (chunk.type === 'finish') {
            const input = chunk.usage.inputTokens.total ?? 0;
            const output = chunk.usage.outputTokens.total ?? 0;
            sink.record({
              provider,
              modelId,
              inputTokens: input,
              outputTokens: output,
              cost: calculateCost(modelId, input, output),
            });
          }
          controller.enqueue(chunk);
        },
      });

      return { stream: stream.pipeThrough(tap), ...rest };
    },
  };
}
