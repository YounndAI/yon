# InvoiceFlow Database Schema

## Tables

### users
Stores all platform users.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL | PII — must be redacted in logs |
| full_name | VARCHAR(128) | NOT NULL | PII — must be redacted in logs |
| phone | VARCHAR(32) | NULLABLE | PII — must be redacted in logs |
| role | ENUM('admin','manager','viewer') | NOT NULL, DEFAULT 'viewer' | |
| team_id | UUID | FOREIGN KEY → teams.id | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| last_login | TIMESTAMP | NULLABLE | |

### invoices
Core invoice records.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| customer_id | UUID | NOT NULL | External customer reference |
| status | ENUM('draft','sent','paid','overdue') | NOT NULL, DEFAULT 'draft' | |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | ISO 4217 |
| total | DECIMAL(12,2) | NOT NULL | Calculated from line_items |
| due_date | DATE | NULLABLE | Required before sending |
| notes | TEXT | NULLABLE | |
| payment_method | VARCHAR(64) | NULLABLE | Set by admin only |
| created_by | UUID | FOREIGN KEY → users.id | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL | Auto-updated on change |

### payments
Payment records linked to invoices.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| invoice_id | UUID | FOREIGN KEY → invoices.id, NOT NULL | |
| amount | DECIMAL(12,2) | NOT NULL | Must be > 0 |
| payment_method | VARCHAR(64) | NOT NULL | e.g. 'bank_transfer', 'credit_card' |
| reference | VARCHAR(128) | NOT NULL | External payment reference |
| recorded_by | UUID | FOREIGN KEY → users.id | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

### audit_log
Immutable append-only log of all state changes. Not exposed via any REST endpoint; written internally by the system on every create, update, or status transition.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| entity_type | VARCHAR(64) | NOT NULL | 'invoice' or 'payment' |
| entity_id | UUID | NOT NULL | |
| action | VARCHAR(32) | NOT NULL | 'create', 'update', 'status_change' |
| actor_id | UUID | FOREIGN KEY → users.id | |
| changes | JSONB | NOT NULL | Before/after diff |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
