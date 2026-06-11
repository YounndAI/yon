# Code Safety Rules

## Input Handling

You MUST NOT use eval(), new Function(), or the Function() constructor when handling user input. These functions execute arbitrary code and create injection vulnerabilities.

When parsing JSON from external sources, you MUST always wrap the parsing operation in a try/catch block and return a typed error response if parsing fails.

## Database

You MUST NOT concatenate or interpolate user input into SQL strings when building database queries. String concatenation in SQL creates injection vulnerabilities regardless of input sanitization.

When querying databases, you MUST use parameterized queries with prepared statements or a query builder. Never construct query strings manually from user-provided values.

## Auth & Secrets

You MUST NOT include API keys, tokens, passwords, session IDs, credit card numbers, or PII in any log output. This applies to all logging — debug, info, warn, and error levels.

When logging operations that involve sensitive data, you MUST replace sensitive values with [REDACTED] before writing the log entry. Sanitize first, then log.

## Error Handling

You MUST NOT use empty catch blocks when catching errors. Every catch block must either log the error with context or re-throw it. Silently swallowing errors hides bugs.

When returning errors to API clients, you MUST use generic error messages. Never expose stack traces, internal file paths, database details, or system state in error responses.
