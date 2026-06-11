# Streaming Parser

| Status   | Informative                                          |
| -------- | ---------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                        |
| Spec     | YON v2.0 — [§10 Transport](https://yon.younndai.com) |
| Requires | [Overview](overview.md)                              |

> Line-by-line event-driven parsing for transport and incremental processing. Use when documents arrive as a stream rather than a complete string.

---

## `StreamingYonParser`

Event-driven parser that processes input chunk by chunk with `write()` / `end()`.

### Default Mode — O(1) Streaming

By default, records are emitted via `onEvent` and then **discarded** — no memory growth.

```typescript
import { StreamingYonParser } from "@younndai/yon-parser";

const parser = new StreamingYonParser({
  onEvent: (event) => {
    if (event.type === "record") console.log(event.record.tag);
    if (event.type === "block") console.log("Block:", event.block.id);
    if (event.type === "error") console.error(event.error.message);
  },
});

// Feed chunks from any source
stream.on("data", (chunk) => parser.write(chunk));
stream.on("end", () => parser.end());

// Access lightweight @DOC metadata at any time
console.log(parser.docHeader?.domain); // "yai.health"
```

### Accumulation Mode — Full Document

When you need the full AST (e.g., for validation or batch execution), opt in with `accumulate: true`:

```typescript
const parser = new StreamingYonParser({
  accumulate: true,
  onEvent: (event) => {
    if (event.type === "document") {
      // Full YonDocument available
      console.log("Document complete:", event.doc.id);
      const result = validate(event.doc);
    }
  },
});
```

> **When to use accumulation:** Runners, validators, formatters — anything that needs the complete AST. For pipelines, log processors, and streaming consumers, use the default O(1) mode.

### Options

```typescript
interface StreamingParserOptions {
  /** Callback for each event */
  onEvent?: (event: StreamEvent) => void;
  /** Max block content bytes (default: 10MB) */
  maxBlockBytes?: number;
  /** Retain records in memory for document event (default: false) */
  accumulate?: boolean;
}
```

### `docHeader` Getter

Lightweight `@DOC` metadata available in **both** modes — no accumulation needed:

```typescript
interface YonDocHeader {
  version: string;
  kind: YonKind;
  id: string;
  title: string;
  profile?: string;
  mode?: YonMode;
  domain?: string;
  domainVersion?: string;
  fmt?: YonFormat;
}
```

---

## Stream Events

| Event Type | Data                    | Fired When                        |
| ---------- | ----------------------- | --------------------------------- |
| `record`   | `record`, `line`        | Complete record parsed            |
| `block`    | `block`                 | `@END` — block complete           |
| `comment`  | `text`, `line`          | Comment line parsed               |
| `document` | `doc` (YonDocument)     | End of document (accumulate only) |
| `error`    | `error` (YonParseError) | Malformed line                    |

---

## `StreamingYonParser.from()` — Async Generator

```typescript
import { StreamingYonParser } from "@younndai/yon-parser";

// Default: O(1) streaming
for await (const event of StreamingYonParser.from(response.body)) {
  if (event.type === "record") console.log(event.record.tag);
}

// With accumulation (for document events)
for await (const event of StreamingYonParser.from(source, {
  accumulate: true,
})) {
  if (event.type === "document") console.log(event.doc.id);
}
```

---

## `parseLine(line)` → `StreamEvent | null`

Single-line parsing for maximum control:

```typescript
import { parseLine } from "@younndai/yon-parser";

const event = parseLine('@RULE lvl=MUST | when="always" | then="act"');
if (event?.type === "record") {
  console.log(event.record.tag); // "RULE"
}
```

---

## Combining with Granular Validation

The streaming parser works naturally with the [granular validation API](validation.md#granular-validation-api):

```typescript
import {
  StreamingYonParser,
  parse,
  createValidationContext,
  validateRecord,
  validateBlock,
} from "@younndai/yon-parser";

// Create context from the @DOC header (parse the first line)
const headerDoc = parse(firstLine + "\n");
const ctx = createValidationContext(headerDoc, { strict: true });

// Validate each record as it arrives — O(1) memory
const parser = new StreamingYonParser({
  onEvent: (event) => {
    if (event.type === "record") {
      const result = validateRecord(event.record, ctx);
      if (!result.valid) console.error(`@${event.record.tag}:`, result.errors);
    }
    if (event.type === "block") {
      const result = validateBlock(event.block, ctx);
      if (result.warnings.length > 0) console.warn(`Block:`, result.warnings);
    }
  },
});
```

---

## Node.js Stream Integration

```typescript
import { createReadStream } from "node:fs";
import { StreamingYonParser } from "@younndai/yon-parser";

const parser = new StreamingYonParser({
  onEvent: (event) => {
    if (event.type === "record") {
      /* handle */
    }
  },
});

const stream = createReadStream("document.yon", { encoding: "utf-8" });
stream.on("data", (chunk) => parser.write(chunk));
stream.on("end", () => parser.end());

// Or use the async generator:
// for await (const event of StreamingYonParser.from(stream)) { ... }
```

---

## Related

- [Parsing](parsing.md) — full document parsing
- [Validation](validation.md) — granular validation API for streaming
- [Overview](overview.md) — processing pipeline

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
