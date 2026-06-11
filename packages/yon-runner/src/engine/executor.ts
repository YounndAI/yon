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
 * YON Runner — Executor
 *
 * Phase 5: Execute steps sequentially with permission checks,
 * timeout handling, and @CHECK/@CATCH/@RETRY semantics.
 * Implements Runner Spec §2.3, §2.4, §6 (Error Handling).
 */

import type {
  ResolvedStep,
  ResolvedCheck,
  ResolvedCatch,
  ResolvedRetry,
  StepResult,
  RunnerError,
  ExecutionContext,
  OpHandler,
  BlockRegistry,
} from "../types.js";
import type { ExecutionPlan, PlannedStep } from "./planner.js";
import {
  assertionFailed,
  timeoutExceeded,
  runtimeError,
  referenceNotFound,
  opNotImplemented,
  haltReceived,
} from "../errors.js";
import { resolveInputs, bindOutputs } from "../state.js";
import { PermissionEngine } from "../permissions.js";
import type { Sandbox } from "../sandbox.js";
import { StampCollector } from "../stamps.js";
import { isControlFlowResult } from "../ops/std-control.js";
import type { TenetEngine } from "../tenets.js";
import type { SessionManager } from "../session.js";

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------

export interface ExecutorConfig {
  plan: ExecutionPlan;
  catches: ResolvedCatch[];
  retries: ResolvedRetry[];
  blocks: BlockRegistry;
  permissions: PermissionEngine;
  sandbox: Sandbox;
  stamps: StampCollector;
  opLookup: (op: string) => OpHandler | undefined;
  defaultTimeout: number;
  signal: AbortSignal;
  /** Injected from RunnerConfig for std:handler.ask */
  onInput?: (question: string) => Promise<string>;
  /** Injected from RunnerConfig for std:handler.review */
  onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>;
  /** Optional TenetEngine for tenet checks before permission checks. */
  tenetEngine?: TenetEngine;
  /** Optional SessionManager for checkpointing. */
  sessionManager?: SessionManager;
  /** Parallel policy: fail-fast (default) halts on first error, wait-all collects all errors. */
  parallelPolicy?: "fail-fast" | "wait-all";
}

export interface ExecutionResult {
  steps: StepResult[];
  errors: RunnerError[];
}

/**
 * Execute the plan sequentially.
 */
