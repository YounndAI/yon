# Coding Standards

## Global Rules

- **MUST NOT** when writing code: use console.log — use structured logger instead

### Module: Telemetry

- **MUST** (telemetry-debug-override) when debug tracing in telemetry module: use console.log for raw output — structured logger adds circular overhead here

> Exception: telemetry module produces the logs that the structured logger consumes. Using the logger here creates infinite recursion.

### Module: API Handlers

- **MUST** when logging in API handlers: use req.log from structured logger
