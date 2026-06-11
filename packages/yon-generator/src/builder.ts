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
 * Fluent builder for constructing valid YON documents.
 * One builder. Every record. Always valid.
 *
 * All field names match yon-spec tag-registry.md exactly.
 * Validation delegated to @younndai/yon-parser — no duplication.
 */

import {
  parse,
  validate,
  resolveScenario,
} from '@younndai/yon-parser';
import type {
  YonProfile,
  YonFormat,
  YonMode,
  YonKind,
  YonDocument,
} from '@younndai/yon-parser';
import type {
  // Existing L1-L2
  StepOptions, RuleOptions, CheckOptions, CatchOptions, RetryOptions,
  InputOptions, OutputOptions, StampOptions, CfgOptions, RefOptions,
  MapOptions, IntentOptions, ScopeOptions, SchemaOptions, YieldOptions,
  ErrorOptions,
  // @DOC Governance
  DocGovernanceOptions,
  // Change Control
  PatchOptions, VoidOptions,
  // Dialogue
  TurnOptions, AckOptions,
  // Sessions
  SessionOptions, CheckpointOptions, RecoverOptions,
  // Privacy
  RedactionOptions, ConsentOptions,
  // Cross-Domain
  IdentityOptions, LocationOptions,
  // L3 Cognition
  ThoughtOptions, HypothesisOptions, ObservationOptions, ReflectionOptions,
  DecisionOptions, PruneOptions, IntrospectOptions, EssenceOptions,
  PerceptOptions, FocusOptions, GoalOptions,
  PulseOptions, ImprintOptions, MemoryOptions, LearnOptions,
  ShardOptions, MarkOptions, AffectOptions,
  // L4 Agent
  AgentOptions, CapsOptions, SignalOptions, ThrottleOptions,
  SubscribeOptions, RouteOptions, MergeOptions, StreamOptions,
  TimelineOptions, EventOptions,
  WorkspaceOptions, EditOptions, CallOptions,
  TenetOptions, EscalateOptions, HaltOptions, DeregisterOptions,
  OnOptions, EmitOptions, LoopOptions,
  // Shared
  BuilderValidationResult,
} from './types.js';
import { emit, quoteIfNeeded } from './emitter.js';
import type { DocState, LineEntry } from './emitter.js';
import { record as rec } from './records.js';

// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fluent YON document builder.
 *
 * @example
 * ```typescript
 * const doc = yon('workflow')
 *   .id('etl-pipeline')
 *   .title('ETL Pipeline')
 *   .profile('exec')
 *   .step({ n: 1, rid: 'read', op: 'std:fs.read@v1', out: ['block:raw'] })
 *   .toString();
 * ```
 */
export class YonBuilder {
  private _doc: DocState;
  private _lines: LineEntry[] = [];

  constructor(kind: YonKind) {
    this._doc = {
      version: '2.0',
      kind,
      id: '',
      title: '',
      profile: null,
      mode: null,
      fmt: null,
      domain: null,
      scenario: null,
      withFeatures: [],
      withoutFeatures: [],
      // Governance & Lifecycle
      lang: null,
      region: null,
      direction: null,
      classification: null,
      handling: null,
      jurisdiction: null,
      data_residency: null,
      embargo_until: null,
      retention: null,
      retention_authority: null,
      expires: null,
      parent: null,
      audience: null,
      license: null,
      redact: null,
      guide: null,
    };
  }

  // ── Header fields ────────────────────────────────────────────────────────

  /** Set document ID */
  id(value: string): this {
    this._doc.id = value;
    return this;
  }

  /** Set document title */
  title(value: string): this {
    this._doc.title = value;
    return this;
  }

  /** Set validation profile */
  profile(value: YonProfile): this {
    this._doc.profile = value;
    return this;
  }

  /** Set output format */
  fmt(value: YonFormat): this {
    this._doc.fmt = value;
    return this;
  }

  /** Set processing mode */
  mode(value: YonMode): this {
    this._doc.mode = value;
    return this;
  }

  /**
   * Set domain for domain-specific tag validation.
   */
  domain(value: string): this {
    this._doc.domain = value;
    return this;
  }

  /**
   * Add features to enable (emitted as `with=[feat1,feat2]` on @DOC).
   * Per document.md: profile modifiers.
   */
  with(features: string[]): this {
    this._doc.withFeatures.push(...features);
    return this;
  }

  /**
   * Disable features (emitted as `without=[feat1]` on @DOC).
   * Per document.md: profile modifiers.
   */
  without(features: string[]): this {
    this._doc.withoutFeatures.push(...features);
    return this;
  }

