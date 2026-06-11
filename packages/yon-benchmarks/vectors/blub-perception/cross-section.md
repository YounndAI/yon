# Deployment Pipeline Policy

## Build Stage

- **MUST** (build-artifacts) when build completes: publish artifacts to artifact registry with SHA-256 checksum
- **SHOULD** (build-notify) when build fails: notify the on-call channel within 60 seconds

## Test Stage

- **MUST** (test-artifacts) when running integration tests: pull artifacts from registry using checksums from Build Stage — never rebuild
- **MUST** (test-coverage) when test stage completes: report coverage to Deploy Stage — deploy gate requires ≥80%

> Test Stage depends on Build Stage artifacts. Deploy Stage depends on Test Stage coverage report.

## Deploy Stage

- **MUST** (deploy-gate) when deploying to production: verify Test Stage coverage ≥80% AND Build Stage checksum matches artifact in registry
- **MUST** (deploy-rollback) when deploy health check fails within 5 minutes: automatic rollback to previous Build Stage artifact

> Deploy Stage has cross-dependencies: requires outputs from BOTH Build Stage and Test Stage.
