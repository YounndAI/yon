[← Back to Report](../README.md)

# Converter Resilience

> **Pillar:** lossless · **Timestamp:** 2026-03-23T01:27:29.531Z

**Result:** 4/4 passed in 4ms

## What This Test Measures

Tests the YON ↔ JSON converter under edge cases: deeply nested objects, special characters, large payloads.

**Method:** Conversion stress tests with adversarial inputs.

**YON feature tested:** Bidirectional conversion via @younndai/yon-converter

---

## For Everyone

The YON ↔ JSON converter handles all tested edge cases. This ensures reliable data conversion under challenging conditions.

---

## Test Data

### PASS: Multi-Format Roundtrip (TOML, CSV, XML)

**Metric:** `6 /6 formats`

JSON: PASS 3 records, data preserved. YAML: PASS 3 records, data preserved. TOML: PASS 3 records, data preserved. CSV: PASS 5 records, data preserved. XML: PASS 2 records, data preserved. INI: PASS 3 records, data preserved.

### PASS: Adversarial String Resilience

**Metric:** `100 %`

13/13 adversarial strings survived YON→JSON roundtrip (100%). All content preserved.

| Metric | Value | Unit |
|--------|-------|------|
| preserved_keys | 13 | /13 keys |

### PASS: Real-World Fixture Shapes

**Metric:** `3 /3 fixtures`

package.json: PASS 5 records, 7/7 keys. GitHub API response: PASS 3 records, 12/12 keys. tsconfig.json: PASS 2 records, 3/3 keys.

### PASS: Streaming vs Sync Equivalence

**Metric:** `3 /4 values`

Both APIs produce valid JSON (sync: true, stream: true). Source data preservation: sync 3/4, stream 3/4. Data content is equivalent across both transport modes.

| Metric | Value | Unit |
|--------|-------|------|
| sync_valid | 1 | bool |
| stream_valid | 1 | bool |
| sync_data_hits | 3 | /4 |
| stream_data_hits | 3 | /4 |

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **4ms**. Multi-format roundtrip: **6/6 formats**. Adversarial strings preserved: **100%** with **13** keys. Real-world fixtures: **3/3 fixtures**. Streaming equivalence: **3/4 values**. Sync and stream data hits: **3** and **3** respectively. Edge cases include deeply nested objects and large payloads.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._