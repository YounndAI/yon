# User Registration Schema

## Required Fields

- **username**: length constraint — minimum 3, maximum 20 characters (default: 8)
- **email**: must be a valid RFC 5322 email address (default: user@example.com)
- **password_length**: minimum length for password field — valid values: 12, 14, 16, 20, 24, 32 (default: 12). Higher tiers require longer passwords.

## Optional Fields

- **display_name**: length constraint — minimum 1, maximum 50 characters (default: 20)
- **role**: must be one of: user, admin, moderator, viewer (default: user)
- **mfa_enabled**: whether multi-factor authentication is enabled by default — valid values: true, false (default: false)

## Validation Rules

- **MUST**: When registering new user → validate all required fields against schema constraints
- **MUST NOT**: When accepting registration → allow role=admin without explicit admin approval
- **MUST**: When password_length check fails → reject registration with minimum length error message
