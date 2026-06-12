[← Back to Report](../README.md)

# Runner Policy Loader

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T03:18:36.776Z

**Result:** 3/3 passed in 0ms

## What This Test Measures

Tests runner policy loader capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Policy Loader suite tested policy extraction and handling. All tests passed, ensuring reliable policy management.

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
| duration | 0.09 | ms |

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
| duration | 0.03 | ms |

---

## For Specialists

Pass rate: **100%** across **3** tests. Duration: **0ms**. Policy extraction rules verified with **3** checks. Fail-closed mechanism confirmed with **2** tests. Non-policy elements ignored as expected. Edge cases included allow, deny, and prompt rules.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._