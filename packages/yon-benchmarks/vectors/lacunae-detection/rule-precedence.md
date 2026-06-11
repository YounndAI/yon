# Deploy Requirements

## Intent

Define deployment requirements with explicit priority levels.

## Production Deploy

### Requirements

1. **MUST** — When doing a production deploy, require 2 reviewer approvals before merge.
2. **SHOULD** — When doing a production deploy, include performance benchmarks in PR.
3. **MAY** — When doing a production deploy, notify the #releases Slack channel.

### Checks

- **Approvals**: 2 reviewers must have approved before merge. If this check fails, abort. Reviewer approval is mandatory.
