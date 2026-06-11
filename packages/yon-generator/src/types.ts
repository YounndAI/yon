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
 * @younndai/yon-generator
 *
 * Builder option types aligned to yon-spec tag-registry.md.
 * Types imported from yon-parser are re-exported
 * so consumers only need one import path.
 */

export type {
  YonProfile,
  YonFormat,
  YonMode,
  YonKind,
  YonDocument,
  YonScenario,
} from '@younndai/yon-parser';

// ─────────────────────────────────────────────────────────────────────────────
// @DOC Governance & Lifecycle (document.md §"Governance and Lifecycle Fields")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional governance and lifecycle fields for the @DOC header.
 * Per document.md: these control document behaviour in enterprise
 * and regulated contexts.
 */
export interface DocGovernanceOptions {
  /** Primary language (BCP 47, e.g., `en`, `fr`, `ja`) */
  lang?: string;
  /** Geographic region (ISO 3166-1, e.g., `US`, `EU`, `JP`) */
  region?: string;
  /** Text direction: `ltr` (default) or `rtl` */
  direction?: string;
  /** Security level: `public`, `internal`, `confidential`, `restricted` */
  classification?: string;
  /** Handling instructions (e.g., `need-to-know`, `encrypt-at-rest`) */
  handling?: string;
  /** Governing legal jurisdiction (e.g., `EU`, `US-CA`, `SG`) */
  jurisdiction?: string;
  /** Where data MUST be stored (e.g., `EU`, `US`) */
  data_residency?: string;
  /** Content is embargoed until this timestamp */
  embargo_until?: string;
  /** Data retention period (e.g., `7y`, `90d`, `indefinite`) */
  retention?: string;
  /** Regulatory basis for retention (e.g., `GDPR Art 5(1)(e)`) */
  retention_authority?: string;
  /** Expiry timestamp. After this, content SHOULD be treated as stale */
  expires?: string;
  /** ID of the parent document (creates a lineage chain) */
  parent?: string;
  /** Intended audience: `public`, `internal`, `partner`, `regulator` */
  audience?: string;
  /** Content license (e.g., `CC-BY-4.0`, `proprietary`) */
  license?: string;
  /** Enable active redaction mode */
  redact?: boolean;
  /** URL to a YON generation guide for self-bootstrapping */
  guide?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Structural Tags
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @STAMP provenance record.
 * Per tag-registry: required `ts`, `src`.
 */
export interface StampOptions {
  /** ISO 8601 timestamp (type: ts) */
  ts: string;
  /** Source identifier */
  src: string;
  /** Optional additional fields */
  source?: string;
  method?: string;
  confidence?: string;
  hash?: string;
  algorithm?: string;
  scope?: string;
  tokens?: string;
  cost?: string;
  model?: string;
  approver?: string;
}

/**
 * Options for a @REF external reference.
 * Per tag-registry: required `name`, optional `url`, `target`.
 */
export interface RefOptions {
  /** Reference name */
  name: string;
  /** External URL */
  url?: string;
  /** Reference target */
  target?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Logic & Constraints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @RULE record.
 * Per tag-registry: required `lvl`, `when`, `then`.
 */
export interface RuleOptions {
  /** Rule level */
  lvl: 'MUST' | 'MUST_NOT' | 'SHOULD' | 'SHOULD_NOT' | 'MAY';
  /** Condition */
  when: string;
  /** Action */
  then: string;
  /** Optional: operation */
  op?: string;
  /** Optional: action */
  action?: string;
  /** Optional: condition */
  condition?: string;
}

/**
 * Options for a @CHECK assertion.
 * Per tag-registry: required `rid`, `assert`, `fail`, `msg`.
 */
export interface CheckOptions {
  /** Check record ID */
  rid: string;
  /** Assertion expression */
  assert: string;
  /** Failure action */
  fail: 'ABORT' | 'WARN' | 'SKIP' | 'HALT';
  /** Failure message (required per spec) */
  msg: string;
}

/**
 * Options for a @CFG configuration block.
 * Per tag-registry: required `id`, optional `set` (freeform).
 */
export interface CfgOptions {
  /** Configuration ID */
  id: string;
  /** Configuration values (freeform key-value) */
  set?: Record<string, string>;
}

/**
 * Options for a @MAP key-value mapping.
 * Per tag-registry: required `name`, `pairs`.
 */
export interface MapOptions {
  /** Map name */
  name: string;
  /** Key-value pairs */
  pairs: Record<string, string>;
  /** Optional map id */
  id?: string;
}

/**
 * Options for a @INTENT declaration.
 * Per tag-registry: required `goal`, optional `audience`.
 */
export interface IntentOptions {
  /** Declared goal */
  goal: string;
  /** Target audience */
  audience?: string;
}

/**
 * Options for a @SCOPE boundary.
 * Per tag-registry: all optional.
 */
export interface ScopeOptions {
  /** Contextual scope */
  context?: string;
  /** Region scope */
  region?: string;
  /** Compliance scope */
  compliance?: string;
}

/**
 * Options for a @SCHEMA validation schema.
 * Per tag-registry: required `key`, optional `opts`, `default`.
 */
export interface SchemaOptions {
  /** Schema key */
  key: string;
  /** Schema options */
  opts?: string;
  /** Default value */
  default?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payload Framing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @BEGIN/@END content block.
 * Per blocks.md: block type is positional after @BEGIN.
 */
export interface BlockOptions {
  /** Block identifier (required if referenced) */
  id?: string;
  /** MIME type of the payload */
  mime?: string;
  /** Termination marker */
  boundary?: string;
  /** Payload size hint in bytes */
  bytes?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a workflow @STEP.
 * Per tag-registry: required `rid`, `n:int`, `op`.
 */
export interface StepOptions {
  /** Step number */
  n: number;
  /** Record ID */
  rid: string;
  /** Operation identifier */
  op: string;
  /** Operation arguments */
  args?: Record<string, unknown>;
  /** Input block references */
  in?: string[];
  /** Output block references */
  out?: string[];
  /** Rule references */
  rules?: string[];
  /** Use references */
  use?: string[];
  /** Timeout in milliseconds (spec: timeout_ms) */
  timeout_ms?: number;
  /** Human-readable note */
  note?: string;
}

/**
 * Options for @INPUT workflow input declaration.
 * Per tag-registry: required `rid`, `name`, optional `type`, `required`, `default`.
 */
export interface InputOptions {
  /** Record ID */
  rid: string;
  /** Input name */
  name: string;
  /** Data type */
  type?: string;
  /** Required flag */
  required?: boolean;
  /** Default value */
  default?: string;
}

/**
 * Options for @OUTPUT workflow output declaration.
 * Per tag-registry: required `rid`, `name`, optional `type`.
 */
export interface OutputOptions {
  /** Record ID */
  rid: string;
  /** Output name */
  name: string;
  /** Data type */
  type?: string;
}

/**
 * Options for a @YIELD intermediate result.
 * Per tag-registry: required `rid`, `value`, optional `step`, `progress`.
 */
export interface YieldOptions {
  /** Record ID */
  rid: string;
  /** Yield value */
  value: string;
  /** Step reference */
  step?: string;
  /** Progress indicator */
  progress?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @CATCH error handler.
 * Per tag-registry: required `target`, `on`, `do`.
 */
export interface CatchOptions {
  /** Target step/record to catch errors from */
  target: string;
  /** Error type/condition to catch */
  on: string;
  /** Action to take */
  do: string;
}

/**
 * Options for a @RETRY policy.
 * Per tag-registry: required `target`, `max`, optional `delay_ms`, `backoff`.
 */
export interface RetryOptions {
  /** Target step/record */
  target: string;
  /** Maximum retry attempts */
  max: number;
  /** Delay in milliseconds */
  delay_ms?: number;
  /** Backoff strategy */
  backoff?: 'linear' | 'exponential' | 'fixed';
}

/**
 * Options for a @ERROR record.
 * Per tag-registry: required `code`, `msg`, optional `severity`, `source`.
 */
export interface ErrorOptions {
  /** Error code */
  code: string;
  /** Error message */
  msg: string;
  /** Severity */
  severity?: string;
  /** Error source */
  source?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Control
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @PATCH record modification.
 * Per tag-registry: required `ts`, `target`, `set`.
 */
export interface PatchOptions {
  /** ISO 8601 timestamp */
  ts: string;
  /** Target record to modify */
  target: string;
  /** Fields to set */
  set: Record<string, string>;
}

/**
 * Options for a @VOID record removal.
 * Per tag-registry: required `ts`, `target`, optional `because`.
 */
export interface VoidOptions {
  /** ISO 8601 timestamp */
  ts: string;
  /** Target record to void */
  target: string;
  /** Reason for voiding */
  because?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialogue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @TURN message envelope.
 * Per tag-registry: required `rid`, `text`, optional `from`, `to`, `role`.
 */
export interface TurnOptions {
  /** Record ID */
  rid: string;
  /** Message text */
  text: string;
  /** Sender */
  from?: string;
  /** Recipient */
  to?: string;
  /** Role (e.g., user, assistant, system) */
  role?: string;
}

/**
 * Options for a @ACK acknowledgment.
 * Per tag-registry: required `ref`, optional `status`, `by`.
 */
export interface AckOptions {
  /** Reference to the acknowledged record */
  ref: string;
  /** Acknowledgment status */
  status?: string;
  /** Acknowledger */
  by?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @SESSION declaration.
 * Per tag-registry: required `rid`, optional `durability`, `ttl_hours`.
 */
export interface SessionOptions {
  /** Record ID */
  rid: string;
  /** Durability level */
  durability?: string;
  /** Time-to-live in hours */
  ttl_hours?: number;
}

/**
 * Options for a @CHECKPOINT record.
 * Per tag-registry: required `rid`, `label`, optional `session`, `includes`.
 */
export interface CheckpointOptions {
  /** Record ID */
  rid: string;
  /** Checkpoint label */
  label: string;
  /** Session reference */
  session?: string;
  /** Included records */
  includes?: string[];
}

/**
 * Options for a @RECOVER record.
 * Per tag-registry: required `rid`, `from`, optional `reason`.
 */
export interface RecoverOptions {
  /** Record ID */
  rid: string;
  /** Checkpoint to recover from */
  from: string;
  /** Recovery reason */
  reason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Privacy & Governance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @REDACTION record.
 * Per tag-registry: required `target`, `reason`, optional `field`, `method`, `start`, `end`.
 */
export interface RedactionOptions {
  /** Target record */
  target: string;
  /** Redaction reason */
  reason: string;
  /** Specific field to redact */
  field?: string;
  /** Redaction method */
  method?: string;
  /** Start position */
  start?: string;
  /** End position */
  end?: string;
}

/**
 * Options for a @CONSENT record.
 * Per tag-registry: required `party`, `scope`.
 */
export interface ConsentOptions {
  /** Consenting party */
  party: string;
  /** Consent scope */
  scope: string;
  /** Whether consent is granted */
  granted?: string;
  /** Consent method */
  method?: string;
  /** Whether consent is revoked */
  revoked?: string;
  /** Revocation reason */
  revoke_reason?: string;
  /** Whether consent is revocable */
  revocable?: string;
  /** Expiry timestamp */
  expires?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cross-Domain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for a @IDENTITY cross-domain actor reference.
 * Per tag-registry: required `rid`, `type`.
 */
export interface IdentityOptions {
  /** Record ID */
  rid: string;
  /** Identity type */
  type: string;
  /** Actor name */
  name?: string;
  /** Email address */
  email?: string;
  /** Organization */
  org?: string;
  /** Role */
  role?: string;
  /** Verified flag */
  verified?: string;
  /** Verification method */
  method?: string;
}

/**
 * Options for a @LOCATION cross-domain spatial reference.
 * Per tag-registry: required `rid`, `type`.
 */
export interface LocationOptions {
  /** Record ID */
  rid: string;
  /** Location type */
  type: string;
  /** Location name */
  name?: string;
  /** Latitude */
  lat?: number | string;
  /** Longitude */
  lon?: number | string;
  /** Jurisdiction */
  jurisdiction?: string;
  /** Country */
  country?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L3 Cognition
// ─────────────────────────────────────────────────────────────────────────────

/** @THOUGHT — unit of reasoning. Feature: cognition. */
export interface ThoughtOptions {
  rid: string;
  type: string;
  content: string;
  parent?: string;
  merges?: string[];
  confidence?: string;
  effort?: string;
  visibility?: string;
}

/** @HYPOTHESIS — testable claim. Feature: cognition. */
export interface HypothesisOptions {
  rid: string;
  claim: string;
  confidence?: string;
  based_on?: string;
  visibility?: string;
}

/** @OBSERVATION — structured note. Feature: cognition. */
export interface ObservationOptions {
  rid: string;
  note: string;
  from?: string;
  visibility?: string;
}

/** @REFLECTION — reconsideration. Feature: cognition. */
export interface ReflectionOptions {
  rid: string;
  revises: string;
  because: string;
  new_confidence?: string;
}

/** @DECISION — committed choice. Feature: cognition. */
export interface DecisionOptions {
  rid: string;
  selected: string;
  alternatives?: string[];
  rationale?: string;
  trace?: string[];
  confidence?: string;
  visibility?: string;
}

/** @PRUNE — abandon reasoning branch. Feature: cognition. */
export interface PruneOptions {
  target: string;
  mode?: string;
  because?: string;
}

/** @INTROSPECT — deliberate self-query. Feature: cognition. */
export interface IntrospectOptions {
  rid: string;
  query: string;
  scope?: string;
  finding?: string;
}

/** @ESSENCE — persistent personality trait. Feature: cognition. */
export interface EssenceOptions {
  rid: string;
  trait: string;
  type: string;
  weight: number;
  affects?: string;
  source?: string;
  visibility?: string;
}

/** @PERCEPT — sensory input. Feature: perception. */
export interface PerceptOptions {
  rid: string;
  type: string;
  src: string;
  confidence?: string;
  labels?: string[];
}

/** @FOCUS — attention direction. Feature: perception. */
export interface FocusOptions {
  targets: string[];
  reason?: string;
  salience?: string;
}

/** @GOAL — objective declaration. Feature: goals. */
export interface GoalOptions {
  rid: string;
  name: string;
  parent?: string;
  status?: string;
  priority?: string;
  deadline?: string;
  version?: string;
  origin?: string;
}

/** @PULSE — raw input signal. Feature: memory. */
export interface PulseOptions {
  rid: string;
  src: string;
  content: string;
  type?: string;
  ts?: string;
}

/** @IMPRINT — validated memory write gate. Feature: memory. */
export interface ImprintOptions {
  rid: string;
  validates: string;
  trust: string;
  confidence?: string;
  scope?: string;
  validators?: string;
}

/** @MEMORY — stored long-term memory. Feature: memory. */
export interface MemoryOptions {
  rid: string;
  type: string;
  content: string;
  trust?: string;
  confidence?: string;
  scope?: string;
  ttl?: string;
  resonance?: string;
  from?: string;
  decay?: string;
  lifecycle?: string;
  version?: string;
  last_access?: string;
  visibility?: string;
}

/** @LEARN — Bayesian belief update. Feature: memory. */
export interface LearnOptions {
  rid: string;
  prior: string;
  evidence: string;
  posterior: string;
}

/** @SHARD — compressed memory fragment. Feature: memory. */
export interface ShardOptions {
  rid: string;
  sources: string[];
  summary: string;
  trust?: string;
  confidence?: string;
  loss_notes?: string;
  compression?: string;
}

/** @MARK — memory bookmark / annotation. Feature: memory. */
export interface MarkOptions {
  rid: string;
  refs: string[];
  title: string;
  tags?: string[];
}

/** @AFFECT — momentary affective state. Feature: affect. */
export interface AffectOptions {
  urgency?: string;
  uncertainty?: string;
  engagement?: string;
  curiosity?: string;
  frustration?: string;
  satisfaction?: string;
  caution?: string;
  visibility?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Signaling
// ─────────────────────────────────────────────────────────────────────────────

/** @AGENT — agent declaration. Feature: signaling. */
export interface AgentOptions {
  rid: string;
  name: string;
  type?: string;
  model?: string;
  caps?: string[];
  personality?: string;
  context_window?: string;
  version?: string;
  streams?: string[];
}

/** @CAPS — capability broadcast. Feature: signaling. */
export interface CapsOptions {
  rid: string;
  agent: string;
  ops: string[];
}

/** @SIGNAL — inter-agent notification. Feature: signaling. */
export interface SignalOptions {
  from: string;
  type: string;
  target?: string;
  msg?: string;
  ts?: string;
}

/** @THROTTLE — backpressure signal. Feature: signaling. */
export interface ThrottleOptions {
  from: string;
  to: string;
  reason?: string;
  recommended_delay_ms?: number;
  rate?: string;
  severity?: string;
}

/** @SUBSCRIBE — stream/topic subscription. Feature: signaling. */
export interface SubscribeOptions {
  agent: string;
  streams?: string[];
  topics?: string[];
  filter?: string;
}

/** @ROUTE — agent group routing strategy. Feature: signaling. */
export interface RouteOptions {
  rid: string;
  group: string;
  strategy: string;
}

/** @MERGE — combine streams. Feature: signaling. */
export interface MergeOptions {
  rid: string;
  streams: string[];
  strategy?: string;
  conflict?: string;
}

/** @STREAM — named data stream. Feature: signaling. */
export interface StreamOptions {
  rid: string;
  owner: string;
  type: string;
  description?: string;
  ttl?: string;
  max_rate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Temporal
// ─────────────────────────────────────────────────────────────────────────────

/** @TIMELINE — temporal context. Feature: temporal. */
export interface TimelineOptions {
  rid: string;
  span: string;
  start?: string;
  granularity?: string;
}

/** @EVENT — discrete occurrence. Feature: temporal. */
export interface EventOptions {
  rid: string;
  timeline: string;
  at: string;
  activity: string;
  duration?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Collaboration
// ─────────────────────────────────────────────────────────────────────────────

/** @WORKSPACE — shared collaboration context. Feature: collaboration. */
export interface WorkspaceOptions {
  rid: string;
  agents: string[];
  artifact: string;
}

/** @EDIT — workspace change. Feature: collaboration. */
export interface EditOptions {
  rid: string;
  workspace: string;
  by: string;
  patch: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Composition
// ─────────────────────────────────────────────────────────────────────────────

/** @CALL — sub-workflow invocation. Feature: composition. */
export interface CallOptions {
  rid: string;
  ref: string;
  args?: string;
  out?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Governance
// ─────────────────────────────────────────────────────────────────────────────

/** @TENET — ethical/safety constraint. Feature: governance. */
export interface TenetOptions {
  rid: string;
  level: string;
  content: string;
  precedence?: string;
  decay?: string;
}

/** @ESCALATE — human-in-the-loop request. Feature: governance. */
export interface EscalateOptions {
  rid: string;
  reason: string;
  severity?: string;
  harm_class?: string;
  timeout_ms?: number;
  fallback?: string;
  requires?: string;
  context?: string;
}

/** @HALT — emergency stop. Feature: governance. */
export interface HaltOptions {
  rid: string;
  scope: string;
  reason: string;
  allow_reads?: string;
  requires_approval_to_resume?: string;
}

/** @DEREGISTER — agent lifecycle exit. Feature: governance. */
export interface DeregisterOptions {
  agent: string;
  reason: string;
  handoff?: string;
  effective?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 Agent — Reactive (Experimental)
// ─────────────────────────────────────────────────────────────────────────────

/** @ON — event-driven trigger. Feature: reactive. */
export interface OnOptions {
  rid: string;
  event: string;
  do: string;
  match?: string;
}

/** @EMIT — dynamic step injection. Feature: reactive. */
export interface EmitOptions {
  event: string;
  payload?: string;
}

/** @LOOP — repeating execution. Feature: reactive. */
export interface LoopOptions {
  rid: string;
  while: string;
  do: string;
  increment?: string;
  max_iterations?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder Result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validation result from builder.validate().
 */
export interface BuilderValidationResult {
  valid: boolean;
  errors: Array<{ message: string; line?: number }>;
}
