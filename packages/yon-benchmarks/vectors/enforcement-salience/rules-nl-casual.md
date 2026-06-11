# Code Safety Guidelines

## Input Handling

Try to avoid using eval(), new Function(), or the Function() constructor when dealing with user input. These functions can be risky since they execute code dynamically.

When parsing JSON from external sources, it's a good idea to wrap the parsing in a try/catch block and handle errors gracefully.

## Database

Try to avoid building SQL queries by concatenating user input directly into the query string. This can open up injection vulnerabilities.

When working with databases, consider using parameterized queries or a query builder to keep your queries safe.

## Auth & Secrets

Try to avoid including sensitive information like API keys, tokens, passwords, or personal data in your log output.

When logging operations that involve sensitive data, replace sensitive values with placeholders before writing to the log.

## Error Handling

Try to avoid using empty catch blocks. It's better to at least log the error so issues don't go unnoticed.

When returning errors to API clients, keep error messages generic. Avoid exposing stack traces, internal paths, or system details.
