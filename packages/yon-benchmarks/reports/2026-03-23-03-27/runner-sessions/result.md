[← Back to Report](../README.md)

# Runner Sessions

> **Pillar:** cross-cutting · **Timestamp:** 2026-03-23T01:27:26.262Z

**Result:** 4/4 passed in 5ms

## What This Test Measures

Tests runner sessions capabilities within the cross-cutting pillar.

---

## For Everyone

The Runner Sessions suite tested session management. All tests passed successfully. This ensures reliable session handling across operations.

---

## Test Data

### PASS: Session Create + isActive

**Metric:** `1 bool`

SessionManager inactive before create(), active after. Config verified.

| Metric | Value | Unit |
|--------|-------|------|
| before_active | 0 | bool |
| after_active | 1 | bool |
| duration | 0.05 | ms |

### PASS: Checkpoint + Recover

**Metric:** `1 bool`

checkpoint("after-init") → recover("after-init"). 2 blocks snaphotted. Roundtrip verified.

| Metric | Value | Unit |
|--------|-------|------|
| has_label | 1 | bool |
| recovered | 1 | bool |
| blocks_count | 2 | blocks |
| duration | 0.08 | ms |

### PASS: TTL Expiry Rejects

**Metric:** `1 bool`

Session with TTL=1ms expires. isActive()=false, recover()=null. Safety verified.

| Metric | Value | Unit |
|--------|-------|------|
| is_active | 0 | bool |
| recover_null | 1 | bool |
| duration | 4.89 | ms |

### PASS: Selective Includes

**Metric:** `1 bool`

includes=["blk:config","blk:state"] → 2 blocks (blk:temp excluded). Selective checkpoint verified.

| Metric | Value | Unit |
|--------|-------|------|
| snapshot_size | 2 | blocks |
| has_config | 1 | bool |
| has_temp | 0 | bool |
| duration | 0.02 | ms |

---

## For Specialists

Pass rate: **100%** across **4** tests. Duration: **5ms**. 

Key metrics include session creation active value: **1**, and checkpoint recovery blocks count: **2**. 

The suite verified session creation, checkpoint recovery, TTL expiry, and selective includes. Edge cases like TTL expiry with null recovery were tested.

---

[← Back to Report](../README.md) · _Structure before scale. Clarity above all._