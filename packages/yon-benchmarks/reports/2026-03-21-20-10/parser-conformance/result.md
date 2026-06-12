[← Back to Report](../README.md)

# Parser Conformance

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T18:10:51.078Z

**Result:** 3/3 passed in 1.3s

## What This Test Measures

Tests parser conformance capabilities within the cross-cutting pillar.

---

## For Everyone

The parser successfully processes all tested formats. This ensures reliable document handling across systems.

---

## Test Data

### PASS: Conformance Parse Rate

**Metric:** `100 %`

All 140 conformance vectors parsed correctly. Parser handles all edge cases.

| Metric | Value | Unit |
|--------|-------|------|
| vectors_passed | 140 | /140 |
| vectors_failed | 0 | vectors |
| duration | 1319.31 | ms |

### PASS: Conformance Validation Rate

**Metric:** `100 %`

All 134 parseable vectors pass both strict and lenient validation.

| Metric | Value | Unit |
|--------|-------|------|
| strict_passed | 134 | /134 |
| lenient_passed | 132 | /134 |
| lenient_rate | 98.5 | % |
| duration | 12.47 | ms |

### PASS: Domain Coverage

**Metric:** `34 domains`

34 domains covered: agent, agentic, block, boundary, cognitive, compose, delta, dialogue, error, financial, format, i18n, ide, identity, legal, lexical, list, mcp, medical, memory, modal, privacy, profile, provenance, runner, sec, security, session, shorthand, stream, tool, ultra, version, workflow. Vectors span financial, medical, legal, IDE, lexical, format, profile, and utility domains.

| Metric | Value | Unit |
|--------|-------|------|
| total_vectors | 140 | vectors |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **1.3s**. Parsing success: **100%** with **140** vectors passed. Validation strictness: **100%**. Edge cases include **140** vectors across **34** domains.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._