[← Back to Report](../README.md)

# Real-World Corpus

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-21T21:07:02.623Z

**Result:** 4/4 passed in 390ms

## What This Test Measures

Tests real-world corpus capabilities within the cross-cutting pillar.

---

## For Everyone

The Real-World Corpus suite tested document parsing and conversion. All tests passed, ensuring reliable processing across formats.

---

## Test Data

### PASS: GitHub API Response

**Metric:** `1 bool`

GitHub API Response: Roundtrip OK. YON 329 tok (950B), JSON min 213 tok (685B). Structural density: -54% vs min, -6% vs pretty.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens | 329 | tokens |
| json_min_tokens | 213 | tokens |
| json_pretty_tokens | 310 | tokens |
| yon_bytes | 950 | bytes |
| json_min_bytes | 685 | bytes |
| structural_delta_vs_min | -54 | % |
| structural_delta_vs_pretty | -6 | % |

### PASS: npm Package Manifest

**Metric:** `1 bool`

npm Package Manifest: Roundtrip OK. YON 348 tok (1013B), JSON min 217 tok (686B). Structural density: -60% vs min, -8% vs pretty.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens | 348 | tokens |
| json_min_tokens | 217 | tokens |
| json_pretty_tokens | 321 | tokens |
| yon_bytes | 1013 | bytes |
| json_min_bytes | 686 | bytes |
| structural_delta_vs_min | -60 | % |
| structural_delta_vs_pretty | -8 | % |

### PASS: GitHub Actions Workflow

**Metric:** `1 bool`

GitHub Actions Workflow: Roundtrip OK. YON 548 tok (1731B), JSON min 192 tok (711B). Structural density: -185% vs min, -54% vs pretty.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens | 548 | tokens |
| json_min_tokens | 192 | tokens |
| json_pretty_tokens | 356 | tokens |
| yon_bytes | 1731 | bytes |
| json_min_bytes | 711 | bytes |
| structural_delta_vs_min | -185 | % |
| structural_delta_vs_pretty | -54 | % |

### PASS: Database Schema Definition

**Metric:** `1 bool`

Database Schema Definition: Roundtrip OK. YON 579 tok (1834B), JSON min 240 tok (949B). Structural density: -141% vs min, -27% vs pretty.

| Metric | Value | Unit |
|--------|-------|------|
| yon_tokens | 579 | tokens |
| json_min_tokens | 240 | tokens |
| json_pretty_tokens | 456 | tokens |
| yon_bytes | 1834 | bytes |
| json_min_bytes | 949 | bytes |
| structural_delta_vs_min | -141 | % |
| structural_delta_vs_pretty | -27 | % |

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **390ms**. Key metric: API response tokens **329** vs. JSON min tokens **213**. Structural delta: **-54**. Edge cases included varied document structures.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._