# CI/CD Pipeline Requirements

## Build Requirements

- **MUST** (lint-check) when pull request opened: run ESLint with zero-warning policy — fail build on any warning
- **MUST** (type-check) when pull request opened: run TypeScript strict type checker — no any types allowed
- **MUST** (unit-tests) when code changes detected: run full unit test suite with 80% coverage minimum

## Deployment Requirements

- **MUST** (canary-deploy) when deploying to production: deploy to 5% canary first, monitor for 15 minutes before full rollout
