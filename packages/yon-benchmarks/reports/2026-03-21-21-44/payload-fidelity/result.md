[← Back to Report](../README.md)

# Payload Fidelity

> **Pillar:** lossless · **Timestamp:** 2026-03-21T19:44:51.450Z

**Result:** 6/6 passed in 0ms

## What This Test Measures

Tests payload fidelity capabilities within the lossless pillar.

---

## For Everyone

This suite compares YON against JSON, NL, and YAML for payload fidelity. YON performs better, eliminating 117 escapes eliminated escapes across formats. This means more accurate data representation. Known boundary: YON excels in complex structures.

---

## Test Data

### PASS: Payload Fidelity — JavaScript

**Metric:** `100 %` _(vs JSON escape sequences needed: 22 → 22 escapes avoided)_

JavaScript: 428 bytes embedded in @BEGIN/javascript...@END. Byte-for-byte match: yes. JSON would need 22 escape sequences. YON needs 0. Verbatim embedding eliminates escape-related corruption risk.

| Metric | Value | Unit |
|--------|-------|------|
| payload_bytes | 428 | bytes |
| json_escapes | 22 | sequences |
| yon_escapes | 0 | sequences |
| parse_success | 1 | bool |

### PASS: Payload Fidelity — Python

**Metric:** `100 %` _(vs JSON escape sequences needed: 26 → 26 escapes avoided)_

Python: 525 bytes embedded in @BEGIN/python...@END. Byte-for-byte match: yes. JSON would need 26 escape sequences. YON needs 0. Verbatim embedding eliminates escape-related corruption risk.

| Metric | Value | Unit |
|--------|-------|------|
| payload_bytes | 525 | bytes |
| json_escapes | 26 | sequences |
| yon_escapes | 0 | sequences |
| parse_success | 1 | bool |

### PASS: Payload Fidelity — SQL

**Metric:** `100 %` _(vs JSON escape sequences needed: 17 → 17 escapes avoided)_

SQL: 534 bytes embedded in @BEGIN/sql...@END. Byte-for-byte match: yes. JSON would need 17 escape sequences. YON needs 0. Verbatim embedding eliminates escape-related corruption risk.

| Metric | Value | Unit |
|--------|-------|------|
| payload_bytes | 534 | bytes |
| json_escapes | 17 | sequences |
| yon_escapes | 0 | sequences |
| parse_success | 1 | bool |

### PASS: Payload Fidelity — HTML

**Metric:** `100 %` _(vs JSON escape sequences needed: 32 → 32 escapes avoided)_

HTML: 526 bytes embedded in @BEGIN/html...@END. Byte-for-byte match: yes. JSON would need 32 escape sequences. YON needs 0. Verbatim embedding eliminates escape-related corruption risk.

| Metric | Value | Unit |
|--------|-------|------|
| payload_bytes | 526 | bytes |
| json_escapes | 32 | sequences |
| yon_escapes | 0 | sequences |
| parse_success | 1 | bool |

### PASS: Payload Fidelity — Unicode & Multilingual

**Metric:** `100 %` _(vs JSON escape sequences needed: 20 → 20 escapes avoided)_

Unicode & Multilingual: 368 bytes embedded in @BEGIN/text...@END. Byte-for-byte match: yes. JSON would need 20 escape sequences. YON needs 0. Verbatim embedding eliminates escape-related corruption risk.

| Metric | Value | Unit |
|--------|-------|------|
| payload_bytes | 368 | bytes |
| json_escapes | 20 | sequences |
| yon_escapes | 0 | sequences |
| parse_success | 1 | bool |

### PASS: Payload Fidelity — Escape Sequence Comparison

**Metric:** `117 sequences` _(vs YON escape sequences: 0 → 117 escapes eliminated)_

Across 5 embedded payloads, JSON requires 117 escape sequences. YON @BEGIN/@END requires 0. Each escape is a potential corruption point in multi-hop pipelines.

---

## For Specialists

YON achieves 100% fidelity, avoiding 22 escapes avoided escapes. JSON baseline is 22 escapes. YON's structural primitives reduce escape sequences, enhancing fidelity. Known boundary: YON's strength lies in handling complex data. Operational implication: YON suits systems requiring precise data fidelity.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._