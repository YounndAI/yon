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
 * Domain Taxonomy — framework-agnostic classification engine.
 *
 * Pure data + helpers. No React, no Tailwind, no framework deps.
 *
 * All visual config uses semantic `colorKey` strings (e.g., `"tier-official"`,
 * `"conformance-gold"`, `"trust-trusted"`) instead of CSS classes.
 * Consumers map these to their own design system.
 *
 * Exported as `@younndai/domains/taxonomy`.
 *
 * @module
 */

// ─────────────────────────────────────────────────────────────────────────────
// Set Types — namespace classification system
// ─────────────────────────────────────────────────────────────────────────────

/** Domain set type key */
export type SetTypeKey = 'official' | 'institutional' | 'partner' | 'community';

/**
 * Set type configuration.
 * Uses semantic `colorKey` instead of CSS classes.
 *
 * @example
 * ```ts
 * const config = SET_TYPES.official;
 * // → { label: 'Official', colorKey: 'tier-official', iconName: 'Crown', ... }
 *
 * // App maps colorKey to its own design system:
 * const TAILWIND_MAP = { 'tier-official': 'text-domain-tier-official' };
 * ```
 */
export interface SetTypeConfig {
  label: string;
  /** Semantic color key for the consumer to map */
  colorKey: string;
  /** Lucide icon name (consumers import the actual component) */
  iconName: string;
  description: string;
}

/**
 * The four domain set types.
 *
 * | Type          | Namespace      | Color Key          |
 * | ------------- | -------------- | ------------------ |
 * | official      | yai.*, std.*   | tier-official      |
 * | institutional | edu.*, gov.*, org.* | tier-institutional |
 * | partner       | custom         | tier-partner       |
 * | community     | com.*          | tier-community     |
 */
export const SET_TYPES: Record<SetTypeKey, SetTypeConfig> = {
  official: {
    label: 'Official',
    colorKey: 'tier-official',
    iconName: 'Crown',
    description: 'Maintained by the YounndAI Domains Registry body. Follows strict conformance and versioning.',
  },
  institutional: {
    label: 'Institutional',
    colorKey: 'tier-institutional',
    iconName: 'Building2',
    description: 'Published by an educational, governmental, or organizational body (edu.*, gov.*, org.*).',
  },
  partner: {
    label: 'Partner',
    colorKey: 'tier-partner',
    iconName: 'Handshake',
    description: 'Published by a verified partner organization under their own namespace.',
  },
  community: {
    label: 'Community',
    colorKey: 'tier-community',
    iconName: 'Users',
    description: 'Created and maintained by the community under the com.* namespace.',
  },
};

/** Namespace prefixes that classify as institutional */
const INSTITUTIONAL_PREFIXES = ['edu', 'gov', 'org'];

/** Namespace prefixes that classify as official */
const OFFICIAL_PREFIXES = ['yai', 'std'];

/**
 * Check if a domain path belongs to an institutional namespace.
 *
 * @param path - Domain path (e.g., `edu.stanford.ml`)
 * @returns True if institutional
 *
 * @example
 * ```ts
 * isInstitutional('edu.stanford.ml'); // true
 * isInstitutional('yai.health');       // false
 * ```
 */
export function isInstitutional(path: string): boolean {
  const prefix = path.split('.')[0]?.toLowerCase();
  return INSTITUTIONAL_PREFIXES.includes(prefix ?? '');
}

/**
 * Resolve the set type for a domain.
 *
 * DB tier is authoritative when valid; path-based prefix is fallback.
 *
 * @param path - Domain path
 * @param tier - DB tier value
 * @returns Resolved set type key
 *
 * @example
 * ```ts
 * resolveSetType('yai.health', 'official');           // 'official'
 * resolveSetType('edu.mit.research', 'community');    // 'community' (DB wins)
 * resolveSetType('acme.shipping', 'unknown-tier');    // 'partner' (fallback)
 * ```
 */
export function resolveSetType(path: string, tier: string): SetTypeKey {
  const prefix = path.split('.')[0]?.toLowerCase() ?? '';

  // DB tier is authoritative
  if (tier === 'official' || tier === 'institutional' || tier === 'community' || tier === 'partner') {
    return tier;
  }

  // Fallback: infer from path prefix
  if (INSTITUTIONAL_PREFIXES.includes(prefix)) return 'institutional';
  if (OFFICIAL_PREFIXES.includes(prefix)) return 'official';
  if (prefix === 'com') return 'community';

  return 'partner'; // safe default
}

// ─────────────────────────────────────────────────────────────────────────────
// Conformance Levels — score-based quality system
// ─────────────────────────────────────────────────────────────────────────────

/** Conformance level key */
export type ConformanceLevelKey = 'platinum' | 'gold' | 'silver' | 'bronze' | 'below';

