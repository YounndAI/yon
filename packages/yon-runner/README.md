<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-runner/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-runner/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-runner/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-runner</strong><br />
  Reference runner for YON v2.0 workflow documents — fail-closed sandbox execution<br />
  Default-deny: nothing runs unless an explicit allowlist permits it.<br />
  <em>Part of the YON™ toolchain. Data, intent, provenance, and thought — in one stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-runner)](https://www.npmjs.com/package/@younndai/yon-runner)
[![license](https://img.shields.io/npm/l/@younndai/yon-runner)](./LICENSE)

## What is this?

`@younndai/yon-runner` executes YON `kind=workflow` documents through a strict five-phase pipeline — Parse → Validate → Resolve → Plan → Execute. Every operation runs inside a sandbox, every permission is checked before execution begins, and the default answer is deny. Trust is declared explicitly, never assumed. No LLM dependency, no implicit network access.

## Install

```bash
npm install @younndai/yon-runner
```

## Quick Start

```ts
import { createRunner } from "@younndai/yon-runner";

const runner = createRunner({
  permissions: [
    { op: "std:fs.*", action: "ALLOW" },
    { op: "std:data.*", action: "ALLOW" },
    { op: "std:control.*", action: "ALLOW" },
  ],
  sandbox: { root: "./workspace" },
});

const result = await runner.run(yonText);
console.log(result.success); // boolean
console.log(result.stamps); // provenance trail
console.log(result.outputs); // block values after execution
```

## Key Features

- **Five-phase pipeline** — Parse → Validate → Resolve → Plan → Execute, deterministic and inspectable.
- **Fail-closed permission model** — allowlist with namespace/operation/global wildcards; DENY overrides ALLOW; PROMPT for handler-in-the-loop.
- **Sandboxed standard operations** — filesystem, data, control, handler, system, HTTP, and workflow op namespaces.
- **Governance** — tenet engine (L0–L3) and policy rules that gate execution before permissions.
- **Sessions and plugins** — checkpoint/recover durability plus a plugin API for custom operation namespaces.

## Configuration

```ts
const runner = createRunner({
  // Permission allowlist — fail-closed. Unlisted ops are denied.
  permissions: [
    { op: "std:fs.*", action: "ALLOW" },
    { op: "std:fs.delete", action: "PROMPT" },
    { op: "custom:*", action: "DENY" },
  ],

  // Sandbox — filesystem isolation root
  sandbox: {
    root: "./workspace",
    network: false, // default: false
    env: { NODE_ENV: "production" },
  },

  // Callbacks — handler interaction hooks
  onPrompt: async (op, args) => true, // PROMPT permission handler
  onInput: async (question) => "yes", // std:handler.ask text input

  // Timeout — per-step default (ms)
  defaultTimeout: 30_000,

  // Parallel policy — fail-fast (default) halts on first error, wait-all collects all
  parallelPolicy: "fail-fast",

  // Tenets — governance rules (YON kind=tenets document or parsed)
  tenets: tenetYonText,

  // Policy — additional permission rules from kind=policy documents
  policy: policyDoc,

  // Tenet check callback — called when a tenet check fires
  onTenetCheck: (rid, op, tenet) => console.log(`Tenet ${tenet.rid} checked`),
});
```

## Standard Operations

All operations follow an explicit permission model. Three tiers classify risk:

| Tier     | Symbol | Meaning                       | Examples                                                |
| -------- | ------ | ----------------------------- | ------------------------------------------------------- |
| Safe     | 🟢     | No side effects               | `data.parse`, `data.serialize`, `sys.info`, `sys.clock` |
| Gate     | 🟡     | Requires explicit ALLOW       | `fs.read`, `fs.write`, `handler.ask`, `handler.review`      |
| Critical | 🔴     | Destructive — consider PROMPT | `fs.delete`                                             |

Standard op namespaces: filesystem (`std:fs.*`), data (`std:data.*`), control (`std:control.*`), handler (`std:handler.*`), system (`std:sys.*`), HTTP (`std:http.*`), and workflow (`std:workflow.*`). See [HOW-TO-USE.md](./HOW-TO-USE.md) for the full operation reference.

## Permission Model

The runner uses a **fail-closed allowlist**. Operations are denied unless an explicit rule grants access.

```ts
permissions: [
  // Wildcards: namespace, operation, or global
  { op: "std:fs.*", action: "ALLOW" }, // All fs ops
  { op: "std:*", action: "ALLOW" }, // All std ops
  { op: "*", action: "ALLOW" }, // Everything (use with care)

  // DENY overrides ALLOW when it appears first
  { op: "std:fs.delete", action: "DENY" }, // Block deletes
  { op: "std:fs.*", action: "ALLOW" }, // Allow the rest

  // PROMPT calls the onPrompt callback
  { op: "std:fs.delete", action: "PROMPT" }, // Ask user before delete
];
```

Version-aware: `std:fs.read` matches `std:fs.read@v1`, `std:fs.read@v2`, etc.

## Governance

### Tenets

Governance rules loaded from `kind=tenets` documents or runtime configuration. Tenet checks fire **before** permission checks — a violated tenet halts execution regardless of permissions.

Four levels: L0 (immutable safety), L1 (org policy), L2 (project), L3 (session). Higher precedence wins on conflict.

### Policy

Policy files (`kind=policy`) add permission rules at runtime. `@RULE` records are extracted and merged into the permission engine before execution.

## Sessions

Session durability requires the `sessions` feature flag (enabled by default in core, decl, exec, audit profiles).

```ts
// In the YON document:
// @SESSION rid=sess-1 | durability=ephemeral | ttl=60000
// @CHECKPOINT rid=cp-1 | label="after-parse"
// @RECOVER rid=rec-1 | from="after-parse"
```

The runner automatically checkpoints after each successful step when a session is active. Recovery restores block state and step results from a labeled checkpoint.

## Plugin System

Register custom operation namespaces:

```ts
import type { OpPlugin } from "@younndai/yon-runner";

const myPlugin: OpPlugin = {
  namespace: "myco",
  version: "v2", // optional, defaults to "v1"
  ops: {
    fetch: async (ctx, args) => {
      return await fetchData(args.url as string);
    },
    transform: async (ctx, args) => {
      const input = ctx.inputs.get("block:data");
      return transform(input);
    },
  },
};

runner.registerPlugin(myPlugin);
// Registers: myco:fetch@v2, myco:transform@v2
```

## Error Handling

Three directives control error recovery in workflow documents: `@CHECK` asserts preconditions, `@CATCH` provides a fallback step on error, and `@RETRY` re-executes on failure. Workflow contracts (`@INPUT`, `@OUTPUT`, `@YIELD`) declare inputs, outputs, and intermediate yields. All errors carry `code`, `severity` (fatal, recoverable, warning), and `source` fields. See [HOW-TO-USE.md](./HOW-TO-USE.md) for the full error-code table.

## Output Serialization

Convert execution results to YON output documents:

```ts
import { serializeResult } from "@younndai/yon-runner";

const result = await runner.run(yonText);
const outputDoc = serializeResult(result);
// → YON kind=result document with stamps, errors, output blocks
```

## Types

```ts
import type {
  RunnerConfig, // Configuration options
  RunResult, // Execution result
  StepResult, // Per-step result
  Stamp, // Provenance record
  RunnerError, // Error with code, message, severity, source
  OpPlugin, // Plugin interface
  OpHandler, // Op function signature
  ExecutionContext, // Context passed to ops
  AllowlistEntry, // Permission rule
  Runner, // Runner instance
  ResolvedTenet, // Governance tenet
} from "@younndai/yon-runner";

// Classes and utilities
import {
  OpRegistry, // Op registration and version resolution
  PermissionEngine, // Fail-closed permission checking
  Sandbox, // Filesystem isolation
  InMemoryBlockRegistry, // Block state management
  StampCollector, // Provenance stamp collection
  TenetEngine, // Governance tenet engine
  SessionManager, // Session checkpointing and recovery
  ErrorCodes, // Error code registry
  serializeResult, // Output document serialization
  extractTenets, // Tenet extraction from records
  loadPolicyRules, // Policy rule extraction
} from "@younndai/yon-runner";
```

## Documentation

| Document                    | Description                                |
| --------------------------- | ------------------------------------------ |
| [How to Use](HOW-TO-USE.md) | Operation reference, error codes, examples |
| [Testing](TESTING.md)       | Test methodology and coverage analysis     |
| [Changelog](CHANGELOG.md)   | Version history and release notes          |

## The YON Project

YON is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Security

`@younndai/yon-runner` ships defense-in-depth HTTP defaults. **All `fetch()` call sites — both `std:http.*` ops AND `url:` input references — go through the same security checks**, so a YON document with `in=[url:http://169.254.169.254/...]` cannot bypass the gate.

- **Scheme whitelist** — only `https:` and `http:` URLs accepted; `file:`, `data:`, `ftp:`, etc. rejected with `E103`.
- **Private-IP block** — requests to RFC 1918 (`10.x`, `172.16-31.x`, `192.168.x`), loopback (`127.x`, `::1`), link-local (`169.254.x`, `fe80::`), unique local (`fc00::/7` — full range, not only `fc00:`/`fd00:` prefixes), the IPv6 unspecified address (`::`), and the cloud-metadata sentinel (`169.254.169.254`) are rejected with `E103`.
- **IPv6 normalization edge cases** — IPv4-mapped IPv6 (`::ffff:127.0.0.1`, normalized by WHATWG to `::ffff:7f00:1`), IPv4-compatible IPv6 (`::a.b.c.d`, deprecated by RFC 4291 §2.5.5.1 but still routed by some legacy stacks), and trailing-dot hostnames (`localhost.`) are all blocked.
- **Credentials stripping** — `https://user:pass@host/` URLs have credentials removed before request; use `Authorization` header instead.

**Bypass for trusted environments:** set `RunnerConfig.unsafeHttp: true`. Emits a one-time stderr warning on runner initialization. The bypass applies uniformly to `std:http.*` ops and `url:` input-reference fetches.

**Known limit (v2.0):** the private-IP check operates on the URL hostname only — it does not resolve DNS. Cloud-metadata FQDN aliases (e.g., `metadata.google.internal`, `metadata.azure.com`) are NOT blocked, and a sophisticated attacker who controls DNS can still SSRF after the hostname check passes. DNS rebinding protection is planned for v2.1 via `RunnerConfig.dnsRebindingProtection` opt-in (default-on in v3.0).

**Threat model:** yon-runner is designed for orchestration of trusted YON documents. If feeding untrusted YON, layer additional sandbox controls (network namespaces, container isolation, etc.) — these in-process defaults are necessary but not sufficient for hostile-input scenarios.

## Testing

```bash
# Run all tests (see latest npm test output)
npx vitest run

# Generate a timestamped execution report
npx tsx test/generate-report.ts
```

See [TESTING.md](./TESTING.md) for test methodology, coverage analysis, and the test sufficiency assessment.

## Conformance

`@younndai/yon-runner` exercises the runner vector suite published in `@younndai/yon-spec/conformance`. Of the 33 runner-targeted vectors:

- **3 of 15 `runner/` vectors pass** — generic runner concerns covered for the cases that exercise implemented behavior (sandbox path traversal, `@CHECK fail=ABORT`, `@RETRY` exhaustion).
- **12 of 15 `runner/` vectors skipped** — pending fixes tracked as `F-R002.1.{a–f}` sub-findings for a future release (error-code mismappings, spec-phantom op references, sandbox-seeding contract, sandbox-vs-vector-intent collisions, profile-strict enforcement). Each skipped test carries an inline pointer comment naming the sub-finding.
- **18 of 18 `runner-agentic/` + `runner-cognitive/` vectors skipped** — depend on specialised-tier operations not implemented in yon-runner v2.x (out of scope for this package).

Coverage will expand as `F-R002.1` sub-findings are closed in subsequent releases — converting each `it.skip` back to `it` removes one row from the skip ledger. The vector enumeration entry point is `getRunnerVectorPaths()` from `@younndai/yon-spec/conformance`.

---

## About YounndAI

**YounndAI™ — You and AI, unified.** (pronounced *"yoon-dye"*)

A philosophy of intelligence: building with intention, so humans and machines
think together without losing what makes either whole.

## License & Attribution

Apache-2.0. © 2026 MARLINK TRADING SRL (YounndAI). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

"YON" and "YounndAI" are trademarks of MARLINK TRADING SRL — see [`TRADEMARK.md`](./TRADEMARK.md).

Created by [Alexandru Mareș](https://allemaar.com).

Website: [yon.younndai.com](https://yon.younndai.com)

<p align="center"><em>Structure before scale. Harmony above all.</em></p>

---

|               |                                                         |
| ------------- | ------------------------------------------------------- |
| **Spec**      | [YON v2.0](https://yon.younndai.com)                    |
| **Author**    | [Alexandru Mareș](https://allemaar.com)                 |
| **Company**   | [MARLINK TRADING SRL](https://younndai.com) · YounndAI™ |
| **License**   | [Apache 2.0](./LICENSE) — © 2026 MARLINK TRADING SRL    |
| **Trademark** | [YounndAI™ Trademark Guidelines](./TRADEMARK.md)        |

_One document. Five phases. Every permission declared._
