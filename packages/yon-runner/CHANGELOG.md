# Changelog — @younndai/yon-runner

All notable changes to this package will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [2.0.2] — 2026-06-13

### Changed

- **Category-first positioning.** The README hero now carries the YON positioning refrain ("Data, intent, provenance, and thought — in one stream."). The package description anchors YON as "the stream-first data format for AI agent workflows."
- **Internal wording.** The `std:sys.shell` source comment now reads "intentionally not implemented in the reference runner" (was "excluded from the free tier") — the runner's no-shell posture is an architectural choice, not a tier gate.

## [2.0.0] — 2026-05-28

Initial public release. Implements the YON v2.0 runner execution model — the core runner vector set; agentic and cognitive conformance layers are tracked per-vector in the Conformance section of the README.

Ships with HTTP security defaults on: scheme whitelist, SSRF private-IP blocking, and credentials-in-URL stripping — applied to both `std:http.*` ops and `url:` input-reference fetches (see README for details and the `RunnerConfig.unsafeHttp` escape hatch).
