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
 * YON Runner — Validator
 *
 * Phase 2: Validate structural rules, resolve @PATCH/@VOID,
 * and enforce profile/feature constraints.
 * Implements Runner Spec §2.1.1 and §2.1.2.
 */

import type { YonDocument, YonRecord, YonValue } from "@younndai/yon-parser";
import { PROFILE_PRESETS } from "@younndai/yon-parser";
import type { YonProfile, YonFeature } from "@younndai/yon-parser";
import type {
  ResolvedStep,
  ResolvedCheck,
  ResolvedCatch,
  ResolvedRetry,
  ResolvedInput,
  ResolvedOutput,
  ResolvedYield,
  ResolvedTenet,
} from "../types.js";
import { structuralViolation } from "../errors.js";
import type { SessionConfig, CheckpointConfig, RecoverConfig } from "../session.js";

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

export interface ValidationResult {
  steps: ResolvedStep[];
  checks: ResolvedCheck[];
  catches: ResolvedCatch[];
  retries: ResolvedRetry[];
  inputs: ResolvedInput[];
  outputs: ResolvedOutput[];
  yields: ResolvedYield[];
  tenets: ResolvedTenet[];
  sessions: SessionConfig[];
  checkpoints: CheckpointConfig[];
  recoveries: RecoverConfig[];
  blocks: Map<string, string>; // block id → content
  configs: Map<string, Record<string, unknown>>; // cfg id → config
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

export function validate(doc: YonDocument): ValidationResult {
  const steps: ResolvedStep[] = [];
  const checks: ResolvedCheck[] = [];
  const catches: ResolvedCatch[] = [];
  const retries: ResolvedRetry[] = [];
  const inputs: ResolvedInput[] = [];
  const outputs: ResolvedOutput[] = [];
  const yields: ResolvedYield[] = [];
  const tenets: ResolvedTenet[] = [];
  const sessions: SessionConfig[] = [];
  const checkpoints: CheckpointConfig[] = [];
  const recoveries: RecoverConfig[] = [];
  const blocks = new Map<string, string>();
  const configs = new Map<string, Record<string, unknown>>();
  const voids = new Set<string>();
  const patches = new Map<string, Partial<ResolvedStep>>();

  // Load blocks from the document's block map (YonDocument.blocks)
  for (const [id, block] of doc.blocks) {
    blocks.set(id, block.content);
  }

  // §2.1.1: Compute effective feature set and enforce constraints
  const features = computeEffectiveFeatures(doc);

  // Process records
  for (const record of doc.records) {
    const tag = record.tag?.toUpperCase();

    switch (tag) {
      case "STEP":
        steps.push(extractStep(record));
        break;
      case "CHECK":
        checks.push(extractCheck(record));
        break;
      case "CATCH":
        catches.push(extractCatch(record));
        break;
      case "RETRY":
        retries.push(extractRetry(record));
        break;
      case "CFG":
        collectConfig(record, configs);
        break;
      case "VOID":
        collectVoid(record, voids);
        break;
      case "PATCH":
        collectPatch(record, patches);
        break;
      case "INPUT":
        inputs.push(extractInput(record));
        break;
      case "OUTPUT":
        outputs.push(extractOutput(record));
        break;
      case "YIELD":
        yields.push(extractYield(record));
        break;
      case "TENET":
        tenets.push(extractTenet(record));
        break;
      case "SESSION":
        sessions.push(extractSession(record));
        break;
      case "CHECKPOINT":
        checkpoints.push(extractCheckpoint(record));
        break;
      case "RECOVER":
        recoveries.push(extractRecover(record));
        break;
      // Other record types (DOC, META, SEC, NOTE, etc.) are ignored by the runner
    }
  }

  // §2.1.1: If workflow feature is not enabled, workflow records are forbidden
  if (!features.has("workflow")) {
    const profile = doc.profile ?? "core";
    if (steps.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${steps.length} @STEP record(s) found`,
      );
    }
    if (catches.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${catches.length} @CATCH record(s) found`,
      );
    }
    if (retries.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${retries.length} @RETRY record(s) found`,
      );
    }
    if (inputs.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${inputs.length} @INPUT record(s) found`,
      );
    }
    if (outputs.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${outputs.length} @OUTPUT record(s) found`,
      );
    }
    if (yields.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "workflow" feature, but ${yields.length} @YIELD record(s) found`,
      );
    }
  }

  // §2.1.1: If sessions feature is not enabled, session records are forbidden
  if (!features.has("sessions")) {
    const profile = doc.profile ?? "core";
    if (sessions.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "sessions" feature, but ${sessions.length} @SESSION record(s) found`,
      );
    }
    if (checkpoints.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "sessions" feature, but ${checkpoints.length} @CHECKPOINT record(s) found`,
      );
    }
    if (recoveries.length > 0) {
      throw structuralViolation(
        `Document profile "${profile}" does not enable the "sessions" feature, but ${recoveries.length} @RECOVER record(s) found`,
      );
    }
  }

  // Apply @VOID records (§2.1.2)
  const effectiveSteps = steps.map((step) => ({
    ...step,
    voided: voids.has(step.rid),
  }));

  // Apply @PATCH records (§2.1.2)
  for (const [targetRid, patch] of patches) {
    const step = effectiveSteps.find((s) => s.rid === targetRid);
    if (step && !step.voided) {
      Object.assign(step, patch, { rid: step.rid }); // Never patch the RID itself
    }
  }

  // Validate structural constraints
  validateStructure(effectiveSteps);

  // Filter out voided steps
  const activeSteps = effectiveSteps.filter((s) => !s.voided);

  return {
    steps: activeSteps,
    checks,
    catches,
    retries,
    inputs,
    outputs,
    yields,
    tenets,
    sessions,
    checkpoints,
    recoveries,
    blocks,
    configs,
  };
}

