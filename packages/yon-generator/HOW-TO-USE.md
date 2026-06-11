# How to Use — @younndai/yon-generator

Fluent TypeScript API for constructing valid YON v2.0 documents.

## Quick Start

```typescript
import { yon } from "@younndai/yon-generator";

const doc = yon("workflow")
  .id("data-pipeline")
  .title("Process Customer Data")
  .profile("exec")
  .step({ n: 1, rid: "read", op: "std:fs.read@v1", out: ["block:raw"] })
  .step({ n: 2, rid: "parse", op: "std:data.parse@v1", in: ["block:raw"] })
  .toString();
```

## Header Methods

```typescript
yon(kind) // Factory — kind is required: 'workflow', 'rule', 'spec', etc.
  .id(value) // @DOC id=
  .title(value) // @DOC title=
  .profile(value) // @DOC profile= (exec, decl, core, cognitive, agent)
  .fmt(value) // @DOC fmt= (canon, min, ultra)
  .mode(value) // @DOC mode= (struct, text, chat, hybrid)
  .domain(value) // @DOC domain= — enables domain tag validation
  .with(features) // @DOC with=[…] — enable features
  .without(features) // @DOC without=[…] — disable features
  .governance(opts) // @DOC lifecycle fields (owner, status, retention, etc.)
  .scenario(name); // Apply preset — resolves mode, profile, format, domain
```

## Core Records

```typescript
.step(opts)            // @STEP — workflow step
.rule(opts)            // @RULE — policy rule
.note(text)            // @NOTE — annotation
.check(opts)           // @CHECK — assertion
.section(name)         // @SEC — section delimiter
.begin(type, content)  // @BEGIN/@END — content block
.map(opts)             // @MAP — key-value mapping
.meta(kv)              // @META — metadata
.cfg(opts)             // @CFG — configuration
.ref(opts)             // @REF — external reference
.def(alias, value)     // @DEF — alias
.stamp(opts)           // @STAMP — provenance
.input(opts)           // @INPUT — workflow input
.output(opts)          // @OUTPUT — workflow output
.catch(opts)           // @CATCH — error handler
.retry(opts)           // @RETRY — retry policy
.error(opts)           // @ERROR — error record
.domainRecord(tag, f)  // Domain-specific record (e.g., @TXN, @POSITION)
.raw(line)             // Raw passthrough — inject any line verbatim
.blank()               // Blank line
.comment(text)         // # comment line
```

## L3 Cognition

```typescript
.thought(opts)         // @THOUGHT — reasoning unit
.hypothesis(opts)      // @HYPOTHESIS — testable claim
.observation(opts)     // @OBSERVATION — structured note
.reflection(opts)      // @REFLECTION — reconsideration
.decision(opts)        // @DECISION — committed choice
.prune(opts)           // @PRUNE — abandon branch
.introspect(opts)      // @INTROSPECT — self-query
.essence(opts)         // @ESSENCE — personality trait
.percept(opts)         // @PERCEPT — sensory input
.focus(opts)           // @FOCUS — attention direction
.goal(opts)            // @GOAL — objective
.pulse(opts)           // @PULSE — raw input signal
.imprint(opts)         // @IMPRINT — memory write gate
.memory(opts)          // @MEMORY — long-term memory
.learn(opts)           // @LEARN — belief update
.shard(opts)           // @SHARD — compressed memory
.mark(opts)            // @MARK — memory bookmark
.affect(opts)          // @AFFECT — affective state
```

## L4 Agent

```typescript
.agent(opts)           // @AGENT — agent declaration
.caps(opts)            // @CAPS — capability broadcast
.signal(opts)          // @SIGNAL — inter-agent notification
.throttle(opts)        // @THROTTLE — backpressure
.subscribe(opts)       // @SUBSCRIBE — stream subscription
.route(opts)           // @ROUTE — routing strategy
.merge(opts)           // @MERGE — combine streams
.stream(opts)          // @STREAM — named data stream
.timeline(opts)        // @TIMELINE — temporal context
.event(opts)           // @EVENT — discrete occurrence
.workspace(opts)       // @WORKSPACE — shared context
.edit(opts)            // @EDIT — workspace change
.call(opts)            // @CALL — sub-workflow invocation
.tenet(opts)           // @TENET — safety constraint
.escalate(opts)        // @ESCALATE — human-in-the-loop
.halt(opts)            // @HALT — emergency stop
.deregister(opts)      // @DEREGISTER — agent exit
.on_(opts)             // @ON — event trigger
.emit_(opts)           // @EMIT — dynamic injection
.loop(opts)            // @LOOP — repeating execution
```

## Standalone API

For single records outside the builder:

```typescript
import { record, block, domainRecord } from "@younndai/yon-generator";

record.step({ n: 1, rid: "read", op: "std:fs.read@v1" });
// → '@STEP n:int=1 | rid=read | op=std:fs.read@v1'

block("JSON", '{"key": "value"}');
// → '@BEGIN JSON\n{"key": "value"}\n@END JSON'

domainRecord("TXN", { rid: "txn:1", type: "wire", amount: 1500.5 });
// → '@TXN rid=txn:1 | type=wire | amount:float=1500.5'
```

## Domains

```typescript
const doc = yon("workflow")
  .id("kyc-flow")
  .title("KYC Verification")
  .domain("yai.fintech")
  .profile("exec")
  .step({ n: 1, rid: "verify", op: "domain:kyc.verify@v1" })
  .toString();
```

Domain validation happens downstream via the parser. The generator emits syntactically valid tags; the parser validates against domain schemas.

## Governance

```typescript
const doc = yon("spec")
  .id("data-policy")
  .title("Data Retention Policy")
  .governance({
    owner: "compliance-team",
    status: "active",
    retention: "7y",
    classification: "internal",
  })
  .rule({ lvl: "MUST", when: "data older than 7y", then: "purge" })
  .toString();
```

## Validation

```typescript
const result = yon("workflow")
  .id("test")
  .title("Test")
  .step({ n: 1, rid: "s", op: "std:noop@v1" })
  .validate();

if (!result.valid) {
  console.error(result.errors);
}
```

## Output

| Method          | Returns                    |
| --------------- | -------------------------- |
| `.toString()`   | YON text string            |
| `.toDocument()` | Parsed AST (`YonDocument`) |
| `.validate()`   | `{ valid, errors }`        |

---

_One builder. Every record. Always valid._