export async function execute(config: ExecutorConfig): Promise<ExecutionResult> {
  const {
    plan,
    catches,
    retries,
    blocks,
    permissions,
    sandbox,
    stamps,
    opLookup,
    defaultTimeout,
    signal,
    onInput,
    onPrompt,
    tenetEngine,
    sessionManager,
    parallelPolicy = "fail-fast",
  } = config;

  const results: StepResult[] = [];
  const errors: RunnerError[] = [];
  const skippedSteps = new Set<string>();

  // Index catches and retries by target
  const catchByTarget = new Map<string, ResolvedCatch>();
  for (const c of catches) {
    catchByTarget.set(c.target, c);
  }

  const retryByTarget = new Map<string, ResolvedRetry>();
  for (const r of retries) {
    retryByTarget.set(r.target, r);
  }

  for (const planned of plan.steps) {
    // §6.2: HALT enforcement — AbortSignal = E108
    if (signal.aborted) {
      const haltError = haltReceived('workflow', 'AbortSignal');
      errors.push(haltError);
      stamps.workflowCancelled();
      break;
    }

    const { step } = planned;

    // Skip if marked by @CHECK SKIP
    if (skippedSteps.has(step.rid)) {
      stamps.stepSkipped(step.rid, "Skipped by check");
      results.push({
        rid: step.rid,
        n: step.n,
        success: true,
        durationMs: 0,
      });
      continue;
    }

    // Evaluate pre-checks
    const checkResult = evaluateChecks(planned.preChecks, blocks, stamps);
    if (checkResult.abort) {
      errors.push(checkResult.error!);
      results.push({
        rid: step.rid,
        n: step.n,
        success: false,
        error: checkResult.error,
        durationMs: 0,
      });
      break; // ABORT halts the workflow
    }
    if (checkResult.skip) {
      skippedSteps.add(step.rid);
      // Also skip steps that depend on this one
      markDependentsAsSkipped(step.rid, plan.steps, skippedSteps);
      stamps.stepSkipped(step.rid, checkResult.error?.message ?? "Check skip");
      results.push({
        rid: step.rid,
        n: step.n,
        success: true,
        durationMs: 0,
      });
      continue;
    }

    // Execute the step (with retry if configured)
    const retryConfig = retryByTarget.get(step.rid);
    const catchConfig = catchByTarget.get(step.rid);
    const maxAttempts = retryConfig ? retryConfig.max + 1 : 1;

    let stepResult: StepResult | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      stepResult = await executeStep(
        step,
        blocks,
        permissions,
        sandbox,
        stamps,
        opLookup,
        defaultTimeout,
        signal,
        onInput,
        onPrompt,
        tenetEngine,
      );

      if (stepResult.success) break;

      // Retry logic — compute backoff delay per §6.3
      if (attempt < maxAttempts && retryConfig) {
        const delay = computeRetryDelay(retryConfig, attempt);
        if (delay > 0) await sleep(delay);
      }
    }

    if (!stepResult) continue;

    // §5: On retry exhaustion, emit formal @ERROR record
    if (!stepResult.success && maxAttempts > 1) {
      stamps.emit("retry:exhausted", step.rid, {
        attempts: maxAttempts,
        errorCode: stepResult.error?.code,
      });
    }

    // Gate Model (§2.5): If step produced a ControlFlowResult, handle skipping
    if (stepResult.success && stepResult.output && isControlFlowResult(stepResult.output)) {
      const gateResult = stepResult.output;

      // Skip un-taken branches and their transitive dependents
      for (const skippedRid of gateResult.skipped) {
        skippedSteps.add(skippedRid);
        markDependentsAsSkipped(skippedRid, plan.steps, skippedSteps);
        stamps.stepSkipped(skippedRid, `Gate: un-taken branch of ${step.rid}`);
      }

      // Validate that the taken branch exists in the plan (§2.5 Rule 3)
      if (gateResult.taken && !plan.steps.some((p) => p.step.rid === gateResult.taken)) {
        errors.push(referenceNotFound(
          `Branch target "${gateResult.taken}" referenced by ${step.rid} not found in plan`,
          step.rid,
        ));
        break;
      }

      // §8 Rule 5: Emit gate:no-match stamp when no case matched
      if ("__noMatch" in gateResult && (gateResult as Record<string, unknown>).__noMatch) {
        stamps.emit("gate:no-match", step.rid);
      }

      // §2.5: Output resolves to the taken branch's output.
      // Empty taken = void (Rule 4/5: no-else or no-match).
      // Non-empty = forward reference resolved when that branch executes.
      stepResult.output = gateResult.taken || null;
    }

    if (!stepResult.success && catchConfig) {
      // N6: Check @CATCH `on` condition — only trigger when error type matches
      const shouldCatch = shouldTriggerCatch(catchConfig, stepResult.error);

      if (shouldCatch) {
        // Execute catch fallback
        stamps.emit("catch:triggered", step.rid, { fallback: catchConfig.fallback });

        // Find the fallback step in the plan
        const fallbackPlanned = plan.steps.find(
          (p) => p.step.rid === catchConfig.fallback,
        );

        if (fallbackPlanned) {
          const fallbackResult = await executeStep(
            fallbackPlanned.step,
            blocks,
            permissions,
            sandbox,
            stamps,
            opLookup,
            defaultTimeout,
            signal,
            onInput,
            onPrompt,
          );
          results.push(fallbackResult);
          if (!fallbackResult.success) {
            errors.push(fallbackResult.error!);
          }
          // Mark fallback as executed so the normal loop doesn't re-run it
          skippedSteps.add(catchConfig.fallback);
          // Skip the original failed result in favor of fallback
          continue;
        } else {
          // F11: Fallback step not found — emit E004
          errors.push(referenceNotFound(`@CATCH fallback "${catchConfig.fallback}" not found in plan`, step.rid));
        }
      }
    }

    results.push(stepResult);
    if (!stepResult.success) {
      errors.push(stepResult.error!);
      if (parallelPolicy === "fail-fast") {
        break; // fail-fast: halt on first unhandled error
      }
      // wait-all: continue executing remaining steps, collect errors
    } else if (sessionManager?.isActive()) {
      // Checkpoint after each successful step
      sessionManager.checkpoint(
        { rid: step.rid, label: step.rid },
        blocks,
        results,
      );
    }
  }

  return { steps: results, errors };
}