// ---------------------------------------------------------------------------
// Record Extractors (operate on Map<string, YonValue>)
// ---------------------------------------------------------------------------

function extractStep(record: YonRecord): ResolvedStep {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const n = fieldInt(f, "n", rid);
  const op = fieldStr(f, "op");

  if (!rid) throw structuralViolation("@STEP missing rid", rid);
  if (!op) throw structuralViolation("@STEP missing op", rid);

  return {
    rid,
    n,
    op,
    inputs: fieldArray(f, "in"),
    outputs: fieldArray(f, "out"),
    args: fieldArgs(f, "args"),
    rules: fieldArray(f, "rules"),
    timeoutMs: f.has("timeout_ms") ? fieldInt(f, "timeout_ms", rid) : undefined,
    use: fieldArray(f, "use"),
    voided: false,
  };
}

function extractCheck(record: YonRecord): ResolvedCheck {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const assert = fieldStr(f, "assert");
  const failStr = fieldStr(f, "fail").toUpperCase() || "ABORT";
  const fail = (failStr === "WARN" ? "WARN" : failStr === "SKIP" ? "SKIP" : "ABORT") as "ABORT" | "WARN" | "SKIP";
  const msg = fieldStr(f, "msg") || `Check ${rid} failed`;
  const rawTarget = fieldStr(f, "target");

  return { rid, assert, fail, msg, target: rawTarget ? resolveStepTarget(rawTarget) : undefined };
}

function extractCatch(record: YonRecord): ResolvedCatch {
  const f = record.fields;
  return {
    rid: fieldStr(f, "rid"),
    target: resolveStepTarget(fieldStr(f, "target")),
    fallback: resolveStepTarget(fieldStr(f, "do")),
    on: fieldStr(f, "on") || undefined,
  };
}

function extractRetry(record: YonRecord): ResolvedRetry {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const backoffStr = fieldStr(f, "backoff");
  const backoff = (backoffStr === "linear" || backoffStr === "exponential") ? backoffStr : "none";
  return {
    rid,
    target: resolveStepTarget(fieldStr(f, "target")),
    max: fieldInt(f, "max", rid),
    delay: f.has("delay_ms") ? fieldInt(f, "delay_ms", rid) : undefined,
    backoff,
  };
}

/**
 * Normalize a step target reference to a bare rid.
 *
 * The spec (§9.3) uses `rid:step:X` form in examples, but internally
 * the executor indexes by bare rid. This helper strips common prefixes:
 *   - "rid:step:X" → "X"    (spec §9.3 normative)
 *   - "step:X"     → "X"    (shorthand)
 *   - "X"          → "X"    (bare rid, integration test style)
 */
function resolveStepTarget(raw: string): string {
  if (raw.startsWith("rid:step:")) return raw.slice(9);
  if (raw.startsWith("step:")) return raw.slice(5);
  return raw;
}

function extractInput(record: YonRecord): ResolvedInput {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const name = fieldStr(f, "name");
  if (!name) throw structuralViolation("@INPUT missing name", rid);

  // Per spec §9.4: required defaults to true
  const requiredStr = fieldStr(f, "required").toLowerCase();
  const required = requiredStr !== "false";

  return {
    rid,
    name,
    type: fieldStr(f, "type") || undefined,
    required,
    schema: fieldStr(f, "schema") || undefined,
    default: fieldStr(f, "default") || undefined,
  };
}

