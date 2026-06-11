# Changelog — @younndai/yon-runner

All notable changes to this package will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [2.0.0] — 2026-05-28

Initial public release. Implements the YON v2.0 runner execution model — the core runner vector set; agentic and cognitive conformance layers are tracked per-vector in the Conformance section of the README.

Ships with HTTP security defaults on: scheme whitelist, SSRF private-IP blocking, and credentials-in-URL stripping — applied to both `std:http.*` ops and `url:` input-reference fetches (see README for details and the `RunnerConfig.unsafeHttp` escape hatch).
