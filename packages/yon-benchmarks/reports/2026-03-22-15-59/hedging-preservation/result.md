[← Back to Report](../README.md)

# Hedging Preservation

> **Pillar:** emitter-faithfulness · **Timestamp:** 2026-03-22T13:59:09.208Z

**Result:** 4/4 passed in 1ms

## What This Test Measures

Tests hedging preservation capabilities within the emitter-faithfulness pillar.

---

## For Everyone

The Hedging Preservation suite confirms emitter-faithfulness. All tests pass, ensuring data integrity during processing.

---

## Test Data

### PASS: Hedging Parse → Format Roundtrip

**Metric:** `100 %`

All 15 hedging markers survived parse→format across 8 categories.

### PASS: Hedging across Format Roundtrip (canon→min→canon)

**Metric:** `100 %`

All 15 markers survived canon→min→canon roundtrip.

### PASS: Hedging across YON Densities

**Metric:** `100 %`

canon: 100% | min: 100% | ultra: 100%

| Metric | Value | Unit |
|--------|-------|------|
| canon_survival | 100 | % |
| min_survival | 100 | % |
| ultra_survival | 100 | % |

### PASS: Hedging: YON Tag Semantics

**Metric:** `3 /3`

YON preserves: tag semantics (true), field context (true), hedging text (true). YON embeds semantics in the format itself — no external schema required.

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **1ms**. Key metrics: Parse roundtrip at **100%**, format fidelity at **100%**. Engineering fact: Structure comparison shows **3/3**. Edge cases include density survival at **100%**.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._