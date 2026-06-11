# API Rate Limit Configuration

## Global Defaults

**Config (Defaults):** max_requests=1000, window_ms=60000, burst_allowed=true, cooldown_factor=1.5

> All rate limits use token-bucket algorithm with sliding window.

### Premium Tier

**Config (PremiumLimits):** max_requests=30000, window_ms=60000, burst_allowed=true, priority=1

- **MUST** when premium tier client: apply PremiumLimits — 30x default throughput

### Free Tier

**Config (FreeLimits):** max_requests=100, window_ms=60000, burst_allowed=false, cooldown_factor=2.5

- **MUST** when free tier client: apply FreeLimits with burst disabled

> ops-team (2026-01-10T14:30:00Z): Free tier burst disabled after abuse incident FR-2024-0831.
