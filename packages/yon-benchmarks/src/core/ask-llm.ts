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
 * Shared LLM Helper
 *
 * Provider-aware askLLM with retry + exponential backoff.
 * Also provides askAllLLMs for multi-model tests via @younndai/ai-relay.
 *
 * Provider resolution (for single-model askLLM):
 *   1. Active provider set by --provider CLI flag
 *   2. OpenAI (default if key available)
 *   3. First available provider
 *
 * For multi-model tests, use askAllLLMs which runs across ALL active providers.
 */

import { generateText } from 'ai';
import {
  resolveModel,
  askAllModels,
  MODEL_REGISTRY,
  type ProviderName,
  type MultiModelResponse,
} from '@younndai/ai-relay';
import { getActiveProviders } from './env.js';
import { recordUsage } from '@younndai/ai-relay';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000; // 2s, 4s, 8s

/** Get the model ID for a provider from the registry. */
function getModelIdForProvider(provider: ProviderName): string {
  const entry = MODEL_REGISTRY.find(
    (m) => m.provider === provider && m.tier === 'standard',
  );
  return entry?.modelId ?? 'gpt-4o-mini';
}

/** Resolve which provider to use. Throws if none available. */
function resolveProvider(): ProviderName {
  const active = getActiveProviders();
  if (active.length === 0) {
    throw new Error(
      '[askLLM] No LLM API keys found.\n\n' +
        'Create a .env.local file in packages/yon-benchmarks/ with one or more:\n' +
        '  OPENAI_API_KEY=sk-...\n' +
        '  ANTHROPIC_API_KEY=sk-ant-...\n' +
        '  GOOGLE_GENERATIVE_AI_API_KEY=AIza...\n',
    );
  }
  // Prefer OpenAI if available
  if (active.includes('openai')) return 'openai';
  return active[0]!;
}

/**
 * Strip markdown code fences that LLMs routinely add.
 * Handles ```yon, ```json, ```yaml, ```xml, plain ```, etc.
 */
function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  // Match opening fence: ``` optionally followed by a language tag
  const fenceStart = /^```\w*\s*\n/;
  const fenceEnd = /\n```\s*$/;
  if (fenceStart.test(trimmed) && fenceEnd.test(trimmed)) {
    return trimmed.replace(fenceStart, '').replace(fenceEnd, '').trim();
  }
  return trimmed;
}

/**
 * Compact YON generation guide for benchmark LLM prompts.
 * Derived from the official llm-card.txt in yon-spec, trimmed to
 * only the rules that affect parse validity in benchmark tasks.
 */
export function loadYonGuide(): string {
  return `YON Generation Guide (compact)

CORE RULES:
- Every line is independently parseable. No context from previous lines required.
- First non-comment line MUST be @DOC.
- Output YON records only. No markdown, no fenced code blocks.
- Each record is exactly ONE line.

@DOC HEADER (REQUIRED — first line):
@DOC ver=2.0 | id=<slug> | title="<Human Title>"
Optional: kind=doc, profile=exec, fmt=min

SEPARATOR: Always use SPACE|SPACE between fields.

QUOTING: Bare values if [A-Za-z0-9_./:@+#-]+. Otherwise quote with ".

TYPED KEYS: key:type=value where type is bool, int, float, ts.

CORE TAGS:
@SEC    name="Section Name"
@NOTE   text="Human-readable annotation"
@RULE   lvl=MUST|SHOULD|MAY | when="condition" | then="action"
@MAP    pairs=["key"->"value","key2"->"value2"]
@CFG    key=name | val=value
@STEP   n:int=N | op=operation | desc="description"

BLOCKS (for multi-line/verbatim content):
@BEGIN CODE | mime="text/x-python" | boundary="bnd_py_001"
def hello():
    return "world"
@END CODE | boundary="bnd_py_001"

IMPORTANT: Do NOT put newlines inside quoted string values.
Output must be valid YON v2.0, parseable without an LLM.`;
}

/**
 * Call an LLM with retry and exponential backoff.
 * Provider is auto-resolved from active providers (CLI flag or all available).
 * Automatically strips markdown code fences from the response.
 *
 * @param prompt - The user prompt
 * @param maxTokens - Max response tokens (default 2000)
 * @param systemPrompt - Optional system prompt (e.g. loadYonGuide())
 */
export async function askLLM(prompt: string, maxTokens = 2000, systemPrompt?: string): Promise<string> {
  const provider = resolveProvider();
  const modelId = getModelIdForProvider(provider);
  const model = resolveModel(modelId);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { text, usage } = await generateText({
        model,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        prompt,
        maxOutputTokens: maxTokens,
        temperature: 0,
      });
      if (usage) recordUsage(provider, usage.inputTokens ?? 0, usage.outputTokens ?? 0);
      return stripMarkdownFences(text);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRateLimit =
        msg.includes('429') ||
        msg.includes('Resource exhausted') ||
        msg.includes('rate') ||
        msg.includes('quota');
      const isServerError =
        msg.includes('500') ||
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('529');
      const isRetryable = isRateLimit || isServerError;

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[askLLM] ${provider} rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms: ${msg.slice(0, 120)}`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Non-retryable or exhausted retries
      console.warn(`[askLLM] ${provider} failed after ${attempt + 1} attempts: ${msg.slice(0, 200)}`);
      throw error;
    }
  }

  throw new Error('Unreachable');
}

/**
 * Call ALL active LLM providers and return per-model responses.
 * Uses the model registry from @younndai/ai-relay.
 *
 * Wraps askAllModels and passes the active providers (env key detection).
 *
 * @param prompt - The user prompt
 * @param maxTokens - Max response tokens (default 2000)
 * @param systemPrompt - Optional system prompt
 */
export async function askAllLLMs(
  prompt: string,
  maxTokens = 2000,
  systemPrompt?: string,
): Promise<MultiModelResponse[]> {
  const activeProviders = getActiveProviders() as ProviderName[];
  return askAllModels(prompt, {
    tier: 'standard',
    maxTokens,
    system: systemPrompt,
    availableProviders: activeProviders,
    // temperature omitted — callModel applies provider-aware defaults
    // (Gemini 3 → 1.0, OpenAI/Anthropic → 0)
  });
}

// Re-export for convenience
export type { MultiModelResponse } from '@younndai/ai-relay';

