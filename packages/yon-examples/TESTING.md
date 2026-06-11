# Testing — @younndai/yon-examples

> Proof before publication. Every example must parse.

## Strategy

Every `.yon` file in `examples/` is automatically discovered and validated through `@younndai/yon-parser`. This ensures no example ships broken.

## Running Tests

```bash
npx vitest run
```

## Coverage

| Suite               | Tests | What it validates                                                |
| ------------------- | ----- | ---------------------------------------------------------------- |
| `parse-all.test.ts` | 60    | Every `.yon` file parses with valid `version`, `id`, and `title` |

## Adding Examples

When adding a new `.yon` file to `examples/`, it is automatically discovered and tested. No test registration required.
