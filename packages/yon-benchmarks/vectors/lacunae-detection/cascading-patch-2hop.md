# Retry Policy

## API Retry Behavior

- **MUST**: When an API call fails → retry up to 3 times with exponential backoff

## Change Log

- **2026-01-15**: Increased retries from 3 to 5 with exponential backoff. Load-balancer instability in Q4 2025 caused transient failures that resolved within 5 attempts.
