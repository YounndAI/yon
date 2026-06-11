# API Security Policy

## Authentication

- **MUST**: Require JWT bearer token on all protected endpoints
- **MUST NOT**: Accept API keys in query strings
- **SHOULD**: Set token expiry to 15 minutes

## Rate Limiting

- **SHOULD**: Enforce 100 requests per minute per client IP
- **MAY**: Allow burst of 20 requests within 5 seconds
- **MAY**: Whitelist internal service accounts from rate limiting

## Payment Processing

- **MUST**: Require multi-factor authentication for transactions above $500
- **MUST NOT**: Store raw card numbers in any persistent storage
- **MUST**: Tokenize card data before storage using PCI-compliant provider
- **Check**: MFA rule must remain active (PCI DSS 4.0 requires MFA for high-value transactions)
- **Check**: Card storage rule must remain active (PCI DSS prohibits raw card number storage)

## Logging

- **MUST**: Mask all PII fields in request logs
- **SHOULD**: Retain security logs for 90 days minimum
