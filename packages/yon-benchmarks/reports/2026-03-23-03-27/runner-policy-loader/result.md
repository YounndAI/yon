[← Back to Report](../README.md)

# Runner Policy Loader

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:26.269Z

**Result:** 3/3 passed in 0ms

## What This Test Measures

Tests runner policy loader capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Policy Loader suite passed all tests. This ensures policies load correctly, maintaining system integrity.

---

## Test Data

### PASS: Extract Policy Rules

**Metric:** `1 bool`

3 rules extracted: ALLOW, DENY, PROMPT. All 3 actions verified.

| Metric | Value | Unit |
|--------|-------|------|
| count | 3 | rules |
| has_allow | 1 | bool |
| has_deny | 1 | bool |
| has_prompt | 1 | bool |
| duration | 0.08 | ms |

### PASS: Fail-Closed Default

**Metric:** `1 bool`

Unknown actions "UNKNOWN_ACTION" and "allow_typo" both resolved to DENY. Fail-closed verified.

| Metric | Value | Unit |
|--------|-------|------|
| count | 2 | rules |
| all_deny | 1 | bool |
| duration | 0.02 | ms |

### PASS: Non-Policy Rules Ignored

**Metric:** `1 bool`

2 non-policy @RULE (lvl/when/then) ignored. Only @RULE with op= extracted. Filter verified.

| Metric | Value | Unit |
|--------|-------|------|
| count | 1 | rules |
| only_policy | 1 | bool |
| duration | 0.02 | ms |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **0ms**. Policy extraction rules verified: **3** with allow, deny, prompt. Fail-closed mechanism confirmed: **2** tests. Non-policy elements ignored: **1**. Edge cases include all-deny and only-policy scenarios.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._