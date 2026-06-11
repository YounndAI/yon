# Request Routing Policy

## Fallback Chain

| Priority | Handler | Description |
|---|---|---|
| Primary | handler-a | Live API call with 500ms timeout |
| Secondary | handler-b | Replica service with 1000ms timeout |
| Tertiary | handler-c | Cached response from Redis (stale OK, max 24h) |
| Last Resort | fallback | Return 503 with retry-after header |

**Rules:**
- **MUST**: When handler fails → proceed to next handler in chain — never retry failed handler
- **MUST**: When all handlers exhausted → execute last-resort fallback

> Chain is strictly ordered. Each handler gets exactly one attempt. Total chain timeout: 2000ms.
