# Validation

| Status   | Informative                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                                                         |
| Spec     | YON v2.0 — [§4 Modes](https://yon.younndai.com), [§Domains](https://yon.younndai.com) |
| Requires | [Parsing](parsing.md), [Domains](domains.md)                                          |

> Validation confirms that a parsed AST conforms to its declared profile, features, and domain constraints. Parsing succeeds first; validation checks semantics.

---

## `validate(doc, options?)` → `ValidationResult`

Full-document validation. The primary entry point.

```typescript
import { parse, validate } from "@younndai/yon-parser";

const doc = parse(input);
const result = validate(doc, { strict: true });

if (!result.valid) {
  for (const err of result.errors) {
    console.error(`[${err.code}] L${err.line}: ${err.message}`);
  }
}
```

### `ValidateOptions`

| Option               | Type           | Default  | Description                                                  |
| -------------------- | -------------- | -------- | ------------------------------------------------------------ |
| `strict`             | `boolean`      | `true`   | Strict mode — violations produce errors. Lenient → warnings. |
| `profile`            | `YonProfile`   | from doc | Override the document's declared profile                     |
| `features`           | `YonFeature[]` | from doc | Override the document's effective features                   |
| `domains`            | `string[]`     | from doc | Domain IDs to allow (e.g., `['yai.health']`)                 |
| `allowUnknown`       | `boolean`      | `false`  | Allow unknown record types without error/warning             |
| `validateReferences` | `boolean`      | `false`  | Validate that `ref:`, `block:`, `rid:` references resolve    |
| `verifyIntegrity`    | `boolean`      | `false`  | Flag blocks with SHA-256 hashes for verification             |

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean; // true if no errors
  errors: YonError[]; // Fatal violations
  warnings: YonError[]; // Non-fatal warnings
  domainStatus?: Record<string, DomainStatus>; // Lifecycle status per domain
}
```

---

## Strict vs Lenient

The `strict` flag controls how violations are classified:

| Check                   | Strict  | Lenient |
| ----------------------- | ------- | ------- |
| Unknown profile         | Error   | Warning |
| Unknown features        | Error   | Warning |
| Features outside preset | Error   | Warning |
| Tag not in allowed set  | Error   | Warning |
| Required field missing  | Error   | Warning |
| Range violation         | Error   | Warning |
| Enum violation          | Error   | Warning |
| Pattern violation       | Error   | Warning |
| Type mismatch           | Error   | Warning |
| Pending domain          | Error   | Warning |
| Deprecated domain       | Warning | Warning |
| Archived domain         | Warning | Warning |
| Revoked domain          | Warning | Warning |

**Key distinction:** In strict mode, `result.valid` is `false` when any error occurs. In lenient mode, many violations become warnings, allowing `valid: true` with diagnostic output.

---

## Domain Field Constraint Validation

Per [schema-format.md §1](https://yon.younndai.com) — _"Validation rules for parsers."_

When a record belongs to a registered domain, the validator checks its fields against the domain schema's constraints:

| Check                | Condition                          | Example                                                             |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| **Required field**   | Field is `required` but missing    | `@PATIENT` missing `id` in `yai.health`                             |
| **Type conformance** | Value doesn't match declared type  | `age:int=abc` → type mismatch                                       |
| **Range**            | Numeric value outside `[min, max]` | `lat=100.0` with range `[-90, 90]`                                  |
| **Enum**             | Value not in allowed set           | `health=unknown` with enum `[nominal, degraded, critical, offline]` |
| **Pattern**          | Value doesn't match regex          | `icd_code=abc` with pattern `^[A-Z]\d{2}\.?\d*$`                    |

```typescript
// Validate a health domain document
const doc = parse(
  '@DOC ver=2.0 | id=pt | title="Patient" | domain=yai.health\n@PATIENT id="p1" | name="John"',
);
const result = validate(doc, { strict: true });
// Checks fields against yai.health schema constraints
```

---

## Domain Lifecycle Checking

Per [versioning.md §Domain Lifecycle](https://yon.younndai.com):

| Status         | Parser Behavior              | Runner Behavior  |
| -------------- | ---------------------------- | ---------------- |
| **Active**     | ✅ OK                        | ✅ OK            |
| **Deprecated** | ✅ OK (Log WARN)             | ✅ OK (Log WARN) |
| **Archived**   | ✅ OK (Log WARN)             | ❌ Fail (E104)   |
| **Revoked**    | ⚠️ OK (SECURITY WARN)        | ❌ Fail (E105)   |
| **Pending**    | ❌ strict error / ⚠️ lenient | ❌ Not available |

Lifecycle warnings appear in `result.warnings` and in `result.domainStatus`:

```typescript
const result = validate(doc, { strict: true });
// result.domainStatus → { "yai.health": "active" }
// result.warnings → [{ message: 'Domain "yai.health" v1.0 is deprecated...' }]
```

---

## Record-Level Domain Override

Per [cross-domain.md §2](https://yon.younndai.com) — two-level domain precedence:

```plaintext
@DOC ver=2.0 | id=multi | title="Multi-domain" | domain=yai.health

