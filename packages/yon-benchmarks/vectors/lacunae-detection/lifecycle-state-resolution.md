# Service Retry Policy

## Default Behavior

- **MUST**: When any service call fails, retry at most 3 times
- **SHOULD**: ~~When retry triggered, use exponential backoff starting at 100ms~~ (Voided — replaced by circuit breaker pattern)
- **MUST**: When any service call, timeout after 30 seconds

## Change History

1. **2026-01-15**: Initial policy created
2. **2026-02-01**: Increased max retries from 3 to 5 (payment gateway intermittent failures)
3. **2026-03-01**: Further increased max retries from 5 to 10 (cascading timeouts in peak hours)
4. **2026-03-15**: Voided backoff rule — switched to circuit breaker pattern

## Current Additions

- **MUST**: When service failure count exceeds 5 within 60 seconds, open circuit breaker for 30 seconds
- **SHOULD**: When circuit breaker is open, return cached response with stale-while-revalidate header
