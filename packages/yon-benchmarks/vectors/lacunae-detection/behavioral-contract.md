# Data Write Policy

## Write Operations

- **MUST**: When writing to production database → run validation pipeline first — no exceptions
- **MUST NOT**: Any module → bypass validation pipeline for production writes
- **MUST**: When validation fails → reject write and log validation errors

## Verification

- **CHECK** (no-bypass): No code path bypasses validation for production writes → ABORT on failure
  - Message: "Validation bypass is a data integrity violation"

## Change Log

- **2026-01-20** (INC-2026-0012): Updated bypass check message. A service bypassed validation during a migration batch job, corrupting 847 records. Check message tightened to reference incident and data corruption risk.
