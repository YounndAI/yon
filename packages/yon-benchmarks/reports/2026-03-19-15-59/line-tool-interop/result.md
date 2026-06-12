[← Back to Report](../README.md)

# Line-Tool Interoperability

> **Pillar:** streaming · **Timestamp:** 2026-03-19T13:59:14.926Z

**Result:** 4/4 passed in 1ms

## What This Test Measures

Tests line-tool interoperability capabilities within the streaming pillar.

---

## For Everyone

This suite compares YON with JSON, NL, and YAML for line-tool interoperability. YON performs better, filtering 25 lines independently. JSON processes 0 lines, showing a 25 lines filtered, 100% parse independently line advantage for YON. YON's structural primitives enhance streaming efficiency, but known boundaries include format-specific dependencies.

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

YON filters 25 lines, parsing 25 independently. JSON processes 0 lines, with YON showing a 25 lines filtered, 100% parse independently line advantage. YON achieves 10/10 lines for random access, maintaining data integrity. Split-merge operations yield 101 records, matching baseline. YON excels in streaming contexts, but JSON's known boundary limits it to fragmented processing. This implies YON's structural primitives offer a measurable uplift, enhancing system design for streaming tasks.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._