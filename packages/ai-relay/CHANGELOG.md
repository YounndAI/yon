# Changelog — @younndai/ai-relay

All notable changes to this package will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.0.0] — 2026-06-06

Initial public release. Provider-agnostic LLM gateway: `createRelay(config)`
config-scoped clients with bring-your-own-key per client, per-client cost
attribution, strict model routing, and a local-model seam via
`@ai-sdk/openai-compatible` (optional peer dependency).
