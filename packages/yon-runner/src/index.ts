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
 * @younndai/yon-runner
 *
 * YON reference runner — executes YON workflow documents.
 *
 * Public API:
 * - createRunner(config) → Runner
 * - run(input) → RunResult
 * - registerPlugin(plugin) → void
 *
 * @module
 */

import { parse as parseYon } from "@younndai/yon-parser";
import type { YonDocument } from "@younndai/yon-parser";
import { StreamingYonParser } from "@younndai/yon-parser";
import { RUNNER_SOURCE, structuralViolation } from "./errors.js";
import type {
  RunnerConfig,
  RunResult,
  OpPlugin,
  Runner,
  StreamOpts,
  RunnerStreamEvent,
} from "./types.js";
import { validate } from "./engine/validator.js";
import { buildDependencyGraph } from "./engine/resolver.js";
import { plan } from "./engine/planner.js";
import { execute } from "./engine/executor.js";
import { OpRegistry } from "./ops/registry.js";
import { registerFsOps } from "./ops/std-fs.js";
import { registerDataOps } from "./ops/std-data.js";
import { registerControlOps } from "./ops/std-control.js";
import { registerHandlerOps } from "./ops/std-handler.js";
import { registerSysOps } from "./ops/std-sys.js";
import { registerHttpOps } from "./ops/std-http.js";
import { registerWorkflowOps } from "./ops/std-workflow.js";
import { PermissionEngine } from "./permissions.js";
import { Sandbox, createDefaultSandbox } from "./sandbox.js";
import { InMemoryBlockRegistry } from "./state.js";
import { StampCollector } from "./stamps.js";
import { TenetEngine, extractTenets } from "./tenets.js";
import { loadPolicyRules } from "./policy-loader.js";
import { SessionManager } from "./session.js";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new YON runner.
 *
 * @param config Runner configuration (permissions, sandbox, timeout).
 * @returns A Runner instance.
 *
 * @example
 * ```typescript
 * const runner = createRunner({
 *   permissions: [
 *     { op: "std:fs.*", action: "ALLOW" },
 *     { op: "std:data.*", action: "ALLOW" },
 *   ],
 *   sandbox: { root: "./workspace" },
 * });
 *
 * const result = await runner.run(yonText);
 * ```
 */
export function createRunner(config: RunnerConfig = {}): Runner {
  if (config.unsafeHttp === true) {
    console.warn(
      "[yon-runner] WARNING: unsafeHttp=true bypasses HTTP security defaults " +
        "(scheme, private-IP, credentials). Use only with trusted input.",
    );
  }

  // Initialize the op registry with standard ops
  const registry = new OpRegistry();
  registerFsOps((op, handler) => registry.register(op, handler));
  registerDataOps((op, handler) => registry.register(op, handler));
  registerControlOps((op, handler) => registry.register(op, handler));
  registerHandlerOps((op, handler) => registry.register(op, handler));
  registerSysOps((op, handler) => registry.register(op, handler));
  registerHttpOps(
    (op, handler) => registry.register(op, handler),
    config.httpAllowlist,
    config.unsafeHttp === true,
  );
  registerWorkflowOps((op, handler) => registry.register(op, handler));

  // Build the runner
  return {
    async run(input: string | YonDocument): Promise<RunResult> {
      return runWorkflow(input, config, registry);
    },

    async *runStream(
      source: AsyncIterable<string>,
      opts?: StreamOpts,
    ): AsyncGenerator<RunnerStreamEvent> {
      yield* runStreamWorkflow(source, config, registry, opts);
    },

    registerPlugin(plugin: OpPlugin): void {
      registry.registerPlugin(plugin);
    },

    listOps(): string[] {
      return registry.getRegisteredOps();
    },
  };
}

// ---------------------------------------------------------------------------
// Workflow Execution
// ---------------------------------------------------------------------------

