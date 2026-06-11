# Logging Standards

## Logging Rules

- **MUST**: When logging events → use structured JSON format for all log entries
- **MUST NOT**: When logging → include API keys, tokens, or passwords in log output
- **MUST**: When storing logs → retain production logs for 90 days minimum
- ~~**SHOULD**: When debug mode → enable verbose logging with request/response bodies~~ *(REMOVED)*

## Revocation Log

- **2026-02-10**: Removed verbose debug logging rule. Verbose debug logging exposed PII in request bodies — GDPR compliance team flagged this.
