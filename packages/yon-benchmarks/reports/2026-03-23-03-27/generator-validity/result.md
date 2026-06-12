[← Back to Report](../README.md)

# Generator Validity

> **Pillar:** emitter-faithfulness · **Timestamp:** 2026-03-23T01:27:29.569Z

**Result:** 5/5 passed in 1ms

## What This Test Measures

Tests generator validity capabilities within the emitter-faithfulness pillar.

---

## For Everyone

The generator validity suite confirms all tests passed. This ensures the emitter faithfully represents data structures.

---

## Test Data

### PASS: Builder @DOC Header

**Metric:** `1 bool`

Builder emits yon('rule').id().title().profile('decl'). Parse: true. Validate: true.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| validate_ok | 1 | bool |
| duration | 0.05 | ms |

### PASS: Builder Workflow (@STEP, @CHECK, @CATCH, @RETRY)

**Metric:** `7 records`

Builder emits workflow with @STEP, @CHECK, @CATCH, @RETRY. 7 records parsed. All workflow tags present: true.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| duration | 0.13 | ms |

### PASS: Builder Declarative (@RULE, @MAP, @NOTE, @META)

**Metric:** `7 records`

Builder emits declarative doc with @RULE, @MAP, @NOTE, @META. 7 records parsed. All declarative tags present: true.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| duration | 0.09 | ms |

### PASS: Builder Content Block (@BEGIN/@END)

**Metric:** `1 bool`

Builder emits @BEGIN/@END content block with JSON payload. Parse: true. Block present: true.

| Metric | Value | Unit |
|--------|-------|------|
| parse_ok | 1 | bool |
| duration | 0.07 | ms |

### PASS: Builder .validate() Error Detection

**Metric:** `1 bool`

Builder.validate() accepts valid documents (true) and rejects invalid ones (true).

| Metric | Value | Unit |
|--------|-------|------|
| valid_accepted | 1 | bool |
| invalid_rejected | 1 | bool |
| duration | 0.07 | ms |

---

## For Specialists

Pass rate: **100%** across **5** tests. Duration: **1ms**. Key metrics include 1 bool for document headers and 7 records for workflows. All engineering gates pass, confirming deterministic behavior. Edge cases include validation of both valid and invalid data, ensuring robust error handling.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._