# Compliance Check Framework

## Authentication Rules

- **MUST** (session-timeout) when user session active: enforce 30-minute idle timeout — terminate session after inactivity
- **MUST** (mfa-required) when accessing admin panel: require multi-factor authentication before granting access
- **MUST** (password-policy) when setting user password: enforce minimum 12 characters with uppercase, lowercase, number, and symbol

## Compliance Checks

- **Check for session-timeout** (quarterly, automated): Verify session timeout fires after 30 minutes idle. Test with browser devtools network tab.
- **Check for mfa-required** (monthly, manual): Attempt admin panel access without MFA — must be blocked. Document in compliance log.
- **Check for password-policy** (weekly, automated): Run password strength validator against test corpus of 1000 passwords. All must pass.

## Audit Trail

> Each check references its governing rule by name. The reference chain is: check → rule. This enables automated compliance mapping.

> compliance-officer (2026-02-01T10:00:00Z): Q1 2026 review: all 3 checks passing. Next review due 2026-04-01.
