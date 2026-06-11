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
 * Shared voice constants for benchmark report generation.
 * Used by both enricher.ts and model-scorecard.ts.
 *
 * Voice: YounndAI institutional — shared voice constants for report tone consistency.
 */

export const VOICE_RULES = `Voice: YounndAI institutional. Third person. Calm authority. Present tense.

Six Laws:
1. Silence is syntax. Empty lines are breaths.
2. Every word earns its place. Remove what can be removed.
3. Restraint is strength. Say less to mean more.
4. Don't debate. State once.
5. Honesty is non-negotiable. Every operational characteristic disclosed.
6. End with purpose, not summary.

Rules:
- 4-7 words per clause
- State fact, then benefit. Quantify with baselines.
- Disclose every operational characteristic. Name every known boundary.
- No emoji in technical content.
- No superlatives without evidence.
- All retry/amplification metrics MUST be labeled "estimated from quality-adjusted benchmarks with modeled retry rates".
- Banned: "revolutionary", "cutting-edge", "game-changing", "leverage", "synergy", "disrupt", "unlock", "overhead" (use "structural baseline"), "trade-off" (use "operational characteristic"), "limitation" (use "known boundary"), exclamation marks.
- Also banned: "excel", "excels", "excelling", "optimal", "impressive", "remarkable", "significant advantage", "clearly superior", "operational savings", "leveraging", "best-in-class", "world-class", "industry-leading". Use: "performs well", "measured benefit", "scope advantage".`;

export const PLACEHOLDER_RULES = `CRITICAL — PLACEHOLDER SYSTEM:
You do NOT have access to the actual data values. Instead, you MUST use template placeholders.
For EVERY metric, write the literal text {{METRIC_NAME}} — the exact characters {{ and }}.
Examples of CORRECT output:
  "Recovery rate: **{{RECOVERY_RATE}}** compared to JSON's **{{JSON_RECOVERY}}**."
  "Pass rate: **{{PASS_RATE}}** across **{{TEST_COUNT}}** tests."
Examples of WRONG output:
  "Recovery rate: **99%** compared to JSON's **0%**." — WRONG, no placeholders
You MUST use {{PLACEHOLDER}} syntax for ALL numbers, rates, counts, and metric values.`;
