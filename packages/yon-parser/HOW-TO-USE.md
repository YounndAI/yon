# How to Use — @younndai/yon-parser

Reference parser, validator, and formatter for YON v2.0.

## Install

```bash
npm install @younndai/yon-parser
```

## Parse

```typescript
import { parse } from "@younndai/yon-parser";

const doc = parse(`
@DOC ver=2.0 | kind=workflow | id=etl-pipe | title="ETL Pipeline" | profile=exec
@STEP n:int=1 | rid=s:1 | op=std:fs.read@v1 | out=[block:raw]
@BEGIN id=raw | mime="text/csv"
name,age
Alice,30
@END
@STEP n:int=2 | rid=s:2 | op=std:data.parse@v1 | in=[block:raw]
`);

// doc.id → "etl-pipe"
// doc.records → YonRecord[]
// doc.blocks → Map<string, YonBlock>
```

## Validate

```typescript
import { parse, validate } from "@younndai/yon-parser";

const doc = parse(input);

// Strict — errors on any violation
const strict = validate(doc, { strict: true });
if (!strict.valid) console.error(strict.errors);

// Lenient — unknown tags become warnings, not errors
const lenient = validate(doc); // strict: false is default
```

### Per-Record Validation

```typescript
import { createValidationContext, validateRecord } from "@younndai/yon-parser";

const ctx = createValidationContext(doc, { strict: true });
for (const record of doc.records) {
  const result = validateRecord(record, ctx);
  if (!result.valid) console.error(record.tag, result.errors);
}
```

## Format

```typescript
import { parse, format } from "@younndai/yon-parser";

const doc = parse(input);

format(doc, { mode: "canon" }); // canonical – deterministic output
format(doc, { mode: "min" }); // minimal – no optional whitespace
format(doc, { mode: "ultra" }); // ultra-compact – everything on one line
```

### Per-Record Formatting

```typescript
import { formatRecord, formatBlock } from "@younndai/yon-parser";

formatRecord(record); // single record → string
formatBlock(block, { mode: "min" }); // single block → string
```

## Domains

### T1 — Bundled (official, zero config)

```typescript
import {
  DOMAIN_REGISTRIES,
  listDomains,
  isOfficialDomain,
} from "@younndai/yon-parser";

listDomains("official"); // → ["yai.aerospace", "yai.agriculture", ..., "yai.transportation"]
isOfficialDomain("yai.health"); // → true

const health = DOMAIN_REGISTRIES["yai.health"];
// health.records.VITALS.fields.bp.pattern → "\\d+/\\d+"
```

### T2 — Remote (domains.younndai.com)

```typescript
import {
  fetchDomain,
  fetchDomainList,
  resolveDomain,
} from "@younndai/yon-parser";

// Fetch a single domain schema (cached 24h, ETag revalidation)
const schema = await fetchDomain("yai.fintech");

// List all official domains from the registry
const all = await fetchDomainList({ tier: "official" });

// Unified resolution: T1 (bundled) → T3 (local) → T2 (remote)
const resolved = await resolveDomain("yai.maritime");
```

### T3 — Custom (runtime registration)

```typescript
import { registerDomain, unregisterDomain } from "@younndai/yon-parser";

registerDomain({
  domain: "acme.billing",
  version: "1.0",
  description: "ACME internal billing records",
  records: {
    INVOICE: {
      description: "Invoice record",
      requiredFields: ["number", "amount"],
      optionalFields: ["currency", "due_date"],
      typedFields: { amount: "float", due_date: "ts" },
      fields: {
        number: { type: "string", required: true },
        amount: { type: "float", required: true, range: [0, 999999] },
        currency: {
          type: "string",
          required: false,
          enum: ["EUR", "USD", "GBP"],
        },
        due_date: { type: "ts", required: false },
      },
    },
  },
});

// Now parseable and validatable:
const doc = parse(
  '@DOC ver=2.0 | id=inv | title="Test" | domain=acme.billing\n@INVOICE rid=i:1 | number="INV-001" | amount:float=1500.50',
);
validate(doc, { strict: true }); // → validates against acme.billing schema
```

