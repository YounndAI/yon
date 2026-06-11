# Architecture Standards

## Global

- **MUST** when calling external APIs: use async patterns with circuit breakers
- **MUST NOT** when any service: make synchronous external HTTP calls

### Domain: Financial

- **MUST** when processing payments: validate all inputs before external calls

> Financial domain has stricter retry policies — max 2 retries, 500ms timeout.

#### Service: Payments

- **MUST** when calling payment processors: log full request/response for audit trail
- **MUST** when external API failure: queue for retry, never block checkout

##### Version: Payments-v2

> v2 migrates from batch to real-time credit checks.

- **MUST** when credit check in payments-v2: use streaming pipeline with 200ms SLA

###### Exception: Checkout Flow

- **MUST** (payments-v2-sync-exception) when credit-check during checkout in payments-v2: use synchronous call with 150ms hard timeout — async pipeline adds 800ms latency unacceptable for checkout UX

> Approved exception: sync call acceptable ONLY during checkout, with mandatory circuit breaker and fallback to cached score.
