# Access Control Policy Lifecycle

## Initial Policy (June 2025)

- **MUST**: When request arrives without valid token → deny access and return 403
- **MUST**: When admin user authenticates → require two-factor authentication via TOTP
- **MUST**: When session is created → set session TTL to 24 hours
- **MUST**: When API request received → enforce 100 requests per minute per user

## Policy Update (October 2025)

Post-incident review INC-2025-0947: session hijacking via long-lived session token.

- **Updated** session-ttl: set session TTL to 4 hours — reduced from 24h after INC-2025-0947
- **Updated** admin-2fa: require two-factor authentication via hardware security key (FIDO2) — TOTP deprecated

## Policy Revocation (January 2026)

API rate limit removed after migration to token-bucket algorithm with per-endpoint limits.

- **Removed** api-rate: Replaced by per-endpoint rate limits in API gateway — blanket per-user limit no longer applicable
