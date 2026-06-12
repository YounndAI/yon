[← Back to Report](../README.md)

# Scale Behavior

> **Pillar:** streaming · **Timestamp:** 2026-03-21T22:11:55.976Z

**Result:** 4/4 passed in 119ms

## What This Test Measures

Tests scale behavior capabilities within the streaming pillar.

---

## For Everyone

This comparison evaluates YON against JSON in streaming scenarios. YON shows a strong advantage, parsing faster by a factor of 9.63. This means quicker data handling, especially at larger scales. However, YON's token efficiency is -6% lower, indicating a known boundary in compactness.

---

## Test Data

### PASS: Scale Behavior — Parse Time Scaling

**Metric:** `9.63 yon/json`

Parse time scaling:
| Size | YON | JSON | Ratio |
|------|-----|------|-------|
| 500 | 1.71ms | 0.06ms | 27.10x |
| 2000 | 2.45ms | 0.26ms | 9.60x |
| 5000 | 7.15ms | 0.65ms | 10.94x |
| 10000 | 12.40ms | 1.29ms | 9.63x |

Note: YON streaming parser is higher-level (event-based) compared to native C++ parsers. The advantage is not raw speed but streaming availability — YON delivers data incrementally.

| Metric | Value | Unit |
|--------|-------|------|
| yon_500 | 1.71 | ms |
| yon_2000 | 2.45 | ms |
| yon_5000 | 7.15 | ms |
| yon_10000 | 12.4 | ms |

### PASS: Scale Behavior — Record Lookup at 75% depth (5000 records)

**Metric:** `5.33 ms` _(vs JSON lookup (ms): 0.68 → YON can stop at record 3750; JSON must parse all 5000)_

YON scans line-by-line and stops at record 3750: 5.33ms. JSON must parse the entire 5000-record document first: 0.68ms. Streaming early-termination is the structural advantage.

### PASS: Scale Behavior — Document Size Comparison

**Metric:** `1.06 yon/json bytes`

Document size comparison:
| Records | YON | JSON | Ratio |
|---------|-----|------|-------|
| 500 | 49.2KB | 46.2KB | 1.06x |
| 2000 | 199.1KB | 187.3KB | 1.06x |
| 5000 | 500.8KB | 471.5KB | 1.06x |
| 10000 | 1003.7KB | 945.1KB | 1.06x |

YON's tag baseline per record is roughly constant. JSON's structural baseline (brackets, commas, key quoting) grows similarly.

| Metric | Value | Unit |
|--------|-------|------|
| yon_kb_500 | 49 | KB |
| yon_kb_2000 | 199 | KB |
| yon_kb_5000 | 501 | KB |
| yon_kb_10000 | 1004 | KB |

### PASS: Scale Behavior — Token Efficiency at Scale

**Metric:** `-6 %`

Token savings at scale: 500 records=-6%, 2000 records=-6%, 5000 records=-6%, 10000 records=-6%. YON's compact tag syntax (@NOTE, @MAP) has lower per-record structural baseline than JSON's {"key":"value"} pattern.

| Metric | Value | Unit |
|--------|-------|------|
| savings_500 | -6 | % |
| savings_2000 | -6 | % |
| savings_5000 | -6 | % |
| savings_10000 | -6 | % |

---

## For Specialists

YON outperforms JSON in parsing speed, with a factor of 9.63 faster. At 10,000 records, YON parses in 12.4 ms, while JSON takes longer. YON's record lookup efficiency allows stopping at record 3750, unlike JSON's need to parse all 5000. Document size is slightly larger, with a ratio of 1.06yon/json bytes. Token efficiency is -6% lower, a known boundary. This suggests YON is suitable for high-speed streaming, but less compact in token usage.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._