  /**
   * Set @DOC governance and lifecycle fields.
   * Per document.md §"Governance and Lifecycle Fields".
   * Accepts a partial object — only provided fields are set.
   */
  governance(opts: DocGovernanceOptions): this {
    if (opts.lang !== undefined) this._doc.lang = opts.lang;
    if (opts.region !== undefined) this._doc.region = opts.region;
    if (opts.direction !== undefined) this._doc.direction = opts.direction;
    if (opts.classification !== undefined) this._doc.classification = opts.classification;
    if (opts.handling !== undefined) this._doc.handling = opts.handling;
    if (opts.jurisdiction !== undefined) this._doc.jurisdiction = opts.jurisdiction;
    if (opts.data_residency !== undefined) this._doc.data_residency = opts.data_residency;
    if (opts.embargo_until !== undefined) this._doc.embargo_until = opts.embargo_until;
    if (opts.retention !== undefined) this._doc.retention = opts.retention;
    if (opts.retention_authority !== undefined) this._doc.retention_authority = opts.retention_authority;
    if (opts.expires !== undefined) this._doc.expires = opts.expires;
    if (opts.parent !== undefined) this._doc.parent = opts.parent;
    if (opts.audience !== undefined) this._doc.audience = opts.audience;
    if (opts.license !== undefined) this._doc.license = opts.license;
    if (opts.redact !== undefined) this._doc.redact = opts.redact;
    if (opts.guide !== undefined) this._doc.guide = opts.guide;
    return this;
  }

  /**
   * Apply a scenario preset.
   * Resolves mode, profile, format, and optional domain from the parser's registry.
   * Explicit field values take precedence over scenario defaults.
   */
  scenario(name: string): this {
    this._doc.scenario = name;

    // Resolve scenario to get defaults
    const resolved = resolveScenario(name, {});

    // Apply scenario defaults only where not explicitly set
    if (!this._doc.mode) this._doc.mode = resolved.mode;
    if (!this._doc.profile) this._doc.profile = resolved.profile;
    if (!this._doc.fmt) this._doc.fmt = resolved.format;
    if (!this._doc.domain && resolved.domain) this._doc.domain = resolved.domain;

    return this;
  }

  // ── Structure ────────────────────────────────────────────────────────────

  /**
   * Add a @SEC section delimiter.
   * Per sections.md: required `name`, optional `id`.
   * Sections are flat — no nesting or parent field.
   */
  section(name: string, opts?: { id?: string }): this {
    this._lines.push({ type: 'section', content: rec.section(name, opts) });
    return this;
  }

  // ── Structural Tags ──────────────────────────────────────────────────────

  /**
   * Add a @STAMP provenance record.
   * Per tag-registry: required `ts`, `src`.
   */
  stamp(opts: StampOptions): this {
    this._lines.push({ type: 'stamp', content: rec.stamp(opts) });
    return this;
  }

  /**
   * Add a @META metadata pair.
   * Per tag-registry: freeform key-value.
   */
  meta(kv: Record<string, string>): this {
    this._lines.push({ type: 'meta', content: rec.meta(kv) });
    return this;
  }

  /**
   * Add a @NOTE annotation.
   * Per tag-registry: required `text`, optional `lvl`.
   */
  note(text: string, opts?: { lvl?: string }): this {
    this._lines.push({ type: 'note', content: rec.note(text, opts) });
    return this;
  }

  /**
   * Add a @REF external reference.
   * Per tag-registry: required `name`, optional `url`, `target`.
   */
  ref(opts: RefOptions): this {
    this._lines.push({ type: 'ref', content: rec.ref(opts) });
    return this;
  }

  /**
   * Add a @DEF alias definition.
   * Per tag-registry: `$alias=value`.
   */
  def(alias: string, value: string): this {
    this._lines.push({ type: 'def', content: rec.def(alias, value) });
    return this;
  }

  // ── Logic & Constraints ──────────────────────────────────────────────────

  /**
   * Add a @INTENT declaration.
   * Per tag-registry: required `goal`, optional `audience`.
   */
  intent(opts: IntentOptions): this {
    this._lines.push({ type: 'intent', content: rec.intent(opts) });
    return this;
  }

  /**
   * Add a @SCOPE boundary.
   * Per tag-registry: all optional.
   */
  scope(opts: ScopeOptions): this {
    this._lines.push({ type: 'scope', content: rec.scope(opts) });
    return this;
  }

