# Access Control Checks

## Intent

Define checkpoint contracts with explicit failure behaviors.

## Access Control

### Checks

1. **Auth Check**: Assert that user.role == admin. If this fails, abort the request. Admin access required — request halted.
2. **Quota Check**: Assert that request_count < 1000. If this fails, warn but continue. Approaching rate limit — monitor usage.
3. **Format Check**: Assert that payload.type in [json, xml]. If this fails, skip processing. Unsupported format ignored — proceeding without processing.
