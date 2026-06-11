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
 * YON Runner — Session Manager
 *
 * Ephemeral or durable session checkpointing and recovery.
 * Implements YON v2.0 §5 (Error Handling & Recovery).
 *
 * Sessions require the `sessions` feature flag in the document profile.
 */

import type { BlockRegistry } from "./types.js";
import type { StepResult } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionConfig {
  /** Session record ID. */
  rid: string;
  /** Durability mode: ephemeral (in-memory) or durable (snapshot to disk). */
  durability: "ephemeral" | "durable";
  /** Time-to-live in milliseconds (0 = permanent). */
  ttl: number;
}

export interface CheckpointConfig {
  /** Checkpoint record ID. */
  rid: string;
  /** Label for the checkpoint. */
  label: string;
  /** Which block keys to include (empty = all). */
  includes?: string[];
}

export interface RecoverConfig {
  /** Recovery record ID. */
  rid: string;
  /** Checkpoint label to recover from. */
  from: string;
}

export interface Checkpoint {
  label: string;
  ts: number;
  blocks: Map<string, unknown>;
  stepResults: StepResult[];
}

// ---------------------------------------------------------------------------
// SessionManager
// ---------------------------------------------------------------------------

export class SessionManager {
  private config: SessionConfig | null = null;
  private checkpoints = new Map<string, Checkpoint>();
  private createdAt = 0;

  /**
   * Create a session. Must be called before checkpoint/recover.
   */
  create(config: SessionConfig): void {
    this.config = config;
    this.createdAt = Date.now();
    this.checkpoints.clear();
  }

  /**
   * Whether a session is active.
   */
  isActive(): boolean {
    if (!this.config) return false;
    // Check TTL expiry
    if (this.config.ttl > 0 && Date.now() - this.createdAt > this.config.ttl) {
      return false;
    }
    return true;
  }

  /**
   * Take a checkpoint of the current state.
   */
  checkpoint(
    config: CheckpointConfig,
    blocks: BlockRegistry,
    stepResults: StepResult[],
  ): void {
    if (!this.isActive()) return;

    const snapshot = new Map<string, unknown>();
    const keys = config.includes && config.includes.length > 0
      ? config.includes
      : blocks.keys();

    for (const key of keys) {
      if (blocks.has(key)) {
        snapshot.set(key, blocks.get(key));
      }
    }

    this.checkpoints.set(config.label, {
      label: config.label,
      ts: Date.now(),
      blocks: snapshot,
      stepResults: [...stepResults],
    });
  }

  /**
   * Recover from a checkpoint. Returns the checkpoint data or null if not found.
   */
  recover(config: RecoverConfig): Checkpoint | null {
    if (!this.isActive()) return null;
    return this.checkpoints.get(config.from) ?? null;
  }

  /**
   * Get all checkpoint labels.
   */
  getCheckpointLabels(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  /**
   * Get the current session config (for introspection).
   */
  getConfig(): SessionConfig | null {
    return this.config;
  }
}
