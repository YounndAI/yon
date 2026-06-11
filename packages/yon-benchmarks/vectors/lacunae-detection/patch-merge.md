# API Timeout Policy

## Timeout Configuration

- **MUST**: When calling external API → timeout after 30 seconds

## Change History

1. **January 15, 2026**: Changed timeout to 45 seconds. Increased from 30s to 45s — p99 latency on credit-check API exceeded 30s threshold.
2. **February 1, 2026**: Changed timeout to 60 seconds. Further increased from 45s to 60s — partner API migration added latency; monitors show p99 at 52s.
