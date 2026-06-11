# How to Use — @younndai/yon-examples

> Learn YON by reading real documents.

## Browsing Examples

### By Category

```
examples/
├── 01-getting-started/    # Hello world, basic workflow
├── 02-data-engineering/   # ETL, transforms, JSON roundtrip
├── 03-control-flow/       # Conditionals, loops, parallelism
├── 04-resilience/         # Retry, catch, circuit-breaker
├── 05-devops/             # CI pipeline, health checks, backups
├── 06-advanced/           # Plugins, sub-workflows, streams
├── 07-declarative/        # Rules, specs, notes (no execution)
├── 08-domains/            # Industry-specific workflows
├── 09-showcase/           # Cognitive + Agent profiles
├── 10-cognition/          # L3 reasoning, memory, perception
├── 11-agents/             # L4 signaling, governance, collaboration
├── 12-privacy/            # Consent, redaction, classification
└── 13-change-control/     # Patches, voids, versioned edits
```

### Via CLI

```bash
# List all examples
npx yon-examples list

# Show a specific example
npx yon-examples show fintech-kyc

# List categories
npx yon-examples categories
```

### Programmatic API

```typescript
import {
  discoverExamples,
  readExample,
  findExample,
  getCategories,
} from "@younndai/yon-examples";

const all = discoverExamples();
const kyc = findExample("fintech-kyc");
const content = readExample("fintech-kyc");
const cats = getCategories();
```

## Structure of a `.yon` File

Every example follows the same pattern:

```
@DOC ver=2.0 | id=unique-name | title="Human Title" | kind=workflow | profile=exec | fmt=canon
@NOTE text="What this workflow does."
@STEP n:int=1 | rid=name | op=std:operation@v1 | out=[ref:result]
```

- `@DOC` — Document header (required, always first)
- `@NOTE` — Human-readable explanation
- `@STEP` — Execution step
- `@RULE` — Declarative constraint
- `@CHECK` — Assertion gate
- `@MAP` — Key-value lookup table

See the [YON Standard](https://yon.younndai.com) for the full specification.
