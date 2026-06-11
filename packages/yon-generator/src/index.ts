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
 * Fluent TypeScript API for constructing valid YON v2.0 documents.
 * One builder. Every record. Always valid.
 */

// Factory + Builder
export { yon, YonBuilder } from './builder.js';

// Standalone record emitters (modular API)
export { record, block, domainRecord } from './records.js';

// Types — all option interfaces aligned to yon-spec tag-registry.md
export type {
  // Existing L1-L2
  StepOptions, RuleOptions, CheckOptions, CatchOptions, RetryOptions,
  InputOptions, OutputOptions, StampOptions, CfgOptions, RefOptions,
  MapOptions, IntentOptions, ScopeOptions, SchemaOptions, YieldOptions,
  ErrorOptions, BlockOptions,
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

// Re-exported parser types for convenience
export type {
  YonProfile,
  YonFormat,
  YonMode,
  YonKind,
  YonDocument,
  YonScenario,
} from './types.js';
