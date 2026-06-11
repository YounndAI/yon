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
 * YON Runner — Core Types
 *
 * Type definitions for the YON execution engine.
 */

// ---------------------------------------------------------------------------
// Re-export parser types
// ---------------------------------------------------------------------------

export type { YonDocument, YonRecord, YonField, YonValue, YonBlock } from "@younndai/yon-parser";

// ---------------------------------------------------------------------------
// Runner Configuration
// ---------------------------------------------------------------------------

/** Permission action for an op pattern. */
export type PermissionAction = "ALLOW" | "DENY" | "PROMPT";

/** Single entry in the permission allowlist. */
export interface AllowlistEntry {
  /** Op pattern — exact match or glob (e.g., "std:fs.*"). */
  op: string;
  /** Action to take when matched. */
  action: PermissionAction;
  /** Optional condition function for dynamic evaluation. */
  condition?: (ctx: ExecutionContext) => boolean;
}

/** Sandbox configuration. */
export interface SandboxConfig {
  /** Filesystem root — all paths are relative to this. */
  root: string;
  /** Whether network access is allowed (default: false). */
  network?: boolean;
  /** Environment variables visible to ops (default: none). */
  env?: Record<string, string>;
}

/** A resolved tenet extracted from a kind=tenets document. */
export interface ResolvedTenet {
  /** Record ID. */
  rid: string;
  /** Tenet level: L0 (immutable safety), L1 (org policy), L2 (project), L3 (session). */
  level: "L0" | "L1" | "L2" | "L3";
  /** Tenet content / rule text. */
  content: string;
  /** Precedence (higher = stronger). */
  precedence: number;
  /** Decay factor (0 = permanent, 1 = single-use). */
  decay: number;
  /** Source: runtime config or document-embedded. */
  source: "runner" | "document";
}

/** Runner configuration. */
export interface RunnerConfig {
  /** Permission allowlist entries. Default action is DENY (fail-closed). */
  permissions?: AllowlistEntry[];
  /** Sandbox configuration. */
  sandbox?: SandboxConfig;
  /** Default timeout in milliseconds for steps without explicit timeout_ms. */
  defaultTimeout?: number;
  /** PROMPT handler — called when a step requires user confirmation. */
  onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>;
  /** INPUT handler — called when std:handler.ask pauses for text input. */
  onInput?: (question: string) => Promise<string>;
  /** Optional external abort signal for cancellation. Runner Spec §2.4. */
  signal?: AbortSignal;
  /** Path or raw YON text of a kind=tenets document for runner-level tenets. */
  tenets?: string;
  /** Path or raw YON text of a kind=policy document for op permissions. */
  policy?: string;
  /** Tenet check callback. Called before each step. Return false to reject (E109). */
  onTenetCheck?: (
    op: string,
    args: Record<string, unknown>,
    tenets: ResolvedTenet[],
  ) => Promise<boolean>;
  /** Parallel execution policy: "fail-fast" (abort on first error) or "wait-all" (collect all). Default: "fail-fast". */
  parallelPolicy?: "fail-fast" | "wait-all";
  /**
   * URL allowlist for std:http.* ops. Three modes:
   *   - undefined  → unchanged (no URL gating; existing PermissionEngine still applies)
   *   - []         → deny-all (every std:http.* invocation fails fast)
   *   - populated  → match required; non-match throws (caught by executor → RunResult.success=false)
   *
   * String entries are prefix-matched against the request URL; RegExp entries use .test().
   */
  httpAllowlist?: string[] | RegExp[];

  /**
   * Bypass HTTP security defaults (scheme whitelist, private-IP block, credentials stripping).
   * ONLY for trusted-input environments. Emits a one-time stderr warning on runner init when true.
   * @default false
   */
  unsafeHttp?: boolean;
}

// ---------------------------------------------------------------------------
// Execution Context
// ---------------------------------------------------------------------------

