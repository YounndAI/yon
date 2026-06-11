# Testing

## Strategy

Three test files cover distinct concerns:

| File                  | Purpose                                               | Count |
| --------------------- | ----------------------------------------------------- | ----- |
| `builder.test.ts`     | Builder methods, header fields, L1-L4 tags, roundtrip | 129   |
| `emitter.test.ts`     | Quoting, formatting, typed fields, edge cases         | 17    |
| `conformance.test.ts` | Profile × format matrix, kinds, domains, scenarios    | 40    |

**Total: 186 tests.**

## Running

```bash
npm test
```

## Coverage

- **Factory**: `yon()` creates builder, accepts all 10 standard kinds
- **Header fields**: id, title, profile, fmt, mode, domain, scenario, with, without, governance
- **Core tags**: @STEP, @RULE, @NOTE, @CHECK, @CATCH, @RETRY, @ERROR, @INPUT, @OUTPUT, @YIELD, @STAMP, @META, @CFG, @MAP, @BEGIN/@END, @REF, @SEC, @DEF, @INTENT, @SCOPE, @SCHEMA
- **Change Control**: @PATCH, @VOID
- **Dialogue**: @TURN, @ACK
- **Sessions**: @SESSION, @CHECKPOINT, @RECOVER
- **Privacy**: @REDACTION, @CONSENT
- **Cross-Domain**: @IDENTITY, @LOCATION (numeric and string coords)
- **L3 Cognition**: @THOUGHT, @HYPOTHESIS, @OBSERVATION, @REFLECTION, @DECISION, @PRUNE, @INTROSPECT, @ESSENCE, @PERCEPT, @FOCUS, @GOAL, @PULSE, @IMPRINT, @MEMORY, @LEARN, @SHARD, @MARK, @AFFECT
- **L4 Agent**: @AGENT, @CAPS, @SIGNAL, @THROTTLE, @SUBSCRIBE, @ROUTE, @MERGE, @STREAM, @TIMELINE, @EVENT, @WORKSPACE, @EDIT, @CALL, @TENET, @ESCALATE, @HALT, @DEREGISTER, @ON, @EMIT, @LOOP
- **Standalone API**: `record.*`, `block()`, `domainRecord()`
- **Scenarios**: All general-purpose and industry-specific scenarios resolve correctly
- **Roundtrip**: `toString() → parse() → validate()` for every profile × format combination
- **Domain**: Domain tag validation, `domainRecord()` typed field emission
- **Governance**: 16 @DOC governance fields (owner, status, retention, classification, etc.)
- **Blocks**: bytes field, mime, boundary, custom block types
- **Edge cases**: Quoting, escaping, empty values, special characters
