# Guide: Creating & Updating the Aggregate Report

_How to maintain `aggregate-reports.md` across benchmark waves._

---

## What It Is

The aggregate report consolidates data from multiple benchmark runs into a single reference document. It separates stable metrics (deterministic, identical each run) from variable metrics (performance-sensitive, LLM-dependent) and provides min/avg/max ranges for the latter.

---

## Wave Lifecycle

1. **Wave opens:** New suite structure or code changes, first run completes
2. **Runs accumulate:** Update aggregate after each run (or in batches)
3. **N=10 reached:** Wave closes. Aggregate becomes the canonical reference.
4. **`benchmark-values.md` refresh:** Once wave closes, update `docs/yon/benchmark-values.md` from the closed aggregate
5. **`yon-docs-scratchpad.md` refresh:** Update the scratchpad and execute doc refresh against canonical values
6. **Next wave:** If code or suite structure changes, start a new wave

### Wave History

| Wave | Date | Runs | Suites | Tests | Status |
|:---|:---|---:|---:|---:|:---|
| Wave 1 | March 11, 2026 | 10 | 77 | 313 | Closed |
| Wave 2 | March 19–23, 2026 | 10 | 70 | 608 | **Closed** |

---

## How to Update (During an Open Wave)

### 1. Locate New Reports

Each benchmark run produces a timestamped directory:

```
packages/yon-benchmarks/reports/{YYYY-MM-DD-HH-MM}/
```

Key files within each run:
- `report.json` — Raw data (all metrics, test results, timing)
- `scorecard.md` — Human-readable suite summary (primary source for aggregation)
- `analysis.md` — LLM-generated analysis

### 2. Extract Variable Metrics from `scorecard.md`

Open the new run's `scorecard.md` and extract **variable** metrics. These are numbers that change between runs:

**Performance metrics** (suite → metric):
| Suite # | Suite Name | What to Extract |
|---:|:---|:---|
| 3 | Runner Throughput | ops/s value |
| 4 | Comparative Throughput | ops/s value |
| 16 | Parse Ratio | × value |
| 17 | AI SDK Integration | ms value |
| 31 | Streaming Properties | TTFR ms |
| 32 | Scale Curves | ms value (10K records) |
| 33 | Concurrency | ms/doc value |
| 34 | Low-Level Hardening | MB value |
| 36 | Streaming Latency | µs value |
| 37 | Scale Behavior | × throughput ratio |
| 42 | Streaming Throughput | records/sec |
| 46 | Multi-Doc Streaming | records/sec |

**Memory metrics:**
| Suite # | Suite Name | What to Extract |
|---:|:---|:---|
| 40 | Memory Efficiency | × factor |
| 44 | Memory Stability | MB value |
| 45 | Backpressure Safety | MB delta |

**LLM-dependent metrics:**
| Suite # | Suite Name | What to Extract |
|---:|:---|:---|
| 56 | LLM Error Recovery | % value |
| 57 | Pliability | % comprehension |
| 61 | Notation as Alignment | % value |
| 62 | Lacunae Detection | wins / parity / losses |
| 70 | Value Amplifier | pp delta or efficiency |

### 3. Update the Aggregate

1. **Header:** Increment run count. Add the new run ID.
2. **Stable metrics:** Verify they remain identical. If any change → flag as regression.
3. **Per-run detail tables:** Add new row.
4. **Summary tables:** Recalculate min/avg/max.
5. **LLM tables:** Add row. Update range.
6. **Conclusions:** Revise if trends change.

### 4. Flag Outliers

If any single value is >2σ from the cluster, note it with a numbered footnote (¹). Investigate whether it's:
- GC timing (backpressure, memory efficiency)
- V8 optimization spike (throughput outliers)
- System load (scale curves, runner throughput)
- Genuine regression (requires code investigation)

### 5. Template for Per-Run Rows

```markdown
| 2026-MM-DD-HH-MM | [value] | [value] | ... |
```

For summary tables, recalculate:
- **Min:** `Math.min(existing_min, new_value)`
- **Max:** `Math.max(existing_max, new_value)`
- **Avg:** `(existing_sum + new_value) / new_count`

---

## After Wave Closes

When N=10 is reached:

1. Mark the aggregate header with "✓" and "Wave Closed"
2. Add a "Final Conclusions" section with canonical marketing values
3. Update `docs/yon/benchmark-values.md` from the canonical values
4. Execute the docs refresh plan in `docs/yon/yon-docs-scratchpad.md`

---

## Automated Alternative

A script could parse all `report.json` files and generate the aggregate. The JSON structure is stable:

```
report.json → suites[] → { name, tests[], metrics{} }
```

Suite names are consistent across runs within a wave.

---

_The aggregate is a living document until the wave closes. After that, it is archived and a new wave begins._