async function runWorkflow(
  input: string | YonDocument,
  config: RunnerConfig,
  registry: OpRegistry,
): Promise<RunResult> {
  const startTime = performance.now();
  const stamps = new StampCollector();
  stamps.runStart();

  try {
    // Phase 1: Parse (if string input)
    const doc: YonDocument = typeof input === "string"
      ? parseYon(input)
      : input;

    // Phase 2: Validate
    const validated = validate(doc);

    // Load blocks into the block registry
    const blocks = new InMemoryBlockRegistry();
    for (const [id, content] of validated.blocks) {
      blocks.set(id, content);
    }
    for (const [id, cfg] of validated.configs) {
      blocks.set(id, cfg);
    }

    // §9.4: Validate workflow input contracts
    for (const input of validated.inputs) {
      if (!blocks.has(input.name)) {
        if (input.default !== undefined) {
          blocks.set(input.name, input.default);
        } else if (input.required) {
          const err = structuralViolation(
            `Missing required workflow input: "${input.name}"`,
            input.rid,
          );
          throw new Error(err.message);
        }
      }
    }

    // Phase 3: Resolve (build DAG)
    const graph = buildDependencyGraph(validated.steps);

    // Phase 4: Plan
    const executionPlan = plan(graph, validated.checks);

    // Phase 5: Execute
    const sandbox = config.sandbox
      ? new Sandbox(config.sandbox, config.unsafeHttp === true)
      : createDefaultSandbox();

    const permissions = new PermissionEngine(
      config.permissions,
      config.onPrompt,
    );

    // Load policy file into permissions (if provided)
    if (config.policy) {
      const policyDoc = typeof config.policy === "string"
        ? parseYon(config.policy)
        : config.policy;
      const policyRules = loadPolicyRules(policyDoc.records);
      for (const rule of policyRules) {
        permissions.addEntry(rule);
      }
    }

    // Build TenetEngine (runner-level + document-level tenets)
    let tenetEngine: TenetEngine | undefined;
    if (config.tenets || validated.tenets.length > 0 || config.onTenetCheck) {
      tenetEngine = new TenetEngine(config.onTenetCheck);

      // Load runner-level tenets from config
      if (config.tenets) {
        const tenetsDoc = typeof config.tenets === "string"
          ? parseYon(config.tenets)
          : config.tenets;
        const runnerTenets = extractTenets(tenetsDoc.records, "runner");
        tenetEngine.loadRunnerTenets(runnerTenets);
      }

      // Merge document-level tenets
      if (validated.tenets.length > 0) {
        tenetEngine.mergeDocumentTenets(validated.tenets);
      }
    }

    // Build SessionManager from document @SESSION records (if any)
    let sessionManager: SessionManager | undefined;
    if (validated.sessions.length > 0) {
      sessionManager = new SessionManager();
      sessionManager.create(validated.sessions[0]!);
    }

    const abortController = config.signal
      ? { signal: config.signal }
      : new AbortController();

    const result = await execute({
      plan: executionPlan,
      catches: validated.catches,
      retries: validated.retries,
      blocks,
      permissions,
      sandbox,
      stamps,
      opLookup: (op) => registry.lookup(op),
      defaultTimeout: config.defaultTimeout ?? 30_000,
      signal: abortController.signal,
      onInput: config.onInput,
      onPrompt: config.onPrompt,
      tenetEngine,
      sessionManager,
      parallelPolicy: config.parallelPolicy,
    });

    const durationMs = performance.now() - startTime;
    const success = result.errors.length === 0;

    if (success) {
      stamps.runComplete(durationMs, result.steps.length);
    } else {
      stamps.runFailed(result.errors[0]?.message ?? "Unknown error");
    }

    // §9.5: Verify workflow output contracts (non-fatal)
    for (const output of validated.outputs) {
      if (!blocks.has(output.name)) {
        stamps.outputMissing(output.rid, output.name);
      }
    }

    return {
      success,
      steps: result.steps,
      outputs: blocks.toMap(),
      stamps: stamps.getAll(),
      errors: result.errors,
      durationMs,
    };
  } catch (error) {
    const durationMs = performance.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    stamps.runFailed(message);

    return {
      success: false,
      steps: [],
      outputs: new Map(),
      stamps: stamps.getAll(),
      errors: [{
        code: "E107",
        message: `E107: Runtime error — ${message}`,
        severity: "fatal" as const,
        source: RUNNER_SOURCE,
      }],
      durationMs,
    };
  }
}

// ---------------------------------------------------------------------------
// Stream Execution (Phase 1 — Mode B)
// ---------------------------------------------------------------------------