  /**
   * Add a @RULE policy rule.
   * Per tag-registry: required `lvl`, `when`, `then`.
   */
  rule(opts: RuleOptions): this {
    this._lines.push({ type: 'rule', content: rec.rule(opts) });
    return this;
  }

  /**
   * Add a @SCHEMA validation schema.
   * Per tag-registry: required `key`, optional `opts`, `default`.
   */
  schema(opts: SchemaOptions): this {
    this._lines.push({ type: 'schema', content: rec.schema(opts) });
    return this;
  }

  /**
   * Add a @CHECK assertion.
   * Per tag-registry: required `rid`, `assert`, `fail`, `msg`.
   */
  check(opts: CheckOptions): this {
    this._lines.push({ type: 'check', content: rec.check(opts) });
    return this;
  }

  /**
   * Add a @CFG configuration block.
   * Per tag-registry: required `id`, optional `set` (freeform).
   */
  cfg(opts: CfgOptions): this {
    this._lines.push({ type: 'cfg', content: rec.cfg(opts) });
    return this;
  }

  /**
   * Add a @MAP key-value mapping.
   * Per tag-registry: required `name`, `pairs`.
   */
  map(opts: MapOptions): this {
    this._lines.push({ type: 'map', content: rec.map(opts) });
    return this;
  }

  // ── Workflow ─────────────────────────────────────────────────────────────

  /**
   * Add a @STEP workflow step.
   * Per tag-registry: required `rid`, `n:int`, `op`.
   */
  step(opts: StepOptions): this {
    this._lines.push({ type: 'step', content: rec.step(opts) });
    return this;
  }

  /**
   * Add an @INPUT workflow input declaration.
   * Per tag-registry: required `rid`, `name`, optional `type`, `required`, `default`.
   */
  input(opts: InputOptions): this {
    this._lines.push({ type: 'input', content: rec.input(opts) });
    return this;
  }

  /**
   * Add an @OUTPUT workflow output declaration.
   * Per tag-registry: required `rid`, `name`, optional `type`.
   */
  output(opts: OutputOptions): this {
    this._lines.push({ type: 'output', content: rec.output(opts) });
    return this;
  }

  /**
   * Add a @YIELD intermediate result.
   * Per tag-registry: required `rid`, `value`, optional `step`, `progress`.
   */
  yield_(opts: YieldOptions): this {
    this._lines.push({ type: 'yield', content: rec.yield_(opts) });
    return this;
  }

  // ── Error Handling ───────────────────────────────────────────────────────

  /**
   * Add a @CATCH error handler.
   * Per tag-registry: required `target`, `on`, `do`.
   */
  catch_(opts: CatchOptions): this {
    this._lines.push({ type: 'catch', content: rec.catch_(opts) });
    return this;
  }

  /**
   * Add a @RETRY policy.
   * Per tag-registry: required `target`, `max`, optional `delay_ms`, `backoff`.
   */
  retry(opts: RetryOptions): this {
    this._lines.push({ type: 'retry', content: rec.retry(opts) });
    return this;
  }

  /**
   * Add a @ERROR record.
   * Per tag-registry: required `code`, `msg`, optional `severity`, `source`.
   */
  error(opts: ErrorOptions): this {
    this._lines.push({ type: 'error', content: rec.error(opts) });
    return this;
  }

  // ── Payload Framing ──────────────────────────────────────────────────────

  /**
   * Add a @BEGIN/@END content block.
   * Per blocks.md: block type tag is REQUIRED after @BEGIN.
   * "Generators MUST always emit the block tag."
   */
  begin(blockType: string, content: string, opts?: { id?: string; mime?: string; boundary?: string; bytes?: number }): this {
    const parts = [`@BEGIN ${blockType}`];
    if (opts?.id) parts.push(`id=${quoteIfNeeded(opts.id)}`);
    if (opts?.mime) parts.push(`mime=${opts.mime}`);
    if (opts?.boundary) parts.push(`boundary=${opts.boundary}`);
    if (opts?.bytes !== undefined) parts.push(`bytes:int=${opts.bytes}`);
    this._lines.push({ type: 'begin', content: parts.join(' | ') });
    // Raw content lines — passthrough
    for (const line of content.split('\n')) {
      this._lines.push({ type: 'raw', content: line });
    }
    const endParts = [`@END ${blockType}`];
    if (opts?.boundary) endParts.push(`boundary=${opts.boundary}`);
    this._lines.push({ type: 'end', content: endParts.join(' | ') });
    return this;
  }

