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
 * @younndai/yon-generator — Standalone Record Emitters
 *
 * Pure functions that emit individual YON records as strings.
 * No state, no document context — just record → string.
 *
 * Usage:
 *   import { record, block, domainRecord } from '@younndai/yon-generator';
 *   const line = record.step({ n: 1, rid: 'read', op: 'fs.read' });
 *   const chunk = block('JSON', '{"key":"value"}', { id: 'config' });
 *   const txn = domainRecord('TXN', { rid: 'txn:1', type: 'wire' });
 */

import {
  formatAttrs, quoteIfNeeded, formatRefList, formatMapPairs,
} from './emitter.js';

import type {
  // Existing L1–L2
  StampOptions, RefOptions, RuleOptions, CheckOptions, CfgOptions,
  MapOptions, IntentOptions, ScopeOptions, SchemaOptions, StepOptions,
  InputOptions, OutputOptions, YieldOptions, CatchOptions, RetryOptions,
  ErrorOptions, BlockOptions,
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
} from './types.js';


// ─────────────────────────────────────────────────────────────────────────────
// Generic emit helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a tag line from a tag name and an options record.
 * Handles list fields (string[]) via formatRefList, numbers via :int/:float
 * suffix, booleans via :bool suffix.
 */
function emitTag(tag: string, opts: object, listFields: string[] = []): string {
  const parts: string[] = [`@${tag}`];

  for (const [k, v] of Object.entries(opts)) {
    if (v === undefined || v === null) continue;

    if (listFields.includes(k) && Array.isArray(v)) {
      parts.push(`${k}=${formatRefList(v as string[])}`);
    } else if (typeof v === 'number') {
      const suffix = Number.isInteger(v) ? ':int' : ':float';
      parts.push(`${k}${suffix}=${v}`);
    } else if (typeof v === 'boolean') {
      parts.push(`${k}:bool=${v}`);
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      // Freeform k=v objects (e.g., @CFG set, @PATCH set, @STEP args)
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        if (sv !== undefined && sv !== null) {
          parts.push(`${sk}=${quoteIfNeeded(String(sv))}`);
        }
      }
    } else {
      parts.push(`${k}=${quoteIfNeeded(String(v))}`);
    }
  }

  return parts.join(' | ');
}


// ─────────────────────────────────────────────────────────────────────────────
// Standalone record namespace — all 72 tags
// ─────────────────────────────────────────────────────────────────────────────

