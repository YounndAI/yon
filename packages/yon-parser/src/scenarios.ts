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
 * YON Scenario System
 * 
 * Provides predefined settings combinations with override capability.
 * Scenarios bundle settings. One choice, many defaults.
 * 
 * @module scenarios
 * @see YON Standard §18 (Scenarios)
 */

import type { YonProfile, YonFeature, YonMode, YonFormat } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Scenario Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A scenario defines a preset of settings.
 */
export interface YonScenario {
  /** Scenario identifier */
  id: string;
  /** Processing mode */
  mode: YonMode;
  /** Validation profile */
  profile: YonProfile;
  /** Output format */
  format: YonFormat;
  /** Domain (optional) */
  domain?: string;
  /** Additional features (optional) */
  features?: YonFeature[];
  /** Description for humans */
  description: string;
}

/**
 * Options that can override scenario defaults.
 */
export interface ScenarioOverrides {
  mode?: YonMode;
  profile?: YonProfile;
  format?: YonFormat;
  domain?: string;
  features?: YonFeature[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Built-in Scenarios
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Built-in scenario registry.
 * Built-in scenarios cover common cases. Custom for edge cases.
 * No scenario = custom (user provides all settings).
 */
export const SCENARIO_REGISTRY: Record<string, YonScenario> = {
  // General-purpose
  prompt: {
    id: 'prompt',
    mode: 'struct',
    profile: 'exec',
    format: 'min',
    description: 'LLM prompt templates',
  },
  chat: {
    id: 'chat',
    mode: 'chat',
    profile: 'core',
    format: 'ultra',
    description: 'Conversational AI exchanges',
  },
  config: {
    id: 'config',
    mode: 'struct',
    profile: 'decl',
    format: 'ultra',
    description: 'Configuration files',
  },
  audit: {
    id: 'audit',
    mode: 'struct',
    profile: 'audit',
    format: 'canon',
    description: 'Compliance and forensic',
  },
  agent: {
    id: 'agent',
    mode: 'hybrid',
    profile: 'exec',
    format: 'min',
    description: 'Agentic workflows',
  },
  
  // Industry-specific
  clinical: {
    id: 'clinical',
    mode: 'struct',
    profile: 'audit',
    format: 'canon',
    domain: 'yai.health',
    description: 'Healthcare clinical AI',
  },
  fintech: {
    id: 'fintech',
    mode: 'struct',
    profile: 'audit',
    format: 'canon',
    domain: 'yai.fintech',
    description: 'Financial services',
  },
  legal: {
    id: 'legal',
    mode: 'struct',
    profile: 'audit',
    format: 'canon',
    domain: 'yai.legal',
    description: 'Legal document processing',
  },
  support: {
    id: 'support',
    mode: 'chat',
    profile: 'core',
    format: 'min',
    domain: 'yai.ecommerce',
    description: 'Customer support bots',
  },
  npc: {
    id: 'npc',
    mode: 'text',
    profile: 'core',
    format: 'min',
    domain: 'yai.gaming',
    description: 'NPC dialogue and personas',
  },
  classroom: {
    id: 'classroom',
    mode: 'struct',
    profile: 'core',
    format: 'canon',
    domain: 'yai.education',
    description: 'Teaching and assessment',
  },
  dispatch: {
    id: 'dispatch',
    mode: 'struct',
    profile: 'exec',
    format: 'min',
    domain: 'yai.logistics',
    description: 'Supply chain dispatch',
  },
  factory: {
    id: 'factory',
    mode: 'struct',
    profile: 'audit',
    format: 'canon',
    domain: 'yai.manufacturing',
    description: 'Production floor operations',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scenario Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base defaults when no scenario is specified.
 * Base defaults apply when no scenario is set. Safe for general use.
 */
export const BASE_DEFAULTS: Omit<YonScenario, 'id' | 'description'> = {
  mode: 'struct',
  profile: 'exec',   // Per spec §16.1, default profile is 'exec'
  format: 'canon',   // Per spec §16.1, default fmt is 'canon'
};

/**
 * Resolve scenario with optional overrides.
 * Overrides win. Explicit always beats implicit.
 * Precedence: Explicit overrides > Scenario defaults > Base defaults
 * 
 * @param scenarioId - Scenario ID (undefined = custom)
 * @param overrides - Explicit overrides
 * @returns Resolved settings
 */
export function resolveScenario(
  scenarioId: string | undefined,
  overrides: ScenarioOverrides = {}
): Omit<YonScenario, 'id' | 'description'> {
  // Start with base defaults
  let base: Omit<YonScenario, 'id' | 'description'> = { ...BASE_DEFAULTS };
  
  // Apply scenario defaults if specified
  if (scenarioId && SCENARIO_REGISTRY[scenarioId]) {
    const scenario = SCENARIO_REGISTRY[scenarioId];
    base = {
      mode: scenario.mode,
      profile: scenario.profile,
      format: scenario.format,
      domain: scenario.domain,
      features: scenario.features,
    };
  }
  
  // Apply explicit overrides
  return {
    mode: overrides.mode ?? base.mode,
    profile: overrides.profile ?? base.profile,
    format: overrides.format ?? base.format,
    domain: overrides.domain ?? base.domain,
    features: overrides.features ?? base.features,
  };
}

/**
 * Check if a scenario exists.
 */
export function hasScenario(scenarioId: string): boolean {
  return scenarioId in SCENARIO_REGISTRY;
}

/**
 * Get all registered scenario IDs.
 */
export function getScenarioIds(): string[] {
  return Object.keys(SCENARIO_REGISTRY);
}
