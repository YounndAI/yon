# How to Use — @younndai/yon-runner

Reference runner for YON v2.0 workflow documents.

## Install

```bash
npm install @younndai/yon-runner
```

## Basic Execution

```typescript
import { createRunner } from "@younndai/yon-runner";

const runner = createRunner({
  permissions: [
    { op: "std:fs.*", action: "ALLOW" },
    { op: "std:data.*", action: "ALLOW" },
    { op: "std:control.*", action: "ALLOW" },
  ],
  sandbox: { root: "./workspace" },
});

const yon = `
@DOC ver=2.0 | kind=workflow | id=hello | title="Hello" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="input.txt"] | out=[block:raw]
@STEP n:int=2 | rid=s2 | op=std:data.parse@v1 | args=[format="json"] | in=[block:raw] | out=[block:parsed]
`;

const result = await runner.run(yon);
// result.success → boolean
// result.stamps → provenance trail
// result.outputs → block values after execution
// result.errors → any errors encountered
```

## File Operations

```typescript
const runner = createRunner({
  permissions: [{ op: "std:fs.*", action: "ALLOW" }],
  sandbox: { root: "./workspace" },
});

const yon = `
@DOC ver=2.0 | kind=workflow | id=file-ops | title="File Operations" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="config.json"] | out=[block:config]
@STEP n:int=2 | rid=s2 | op=std:fs.write@v1 | args=[path="backup.json"] | in=[block:config]
`;

await runner.run(yon);
// Reads config.json, writes to backup.json — all within the sandbox root
```

## Control Flow

### Conditional (if)

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=branch | title="Branch" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:control.if@v1 | args=[condition=true, then="ref:s2", else="ref:s3"]
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[message="Condition was true"]
@STEP n:int=3 | rid=s3 | op=std:handler.notify@v1 | args=[message="Condition was false"]
`;
```

### Multi-Branch (match)

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=match | title="Match" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:control.match@v1 | args=[value="B", cases=["A"→"ref:s2", "B"→"ref:s3"]]
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[message="Matched A"]
@STEP n:int=3 | rid=s3 | op=std:handler.notify@v1 | args=[message="Matched B"]
`;
// A gate:no-match stamp is emitted if no cases match
```

### Iteration (foreach)

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=loop | title="Loop" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:control.foreach@v1 | args=[items=["a","b","c"], body="ref:s2"]
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[message="Processing item"]
`;
```

### Synchronisation (await)

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=sync | title="Sync" | profile=exec
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="a.txt"] | out=[block:a]
@STEP n:int=2 | rid=s2 | op=std:fs.read@v1 | args=[path="b.txt"] | out=[block:b]
@STEP n:int=3 | rid=s3 | op=std:control.await@v1 | args=[refs=["block:a","block:b"]]
@STEP n:int=4 | rid=s4 | op=std:data.json_merge@v1 | in=[block:a, block:b] | out=[block:merged]
`;
// Await verifies both blocks are resolved before merge proceeds
```

## Error Recovery

### @CHECK — Preconditions

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=check | title="Check" | profile=exec
@CHECK rid=c1 | assert="block:config" | fail=ABORT | msg="Config must be loaded first"
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="data.txt"]
`;
// fail=ABORT halts workflow on assertion failure (E106)
// fail=SKIP skips the targeted step
// fail=WARN logs a warning, continues
```

### @RETRY — Automatic Re-execution

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=retry | title="Retry" | profile=exec
@RETRY rid=r1 | target=s1 | max:int=3 | delay:int=1000 | backoff=exponential
@STEP n:int=1 | rid=s1 | op=std:http.get@v1 | args=[url="https://api.example.com/data"]
`;
// Retries s1 up to 3 times with exponential backoff (1s, 2s, 4s)
// Emits retry:exhausted stamp when all retries fail
```

### @CATCH — Fallback

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=catch | title="Catch" | profile=exec
@CATCH rid=c1 | target=s1 | fallback=s2 | on=timeout
@STEP n:int=1 | rid=s1 | op=std:http.get@v1 | args=[url="https://slow-api.example.com"]
@STEP n:int=2 | rid=s2 | op=std:handler.notify@v1 | args=[message="Used cached data instead"]
`;
// on=timeout only triggers fallback for timeout errors
// on=* catches any error type
```