### Missing Domain Behavior

If a domain is not found (T1, T2, or T3), the parser **continues gracefully**:

```typescript
const doc = parse(
  '@DOC ver=2.0 | id=test | title="Test" | domain=unknown.domain\n@CUSTOM_TAG field="value"',
);
const result = validate(doc);

// result.valid → true
// result.warnings → [{ message: 'Unknown domain "unknown.domain"; domain records will not be validated' }]
```

Records are preserved in the AST. Structural validation still applies. Field-level constraint validation is skipped for the unknown domain.

## Streaming

### Event-Driven (attach to any stream)

```typescript
import { StreamingYonParser } from "@younndai/yon-parser";

const parser = new StreamingYonParser({
  onEvent: (event) => {
    switch (event.type) {
      case "record":
        console.log(event.record.tag, Object.fromEntries(event.record.fields));
        break;
      case "block":
        console.log(
          "Block:",
          event.block.id,
          event.block.content.length,
          "bytes",
        );
        break;
      case "document":
        console.log("Document complete:", event.doc.id);
        // Full AST available — can validate here
        const result = validate(event.doc);
        break;
      case "error":
        console.error("Parse error:", event.error.message);
        break;
    }
  },
});

// Feed chunks from any source (WebSocket, fetch, file stream, LLM output)
stream.on("data", (chunk) => parser.write(chunk));
stream.on("end", () => parser.end());

// Lightweight @DOC metadata — available without accumulation
console.log(parser.docHeader?.domain); // "yai.health"
```

> **Memory model:** By default, records are discarded after `onEvent` fires — **O(1) memory**.
> For document-level operations (validation, formatting), use `accumulate: true`:
>
> ```typescript
> const parser = new StreamingYonParser({
>   accumulate: true,
>   onEvent: (event) => {
>     if (event.type === "document") validate(event.doc);
>   },
> });
> ```

### Async Generator (for-await)

```typescript
import { StreamingYonParser } from "@younndai/yon-parser";

// Works with any AsyncIterable<string> — fetch body, ReadableStream, etc.
for await (const event of StreamingYonParser.from(response.body)) {
  if (event.type === "record") {
    console.log(event.record.tag);
  }
}
```

### Single-Line Parsing

```typescript
import { parseLine } from "@younndai/yon-parser";

const event = parseLine("@STEP n:int=1 | op=std:fs.read@v1", 1);
// event.type → "record"
// event.record.tag → "STEP"
```

## Scenarios

```typescript
import {
  resolveScenario,
  hasScenario,
  getScenarioIds,
} from "@younndai/yon-parser";

getScenarioIds(); // → ["rag-pipeline", "clinical-triage", "legal-review", ...]

const scenario = resolveScenario("clinical-triage");
// scenario.domain → "yai.health"
// scenario.profile → "audit"
// scenario.mode → "struct"
```

## Integrity

```typescript
import {
  verifyBlockIntegrity,
  verifyDocumentIntegrity,
} from "@younndai/yon-parser";

const blockOk = verifyBlockIntegrity(block); // SHA-256 check
const docOk = verifyDocumentIntegrity(doc); // All blocks verified
```

## CLI

```bash
yon parse document.yon --json         # Parse → JSON AST
yon validate document.yon --profile exec  # Validate (strict)
yon validate document.yon --lenient   # Validate (lenient)
yon format document.yon --mode CANON  # Format (canonical)
yon format document.yon --check       # Check formatting without modifying
```

## Types

```typescript
import type {
  YonDocument, // Parsed document AST
  YonDocHeader, // Lightweight @DOC metadata (streaming)
  YonRecord, // Single record (@TAG ...)
  YonBlock, // Content block (@BEGIN/@END)
  YonField, // Field in a record
  YonTypedValue, // Value with type hint
  YonList, // List value [a, b, c]
  ValidationResult, // { valid, errors, warnings }
  DomainRegistry, // Domain schema
  FieldConstraint, // { type, required, range?, pattern?, enum? }
  StreamEvent, // Streaming parser event
} from "@younndai/yon-parser";
```

---

_Parse. Validate. Stream. Format. Every YON document._