// ---------------------------------------------------------------------------
// Step Execution
// ---------------------------------------------------------------------------

async function executeStep(
  step: ResolvedStep,
  blocks: BlockRegistry,
  permissions: PermissionEngine,
  sandbox: Sandbox,
  stamps: StampCollector,
  opLookup: (op: string) => OpHandler | undefined,
  defaultTimeout: number,
  signal: AbortSignal,
  onInput?: (question: string) => Promise<string>,
  onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>,
  tenetEngine?: TenetEngine,
): Promise<StepResult> {
  const startTime = performance.now();
  stamps.stepStart(step.rid, step.op);

  try {
    // 0. Tenet check (before permission — spec §8 enforcement order)
    if (tenetEngine) {
      const tenetError = await tenetEngine.check(step.rid, step.op, step.args);
      if (tenetError) {
        throw tenetError;
      }
    }

    // 1. Permission check
    const ctx: ExecutionContext = {
      sandboxRoot: sandbox.root,
      env: sandbox.env,
      blocks,
      args: step.args,
      inputs: new Map(),
      signal,
      __onInput: onInput,
      __onPrompt: onPrompt,
      __checkNetwork: () => sandbox.checkNetwork(step.rid),
      __resolveSandboxPath: (path) => sandbox.resolvePath(path, step.rid),
    };

    await permissions.check(step.op, ctx, step.rid);

    // 2. Resolve inputs
    ctx.inputs = await resolveInputs(step.inputs, blocks, step.rid, sandbox);

    // 3. Look up the op handler
    const handler = opLookup(step.op);
    if (!handler) {
      throw opNotImplemented(step.rid, step.op);
    }

    // 4. Execute with timeout
    const timeout = step.timeoutMs ?? defaultTimeout;
    const output = await executeWithTimeout(
      () => handler(ctx, step.args),
      timeout,
      step.rid,
      step.op,
    );

    // 5. Bind outputs
    bindOutputs(step.outputs, output, blocks);

    const durationMs = performance.now() - startTime;
    stamps.stepComplete(step.rid, durationMs);

    return {
      rid: step.rid,
      n: step.n,
      success: true,
      output,
      durationMs,
    };
  } catch (error) {
    const durationMs = performance.now() - startTime;
    const runnerError = isRunnerError(error)
      ? error
      : runtimeError(step.rid, step.op, String(error));

    stamps.stepFailed(step.rid, runnerError.code, runnerError.message);

    return {
      rid: step.rid,
      n: step.n,
      success: false,
      error: runnerError,
      durationMs,
    };
  }
}

// ---------------------------------------------------------------------------
// Timeout Handling (§2.4)
// ---------------------------------------------------------------------------