/**
 * Conformance level configuration.
 *
 * @example
 * ```ts
 * const level = resolveConformanceLevel(0.95);
 * // → { key: 'gold', label: 'Gold', colorKey: 'conformance-gold', ... }
 * ```
 */
export interface ConformanceLevelConfig {
  label: string;
  threshold: number;
  colorKey: string;
  iconName: string;
  description: string;
}

/**
 * Conformance levels — ordered descending by threshold.
 *
 * | Level    | Threshold | Color Key           |
 * | -------- | --------- | ------------------- |
 * | platinum | 1.0       | conformance-platinum |
 * | gold     | 0.9       | conformance-gold     |
 * | silver   | 0.7       | conformance-silver   |
 * | bronze   | 0.5       | conformance-bronze   |
 * | below    | 0.0       | conformance-below    |
 */
export const CONFORMANCE_LEVELS: Record<ConformanceLevelKey, ConformanceLevelConfig> = {
  platinum: {
    label: 'Platinum',
    threshold: 1.0,
    colorKey: 'conformance-platinum',
    iconName: 'Diamond',
    description: 'Perfect quality — 100% metadata coverage and all conformance tests pass.',
  },
  gold: {
    label: 'Gold',
    threshold: 0.9,
    colorKey: 'conformance-gold',
    iconName: 'Trophy',
    description: 'High quality — ≥90% metadata coverage (descriptions, examples, types) and conformance tests pass.',
  },
  silver: {
    label: 'Silver',
    threshold: 0.7,
    colorKey: 'conformance-silver',
    iconName: 'Medal',
    description: 'Moderate quality — ≥70% of tags and fields have descriptions, types, and examples.',
  },
  bronze: {
    label: 'Bronze',
    threshold: 0.5,
    colorKey: 'conformance-bronze',
    iconName: 'Award',
    description: 'Basic quality — ≥50% of tags and fields have required metadata.',
  },
  below: {
    label: 'Below threshold',
    threshold: 0,
    colorKey: 'conformance-below',
    iconName: 'XCircle',
    description: 'Does not meet the minimum 50% quality threshold for metadata coverage.',
  },
};

/** Conformance levels in resolution order (descending threshold) */
export const CONFORMANCE_ORDER: ConformanceLevelKey[] = [
  'platinum', 'gold', 'silver', 'bronze', 'below',
];

/**
 * Resolve the conformance level for a given score (0.0–1.0).
 *
 * @param score - Quality score between 0 and 1
 * @returns Conformance level with key and percentage
 *
 * @example
 * ```ts
 * const level = resolveConformanceLevel(0.85);
 * // → { key: 'silver', label: 'Silver', percentage: 85, ... }
 * ```
 */
