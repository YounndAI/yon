# API Security Policy v2

## Authentication

- **MUST** (jwt-auth) when calling any API endpoint: include valid JWT in Authorization header — reject 401 on missing or expired token
- **MUST** (api-key) when calling public endpoints: include API key in X-API-Key header — rate limit by key

## Rate Limiting

- **MUST** (rate-limit) when any client exceeds 1000 requests per minute: return 429 and block for 300 seconds
