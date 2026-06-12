[← Back to Report](../README.md)

# Line-Tool Interoperability

> **Pillar:** streaming · **Timestamp:** 2026-03-23T13:38:26.726Z

**Result:** 4/4 passed in 2ms

## What This Test Measures

Tests line-tool interoperability capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON, JSON, NL, and YAML formats for line-tool interoperability. YON performs better, filtering 25 lines independently, while JSON processes none. This means YON handles complex streaming tasks effectively. Known boundaries include JSON's fragmentation in similar scenarios.

---

## Test Data

### PASS: Tag Filtering (grep @CFG equivalent)

**Metric:** `25 lines` _(vs JSON (impossible — no line-level filtering): 0 → 25 lines filtered, 100% parse independently)_

Filtered 25/102 lines by @CFG tag. 25/25 parse independently. 25/25 have correct tag.

| Metric | Value | Unit |
|--------|-------|------|
| parseable | 25 | lines |
| correct_tag | 25 | lines |

### PASS: Random Line Access (10 random lines)

**Metric:** `10 /10 lines`

10/10 random lines parse independently with data intact. No document context needed — each line is self-contained.

| Metric | Value | Unit |
|--------|-------|------|
| data_intact | 10 | lines |

### PASS: Split & Merge (4-way parallel)

**Metric:** `101 records` _(vs Full parse records: 101 → exact match)_

Split 100-record doc into 4 chunks. Chunk parse: 101 records. Full parse: 101 records. Perfect match — parallel processing safe.

| Metric | Value | Unit |
|--------|-------|------|
| chunks | 4 | chunks |
| lines_per_chunk | 26 | lines |

### PASS: Line Independence (YON Advantage)

**Metric:** `25 lines` _(vs JSON filtered lines parseable: 0 → YON: 25 valid records, JSON: 0 (fragments))_

Filter by "cfg": YON 25/25 lines are parseable records. JSON 0/25 filtered lines parse as valid JSON. JSON line filtering produces fragments, not valid data.

---

## For Specialists

YON filters 25 lines, JSON filters 0. YON's delta: 25 lines filtered, 100% parse independently. YON's structural primitives enhance streaming, outperforming JSON's fragmented handling. YON's domain: complex streaming tasks; JSON's domain: simpler data structures. Operational implication: YON suits systems requiring robust line-tool integration.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._