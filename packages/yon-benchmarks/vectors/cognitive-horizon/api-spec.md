# InvoiceFlow API Specification

## Endpoints

### POST /invoices
Creates a new invoice. Requires `manager` or `admin` role. Request body must include `customer_id`, `line_items` (array), and `currency`. The `total` field is auto-calculated from line items. Returns the created invoice with status `draft`. Authentication via Bearer token required.

### GET /invoices
Lists invoices with pagination. All authenticated roles can access. Supports `?status=draft|sent|paid|overdue` filter and `?customer_id=` filter. Default page size is 25, max 100. Returns array of invoice summaries (id, customer_id, total, status, created_at).

### GET /invoices/:id
Returns full invoice detail including line items, payment history, and audit trail. Requires `viewer`, `manager`, or `admin` role. The requesting user must belong to the team that owns the invoice, unless they are `admin`.

### PUT /invoices/:id
Updates an existing invoice. Only invoices in `draft` status can be updated. Requires `manager` or `admin` role. Updatable fields: `line_items`, `currency`, `notes`, `due_date`. The `payment_method` field can only be set by `admin` role.

### POST /invoices/:id/send
Transitions invoice from `draft` to `sent`. Requires `manager` or `admin` role. Triggers email notification to customer. Cannot be reversed — sent invoices cannot return to draft.

### POST /payments
Records a payment against an invoice. Requires `admin` role. Body must include `invoice_id`, `amount`, `payment_method`, and `reference`. If `amount` equals invoice `total`, invoice status transitions to `paid`. Partial payments are tracked but do not change status.

### GET /payments
Lists payments with pagination. Requires `manager` or `admin` role. Supports `?invoice_id=` filter. Returns payment records with id, invoice_id, amount, payment_method, reference, created_at.

### GET /health
Public endpoint (no authentication). Returns service status, version, and uptime. Always returns HTTP 200 if service is running.
