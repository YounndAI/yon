# Domain Extensions

| Status   | Informative                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| Tool     | `@younndai/yon-parser` v2.0.0                                                          |
| Spec     | YON v2.0 — [Domains](https://yon.younndai.com), [Versioning](https://yon.younndai.com) |
| Requires | [Overview](overview.md)                                                                |

> Domains extend the core YON vocabulary with industry-specific record types. The parser delegates official bundled domain access to `@younndai/domains` and supports runtime registration for custom schemas.

---

## Three-Tier Domain Resolution

| Tier              | Source                                | Network       | Speed   | Use Case                                    |
| ----------------- | ------------------------------------- | ------------- | ------- | ------------------------------------------- |
| **T1 — Official** | Bundled with `@younndai/domains`      | Never         | Instant | 34 `yai.*` domains, always available        |
| **T2 — Remote**   | Fetched from registry, cached locally | On cache miss | Fast    | Published community/partner domains         |
| **T3 — Local**    | User-registered at runtime            | Never         | Instant | Custom, enterprise, or org-specific domains |

**No network is required for T1 or T3.** Official domains ship compiled with the `@younndai/domains` SDK. The parser delegates all domain resolution to `@younndai/domains`. For remote registry access, caching, and offline bundles, see the [@younndai/domains SDK documentation](https://github.com/YounndAI/yon/tree/main/packages/domains#readme).

---

## Using Official Domains

```typescript
import {
  getDomainTags,
  DOMAIN_REGISTRIES,
  listDomains,
  isOfficialDomain,
} from "@younndai/yon-parser";

// Get all tags for a domain
const tags = getDomainTags(["fintech"]);
// → Set { 'TXN', 'LEDGER', 'ACCT', 'FX', ... }

// List all bundled official domains
const official = listDomains("official");
// → ['yai.aerospace', 'yai.agriculture', ..., 'yai.yonpa']

// Check if a domain is official
isOfficialDomain("yai.health"); // true
isOfficialDomain("acme.custom"); // false
```

---

## Registering Local Domains (T3)

Register custom schemas at runtime. They get the same performance as bundled official domains.

```typescript
import {
  registerDomain,
  unregisterDomain,
  loadDomainFromJSON,
} from "@younndai/yon-parser";

// Register from a typed object
registerDomain({
  domain: "acme.shipping",
  version: "1.0",
  status: "active",
  tier: "community",
  description: "Internal shipping records",
  records: {
    SHIPMENT: {
      description: "Shipment tracking record",
      requiredFields: ["id", "origin", "destination"],
      optionalFields: ["carrier", "eta"],
      typedFields: { eta: "ts" },
      fields: {
        id: { type: "string", required: true },
        origin: { type: "string", required: true },
        destination: { type: "string", required: true },
        carrier: { type: "string", required: false },
        eta: { type: "ts", required: false },
      },
    },
  },
});

// Register from a JSON schema file (same raw schema format as @younndai/domains)
import schema from "./my-domain.json";
registerDomain(loadDomainFromJSON(schema));

// List local domains
listDomains("local"); // → ['acme.shipping']

// Remove a local domain (official domains are protected)
unregisterDomain("acme.shipping"); // true
unregisterDomain("yai.fintech"); // false — protected
```

---

## `loadDomainFromJSON(json)` → `DomainRegistry`

Bridge from the `@younndai/domains` raw JSON schema format to the parser's internal `DomainRegistry`:

```typescript
import {
  loadDomainFromJSON,
  type DomainSchemaJSON,
} from "@younndai/yon-parser";

const json: DomainSchemaJSON = {
  domain: "acme.inventory",
  version: "1.0",
  status: "active",
  tier: "community",
  description: "Inventory management",
  records: [
    {
      tag: "ITEM",
      description: "Inventory item",
      fields: [
        {
          name: "sku",
          type: "string",
          required: true,
          pattern: "^[A-Z]{3}-\\d{4}$",
        },
        { name: "quantity", type: "int", required: true, range: [0, 999999] },
        {
          name: "status",
          type: "string",
          required: false,
          enum: ["in_stock", "low", "out"],
        },
      ],
    },
  ],
};

const registry = loadDomainFromJSON(json);
registerDomain(registry);
```

---

## Domain Lifecycle

Per [versioning.md §Domain Lifecycle](https://yon.younndai.com):

| Status         | Description                                 | Parser Behavior                    |
| -------------- | ------------------------------------------- | ---------------------------------- |
| **Pending**    | Submitted, awaiting activation              | Error (strict) / Warning (lenient) |
| **Active**     | Current and fully supported                 | ✅ OK                              |
| **Deprecated** | Valid but superseded; migration recommended | ✅ OK (WARN)                       |
| **Archived**   | Preserved for historical provenance only    | ✅ OK (WARN)                       |
| **Revoked**    | Critical security vulnerability             | ⚠️ OK (SECURITY WARN)              |

The parser MUST continue to read Archived and Revoked schemas to preserve forensic access.

### State Transitions

```
    ┌─────────┐      ┌─────────┐      ┌────────────┐      ┌──────────┐
    │ PENDING │ ───▶ │ ACTIVE  │ ───▶ │ DEPRECATED │ ───▶ │ ARCHIVED │
    └─────────┘      └─────────┘      └────────────┘      └──────────┘
                           │                │                    │
                           └────────────────┴────────────────────┘
                                          │
                                    ┌───────────┐
                                    │  REVOKED  │  (Security/Legal only)
                                    └───────────┘
```

---

## Field Constraints

Domain schemas define validation rules for each field. The parser checks these during [validation](validation.md):

| Constraint   | Schema Property | Example                                 |
| ------------ | --------------- | --------------------------------------- |
| **Required** | `required`      | Field MUST be present on the record     |
| **Type**     | `type`          | `string`, `int`, `float`, `bool`, `ts`  |
| **Range**    | `range`         | `[0, 100]` — numeric bounds             |
| **Enum**     | `enum`          | `["active", "inactive", "suspended"]`   |
| **Pattern**  | `pattern`       | `"^[A-Z]\\d{2}\\.?\\d*$"` — regex match |

---

## Cross-Domain Patterns

A document can reference multiple domains. Record-level `domain=` overrides the document's `@DOC domain=`:

```plaintext
@DOC ver=2.0 | id=multi | title="Multi-domain" | domain=yai.health

@PATIENT id="p1" | name="John"                  # validated against yai.health
@TXN domain=yai.fintech | id="t1" | amount=100  # validated against yai.fintech
@VITALS id="v1" | hr=72                          # validated against yai.health
```

See [Validation — Record-Level Domain Override](validation.md#record-level-domain-override) for details.

---

## Official Domains (34)

| Domain               | ID                   | Example Records                  |
| -------------------- | -------------------- | -------------------------------- |
| Aerospace            | `yai.aerospace`      | WAYPOINT, TELEMETRY, FLIGHT_PLAN |
| Agriculture          | `yai.agriculture`    | CROP, SOIL, HARVEST              |
| Automotive           | `yai.automotive`     | VEHICLE, DIAGNOSTIC              |
| Compliance           | `yai.compliance`     | AUDIT, FINDING, CONTROL          |
| Construction         | `yai.construction`   | SITE, PERMIT, INSPECTION         |
| DevOps               | `yai.devops`         | DEPLOY, PIPELINE, INFRA          |
| Dialogue             | `yai.dialogue`       | TURN, ACK, CONTEXT               |
| E-Commerce           | `yai.ecommerce`      | PRODUCT, ORDER, CART             |
| Education            | `yai.education`      | COURSE, STUDENT, GRADE           |
| Energy               | `yai.energy`         | GENERATION, GRID, METER          |
| Environmental        | `yai.environmental`  | AIR_QUALITY, WATER, EMISSION     |
| Financial Technology | `yai.fintech`        | TXN, LEDGER, ACCT, FX            |
| Gaming               | `yai.gaming`         | PLAYER, QUEST, LEVEL             |
| Government           | `yai.government`     | CITIZEN, PERMIT, POLICY          |
| Healthcare           | `yai.health`         | PATIENT, DX, RX, VITALS          |
| Hospitality          | `yai.hospitality`    | RESERVATION, GUEST, ROOM         |
| HR                   | `yai.hr`             | EMPLOYEE, POSITION               |
| Infrastructure       | `yai.infrastructure` | SERVER, NETWORK, STORAGE         |
| Insurance            | `yai.insurance`      | POLICY, CLAIM, PREMIUM           |
| Legal                | `yai.legal`          | CLAUSE, PARTY, TERM              |
| Logistics            | `yai.logistics`      | SHIPMENT, ROUTE, FLEET           |
| LYT                  | `yai.lyt`            | MESH, FEDERATION, AUDIT          |
| Manufacturing        | `yai.manufacturing`  | PRODUCT, LINE, QUALITY           |
| Maritime             | `yai.maritime`       | VESSEL, CARGO, PORT              |
| Media                | `yai.media`          | CONTENT, CHANNEL                 |
| Pharmaceutical       | `yai.pharma`         | DRUG, TRIAL, BATCH               |
| Real Estate          | `yai.realestate`     | PROPERTY, LISTING                |
| Research             | `yai.research`       | STUDY, DATASET, FINDING          |
| SAI                  | `yai.sai`            | ITEM, THREAD, MARK, INTENTION    |
| Security             | `yai.security`       | THREAT, INCIDENT                 |
| Sessions             | `yai.sessions`       | SESSION, STATE, AUTH             |
| Telecom              | `yai.telecom`        | SUBSCRIBER, NETWORK              |
| Transportation       | `yai.transportation` | ROUTE, VEHICLE, SCHEDULE         |
| YONPA                | `yai.yonpa`          | AUTOMATOR, CLUSTER               |

---

## Related

- [Validation](validation.md) — field constraint validation in action
- [Reference](reference.md) — `DomainRegistry`, `DomainRecord`, `FieldConstraint` types
- [Overview](overview.md) — two-tier architecture diagram

---

|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Spec**    | [YON v2.0](https://yon.younndai.com)                   |
| **Author**  | [Alexandru Mareș](https://allemaar.com)                |
| **Company** | [MARLINK TRADING SRL](https://younndai.com) · YounndAI |
| **License** | [Apache 2.0](../LICENSE) — © 2026 MARLINK TRADING SRL  |
