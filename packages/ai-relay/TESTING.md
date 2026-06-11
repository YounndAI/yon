# Testing — `@younndai/ai-relay`

The suite splits into **offline (deterministic)** and **online (provider-live)** tests. Offline tests always run. Online tests auto-skip via `describe.skipIf` when no provider API keys are present — `npx vitest run` is green with zero keys configured.

## Quick Start

```bash
# Run the full suite (online tests skip without keys)
npx vitest run

# Watch mode during development
npx vitest

# Type-check
npm run typecheck
```

To exercise the online suites, copy `.env.example` to `.env.local` and fill in keys for the providers you want to hit. One key is enough — each online suite gates on its own provider.

## Test Architecture

The suite is organized into 7 files. Each file tests a different concern.

| File                            | Question                                                                | Mode    |
| ------------------------------- | ----------------------------------------------------------------------- | ------- |
| `relay.test.ts`                 | Does `createRelay()` isolate config, keys, presets, and cost per client? | offline |
| `providers.test.ts`             | Does `resolveModel()` route prefixes correctly? Do presets configure?    | offline |
| `tokenizer.test.ts`             | Are token counts and cost estimates correct?                            | offline |
| `generator-reliability.test.ts` | Do retry, backoff, and timeout behave per contract?                     | offline |
| `generate.test.ts`              | Do `generate()` / `generateObject()` work against live providers?       | online  |
| `stream.test.ts`                | Does `stream()` deliver partial/complete/error chunks against live providers? | online  |
| `embeddings.test.ts`            | Do `embed()` / `embedMany()` work against live providers?               | online  |

## Online Test Gating

Online suites are wrapped in `describe.skipIf(!hasApiKey)`. Without keys they report as skipped, not failed — CI and contributors without provider accounts get a deterministic green run.

## License & Attribution

Apache-2.0. © MARLINK TRADING SRL (YounndAI). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).