async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  rid: string,
  op: string,
): Promise<T> {
  // timeout_ms=0 means no timeout
  if (timeoutMs === 0) return fn();

  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(timeoutExceeded(rid, op, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// ---------------------------------------------------------------------------
// Check Evaluation (§6.1)
// ---------------------------------------------------------------------------

interface CheckResult {
  abort: boolean;
  skip: boolean;
  error?: RunnerError;
}

function evaluateChecks(
  checks: ResolvedCheck[],
  blocks: BlockRegistry,
  stamps: StampCollector,
): CheckResult {
  for (const check of checks) {
    const passed = evaluateAssert(check.assert, blocks);

    if (passed) {
      stamps.checkPassed(check.rid);
      continue;
    }

    stamps.checkFailed(check.rid, check.fail);

    switch (check.fail) {
      case "ABORT":
        return {
          abort: true,
          skip: false,
          error: assertionFailed(check.rid, check.assert, check.msg),
        };
      case "SKIP":
        return {
          abort: false,
          skip: true,
          error: assertionFailed(check.rid, check.assert, check.msg),
        };
      case "WARN":
        // Log and continue
        continue;
    }
  }

  return { abort: false, skip: false };
}

/**
 * Evaluate an assert expression (§6.1.1).
 *
 * Spec-defined operators: == null, != null, == literal, != literal
 * Extension (§6.1.1 MAY): >, <, >=, <= for numeric comparisons
 * Extension: bare-reference truthiness check
 */
export function evaluateAssert(expr: string, blocks: BlockRegistry): boolean {
  const trimmed = expr.trim();

  // Literal booleans
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Comparison expressions
  const operators = ["!=", "==", ">=", "<=", ">", "<"] as const;

  for (const op of operators) {
    const idx = trimmed.indexOf(` ${op} `);
    if (idx === -1) continue;

    const left = trimmed.slice(0, idx).trim();
    const right = trimmed.slice(idx + op.length + 2).trim();

    const leftValue = resolveAssertValue(left, blocks);
    const rightValue = resolveAssertValue(right, blocks);

    // Normalize: treat undefined as null for spec-correct equality
    const lv = leftValue === undefined ? null : leftValue;
    const rv = rightValue === undefined ? null : rightValue;

    switch (op) {
      case "==": return lv === rv;
      case "!=": return lv !== rv;
      case ">": return Number(leftValue) > Number(rightValue);
      case "<": return Number(leftValue) < Number(rightValue);
      case ">=": return Number(leftValue) >= Number(rightValue);
      case "<=": return Number(leftValue) <= Number(rightValue);
    }
  }

  // Bare reference — truthy check
  const value = resolveAssertValue(trimmed, blocks);
  return value != null && value !== false && value !== 0 && value !== "";
}

function resolveAssertValue(token: string, blocks: BlockRegistry): unknown {
  if (token === "null") return null;
  if (token === "true") return true;
  if (token === "false") return false;

  // Quoted string
  if (token.startsWith('"') && token.endsWith('"')) {
    return token.slice(1, -1);
  }

  // Number
  const num = Number(token);
  if (!isNaN(num) && token !== "") return num;

  // Block/ref reference
  if (token.startsWith("block:")) return blocks.get(token.slice(6));
  if (token.startsWith("ref:")) return blocks.get(token.slice(4));

  // Bare name — try as block reference
  return blocks.get(token);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function markDependentsAsSkipped(
  rid: string,
  steps: PlannedStep[],
  skipped: Set<string>,
): void {
  // Simple: skip any step whose inputs reference outputs of the skipped step
  const skippedStep = steps.find((p) => p.step.rid === rid)?.step;
  if (!skippedStep) return;

  const skippedOutputs = new Set(skippedStep.outputs);
  for (const planned of steps) {
    if (planned.step.inputs.some((inp) => skippedOutputs.has(inp))) {
      skipped.add(planned.step.rid);
      // Recursively skip dependents
      markDependentsAsSkipped(planned.step.rid, steps, skipped);
    }
  }
}

/**
 * Check if a @CATCH record should trigger for a given error.
 *
 * If `on` is undefined/empty, catch triggers for ANY error.
 * Otherwise `on` is a pipe-separated list of conditions:
 * - "timeout"    → E002
 * - "permission" → E003
 * - "error"      → any error
 * - "E002"       → exact error code match
 */
function shouldTriggerCatch(
  catchConfig: ResolvedCatch,
  error?: RunnerError,
): boolean {
  if (!error) return false;
  if (!catchConfig.on) return true; // No condition = catch-all

  const conditions = catchConfig.on.split("|").map((c) => c.trim().toLowerCase());

  for (const cond of conditions) {
    if (cond === "error") return true; // Matches any error
    if (cond === "timeout" && error.code === "E002") return true;
    if (cond === "permission" && error.code === "E003") return true;
    if (cond.toUpperCase() === error.code) return true; // Exact code match
  }

  return false;
}

function isRunnerError(error: unknown): error is RunnerError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Compute retry delay per §6.3 backoff strategy.
 *
 * - none:        fixed delay
 * - linear:      delay_ms * attempt
 * - exponential: delay_ms * 2^attempt
 */
function computeRetryDelay(config: ResolvedRetry, attempt: number): number {
  const base = config.delay ?? 0;
  if (base === 0) return 0;

  switch (config.backoff) {
    case "linear":
      return base * attempt;
    case "exponential":
      return base * Math.pow(2, attempt);
    case "none":
    default:
      return base;
  }
}