export function resolveConformanceLevel(
  score: number,
): ConformanceLevelConfig & { key: ConformanceLevelKey; percentage: number } {
  const percentage = Math.round(score * 100);

  for (const key of CONFORMANCE_ORDER) {
    const level = CONFORMANCE_LEVELS[key];
    if (score >= level.threshold) {
      return { ...level, key, percentage };
    }
  }

  return { ...CONFORMANCE_LEVELS.below, key: 'below', percentage };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification — trust signal
// ─────────────────────────────────────────────────────────────────────────────

/** Verification configuration */
export interface VerificationConfig {
  iconName: string;
  colorKey: string;
  title: string;
  description: string;
}

/**
 * Verification status configurations.
 */
export const VERIFICATION: Record<'verified' | 'unverified', VerificationConfig> = {
  verified: {
    iconName: 'Check',
    colorKey: 'verification-verified',
    title: 'Verified Domain',
    description: 'Trust and quality marker — earned through identity verification and Gold+ quality score.',
  },
  unverified: {
    iconName: 'X',
    colorKey: 'verification-unverified',
    title: 'Not Verified',
    description: 'This domain has not been verified. Verification requires identity confirmation and Gold+ quality score.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Domain States — lifecycle (spec-aligned)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Domain lifecycle state keys.
 *
 * Per versioning.md §Domain Lifecycle:
 * - `pending` (spec says pending, app historically used "draft")
 * - `active`
 * - `deprecated`
 * - `archived`
 * - `revoked`
 */
export type DomainStateKey = 'pending' | 'active' | 'deprecated' | 'archived' | 'revoked';

/** Domain state configuration */
export interface DomainStateConfig {
  label: string;
  iconName: string;
  colorKey: string;
  description: string;
}

/**
 * All 5 domain lifecycle states per versioning.md.
 *
 * Note: The app's `"draft"` maps to `"pending"` spec state.
 */
export const DOMAIN_STATES: Record<DomainStateKey, DomainStateConfig> = {
  pending: {
    label: 'Pending',
    iconName: 'PenLine',
    colorKey: 'state-pending',
    description: 'Work in progress — not yet published to the public registry.',
  },
  active: {
    label: 'Active',
    iconName: 'CircleCheck',
    colorKey: 'state-active',
    description: 'Published and available — actively maintained and accepting contributions.',
  },
  deprecated: {
    label: 'Deprecated',
    iconName: 'AlertTriangle',
    colorKey: 'state-deprecated',
    description: 'No longer recommended — may be removed in future versions. Consider alternatives.',
  },
  archived: {
    label: 'Archived',
    iconName: 'Archive',
    colorKey: 'state-archived',
    description: 'Read-only — preserved for reference but no longer maintained or updated.',
  },
  revoked: {
    label: 'Revoked',
    iconName: 'Ban',
    colorKey: 'state-revoked',
    description: 'Permanently removed — this domain violated governance policies or was recalled by its owner.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Trust Levels — composite indicator
// ─────────────────────────────────────────────────────────────────────────────

/** Trust level key */
export type TrustLevel = 'trusted' | 'reviewed' | 'unreviewed';

/** Trust level configuration */
export interface TrustLevelConfig {
  label: string;
  iconName: string;
  colorKey: string;
  description: string;
}

/**
 * Trust level configurations.
 */
export const TRUST_LEVELS: Record<TrustLevel, TrustLevelConfig> = {
  trusted: {
    label: 'Trusted',
    iconName: 'ShieldCheck',
    colorKey: 'trust-trusted',
    description: 'Verified identity + Gold or above quality score + Official or Institutional namespace.',
  },
  reviewed: {
    label: 'Reviewed',
    iconName: 'CheckCircle',
    colorKey: 'trust-reviewed',
    description: 'Verified identity + Silver or above quality score.',
  },
  unreviewed: {
    label: 'Unreviewed',
    iconName: 'Circle',
    colorKey: 'trust-unreviewed',
    description: 'Has not been verified or does not meet review thresholds.',
  },
};

/**
 * Resolve the composite trust level from verified + score + set type.
 *
 * @param verified - Whether the domain is identity-verified
 * @param score - Quality score (0.0–1.0)
 * @param setType - Resolved set type key
 * @returns Trust level key
 *
 * @example
 * ```ts
 * resolveTrustLevel(true, 0.95, 'official');    // 'trusted'
 * resolveTrustLevel(true, 0.75, 'community');   // 'reviewed'
 * resolveTrustLevel(false, 0.99, 'official');   // 'unreviewed'
 * ```
 */
export function resolveTrustLevel(
  verified: boolean,
  score: number,
  setType: SetTypeKey,
): TrustLevel {
  if (verified && score >= 0.9 && (setType === 'official' || setType === 'institutional')) {
    return 'trusted';
  }
  if (verified && score >= 0.7) {
    return 'reviewed';
  }
  return 'unreviewed';
}

// ─────────────────────────────────────────────────────────────────────────────
// Freshness — last updated indicator
// ─────────────────────────────────────────────────────────────────────────────

/** Freshness configuration */
export interface FreshnessConfig {
  label: string;
  colorKey: string;
}

/**
 * Compute a human-readable freshness label from a date.
 *
 * | Range        | Color Key           |
 * | ------------ | ------------------- |
 * | < 3 months   | freshness-recent    |
 * | 3–12 months  | freshness-aging     |
 * | > 12 months  | freshness-stale     |
 *
 * @param lastUpdated - Last update date (ISO string or Date)
 * @returns Freshness label and semantic color key
 *
 * @example
 * ```ts
 * const freshness = getFreshnessLabel('2026-02-01');
 * // → { label: 'Updated 27d ago', colorKey: 'freshness-recent' }
 * ```
 */
export function getFreshnessLabel(lastUpdated: string | Date): FreshnessConfig {
  const updated = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return { label: 'Updated today', colorKey: 'freshness-recent' };
  if (diffDays < 7) return { label: `Updated ${diffDays}d ago`, colorKey: 'freshness-recent' };
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return { label: `Updated ${weeks}w ago`, colorKey: 'freshness-recent' };
  }
  if (diffDays < 90) {
    const months = Math.floor(diffDays / 30);
    return { label: `Updated ${months}mo ago`, colorKey: 'freshness-recent' };
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return { label: `Updated ${months}mo ago`, colorKey: 'freshness-aging' };
  }

  const years = Math.floor(diffDays / 365);
  return { label: `Updated ${years}y ago`, colorKey: 'freshness-stale' };
}

// ─────────────────────────────────────────────────────────────────────────────
// State Normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a raw domain state value.
 * Handles the legacy "draft" → "pending" migration.
 *
 * @param raw - The raw state string from the database or API
 * @returns A valid DomainStateKey
 */
export function normalizeDomainState(raw: string): DomainStateKey {
  if (raw === 'draft') return 'pending';
  return raw as DomainStateKey;
}
