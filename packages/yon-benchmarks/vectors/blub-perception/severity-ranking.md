# Data Handling Policy

## Input Validation

- **MUST** (validate-types) when receiving user input: validate types before processing — reject malformed data
- **MUST** (sanitize-html) when rendering user-provided text: sanitize HTML to prevent XSS
- **SHOULD** (trim-whitespace) when storing text fields: trim leading/trailing whitespace for consistency
- **MAY** (normalize-case) when storing email addresses: normalize to lowercase — not required by RFC but improves dedup

## Output Formatting

- **MUST NOT** (escape-json) when returning API responses: return unescaped HTML in JSON string fields
- **SHOULD** (date-format) when returning timestamps: use ISO-8601 format with UTC timezone
- **SHOULD NOT** (pretty-print) when production API responses: pretty-print JSON — adds unnecessary bytes
- **MAY** (null-omit) when optional fields are null: omit null fields from response to reduce payload size
