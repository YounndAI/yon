# Parsing

| Status   | Informative                                             |
| -------- | ------------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                           |
| Spec     | YON v2.0 — [§2 Core Language](https://yon.younndai.com) |
| Requires | [Overview](overview.md)                                 |

> Turning YON text into a structured AST. The parser converts a string into a `YonDocument` containing records, blocks, fields, and metadata.

---

## `parse(input)` → `YonDocument`

The primary entry point. Parse a YON string into a fully resolved AST.

```typescript
import { parse } from "@younndai/yon-parser";

const doc = parse('@DOC ver=2.0 | id=test | title="Hello"\n@NOTE text="World"');
```

**Throws** `YonParseError` on fatal parse failure (unterminated blocks, missing `@DOC`, malformed syntax).

### YonDocument Shape

```typescript
doc.version; // "2.0"
doc.kind; // "skill", "spec", "note", etc.
doc.id; // Document identifier
doc.title; // Document title
doc.profile; // "core" | "decl" | "exec" | "audit" | "cognitive" | "agent" | "full"
doc.mode; // "struct" | "chat" | "text" | "hybrid"
doc.fmt; // "canon" | "min" | "ultra"
doc.domain; // "yai.health", "yai.fintech", etc.
doc.features; // string[] — explicit features
doc.with; // string[] — additional features
doc.without; // string[] — disabled features
doc.records; // YonRecord[] — all records
doc.blocks; // Map<string, YonBlock> — blocks by ID
doc.nodes; // YonNode[] — all nodes in source order
```

---

## `parseDocHeader(input)` → Partial Header

Parse only the `@DOC` line without processing the rest of the document. Useful for quick metadata extraction.

```typescript
import { parseDocHeader } from "@younndai/yon-parser";

const header = parseDocHeader('@DOC ver=2.0 | id=test | title="Quick Check"');
// { version: "2.0", id: "test", title: "Quick Check" }
```

---

## Lexer

Low-level access to the tokenizer. The lexer converts input into a flat token stream.

### `tokenize(input)` → `Token[]`

```typescript
import { tokenize } from "@younndai/yon-parser";

const tokens = tokenize('@NOTE text="Hello"');
// [
//   { type: "TAG",     value: "NOTE", line: 1, column: 1 },
//   { type: "KEY",     value: "text", line: 1, column: 7 },
//   { type: "EQUALS",  value: "=",    line: 1, column: 11 },
//   { type: "STRING",  value: "Hello", line: 1, column: 12 },
//   ...
// ]
```

### `Lexer` Class

Streaming lexer for incremental tokenization:

```typescript
import { Lexer } from "@younndai/yon-parser";

const lexer = new Lexer(yonString);
for (const token of lexer) {
  console.log(token.type, token.value);
}
```

### Token Types

| Type            | Example        | Description                         |
| --------------- | -------------- | ----------------------------------- |
| `TAG`           | `NOTE`, `RULE` | Record tag name (after `@`)         |
| `KEY`           | `text`, `lvl`  | Field key                           |
| `EQUALS`        | `=`            | Key-value separator                 |
| `PIPE`          | `\|`           | Field separator                     |
| `STRING`        | `"Hello"`      | Quoted string value                 |
| `BARE`          | `MUST`, `42`   | Unquoted value                      |
| `LIST_START`    | `[`            | List opening bracket                |
| `LIST_END`      | `]`            | List closing bracket                |
| `ARROW`         | `->`           | Map pair separator                  |
| `HASH`          | `#`            | Comment start                       |
| `NEWLINE`       | `\n`           | Line break                          |
| `COMMENT`       | `# text`       | Comment content                     |
| `BLOCK_CONTENT` | (raw text)     | Content between `@BEGIN` and `@END` |
| `EOF`           |                | End of input                        |

---

## AST Nodes

The AST uses a discriminated union for source-order traversal:

### `YonRecord`

A single `@TAG` line with its fields:

```typescript
interface YonRecord {
  tag: string; // "NOTE", "RULE", etc.
  fields: Map<string, YonValue>; // key → value
  line: number; // Source line number
}
```

### `YonBlock`

Content between `@BEGIN` and `@END`:

```typescript
interface YonBlock {
  tag: string; // "JSON", "PYTHON", etc.
  id: string; // Block identifier
  mime?: string; // MIME type
  boundary?: string; // Boundary marker
  sha256?: string; // Content hash
  content: string; // Raw content
  startLine: number; // @BEGIN line
  endLine: number; // @END line
}
```

### `YonNode`

Discriminated union for source-order traversal:

```typescript
type YonNode =
  | { type: "record"; record: YonRecord }
  | { type: "comment"; text: string; line: number }
  | { type: "block"; block: YonBlock };
```

Use `doc.nodes` for ordered iteration. Use `doc.records` for records-only. Use `doc.blocks` for block lookup by ID.

---

## Error Handling

```typescript
import { parse, YonParseError } from "@younndai/yon-parser";

try {
  parse(input);
} catch (e) {
  if (e instanceof YonParseError) {
    e.code; // Error code (e.g., "E001")
    e.line; // Source line number
    e.column; // Source column number
    e.message; // Human-readable description
  }
}
```

Parsing errors are unrecoverable — the document structure is ambiguous. Use the [Streaming parser](streaming.md) for partial recovery.

---

## Related

- [Validation](validation.md) — validate the parsed AST
- [Formatting](formatting.md) — format the AST back to YON text
- [Streaming](streaming.md) — line-by-line incremental parsing
- [Reference](reference.md) — full type definitions

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
