<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-generator/assets/yon-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-generator/assets/yon-icon-onlight.png" />
    <img alt="YON" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/yon-generator/assets/yon-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/yon-generator</strong><br />
  Fluent TypeScript builder for constructing valid YON v2.0 documents from code<br />
  <em>Part of the YON™ toolchain — data, intent, and instructions in a single stream.</em>
</p>

<p align="center">
  <a href="https://yon.younndai.com">Website</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/yon-generator)](https://www.npmjs.com/package/@younndai/yon-generator)
[![license](https://img.shields.io/npm/l/@younndai/yon-generator)](./LICENSE)

## What is this?

`@younndai/yon-generator` is a fluent TypeScript API for constructing valid YON v2.0 documents programmatically. One method call per record produces syntactically valid output every time — no hand-writing YON, no formatting mistakes. It covers the full record set across all four YON layers and emits in canon, min, and ultra formats.

## Install

```bash
npm install @younndai/yon-generator
```

## Quick Start

```ts
import { yon } from "@younndai/yon-generator";

const document = yon("workflow")
  .id("data-pipeline")
  .title("Process Customer Data")
  .profile("exec")
  .step({ n: 1, rid: "read", op: "std:fs.read@v1", out: ["block:raw"] })
  .step({ n: 2, rid: "parse", op: "std:data.parse@v1", in: ["block:raw"] })
  .toString();
```

## Key Features

- **Fluent chainable builder** — `yon(kind)` returns a `YonBuilder`; every method returns `this`.
- **Full record coverage** — header fields, core records, change control, sessions, privacy, and L3 cognition / L4 agent tags.
- **Always valid output** — emits syntactically valid YON; `.validate()` checks against the parser before writing.
- **Multiple outputs** — `.toString()` for YON text, `.toDocument()` for a parsed AST, `.validate()` for `{ valid, errors }`.
- **Scenarios and presets** — `.scenario(name)` resolves mode, profile, and format in one call.

## API

The `yon()` factory returns a chainable `YonBuilder`. Every method returns `this`.

```ts
// Factory
yon(kind: YonKind): YonBuilder

// Header
.id(value)             // @DOC id=
.title(value)          // @DOC title=
.profile(value)        // @DOC profile=
.fmt(value)            // @DOC fmt=
.mode(value)           // @DOC mode=
.domain(value)         // @DOC domain= — enables domain tag validation
.with(features)        // @DOC with=[…] — enable profile features
.without(features)     // @DOC without=[…] — disable profile features
.governance(opts)      // @DOC lifecycle fields (owner, status, retention, etc.)
.scenario(name)        // Apply preset — resolves mode, profile, format

// Core Records
.step(opts)            // @STEP        .rule(opts)       // @RULE
.note(text)            // @NOTE        .check(opts)      // @CHECK
.catch(opts)           // @CATCH       .retry(opts)      // @RETRY
.error(opts)           // @ERROR       .input(opts)      // @INPUT
.output(opts)          // @OUTPUT      .yield(opts)      // @YIELD
.stamp(opts)           // @STAMP       .meta(kv)         // @META
.cfg(opts)             // @CFG         .map(opts)        // @MAP
.begin(type, content)  // @BEGIN/@END  .ref(opts)        // @REF
.section(name)         // @SEC         .def(alias, val)  // @DEF
.intent(opts)          // @INTENT      .scope(opts)      // @SCOPE
.schema(opts)          // @SCHEMA      .domainRecord(tag, f) // Domain record

// Change Control & Sessions
.patch(opts)           // @PATCH       .void_(opts)      // @VOID
.turn(opts)            // @TURN        .ack(opts)        // @ACK
.session(opts)         // @SESSION     .checkpoint(opts) // @CHECKPOINT
.recover(opts)         // @RECOVER

// Privacy & Cross-Domain
.redaction(opts)       // @REDACTION   .consent(opts)    // @CONSENT
.identity(opts)        // @IDENTITY    .location(opts)   // @LOCATION

// L3 Cognition
.thought(opts)         // @THOUGHT     .hypothesis(opts) // @HYPOTHESIS
.observation(opts)     // @OBSERVATION .reflection(opts) // @REFLECTION
.decision(opts)        // @DECISION    .prune(opts)      // @PRUNE
.introspect(opts)      // @INTROSPECT  .essence(opts)    // @ESSENCE
.percept(opts)         // @PERCEPT     .focus(opts)      // @FOCUS
.goal(opts)            // @GOAL        .pulse(opts)      // @PULSE
.imprint(opts)         // @IMPRINT     .memory(opts)     // @MEMORY
.learn(opts)           // @LEARN       .shard(opts)      // @SHARD
.mark(opts)            // @MARK        .affect(opts)     // @AFFECT

// L4 Agent
.agent(opts)           // @AGENT       .caps(opts)       // @CAPS
.signal(opts)          // @SIGNAL      .throttle(opts)   // @THROTTLE
.subscribe(opts)       // @SUBSCRIBE   .route(opts)      // @ROUTE
.merge(opts)           // @MERGE       .stream(opts)     // @STREAM
.timeline(opts)        // @TIMELINE    .event(opts)      // @EVENT
.workspace(opts)       // @WORKSPACE   .edit(opts)       // @EDIT
.call(opts)            // @CALL        .tenet(opts)      // @TENET
.escalate(opts)        // @ESCALATE    .halt(opts)       // @HALT
.deregister(opts)      // @DEREGISTER  .on_(opts)        // @ON
.emit_(opts)           // @EMIT        .loop(opts)       // @LOOP

// Standalone API
record.step(opts)              // Single record line
block(type, content, opts?)    // @BEGIN/@END block
domainRecord(tag, fields)      // Domain-specific record

// Helpers
.comment(text)         // # comment
.raw(line)             // passthrough
.blank()               // empty line

// Output
.toString()            // → YON text
.toDocument()          // → YonDocument (parsed AST)
.validate()            // → { valid, errors }
```

### Domain Support

`.domain(name)` sets the `@DOC domain=` header. Domain-specific records are emitted via `.domainRecord(tag, fields)`. Validation is handled by the parser — the generator emits syntactically valid tags; domain schema enforcement happens downstream.

### Document Kinds

10 standard kinds: `workflow`, `rule`, `spec`, `note`, `config`, `policy`, `prompt`, `schema`, `audit`, `doc`. Extensible via `string` for community kinds.

### Dependencies

- `@younndai/yon-parser` — parsing, validation, domain registries.

## Documentation

| Document                    | Description                             |
| --------------------------- | --------------------------------------- |
| [How to Use](HOW-TO-USE.md) | Comprehensive usage guide with examples |
| [Testing](TESTING.md)       | Test strategy and coverage              |
| [Changelog](CHANGELOG.md)   | Version history and release notes       |

## The YON Project

YON is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Testing

```bash
# Run all tests (186 tests)
npm test
```

See [TESTING.md](./TESTING.md) for test strategy and coverage.

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

_One builder. Every record. Always valid._
