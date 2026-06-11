# InvoiceFlow Logging Policy

## What Gets Logged

Every API request is logged with: timestamp, endpoint, HTTP method, user_id, role, response status, and latency_ms.

### Per-Endpoint Logging

| Endpoint | Log Level | Body Logged | Notes |
|----------|-----------|-------------|-------|
| POST /invoices | INFO | Request body (redacted) | Log line_items count, not content |
| GET /invoices | DEBUG | No | Only logged at DEBUG level |
| GET /invoices/:id | DEBUG | No | |
| PUT /invoices/:id | INFO | Changed fields only | Log which fields changed, not values |
| POST /invoices/:id/send | WARN | No | Elevated level — triggers external email |
| POST /payments | INFO | Request body (redacted) | Log amount and method, not reference |
| GET /payments | DEBUG | No | |
| GET /health | None | No | Not logged (too noisy) |

## PII Redaction

The following fields are classified as PII and must be redacted in all logs:
- `email` — replaced with `***@domain.com`
- `full_name` — replaced with `[REDACTED]`
- `phone` — replaced with `[REDACTED]`
- `payment.reference` — replaced with `ref-***` (last 4 chars visible)

PII redaction is enforced at the logging middleware layer before log entries are written. No PII may appear in any log output, including error stack traces.

## Retention

- INFO and WARN logs: retained for 90 days.
- DEBUG logs: retained for 7 days.
- Audit log (database table): retained indefinitely — never deleted.
