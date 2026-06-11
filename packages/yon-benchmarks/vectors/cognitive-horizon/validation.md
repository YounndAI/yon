# InvoiceFlow Validation Rules

## Invoice Validation

### Field-Level
- `customer_id`: Must be a valid UUID. Required on creation.
- `line_items`: Array with at least 1 item. Each item must have `description` (string, max 200 chars), `quantity` (integer, min 1), and `unit_price` (decimal, min 0.01).
- `currency`: Must be a valid ISO 4217 code (3 uppercase letters). Default: USD.
- `total`: Auto-calculated as sum of (quantity × unit_price) for all line items. Must be > 0. Cannot be set manually.
- `due_date`: Must be a future date. Required before invoice can be sent.
- `notes`: Optional. Max 2000 characters.
- `payment_method`: Can only be set by admin role. Allowed values: 'bank_transfer', 'credit_card', 'wire', 'check'.

### Business Rules
- An invoice cannot be updated once its status is `sent`, `paid`, or `overdue`.
- An invoice cannot be sent without a `due_date`.
- An invoice with `total` of 0 or negative cannot be created (enforced by line item validation).
- The `payment_method` field can only be modified by users with `admin` role.

## Payment Validation

### Field-Level
- `invoice_id`: Must reference an existing invoice with status `sent` or `overdue`. Payments against `draft` or `paid` invoices are rejected.
- `amount`: Must be > 0. Must not exceed the remaining balance on the invoice.
- `payment_method`: Required. Allowed values: 'bank_transfer', 'credit_card', 'wire', 'check'.
- `reference`: Required. Must be unique per invoice (no duplicate payment references).

### Business Rules
- When total payments equal the invoice total, status auto-transitions to `paid`.
- Partial payments are allowed but do not change invoice status.
- Overpayment is rejected (amount > remaining balance).