export const record = {

  // ── L1–L2: Structure ─────────────────────────────────────────────────────

  stamp(opts: StampOptions): string {
    const parts: string[] = [
      `@STAMP ts=${quoteIfNeeded(opts.ts)}`,
      `src=${quoteIfNeeded(opts.src)}`,
    ];
    if (opts.source) parts.push(`source=${quoteIfNeeded(opts.source)}`);
    if (opts.method) parts.push(`method=${quoteIfNeeded(opts.method)}`);
    if (opts.confidence) parts.push(`confidence=${quoteIfNeeded(opts.confidence)}`);
    if (opts.hash) parts.push(`hash=${quoteIfNeeded(opts.hash)}`);
    if (opts.algorithm) parts.push(`algorithm=${quoteIfNeeded(opts.algorithm)}`);
    if (opts.scope) parts.push(`scope=${quoteIfNeeded(opts.scope)}`);
    if (opts.tokens) parts.push(`tokens=${quoteIfNeeded(opts.tokens)}`);
    if (opts.cost) parts.push(`cost=${quoteIfNeeded(opts.cost)}`);
    if (opts.model) parts.push(`model=${quoteIfNeeded(opts.model)}`);
    if (opts.approver) parts.push(`approver=${quoteIfNeeded(opts.approver)}`);
    return parts.join(' | ');
  },

  ref(opts: RefOptions): string {
    const parts = [`@REF name=${quoteIfNeeded(opts.name)}`];
    if (opts.url) parts.push(`url=${quoteIfNeeded(opts.url)}`);
    if (opts.target) parts.push(`target=${quoteIfNeeded(opts.target)}`);
    return parts.join(' | ');
  },

  def(alias: string, value: string): string {
    return `@DEF $${alias}=${quoteIfNeeded(value)}`;
  },

  note(text: string, opts?: { lvl?: string }): string {
    const parts = [`@NOTE text="${text}"`];
    if (opts?.lvl) parts.push(`lvl=${quoteIfNeeded(opts.lvl)}`);
    return parts.join(' | ');
  },

  meta(fields: Record<string, string>): string {
    return `@META ${formatAttrs(fields)}`;
  },

  section(name: string, opts?: { id?: string }): string {
    const parts = [`@SEC name="${name}"`];
    if (opts?.id) parts.push(`id=${quoteIfNeeded(opts.id)}`);
    return parts.join(' | ');
  },

  // ── L1–L2: Logic & Constraints ───────────────────────────────────────────

  intent(opts: IntentOptions): string {
    const parts = [`@INTENT goal="${opts.goal}"`];
    if (opts.audience) parts.push(`audience="${opts.audience}"`);
    return parts.join(' | ');
  },

  scope(opts: ScopeOptions): string {
    const parts: string[] = ['@SCOPE'];
    if (opts.context) parts.push(`context="${opts.context}"`);
    if (opts.region) parts.push(`region="${opts.region}"`);
    if (opts.compliance) parts.push(`compliance="${opts.compliance}"`);
    if (parts.length === 1) return '@SCOPE';
    return `${parts[0]} ${parts.slice(1).join(' | ')}`;
  },

  rule(opts: RuleOptions): string {
    const parts = [
      `@RULE lvl=${opts.lvl}`,
      `when="${opts.when}"`,
      `then="${opts.then}"`,
    ];
    if (opts.op) parts.push(`op=${quoteIfNeeded(opts.op)}`);
    if (opts.action) parts.push(`action=${quoteIfNeeded(opts.action)}`);
    if (opts.condition) parts.push(`condition=${quoteIfNeeded(opts.condition)}`);
    return parts.join(' | ');
  },

  schema(opts: SchemaOptions): string {
    const parts = [`@SCHEMA key=${quoteIfNeeded(opts.key)}`];
    if (opts.opts) parts.push(`opts=${quoteIfNeeded(opts.opts)}`);
    if (opts.default) parts.push(`default=${quoteIfNeeded(opts.default)}`);
    return parts.join(' | ');
  },

  cfg(opts: CfgOptions): string {
    const { id, set, ...rest } = opts;
    const parts = [`@CFG id=${quoteIfNeeded(id)}`];
    if (set) {
      for (const [k, v] of Object.entries(set)) {
        parts.push(`${k}=${quoteIfNeeded(v)}`);
      }
    }
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) parts.push(`${k}=${quoteIfNeeded(String(v))}`);
    }
    return parts.join(' | ');
  },

  map(opts: MapOptions): string {
    const parts = [
      `@MAP name=${quoteIfNeeded(opts.name)}`,
      `pairs=${formatMapPairs(opts.pairs)}`,
    ];
    if (opts.id) parts.push(`id=${quoteIfNeeded(opts.id)}`);
    return parts.join(' | ');
  },

  check(opts: CheckOptions): string {
    const parts = [
      `@CHECK rid=${quoteIfNeeded(opts.rid)}`,
      `assert="${opts.assert}"`,
      `fail=${quoteIfNeeded(opts.fail)}`,
      `msg="${opts.msg}"`,
    ];
    return parts.join(' | ');
  },

  // ── L1–L2: Workflow ──────────────────────────────────────────────────────

  step(opts: StepOptions): string {
    const parts: string[] = [
      `@STEP rid=${quoteIfNeeded(opts.rid)}`,
      `n:int=${opts.n}`,
      `op=${quoteIfNeeded(opts.op)}`,
    ];
    if (opts.args) {
      const argParts = Object.entries(opts.args)
        .map(([k, v]) => `${quoteIfNeeded(k)}=${quoteIfNeeded(String(v))}`)
        .join(', ');
      parts.push(`args=[${argParts}]`);
    }
    if (opts.in) parts.push(`in=${formatRefList(opts.in)}`);
    if (opts.out) parts.push(`out=${formatRefList(opts.out)}`);
    if (opts.rules) parts.push(`rules=${formatRefList(opts.rules)}`);
    if (opts.use) parts.push(`use=${formatRefList(opts.use)}`);
    if (opts.timeout_ms !== undefined) parts.push(`timeout_ms=${opts.timeout_ms}`);
    if (opts.note) parts.push(`note="${opts.note}"`);
    return parts.join(' | ');
  },

  input(opts: InputOptions): string {
    const parts = [
      `@INPUT rid=${quoteIfNeeded(opts.rid)}`,
      `name=${quoteIfNeeded(opts.name)}`,
    ];
    if (opts.type) parts.push(`type=${quoteIfNeeded(opts.type)}`);
    if (opts.required !== undefined) parts.push(`required=${opts.required}`);
    if (opts.default) parts.push(`default=${quoteIfNeeded(opts.default)}`);
    return parts.join(' | ');
  },

  output(opts: OutputOptions): string {
    const parts = [
      `@OUTPUT rid=${quoteIfNeeded(opts.rid)}`,
      `name=${quoteIfNeeded(opts.name)}`,
    ];
    if (opts.type) parts.push(`type=${quoteIfNeeded(opts.type)}`);
    return parts.join(' | ');
  },

  yield_(opts: YieldOptions): string {
    const parts = [
      `@YIELD rid=${quoteIfNeeded(opts.rid)}`,
      `value=${quoteIfNeeded(opts.value)}`,
    ];
    if (opts.step) parts.push(`step=${quoteIfNeeded(opts.step)}`);
    if (opts.progress) parts.push(`progress=${quoteIfNeeded(opts.progress)}`);
    return parts.join(' | ');
  },

  // ── L1–L2: Error Handling ────────────────────────────────────────────────

  catch_(opts: CatchOptions): string {
    const parts = [
      `@CATCH target=${quoteIfNeeded(opts.target)}`,
      `on=${quoteIfNeeded(opts.on)}`,
      `do=${quoteIfNeeded(opts.do)}`,
    ];
    return parts.join(' | ');
  },

  retry(opts: RetryOptions): string {
    const parts = [
      `@RETRY target=${quoteIfNeeded(opts.target)}`,
      `max=${opts.max}`,
    ];
    if (opts.delay_ms !== undefined) parts.push(`delay_ms=${opts.delay_ms}`);
    if (opts.backoff) parts.push(`backoff=${opts.backoff}`);
    return parts.join(' | ');
  },

  error(opts: ErrorOptions): string {
    const parts = [
      `@ERROR code=${quoteIfNeeded(opts.code)}`,
      `msg="${opts.msg}"`,
    ];
    if (opts.severity) parts.push(`severity=${quoteIfNeeded(opts.severity)}`);
    if (opts.source) parts.push(`source=${quoteIfNeeded(opts.source)}`);
    return parts.join(' | ');
  },

  // ── L1–L2: Change Control ────────────────────────────────────────────────

  patch(opts: PatchOptions): string {
    const { ts, target, set } = opts;
    const parts = [`@PATCH ts=${quoteIfNeeded(ts)}`, `target=${quoteIfNeeded(target)}`];
    for (const [k, v] of Object.entries(set)) {
      parts.push(`${k}=${quoteIfNeeded(v)}`);
    }
    return parts.join(' | ');
  },

  void_(opts: VoidOptions): string {
    return emitTag('VOID', opts);
  },

  // ── L1–L2: Dialogue ─────────────────────────────────────────────────────

  turn(opts: TurnOptions): string {
    return emitTag('TURN', opts);
  },

  ack(opts: AckOptions): string {
    return emitTag('ACK', opts);
  },

  // ── L1–L2: Sessions ─────────────────────────────────────────────────────

  session(opts: SessionOptions): string {
    return emitTag('SESSION', opts);
  },

  checkpoint(opts: CheckpointOptions): string {
    return emitTag('CHECKPOINT', opts, ['includes']);
  },

  recover(opts: RecoverOptions): string {
    return emitTag('RECOVER', opts);
  },

  // ── L1–L2: Privacy ──────────────────────────────────────────────────────

  redaction(opts: RedactionOptions): string {
    return emitTag('REDACTION', opts);
  },

  consent(opts: ConsentOptions): string {
    return emitTag('CONSENT', opts);
  },

  // ── L1–L2: Cross-Domain ──────────────────────────────────────────────────

  identity(opts: IdentityOptions): string {
    return emitTag('IDENTITY', opts);
  },

  location(opts: LocationOptions): string {
    return emitTag('LOCATION', opts);
  },

  // ── L3 Cognition ─────────────────────────────────────────────────────────

  thought(opts: ThoughtOptions): string {
    return emitTag('THOUGHT', opts, ['merges']);
  },

  hypothesis(opts: HypothesisOptions): string {
    return emitTag('HYPOTHESIS', opts);
  },

  observation(opts: ObservationOptions): string {
    return emitTag('OBSERVATION', opts);
  },

  reflection(opts: ReflectionOptions): string {
    return emitTag('REFLECTION', opts);
  },

  decision(opts: DecisionOptions): string {
    return emitTag('DECISION', opts, ['alternatives', 'trace']);
  },

  prune(opts: PruneOptions): string {
    return emitTag('PRUNE', opts);
  },

  introspect(opts: IntrospectOptions): string {
    return emitTag('INTROSPECT', opts);
  },

  essence(opts: EssenceOptions): string {
    return emitTag('ESSENCE', opts);
  },

  percept(opts: PerceptOptions): string {
    return emitTag('PERCEPT', opts, ['labels']);
  },

  focus(opts: FocusOptions): string {
    return emitTag('FOCUS', opts, ['targets']);
  },

  goal(opts: GoalOptions): string {
    return emitTag('GOAL', opts);
  },

  pulse(opts: PulseOptions): string {
    return emitTag('PULSE', opts);
  },

  imprint(opts: ImprintOptions): string {
    return emitTag('IMPRINT', opts);
  },

  memory(opts: MemoryOptions): string {
    return emitTag('MEMORY', opts);
  },

  learn(opts: LearnOptions): string {
    return emitTag('LEARN', opts);
  },

  shard(opts: ShardOptions): string {
    return emitTag('SHARD', opts, ['sources']);
  },

  mark(opts: MarkOptions): string {
    return emitTag('MARK', opts, ['refs', 'tags']);
  },

  affect(opts: AffectOptions): string {
    return emitTag('AFFECT', opts);
  },

  // ── L4 Agent: Signaling ──────────────────────────────────────────────────

  agent(opts: AgentOptions): string {
    return emitTag('AGENT', opts, ['caps', 'streams']);
  },

  caps(opts: CapsOptions): string {
    return emitTag('CAPS', opts, ['ops']);
  },

  signal(opts: SignalOptions): string {
    return emitTag('SIGNAL', opts);
  },

  throttle(opts: ThrottleOptions): string {
    return emitTag('THROTTLE', opts);
  },

  subscribe(opts: SubscribeOptions): string {
    return emitTag('SUBSCRIBE', opts, ['streams', 'topics']);
  },

  route(opts: RouteOptions): string {
    return emitTag('ROUTE', opts);
  },

  merge(opts: MergeOptions): string {
    return emitTag('MERGE', opts, ['streams']);
  },

  stream(opts: StreamOptions): string {
    return emitTag('STREAM', opts);
  },

  // ── L4 Agent: Temporal ───────────────────────────────────────────────────

  timeline(opts: TimelineOptions): string {
    return emitTag('TIMELINE', opts);
  },

  event(opts: EventOptions): string {
    return emitTag('EVENT', opts);
  },

  // ── L4 Agent: Collaboration ──────────────────────────────────────────────

  workspace(opts: WorkspaceOptions): string {
    return emitTag('WORKSPACE', opts, ['agents']);
  },

  edit(opts: EditOptions): string {
    return emitTag('EDIT', opts);
  },

  // ── L4 Agent: Composition ────────────────────────────────────────────────

  call(opts: CallOptions): string {
    return emitTag('CALL', opts);
  },

  // ── L4 Agent: Governance ─────────────────────────────────────────────────

  tenet(opts: TenetOptions): string {
    return emitTag('TENET', opts);
  },

  escalate(opts: EscalateOptions): string {
    return emitTag('ESCALATE', opts);
  },

  halt(opts: HaltOptions): string {
    return emitTag('HALT', opts);
  },

  deregister(opts: DeregisterOptions): string {
    return emitTag('DEREGISTER', opts);
  },

  // ── L4 Agent: Reactive (Experimental) ────────────────────────────────────

  on_(opts: OnOptions): string {
    return emitTag('ON', opts);
  },

  emit_(opts: EmitOptions): string {
    return emitTag('EMIT', opts);
  },

  loop(opts: LoopOptions): string {
    return emitTag('LOOP', opts);
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// Standalone block emitter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a @BEGIN/@END content block as a multi-line string.
 *
 * @param blockType - Block type tag (e.g., 'JSON', 'CSV', 'LOGS')
 * @param content - Raw payload content
 * @param opts - Optional id, mime, boundary
 */
export function block(blockType: string, content: string, opts?: BlockOptions): string {
  const beginParts = [`@BEGIN ${blockType}`];
  if (opts?.id) beginParts.push(`id=${quoteIfNeeded(opts.id)}`);
  if (opts?.mime) beginParts.push(`mime=${opts.mime}`);
  if (opts?.boundary) beginParts.push(`boundary=${opts.boundary}`);
  if (opts?.bytes !== undefined) beginParts.push(`bytes:int=${opts.bytes}`);

  const endParts = [`@END ${blockType}`];
  if (opts?.boundary) endParts.push(`boundary=${opts.boundary}`);

  const lines = [
    beginParts.join(' | '),
    content,
    endParts.join(' | '),
  ];

  return lines.join('\n');
}


// ─────────────────────────────────────────────────────────────────────────────
// Standalone domain record emitter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a domain-specific record (e.g., @TXN, @POSITION, @PATIENT).
 * Handles type suffixes for numbers and booleans.
 *
 * @param tag - Domain tag name (e.g., 'TXN', 'POSITION')
 * @param fields - Field key-value pairs
 */
export function domainRecord(tag: string, fields: Record<string, string | number | boolean>): string {
  const parts = [`@${tag}`];
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'number') {
      const suffix = Number.isInteger(v) ? ':int' : ':float';
      parts.push(`${k}${suffix}=${v}`);
    } else if (typeof v === 'boolean') {
      parts.push(`${k}:bool=${v}`);
    } else {
      parts.push(`${k}=${quoteIfNeeded(String(v))}`);
    }
  }
  return parts.join(' | ');
}