/** Execution context passed to op handlers. */
export interface ExecutionContext {
  /** Sandbox root path. */
  sandboxRoot: string;
  /** Environment variables. */
  env: Record<string, string>;
  /** Block registry — read/write block values. */
  blocks: BlockRegistry;
  /** Step arguments parsed from the @STEP record. */
  args: Record<string, unknown>;
  /** Input values resolved from `in=[...]`. */
  inputs: Map<string, unknown>;
  /** Cancellation signal. */
  signal: AbortSignal;
  /** @internal Injected onInput callback from RunnerConfig. */
  __onInput?: (question: string) => Promise<string>;
  /** @internal Injected onPrompt callback from RunnerConfig. */
  __onPrompt?: (op: string, args: Record<string, unknown>) => Promise<boolean>;
  /** @internal Enforces the active sandbox network policy. */
  __checkNetwork?: () => void;
  /** @internal Resolves a path through the active sandbox policy. */
  __resolveSandboxPath?: (path: string) => string;
}

/** Block registry — stores block content and output bindings. */
export interface BlockRegistry {
  /** Get a block value by ID. */
  get(id: string): unknown | undefined;
  /** Set a block value. */
  set(id: string, value: unknown): void;
  /** Check if a block exists. */
  has(id: string): boolean;
  /** Get all block IDs. */
  keys(): string[];
}

// ---------------------------------------------------------------------------
// Op System
// ---------------------------------------------------------------------------

/** Handler function for a single operation. */
export type OpHandler = (
  ctx: ExecutionContext,
  args: Record<string, unknown>,
) => Promise<unknown>;

/** Plugin interface — registers a namespace of ops. */
export interface OpPlugin {
  /** Namespace (e.g., "custom", "myco"). */
  namespace: string;
  /** Map of op names to handlers (e.g., { "fetch": handler }). */
  ops: Record<string, OpHandler>;
  /** Version string (e.g., "v2"). Defaults to "v1" if omitted. */
  version?: string;
}

// ---------------------------------------------------------------------------
// Execution Results
// ---------------------------------------------------------------------------

/** Provenance stamp emitted during execution. */
export interface Stamp {
  /** Event type (e.g., "run:start", "step:complete", "workflow:done"). */
  event: string;
  /** ISO 8601 timestamp. */
  ts: string;
  /** Source identifier (e.g., "runner:yon-runner/\<version\>"). Spec §7.1. */
  src: string;
  /** Step RID if applicable. */
  rid?: string;
  /** Additional metadata. */
  meta?: Record<string, unknown>;
}

/** Result of a single step execution. */
export interface StepResult {
  /** Step RID. */
  rid: string;
  /** Step number. */
  n: number;
  /** Whether the step succeeded. */
  success: boolean;
  /** Output value (stored in block registry). */
  output?: unknown;
  /** Error if the step failed. */
  error?: RunnerError;
  /** Duration in milliseconds. */
  durationMs: number;
}

/** Runner execution result. */
export interface RunResult {
  /** Whether the entire workflow succeeded. */
  success: boolean;
  /** Step results in execution order. */
  steps: StepResult[];
  /** All output blocks. */
  outputs: Map<string, unknown>;
  /** Provenance stamps. */
  stamps: Stamp[];
  /** Errors encountered. */
  errors: RunnerError[];
  /** Total duration in milliseconds. */
  durationMs: number;
}

/** Runner error with spec error code. */
export interface RunnerError {
  /** Error code (E001–E006, E101–E112). See YON v2.0 §9. */
  code: string;
  /** Readable message. */
  message: string;
  /** Severity: fatal (abort), recoverable (continue if handled), warning. */
  severity: "fatal" | "recoverable" | "warning";
  /** Source identifier (e.g., "runner:yon-runner/<version>"). */
  source: string;
  /** Step RID that caused the error, if applicable. */
  rid?: string;
  /** Op that caused the error, if applicable. */
  op?: string;
}

// ---------------------------------------------------------------------------
// Internal Engine Types
// ---------------------------------------------------------------------------

/** Parsed step record for the engine. */
export interface ResolvedStep {
  /** Record ID (rid). */
  rid: string;
  /** Step number. */
  n: number;
  /** Operation identifier (e.g., "std:fs.read@v1"). */
  op: string;
  /** Input references. */
  inputs: string[];
  /** Output bindings. */
  outputs: string[];
  /** Arguments. */
  args: Record<string, unknown>;
  /** Rules references. */
  rules: string[];
  /** Timeout in milliseconds (undefined = use default). */
  timeoutMs?: number;
  /** Use/config references. */
  use: string[];
  /** Whether this step has been voided by @VOID. */
  voided: boolean;
}

