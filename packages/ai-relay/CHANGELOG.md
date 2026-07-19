# Changelog — @younndai/ai-relay

All notable changes to this package will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.1.0] — 2026-07-19

### Added

- **Caller-driven generation cancellation.** `generate`, `generateWithLogprobs`,
  `generateObject`, and `stream` accept an optional `abortSignal`. A caller
  cancellation reaches the active provider call, interrupts retry backoff, and
  never starts a later attempt.
- **Detectable timeouts.** Promise APIs now expose `GenerationTimeoutError`
  with `code`, `attempt`, `timeoutMs`, and `providerSettled` fields. Streaming
  error chunks carry an optional `errorKind` discriminator.

### Changed

- Promise APIs preserve the caller's abort reason by identity. Timeout retries
  occur only after the prior provider attempt has settled, preventing
  overlapping billable calls.
- Streaming now bounds iterator advancement, terminal metadata, and best-effort
  consumer close against one absolute attempt deadline.

## [3.0.1] — 2026-06-13

### Changed

- **Category-first positioning.** The README hero now carries the YON positioning refrain ("Data, intent, provenance, and thought — in one stream.").

## [3.0.0] — 2026-06-06

Initial public release. Provider-agnostic LLM gateway: `createRelay(config)`
config-scoped clients with bring-your-own-key per client, per-client cost
attribution, strict model routing, and a local-model seam via
`@ai-sdk/openai-compatible` (optional peer dependency).