function extractOutput(record: YonRecord): ResolvedOutput {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const name = fieldStr(f, "name");
  if (!name) throw structuralViolation("@OUTPUT missing name", rid);

  return {
    rid,
    name,
    type: fieldStr(f, "type") || undefined,
    schema: fieldStr(f, "schema") || undefined,
  };
}

function extractYield(record: YonRecord): ResolvedYield {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const value = fieldStr(f, "value");
  if (!value) throw structuralViolation("@YIELD missing value", rid);

  const progressStr = fieldStr(f, "progress");
  const progress = progressStr ? parseFloat(progressStr) : undefined;

  return {
    rid,
    step: fieldStr(f, "step") || undefined,
    value,
    progress: progress !== undefined && !isNaN(progress) ? progress : undefined,
  };
}

// ---------------------------------------------------------------------------
// Collectors
// ---------------------------------------------------------------------------

function collectConfig(record: YonRecord, configs: Map<string, Record<string, unknown>>): void {
  const f = record.fields;
  const id = fieldStr(f, "id");
  if (id) {
    const config: Record<string, unknown> = {};
    for (const [key, value] of f) {
      if (key !== "id") config[key] = valueToUnknown(value);
    }
    configs.set(id, config);
  }
}

function collectVoid(record: YonRecord, voids: Set<string>): void {
  const target = resolveStepTarget(fieldStr(record.fields, "target"));
  if (target) voids.add(target);
}

function collectPatch(record: YonRecord, patches: Map<string, Partial<ResolvedStep>>): void {
  const f = record.fields;
  const target = resolveStepTarget(fieldStr(f, "target"));
  if (!target) return;

  const patch: Partial<ResolvedStep> = {};
  if (f.has("op")) patch.op = fieldStr(f, "op");
  if (f.has("args")) patch.args = fieldArgs(f, "args");
  if (f.has("timeout_ms")) patch.timeoutMs = fieldInt(f, "timeout_ms", target);

  patches.set(target, { ...patches.get(target), ...patch });
}

// ---------------------------------------------------------------------------
// Structure Validation
// ---------------------------------------------------------------------------

function validateStructure(steps: ResolvedStep[]): void {
  const activeSteps = steps.filter((s) => !s.voided);

  // Duplicate step numbers
  const seen = new Set<number>();
  for (const step of activeSteps) {
    if (seen.has(step.n)) {
      throw structuralViolation(`Duplicate step number: n=${step.n}`, step.rid);
    }
    seen.add(step.n);
  }

  // Duplicate RIDs
  const rids = new Set<string>();
  for (const step of activeSteps) {
    if (rids.has(step.rid)) {
      throw structuralViolation(`Duplicate step RID: "${step.rid}"`, step.rid);
    }
    rids.add(step.rid);
  }
}

// ---------------------------------------------------------------------------
// Feature Set Computation (§2.1.1)
// ---------------------------------------------------------------------------

/**
 * Compute the effective feature set from the document's profile, features, with, and without.
 * Follows Modes Spec §3 (profile definitions).
 */
function computeEffectiveFeatures(doc: YonDocument): Set<YonFeature> {
  // Start from profile presets
  const profile = (doc.profile ?? "core") as YonProfile;
  const presets = PROFILE_PRESETS[profile] ?? PROFILE_PRESETS.core;
  const features = new Set<YonFeature>(presets);

  // Explicit features override the preset entirely
  if (doc.features && doc.features.length > 0) {
    features.clear();
    for (const f of doc.features) {
      features.add(f as YonFeature);
    }
  }

  // with: adds features
  if (doc.with) {
    for (const f of doc.with) {
      features.add(f as YonFeature);
    }
  }

  // without: removes features
  if (doc.without) {
    for (const f of doc.without) {
      features.delete(f as YonFeature);
    }
  }

  return features;
}

// ---------------------------------------------------------------------------
// Field Access Helpers (operate on Map<string, YonValue>)
// ---------------------------------------------------------------------------

/** Get a field as a string. Handles YonValue union. */
function fieldStr(fields: Map<string, YonValue>, key: string): string {
  const v = fields.get(key);
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // YonList or YonMapPair[] — stringify
  return JSON.stringify(v);
}

/** Get a field as an integer. */
function fieldInt(fields: Map<string, YonValue>, key: string, rid: string): number {
  const v = fields.get(key);
  if (v === undefined) return 0;
  if (typeof v === "number") return Math.floor(v);
  const n = parseInt(String(v), 10);
  if (isNaN(n)) {
    throw structuralViolation(`Invalid integer for "${key}": "${v}"`, rid);
  }
  return n;
}