/** Dependency graph node. */
export interface DagNode {
  /** Step reference. */
  step: ResolvedStep;
  /** Steps that must complete before this one (inbound edges). */
  dependsOn: string[];
  /** Steps that depend on this one (outbound edges). */
  dependedBy: string[];
}

/** Check record for assertion. */
export interface ResolvedCheck {
  rid: string;
  assert: string;
  fail: "ABORT" | "WARN" | "SKIP";
  msg: string;
  /** Target step RID (if scoped to a step). */
  target?: string;
}

/** Catch record for error recovery. */
export interface ResolvedCatch {
  rid: string;
  target: string;
  fallback: string;
  /** Conditions that trigger the catch (e.g., "timeout|error"). Spec §6.2. */
  on?: string;
}

/** Retry record for re-execution. */
export interface ResolvedRetry {
  rid: string;
  target: string;
  max: number;
  delay?: number;
  /** Backoff strategy: none (fixed), linear, exponential. Spec §6.3. */
  backoff?: "none" | "linear" | "exponential";
}

/** Workflow input contract. Spec §9.4. */
export interface ResolvedInput {
  rid: string;
  /** Input parameter name. */
  name: string;
  /** Value type: "block" | "ref" | "string" | "int" | "float". */
  type?: string;
  /** Whether input is mandatory (default: true). */
  required: boolean;
  /** Reference to @SCHEMA for validation (not enforced in reference runner). */
  schema?: string;
  /** Default value if not provided. */
  default?: string;
}

/** Workflow output contract. Spec §9.5. */
export interface ResolvedOutput {
  rid: string;
  /** Output parameter name. */
  name: string;
  /** Value type. */
  type?: string;
  /** Reference to @SCHEMA for validation. */
  schema?: string;
}

/** Intermediate result declaration. Spec §9.6. */
export interface ResolvedYield {
  rid: string;
  /** Reference to step that produces this yield. */
  step?: string;
  /** Reference to the yielded data. */
  value: string;
  /** Completion estimate (0.0–1.0). */
  progress?: number;
}

/** The Runner interface. */
export interface Runner {
  /** Execute a YON document (text or pre-parsed AST). Batch mode. */
  run(input: string | import("@younndai/yon-parser").YonDocument): Promise<RunResult>;

  /**
   * Execute a YON stream incrementally. Stream mode.
   * Records are parsed per-line via StreamingYonParser. Steps execute as deps satisfy.
   * Multi-doc streams emit doc:start/doc:end boundaries.
   */
  runStream(
    source: AsyncIterable<string>,
    opts?: StreamOpts,
  ): AsyncGenerator<RunnerStreamEvent>;

  /** Register a plugin for custom ops. */
  registerPlugin(plugin: OpPlugin): void;

  /** List all registered op keys (for introspection). */
  listOps(): string[];
}

// ---------------------------------------------------------------------------
// Stream Execution Types
// ---------------------------------------------------------------------------

/** Options for stream execution. */
export interface StreamOpts {
  /** Cancellation signal. On abort: finish in-flight step, yield end with aborted=true. */
  signal?: AbortSignal;
  /** Telemetry hooks for observability. */
  telemetry?: RunnerTelemetry;
}

/** Telemetry hooks for monitoring runner execution. */
export interface RunnerTelemetry {
  /** Called when an op begins execution. */
  onOpStart?(op: string, args: unknown): void;
  /** Called when an op completes successfully. */
  onOpComplete?(op: string, duration: number, result: unknown): void;
  /** Called when an op errors. */
  onOpError?(op: string, error: unknown): void;
  /** Called for every stream event. */
  onStreamEvent?(event: RunnerStreamEvent): void;
}

/** Events emitted by runStream(). */
export type RunnerStreamEvent =
  | { type: "doc:start" }
  | { type: "doc:end"; summary: RunResult }
  | { type: "step:start"; step: StepRecord }
  | { type: "step:complete"; step: StepRecord; output: unknown }
  | { type: "step:error"; step: StepRecord; error: RunnerError }
  | { type: "yield"; value: unknown; progress: number }
  | { type: "stamp"; stamp: Stamp }
  | { type: "record"; record: unknown }
  | { type: "error"; error: RunnerError }
  | { type: "end"; summary: RunResult; aborted?: boolean };

/** Minimal step record for stream events. */
export interface StepRecord {
  rid: string;
  n: number;
  op: string;
}