@PATIENT id="p1" | name="John"                  # ← validated against yai.health
@TXN domain=yai.fintech | id="t1" | amount=100  # ← validated against yai.fintech (override)
@VITALS id="v1" | hr=72                          # ← validated against yai.health (fallback to @DOC)
```

The `domain=` field on a record overrides the document's `@DOC domain=` for that record only. Field constraint validation uses the **effective domain** — the record's own `domain=` if present, otherwise the document's.

---

## Granular Validation API

For streaming, external tool integration, or per-record validation without batch processing.

### `createValidationContext(doc, options?)` → `ValidationContext`

Build a reusable validation context from a document header. Call once, then reuse for each record/block.

```typescript
import {
  parse,
  createValidationContext,
  validateRecord,
  validateBlock,
} from "@younndai/yon-parser";

const doc = parse(input);
const ctx = createValidationContext(doc, { strict: true });

// Check lifecycle warnings immediately
for (const warn of ctx.lifecycleWarnings) {
  console.warn(`[Lifecycle] ${warn.message}`);
}
```

### `ValidationContext`

| Field               | Type                          | Description                                      |
| ------------------- | ----------------------------- | ------------------------------------------------ |
| `effectiveFeatures` | `Set<string>`                 | Resolved features (profile + with − without)     |
| `allowedTags`       | `Set<string>`                 | Tags permitted by features + domains             |
| `domainRegistries`  | `Map<string, DomainRegistry>` | Resolved domain registries                       |
| `defaultDomain`     | `string \| undefined`         | Document-level domain from `@DOC`                |
| `domainStatus`      | `Map<string, DomainStatus>`   | Lifecycle status per domain                      |
| `strict`            | `boolean`                     | Whether strict mode is enabled                   |
| `mode`              | `string`                      | Document mode                                    |
| `profile`           | `string`                      | Resolved profile                                 |
| `ridSet`            | `Set<string>`                 | Accumulated record IDs (grows over validation)   |
| `options`           | `ValidateOptions`             | Original options                                 |
| `lifecycleWarnings` | `YonError[]`                  | Domain lifecycle warnings (check after creation) |

### `validateRecord(record, ctx)` → `ValidationResult`

Validate a single record against the context. Handles:

- Tag allowed by features check
- Domain field constraint validation
- Record-level `domain=` override resolution
- Required field validation
- Type/range/enum/pattern checks

```typescript
for (const record of doc.records) {
  const result = validateRecord(record, ctx);
  if (!result.valid) {
    console.error(`@${record.tag} L${record.line}:`, result.errors);
  }
}
```

### `validateBlock(block, ctx)` → `ValidationResult`

Validate a single block. Checks boundary strength and duplicate IDs.

```typescript
for (const [id, block] of doc.blocks) {
  const result = validateBlock(block, ctx);
  if (result.warnings.length > 0) {
    console.warn(`Block ${id}:`, result.warnings);
  }
}
```

---

## Profile and Feature Validation

Profiles define which tags are allowed. The profile hierarchy:

```
core → decl → exec ─┬─→ audit
                     └─→ cognitive → agent
                                        ↘
                        full ← ← ← ← ← ←
```

Tags used in the document MUST belong to the effective feature set. The validator checks each record's tag against `FEATURE_TAGS` + domain tags.

### Profile Modifiers

```plaintext
@DOC ver=2.0 | id=doc | title="Doc" | profile=exec | with=[cognition,memory]
```

- `with` adds features the profile doesn't normally include
- `without` removes features the profile normally includes

---

## Reference Validation

When `validateReferences: true`, the validator checks that all `ref:`, `block:`, and `rid:` pointers resolve to defined targets within the document.

```typescript
const result = validate(doc, { validateReferences: true });
// Checks that block:weather resolves to an actual @BEGIN block
// Checks that rid:l:1 resolves to a record with that rid
```

---

## Related

- [Parsing](parsing.md) — parse input before validation
- [Domains](domains.md) — domain registration and schema format
- [Formatting](formatting.md) — format validated documents
- [Reference](reference.md) — error codes and type definitions

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
