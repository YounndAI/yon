# InvoiceFlow Deployment Configuration

## Environments

| Environment | URL | Database | Feature Flags Source |
|-------------|-----|----------|---------------------|
| dev | dev.invoiceflow.internal | invoiceflow_dev | Local config file |
| staging | staging.invoiceflow.internal | invoiceflow_staging | Remote config service |
| prod | api.invoiceflow.com | invoiceflow_prod | Remote config service |

## Deployment Rules

- **dev**: Any authenticated user can deploy. No approval required. Auto-deploys on merge to `develop` branch.
- **staging**: Requires `manager` or `admin` role. Deploys from `release/*` branches. No approval required.
- **prod**: Requires `admin` role only. Deploys from `main` branch only. Requires at least 1 approval from another admin. Rollback available for 72 hours after deploy.

## Feature Flags

| Flag | Default (dev) | Default (staging) | Default (prod) | Description |
|------|---------------|-------------------|----------------|-------------|
| `new_payment_flow` | on | on | off | Enables v2 payment processing with multi-currency support. When off, POST /payments only accepts USD. |
| `email_notifications` | off | on | on | Controls whether POST /invoices/:id/send triggers email. When off, status changes but no email sent. |
| `audit_log_enrichment` | on | on | on | Adds extra metadata to audit_log entries (client IP, user agent). |
| `strict_validation` | on | on | on | Enforces all validation rules. When off, only required fields are validated (for testing only). |

## Rollback

Production deployments can be rolled back within 72 hours to the previous version. Rollback requires `admin` role and automatically disables any feature flags that were enabled in the rolled-back version.
