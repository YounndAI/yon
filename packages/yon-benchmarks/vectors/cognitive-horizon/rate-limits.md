# InvoiceFlow Rate Limiting

## Per-Endpoint Limits

Rate limits are enforced per API key (tied to user). Limits are measured in requests per minute (rpm).

| Endpoint | Default rpm | Burst (10s window) | Notes |
|----------|-------------|---------------------|-------|
| POST /invoices | 30 | 10 | Write operation — stricter |
| GET /invoices | 120 | 40 | Read-heavy — generous |
| GET /invoices/:id | 120 | 40 | |
| PUT /invoices/:id | 30 | 10 | Write operation |
| POST /invoices/:id/send | 10 | 3 | Triggers email — most restricted |
| POST /payments | 20 | 5 | Financial operation |
| GET /payments | 120 | 40 | Read-heavy |
| GET /health | Unlimited | Unlimited | Monitoring endpoint |

## Role-Based Exemptions

- `admin` role users get 3× the default rate limit on all endpoints.
- `viewer` role users get 0.5× the default rate limit on write endpoints (which they can't access anyway, but this prevents abuse of auth-rejected requests).
- Service-to-service tokens (identified by `X-Service-Token` header) are exempt from rate limiting entirely.

## Enforcement

When a rate limit is exceeded, the server returns HTTP 429 with error code `RATE_001` and a `Retry-After` header indicating the number of seconds to wait. The client should not retry before the `Retry-After` period expires.

Rate limit counters reset on a rolling window basis (not fixed calendar windows).
