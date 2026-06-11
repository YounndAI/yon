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
 * YON Runner — Policy Loader
 *
 * Parses kind=policy YON documents and extracts @RULE records
 * with policy-context fields (op, action, condition) into AllowlistEntry[].
 *
 * NOTE: @RULE has dual usage in YON v2.0:
 * - Ch 3 (logic): lvl, when, then — general rules
 * - Ch 8 (policy): op, action, condition — permission rules
 * This loader ONLY handles the Ch 8 policy variant.
 */

import type { AllowlistEntry, PermissionAction } from "./types.js";
import type { YonRecord } from "@younndai/yon-parser";

// ---------------------------------------------------------------------------
// Policy Loader
// ---------------------------------------------------------------------------

/**
 * Extract @RULE records from parsed YON records into AllowlistEntry[].
 * Only processes records that have the policy-context field `op`.
 */
export function loadPolicyRules(
  records: YonRecord[],
): AllowlistEntry[] {
  return records
    .filter((r) => r.tag?.toUpperCase() === "RULE" && r.fields.get("op") != null)
    .map((r) => {
      const op = String(r.fields.get("op"));
      const action = parseAction(r.fields.get("action"));
      return { op, action };
    });
}

function parseAction(v: unknown): PermissionAction {
  const s = String(v ?? "DENY").toUpperCase();
  if (s === "ALLOW" || s === "DENY" || s === "PROMPT") return s;
  return "DENY"; // Fail-closed default
}
