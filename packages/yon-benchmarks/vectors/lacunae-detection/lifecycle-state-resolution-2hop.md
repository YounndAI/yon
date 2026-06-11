# Service Retry Policy

## Default Behavior

- **MUST**: When any service call fails, retry at most 3 times
- **MUST**: When any service call, timeout after 30 seconds

## Change History

1. **2026-01-15**: Initial policy created
2. **2026-02-01**: Increased max retries from 3 to 5 (payment gateway intermittent failures)
