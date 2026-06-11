# InvoiceFlow Team Structure

## Teams

### billing
Owns all invoice-related functionality. Primary responsibility for POST/PUT/GET /invoices endpoints and invoice lifecycle.

**Members:**
- Aisha Patel (admin) — Team lead, on-call primary
- Rafael Montoya (manager) — Invoice operations
- Lena Sørensen (viewer) — Reporting and audits

### payments
Owns payment processing. Primary responsibility for POST/GET /payments endpoints.

**Members:**
- Chen Wei (admin) — Team lead, on-call primary
- Priya Sharma (manager) — Payment reconciliation

### platform
Owns infrastructure, auth, monitoring, and deployment pipelines. Not responsible for business logic endpoints.

**Members:**
- Erik Lindqvist (admin) — Team lead, on-call primary
- Yuto Nakamura (manager) — CI/CD and deployments

## Ownership Map

| Component | Owning Team | Escalation Path |
|-----------|-------------|-----------------|
| /invoices endpoints | billing | Aisha Patel → Chen Wei (cross-team) |
| /payments endpoints | payments | Chen Wei → Aisha Patel (cross-team) |
| /health endpoint | platform | Erik Lindqvist |
| Authentication & auth rules | platform | Erik Lindqvist |
| Database schema | platform | Erik Lindqvist → Aisha Patel |
| Rate limiting | platform | Erik Lindqvist |
| Monitoring & alerts | platform | Erik Lindqvist |
| Deployment pipeline | platform | Erik Lindqvist → Yuto Nakamura |

## On-Call Schedule

On-call rotation is weekly, Monday to Monday. Each team has one primary on-call person (the team lead by default). Cross-team escalation follows the ownership map above. On-call receives alerts for P1 and P2 severity incidents in their owned components.
