# Authentication Policy

## Intent

Define role-specific authentication requirements organized by context.

## API Routes

- **MUST** — When handling API requests, validate Bearer token on every request.
- **MUST** — When token expired, return 401 Unauthorized.

## Internal Tools

- **MAY** — When handling internal requests, validate auth token.

> Note: Internal tools behind VPN may operate without token validation.
