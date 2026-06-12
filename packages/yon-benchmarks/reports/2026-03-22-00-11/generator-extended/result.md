[← Back to Report](../README.md)

# Generator Extended Records

> **Pillar:** emitter-faithfulness · **Timestamp:** 2026-03-21T22:11:54.099Z

**Result:** 6/6 passed in 1ms

## What This Test Measures

Tests generator extended records capabilities within the emitter-faithfulness pillar.

---

## For Everyone

The generator successfully emitted extended records. All tests passed, ensuring reliable data output.

---

## Test Data

### PASS: Session Management

**Metric:** `1 bool`

@SESSION → @CHECKPOINT(includes[]) × 2 → @RECOVER. Session lifecycle validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.2 | ms |

### PASS: Change Control

**Metric:** `1 bool`

@RULE → @PATCH(set{}) → @VOID. Immutable audit trail validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.12 | ms |

### PASS: Dialogue

**Metric:** `1 bool`

@TURN × 2 (user → assistant → user) → @ACK. Multi-turn conversation validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.06 | ms |

### PASS: Privacy & GDPR

**Metric:** `1 bool`

@CONSENT(grant) → @REDACTION → @CONSENT(revoke). Privacy lifecycle validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.06 | ms |

### PASS: Cross-Domain

**Metric:** `1 bool`

@IDENTITY → @LOCATION. Cross-domain actor and spatial references validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.06 | ms |

### PASS: Domain Records

**Metric:** `1 bool`

@TXN(amount:int, currency) → @POSITION(price:float). Custom domain records with typed fields validated.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.07 | ms |

---

## For Specialists

Pass rate: **100%** across **6** tests. Duration: **1ms**. Each component, including session management and privacy, validated correctly. Engineering fact: deterministic parsing confirmed. Edge cases included cross-domain records.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._