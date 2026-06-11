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
 * YON Runner — Handler Interaction Ops (std:handler.*)
 *
 * Implements YSL §6 (Handler Interaction).
 * - `std:handler.notify` — SAFE (non-blocking toast/log)
 * - `std:handler.ask`    — GATE (pause and wait for text input)
 * - `std:handler.review` — GATE (pause and wait for approval)
 */

import type { OpHandler, ExecutionContext } from "../types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the onInput callback from the runner config injected into context. */
function getOnInput(ctx: ExecutionContext): ((question: string) => Promise<string>) | undefined {
  return ctx.__onInput;
}

/** Resolve the onPrompt callback from the runner config injected into context. */
function getOnPrompt(ctx: ExecutionContext): ((op: string, args: Record<string, unknown>) => Promise<boolean>) | undefined {
  return ctx.__onPrompt;
}

// ---------------------------------------------------------------------------
// Ops
// ---------------------------------------------------------------------------

/** std:handler.notify@v1 — Show a non-blocking notification. */
const handlerNotify: OpHandler = async (ctx) => {
  const msg = String(ctx.args["msg"] ?? "");
  const level = String(ctx.args["level"] ?? "info");

  if (level === "warn") {
    console.warn(`[YON] ${msg}`);
  } else {
    console.info(`[YON] ${msg}`);
  }

  // void return per YSL §6
  return undefined;
};

/**
 * std:handler.ask@v1 — Pause workflow and wait for text input.
 *
 * Invokes the `onInput` callback from RunnerConfig.
 * If no callback is provided, returns undefined (non-blocking fallback).
 */
const handlerAsk: OpHandler = async (ctx) => {
  const question = String(ctx.args["question"] ?? "");
  const onInput = getOnInput(ctx);

  if (!onInput) {
    // Non-blocking fallback: no callback registered
    return undefined;
  }

  return await onInput(question);
};

/**
 * std:handler.review@v1 — Request approval for a specific artifact.
 *
 * Invokes the `onPrompt` callback from RunnerConfig.
 * Returns true (approved) or false (rejected).
 * If no callback is provided, throws instead of auto-approving.
 */
const handlerReview: OpHandler = async (ctx) => {
  const onPrompt = getOnPrompt(ctx);

  if (!onPrompt) {
    throw new Error(
      "std:handler.review requires RunnerConfig.onPrompt; refusing to auto-approve",
    );
  }

  return await onPrompt("std:handler.review", ctx.args);
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerHandlerOps(
  register: (op: string, handler: OpHandler) => void,
): void {
  register("std:handler.notify@v1", handlerNotify);
  register("std:handler.ask@v1", handlerAsk);
  register("std:handler.review@v1", handlerReview);
}
