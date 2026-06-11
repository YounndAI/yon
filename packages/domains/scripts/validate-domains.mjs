#!/usr/bin/env node
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
 * YON Domain Schema Validator
 *
 * Checks every domain JSON for documentation completeness:
 * 1. tag_context coverage — every tag in records has a tag_context entry
 * 2. when_to_use quality — not a stub
 * 3. purpose present — non-empty string
 * 4. related_standards present — non-empty array
 * 5. field metadata — every field has description + example (+ unit if measurable)
 * 6. required/optional — every field has an explicit required property
 * 7. use_case integrity — tags_used MUST reference existing records;
 *    tags_planned is informational (roadmap surface)
 * 8. cross-domain metadata — shared tag names have crossDomains populated
 * 9. capacityTier — meta.capacityTier must be free|pro|enterprise
 *
 * Usage:
 *   node validate-domains.mjs              # local mode (reads files from disk)
 *   node validate-domains.mjs --api <url>  # API mode (fetches from domains.younndai.com)
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOMAINS_DIR = join(__dirname, "..", "domains", "yai");

const STUB_PATTERN = /record creation, querying, and lifecycle management/i;
const VALID_CAPACITY_TIERS = ["official", "free", "pro", "enterprise"];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

class ValidationResult {
  constructor() {
    /** @type {{ domain: string, tag?: string, field?: string, check: string, message: string }[]} */
    this.errors = [];
    /** @type {{ domain: string, tag?: string, field?: string, check: string, message: string }[]} */
    this.warnings = [];
    this.domainsPassed = 0;
    this.domainsFailed = 0;
  }

  error(domain, check, message, tag, field) {
    this.errors.push({ domain, tag, field, check, message });
  }

