# Architecture Overview

| Status | Informative                          |
| ------ | ------------------------------------ |
| Tool   | `@younndai/yon-parser` v2.0.0        |
| Spec   | [YON v2.0](https://yon.younndai.com) |

> The reference parser for parsing, validating, and formatting YON v2.0 documents. Reference implementations define correctness — other parsers should match this behavior.

---

## Processing Pipeline

```
Input (string)
  │
  ▼
┌─────────┐     ┌─────────┐     ┌───────────┐
│  Lexer  │ ──▶ │ Parser  │ ──▶ │ Validator │ ──▶ ValidationResult
│ tokens  │     │   AST   │     │  errors   │
└─────────┘     └─────────┘     └───────────┘
                    │                              ┌───────────┐
                    └─────────────────────────────▶ │ Formatter │ ──▶ string
                                                   └───────────┘
```

| Stage         | Module         | Role                                                                |
| ------------- | -------------- | ------------------------------------------------------------------- |
| **Lexer**     | `lexer.ts`     | Tokenize input into TAG, KEY, EQUALS, PIPE, STRING, BARE, etc.      |
| **Parser**    | `parser.ts`    | Build AST: `YonDocument` with records, blocks, and nodes            |
| **Validator** | `validator.ts` | Validate AST against profile, domain, and field constraints         |
| **Formatter** | `formatter.ts` | Emit deterministic output in canon, min, or ultra mode              |
| **Streaming** | `streaming.ts` | Line-by-line event-driven parsing for transport and incremental use |

---

## Spec Mapping

Each module implements specific chapters of the [YON v2.0 specification](https://yon.younndai.com):

| Module         | Spec Chapter                                            |
| -------------- | ------------------------------------------------------- |
| `lexer.ts`     | §2 Core Language — tokenization                         |
| `parser.ts`    | §2 Core Language — records, blocks, fields, types       |
| `validator.ts` | §4 Modes — profiles, features, tag validation           |
| `formatter.ts` | §4.3 Formats — canon, min, ultra output modes           |
| `streaming.ts` | §10 Transport — line-oriented, incremental parsing      |
| `domains.ts`   | §Domains — schema registry, field constraints           |
| `integrity.ts` | §6.2 Blocks — SHA-256 verification (helper for runners) |
| `scenarios.ts` | §4 Modes — scenario presets (persona, tone, tier)       |

---

## Responsibility Boundaries

The parser has clear boundaries with the YON runner:

| Concern                    | Parser                                  | Runner                     |
| -------------------------- | --------------------------------------- | -------------------------- |
| Syntax parsing             | ✅ Full                                 | —                          |
| Profile/feature validation | ✅ Full                                 | —                          |
| Domain field constraints   | ✅ range, enum, pattern, type           | —                          |
| Domain lifecycle warnings  | ✅ WARN for deprecated/archived/revoked | ❌ REJECT archived/revoked |
| SHA-256 integrity          | ⚙️ Helper provided                      | ✅ MUST verify and reject  |
| Reference resolution       | ✅ Optional (`validateReferences`)      | ✅ Full resolution         |
| Workflow execution         | —                                       | ✅ Full                    |
| Op dispatch                | —                                       | ✅ Full                    |
| Dependency cycle detection | —                                       | ✅ Full                    |

---

## Two-Tier Domain Resolution

```
┌───────────────────────────────────────────────┐
│              DOMAIN_REGISTRIES                │
│                                               │
│  ┌─────────────────────┐  ┌────────────────┐  │
│  │  T1 — Official (34) │  │  T3 — Local    │  │
│  │  Compile-time        │  │  Runtime        │  │
│  │  Zero network        │  │  registerDomain │  │
│  └─────────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────┘
```

Both tiers have identical performance — no network is ever required. See [Domains](domains.md) for full details.

---

## Related Documentation

- [Parsing](parsing.md) — `parse()`, Lexer, AST shape
- [Validation](validation.md) — `validate()`, granular API, field constraints
- [Formatting](formatting.md) — `format()`, output modes
- [Streaming](streaming.md) — line-by-line transport parsing
- [Domains](domains.md) — domain registration, lifecycle, constraints
- [Integrity](integrity.md) — SHA-256 verification helpers
- [Reference](reference.md) — types, constants, error codes

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