## Workflow Contracts

```typescript
const yon = `
@DOC ver=2.0 | kind=workflow | id=etl | title="ETL Pipeline" | profile=exec
@INPUT rid=i1 | key=source_path | required=true
@INPUT rid=i2 | key=format | required=false | default="json"
@OUTPUT rid=o1 | key=result
@STEP n:int=1 | rid=s1 | op=std:fs.read@v1 | args=[path="ref:source_path"] | out=[block:result]
`;
// Missing required input without default → failure
// Missing optional input → no error
// Missing declared output → output:missing stamp
```

## Permissions

```typescript
const runner = createRunner({
  permissions: [
    // Wildcard matching
    { op: "std:fs.*", action: "ALLOW" }, // All fs ops
    { op: "std:*", action: "ALLOW" }, // All std ops
    { op: "*", action: "ALLOW" }, // Everything

    // Order matters — first match wins
    { op: "std:fs.delete", action: "DENY" }, // Block deletes
    { op: "std:fs.*", action: "ALLOW" }, // Allow the rest

    // Interactive approval
    { op: "std:fs.delete", action: "PROMPT" },
  ],

  // PROMPT handler
  onPrompt: async (op, args) => {
    return confirm(`Allow ${op}?`);
  },
});
```

## Governance

### Tenets

```typescript
const runner = createRunner({
  permissions: [{ op: "std:*", action: "ALLOW" }],
  sandbox: { root: "./workspace" },

  // Load governance rules from a kind=tenets document
  tenets: `
@DOC ver=2.0 | kind=tenets | id=org-policy | title="Org Policy" | profile=decl
@TENET rid=t1 | level=L1 | precedence:int=100 | content="No network access in production"
`,

  // Callback on tenet checks
  onTenetCheck: (rid, op, tenet) => {
    console.log(`Tenet ${tenet.rid}: ${tenet.content}`);
  },
});
```

### Policy

```typescript
const runner = createRunner({
  permissions: [{ op: "std:fs.*", action: "ALLOW" }],
  sandbox: { root: "./workspace" },

  // Policy document adds runtime permission rules
  policy: policyDoc, // Parsed kind=policy YonDocument
});
// @RULE records from the policy document are extracted and merged
// into the PermissionEngine before execution begins
```

## Custom Plugins

```typescript
import type { OpPlugin } from "@younndai/yon-runner";

const analyticsPlugin: OpPlugin = {
  namespace: "acme",
  version: "v1",
  ops: {
    track: async (ctx) => {
      const event = ctx.args["event"] as string;
      const data = ctx.inputs.get("block:payload");
      await analytics.track(event, data);
      return { tracked: true };
    },
  },
};

runner.registerPlugin(analyticsPlugin);
// Now usable in YON: op=acme:track@v1
```

## Output Serialization

```typescript
import { serializeResult } from "@younndai/yon-runner";

const result = await runner.run(yonText);
const outputDoc = serializeResult(result, {
  id: "report-001",
  title: "Daily ETL Report",
});

// Produces a YON kind=result document:
// @DOC ver=2.0 | id=report-001 | title="Daily ETL Report" | kind=result | profile=audit
// @STAMP ts="..." | event="run:start" | src="runner:yon-runner/2.0.0"
// @ERROR code=E107 | msg="..." | severity=fatal | source="runner:yon-runner/2.0.0"
// @BEGIN id="result"
// ...content...
// @END id="result"
```

## Abort / Cancellation

```typescript
const controller = new AbortController();

const runner = createRunner({
  permissions: [{ op: "std:*", action: "ALLOW" }],
  sandbox: { root: "./workspace" },
  signal: controller.signal,
});

// Cancel from outside
setTimeout(() => controller.abort(), 5000);

const result = await runner.run(longWorkflow);
// result.success → false if aborted
```

## Types

```typescript
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

import type {
  SessionConfig, // Session configuration
  CheckpointConfig, // Checkpoint parameters
  RecoverConfig, // Recovery source
  Checkpoint, // Checkpoint snapshot
} from "@younndai/yon-runner";
```

---

_Parse. Validate. Execute. Every YON workflow._
