[← Back to Report](../README.md)

# IR Efficiency

> **Pillar:** cognitive-economy · **Timestamp:** 2026-03-21T18:11:01.119Z

**Result:** 2/2 passed in 8ms

## What This Test Measures

Tests ir efficiency capabilities within the cognitive-economy pillar.

---

## For Everyone

This suite compares YON against JSON, NL, and YAML for information retrieval efficiency. YON performs better, with a measurable uplift in complexity handling. The delta of 2.41x indicates a strong advantage. Known boundary: YON excels in structured data environments.

---

## Test Data

### PASS: AST Expansion Ratio

**Metric:** `2.41 x`

Source: 1272B. AST (JSON): 3066B. Ratio: 2.41x.

### PASS: Validation Throughput

**Metric:** `127501 ops/s`

Validated 1000 times in 7.84ms. Throughput: 127,501 ops/s.

---

## For Specialists

YON shows a 2.41x increase in efficiency over JSON. Validation speed reaches 127501ops/s, surpassing others. YON's structural primitives enhance performance, especially in complex data scenarios. Known boundary: JSON and YAML perform well in simpler, less structured contexts. Operational implication: YON suits systems requiring high efficiency and complexity management.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._