# Changelog — @younndai/yon-benchmarks

All notable changes to this package will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [2.0.3] — 2026-06-13

### Fixed

- **Declare the `js-yaml` runtime dependency.** `src/local/comparative-throughput.ts` imports `js-yaml` but it was never listed in `dependencies` — it resolved in the monorepo only via hoisting. For an isolated consumer install the package (and the `@younndai/yon` umbrella, which re-exports it) crashed at import with `Cannot find package 'js-yaml'`. Now declared (`^4.1.1`).

## [2.0.2] — 2026-06-13

### Changed

- **Benchmark report integrity.** Added a methodology-and-scope note to `reports/aggregate-reports.md` (five smaller models, single environment, no frontier model, no third-party evaluation; deterministic metrics reproducible, LLM-dependent metrics directional and self-reported). Reconciled the pillar and suite counts to the canonical registry — **Six Pillars**, **58 local + 12 LLM suites** — across the report, README, and HOW-TO. No measured value was changed.
- **Wording.** Corrected the structural-injection-containment description to match what the test asserts (an `@TAG` inside a string payload stays inert). Removed the `token-efficient` marketing keyword.

## [2.0.1] — 2026-06-12

### Added

- **Published benchmark results.** The at-rest benchmark corpus (`reports/` — 10 runs, 70 suites, 6,080 test executions, 0 failures, March 2026) now ships as evidence. The npm package includes the headline `reports/aggregate-reports.md` and `reports/guide-for-aggregate-report.md`; the full per-run corpus is available in the public repository.

## [2.0.0] — 2026-05-27

Initial public release. Implements YON v2.0 specification.