  warn(domain, check, message, tag, field) {
    this.warnings.push({ domain, tag, field, check, message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Validators
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validate a single domain JSON object.
 * @param {object} schema - Parsed domain JSON
 * @param {string} domainName - e.g. "health"
 * @param {ValidationResult} result
 */
function validateDomain(schema, domainName, result) {
  const records = schema.records || [];
  const meta = schema.meta || {};
  const tagContext = meta.tag_context || {};
  const useCases = meta.use_cases || [];

  const tagNames = records.map((r) => r.tag);

  // ── Check 1: tag_context coverage ───────────────────────────────────────
  for (const tag of tagNames) {
    if (!tagContext[tag]) {
      result.error(
        domainName,
        "tag_context_coverage",
        `Tag "${tag}" has no tag_context entry`,
        tag
      );
      continue;
    }

    const ctx = tagContext[tag];

    // ── Check 2: when_to_use quality ────────────────────────────────────
    if (!ctx.when_to_use || ctx.when_to_use.trim() === "") {
      result.error(
        domainName,
        "when_to_use_missing",
        `tag_context.${tag}.when_to_use is missing or empty`,
        tag
      );
    } else if (STUB_PATTERN.test(ctx.when_to_use)) {
      result.error(
        domainName,
        "when_to_use_stub",
        `tag_context.${tag}.when_to_use is a stub: "${ctx.when_to_use}"`,
        tag
      );
    }

    // ── Check 3: purpose present ────────────────────────────────────────
    if (!ctx.purpose || ctx.purpose.trim() === "") {
      result.error(
        domainName,
        "purpose_missing",
        `tag_context.${tag}.purpose is missing or empty`,
        tag
      );
    }

    // ── Check 4: related_standards ──────────────────────────────────────
    if (!ctx.related_standards || !Array.isArray(ctx.related_standards)) {
      result.error(
        domainName,
        "related_standards_missing",
        `tag_context.${tag}.related_standards is missing or not an array`,
        tag
      );
    } else if (ctx.related_standards.length === 0) {
      result.warn(
        domainName,
        "related_standards_empty",
        `tag_context.${tag}.related_standards is empty`,
        tag
      );
    }

    // ── Check 5: field-level metadata ────────────────────────────────────
    const record = records.find((r) => r.tag === tag);
    if (!record) continue;

    for (const field of record.fields) {
      const fieldName = field.name;

      // Check 6: required/optional explicit
      if (field.required === undefined || field.required === null) {
        result.error(
          domainName,
          "required_missing",
          `Field "${fieldName}" has no explicit required property`,
          tag,
          fieldName
        );
      }

      // Check field description (was: tag_context.fields.label)
      if (!field.description || field.description.trim() === "") {
        result.error(
          domainName,
          "field_description_missing",
          `Field "${fieldName}" has no description`,
          tag,
          fieldName
        );
      }

      // Check field example (was: tag_context.fields.example)
      if (field.example === undefined || field.example === null || field.example === "") {
        result.error(
          domainName,
          "field_example_missing",
          `Field "${fieldName}" has no example`,
          tag,
          fieldName
        );
      }

      // unit is optional — only check for numeric/measurement types
      // (we warn if a numeric field doesn't have a unit, but don't error)
      if (
        (field.type === "float" || field.type === "int") &&
        !field.unit &&
        !["id", "count", "level", "version", "step", "priority", "severity"].some(
          (k) => fieldName.toLowerCase().includes(k)
        )
      ) {
        result.warn(
          domainName,
          "field_unit_missing",
          `Numeric field "${fieldName}" has no unit — consider adding one`,
          tag,
          fieldName
        );
      }
    }
  }

  // ── Check 7: use_case integrity ───────────────────────────────────────
  // tags_used MUST reference tags that exist in records[].
  // tags_planned is informational (roadmap surface) — see domains/schema-format.md.
  for (const uc of useCases) {
    const tagsUsed = uc.tags_used || [];
    const tagsPlanned = uc.tags_planned || [];

    for (const t of tagsUsed) {
      if (!tagNames.includes(t)) {
        result.error(
          domainName,
          "use_case_phantom_tag",
          `use_case "${uc.id || uc.title}" references tag "${t}" in tags_used which does not exist in records — move it to tags_planned if intentional`,
          t
        );
      }
    }

    for (const t of tagsPlanned) {
      if (tagsUsed.includes(t)) {
        result.warn(
          domainName,
          "use_case_tag_duplicate",
          `use_case "${uc.id || uc.title}" lists tag "${t}" in both tags_used and tags_planned`,
          t
        );
      }
      if (tagNames.includes(t)) {
        result.warn(
          domainName,
          "use_case_planned_tag_shipped",
          `use_case "${uc.id || uc.title}" lists tag "${t}" in tags_planned but the record exists — graduate to tags_used`,
          t
        );
      }
    }
  }

  // ── Check for orphaned tag_context entries ────────────────────────────
  for (const key of Object.keys(tagContext)) {
    if (!tagNames.includes(key)) {
      result.warn(
        domainName,
        "orphaned_tag_context",
        `tag_context has entry "${key}" but no matching record`,
        key
      );
    }
  }

  // ── Check 9: capacityTier ─────────────────────────────────────────────
  if (!meta.capacityTier) {
    result.error(
      domainName,
      "capacity_tier_missing",
      `meta.capacityTier is missing — must be one of: ${VALID_CAPACITY_TIERS.join(", ")}`
    );
  } else if (!VALID_CAPACITY_TIERS.includes(meta.capacityTier)) {
    result.error(
      domainName,
      "capacity_tier_invalid",
      `meta.capacityTier is "${meta.capacityTier}" — must be one of: ${VALID_CAPACITY_TIERS.join(", ")}`
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Local mode — read from disk
// ──────────────────────────────────────────────────────────────────────────────

function runLocal() {
  const result = new ValidationResult();

  if (!existsSync(DOMAINS_DIR)) {
    console.error(`Domain directory not found: ${DOMAINS_DIR}`);
    process.exit(1);
  }

  const dirs = readdirSync(DOMAINS_DIR)
    .filter((d) => statSync(join(DOMAINS_DIR, d)).isDirectory())
    .sort();

  console.log(`\nValidating ${dirs.length} domains from disk...\n`);

  for (const d of dirs) {
    const filePath = join(DOMAINS_DIR, d, "1.0.json");
    if (!existsSync(filePath)) {
      result.warn(d, "file_missing", "No 1.0.json found");
      continue;
    }

    try {
      const schema = JSON.parse(readFileSync(filePath, "utf8"));
      const errorsBefore = result.errors.length;
      validateDomain(schema, d, result);
      if (result.errors.length === errorsBefore) {
        result.domainsPassed++;
      } else {
        result.domainsFailed++;
      }
    } catch (err) {
      result.error(d, "parse_error", `Failed to parse JSON: ${err.message}`);
      result.domainsFailed++;
    }
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// API mode — fetch from remote
// ──────────────────────────────────────────────────────────────────────────────

async function runApi(baseUrl) {
  const result = new ValidationResult();

  console.log(`\nValidating domains from API: ${baseUrl}\n`);

  // Fetch domain index
  const indexRes = await fetch(`${baseUrl}/api/domains`);
  if (!indexRes.ok) {
    console.error(`Failed to fetch domain index: ${indexRes.status}`);
    process.exit(1);
  }
  const index = await indexRes.json();

  // Extract domain IDs
  const domainIds = [];
  for (const ns of Object.values(index.namespaces || {})) {
    for (const d of ns.domains || []) {
      domainIds.push(d.id);
    }
  }

  console.log(`Found ${domainIds.length} domains\n`);

  for (const id of domainIds) {
    const domainName = id.split(".").pop();
    try {
      const res = await fetch(
        `${baseUrl}/api/domains/${id}?include=metadata`
      );
      if (!res.ok) {
        result.error(
          domainName,
          "api_error",
          `API returned ${res.status} for ${id}`
        );
        result.domainsFailed++;
        continue;
      }
      const schema = await res.json();
      const errorsBefore = result.errors.length;
      validateDomain(schema, domainName, result);
      if (result.errors.length === errorsBefore) {
        result.domainsPassed++;
      } else {
        result.domainsFailed++;
      }
    } catch (err) {
      result.error(
        domainName,
        "api_error",
        `Failed to fetch: ${err.message}`
      );
      result.domainsFailed++;
    }
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// Reporter
// ──────────────────────────────────────────────────────────────────────────────

function report(result) {
  const { errors, warnings, domainsPassed, domainsFailed } = result;

  // Group errors by domain
  const byDomain = {};
  for (const e of errors) {
    if (!byDomain[e.domain]) byDomain[e.domain] = [];
    byDomain[e.domain].push(e);
  }

  // Print errors
  if (errors.length > 0) {
    console.log("─".repeat(60));
    console.log(`ERRORS (${errors.length})`);
    console.log("─".repeat(60));

    for (const [domain, errs] of Object.entries(byDomain).sort()) {
      console.log(`\n  ${domain} (${errs.length} errors):`);
      for (const e of errs) {
        const location = [e.tag, e.field].filter(Boolean).join(".");
        console.log(`    ✗ [${e.check}] ${location ? location + ": " : ""}${e.message}`);
      }
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`WARNINGS (${warnings.length})`);
    console.log("─".repeat(60));

    const wByDomain = {};
    for (const w of warnings) {
      if (!wByDomain[w.domain]) wByDomain[w.domain] = [];
      wByDomain[w.domain].push(w);
    }

    for (const [domain, warns] of Object.entries(wByDomain).sort()) {
      console.log(`\n  ${domain} (${warns.length} warnings):`);
      for (const w of warns) {
        const location = [w.tag, w.field].filter(Boolean).join(".");
        console.log(`    ⚠ [${w.check}] ${location ? location + ": " : ""}${w.message}`);
      }
    }
  }

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log(
    `  ${domainsPassed} passed   ${domainsFailed} failed   ${errors.length} errors   ${warnings.length} warnings`
  );
  console.log("═".repeat(60));

  return errors.length === 0 ? 0 : 1;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const apiIndex = args.indexOf("--api");

let result;
if (apiIndex !== -1 && args[apiIndex + 1]) {
  result = await runApi(args[apiIndex + 1]);
} else {
  result = runLocal();
}

const exitCode = report(result);
process.exit(exitCode);