async function* runStreamWorkflow(
  source: AsyncIterable<string>,
  config: RunnerConfig,
  registry: OpRegistry,
  opts?: StreamOpts,
): AsyncGenerator<RunnerStreamEvent> {
  const signal = opts?.signal;
  const telemetry = opts?.telemetry;
  let docCount = 0;

  function emit(event: RunnerStreamEvent): void {
    telemetry?.onStreamEvent?.(event);
  }

  try {
    // Use StreamingYonParser to parse records incrementally
    // It yields StreamEvent per-record, and accumulates into complete documents
    for await (const streamEvent of StreamingYonParser.from(source, { accumulate: true })) {
      // Check for abort
      if (signal?.aborted) {
        const abortResult: RunResult = {
          success: false,
          steps: [],
          outputs: new Map(),
          stamps: [],
          errors: [{
            code: "E108",
            message: "E108: Stream execution aborted by signal",
            severity: "fatal" as const,
            source: `${RUNNER_SOURCE}/stream`,
          }],
          durationMs: 0,
        };
        const endEvent: RunnerStreamEvent = { type: "end", summary: abortResult, aborted: true };
        emit(endEvent);
        yield endEvent;
        return;
      }

      if (streamEvent.type === "document") {
        // Complete document arrived — run it through the batch pipeline
        docCount++;

        const docStartEvent: RunnerStreamEvent = { type: "doc:start" };
        emit(docStartEvent);
        yield docStartEvent;

        // Execute the document using existing batch pipeline
        const doc = streamEvent.doc;
        const result = await runWorkflow(doc, config, registry);

        // Emit step events from the result
        for (const step of result.steps) {
          const stepRecord = { rid: step.rid, n: step.n, op: "" };

          if (step.success) {
            const completeEvent: RunnerStreamEvent = {
              type: "step:complete",
              step: stepRecord,
              output: step.output,
            };
            emit(completeEvent);
            yield completeEvent;
          } else if (step.error) {
            const errorEvent: RunnerStreamEvent = {
              type: "step:error",
              step: stepRecord,
              error: step.error,
            };
            emit(errorEvent);
            yield errorEvent;
          }
        }

        // Emit stamps
        for (const stamp of result.stamps) {
          const stampEvent: RunnerStreamEvent = { type: "stamp", stamp };
          emit(stampEvent);
          yield stampEvent;
        }

        const docEndEvent: RunnerStreamEvent = { type: "doc:end", summary: result };
        emit(docEndEvent);
        yield docEndEvent;
      } else if (streamEvent.type === "record") {
        // Non-doc record passthrough
        const recordEvent: RunnerStreamEvent = { type: "record", record: streamEvent.record };
        emit(recordEvent);
        yield recordEvent;
      } else if (streamEvent.type === "error") {
        // Parse error
        const errEvent: RunnerStreamEvent = {
          type: "error",
          error: {
            code: "E001",
            message: `E001: Parse error — ${streamEvent.error.message}`,
            severity: "recoverable" as const,
            source: `${RUNNER_SOURCE}/stream`,
          },
        };
        emit(errEvent);
        yield errEvent;
      }
    }

    // Stream ended normally
    const finalResult: RunResult = {
      success: true,
      steps: [],
      outputs: new Map(),
      stamps: [],
      errors: [],
      durationMs: 0,
    };
    const endEvent: RunnerStreamEvent = { type: "end", summary: finalResult };
    emit(endEvent);
    yield endEvent;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errResult: RunResult = {
      success: false,
      steps: [],
      outputs: new Map(),
      stamps: [],
      errors: [{
        code: "E107",
        message: `E107: Stream runtime error — ${message}`,
        severity: "fatal" as const,
        source: `${RUNNER_SOURCE}/stream`,
      }],
      durationMs: 0,
    };
    const endEvent: RunnerStreamEvent = { type: "end", summary: errResult };
    emit(endEvent);
    yield endEvent;
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type {
  RunnerConfig,
  RunResult,
  StepResult,
  Stamp,
  RunnerError,
  OpPlugin,
  OpHandler,
  ExecutionContext,
  BlockRegistry,
  AllowlistEntry,
  PermissionAction,
  SandboxConfig,
  Runner,
  ResolvedTenet,
  StreamOpts,
  RunnerStreamEvent,
  RunnerTelemetry,
  StepRecord,
} from "./types.js";

export { validate } from "./engine/validator.js";
export type { ValidationResult } from "./engine/validator.js";
export { OpRegistry } from "./ops/registry.js";
export { PermissionEngine } from "./permissions.js";
export { Sandbox } from "./sandbox.js";
export { InMemoryBlockRegistry } from "./state.js";
export { StampCollector } from "./stamps.js";
export { ErrorCodes } from "./errors.js";
export type { ErrorCode } from "./errors.js";
export { serializeResult } from "./serializer.js";
export { TenetEngine, extractTenets } from "./tenets.js";
export { loadPolicyRules } from "./policy-loader.js";
export { SessionManager } from "./session.js";
export type { SessionConfig, CheckpointConfig, RecoverConfig, Checkpoint } from "./session.js";

