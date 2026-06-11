# API Safety Rules

## API Constraints

- **MUST NOT**: When calling APIs → combine destructive and constructive operations in the same transaction

## Banned Combinations

| Pattern | Reason |
|---|---|
| DELETE + bulk-import | Destructive then mass-create risks orphaned references |
| TRUNCATE + INSERT | Data loss if INSERT fails mid-batch |
| DROP + CREATE | Schema recreation may lose constraints and indices |

> Any combination matching a BannedCombo pattern MUST be rejected at the API gateway level.
