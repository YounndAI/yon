# Integrity Verification

| Status   | Informative                                        |
| -------- | -------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                      |
| Spec     | YON v2.0 — [§6.2 Blocks](https://yon.younndai.com) |
| Requires | [Parsing](parsing.md)                              |

> SHA-256 verification helpers for block integrity. Per the spec, "Runners SHOULD verify `sha256` when present and reject mismatched content." The parser provides these helpers so runners don't need to re-implement.

---

## Context

Blocks in YON may declare a `sha256` field with the expected hash of their content:

```plaintext
@BEGIN JSON | id="config" | sha256=a1b2c3...
{"key": "value"}
@END JSON
```

The parser **parses** this field but does **not** verify it during validation. Integrity verification is a runner responsibility. These helpers bridge the gap.

---

## `verifyBlockIntegrity(block)` → `Promise<boolean | null>`

Verify a single block's SHA-256 hash.

```typescript
import { parse, verifyBlockIntegrity } from "@younndai/yon-parser";

const doc = parse(input);
const block = doc.blocks.get("config");

const result = await verifyBlockIntegrity(block);
// null  → no sha256 declared (nothing to verify)
// true  → content matches declared hash
// false → MISMATCH — content was tampered with
```

---

## `verifyDocumentIntegrity(doc)` → `Promise<Map<string, boolean>>`

Verify all blocks in a document that declare a `sha256` hash.

```typescript
import { parse, verifyDocumentIntegrity } from "@younndai/yon-parser";

const doc = parse(input);
const results = await verifyDocumentIntegrity(doc);

for (const [blockId, passed] of results) {
  if (!passed) {
    console.error(`Block "${blockId}" failed integrity check!`);
  }
}
// Map is empty if no blocks declare sha256
```

---

## Implementation

Uses Web Crypto API (browser and modern Node.js) with a Node.js `crypto` module fallback:

```
Web Crypto (globalThis.crypto.subtle) → preferred
         ↓ fallback
Node.js crypto (import('node:crypto')) → Node.js only
         ↓ fallback
throw Error → no crypto available
```

Both paths produce identical SHA-256 hex digests.

---

## Integration with Validation

The `verifyIntegrity` option in `validate()` flags blocks that have `sha256` declared, but **does not compute hashes** (validation is synchronous, hashing is async). Use the integrity helpers separately:

```typescript
import { parse, validate, verifyDocumentIntegrity } from "@younndai/yon-parser";

const doc = parse(input);

// Step 1: Validate structure
const result = validate(doc, { strict: true });

// Step 2: Verify integrity (async)
const integrity = await verifyDocumentIntegrity(doc);
for (const [id, passed] of integrity) {
  if (!passed) {
    throw new Error(`Integrity check failed for block "${id}"`);
  }
}
```

---

## Related

- [Parsing](parsing.md) — parse blocks with `sha256` fields
- [Validation](validation.md) — `verifyIntegrity` option
- [Overview](overview.md) — parser vs runner responsibilities

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
