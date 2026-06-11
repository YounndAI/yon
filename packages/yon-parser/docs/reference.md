# Reference

| Status | Informative                          |
| ------ | ------------------------------------ |
| Tool   | `@younndai/yon-parser` v2.0.0        |
| Spec   | [YON v2.0](https://yon.younndai.com) |

> Complete type definitions, constants, and error codes for the parser API.

---

## Document & AST Types

```typescript
import type {
  YonDocument, // Parsed document root
  YonRecord, // @TAG record with fields
  YonBlock, // @BEGIN/@END block with content
  YonField, // Key-value field
  YonValue, // Field value (string, list, typed, etc.)
  YonList, // List value [a, b, c]
  YonListItem, // List item
  YonMapPair, // Map pair "key"->"value"
  YonTypedValue, // Value with type annotation (key:type=value)
  YonValueType, // Type annotation ('string' | 'int' | 'float' | 'bool' | 'ts')
  YonNode, // Discriminated union: record | comment | block
} from "@younndai/yon-parser";
```

---

## Configuration Types

```typescript
import type {
  YonProfile, // 'core' | 'decl' | 'exec' | 'audit' | 'cognitive' | 'agent' | 'full'
  YonFormat, // 'canon' | 'min' | 'ultra'
  YonMode, // 'struct' | 'chat' | 'text' | 'hybrid'
  YonKind, // Document kind
  YonFeature, // Feature flags
  ValidateOptions, // Validation configuration
  ValidationResult, // Validation output
  ValidationContext, // Granular validation context
  FormatOptions, // Formatting configuration
} from "@younndai/yon-parser";
```

---

## Domain Types

```typescript
import type {
  DomainRegistry, // Full domain schema
  DomainRecord, // Single record definition within a domain
  DomainSchemaJSON, // JSON schema format (for loadDomainFromJSON)
  DomainStatus, // 'pending' | 'active' | 'deprecated' | 'archived' | 'revoked'
  DomainTier, // 'official' | 'verified' | 'community'
  FieldConstraint, // Per-field validation constraint
} from "@younndai/yon-parser";
```

---

## Error Types

```typescript
import type { YonError, YonErrorCode } from "@younndai/yon-parser";
import { YonParseError, YonValidationError } from "@younndai/yon-parser";
```

### Error Codes

Error codes are stable references per the [YON Error Code Registry](https://yon.younndai.com). Messages change; codes do not.

#### Standard Errors (E0xx)

Standard-level errors that any conforming parser or validator MUST handle.

| Code   | Meaning             | Severity    | Recovery                                                                           |
| ------ | ------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `E001` | Validation failed   | Fatal       | Fix the document structure or field values that failed validation.                 |
| `E002` | Timeout exceeded    | Recoverable | Increase `timeout_ms` or optimize the operation. `@RETRY` MAY handle this.         |
| `E003` | Permission denied   | Fatal       | Add the operation to the Runner's allowlist or use `action=PROMPT`.                |
| `E004` | Resource not found  | Fatal       | Verify the reference exists. Check `block:`, `rid:`, `file:`, `url:` targets.      |
| `E005` | Rate limit exceeded | Recoverable | Back off and retry. `@RETRY` with `backoff=exponential` is recommended.            |
| `E006` | Unterminated block  | Fatal       | A `@BEGIN` was encountered without a matching `@END`. Check for stream truncation. |

#### Runner Errors (E1xx)

Execution-level errors raised by Runner implementations during workflow processing.

| Code   | Meaning            | Severity     | Recovery                                                                                   |
| ------ | ------------------ | ------------ | ------------------------------------------------------------------------------------------ |
| `E101` | Dependency cycle   | Fatal        | Restructure the workflow DAG. Remove circular `in`/`out` references.                       |
| `E102` | Op not implemented | Fatal        | The Runner does not support this operation. Use a different Runner or register a plugin.   |
| `E103` | Sandbox violation  | Fatal        | A file path attempted to escape the sandbox (e.g., `../`). Use sandbox-relative paths.     |
| `E104` | Version archived   | Fatal        | The requested op version is archived. Upgrade to a supported version.                      |
| `E105` | Version revoked    | Fatal        | The requested op version has a security issue and was revoked. Upgrade immediately.        |
| `E106` | Assertion failed   | Configurable | A `@CHECK` with `fail=ABORT` evaluated to false. Fix the precondition or change to `WARN`. |
| `E107` | Runtime error      | Recoverable  | An operation failed during execution. Check `@CATCH` handlers.                             |
| `E108` | @HALT received     | Fatal        | An emergency stop was triggered. Requires approval to resume.                              |
| `E109` | @TENET violated    | Fatal        | A governance constraint was violated. Check `@TENET` precedence and scope.                 |
| `E110` | @ESCALATE timeout  | Configurable | Human-in-the-loop approval was not received within `timeout_ms`. Applies `fallback=`.      |
| `E111` | @IMPRINT rejected  | Fatal        | A `std:memory.store` was attempted without a valid `@IMPRINT` reference.                   |
| `E112` | Trust threshold    | Warning      | Confidence value is below the configured trust threshold (default: 0.3). MAY proceed.      |

#### Error Code Ranges

| Range     | Allocation                                                     |
| --------- | -------------------------------------------------------------- |
| E001–E099 | Standard (format-level errors, conforming parser or validator) |
| E101–E199 | Runner (execution-level errors, Runner implementations)        |
| E200+     | Available for custom Runner/plugin errors                      |

> **Parser scope:** The parser emits `E001` for all validation errors and `E006` for unterminated blocks. `E004` is used for unresolved references when `validateReferences` is enabled. All other codes are defined for completeness and used by `@younndai/yon-runner`.

---

## Profile Presets

`PROFILE_PRESETS` maps each profile to its included features:

| Profile     | Features                                                                          |
| ----------- | --------------------------------------------------------------------------------- |
| `core`      | payload, logic, dialogue, sessions                                                |
| `decl`      | core + refs                                                                       |
| `exec`      | decl + workflow, delta                                                            |
| `audit`     | exec + provenance                                                                 |
| `cognitive` | exec + cognition, perception, goals, memory, affect                               |
| `agent`     | cognitive + temporal, collaboration, composition, governance, reactive, signaling |
| `full`      | All features                                                                      |

```typescript
import { PROFILE_PRESETS } from "@younndai/yon-parser";
```

---

## Feature Tags

`FEATURE_TAGS` maps each feature to the tags it enables:

| Feature         | Tags                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| `payload`       | BEGIN, END                                                                         |
| `logic`         | INTENT, SCOPE, RULE, SCHEMA, CFG, MAP, CHECK                                       |
| `workflow`      | STEP, CATCH, RETRY, ERROR, INPUT, OUTPUT, YIELD                                    |
| `delta`         | PATCH, VOID                                                                        |
| `provenance`    | STAMP                                                                              |
| `refs`          | REF                                                                                |
| `dialogue`      | TURN, ACK                                                                          |
| `sessions`      | SESSION, CHECKPOINT, RECOVER                                                       |
| `cognition`     | THOUGHT, HYPOTHESIS, OBSERVATION, REFLECTION, DECISION, PRUNE, INTROSPECT, ESSENCE |
| `perception`    | PERCEPT, FOCUS                                                                     |
| `goals`         | GOAL                                                                               |
| `memory`        | MEMORY, LEARN, PULSE, IMPRINT, SHARD, MARK                                         |
| `temporal`      | TIMELINE, EVENT                                                                    |
| `affect`        | AFFECT                                                                             |
| `collaboration` | WORKSPACE, EDIT                                                                    |
| `composition`   | CALL                                                                               |
| `governance`    | TENET, ESCALATE, HALT, DEREGISTER                                                  |
| `reactive`      | ON, EMIT, LOOP                                                                     |
| `signaling`     | CAPS, SUBSCRIBE, ROUTE, SIGNAL, THROTTLE, AGENT, MERGE, STREAM                     |

```typescript
import { FEATURE_TAGS } from "@younndai/yon-parser";
```

---

## Structural Tags

Tags permitted regardless of profile:

```typescript
import { STRUCTURAL_TAGS } from "@younndai/yon-parser";
// ['DOC', 'SEC', 'META', 'DEF', 'NOTE', 'STAMP', 'REDACTION', 'CONSENT', 'IDENTITY', 'LOCATION']
```

---

## Scenarios

Scenario presets for common document archetypes:

```typescript
import {
  SCENARIO_REGISTRY,
  resolveScenario,
  hasScenario,
  getScenarioIds,
  BASE_DEFAULTS,
} from "@younndai/yon-parser";

// Check if a scenario exists
hasScenario("persona"); // true

// Resolve a scenario's overrides
const overrides = resolveScenario("persona");
// { profile: "core", mode: "text", format: "canon", ... }

// List all scenario IDs
getScenarioIds(); // ['persona', 'spec', 'skill', ...]
```

---

## Constants

```typescript
import {
  PROFILE_PRESETS, // Profile → feature mappings
  FEATURE_TAGS, // Feature → allowed tag mappings
  STRUCTURAL_TAGS, // Always-permitted tags
  DEFAULT_MIME_TYPES, // Block type → MIME type mappings
  DOMAIN_REGISTRIES, // All registered domains (official + local)
} from "@younndai/yon-parser";
```

---

## Related

- [Parsing](parsing.md) — AST types in context
- [Validation](validation.md) — validation types and options
- [Domains](domains.md) — domain types and registration

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