  // ── Domain Records ───────────────────────────────────────────────────────

  /**
   * Add a domain-specific record (e.g., @POSITION, @TXN).
   * Validation happens downstream via parse() → validate() — the parser
   * checks domain field constraints per schema-format.md.
   */
  domainRecord(tag: string, fields: Record<string, string | number | boolean>): this {
    const parts = [`@${tag}`];
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === 'number') {
        // Emit type suffix for numeric values
        const suffix = Number.isInteger(v) ? ':int' : ':float';
        parts.push(`${k}${suffix}=${v}`);
      } else if (typeof v === 'boolean') {
        parts.push(`${k}:bool=${v}`);
      } else {
        parts.push(`${k}=${quoteIfNeeded(String(v))}`);
      }
    }
    this._lines.push({ type: 'domain-record', content: parts.join(' | ') });
    return this;
  }

  // ── Change Control ──────────────────────────────────────────────────────

  /** Add a @PATCH record modification. Per tag-registry: required `ts`, `target`, `set`. */
  patch(opts: PatchOptions): this {
    this._lines.push({ type: 'patch', content: rec.patch(opts) });
    return this;
  }

  /** Add a @VOID record removal. Per tag-registry: required `ts`, `target`. */
  void_(opts: VoidOptions): this {
    this._lines.push({ type: 'void', content: rec.void_(opts) });
    return this;
  }

  // ── Dialogue ────────────────────────────────────────────────────────────

  /** Add a @TURN message envelope. Per tag-registry: required `rid`, `text`. */
  turn(opts: TurnOptions): this {
    this._lines.push({ type: 'turn', content: rec.turn(opts) });
    return this;
  }

  /** Add a @ACK acknowledgment. Per tag-registry: required `ref`. */
  ack(opts: AckOptions): this {
    this._lines.push({ type: 'ack', content: rec.ack(opts) });
    return this;
  }

  // ── Sessions ────────────────────────────────────────────────────────────

  /** Add a @SESSION declaration. Per tag-registry: required `rid`. */
  session(opts: SessionOptions): this {
    this._lines.push({ type: 'session', content: rec.session(opts) });
    return this;
  }

  /** Add a @CHECKPOINT record. Per tag-registry: required `rid`, `label`. */
  checkpoint(opts: CheckpointOptions): this {
    this._lines.push({ type: 'checkpoint', content: rec.checkpoint(opts) });
    return this;
  }

  /** Add a @RECOVER record. Per tag-registry: required `rid`, `from`. */
  recover(opts: RecoverOptions): this {
    this._lines.push({ type: 'recover', content: rec.recover(opts) });
    return this;
  }

  // ── Privacy ─────────────────────────────────────────────────────────────

  /** Add a @REDACTION record. Per tag-registry: required `target`, `reason`. */
  redaction(opts: RedactionOptions): this {
    this._lines.push({ type: 'redaction', content: rec.redaction(opts) });
    return this;
  }

  /** Add a @CONSENT record. Per tag-registry: required `party`, `scope`. */
  consent(opts: ConsentOptions): this {
    this._lines.push({ type: 'consent', content: rec.consent(opts) });
    return this;
  }

  // ── Cross-Domain ────────────────────────────────────────────────────────

  /** Add a @IDENTITY cross-domain actor. Per tag-registry: required `rid`, `type`. */
  identity(opts: IdentityOptions): this {
    this._lines.push({ type: 'identity', content: rec.identity(opts) });
    return this;
  }

  /** Add a @LOCATION spatial reference. Per tag-registry: required `rid`, `type`. */
  location(opts: LocationOptions): this {
    this._lines.push({ type: 'location', content: rec.location(opts) });
    return this;
  }

  // ── L3 Cognition ────────────────────────────────────────────────────────

  /** Add a @THOUGHT reasoning unit. */
  thought(opts: ThoughtOptions): this {
    this._lines.push({ type: 'thought', content: rec.thought(opts) });
    return this;
  }

  /** Add a @HYPOTHESIS testable claim. */
  hypothesis(opts: HypothesisOptions): this {
    this._lines.push({ type: 'hypothesis', content: rec.hypothesis(opts) });
    return this;
  }

  /** Add a @OBSERVATION structured note. */
  observation(opts: ObservationOptions): this {
    this._lines.push({ type: 'observation', content: rec.observation(opts) });
    return this;
  }

  /** Add a @REFLECTION reconsideration. */
  reflection(opts: ReflectionOptions): this {
    this._lines.push({ type: 'reflection', content: rec.reflection(opts) });
    return this;
  }

  /** Add a @DECISION committed choice. */
  decision(opts: DecisionOptions): this {
    this._lines.push({ type: 'decision', content: rec.decision(opts) });
    return this;
  }

  /** Add a @PRUNE — abandon reasoning branch. */
  prune(opts: PruneOptions): this {
    this._lines.push({ type: 'prune', content: rec.prune(opts) });
    return this;
  }

  /** Add a @INTROSPECT self-query. */
  introspect(opts: IntrospectOptions): this {
    this._lines.push({ type: 'introspect', content: rec.introspect(opts) });
    return this;
  }

  /** Add a @ESSENCE persistent personality trait. */
  essence(opts: EssenceOptions): this {
    this._lines.push({ type: 'essence', content: rec.essence(opts) });
    return this;
  }

  /** Add a @PERCEPT sensory input. */
  percept(opts: PerceptOptions): this {
    this._lines.push({ type: 'percept', content: rec.percept(opts) });
    return this;
  }

  /** Add a @FOCUS attention direction. */
  focus(opts: FocusOptions): this {
    this._lines.push({ type: 'focus', content: rec.focus(opts) });
    return this;
  }

  /** Add a @GOAL objective declaration. */
  goal(opts: GoalOptions): this {
    this._lines.push({ type: 'goal', content: rec.goal(opts) });
    return this;
  }

  /** Add a @PULSE raw input signal. */
  pulse(opts: PulseOptions): this {
    this._lines.push({ type: 'pulse', content: rec.pulse(opts) });
    return this;
  }

  /** Add a @IMPRINT validated memory write gate. */
  imprint(opts: ImprintOptions): this {
    this._lines.push({ type: 'imprint', content: rec.imprint(opts) });
    return this;
  }

  /** Add a @MEMORY long-term memory record. */
  memory(opts: MemoryOptions): this {
    this._lines.push({ type: 'memory', content: rec.memory(opts) });
    return this;
  }

  /** Add a @LEARN Bayesian belief update. */
  learn(opts: LearnOptions): this {
    this._lines.push({ type: 'learn', content: rec.learn(opts) });
    return this;
  }

  /** Add a @SHARD compressed memory fragment. */
  shard(opts: ShardOptions): this {
    this._lines.push({ type: 'shard', content: rec.shard(opts) });
    return this;
  }

  /** Add a @MARK memory bookmark. */
  mark(opts: MarkOptions): this {
    this._lines.push({ type: 'mark', content: rec.mark(opts) });
    return this;
  }

  /** Add a @AFFECT momentary affective state. */
  affect(opts: AffectOptions): this {
    this._lines.push({ type: 'affect', content: rec.affect(opts) });
    return this;
  }

  // ── L4 Agent: Signaling ─────────────────────────────────────────────────

  /** Add a @AGENT declaration. */
  agent(opts: AgentOptions): this {
    this._lines.push({ type: 'agent', content: rec.agent(opts) });
    return this;
  }

  /** Add a @CAPS capability broadcast. */
  caps(opts: CapsOptions): this {
    this._lines.push({ type: 'caps', content: rec.caps(opts) });
    return this;
  }

  /** Add a @SIGNAL inter-agent notification. */
  signal(opts: SignalOptions): this {
    this._lines.push({ type: 'signal', content: rec.signal(opts) });
    return this;
  }

  /** Add a @THROTTLE backpressure signal. */
  throttle(opts: ThrottleOptions): this {
    this._lines.push({ type: 'throttle', content: rec.throttle(opts) });
    return this;
  }

  /** Add a @SUBSCRIBE stream subscription. */
  subscribe(opts: SubscribeOptions): this {
    this._lines.push({ type: 'subscribe', content: rec.subscribe(opts) });
    return this;
  }

  /** Add a @ROUTE group routing strategy. */
  route(opts: RouteOptions): this {
    this._lines.push({ type: 'route', content: rec.route(opts) });
    return this;
  }

  /** Add a @MERGE stream combination. */
  merge(opts: MergeOptions): this {
    this._lines.push({ type: 'merge', content: rec.merge(opts) });
    return this;
  }

  /** Add a @STREAM named data stream. */
  stream(opts: StreamOptions): this {
    this._lines.push({ type: 'stream', content: rec.stream(opts) });
    return this;
  }

  // ── L4 Agent: Temporal ──────────────────────────────────────────────────

  /** Add a @TIMELINE temporal context. */
  timeline(opts: TimelineOptions): this {
    this._lines.push({ type: 'timeline', content: rec.timeline(opts) });
    return this;
  }

  /** Add a @EVENT discrete occurrence. */
  event(opts: EventOptions): this {
    this._lines.push({ type: 'event', content: rec.event(opts) });
    return this;
  }

  // ── L4 Agent: Collaboration ─────────────────────────────────────────────

  /** Add a @WORKSPACE shared context. */
  workspace(opts: WorkspaceOptions): this {
    this._lines.push({ type: 'workspace', content: rec.workspace(opts) });
    return this;
  }

  /** Add a @EDIT workspace change. */
  edit(opts: EditOptions): this {
    this._lines.push({ type: 'edit', content: rec.edit(opts) });
    return this;
  }

  // ── L4 Agent: Composition ───────────────────────────────────────────────

  /** Add a @CALL sub-workflow invocation. */
  call(opts: CallOptions): this {
    this._lines.push({ type: 'call', content: rec.call(opts) });
    return this;
  }

  // ── L4 Agent: Governance ────────────────────────────────────────────────

  /** Add a @TENET ethical/safety constraint. */
  tenet(opts: TenetOptions): this {
    this._lines.push({ type: 'tenet', content: rec.tenet(opts) });
    return this;
  }

  /** Add a @ESCALATE human-in-the-loop request. */
  escalate(opts: EscalateOptions): this {
    this._lines.push({ type: 'escalate', content: rec.escalate(opts) });
    return this;
  }

  /** Add a @HALT emergency stop. */
  halt(opts: HaltOptions): this {
    this._lines.push({ type: 'halt', content: rec.halt(opts) });
    return this;
  }

  /** Add a @DEREGISTER agent lifecycle exit. */
  deregister(opts: DeregisterOptions): this {
    this._lines.push({ type: 'deregister', content: rec.deregister(opts) });
    return this;
  }

  // ── L4 Agent: Reactive (Experimental) ───────────────────────────────────

  /** Add a @ON event-driven trigger. */
  on_(opts: OnOptions): this {
    this._lines.push({ type: 'on', content: rec.on_(opts) });
    return this;
  }

  /** Add a @EMIT dynamic step injection. */
  emit_(opts: EmitOptions): this {
    this._lines.push({ type: 'emit', content: rec.emit_(opts) });
    return this;
  }

  /** Add a @LOOP repeating execution. */
  loop(opts: LoopOptions): this {
    this._lines.push({ type: 'loop', content: rec.loop(opts) });
    return this;
  }

  // ── Passthrough ──────────────────────────────────────────────────────────

  /** Add a comment line */
  comment(text: string): this {
    this._lines.push({ type: 'comment', content: `# ${text}` });
    return this;
  }

  /** Add a raw passthrough line */
  raw(line: string): this {
    this._lines.push({ type: 'raw', content: line });
    return this;
  }

  /** Add a blank line */
  blank(): this {
    this._lines.push({ type: 'blank', content: '' });
    return this;
  }

  // ── Output ───────────────────────────────────────────────────────────────

  /**
   * Emit as YON text string.
   */
  toString(): string {
    return emit(this._doc, this._lines);
  }

  /**
   * Parse the emitted YON into a YonDocument AST.
   */
  toDocument(): YonDocument {
    const source = this.toString();
    return parse(source);
  }

  /**
   * Validate the emitted YON via the parser's validator.
   * DRY: parser handles ALL validation — tag allowance, domain constraints,
   * field types, RID uniqueness, lifecycle checks.
   */
  validate(): BuilderValidationResult {
    try {
      const source = this.toString();
      const doc = parse(source);
      const result = validate(doc, { strict: true });

      return {
        valid: result.valid,
        errors: result.errors.map(e => ({ message: e.message, line: e.line })),
      };
    } catch (err: unknown) {
      return {
        valid: false,
        errors: [{ message: err instanceof Error ? err.message : String(err) }],
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new YON document builder.
 *
 * @param kind - Document kind (workflow, rule, spec, note, config, etc.)
 * @returns A fluent builder instance
 *
 * @example
 * ```typescript
 * import { yon } from '@younndai/yon-generator';
 *
 * const doc = yon('workflow')
 *   .id('etl').title('ETL Pipeline')
 *   .profile('exec')
 *   .step({ n: 1, rid: 'read', op: 'std:fs.read@v1' })
 *   .toString();
 * ```
 */
export function yon(kind: YonKind): YonBuilder {
  return new YonBuilder(kind);
}
