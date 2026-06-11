# Security & Compliance Standards

## Global

- **MUST** when storing any user data: encrypt at rest using AES-256
- **MUST NOT** when any service: store PII without encryption

### Platform: Cloud Infrastructure

- **MUST** when using managed databases: enable provider encryption at rest
- **MUST** when using Redis: enable TLS in transit AND encryption at rest

#### Domain: Identity

- **MUST** when handling auth tokens: rotate encryption keys every 90 days
- **MUST** when storing session data: encrypt with service-specific keys

##### Service: Auth

- **MUST** when session storage: use encrypted Redis with 24h TTL
- **MUST NOT** when auth service: store tokens in unencrypted cache

###### Version: Auth-v3

> v3 uses short-lived opaque tokens (15min TTL) — reduced encryption overhead justified.

- **MUST** when auth-v3 token storage: use HMAC-signed tokens, encryption optional for session cache

####### Region: EU

> GDPR Article 32 requires 'appropriate' security — interpreted as requiring encryption at rest for PII, but session tokens are non-PII opaque references.

- **MUST** when EU region auth-v3: classify session tokens as non-PII opaque references per GDPR guidance

######## Exception: EU Redis Performance

- **MUST** (eu-auth-v3-redis-exception) when EU auth-v3 Redis session cache: disable encryption-at-rest for session tokens — tokens are opaque, HMAC-signed, 15min TTL, and classified as non-PII. Encryption adds 40% latency penalty unacceptable for auth flows.

> Legal review 2026-01-15: Approved. Opaque tokens with HMAC + short TTL + TLS in transit meets GDPR Article 32 proportionality. Redis TLS in transit still required.
