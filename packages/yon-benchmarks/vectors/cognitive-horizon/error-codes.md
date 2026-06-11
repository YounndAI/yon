# InvoiceFlow Error Codes

All errors return a JSON body with `code`, `message`, and `retry` fields.

## Authentication & Authorization

| Code | HTTP | Message | Retry |
|------|------|---------|-------|
| AUTH_001 | 401 | Missing or invalid Bearer token | No — re-authenticate |
| AUTH_002 | 403 | Insufficient role for this action | No |
| AUTH_003 | 403 | Resource belongs to another team | No |

## Validation Errors

| Code | HTTP | Message | Retry |
|------|------|---------|-------|
| VAL_001 | 400 | Invalid field value — see `details` array | No — fix input |
| VAL_002 | 400 | Invoice total must be greater than zero | No — fix line items |
| VAL_003 | 400 | Due date must be in the future | No — fix due_date |
| VAL_004 | 409 | Invoice is not in draft status — cannot update | No |
| VAL_005 | 409 | Invoice cannot be sent without due_date | No — set due_date first |

## Payment Errors

| Code | HTTP | Message | Retry |
|------|------|---------|-------|
| PAY_001 | 400 | Payment amount exceeds remaining balance | No — adjust amount |
| PAY_002 | 409 | Invoice is not in sent or overdue status | No |
| PAY_003 | 409 | Duplicate payment reference for this invoice | No — use unique reference |

## Rate Limiting

| Code | HTTP | Message | Retry |
|------|------|---------|-------|
| RATE_001 | 429 | Rate limit exceeded — try again later | Yes — after Retry-After header |
