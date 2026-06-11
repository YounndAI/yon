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
 * @younndai/ai-relay — Embeddings
 *
 * Generate vector embeddings for text.
 * Uses AI SDK embed() and embedMany() under the hood.
 */

import { embed as aiEmbed, embedMany as aiEmbedMany } from "ai";
import { resolveEmbeddingModel } from "./providers.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmbedOptions {
  /** Text to embed */
  value: string;
  /** Embedding model (default: text-embedding-3-small) */
  model?: string;
}

export interface EmbedResult {
  /** Embedding vector */
  embedding: number[];
  /** Token usage */
  usage: { tokens: number };
}

export interface EmbedManyOptions {
  /** Texts to embed */
  values: string[];
  /** Embedding model (default: text-embedding-3-small) */
  model?: string;
}

export interface EmbedManyResult {
  /** Embedding vectors (one per input value) */
  embeddings: number[][];
  /** Token usage */
  usage: { tokens: number };
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Generate an embedding vector for a single text.
 *
 * @example
 * ```typescript
 * const { embedding } = await embed({ value: "Hello world" });
 * console.log(embedding.length); // 1536
 * ```
 */
export async function embed(options: EmbedOptions): Promise<EmbedResult> {
  const model = resolveEmbeddingModel(options.model);

  const result = await aiEmbed({
    model,
    value: options.value,
  });

  return {
    embedding: result.embedding,
    usage: { tokens: result.usage.tokens },
  };
}

/**
 * Generate embedding vectors for multiple texts in a single call.
 *
 * More efficient than calling embed() in a loop.
 *
 * @example
 * ```typescript
 * const { embeddings } = await embedMany({
 *   values: ["Hello", "World"],
 * });
 * console.log(embeddings.length); // 2
 * ```
 */
export async function embedMany(options: EmbedManyOptions): Promise<EmbedManyResult> {
  const model = resolveEmbeddingModel(options.model);

  const result = await aiEmbedMany({
    model,
    values: options.values,
  });

  return {
    embeddings: result.embeddings,
    usage: { tokens: result.usage.tokens },
  };
}