/** Get a field as an array of strings (from YonList or comma-sep). */
function fieldArray(fields: Map<string, YonValue>, key: string): string[] {
  const v = fields.get(key);
  if (v === undefined || v === null) return [];
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return trimmed.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    }
    return trimmed ? [trimmed] : [];
  }
  // YonList — extract items as strings
  if (typeof v === "object" && "kind" in v && "items" in v) {
    return v.items.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && "key" in item && "value" in item) {
        return `${item.key}=${item.value}`;
      }
      return String(item);
    });
  }
  // Array of YonMapPair
  if (Array.isArray(v)) {
    return v.map((pair) => {
      if (typeof pair === "object" && "key" in pair) return `${pair.key}=${pair.value}`;
      return String(pair);
    });
  }
  return [String(v)];
}

/** Get a field as a key-value args object. */
function fieldArgs(fields: Map<string, YonValue>, key: string): Record<string, unknown> {
  const v = fields.get(key);
  if (v === undefined || v === null) return {};

  // If it's a YonList with field-items, extract key=value pairs
  if (typeof v === "object" && "kind" in v && v.kind === "field-items" && "items" in v) {
    const args: Record<string, unknown> = {};
    for (const item of v.items) {
      if (typeof item === "object" && item !== null && "key" in item && "value" in item) {
        args[(item as { key: string; value: unknown }).key] = (item as { key: string; value: unknown }).value;
      }
    }
    return args;
  }

  // If it's a string, parse as key=value pairs
  if (typeof v === "string") {
    return parseArgsString(v);
  }

  // If it's a map pairs array
  if (Array.isArray(v)) {
    const args: Record<string, unknown> = {};
    for (const pair of v) {
      if (typeof pair === "object" && "key" in pair && "value" in pair) {
        args[pair.key] = pair.value;
      }
    }
    return args;
  }

  return {};
}

function parseArgsString(value: string): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  const inner = value.trim().startsWith("[") && value.trim().endsWith("]")
    ? value.trim().slice(1, -1)
    : value;

  const regex = /(\w+)=(?:"([^"]*)"|([\w./\-:@]+))/g;
  let match;
  while ((match = regex.exec(inner)) !== null) {
    const key = match[1]!;
    const val = match[2] ?? match[3] ?? "";
    args[key] = val;
  }
  return args;
}

/** Convert a YonValue to unknown for generic storage. */
function valueToUnknown(v: YonValue): unknown {
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "object" && "kind" in v && "items" in v) {
    // YonList
    return v.items.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && "key" in item) return { key: item.key, value: item.value };
      return item;
    });
  }
  if (Array.isArray(v)) {
    return Object.fromEntries(v.map((p) => [p.key, p.value]));
  }
  return v;
}

// ---------------------------------------------------------------------------
// @TENET Extractor
// ---------------------------------------------------------------------------

function extractTenet(record: YonRecord): ResolvedTenet {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const level = fieldStr(f, "level") || "L2";
  const content = fieldStr(f, "content") || fieldStr(f, "text");
  const precedenceRaw = f.get("precedence");
  const decayRaw = f.get("decay");

  return {
    rid,
    level: (["L0", "L1", "L2", "L3"].includes(level) ? level : "L2") as ResolvedTenet["level"],
    content,
    precedence: typeof precedenceRaw === "number" ? precedenceRaw : Number(String(precedenceRaw ?? 0)) || 0,
    decay: typeof decayRaw === "number" ? decayRaw : Number(String(decayRaw ?? 0)) || 0,
    source: "document",
  };
}

// ---------------------------------------------------------------------------
// @SESSION / @CHECKPOINT / @RECOVER Extractors
// ---------------------------------------------------------------------------

function extractSession(record: YonRecord): SessionConfig {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const durability = fieldStr(f, "durability") || "ephemeral";
  const ttlRaw = f.get("ttl");
  const ttl = typeof ttlRaw === "number" ? ttlRaw : Number(String(ttlRaw ?? 0)) || 0;
  return {
    rid,
    durability: durability === "durable" ? "durable" : "ephemeral",
    ttl,
  };
}

function extractCheckpoint(record: YonRecord): CheckpointConfig {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const label = fieldStr(f, "label") || rid;
  const includesRaw = f.get("includes");
  let includes: string[] | undefined;
  if (typeof includesRaw === "string") {
    includes = includesRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return { rid, label, includes };
}

function extractRecover(record: YonRecord): RecoverConfig {
  const f = record.fields;
  const rid = fieldStr(f, "rid");
  const from = fieldStr(f, "from");
  return { rid, from };
}
