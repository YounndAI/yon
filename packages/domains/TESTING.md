# Testing

> Test architecture for `@younndai/domains`.

## Running Tests

```bash
# All tests
npx vitest run

# Watch mode
npx vitest
```

## Test Suites

| File                  | Tests | Covers                                                                                                          |
| --------------------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| `foundation.test.ts`  | 11    | Adapter (JSON → DomainSchema), error classes, VERSION constant                                                  |
| `validate.test.ts`    | 19    | All 5 constraint checks (required, type, range, enum, pattern), record-level validation, invalid regex handling |
| `introspect.test.ts`  | 16    | Record tags, schema exploration, required/optional fields, sync variants                                        |
| `json-schema.test.ts` | 15    | Record → JSON Schema conversion, domain-level export                                                            |
| `taxonomy.test.ts`    | 38    | Set types, conformance levels, trust levels, freshness labels                                                   |
| `data-layer.test.ts`  | 25    | Bundled domains, local registry, domain resolution                                                              |

**Total: 124 tests**

## Fixtures

Tests use inline fixtures defined within each test file. The standard minimal domain fixture is defined in `foundation.test.ts` (`MINIMAL_JSON`) and `validate.test.ts` (`CONSTRAINTS` + `DOMAIN`).

## Conventions

- All tests import from `../src/*.js` (direct module imports, not from the package index)
- Tests are framework-agnostic — no DOM, no browser APIs
- Async tests (`validateRecord`) resolve domains from bundled registry
- No external network calls in standard tests (live registry tests are in `yon-parser`)
