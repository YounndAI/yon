# InvoiceFlow Authorization Rules

## Roles

The system defines three roles with hierarchical permissions:

### admin
Full system access. Can create, read, update invoices in any status. Can record payments. Can set `payment_method` on invoices. Can deploy to all environments. Can access all teams' data regardless of team membership.

### manager
Can create and update invoices (draft status only). Can send invoices. Can read invoices and payments for their own team. Cannot record payments. Cannot set `payment_method`. Cannot deploy to production.

### viewer
Read-only access. Can view invoices and payments for their own team only. Cannot create, update, send invoices, or record payments. Cannot deploy to any environment.

## Permission Matrix

| Action | admin | manager | viewer |
|--------|-------|---------|--------|
| POST /invoices | ✓ | ✓ | ✗ |
| GET /invoices | ✓ (all) | ✓ (own team) | ✓ (own team) |
| GET /invoices/:id | ✓ (all) | ✓ (own team) | ✓ (own team) |
| PUT /invoices/:id | ✓ (any status) | ✓ (draft only) | ✗ |
| POST /invoices/:id/send | ✓ | ✓ | ✗ |
| POST /payments | ✓ | ✗ | ✗ |
| GET /payments | ✓ (all) | ✓ (own team) | ✗ |
| Set payment_method | ✓ | ✗ | ✗ |

## Team Scoping

All non-admin roles are scoped to their team. A manager on the "billing" team can only see invoices created by billing team members. An admin can see all invoices regardless of team. Team membership is determined by the `team_id` field on the `users` table.
