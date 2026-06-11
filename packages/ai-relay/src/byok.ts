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
 * BYOK provider factory — creates one-shot AI SDK provider instances
 * using the handler's own API key.
 *
 * Supports: openai, anthropic, google.
 * Does NOT cache provider instances — each call creates a fresh one.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type BYOKProvider = 'openai' | 'anthropic' | 'google';

/**
 * Create a one-shot LanguageModel using the handler's API key.
 *
 * @param provider - Provider identifier
 * @param model - Model identifier (e.g., 'gpt-4.1', 'claude-sonnet-4-6')
 * @param apiKey - The handler's API key (decrypted)
 * @returns AI SDK LanguageModel ready for use with generateText/streamText
 */
export function createBYOKModel(
  provider: string,
  model: string,
  apiKey: string,
): LanguageModel {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    default:
      throw new Error(`Unsupported BYOK provider: ${provider}. Supported: openai, anthropic, google.`);
  }
}
