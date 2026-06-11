# InvoiceFlow Monitoring & Alerts

## SLOs (Service Level Objectives)

| Endpoint | Availability SLO | Latency P99 SLO | Error Rate SLO |
|----------|-----------------|-----------------|----------------|
| POST /invoices | 99.9% | 500ms | < 1% |
| GET /invoices | 99.95% | 200ms | < 0.5% |
| GET /invoices/:id | 99.95% | 200ms | < 0.5% |
| PUT /invoices/:id | 99.9% | 500ms | < 1% |
| POST /invoices/:id/send | 99.5% | 2000ms | < 2% (includes email delivery) |
| POST /payments | 99.99% | 300ms | < 0.1% (financial — strictest) |
| GET /payments | 99.95% | 200ms | < 0.5% |
| GET /health | 99.99% | 50ms | 0% |

## Alert Thresholds

| Metric | Warning Threshold | Critical Threshold | Alert Channel |
|--------|-------------------|---------------------|---------------|
| Error rate (any endpoint) | > 2% over 5 min | > 5% over 5 min | Slack #alerts |
| P99 latency (any endpoint) | > 2× SLO | > 5× SLO | Slack #alerts + PagerDuty |
| /payments error rate | > 0.1% over 1 min | > 0.5% over 1 min | PagerDuty immediate |
| Database connection pool | > 80% utilized | > 95% utilized | Slack #infra |
| Disk usage | > 80% | > 95% | Slack #infra + PagerDuty |

## Incident Severity Levels

| Severity | Definition | Response Time | Who Gets Paged |
|----------|-----------|---------------|----------------|
| P1 — Critical | Payment processing down or data loss risk | 15 min | On-call lead of owning team + platform lead |
| P2 — Major | Core functionality degraded (invoices or payments) | 1 hour | On-call lead of owning team |
| P3 — Minor | Non-critical feature degraded (e.g., email notifications) | 4 hours | Owning team Slack channel |
| P4 — Low | Cosmetic or non-user-facing issue | Next business day | Ticket created automatically |
