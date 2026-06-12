[← Back to Report](../README.md)

# Line-Tool Interoperability

> **Pillar:** streaming · **Timestamp:** 2026-03-23T01:27:31.663Z

**Result:** 4/4 passed in 2ms

## What This Test Measures

Tests line-tool interoperability capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON with JSON, NL, and YAML for line-tool interoperability. YON performs better, filtering 25 lines independently. JSON shows 0 valid records, indicating a strong advantage for YON. Known boundaries include JSON's fragment handling, affecting its performance.

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

YON filters 25 lines, achieving 25 lines filtered, 100% parse independently. JSON processes 0 valid records, showing a YON: 25 valid records, JSON: 0 (fragments). YON's structural primitives enhance streaming, with 10/10 lines accessible. JSON's known boundary is fragment handling, limiting its domain. This implies YON's suitability for systems requiring efficient line-tool interoperability.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._